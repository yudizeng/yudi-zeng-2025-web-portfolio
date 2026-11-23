(() => {
  const opening = document.querySelector('.opening');
  const cover = document.querySelector('.hero');
  const replay = document.querySelector('.intro-replay');
  if (!opening || !cover) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const content = [...document.querySelectorAll('body > header, body > main, body > footer, body > .skip-link')];
  let timers = [];
  let arrivalTimer;
  let running = false;
  const finish = () => {
    timers.forEach(clearTimeout);
    timers = [];
    opening.hidden = true;
    content.forEach(node => { node.inert = false; });
    document.documentElement.style.overflow = '';
    if (opening.contains(document.activeElement)) replay.focus({ preventScroll: true });
    running = false;
  };
  const enter = () => {
    clearTimeout(arrivalTimer);
    cover.classList.remove('is-arriving');
    void cover.offsetWidth;
    cover.classList.add('is-arriving');
    arrivalTimer = setTimeout(() => cover.classList.remove('is-arriving'), 1600);
  };
  const play = () => {
    if (running || reduced.matches) return;
    running = true;
    opening.classList.remove('is-tearing');
    opening.hidden = false;
    const word = opening.querySelector('.opening-word span');
    word.textContent = '';
    [...'Hello.'].forEach((letter, index) => {
      timers.push(setTimeout(() => { word.textContent += letter; }, 120 + index * 130));
    });
    cover.classList.remove('is-arriving');
    content.forEach(node => { node.inert = true; });
    document.documentElement.style.overflow = 'hidden';
    timers.push(setTimeout(() => {
      opening.classList.add('is-tearing');
      enter();
    }, 1250));
    timers.push(setTimeout(finish, 2400));
  };
  opening.querySelector('button').addEventListener('click', () => { finish(); enter(); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && running) { finish(); enter(); }
  });
  replay.hidden = reduced.matches;
  replay.addEventListener('click', play);
  reduced.addEventListener('change', () => { finish(); replay.hidden = reduced.matches; });
  window.addEventListener('pagehide', finish);
  // Deep links go directly to their destination; a fresh homepage plays the opening.
  if (!location.hash || location.hash === '#top') play();
})();
