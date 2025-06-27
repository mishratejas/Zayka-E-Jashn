function selectRole(role) {
  const preloader = document.getElementById('preloader');
  if (preloader) {
    preloader.style.display = 'flex';  // Show loader
  }

  setTimeout(() => {
    window.location.href = `${role}-login.html`;
  }, 900); 
}
