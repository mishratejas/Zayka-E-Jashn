document.addEventListener('DOMContentLoaded', function () {
  // Notification bell
  const notificationBell = document.querySelector('.notification-bell');
  if (notificationBell) {
    notificationBell.addEventListener('click', function () {
      alert('You have 3 new notifications:\n1. New order #ORD-7842\n2. Inventory low on Basmati Rice\n3. Customer review received');
    });
  }

  const token = localStorage.getItem("chefAccessToken");
  if (!token) {
    alert("Please login first to access your dashboard.");
    window.location.href = "chef-login.html";
    return;
  }
  // Fetch and render orders
  fetchOrders();
  setInterval(fetchOrders, 10000);
  function fetchOrders() {
    const token = localStorage.getItem("chefAccessToken");
    //console.log("Using token:", token);
    if(!token){
      console.warn("No access token found.")
      return;
    }
    fetch("http://localhost:3000/api/v1/orders",{
      method:"GET",
      headers:{
        "Authorization":`Bearer ${token}`
      }
    })
    .then(async res =>{
      if(!res.ok){
        const errorData = await res.json();
        throw new Error(errorData.message || `API Error: ${res.status}`);
      }
      return res.json();
    })
    .then(data =>{
      console.log("Fetched orders:", data);
      const tbody = document.getElementById("orderBody");
      tbody.innerHTML = "";

      data.orders.forEach(order =>{
        const row = document.createElement("tr");
        row.setAttribute("data-id",order._id);

        row.innerHTML = `
          <td>
          <div style="display: flex; align-items: center; gap: 10px;">
          <div class="letter-avatar">${(order.customerName || "U")[0]}</div>
          <span>${order.customerName || "Unknown"}</span>
          </div>
          </td>
          <td>${order.customerName || "Unknown"}</td>
          <td>${order.item.map(item => `${item.name} (${item.quantity})`).join(", ")}</td>
          <td>${order.details?.note || "-"}</td>
          <td><span class="status ${order.status.toLowerCase()}">${capitalize(order.status)}</span></td>
          <td><button class="btn btn-primary">${getActionLabel(order.status)}</button></td>
        `;
        tbody.appendChild(row);
      });

      attachButtonHandlers();
    })
    .catch(error => {
      console.error("API Fetch error:",error.message);
    });
  }
  function attachButtonHandlers() {
    const buttons = document.querySelectorAll('.btn-primary');
    buttons.forEach(button => {
      button.addEventListener('click', async function () {
        const action = this.textContent.trim();
        const orderRow = this.closest('tr');
        const orderId = orderRow.getAttribute("data-id");

        let newStatus = "";
        if (action === "Start Prep") newStatus = "preparing";
        else if (action === "Mark Ready") newStatus = "ready";
        else if (action === "Dispatch") newStatus = "completed";
        else return;

        try {
          const response = await fetch(`http://localhost:3000/api/v1/orders/${orderId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json",
              "Authorization":`Bearer ${localStorage.getItem("chefAccessToken")}`
             },
            body: JSON.stringify({ status: newStatus })
          });

          const result = await response.json();
          if (!result.success) throw new Error(result.message);

          if (newStatus === "completed") {
            orderRow.remove(); // Order is done
          } else {
            const statusSpan = orderRow.querySelector(".status");
            statusSpan.className = `status ${newStatus}`;
            statusSpan.textContent = capitalize(newStatus);
            this.textContent = getActionLabel(newStatus);
          }
        } catch (error) {
          console.error("Error updating status:", error);
          alert("Failed to update status. Please try again.");
        }
      });
    });
  }

  function getActionLabel(status) {
    const s = status.toLowerCase();
    if (s === "pending") return "Start Prep";
    if (s === "preparing") return "Mark Ready";
    if (s === "ready") return "Dispatch";
    return "Start Prep";
  }

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
});
