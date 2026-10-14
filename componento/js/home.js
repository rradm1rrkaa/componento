// Homepage-only interactions: promotional carousel and local navigation.
(function () {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const slides = [...document.querySelectorAll('.hero-slide')];
  const dots = $('#heroDots');
  let active = 0;
  let timer;

  function show(index) {
    if (!slides.length) return;
    active = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => { slide.hidden = i !== active; slide.classList.toggle('active', i === active); });
    if (dots) dots.querySelectorAll('button').forEach((button, i) => { button.classList.toggle('active', i === active); button.setAttribute('aria-current', i === active ? 'true' : 'false'); });
    const count = $('#slideCount'); if (count) count.textContent = `${String(active + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
  }

  if (dots && slides.length) {
    slides.forEach((_, i) => {
      const dot = document.createElement('button'); dot.type = 'button'; dot.className = 'hero-dot';
      dot.setAttribute('aria-label', `Слайд ${i + 1}`); dot.onclick = () => { show(i); restart(); }; dots.append(dot);
    });
    const previous = $('#heroPrev'), next = $('#heroNext');
    if (previous) previous.onclick = () => { show(active - 1); restart(); };
    if (next) next.onclick = () => { show(active + 1); restart(); };
    const carousel = document.querySelector('.hero-carousel');
    const stop = () => clearInterval(timer);
    const start = () => { stop(); if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) timer = setInterval(() => show(active + 1), 7000); };
    function restart() { start(); }
    carousel.addEventListener('mouseenter', stop); carousel.addEventListener('mouseleave', start);
    carousel.addEventListener('focusin', stop); carousel.addEventListener('focusout', start);
    show(0); start();
  }

  const footerTour = $('#startTourFooter'); if (footerTour) footerTour.onclick = () => window.CMP.startTour && window.CMP.startTour(true);
  const cityFooter = $('#cityFooter'); if (cityFooter) cityFooter.onclick = () => window.CMP.openCity && window.CMP.openCity(true);
  const mobileMenu = $('#mobileMenuBtn');
  if (mobileMenu) mobileMenu.onclick = () => {
    const nav = $('#mainNav'); const open = !nav.classList.contains('open');
    nav.classList.toggle('open', open); mobileMenu.setAttribute('aria-expanded', String(open));
  };
})();
