// // 🔥 Detect page automatically
// let isLostPage = window.location.pathname.includes("lost");
// let dbPath = isLostPage ? "lostItems" : "foundItems";

// // ================= FORM =================
// function openForm(){
//   document.getElementById("popupForm").style.display = "flex";
// }

// function closeForm(){
//   document.getElementById("popupForm").style.display = "none";
// }

// // ================= SUBMIT =================
// function submitForm(){

//   let name = document.getElementById("itemName").value.trim();
//   let category = document.getElementById("itemCategory").value;
//   let location = document.getElementById("itemLocation").value.trim();
//   let contactName = document.getElementById("contactName").value.trim();
//   let contactPhone = document.getElementById("contactPhone").value.trim();
//   let file = document.getElementById("itemImage").files[0];

//   if(!name || !category || !location){
//     alert("⚠️ Please fill all fields");
//     return;
//   }

//   let reader = new FileReader();

//   reader.onload = function(e){

//     let data = {
//       name,
//       category,
//       location,
//       contactName,
//       contactPhone,
//       image: e.target.result,
//       date: new Date().toLocaleDateString()
//     };

//     firebase.database().ref(dbPath).push(data)
//     .then(()=>{
//       alert("✅ Item Added!");
//       closeForm();
//     });
//   };

//   if(file){
//     reader.readAsDataURL(file);
//   } else {
//     reader.onload({ target:{ result:"https://placehold.co/300x180?text=No+Image"} });
//   }
// }

// // ================= LOAD ITEMS =================
// function loadItems(){

//   const container = document.getElementById("itemsGrid");

//   firebase.database().ref(dbPath).on("value", snapshot => {

//     container.innerHTML = "";

//     if(!snapshot.exists()){
//       container.innerHTML = "<p>😔 No items found</p>";
//       return;
//     }

//     snapshot.forEach(child => {

//       let item = child.val();
//       let id = child.key;

//       let img = item.image && item.image.length > 20
//         ? item.image
//         : "https://placehold.co/300x180?text=No+Image";

//       container.innerHTML += `
//       <div class="item-card" data-category="${item.category}">

//         <img src="${img}" class="item-img" onclick="openImage('${img}')">

//         <div class="card-body">

//           <h3 class="item-title">📦 ${item.name}</h3>

//           <p>📂 ${item.category}</p>
//           <p>📍 ${item.location}</p>
//           <p>📅 ${item.date}</p>
//           <p>👤 ${item.contactName || "N/A"}</p>
//           <p>📞 ${item.contactPhone || "N/A"}</p>

//           <div class="contact-buttons">

//             <a href="tel:${item.contactPhone}" class="call-btn">📞 Call</a>

//             <a href="https://wa.me/91${item.contactPhone}" target="_blank" class="whatsapp-btn">
//               💬 WhatsApp
//             </a>

//             <button onclick="openChat('${item.contactPhone}','${item.name}')" class="chat-btn">
//               💬 Chat
//             </button>

//           </div>

//           <button onclick="claimItem('${id}')" class="claim-btn">
//             🏷 Claim
//           </button>

//         </div>
//       </div>
//       `;
//     });

//   });
// }

// // ================= FILTER =================
// function setupFilter(){

//   let search = document.getElementById("searchInput");
//   let filter = document.getElementById("categoryFilter");

//   function run(){

//     let text = search.value.toLowerCase();
//     let cat = filter.value;

//     document.querySelectorAll(".item-card").forEach(card => {

//       let title = card.querySelector(".item-title").innerText.toLowerCase();
//       let category = card.getAttribute("data-category");

//       let show = title.includes(text) &&
//                  (cat === "all" || category === cat);

//       card.style.display = show ? "block" : "none";
//     });
//   }

//   search.addEventListener("input", run);
//   filter.addEventListener("change", run);
// }

// // ================= CLAIM =================
// function claimItem(itemId){

//   let user = JSON.parse(localStorage.getItem("user"));

//   if(!user){
//     alert("⚠️ Login required");
//     return;
//   }

//   let claimData = {
//     claimantName: user.name || "User",
//     claimantEmail: user.email,
//     claimantPhone: user.phone || "",
//     status: "pending",
//     time: new Date().toLocaleString()
//   };

//   firebase.database().ref("claims/" + itemId).push(claimData)
//   .then(()=>{
//     alert("✅ Claim request sent!");
//   });
// }

// // ================= IMAGE ZOOM =================
// function openImage(src){
//   if(!src||src==="") return;
//   var modal = document.getElementById("imageModal");
//   var img   = document.getElementById("modalImg");
//   img.src = src;
//   modal.style.display = "flex";
//   document.body.style.overflow = "hidden";
// }

// function closeImage(){
//   document.getElementById("imageModal").style.display = "none";
//   document.body.style.overflow = "";
// }

// // ================= CHAT =================
// let currentChatId="";

// function openChat(phone,item){
//   currentChatId = phone+"_"+item;
//   document.getElementById("chatBox").style.display="flex";
// }

// function sendMessage(){
//   let input=document.getElementById("chatInput");

//   if(!input.value.trim()) return;

//   firebase.database().ref("chats/"+currentChatId).push({
//     text: input.value
//   });

//   input.value="";
// }

// function closeChat(){
//   document.getElementById("chatBox").style.display="none";
// }

// // ================= INIT =================
// window.onload = function(){
//   loadItems();
//   setupFilter();
// };

// // ================= LOGOUT =================
// function logout(){
//   localStorage.removeItem("user");
//   window.location.href="login.html";
// }
// // ================= IMAGE MODAL EXTRAS =================
// // Close on backdrop click + ESC key
// (function(){
//   var modal = document.getElementById("imageModal");
//   if(modal){
//     modal.addEventListener("click", function(e){
//       if(e.target === modal) closeImage();
//     });
//   }
//   document.addEventListener("keydown", function(e){
//     if(e.key === "Escape") closeImage();
//   });
// })();




// ================= PAGE DETECT =================
var isLostPage = window.location.pathname.includes("lost");
var dbPath     = isLostPage ? "lostItems" : "foundItems";

// ================= OPEN / CLOSE FORM =================
function openForm(){
  document.getElementById("popupForm").style.display = "flex";
}
function closeForm(){
  document.getElementById("popupForm").style.display = "none";
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

    firebase.database().ref(dbPath).push(data).then(function(ref){
      // Clear form fields
      document.getElementById("itemName").value     = "";
      document.getElementById("itemLocation").value  = "";
      document.getElementById("contactName").value   = "";
      document.getElementById("contactPhone").value  = "";
      document.getElementById("itemImage").value     = "";
      closeForm();

      // ── CHECK FOR SMART MATCH AFTER POSTING ──
      checkForMatch(name, category, data, ref.key);

    }).catch(function(err){
      alert("❌ Failed to submit: " + err.message);
    });
  }

  if(file){
    // Compress image to reduce size before storing
    var reader = new FileReader();
    reader.onload = function(e){
      var img    = new Image();
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

// ================= SMART MATCH CHECK =================
function checkForMatch(itemName, category, reporterData, newItemId){
  // If user posted FOUND item → search lostItems for match
  // If user posted LOST  item → search foundItems for match
  var searchPath = isLostPage ? "foundItems" : "lostItems";

  // Keywords from item name (ignore short words)
  var keywords = itemName.toLowerCase().split(" ").filter(function(w){
    return w.length > 2;
  });

  firebase.database().ref(searchPath).once("value", function(snap){
    if(!snap.exists()){
      // No items on other side yet — just show success
      showSuccessToast(isLostPage ? "lost" : "found");
      return;
    }

    var matches = [];
    snap.forEach(function(child){
      var item  = child.val();
      var iname = (item.name || "").toLowerCase();

      // Check keyword match both ways
      var forwardMatch  = keywords.some(function(kw){ return iname.indexOf(kw) !== -1; });
      var reverseMatch  = iname.split(" ").filter(function(w){ return w.length > 2; })
                          .some(function(w){ return itemName.toLowerCase().indexOf(w) !== -1; });

      if(forwardMatch || reverseMatch){
        matches.push({ id: child.key, item: item });
      }
    });

    if(matches.length === 0){
      // No match found — just success message
      showSuccessToast(isLostPage ? "lost" : "found");
      return;
    }

    // ── MATCH FOUND! ──
    if(!isLostPage){
      // Student just posted FOUND item → match with lost items
      // Show popup to finder: "Someone lost this!"
      showMatchPopup_ToFinder(itemName, matches, reporterData);
      // Send email to each lost item owner: "Your item may be found!"
      matches.forEach(function(m){
        sendEmail_ToLostOwner(m.item, reporterData, itemName);
      });
    } else {
      // Student just posted LOST item → match already in found items
      // Show popup to owner: "Someone already found this!"
      showMatchPopup_ToOwner(itemName, matches);
      // Send email to the person who just reported lost: "Your item may already be found!"
      matches.forEach(function(m){
        sendEmail_ToNewLostReporter(reporterData, m.item, itemName);
      });
    }

    // Save match in Firebase for admin to see
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

// ═══════════════════════════════════════════════
// POPUP 1 — Shown to person who posted FOUND item
// "Someone already reported this as LOST!"
// ═══════════════════════════════════════════════
function showMatchPopup_ToFinder(foundName, matches, finderData){
  var list = matches.map(function(m){
    return '<div style="background:#fef3c7;border:1px solid #fde68a;border-radius:10px;padding:12px;margin-top:8px;text-align:left;">'
      + '<div style="font-weight:700;color:#92400e;font-size:13.5px;">🔴 ' + esc(m.item.name||"Item") + '</div>'
      + '<div style="font-size:12px;color:#78350f;margin-top:5px;line-height:1.7;">'
      + '📍 Lost at: <b>' + esc(m.item.location||"—")    + '</b><br>'
      + '👤 Owner: <b>'   + esc(m.item.contactName||"—") + '</b><br>'
      + '📞 Phone: <b>'   + esc(m.item.contactPhone||"—")+ '</b>'
      + '</div></div>';
  }).join("");

  showPopup(
    "🎉",
    "Match Found!",
    'Your found item <b style="color:#4f46e5">"' + esc(foundName) + '"</b> matches a lost item report! The owner has been <b>notified by email automatically 📧</b>',
    list,
    '<div style="margin-top:12px;padding:10px 14px;background:#f0fdf4;border:1px solid #86efac;border-radius:10px;font-size:12px;color:#166534;">'
    + '✅ Your found item is now posted. The owner will contact you on your phone number.</div>',
    "Got it! ✓",
    null
  );
}

// ═══════════════════════════════════════════════
// POPUP 2 — Shown to person who posted LOST item
// "Good news! Someone may have already found it!"
// ═══════════════════════════════════════════════
function showMatchPopup_ToOwner(lostName, matches){
  var list = matches.map(function(m){
    return '<div style="background:#f0fdf4;border:1px solid #86efac;border-radius:10px;padding:12px;margin-top:8px;text-align:left;">'
      + '<div style="font-weight:700;color:#166534;font-size:13.5px;">🟢 ' + esc(m.item.name||"Item") + '</div>'
      + '<div style="font-size:12px;color:#14532d;margin-top:5px;line-height:1.7;">'
      + '📍 Found at: <b>'  + esc(m.item.location||"—")    + '</b><br>'
      + '👤 Finder: <b>'    + esc(m.item.contactName||"—") + '</b><br>'
      + '📞 Phone: <b>'     + esc(m.item.contactPhone||"—")+ '</b>'
      + '</div></div>';
  }).join("");

  showPopup(
    "🔍",
    "Possible Match Found!",
    'Good news! Your lost item <b style="color:#4f46e5">"' + esc(lostName) + '"</b> may already be in Found Items. We also sent you an <b>email notification 📧</b>',
    list,
    '<div style="margin-top:12px;padding:10px 14px;background:#fefce8;border:1px solid #fde68a;border-radius:10px;font-size:12px;color:#92400e;">'
    + '⚠️ Your lost item report was also saved. Contact the finder above directly to verify!</div>',
    "Close",
    { label: "View Found Items →", href: "found-items.html" }
  );
}

// ═══════════════════════════════════════════════
// Generic popup builder
// ═══════════════════════════════════════════════
function showPopup(icon, title, subtitle, listHtml, noteHtml, btn1Label, btn2){
  // Remove existing popup if any
  var existing = document.getElementById("smart-match-popup");
  if(existing) existing.remove();

  var btn2Html = btn2
    ? '<a href="' + btn2.href + '" style="flex:1;background:linear-gradient(135deg,#16a34a,#15803d);color:#fff;padding:12px;border-radius:50px;font-size:13px;font-weight:700;text-decoration:none;display:flex;align-items:center;justify-content:center;">' + btn2.label + '</a>'
    : "";

  var popup = document.createElement("div");
  popup.id  = "smart-match-popup";
  popup.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.65);z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px;";
  popup.innerHTML =
    '<div style="background:#fff;border-radius:20px;padding:26px;max-width:400px;width:100%;'
    + 'box-shadow:0 24px 64px rgba(0,0,0,0.25);animation:popIn 0.3s cubic-bezier(0.34,1.56,0.64,1);text-align:center;">'
    + '<div style="font-size:3rem;margin-bottom:8px">' + icon + '</div>'
    + '<h2 style="color:#1f2937;font-size:1.15rem;margin-bottom:6px;">' + title + '</h2>'
    + '<p style="color:#6b7280;font-size:12.5px;line-height:1.6;margin-bottom:8px;">' + subtitle + '</p>'
    + listHtml
    + noteHtml
    + '<div style="display:flex;gap:8px;margin-top:14px;">'
    + '<button onclick="document.getElementById(\'smart-match-popup\').remove()" '
    + 'style="flex:1;background:#f3f4f6;color:#374151;border:none;padding:12px;border-radius:50px;font-size:13px;font-weight:700;cursor:pointer;">'
    + btn1Label + '</button>'
    + btn2Html
    + '</div></div>';

  document.body.appendChild(popup);
}

// ═══════════════════════════════════════════════
// SUCCESS TOAST — when no match found
// ═══════════════════════════════════════════════
function showSuccessToast(type){
  var msg = type === "found"
    ? "✅ Found item posted! You'll be notified if a match is detected."
    : "✅ Lost item posted! You'll be notified if someone finds it.";

  var toast = document.createElement("div");
  toast.style.cssText = "position:fixed;bottom:24px;left:50%;transform:translateX(-50%);"
    + "background:#1f2937;color:#fff;padding:12px 24px;border-radius:50px;"
    + "font-size:13px;font-weight:600;z-index:99999;box-shadow:0 8px 24px rgba(0,0,0,0.25);"
    + "animation:slideUp 0.3s ease;";
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(function(){ toast.remove(); }, 4000);
}

// ═══════════════════════════════════════════════
// EMAIL 1 — To lost item OWNER when match found
// "Someone may have found your item!"
// ═══════════════════════════════════════════════
// function sendEmail_ToLostOwner(lostItem, finderData, foundItemName){
//   var cfg = JSON.parse(localStorage.getItem("ejsCfg") || "{}");
//   if(!cfg.pub || !cfg.svc || !cfg.tpl){
//     console.log("EmailJS not configured — skipping email");
//     return;
//   }

//   var toEmail = lostItem.userEmail || "";
//   if(!toEmail){
//     console.log("No email address for lost item owner");
//     return;
//   }

//   try { emailjs.init(cfg.pub); } catch(e){}

//   emailjs.send(cfg.svc, cfg.tpl, {
//     to_email:       toEmail,
//     to_name:        lostItem.contactName  || "Student",
//     item_name:      lostItem.name         || foundItemName,
//     item_type:      "lost",
//     claimant_name:  finderData.contactName  || "A student",
//     claimant_phone: finderData.contactPhone || "—",
//     claimant_email: finderData.userEmail    || "—",
//     claim_time:     new Date().toLocaleString(),
//     status:         "🎉 Match Found!",
//     reason:         "—",
//     admin_note:     "Great news! Someone just reported finding an item that looks like what you lost — \""
//                     + (lostItem.name || foundItemName) + "\". "
//                     + "Finder: " + (finderData.contactName  || "A student") + ". "
//                     + "Phone: "  + (finderData.contactPhone || "—") + ". "
//                     + "Please contact them directly to verify and collect your item. "
//                     + "You can also visit the Found Items page on Campus ReShare Hub."
//   })
//   .then(function(){
//     console.log("✅ Match email sent to lost item owner: " + toEmail);
//   })
//   .catch(function(err){
//     console.log("❌ Email error:", err);
//   });
// }

// // ═══════════════════════════════════════════════
// // EMAIL 2 — To person who just posted LOST item
// // "Your item may already be in Found Items!"
// // ═══════════════════════════════════════════════
// function sendEmail_ToNewLostReporter(reporterData, foundItem, lostItemName){
//   var cfg = JSON.parse(localStorage.getItem("ejsCfg") || "{}");
//   if(!cfg.pub || !cfg.svc || !cfg.tpl){
//     console.log("EmailJS not configured — skipping email");
//     return;
//   }

//   var toEmail = reporterData.userEmail || "";
//   if(!toEmail){
//     console.log("No email for reporter");
//     return;
//   }

//   try { emailjs.init(cfg.pub); } catch(e){}

//   emailjs.send(cfg.svc, cfg.tpl, {
//     to_email:       toEmail,
//     to_name:        reporterData.contactName  || "Student",
//     item_name:      lostItemName,
//     item_type:      "lost",
//     claimant_name:  foundItem.contactName  || "A student",
//     claimant_phone: foundItem.contactPhone || "—",
//     claimant_email: foundItem.userEmail    || "—",
//     claim_time:     new Date().toLocaleString(),
//     status:         "🔍 Possible Match Found!",
//     reason:         "—",
//     admin_note:     "We found a possible match for your lost item \""
//                     + lostItemName + "\"! "
//                     + "Someone reported finding a similar item at " + (foundItem.location || "campus") + ". "
//                     + "Finder name: " + (foundItem.contactName  || "A student") + ". "
//                     + "Phone: "       + (foundItem.contactPhone || "—") + ". "
//                     + "Visit the Found Items page on Campus ReShare Hub to verify!"
//   })
//   .then(function(){
//     console.log("✅ Match email sent to new lost reporter: " + toEmail);
//   })
//   .catch(function(err){
//     console.log("❌ Email error:", err);
//   });
// }

// // ═══════════════════════════════════════════════
// // EMAIL 1 — To lost item OWNER when match found
// // ═══════════════════════════════════════════════
// function sendEmail_ToLostOwner(lostItem, finderData){

//   emailjs.send("service_wsrl68n", "template_zsfguy6", {
//     subject: "🎉 Match Found!",
//     name: lostItem.contactName || "Student",
//     message: "Good news! Someone found your lost item.",
//     item: lostItem.name,
//     location: finderData.location || "Campus",
//     phone: finderData.contactPhone || "N/A",

//     // 🔥 THIS IS IMPORTANT
//     to_email: "23a91a6127@aec.edu.in"   // 👈 PUT YOUR EMAIL HERE
//   })
//   .then((res) => {
//     console.log("✅ EMAIL SENT", res);
//   })
//   .catch((err) => {
//     console.log("❌ EMAIL ERROR", err);
//   });
// }


// // ═══════════════════════════════════════════════
// // EMAIL 2 — To person who just posted LOST item
// // ═══════════════════════════════════════════════
// function sendEmail_ToNewLostReporter(reporterData, foundItem){

//   if(!reporterData.userEmail){
//     console.log("No email found");
//     return;
//   }

//   emailjs.send("service_wsrl68n", "template_zsfguy6", {
//     subject: "🔍 Match Found!",
//     name: reporterData.contactName || "Student",
//     message: "We found a similar item in Found section.",
//     item: foundItem.name,
//     location: foundItem.location || "Campus",
//     phone: foundItem.contactPhone || "N/A",

//     // 🔥 IMPORTANT FIX
//     reply_to: reporterData.userEmail
//   })
//   .then(() => console.log("✅ Email sent"))
//   .catch(err => console.log("❌ Email error", err));
// }

function sendRealEmail(lostItem, finderData) {

  document.getElementById("mail_name").value = lostItem.contactName;

  document.getElementById("mail_message").value =
    `Match Found!\nItem: ${lostItem.name}\nLocation: ${finderData.location}\nFinder: ${finderData.contactName}\nPhone: ${finderData.contactPhone}`;

  document.getElementById("mail_to").value = lostItem.userEmail;

  document.getElementById("emailForm").submit();

  console.log("✅ Email triggered via FormSubmit");
}
sendRealEmail(lostItem, finderData);
// ================= LOAD ITEMS =================
function loadItems(){
  var container = document.getElementById("itemsGrid");
  container.innerHTML = "<p style='color:var(--text-2);padding:10px'>⏳ Loading...</p>";

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

      var safeName  = (item.name||"").replace(/'/g,"\\'");
      var safePhone = (item.contactPhone||"").replace(/'/g,"\\'");

      var isOwner = currentUser && currentUser === item.userEmail;

      var div = document.createElement("div");
      div.className = "item-card";
      div.setAttribute("data-category", item.category||"");

      div.innerHTML =
        '<div style="position:relative;">'
          + '<img src="' + imgSrc + '" class="item-img" loading="lazy"'
          + ' onclick="openImage(\'' + imgSrc.replace(/'/g,"\\'") + '\')"'
          + ' onerror="this.src=\'https://placehold.co/300x180/e4e8f0/9ca3af?text=No+Image\'">'
          + (item.flagged ? '<div style="position:absolute;top:8px;left:8px;background:#f59e0b;color:#000;font-size:9.5px;font-weight:800;padding:3px 9px;border-radius:10px;">🚩 FLAGGED</div>' : "")
        + '</div>'
        + '<div class="card-body">'
          + '<h3 class="item-title">📦 ' + esc(item.name||"Untitled") + '</h3>'
          + '<p>📂 ' + esc(item.category||"—") + '</p>'
          + '<p>📍 ' + esc(item.location||"—") + '</p>'
          + '<p>📅 ' + esc(item.date||"—") + '</p>'
          + '<p>👤 ' + esc(item.contactName||"N/A") + '</p>'
          + '<p>📞 ' + esc(item.contactPhone||"N/A") + '</p>'
          + (item.flagged
              ? '<div style="background:#fef3c7;border:1px solid #fcd34d;border-radius:8px;padding:7px 10px;margin-top:8px;font-size:12px;color:#92400e;">🚩 Flagged: ' + esc(item.flagReason||"Under review") + '</div>'
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
    container.innerHTML = "<p style='padding:20px;color:#ef4444'>❌ Error: " + error.message + "</p>";
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
      card.style.display = (title.includes(text) && (cat==="all"||category===cat)) ? "block" : "none";
    });
  }
  search.addEventListener("input", run);
  filter.addEventListener("change", run);
}

// ================= CLAIM =================
function claimItem(itemId){
  var userEmail = localStorage.getItem("user");
  if(!userEmail){ alert("⚠️ Please log in to claim."); return; }

  firebase.database().ref("users/"+userEmail.replace(/[.#$\[\]@]/g,"_")).once("value", function(snap){
    if(snap.val() && snap.val().status === "banned"){
      alert("🚫 Your account is suspended. You cannot claim items.");
      return;
    }
    var claimantName  = prompt("Your Full Name:");
    if(!claimantName||!claimantName.trim()) return;
    var claimantPhone = prompt("Your Phone Number:");
    if(!claimantPhone||!claimantPhone.trim()) return;

    firebase.database().ref("claims/"+itemId).push({
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
  if(!src||src==="") return;
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
function openChat(phone,item){
  currentChatId = phone+"_"+item;
  document.getElementById("chatBox").style.display = "flex";
}
function sendMessage(){
  var input = document.getElementById("chatInput");
  if(!input.value.trim()) return;
  firebase.database().ref("chats/"+currentChatId).push({ text: input.value });
  input.value = "";
}
function closeChat(){
  document.getElementById("chatBox").style.display = "none";
}

// ================= LOGOUT =================
function logout(){
  localStorage.removeItem("user");
  window.location.href = "login.html";
}

// ================= INIT =================
window.onload = function(){
  loadItems();
  setupFilter();
  // Close image modal on backdrop click or ESC
  var modal = document.getElementById("imageModal");
  if(modal){
    modal.addEventListener("click", function(e){ if(e.target===modal) closeImage(); });
  }
  document.addEventListener("keydown", function(e){ if(e.key==="Escape") closeImage(); });
};

// ================= UTILS =================
function esc(s){
  return String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

// Popup + toast animation CSS
(function(){
  var s = document.createElement("style");
  s.textContent =
    "@keyframes popIn{from{transform:scale(0.88);opacity:0;}to{transform:scale(1);opacity:1;}}"
    + "@keyframes slideUp{from{opacity:0;transform:translateX(-50%) translateY(16px);}to{opacity:1;transform:translateX(-50%) translateY(0);}}";
  document.head.appendChild(s);
})();

function sendMatchEmail(data) {
  emailjs.send("service_wsrl68n", "template_zsfguy6", {
    subject: "🎉 Match Found!",
    name: data.owner,
    message: "Good news! Your lost item has been matched.",
    item: data.name,
    location: data.location,
    phone: data.phone,
    email: data.email
  })
  .then(() => {
    console.log("✅ Email sent");
  })
  .catch(err => {
    console.error("❌ Email error:", err);
  });
}