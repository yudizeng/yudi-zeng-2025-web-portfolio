const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');

for (const gallery of document.querySelectorAll('.denim-gallery')) {
  const track = gallery.querySelector('.denim-track');
  const slides = [...track.children];
  const controls = gallery.querySelector('.denim-controls');
  const count = controls.querySelector('.denim-count');
  const playback = controls.querySelector('.denim-playback');
  const delay = Number(gallery.dataset.autoplay);
  let playing = Boolean(delay) && !motionPreference.matches;
  let visible = false;
  let timer;

  function currentSlide() {
    return Math.max(0, Math.min(slides.length - 1, Math.round(track.scrollLeft / track.clientWidth)));
  }

  function move(step) {
    const current = currentSlide();
    const next = (current + step + slides.length) % slides.length;
    const wraps = Math.abs(current - next) > 1;
    track.scrollTo({
      left: slides[next].offsetLeft - slides[0].offsetLeft,
      behavior: motionPreference.matches || wraps ? 'instant' : 'smooth',
    });
  }

  function schedule() {
    clearTimeout(timer);
    if (playing && visible && !document.hidden && !gallery.matches(':hover, :focus-within')) {
      timer = setTimeout(() => {
        move(1);
        schedule();
      }, delay);
    }
  }

  function updatePlayback() {
    const action = playing ? 'Pause' : 'Play';
    playback.textContent = action;
    playback.setAttribute('aria-label', `${action} slideshow: ${playback.dataset.label}`);
    schedule();
  }

  controls.querySelectorAll('[data-step]').forEach(button => {
    button.addEventListener('click', () => move(Number(button.dataset.step)));
  });

  track.addEventListener('scroll', () => {
    const index = String(currentSlide() + 1).padStart(2, '0');
    const total = String(slides.length).padStart(2, '0');
    count.textContent = `${index} / ${total}`;
  }, { passive: true });

  track.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      move(event.key === 'ArrowLeft' ? -1 : 1);
    }
  });

  if (playback) {
    playback.addEventListener('click', () => {
      playing = !playing;
      updatePlayback();
    });
    motionPreference.addEventListener('change', event => {
      if (event.matches) {
        playing = false;
        updatePlayback();
      }
    });
    for (const event of ['mouseenter', 'mouseleave', 'focusin', 'focusout', 'touchend', 'touchcancel']) {
      gallery.addEventListener(event, () => requestAnimationFrame(schedule));
    }
    gallery.addEventListener('touchstart', () => clearTimeout(timer), { passive: true });
    document.addEventListener('visibilitychange', schedule);
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      schedule();
    }, { threshold: .35 }).observe(gallery);
    updatePlayback();
  }

  controls.hidden = false;
}
