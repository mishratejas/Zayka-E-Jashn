const text = "Welcome to Zayka-E-Jashn";
const target = document.getElementById("typed-text");
let index = 0;

function typeWriter() {
    if (index < text.length) {
      target.innerHTML += text.charAt(index);
      index++;
      setTimeout(typeWriter, 50);
    }
}

window.onload = typeWriter;
