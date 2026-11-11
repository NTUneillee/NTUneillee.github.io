(() => {
  const nav = document.querySelector('.project-nav');
  if (!nav) return;
  const entries = [...nav.querySelectorAll('.project-nav__links a[href^="#"]')]
    .map(link => ({link, section: document.getElementById(link.hash.slice(1))}))
    .filter(entry => entry.section);
  let queued = false;
  function update() {
    queued = false;
    const edge = Math.max(nav.getBoundingClientRect().bottom + 24, window.innerHeight * 0.3);
    let current = null;
    entries.forEach(entry => {
      if (entry.section.getBoundingClientRect().top <= edge) current = entry;
    });
    entries.forEach(entry => {
      if (entry === current) entry.link.setAttribute('aria-current', 'location');
      else entry.link.removeAttribute('aria-current');
    });
  }
  function schedule() {
    if (!queued) { queued = true; requestAnimationFrame(update); }
  }
  window.addEventListener('scroll', schedule, {passive: true});
  window.addEventListener('resize', schedule);
  window.addEventListener('hashchange', schedule);
  window.addEventListener('load', schedule);
  if (document.fonts) document.fonts.ready.then(schedule);
  update();
})();
