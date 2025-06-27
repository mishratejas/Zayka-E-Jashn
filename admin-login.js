function loginAdmin() {
  const email = document.getElementById("admin-email").value;
  const password = document.getElementById("admin-password").value;
  const errorMsg = document.getElementById("admin-error");

  fetch("http://localhost:3000/api/v1/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  })
    .then(res => res.json())
    .then(data => {
      if (data.user && data.user.role === "admin") {
        localStorage.setItem("userRole", "admin");
        window.location.href = "admin-dashboard.html";
      } else {
        errorMsg.textContent = data.message || "Login failed";
      }
    })
    .catch(err => {
      errorMsg.textContent = "Server error";
      console.error(err);
    });
}
