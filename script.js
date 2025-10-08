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

// Show cart popup using button
document.getElementById("cart-button").addEventListener("click", () => {
  cartPopup.style.display = "block";
});

// Close cart
closeCartBtn.addEventListener("click", () => {
  cartPopup.style.display = "none";
});

// CHECKOUT - Paystack Integration
checkoutBtn.addEventListener("click", () => {
  const amount = Math.round(cart.reduce((sum,item)=>sum+item.price*item.qty,0) * 100); // amount in kobo
  if(amount <= 0){
    alert("Your cart is empty!");
    return;
  }

  const handler = PaystackPop.setup({
    key: 'pk_live_640af38072f48339462a8937bed12dda2774a34d', // your live public key
    email: 'customer@example.com', // replace with dynamic email if needed
    amount: amount,
    currency: "GHS",
    onClose: function(){
      alert('Payment cancelled.');
    },
    callback: function(response){
      alert('Payment successful! Transaction reference: ' + response.reference);
      cart = [];
      updateCart();
      cartPopup.style.display = "none";
    }
  });

  handler.openIframe();
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
