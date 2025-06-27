document.addEventListener('DOMContentLoaded', () => {
  console.log("Customer home page loaded.");
});
window.addEventListener('scroll', () => {
  const header = document.querySelector('header');
  if (window.scrollY > 50) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
});
document.querySelector('.hamburger').addEventListener('click', () => {
  document.querySelector('nav ul').classList.toggle('show');
});

document.addEventListener('DOMContentLoaded', () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const name = user?.name || "Guest";
  document.getElementById("welcome-user").innerText = `Hello, ${name}!`;

  // Typing effect
  const welcomeMessage = "Welcome to Zayka-E-Jashn";
  const typedTextEl = document.getElementById("typed-text");
  let i = 0;

  function typeChar() {
    if (i < welcomeMessage.length) {
      typedTextEl.textContent += welcomeMessage.charAt(i);
      i++;
      setTimeout(typeChar, 70);
    }
  }

  typedTextEl.textContent = "";
  typeChar();
});

