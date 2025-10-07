// CART FUNCTIONALITY
const buttons = document.querySelectorAll(".product button");
const cartCount = document.querySelector(".cart-count");
const cartPopup = document.getElementById("cartPopup");
const cartItemsDiv = document.getElementById("cartItems");
const cartTotalSpan = document.getElementById("cartTotal");
const checkoutBtn = document.getElementById("checkoutBtn");
const closeCartBtn = document.getElementById("closeCart");

let cart = [];

buttons.forEach(btn => {
  btn.addEventListener("click", () => {
    const productDiv = btn.parentElement;
    const name = productDiv.querySelector("h3").textContent;
    const price = parseFloat(productDiv.querySelector("p").textContent.replace('₵',''));
    const existing = cart.find(item => item.name === name);

    if(existing) {
      existing.qty += 1;
    } else {
      cart.push({name, price, qty: 1});
    }

    updateCart();
  });
});

function updateCart() {
  cartItemsDiv.innerHTML = '';
  let total = 0;
  cart.forEach(item => {
    total += item.price * item.qty;
    const div = document.createElement('div');
    div.classList.add('cart-item');
    div.innerHTML = `
      ${item.name} - ₵${item.price} x ${item.qty} 
      <button class="remove-btn">Remove</button>
    `;
    cartItemsDiv.appendChild(div);

    div.querySelector('.remove-btn').addEventListener('click', () => {
      item.qty--;
      if(item.qty <= 0){
        cart = cart.filter(i => i.name !== item.name);
      }
      updateCart();
    });
  });
  cartCount.textContent = cart.reduce((sum,item)=>sum+item.qty,0);
  cartTotalSpan.textContent = total.toFixed(2);
}

// Show cart popup
document.querySelector(".cart").addEventListener("click", () => {
  cartPopup.style.display = "block";
});

// Close cart
closeCartBtn.addEventListener("click", () => {
  cartPopup.style.display = "none";
});

// CHECKOUT
const paymentPopup = document.getElementById("paymentPopup");
const closePaymentBtn = document.getElementById("closePayment");

checkoutBtn.addEventListener("click", () => {
  cartPopup.style.display = "none";
  paymentPopup.style.display = "block";
});

closePaymentBtn.addEventListener("click", () => {
  paymentPopup.style.display = "none";
});

// NETWORK POPUP
const networkPopup = document.getElementById("networkPopup");
const networkTitle = document.getElementById("networkTitle");
const networkClose = document.getElementById("networkClose");
const networkConfirm = document.getElementById("networkConfirm");
const networkAmount = document.getElementById("networkAmount");

document.querySelectorAll('.network-btn').forEach(btn => {
  btn.addEventListener("click", () => {
    const network = btn.dataset.network;
    const code = btn.dataset.code;
    networkTitle.textContent = `Pay with ${network}`;
    // Simulate dialing code
    alert(`Dialing ${code}...`);
    networkPopup.style.display = "block";
  });
});

networkClose.addEventListener("click", () => {
  networkPopup.style.display = "none";
});

networkConfirm.addEventListener("click", () => {
  const amount = networkAmount.value;
  if(amount && amount > 0){
    alert(`Payment of ₵${amount} sent to +233553314773. Thank you!`);
    networkPopup.style.display = "none";
    paymentPopup.style.display = "none";
    cart = [];
    updateCart();
  } else {
    alert("Enter a valid amount.");
  }
});

// SEARCH FUNCTIONALITY
const searchInput = document.getElementById("searchInput");
const products = document.querySelectorAll(".product");

function searchProducts() {
  const filter = searchInput.value.toLowerCase();
  products.forEach(product => {
    const name = product.querySelector("h3").textContent.toLowerCase();
    product.style.display = name.includes(filter) ? "block" : "none";
  });
}

searchInput.addEventListener("keyup", searchProducts);
document.querySelector(".search-icon").addEventListener("click", searchProducts);
