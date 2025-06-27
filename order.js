document.addEventListener('DOMContentLoaded', () => {
  const cart = JSON.parse(localStorage.getItem('orderCart')) || [];
  const subtotal = +localStorage.getItem('orderSubtotal') || 0;

  const orderItems = document.getElementById('orderItems');
  cart.forEach(item => {
    const div = document.createElement('div');
    div.className = 'order-item';
    div.innerHTML = `
      <img src="${item.image}" alt="${item.name}">
      <div>
        <h3>${item.name}</h3>
        <p>₹${item.price}</p>
      </div>`;
    orderItems.appendChild(div);
  });

  const tax = +(subtotal * 0.05).toFixed(2);
  document.getElementById('subtotal').textContent = `₹${subtotal}`;
  document.getElementById('tax').textContent = `₹${tax}`;
  document.getElementById('totalCost').textContent = `₹${subtotal + tax}`;

  const steps = Array.from(document.querySelectorAll('.step'));
  const tabs = document.querySelectorAll('.tab-btn');
  let currentStep = 1;

  function gotoStep(stepIndex) {
    steps.forEach((s, i) => {
      s.classList.toggle('active', i < stepIndex);
    });

    const indicator = document.getElementById('stepIndicator');
    if (indicator) {
      indicator.style.left = `${(stepIndex - 1) * 33.33}%`;
    }

    // Optional: scroll to top of section for better UX
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function showTab(tabName) {
    document.querySelectorAll('.details-section').forEach(sec => {
      sec.classList.toggle('active', sec.id.startsWith(tabName));
    });
    tabs.forEach(b => b.classList.toggle('active', b.dataset.tab === tabName));
  }

  tabs.forEach(btn =>
    btn.addEventListener('click', () => {
      showTab(btn.dataset.tab);
      gotoStep(2);
      currentStep = 2;
    })
  );

  document.getElementById('placeOrderBtn').addEventListener('click', () => {
    if (currentStep === 1) {
      gotoStep(2);
      currentStep = 2;
    } else if (currentStep === 2) {
      gotoStep(3);
      currentStep = 3;
    } else {
      finalizeOrder(cart, subtotal, tax);
    }
  });

  document.getElementById('backToMenuBtn').addEventListener('click', () => {
    window.location.href = 'menu.html';
  });
});

async function finalizeOrder(cart, subtotal, tax) {
  const orderType = document.querySelector('.tab-btn.active')?.dataset.tab || "onTable";
  let details = {};

  if (orderType === "onTable") {
    details = {
      tableNumber: document.getElementById('tableNumber').value
    };
  } else if (orderType === "delivery") {
    details = {
      name: document.getElementById('custName').value,
      phone: document.getElementById('custPhone').value,
      address: document.getElementById('manualAddress').value
    };
  } else if (orderType === "train") {
    details = {
      trainNumber: document.getElementById('trainNumber').value,
      trainDate: document.getElementById('trainDate').value,
      stationName: document.getElementById('stationName').value,
      platformNumber: document.getElementById('platformNumber').value,
      coachPosition: document.getElementById('coachPosition').value
    };
  }

  const payload = {
    item: cart,
    subtotal,
    tax,
    total: subtotal + tax,
    type: orderType,
    details
  };

  try {
    const res = await axios.post('http://localhost:3000/api/v1/orders', payload);
    if (res.data.success) {
      alert('Order placed successfully!');
      localStorage.removeItem('orderCart');
      localStorage.removeItem('orderSubtotal');
      window.location.href = 'menu.html';
    }
  } catch (e) {
    console.error("Order Error:", e.response?.data || e.message);
    alert('Failed to place order. Try again.');
  }
}
