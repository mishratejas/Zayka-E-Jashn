
document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("loginBtn");
  const registerBtn = document.getElementById("registerBtn");
  const loginFormBox = document.getElementById("loginFormBox");
  const registerFormBox = document.getElementById("registerFormBox");

  // Toggle Forms
  loginBtn.addEventListener("click", () => {
    loginBtn.classList.add("active");
    registerBtn.classList.remove("active");
    loginFormBox.classList.remove("hidden");
    registerFormBox.classList.add("hidden");
  });

  registerBtn.addEventListener("click", () => {
    registerBtn.classList.add("active");
    loginBtn.classList.remove("active");
    registerFormBox.classList.remove("hidden");
    loginFormBox.classList.add("hidden");
  });

  // Chef Registration Form
  document.getElementById("chefRegisterForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const name = document.getElementById("regName").value.trim();
    const email = document.getElementById("regEmail").value.trim();
    const phone = document.getElementById("regPhone").value.trim();
    const specialization = document.getElementById("regSpecialization").value;
    const experience = document.getElementById("regExperience").value;
    const resume = document.getElementById("regResume").files[0];
    const password = document.getElementById("regPassword").value;
    const confirmPassword = document.getElementById("regConfirmPassword").value;
    const error = document.getElementById("registerError");

    error.textContent = "";

    if (!name || !email || !phone || !specialization || !experience || !resume || !password || !confirmPassword) {
      error.textContent = "All fields are required.";
      return;
    }
    if (!validateEmail(email)) {
      error.textContent = "Invalid email format.";
      return;
    }
    if (password !== confirmPassword || password.length < 6) {
      error.textContent = "Passwords do not match or are too short.";
      return;
    }

    showLoader("Registering...");

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("phone", phone);
      formData.append("specialization", specialization);
      formData.append("experience", experience);
      formData.append("resume", resume);
      formData.append("password", password);

      const res = await fetch("http://localhost:3000/api/v1/chefs/register", {
        method: "POST",
        body: formData
      });

      const data = await res.json();
      hideLoader();

      if (res.ok) {
        alert("Chef registered successfully!");
        document.getElementById("loginEmail").value = email;
        document.getElementById("loginPassword").value = password;
        loginBtn.click(); // Switch to login form
      } else {
        error.textContent = data.message || "Registration failed.";
      }
    } catch (err) {
      hideLoader();
      console.error("Registration error:", err);
      error.textContent = "Server error during registration.";
    }
  });

  // Chef Login Form
  document.getElementById("chefLoginForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;
    const error = document.getElementById("loginError");

    error.textContent = "";

    if (!validateEmail(email)) {
      error.textContent = "Enter valid email.";
      return;
    }
    if (password.length < 6) {
      error.textContent = "Password too short.";
      return;
    }

    showLoader("Logging in...");

    try {
      const res = await fetch("http://localhost:3000/api/v1/chefs/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      hideLoader();

      if (res.ok) {
        console.log("Login response",data);
        localStorage.setItem("chefAccessToken", data.accessToken);
        localStorage.setItem("chefProfile", JSON.stringify(data.chef));
        window.location.href = "chef-dashboard.html";
      } else {
        error.textContent = data.message || "Login failed.";
      }
    } catch (err) {
      hideLoader();
      console.error("Login error:", err);
      error.textContent = "Server error during login.";
    }
  });

  // Helper Functions
  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function showLoader(text) {
    const loader = document.createElement("div");
    loader.id = "preloader";
    loader.innerHTML = `<div class="loader"></div><p style="color:white; margin-top:10px;">${text}</p>`;
    loader.style.cssText = `
      position: fixed; top: 0; left: 0;
      width: 100%; height: 100%;
      background: rgba(0, 0, 0, 0.9);
      display: flex; flex-direction: column;
      justify-content: center; align-items: center;
      z-index: 9999;
    `;
    document.body.appendChild(loader);

    const style = document.createElement("style");
    style.textContent = `@keyframes spin {0%{transform:rotate(0)}100%{transform:rotate(360deg)}}`;
    document.head.appendChild(style);

    loader.querySelector(".loader").style.cssText = `
      border: 6px solid #f3f3f3;
      border-top: 6px solid #f39c12;
      border-radius: 50%;
      width: 60px; height: 60px;
      animation: spin 1s linear infinite;
    `;
  }

  function hideLoader() {
    const loader = document.getElementById("preloader");
    if (loader) loader.remove();
  }
});
