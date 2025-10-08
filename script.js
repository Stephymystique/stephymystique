/* ===========================
   Stephy Mystique - script.js
   Replace your current script.js with this file
   =========================== */

/* ---------- Helpers ---------- */
const qs = sel => document.querySelector(sel);
const qsa = sel => Array.from(document.querySelectorAll(sel));

/* ---------- Elements ---------- */
const productButtons = document.querySelectorAll(".product button");
const cartCount = qs(".cart-count");
const cartPopup = qs("#cartPopup");
const cartItemsDiv = qs("#cartItems");
const cartTotalSpan = qs("#cartTotal");
const checkoutBtn = qs("#checkoutBtn");
const closeCartBtn = qs("#closeCart");
const orderSummary = qs("#orderSummary");
const orderSummaryText = qs("#orderSummaryText");
const confirmPaymentBtn = qs("#confirmPaymentBtn");

const customerNameInput = qs("#customerName");
const customerPhoneInput = qs("#customerPhone");
const customerAddressInput = qs("#customerAddress");

const searchInput = qs("#searchInput");
const searchIcon = qs(".search-icon");

/* ---------- Local State ---------- */
let cart = [];
let deliveryFee = 35; // default Speedaf fee (₵)
const DELIVERY_DEFAULT = 35;

/* ---------- USER AUTH (localStorage) ---------- */
function createAuthUI() {
  if (qs("#authModal")) return;
  const modal = document.createElement("div");
  modal.id = "authModal";
  modal.style = `
    position:fixed; inset:0; display:flex; align-items:center; justify-content:center;
    background:rgba(0,0,0,0.4); z-index:9999;
  `;
  modal.innerHTML = `
    <div style="width:320px; background:white; padding:16px; border-radius:8px; box-shadow:0 4px 14px rgba(0,0,0,0.15);">
      <button id="closeAuth" style="float:right;border:none;background:transparent;font-size:16px;cursor:pointer">✕</button>
      <h3 style="margin-top:0">Welcome — Sign up / Login</h3>
      <div id="authForms">
        <div id="signupForm">
          <input id="signupName" placeholder="Full name" style="width:100%;margin:6px 0;padding:8px"/>
          <input id="signupEmail" placeholder="Email" style="width:100%;margin:6px 0;padding:8px"/>
          <input id="signupPassword" placeholder="Password" type="password" style="width:100%;margin:6px 0;padding:8px"/>
          <button id="signupBtn" style="width:100%;padding:8px;margin-top:6px">Create account</button>
        </div>
        <hr/>
        <div id="loginForm">
          <input id="loginEmail" placeholder="Email" style="width:100%;margin:6px 0;padding:8px"/>
          <input id="loginPassword" placeholder="Password" type="password" style="width:100%;margin:6px 0;padding:8px"/>
          <button id="loginBtn" style="width:100%;padding:8px;margin-top:6px">Login</button>
        </div>
      </div>
      <p id="authMsg" style="color:green"></p>
    </div>
  `;
  document.body.appendChild(modal);

  // handlers
  qs("#closeAuth").addEventListener("click", () => modal.remove());

  qs("#signupBtn").addEventListener("click", () => {
    const name = qs("#signupName").value.trim();
    const email = qs("#signupEmail").value.trim().toLowerCase();
    const password = qs("#signupPassword").value;
    if(!name || !email || !password){ alert("Complete all fields."); return; }
    // save as simple single-user local account
    localStorage.setItem("sm_user", JSON.stringify({ name, email, password }));
    qs("#authMsg").textContent = `Account created. Welcome, ${name}!`;
    setTimeout(()=>modal.remove(), 900);
    refreshAuthUI();
  });

  qs("#loginBtn").addEventListener("click", () => {
    const email = qs("#loginEmail").value.trim().toLowerCase();
    const password = qs("#loginPassword").value;
    const saved = JSON.parse(localStorage.getItem("sm_user") || "null");
    if(!saved || saved.email !== email || saved.password !== password){
      alert("Invalid credentials.");
      return;
    }
    qs("#authMsg").textContent = `Logged in. Welcome back, ${saved.name}!`;
    setTimeout(()=>modal.remove(), 700);
    refreshAuthUI();
  });
}

function refreshAuthUI(){
  const user = JSON.parse(localStorage.getItem("sm_user") || "null");
  const header = qs(".header");
  // show greeting next to nav if not present
  if(user && !qs("#userGreeting")){
    const a = document.createElement("div");
    a.id = "userGreeting";
    a.style = "margin-left:12px; font-weight:600;";
    a.innerHTML = `Hi, ${user.name} <button id="logoutBtn" style="margin-left:8px;padding:4px 8px;border-radius:6px;border:none;cursor:pointer">Logout</button>`;
    header.appendChild(a);
    qs("#logoutBtn").addEventListener("click", () => {
      localStorage.removeItem("sm_user");
      qs("#userGreeting").remove();
      alert("Logged out.");
    });
  }
}

/* Show auth UI if not signed in */
if(!localStorage.getItem("sm_user")){
  // Add a small sign up / login link near header nav
  const nav = qs(".nav-links");
  const authLink = document.createElement("a");
  authLink.href = "#";
  authLink.id = "authLink";
  authLink.textContent = "Account";
  authLink.style = "margin-left:12px;";
  nav.appendChild(authLink);
  authLink.addEventListener("click", (e) => { e.preventDefault(); createAuthUI(); });
} else {
  refreshAuthUI();
}

/* ---------- Product ratings & comments ---------- */
/* We'll add a ratings box and comments for each product and persist in localStorage */
function setupRatingsAndComments(){
  const products = qsa(".product");
  products.forEach((prod, idx) => {
    const name = prod.querySelector("h3").textContent.trim();
    prod.dataset.productName = name;

    // Create rating stars container
    const ratingWrap = document.createElement("div");
    ratingWrap.className = "rating-wrap";
    ratingWrap.style = "margin-top:6px; display:flex; align-items:center; gap:8px;";

    const stars = document.createElement("div");
    stars.className = "stars";
    // create 5 star buttons (★)
    for(let i=1;i<=5;i++){
      const star = document.createElement("button");
      star.type = "button";
      star.className = "star";
      star.dataset.value = i;
      star.style = "border:none;background:transparent;font-size:18px;cursor:pointer;padding:0 2px;";
      star.textContent = "☆";
      stars.appendChild(star);
    }
    ratingWrap.appendChild(stars);

    // show average rating text
    const avgText = document.createElement("span");
    avgText.className = "avg-rating";
    avgText.style = "font-size:13px;color:#333;";
    ratingWrap.appendChild(avgText);

    // comments UI
    const commentWrap = document.createElement("div");
    commentWrap.className = "comment-wrap";
    commentWrap.style = "margin-top:6px;";
    commentWrap.innerHTML = `
      <input class="comment-input" placeholder="Write a review..." style="width:70%;padding:6px"/>
      <button class="comment-btn" style="padding:6px 8px;margin-left:6px">Post</button>
      <div class="comments-list" style="margin-top:6px;font-size:13px;"></div>
    `;

    prod.appendChild(ratingWrap);
    prod.appendChild(commentWrap);

    // Load saved data
    renderRatingsAndComments(name);
  });

  // event delegation for stars and comments
  document.body.addEventListener("click", (e) => {
    if(e.target.classList.contains("star")){
      const prod = e.target.closest(".product");
      const productName = prod.dataset.productName;
      const ratingValue = Number(e.target.dataset.value);
      saveRating(productName, ratingValue);
      renderRatingsAndComments(productName);
    }

    if(e.target.classList.contains("comment-btn")){
      const prod = e.target.closest(".product");
      const productName = prod.dataset.productName;
      const input = prod.querySelector(".comment-input");
      const text = input.value.trim();
      const user = JSON.parse(localStorage.getItem("sm_user") || "null");
      if(!user){ alert("Please sign up / login to post a review."); createAuthUI(); return; }
      if(!text){ alert("Write something to post."); return; }
      saveComment(productName, { name: user.name, text, time: Date.now() });
      input.value = "";
      renderRatingsAndComments(productName);
    }
  });
}

function ratingsKey(productName){ return `sm_ratings_${productName}`; }
function commentsKey(productName){ return `sm_comments_${productName}`; }

function saveRating(productName, rating){
  const key = ratingsKey(productName);
  const arr = JSON.parse(localStorage.getItem(key) || "[]");
  arr.push({ rating, time: Date.now() });
  localStorage.setItem(key, JSON.stringify(arr));
}
function saveComment(productName, comment){ // comment: {name,text,time}
  const key = commentsKey(productName);
  const arr = JSON.parse(localStorage.getItem(key) || "[]");
  arr.unshift(comment); // newest first
  localStorage.setItem(key, JSON.stringify(arr));
}

function calcAvgRating(arr){
  if(!arr || arr.length===0) return 0;
  const s = arr.reduce((a,b)=>a+b.rating,0);
  return (s/arr.length);
}

function renderRatingsAndComments(productNameOrElement){
  let prodEl;
  if(typeof productNameOrElement === "string"){
    prodEl = qsa(".product").find(p => p.dataset.productName === productNameOrElement);
  } else {
    prodEl = productNameOrElement;
  }
  if(!prodEl) return;
  const name = prodEl.dataset.productName;
  const ratingArr = JSON.parse(localStorage.getItem(ratingsKey(name)) || "[]");
  const commentsArr = JSON.parse(localStorage.getItem(commentsKey(name)) || "[]");

  // update stars
  const stars = prodEl.querySelectorAll(".star");
  const avg = calcAvgRating(ratingArr);
  stars.forEach(s => {
    s.textContent = (Number(s.dataset.value) <= Math.round(avg)) ? "★" : "☆";
  });
  prodEl.querySelector(".avg-rating").textContent = ratingArr.length ? `${avg.toFixed(1)} (${ratingArr.length})` : `No ratings`;

  // comments
  const commentsList = prodEl.querySelector(".comments-list");
  commentsList.innerHTML = commentsArr.map(c => `<div style="padding:6px 0;border-bottom:1px solid #f1f1f1"><strong>${escapeHtml(c.name)}</strong><div style="font-size:13px">${escapeHtml(c.text)}</div></div>`).join("");
}

/* Simple escape to avoid injection from reviews (we are using localStorage) */
function escapeHtml(s){
  return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

/* ---------- CART (Add to cart, update, remove) ---------- */
productButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const productDiv = btn.parentElement;
    const name = productDiv.querySelector("h3").textContent;
    const price = parseFloat(productDiv.querySelector("p").textContent.replace('₵','').trim()) || 0;
    const existing = cart.find(i => i.name === name);
    if(existing){
      existing.qty += 1;
    } else {
      cart.push({ name, price, qty: 1 });
    }
    updateCart();
  });
});

function updateCart(){
  cartItemsDiv.innerHTML = "";
  let subtotal = 0;
  if(cart.length === 0){
    cartItemsDiv.innerHTML = "<p>Your cart is empty.</p>";
  } else {
    cart.forEach(item => {
      subtotal += item.price * item.qty;
      const div = document.createElement("div");
      div.className = "cart-item-row";
      div.style = "display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px dashed #eee";
      div.innerHTML = `
        <div style="flex:1">
          <strong>${escapeHtml(item.name)}</strong><br/>
          ₵${item.price.toFixed(2)} x ${item.qty}
        </div>
        <div style="display:flex;gap:6px;align-items:center">
          <button class="decrease" data-name="${escapeHtml(item.name)}" style="padding:4px 8px">-</button>
          <button class="increase" data-name="${escapeHtml(item.name)}" style="padding:4px 8px">+</button>
          <button class="remove" data-name="${escapeHtml(item.name)}" style="padding:4px 8px">Remove</button>
        </div>
      `;
      cartItemsDiv.appendChild(div);
    });
  }

  // delivery info element (show current delivery fee)
  const deliveryDiv = document.createElement("div");
  deliveryDiv.className = "delivery-fee";
  deliveryDiv.style = "padding:8px 0; font-weight:600";
  deliveryDiv.textContent = `Delivery (Speedaf): ₵${deliveryFee.toFixed(2)}`;
  cartItemsDiv.appendChild(deliveryDiv);

  const total = subtotal + deliveryFee;
  cartCount.textContent = cart.reduce((s,i)=>s+i.qty,0);
  cartTotalSpan.textContent = total.toFixed(2);

  // attach listeners for +/-/remove
  cartItemsDiv.querySelectorAll(".decrease").forEach(btn => {
    btn.addEventListener("click", () => {
      const name = btn.dataset.name;
      const item = cart.find(i => i.name === name);
      if(!item) return;
      item.qty = Math.max(0, item.qty - 1);
      if(item.qty === 0) cart = cart.filter(i => i.name !== name);
      updateCart();
    });
  });
  cartItemsDiv.querySelectorAll(".increase").forEach(btn => {
    btn.addEventListener("click", () => {
      const name = btn.dataset.name;
      const item = cart.find(i => i.name === name);
      if(!item) return;
      item.qty += 1;
      updateCart();
    });
  });
  cartItemsDiv.querySelectorAll(".remove").forEach(btn => {
    btn.addEventListener("click", () => {
      const name = btn.dataset.name;
      cart = cart.filter(i => i.name !== name);
      updateCart();
    });
  });
}

/* ---------- Show / hide cart ---------- */
qs("#cart-button").addEventListener("click", () => {
  cartPopup.style.display = "block";
  updateCart();
});
closeCartBtn.addEventListener("click", () => {
  cartPopup.style.display = "none";
});

/* ---------- Delivery calculation ---------- */
/* Re-evaluate delivery fee when address input changes or at checkout */
function evaluateDeliveryFeeFromAddress(addr){
  if(!addr) return DELIVERY_DEFAULT;
  const lower = addr.toLowerCase();
  if(lower.includes("ucc") || lower.includes("university of cape coast") || lower.includes("university of capecoast")){
    return 0;
  }
  return DELIVERY_DEFAULT;
}

customerAddressInput.addEventListener("blur", () => {
  const addr = customerAddressInput.value || "";
  deliveryFee = evaluateDeliveryFeeFromAddress(addr);
  updateCart();
});

/* Also evaluate when name/phone changes (optional) */
customerNameInput.addEventListener("change", () => updateCart());
customerPhoneInput.addEventListener("change", () => updateCart());

/* ---------- CHECKOUT & Paystack ---------- */
checkoutBtn.addEventListener("click", () => {
  if(cart.length === 0){
    alert("Your cart is empty!");
    return;
  }

  // Validate customer details
  const name = (customerNameInput.value || "").trim();
  const phone = (customerPhoneInput.value || "").trim();
  const address = (customerAddressInput.value || "").trim();

  if(!name || !phone || !address){
    alert("Please enter your name, phone and delivery address in the Delivery Details section.");
    return;
  }

  // re-evaluate delivery (in case user pressed checkout before leaving address input)
  deliveryFee = evaluateDeliveryFeeFromAddress(address);
  updateCart();

  // Fill order summary for confirmation
  const lines = [];
  lines.push(`Name: ${name}`);
  lines.push(`Phone: ${phone}`);
  lines.push(`Address: ${address}`);
  lines.push("");
  lines.push("Items:");
  cart.forEach(it => lines.push(`${it.name} — ₵${it.price.toFixed(2)} x ${it.qty} = ₵${(it.price*it.qty).toFixed(2)}`));
  const subtotal = cart.reduce((s,i)=>s + i.price*i.qty, 0);
  lines.push("");
  lines.push(`Subtotal: ₵${subtotal.toFixed(2)}`);
  lines.push(`Delivery: ₵${deliveryFee.toFixed(2)}`);
  const total = subtotal + deliveryFee;
  lines.push(`Total: ₵${total.toFixed(2)}`);

  orderSummaryText.textContent = lines.join("\n");
  orderSummary.style.display = "block";
});

/* Confirm payment (OK) and call Paystack */
confirmPaymentBtn.addEventListener("click", () => {
  // Ensure user details exist
  const name = (customerNameInput.value || "").trim();
  const phone = (customerPhoneInput.value || "").trim();
  const address = (customerAddressInput.value || "").trim();
  if(!name || !phone || !address){ alert("Missing delivery details."); return; }

  const subtotal = cart.reduce((s,i)=>s + i.price*i.qty, 0);
  const totalGhs = subtotal + deliveryFee;
  const totalKobo = Math.round(totalGhs * 100);

  // optionally set email from signed in user
  const user = JSON.parse(localStorage.getItem("sm_user") || "null");
  const email = user ? (user.email || "customer@example.com") : "customer@example.com";

  // Launch Paystack
  const handler = PaystackPop.setup({
    key: 'pk_live_640af38072f48339462a8937bed12dda2774a34d', // your live public key
    email: email,
    amount: totalKobo,
    currency: "GHS",
    metadata: {
      custom_fields: [
        { display_name: "Customer Name", variable_name: "customer_name", value: name },
        { display_name: "Customer Phone", variable_name: "customer_phone", value: phone },
        { display_name: "Delivery Address", variable_name: "delivery_address", value: address }
      ]
    },
    onClose: function(){
      alert('Payment cancelled.');
    },
    callback: function(response){
      // Payment success
      alert('Payment successful! Reference: ' + response.reference);
      // Save order summary locally if desired
      const orders = JSON.parse(localStorage.getItem("sm_orders") || "[]");
      orders.unshift({
        reference: response.reference,
        name, phone, address,
        items: cart,
        deliveryFee,
        totalGhs,
        time: Date.now()
      });
      localStorage.setItem("sm_orders", JSON.stringify(orders));
      // clear cart, reset delivery to default
      cart = [];
      deliveryFee = DELIVERY_DEFAULT;
      updateCart();
      orderSummary.style.display = "none";
      cartPopup.style.display = "none";
    }
  });

  handler.openIframe();
});

/* Hide order summary if user closes it (no explicit close button in HTML; clicking outside) */
document.addEventListener("click", (e) => {
  if(orderSummary.style.display === "block" && !orderSummary.contains(e.target) && !qs("#checkoutBtn").contains(e.target)){
    //dont auto hide if clicking inside cart popup
  }
});

/* ---------- SEARCH ---------- */
function searchProducts(){
  const filter = (searchInput.value || "").toLowerCase();
  qsa(".product").forEach(product => {
    const name = product.querySelector("h3").textContent.toLowerCase();
    product.style.display = name.includes(filter) ? "block" : "none";
  });
}
searchInput.addEventListener("keyup", searchProducts);
if(searchIcon) searchIcon.addEventListener("click", searchProducts);

/* ---------- Welcome banner (small visual) ---------- */
/* Inserted at top of page if not present */
function ensureWelcomeBanner(){
  if(qs(".welcome-banner")) return;
  const banner = document.createElement("div");
  banner.className = "welcome-banner";
  banner.style = "background:linear-gradient(90deg,#ffb6c1,#ff69b4);color:#fff;text-align:center;padding:12px 8px;font-weight:700;position:relative;";
  banner.innerHTML = `💋 Welcome to <strong>Stephy Mystique</strong> — Your Beauty, Your Glow!`;
  const body = document.body;
  body.insertBefore(banner, body.firstChild);
}
ensureWelcomeBanner();

/* ---------- Initialise ---------- */
setupRatingsAndComments();
updateCart();
refreshAuthUI();

/* ---------- End of script.js ---------- */
