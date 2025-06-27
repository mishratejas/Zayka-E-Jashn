const menuData = [
  {
    itemId: "1",
    name: "Paneer Tikka",
    price: 120,
    category: "veg",
    image: "IMAGES/paneer.jpg"
  },
  {
    itemId: "2",
    name: "Chicken Kebab",
    price: 180,
    category: "nonveg",
    image: "IMAGES/chickenkebab.jpg"
  },
  {
    itemId: "3",
    name: "Margherita Pizza",
    price: 250,
    category: "italian",
    image: "IMAGES/pizza.jpg"
  },
  {
    itemId: "4",
    name: "Cold Coffee",
    price: 130,
    category: "beverages",
    image: "IMAGES/cold coffe.jpeg"
  },
  {
    itemId: "5",
    name: "Raj Kachori",
    price: 100,
    category: "veg",
    image: "IMAGES/dish1.jpg"
  },
  {
    itemId: "6",
    name: "Kadhai Paneer",
    price: 130,
    category: "veg",
    image: "IMAGES/dish4.jpg"
  },
  {
    itemId: "7",
    name: "Mango Lassi",
    price: 60,
    category: "beverages",
    image: "IMAGES/mango.jpg"
  },
  {
    itemId: "8",
    name: "Gulab Jamun",
    price: 90,
    category: "desserts",
    image: "IMAGES/gulab.jpg"
  },
  {
    itemId: "9",
    name: "Burger",
    price: 90,
    category: "veg",
    image: "IMAGES/burger.jpg"
  },
  {
    itemId: "10",
    name: "Tea",
    price: 25,
    category: "beverages",
    image: "IMAGES/tea.jpeg"
  },
  {
    itemId: "11",
    name: "Pastries",
    price: 60,
    category: "desserts",
    image: "IMAGES/pastry.jpeg"
  },
  {
    itemId: "12",
    name: "Hyderabadi Biryani",
    price: 250,
    category: "nonveg",
    image: "IMAGES/dish3.jpg"
  }
];

function fetchMenu() {
  return new Promise((resolve) => {
    setTimeout(() => resolve(menuData), 200);
  });
}

let totalAmount = 0;
let cart = [];
let allMenu = [];
let currentCategory = "all";

async function init() {
  allMenu = await fetchMenu();
  loadMenu("all");
}

function showCategory(cat) {
  currentCategory = cat;
  loadMenu(cat);
  document.querySelectorAll('.category-btn').forEach(btn => {
    btn.classList.toggle('active', btn.textContent.toLowerCase() === cat);
  });
}

function loadMenu(category = "all") {
  const menu = document.getElementById("menuContainer");
  menu.innerHTML = "";
  const filtered = category === "all"
    ? allMenu
    : allMenu.filter(item => item.category === category);
    
  filtered.forEach(item => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${item.image}" alt="${item.name}" />
      <h3>${item.name}</h3>
      <p>₹${item.price}</p>
      <button onclick='addToCart(${JSON.stringify(item)})'>Order Now</button>
    `;
    menu.appendChild(card);
  });

  if (filtered.length === 0) {
    menu.innerHTML = "<p>No items available in this category.</p>";
  }
}
function addToCart(item) {
  const cartItem = {
    itemId: item.itemId,
    name: item.name,
    price: item.price,
    image: item.image,
    quantity: 1
  };
  cart.push(cartItem);
  updateCartCount();
  showCartPopup(); // <-- This triggers the popup
}

function showCartPopup() {
  const popup = document.getElementById('cartPopup');
  popup.classList.remove('hidden');
  popup.classList.add('show');

  setTimeout(() => {
    popup.classList.remove('show');
    setTimeout(() => popup.classList.add('hidden'), 300);
  }, 1000);
}

function updateCartCount() {
  document.getElementById("cart-count").textContent = cart.length;
  updateCartList();
}

function toggleCart() {
  const panel = document.getElementById("cartPanel");
  panel.style.display = panel.style.display === "block" ? "none" : "block";
}
function updateCartList() {
  const cartList = document.getElementById("cartList");
  cartList.innerHTML = "";
  totalAmount = 0; // Reset before loop

  cart.forEach((item, i) => {
    totalAmount += item.price;
    const div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
      <img src="${item.image}" alt="${item.name}">
      <span>${item.name} - ₹${item.price}</span>
      <button onclick="removeFromCart(${i})">X</button>
    `;
    cartList.appendChild(div);
  });

  const totalDiv = document.createElement("div");
  totalDiv.id = "totalPrice";
  totalDiv.textContent = `Total: ₹${totalAmount}`;
  cartList.appendChild(totalDiv);
}



function removeFromCart(i) {
  cart.splice(i, 1);
  updateCartCount();
}

function placeOrder() {
  if (cart.length === 0) {
    alert("Your cart is empty!");
    return;
  }

  // Calculate total amount
  const totalAmount = cart.reduce((sum, item) => sum + item.price, 0);

  // Store cart and total in localStorage
  localStorage.setItem("orderCart", JSON.stringify(cart));
  localStorage.setItem("orderSubtotal", totalAmount.toString());
 document.querySelector(".order-btn").classList.add("glow");

setTimeout(() => {
  document.querySelector(".order-btn").classList.remove("glow");
}, 1000); // glow for 1 sec

  // Redirect to order page
  window.location.href = "order.html";
}

// Initialize on page load
init();
const PEXELS_API_KEY = "yhhydt6vs8Kubu3dXAnnUoKjqDBL004UFNDDyQ1RsGYHr40LKoSTrrX6";

function searchDish() {
  const query = document.getElementById("searchInput").value.trim();
  if (!query) return alert("Please enter a dish name!");

  fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1`, {
    headers: {
      Authorization: PEXELS_API_KEY
    }
  })
  .then(res => res.json())
  .then(data => {
    if (!data.photos || data.photos.length === 0) {
      alert("No image found!");
      return;
    }

    const imgUrl = data.photos[0].src.medium;
    const randomPrice = Math.floor(Math.random() * 200) + 50;
    const menu = document.getElementById("menuContainer");
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${imgUrl}" alt="${query}" />
      <h3>${query}</h3>
      <p>₹${randomPrice}</p>
      <button onclick='addToCart({ name: "${query}", price: ${randomPrice}, image: "${imgUrl}" })'>Order Now</button>
    `;
    menu.prepend(card);
  })
  .catch(err => {
    console.error(err);
    alert("Error fetching image.");
  });
}
const orderBtn = document.getElementById("orderBtn");
if (orderBtn) {
  orderBtn.addEventListener("click", () => {
    if (cart.length === 0) return alert("Cart is empty!");

    localStorage.setItem("orderCart", JSON.stringify(cart));
    localStorage.setItem("orderTotal", totalAmount);
    window.location.href = "order.html";
  });
}

function clearCart() {
  cart = [];
  updateCartCount();
  toggleCart();
}
