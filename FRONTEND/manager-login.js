function loginManager() {
  const email = document.getElementById("manager-email").value;
  const password = document.getElementById("manager-password").value;
  const errorMsg = document.getElementById("manager-error");

  fetch("http://localhost:3000/api/v1/manager/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  })
    .then(res => res.json())
    .then(data => {
      if (data.user && data.user.role === "manager") {
        localStorage.setItem("userRole", "manager");
        window.location.href = "manager-dashboard.html";
      } else {
        errorMsg.textContent = data.message || "Login failed";
      }
    })
    .catch(err => {
      errorMsg.textContent = "Server error";
      console.error(err);
    });
}
