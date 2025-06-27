// Elements for toggling forms
const loginBtn = document.getElementById('login-btn');
const signupBtn = document.getElementById('signup-btn');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');

loginBtn.addEventListener('click', () => {
  loginBtn.classList.add('active');
  signupBtn.classList.remove('active');
  loginForm.classList.add('active');
  signupForm.classList.remove('active');
  clearErrors();
});

signupBtn.addEventListener('click', () => {
  signupBtn.classList.add('active');
  loginBtn.classList.remove('active');
  signupForm.classList.add('active');
  loginForm.classList.remove('active');
  clearErrors();
});

function clearErrors() {
  document.getElementById('login-error').textContent = '';
  document.getElementById('signup-error').textContent = '';
}

// LOGIN FORM SUBMISSION
loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
    
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value.trim();
  const errorMsg = document.getElementById('login-error');

  if(!validateEmail(email)){
    errorMsg.textContent = "Please enter a valid email address.";
    return;
  }
  if(password.length<6){
    errorMsg.textContent = "Password must be atleast 6 characters.";
    return;
  }

  errorMsg.textContent = '';
  showLoader("Logging in....");
  fetch("http://localhost:3000/api/v1/users/login",{
    method:"POST",
    headers:{
      "Content-Type":"application/json"
    },
    body: JSON.stringify({email,password})
  })
  .then(response => response.json())
  .then(data => {
    if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user)); // ✅ Store user info
        window.location.href = "customer-home.html";
    } else {
        alert("Login failed");
    }
})
    .catch((error)=>{
      hideLoader();
      errorMsg.textContent = "Network error. Please try again.";
      console.error("Login error",error);
    });
  },1000);


// SIGNUP FORM SUBMISSION
signupForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const name = document.getElementById('signup-name').value.trim();
  const email = document.getElementById('signup-email').value.trim();
  const phone = document.getElementById('signup-phone').value.trim();
  const password = document.getElementById('signup-password').value.trim();
  const confirmPassword = document.getElementById('signup-confirm-password').value.trim();
  const errorMsg = document.getElementById('signup-error');

  if (name.length < 2) {
    errorMsg.textContent = "Please enter your full name.";
    return;
  }
  if (!validateEmail(email)) {
    errorMsg.textContent = "Please enter a valid email address.";
    return;
  }
  if (!/^\d{10}$/.test(phone)) {
    errorMsg.textContent = "Please enter a valid 10-digit phone number.";
    return;
  }
  if (password.length < 6) {
    errorMsg.textContent = "Password must be at least 6 characters.";
    return;
  }
  if (password !== confirmPassword) {
    errorMsg.textContent = "Passwords do not match.";
    return;
  }

  errorMsg.textContent = '';
  showLoader("Creating account...");

    fetch("http://localhost:3000/api/v1/users/register",{
      method:"POST",
      headers:{
        "Content-Type":"application/json",
      },
      body: JSON.stringify({
        name,
        email,
        phone,
        password,
      }),
    })
    .then(async(response)=>{
      const data=await response.json();
      hideLoader();

      if(!response.ok){
        errorMsg.textContent = data.message || "Registration failed.";
        return;
      }

      alert("Account created successfully! You can now login.");
      loginBtn.click();
      signupForm.reset();
    })
    .catch((error)=>{
      hideLoader();
      errorMsg.textContent="Network error. Please try again.";
      console.error("Error during registration:",error);
    })
});


// Email validation function
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Loader show/hide
function showLoader(text) {
  let loader = document.createElement('div');
  loader.id = 'preloader';
  loader.innerHTML = `
    <div class="loader"></div>
    <div id="loader-text">${text}</div>
  `;
  document.body.appendChild(loader);

  if (!document.getElementById('loader-style')) {
    const style = document.createElement('style');
    style.id = 'loader-style';
    style.innerHTML = `
      #preloader {
        position: fixed;
        top: 0; left: 0;
        width: 100vw; height: 100vh;
        background: url('IMAGES/Hero1.jpg') no-repeat center center/cover;
        background-color: rgba(0,0,0,0.75);
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        gap: 15px;
        z-index: 9999;
      }
      .loader {
        border: 6px solid #f3f3f3;
        border-top: 6px solid #f39c12;
        border-radius: 50%;
        width: 60px;
        height: 60px;
        animation: spin 1s linear infinite;
      }
      #loader-text {
        color: #f39c12;
        font-weight: 600;
        font-size: 1.2rem;
        user-select: none;
      }
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }
}

function hideLoader() {
  const loader = document.getElementById('preloader');
  if(loader) loader.remove();
}

window.onload = function () {
  google.accounts.id.initialize({
    client_id: "92057010924-cen6dnaoa4faif7ig46raqjgirce2i14.apps.googleusercontent.com",
    callback: handleGoogleLogin,
  });
  google.accounts.id.renderButton(
    document.getElementById("google-signin-btn"),
    { theme: "filled_back", 
      size: "large",
      shape: "pill",
      width: 280
    }
  );
};

function handleGoogleLogin(response) {
  showLoader("Signing in with Google...");
  fetch("http://localhost:3000/api/v1/users/google-login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ credential: response.credential }),
  })
    .then((res) => res.json())
    .then((data) => {
      hideLoader();
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
        window.location.href = "customer-home.html";
      } else {
        alert("Google login failed");
      }
    })
    .catch((err) => {
      hideLoader();
      console.error("Google Login Error", err);
      alert("Google login failed");
    });
}

// Firebase config
// const firebaseConfig = {
//   apiKey: "AIzaSyDbg9s0aeIJ8dFDiJ8S9Hil5OwY5iuER-c",
//   authDomain: "zayka-e-jashn-7e74c.firebaseapp.com",
//   projectId: "zayka-e-jashn-7e74c",
//   appId: "1:365267931967:web:8d3cef05f12909220c398a",
// };
// firebase.initializeApp(firebaseConfig);
// const auth = firebase.auth();

// let confirmationResultGlobal = null;

// document.querySelector('.phone-btn').addEventListener('click', () => {
//   const phoneNumber = prompt("Enter your 10-digit phone number:");
//   if (!/^\d{10}$/.test(phoneNumber)) {
//     alert("Invalid phone number.");
//     return;
//   }

//   // Setup invisible reCAPTCHA
//   window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
//     size: "invisible"
//   });

//   const fullPhone = "+91" + phoneNumber;
//   showLoader("Sending OTP...");

//   auth.signInWithPhoneNumber(fullPhone, window.recaptchaVerifier)
//     .then((confirmationResult) => {
//       hideLoader();
//       confirmationResultGlobal = confirmationResult;
//       document.getElementById("otp-section").style.display = "flex";
//     })
//     .catch((error) => {
//       hideLoader();
//       console.error("OTP sending error:", error);
//       alert("Failed to send OTP. Try again.");
//     });
// });

// document.getElementById("verify-otp-btn").addEventListener("click", () => {
//   const otp = document.getElementById("otp-input").value.trim();
//   const errorMsg = document.getElementById("otp-error");

//   if (!/^\d{6}$/.test(otp)) {
//     errorMsg.textContent = "Enter a valid 6-digit OTP.";
//     return;
//   }

//   showLoader("Verifying OTP...");
//   confirmationResultGlobal.confirm(otp)
//     .then((result) => {
//       hideLoader();
//       const firebaseUser = result.user;
//       localStorage.setItem("user", JSON.stringify({ phone: firebaseUser.phoneNumber }));
//       window.location.href = "customer-home.html";
//     })
//     .catch((error) => {
//       hideLoader();
//       console.error("OTP verification error:", error);
//       errorMsg.textContent = "Invalid OTP. Try again.";
//     });
// });
