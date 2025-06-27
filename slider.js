  const track = document.getElementById('sliderTrack');
  let slides = Array.from(track.children);
  let index = 0;

// slides duplicacy
  slides.forEach(slide => {
    const clone = slide.cloneNode(true);
    track.appendChild(clone);
  });

  function moveSlider() {
    index++;
    track.style.transform = `translateX(-${index * 270}px)`;

    if (index >= slides.length) {
      setTimeout(() => {
        track.style.transition = 'none';
        track.style.transform = `translateX(0px)`;
        index = 0;
        setTimeout(() => {
          track.style.transition = 'transform 0.5s ease-in-out';
        }, 20);
      }, 500);
    }
  }

  setInterval(moveSlider, 2500);
