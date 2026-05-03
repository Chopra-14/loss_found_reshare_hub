// ================= PAGE DETECT =================
var isLostPage = window.location.pathname.includes("lost");
var dbPath     = isLostPage ? "lostItems" : "foundItems";

// ================= EMAILJS CONFIG =================
// ✅ REPLACE THESE 3 VALUES with your actual EmailJS credentials
// Step 1: Go to https://www.emailjs.com and sign in
// Step 2: Account → General → copy your Public Key
// Step 3: Email Services → your Gmail service → copy Service ID
// Step 4: Email Templates → your template → copy Template ID
// Step 5: In your template, set "To Email" field to: {{to_email}}
var EJS_PUBLIC_KEY   = "7JhGzfkaw_c7uaeGh";   // e.g. "abc123XYZxxxxxx"
var EJS_SERVICE_ID   = "service_wsrl68n";   // e.g. "service_abc123"
var EJS_TEMPLATE_ID  = "template_zsfguy6";  // e.g. "template_xyz456"

// ================= OPEN / CLOSE FORM =================
function openForm(){
  document.getElementById("popupForm").style.display = "flex";
}
function closeForm(){
  document.getElementById("popupForm").style.display = "none";
  document.getElementById("itemName").value    = "";
  document.getElementById("itemLocation").value = "";
  document.getElementById("contactName").value  = "";
  document.getElementById("contactPhone").value = "";
  document.getElementById("itemImage").value    = "";
  document.getElementById("itemCategory").value = "";
}

// ================= SUBMIT FORM =================
function submitForm(){
  var name         = document.getElementById("itemName").value.trim();
  var category     = document.getElementById("itemCategory").value;
  var location     = document.getElementById("itemLocation").value.trim();
  var contactName  = document.getElementById("contactName").value.trim();
  var contactPhone = document.getElementById("contactPhone").value.trim();
  var file         = document.getElementById("itemImage").files[0];

  if(!name || !category || !location || !contactName || !contactPhone){
    alert("⚠️ Please fill all fields");
    return;
  }

  function saveToFirebase(imgData){
    var data = {
      name:         name,
      category:     category,
      location:     location,
      contactName:  contactName,
      contactPhone: contactPhone,
      userEmail:    localStorage.getItem("user") || "",
      image:        imgData,
      date:         new Date().toLocaleDateString()
    };

    firebase.database().ref(dbPath).push(data)
    .then(function(ref){
      closeForm();
      showSuccessToast(isLostPage ? "lost" : "found");
      checkForMatch(name, category, data, ref.key);
    })
    .catch(function(err){
      alert("❌ Failed to submit: " + err.message);
    });
  }

  if(file){
    var reader = new FileReader();
    reader.onload = function(e){
      var img = new Image();
      img.onload = function(){
        var canvas  = document.createElement("canvas");
        var ratio   = Math.min(400/img.width, 300/img.height, 1);
        canvas.width  = Math.round(img.width  * ratio);
        canvas.height = Math.round(img.height * ratio);
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        saveToFirebase(canvas.toDataURL("image/jpeg", 0.55));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  } else {
    saveToFirebase("https://placehold.co/300x180/e4e8f0/9ca3af?text=No+Image");
  }
}

// ================= SMART MATCH =================
function checkForMatch(itemName, category, reporterData, newItemId){
  var searchPath = isLostPage ? "foundItems" : "lostItems";
  var keywords   = itemName.toLowerCase().split(" ").filter(function(w){ return w.length > 2; });

  firebase.database().ref(searchPath).once("value", function(snap){
    if(!snap.exists()) return;

    var matches = [];
    snap.forEach(function(child){
      var item  = child.val();
      var iname = (item.name || "").toLowerCase();
      var fwd = keywords.some(function(kw){ return iname.indexOf(kw) !== -1; });
      var rev = iname.split(" ").filter(function(w){ return w.length > 2; })
                     .some(function(w){ return itemName.toLowerCase().indexOf(w) !== -1; });
      if(fwd || rev) matches.push({ id: child.key, item: item });
    });

    if(matches.length === 0) return;

    if(!isLostPage){
      // Person posted FOUND item — notify lost item owner
      showMatchPopup_ToFinder(itemName, matches, reporterData);
      matches.forEach(function(m){
        sendMatchEmail(
          m.item.userEmail,           // TO: person who lost the item
          m.item.contactName,         // their name
          m.item.name,                // their lost item
          "lost",
          reporterData.contactName,   // finder's name
          reporterData.contactPhone,  // finder's phone
          reporterData.location,      // found at
          "🎉 Your lost item may have been found!",
          "Someone just reported finding an item that matches yours. Contact the finder below to verify and collect."
        );
        // Also notify the finder about the lost owner's contact
        sendMatchEmail(
          reporterData.userEmail,     // TO: finder
          reporterData.contactName,
          itemName,
          "found",
          m.item.contactName,         // lost owner's name
          m.item.contactPhone,        // lost owner's phone
          m.item.location,
          "📦 Someone lost this item!",
          "The item you found matches a lost report. The owner's contact details are below."
        );
      });
    } else {
      // Person posted LOST item — check found items
      showMatchPopup_ToOwner(itemName, matches);
      matches.forEach(function(m){
        sendMatchEmail(
          reporterData.userEmail,     // TO: person who just posted lost
          reporterData.contactName,
          itemName,
          "lost",
          m.item.contactName,         // finder's name
          m.item.contactPhone,        // finder's phone
          m.item.location,
          "🔍 Your item may already be found!",
          "Good news! Someone already reported finding a similar item. Contact the finder below."
        );
        // Also notify the finder
        sendMatchEmail(
          m.item.userEmail,
          m.item.contactName,
          m.item.name,
          "found",
          reporterData.contactName,
          reporterData.contactPhone,
          reporterData.location,
          "🔴 Someone is looking for this item!",
          "A student just reported losing an item that matches what you found. Their contact details are below."
        );
      });
    }

    // Save match record in Firebase
    matches.forEach(function(m){
      var lostId  = isLostPage ? newItemId : m.id;
      var foundId = isLostPage ? m.id      : newItemId;
      firebase.database().ref("matches").push({
        lostItemId:  lostId,
        foundItemId: foundId,
        lostName:    isLostPage ? itemName : m.item.name,
        foundName:   isLostPage ? m.item.name : itemName,
        matchedOn:   new Date().toLocaleString(),
        status:      "pending"
      });
    });
  });
}

// ================= SEND EMAIL via EmailJS =================
// Both students (lost owner + finder) get emailed when a match is detected
function sendMatchEmail(toEmail, toName, itemName, itemType, otherPersonName, otherPersonPhone, otherLocation, subject, message){
  if(!toEmail){
    console.warn("⚠️ No email address saved for this user — email skipped.");
    showErrorToast("⚠️ No email on record for one user — email not sent.");
    return;
  }
  if(EJS_PUBLIC_KEY === "YOUR_EMAILJS_PUBLIC_KEY"){
    console.error("❌ EmailJS not configured! Open script.js and fill in EJS_PUBLIC_KEY, EJS_SERVICE_ID, EJS_TEMPLATE_ID");
    showErrorToast("❌ EmailJS not configured in script.js");
    return;
  }

  var params = {
    to_email:       toEmail,
    to_name:        toName             || "Student",
    item_name:      itemName           || "Your item",
    item_type:      itemType           || "",
    other_name:     otherPersonName    || "A student",
    other_phone:    otherPersonPhone   || "—",
    other_location: otherLocation      || "Campus",
    match_time:     new Date().toLocaleString(),
    subject:        subject            || "Match Found — Campus ReShare Hub",
    message:        message            || ""
  };

  console.log("📧 Sending email to:", toEmail, "| params:", params);

  emailjs.send(EJS_SERVICE_ID, EJS_TEMPLATE_ID, params)
  .then(function(res){
    console.log("✅ Email sent to: " + toEmail, res);
    showInfoToast("📧 Email sent to " + toEmail);
  })
  .catch(function(err){
    console.error("❌ EmailJS error for " + toEmail + ":", JSON.stringify(err));
    showErrorToast("❌ Email failed: " + (err.text || err.message || JSON.stringify(err)));
  });
}

// ── Test function: type testEmail("you@gmail.com") in browser console to verify EmailJS works
function testEmail(toEmail){
  sendMatchEmail(
    toEmail,
    "Test Student",
    "Test Bag",
    "lost",
    "Another Student",
    "9876543210",
    "Library",
    "🧪 EmailJS Test",
    "This is a test email from Campus ReShare Hub. If you received this, EmailJS is working!"
  );
}

// ================= LOAD ITEMS (REAL-TIME) =================
function loadItems(){
  var container = document.getElementById("itemsGrid");
  container.innerHTML = "<p style='color:var(--text-2);padding:10px'>⏳ Loading...</p>";

  // ✅ Vercel fix: use .on() with explicit error handling
  // Make sure Firebase Realtime DB rules allow read: true
  firebase.database().ref(dbPath).on("value", function(snapshot){
    container.innerHTML = "";
    if(!snapshot.exists()){
      container.innerHTML = "<p style='padding:20px;color:#94a3b8'>😔 No items reported yet.</p>";
      return;
    }

    var currentUser = localStorage.getItem("user") || "";

    snapshot.forEach(function(child){
      var item = child.val();
      var id   = child.key;

      var imgSrc = (item.image && item.image.length > 20)
        ? item.image
        : "https://placehold.co/300x180/e4e8f0/9ca3af?text=No+Image";

      var safeName  = (item.name  || "").replace(/'/g, "\\'");
      var safePhone = (item.contactPhone || "").replace(/'/g, "\\'");
      var isOwner   = currentUser && currentUser === item.userEmail;

      var div = document.createElement("div");
      div.className = "item-card";
      div.setAttribute("data-category", item.category || "");

      div.innerHTML =
        '<div style="position:relative;">'
          + '<img src="' + imgSrc + '" class="item-img" loading="lazy"'
          + ' onclick="openImage(\'' + imgSrc.replace(/'/g, "\\'") + '\')"'
          + ' onerror="this.src=\'https://placehold.co/300x180/e4e8f0/9ca3af?text=No+Image\'">'
          + (item.flagged ? '<div style="position:absolute;top:8px;left:8px;background:#f59e0b;color:#000;font-size:9.5px;font-weight:800;padding:3px 9px;border-radius:10px;">🚩 FLAGGED</div>' : "")
        + '</div>'
        + '<div class="card-body">'
          + '<h3 class="item-title">📦 ' + esc(item.name || "Untitled") + '</h3>'
          + '<p>📂 ' + esc(item.category  || "—") + '</p>'
          + '<p>📍 ' + esc(item.location  || "—") + '</p>'
          + '<p>📅 ' + esc(item.date      || "—") + '</p>'
          + '<p>👤 ' + esc(item.contactName  || "N/A") + '</p>'
          + '<p>📞 ' + esc(item.contactPhone || "N/A") + '</p>'
          + (item.flagged
              ? '<div style="background:#fef3c7;border:1px solid #fcd34d;border-radius:8px;padding:7px 10px;margin-top:8px;font-size:12px;color:#92400e;">🚩 ' + esc(item.flagReason || "Under review") + '</div>'
              : "")
          + '<div class="contact-buttons">'
            + '<a href="tel:' + safePhone + '" class="call-btn">📞 Call</a>'
            + '<a href="https://wa.me/91' + safePhone + '" target="_blank" class="whatsapp-btn">💬 WhatsApp</a>'
            + '<button onclick="openChat(\'' + safePhone + '\',\'' + safeName + '\')" class="chat-btn">💬 Chat</button>'
          + '</div>'
          + (isOwner
              ? '<p style="font-size:12px;color:#3b82f6;font-weight:600;margin-top:8px;">✏️ Your item</p>'
              : (item.flagged
                  ? '<button disabled style="width:100%;margin-top:8px;padding:9px;border-radius:8px;background:#fef3c7;color:#92400e;border:1px solid #fcd34d;font-size:12px;cursor:not-allowed;">⚠️ Claiming disabled</button>'
                  : '<button onclick="claimItem(\'' + id + '\')" class="claim-btn">🏷 Claim</button>'
                )
            )
        + '</div>';

      container.appendChild(div);
    });

  }, function(error){
    // ✅ Shows clear error on Vercel if Firebase rules are blocking
    container.innerHTML =
      "<div style='padding:20px;background:#fef2f2;border:1px solid #fecaca;border-radius:12px;margin:10px;'>"
      + "<p style='color:#dc2626;font-weight:700;'>❌ Firebase Error: " + error.message + "</p>"
      + "<p style='color:#991b1b;font-size:13px;margin-top:6px;'>Fix: Go to Firebase Console → Realtime Database → Rules → set <b>.read: true</b></p>"
      + "</div>";
  });
}

// ================= FILTER =================
function setupFilter(){
  var search = document.getElementById("searchInput");
  var filter = document.getElementById("categoryFilter");
  function run(){
    var text = search.value.toLowerCase();
    var cat  = filter.value;
    document.querySelectorAll(".item-card").forEach(function(card){
      var title    = card.querySelector(".item-title").innerText.toLowerCase();
      var category = card.getAttribute("data-category");
      card.style.display = (title.includes(text) && (cat==="all" || category===cat)) ? "block" : "none";
    });
  }
  search.addEventListener("input", run);
  filter.addEventListener("change", run);
}

// ================= CLAIM =================
function claimItem(itemId){
  var userEmail = localStorage.getItem("user");
  if(!userEmail){ alert("⚠️ Please log in to claim."); return; }

  firebase.database().ref("users/" + userEmail.replace(/[.#$\[\]@]/g, "_")).once("value", function(snap){
    if(snap.val() && snap.val().status === "banned"){
      alert("🚫 Your account is suspended.");
      return;
    }
    var claimantName  = prompt("Your Full Name:");
    if(!claimantName  || !claimantName.trim())  return;
    var claimantPhone = prompt("Your Phone Number:");
    if(!claimantPhone || !claimantPhone.trim()) return;

    firebase.database().ref("claims/" + itemId).push({
      claimantName:  claimantName.trim(),
      claimantEmail: userEmail,
      claimantPhone: claimantPhone.trim(),
      userEmail:     userEmail,
      status:        "pending",
      time:          new Date().toLocaleString()
    }).then(function(){
      alert("✅ Claim sent! The owner will be notified.");
    }).catch(function(err){
      alert("❌ Failed: " + err.message);
    });
  });
}

// ================= IMAGE ZOOM =================
function openImage(src){
  if(!src || src === "") return;
  document.getElementById("imageModal").style.display = "flex";
  document.getElementById("modalImg").src = src;
  document.body.style.overflow = "hidden";
}
function closeImage(){
  document.getElementById("imageModal").style.display = "none";
  document.body.style.overflow = "";
}

// ================= CHAT =================
var currentChatId = "";
function openChat(phone, item){
  currentChatId = phone + "_" + item;
  document.getElementById("chatBox").style.display = "flex";
  var msgContainer = document.getElementById("chatMessages");
  firebase.database().ref("chats/" + currentChatId).on("value", function(snap){
    msgContainer.innerHTML = "";
    if(snap.exists()){
      snap.forEach(function(child){
        var msg = child.val();
        var div = document.createElement("div");
        div.style.cssText = "padding:6px 10px;margin:4px 0;background:#f1f5f9;border-radius:8px;font-size:13px;";
        div.textContent = msg.text || "";
        msgContainer.appendChild(div);
      });
      msgContainer.scrollTop = msgContainer.scrollHeight;
    }
  });
}
function sendMessage(){
  var input = document.getElementById("chatInput");
  if(!input.value.trim()) return;
  firebase.database().ref("chats/" + currentChatId).push({ text: input.value.trim() });
  input.value = "";
}
function closeChat(){
  document.getElementById("chatBox").style.display = "none";
  if(currentChatId) firebase.database().ref("chats/" + currentChatId).off();
}

// ================= LOGOUT =================
function logout(){
  localStorage.removeItem("user");
  window.location.href = "login.html";
}

// ================= INIT =================
window.onload = function(){
  // ✅ Initialize EmailJS on page load
  if(EJS_PUBLIC_KEY !== "YOUR_EMAILJS_PUBLIC_KEY"){
    emailjs.init(EJS_PUBLIC_KEY);
  }

  loadItems();
  setupFilter();

  var email = localStorage.getItem("user");
  var el = document.getElementById("userEmail");
  if(el && email) el.textContent = email;

  var modal = document.getElementById("imageModal");
  if(modal){
    modal.addEventListener("click", function(e){ if(e.target === modal) closeImage(); });
  }
  document.addEventListener("keydown", function(e){ if(e.key === "Escape") closeImage(); });
};

// ================= UTILS =================
function esc(s){
  return String(s || "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

// Animation CSS
(function(){
  var s = document.createElement("style");
  s.textContent =
    "@keyframes popIn{from{transform:scale(0.88);opacity:0;}to{transform:scale(1);opacity:1;}}"
    + "@keyframes slideUp{from{opacity:0;transform:translateX(-50%) translateY(16px);}to{opacity:1;transform:translateX(-50%) translateY(0);}}";
  document.head.appendChild(s);
})();

// ================= MATCH POPUPS =================
function showMatchPopup_ToFinder(foundName, matches, finderData){
  var list = matches.map(function(m){
    return '<div style="background:#fef3c7;border:1px solid #fde68a;border-radius:10px;padding:12px;margin-top:8px;text-align:left;">'
      + '<div style="font-weight:700;color:#92400e;font-size:13.5px;">🔴 ' + esc(m.item.name || "Item") + '</div>'
      + '<div style="font-size:12px;color:#78350f;margin-top:5px;line-height:1.7;">'
      + '📍 Lost at: <b>' + esc(m.item.location    || "—") + '</b><br>'
      + '👤 Owner: <b>'   + esc(m.item.contactName  || "—") + '</b><br>'
      + '📞 Phone: <b>'   + esc(m.item.contactPhone || "—") + '</b>'
      + '</div></div>';
  }).join("");
  showPopup("🎉","Match Found!",
    'Your found item <b style="color:#4f46e5">"' + esc(foundName) + '"</b> matches a lost report! Both students have been <b>notified by email 📧</b>',
    list,
    '<div style="margin-top:12px;padding:10px 14px;background:#f0fdf4;border:1px solid #86efac;border-radius:10px;font-size:12px;color:#166534;">✅ The owner will contact you directly.</div>',
    "Got it! ✓", null
  );
}

function showMatchPopup_ToOwner(lostName, matches){
  var list = matches.map(function(m){
    return '<div style="background:#f0fdf4;border:1px solid #86efac;border-radius:10px;padding:12px;margin-top:8px;text-align:left;">'
      + '<div style="font-weight:700;color:#166534;font-size:13.5px;">🟢 ' + esc(m.item.name || "Item") + '</div>'
      + '<div style="font-size:12px;color:#14532d;margin-top:5px;line-height:1.7;">'
      + '📍 Found at: <b>' + esc(m.item.location    || "—") + '</b><br>'
      + '👤 Finder: <b>'   + esc(m.item.contactName  || "—") + '</b><br>'
      + '📞 Phone: <b>'    + esc(m.item.contactPhone || "—") + '</b>'
      + '</div></div>';
  }).join("");
  showPopup("🔍","Possible Match Found!",
    'Your lost item <b style="color:#4f46e5">"' + esc(lostName) + '"</b> may already be found! Both students have been <b>notified by email 📧</b>',
    list,
    '<div style="margin-top:12px;padding:10px 14px;background:#fefce8;border:1px solid #fde68a;border-radius:10px;font-size:12px;color:#92400e;">⚠️ Contact the finder above to verify!</div>',
    "Close",
    { label: "View Found Items →", href: "found-items.html" }
  );
}

function showPopup(icon, title, subtitle, listHtml, noteHtml, btn1Label, btn2){
  var existing = document.getElementById("smart-match-popup");
  if(existing) existing.remove();
  var btn2Html = btn2
    ? '<a href="' + btn2.href + '" style="flex:1;background:linear-gradient(135deg,#16a34a,#15803d);color:#fff;padding:12px;border-radius:50px;font-size:13px;font-weight:700;text-decoration:none;display:flex;align-items:center;justify-content:center;">' + btn2.label + '</a>'
    : "";
  var popup = document.createElement("div");
  popup.id  = "smart-match-popup";
  popup.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.65);z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px;";
  popup.innerHTML =
    '<div style="background:#fff;border-radius:20px;padding:26px;max-width:400px;width:100%;box-shadow:0 24px 64px rgba(0,0,0,0.25);animation:popIn 0.3s cubic-bezier(0.34,1.56,0.64,1);text-align:center;">'
    + '<div style="font-size:3rem;margin-bottom:8px">' + icon + '</div>'
    + '<h2 style="color:#1f2937;font-size:1.15rem;margin-bottom:6px;">' + title + '</h2>'
    + '<p style="color:#6b7280;font-size:12.5px;line-height:1.6;margin-bottom:8px;">' + subtitle + '</p>'
    + listHtml + noteHtml
    + '<div style="display:flex;gap:8px;margin-top:14px;">'
    + '<button onclick="document.getElementById(\'smart-match-popup\').remove()" style="flex:1;background:#f3f4f6;color:#374151;border:none;padding:12px;border-radius:50px;font-size:13px;font-weight:700;cursor:pointer;">' + btn1Label + '</button>'
    + btn2Html + '</div></div>';
  document.body.appendChild(popup);
}

function showSuccessToast(type){
  var msg = type === "found"
    ? "✅ Found item posted! You'll be notified if a match is detected."
    : "✅ Lost item posted! You'll be notified if someone finds it.";
  _showToast(msg, "#1f2937", 4000);
}

function showErrorToast(msg){
  _showToast(msg, "#dc2626", 6000);
}

function showInfoToast(msg){
  _showToast(msg, "#2563eb", 4000);
}

function _showToast(msg, bg, duration){
  var toast = document.createElement("div");
  toast.style.cssText = "position:fixed;bottom:24px;left:50%;transform:translateX(-50%);"
    + "background:" + bg + ";color:#fff;padding:12px 24px;border-radius:50px;"
    + "font-size:13px;font-weight:600;z-index:99999;box-shadow:0 8px 24px rgba(0,0,0,0.25);"
    + "animation:slideUp 0.3s ease;max-width:90vw;text-align:center;";
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(function(){ toast.remove(); }, duration);
}
