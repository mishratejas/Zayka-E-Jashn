document.addEventListener('DOMContentLoaded', () => {
  const features = document.querySelectorAll('.feature-card');

  function checkVisibility() {
    const triggerBottom = window.innerHeight * 0.9;

    features.forEach(feature => {
      const featureTop = feature.getBoundingClientRect().top;

      if (featureTop < triggerBottom) {
        feature.classList.add('show');
      } else {
        feature.classList.remove('show');
      }
    });
  }

  window.addEventListener('scroll', checkVisibility);
  checkVisibility(); 
});
