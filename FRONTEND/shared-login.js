document.getElementById('loginForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  const error = document.getElementById('loginError');

  // Get role from parent div attribute
  const role = this.closest('.form-box').getAttribute('data-role');

  if (!email || !password) {
    error.textContent = "Please fill in all fields.";
    return;
  }

  error.textContent = "";

  // You can add real authentication here, below is dummy:
//   alert(`${role.charAt(0).toUpperCase() + role.slice(1)} login successful!`);

  // Example redirect depending on role
  if (role === 'manager') {
    // window.location.href = "manager-dashboard.html";
  } else if (role === 'admin') {
    // window.location.href = "admin-dashboard.html";
  }
});
