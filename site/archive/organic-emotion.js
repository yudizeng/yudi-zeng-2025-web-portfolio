(() => {
  const frame = document.querySelector('.oe-carousel');
  const slides = [...frame.querySelectorAll('.oe-slide')];
  const count = frame.querySelector('.oe-carousel-count');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0;
  let timer;
  let paused = false;

  function show(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      const active = i === current;
      slide.classList.toggle('is-active', active);
      slide.setAttribute('aria-hidden', String(!active));
    });
    count.textContent = `${String(current + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
  }
  function stop() { clearInterval(timer); timer = undefined; }
  function start() {
    stop();
    if (!paused && !reducedMotion.matches && !document.hidden) timer = setInterval(() => show(current + 1), 4500);
  }
  function move(step) { show(current + step); start(); }

  frame.querySelector('.oe-carousel-prev').addEventListener('click', () => move(-1));
  frame.querySelector('.oe-carousel-next').addEventListener('click', () => move(1));
  frame.addEventListener('mouseenter', () => { paused = true; stop(); });
  frame.addEventListener('mouseleave', () => { paused = false; start(); });
  frame.addEventListener('focusin', () => { paused = true; stop(); });
  frame.addEventListener('focusout', event => {
    if (!frame.contains(event.relatedTarget)) { paused = false; start(); }
  });
  frame.addEventListener('touchstart', () => { paused = true; stop(); }, { passive: true });
  frame.addEventListener('touchend', () => { paused = false; start(); }, { passive: true });
  document.addEventListener('visibilitychange', start);
  reducedMotion.addEventListener('change', start);
  start();
})();
