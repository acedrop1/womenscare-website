// clean premium background — inject once on every page
(function () {
  if (document.getElementById('bg-fx')) return;
  var fx = document.createElement('div');
  fx.id = 'bg-fx';
  fx.setAttribute('aria-hidden', 'true');
  fx.innerHTML =
    '<div class="fx-aurora fx-a1"></div>' +
    '<div class="fx-aurora fx-a2"></div>';
  document.body.insertBefore(fx, document.body.firstChild);
})();

// nav scroll
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  if (window.scrollY > 20) nav.classList.add('scrolled');
  else nav.classList.remove('scrolled');
}, { passive: true });

// mobile menu
const menuBtn = document.getElementById('menuBtn');
const mobileMenu = document.getElementById('mobileMenu');
const mobileClose = document.getElementById('mobileClose');
// The nav sits above the drawer overlay, so the hamburger is the always-tappable
// control: it toggles the menu and morphs between the menu and close (X) icons.
const ICON_MENU = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M3 6h18M3 12h18M3 18h18"/></svg>';
const ICON_CLOSE = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>';
function openMenu() {
  mobileMenu.classList.add('open');
  document.body.style.overflow = 'hidden';
  if (menuBtn) { menuBtn.setAttribute('aria-label', 'Close menu'); menuBtn.setAttribute('aria-expanded', 'true'); }
}
function closeMenu() {
  mobileMenu.classList.remove('open');
  document.body.style.overflow = '';
  if (menuBtn) { menuBtn.setAttribute('aria-label', 'Open menu'); menuBtn.setAttribute('aria-expanded', 'false'); }
}
function toggleMenu() { mobileMenu.classList.contains('open') ? closeMenu() : openMenu(); }
if (menuBtn) menuBtn.addEventListener('click', toggleMenu);
if (mobileClose) mobileClose.addEventListener('click', closeMenu);
if (mobileMenu) mobileMenu.addEventListener('click', (e) => { if (e.target === mobileMenu) closeMenu(); });
document.querySelectorAll('.mobile_link, #mobileMenuCta').forEach(a => a.addEventListener('click', closeMenu));
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && mobileMenu && mobileMenu.classList.contains('open')) closeMenu(); });

// nav floats into a pill on scroll
(function () {
  const lpNav = document.querySelector('.lp_nav');
  if (!lpNav) return;
  const TRIGGER = 80;
  function onScroll() {
    if (window.scrollY > TRIGGER) lpNav.classList.add('nav-scrolled');
    else lpNav.classList.remove('nav-scrolled');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

// Service accordion: click a row to navigate to its service page
document.querySelectorAll('.svc_row').forEach(function (row) {
  row.addEventListener('click', function () {
    const href = row.getAttribute('data-href');
    if (href) window.location.href = href;
  });
  row.addEventListener('focusin', function () { row.classList.add('active'); });
  row.addEventListener('focusout', function () { row.classList.remove('active'); });
  // First row stays open by default until user hovers another
  // (CSS handles hover, no JS needed for that)
});

// reveal on scroll
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// Auto fly-up reveal — sprinkle scroll motion across the page
const flySelectors = [
  '.svc_card', '.team_card', '.blog_card', '.feature_card', '.quick_card', '.loc_card',
  '.world_top', '.quote_block', '.world_grid', '.section_eyebrow',
  '.cta', '.fcard_box', '.mega_title', '.article h2', '.article h3',
  '.fcard_grid', '.team_grid', '.blog_grid', '.svc_grid', '.svc_grid_strip',
  '.logo_grid', '.logo_grid_compact', '.logo_grid_small',
  '.faq_item', '.testimonial_card', '.pillars', '.pillar',
  '.hero_image_card', '.contact_form', '.locations_v2', '.contact_quick'
];
const flyTargets = document.querySelectorAll(flySelectors.join(','));
flyTargets.forEach(el => { if (!el.classList.contains('fly-up')) el.classList.add('fly-up'); });
const flyIO = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); flyIO.unobserve(e.target); } });
}, { threshold: 0.08, rootMargin: '0px 0px -60px 0px' });
flyTargets.forEach(el => flyIO.observe(el));

// faq accordion
document.querySelectorAll('.faq_q').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.parentElement;
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq_item').forEach(i => {
      i.classList.remove('open');
      i.querySelector('.faq_a').style.maxHeight = '0';
    });
    if (!isOpen) {
      item.classList.add('open');
      const a = item.querySelector('.faq_a');
      a.style.maxHeight = a.scrollHeight + 'px';
    }
  });
});
const firstFaq = document.querySelector('.faq_item');
if (firstFaq) {
  firstFaq.classList.add('open');
  const a = firstFaq.querySelector('.faq_a');
  setTimeout(() => { a.style.maxHeight = a.scrollHeight + 'px'; }, 100);
}

// Contact form: there is no backend yet, so never pretend a request was sent.
// Keep what the patient typed and point them to the phone, in their language.
const contactForm = document.querySelector('.contact_form form');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const es = document.documentElement.lang === 'es';
    let note = contactForm.querySelector('.form_notice');
    if (!note) {
      note = document.createElement('div');
      note.className = 'form_notice';
      note.setAttribute('role', 'status');
      contactForm.querySelector('.form_btn').insertAdjacentElement('beforebegin', note);
    }
    note.innerHTML = es
      ? '<strong>Las solicitudes en línea aún no están disponibles.</strong> Para reservar, llámenos al <a href="tel:9737825577">(973) 782-5577</a>. Normalmente atendemos a nuevas pacientes la misma semana.'
      : '<strong>Online requests aren’t connected yet.</strong> To book, please call <a href="tel:9737825577">(973) 782-5577</a>. New patients are usually seen the same week.';
    note.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
}

// AI FAB is wired to the Care Assistant chat in chat.js

// Symptom Check modal: any [data-sym-open] link opens symptom-check.html in an iframe
(function () {
  const modal = document.getElementById('symModal');
  const frame = document.getElementById('symModalFrame');
  const closeBtn = document.getElementById('symModalClose');
  if (!modal || !frame || !closeBtn) return;

  function open() {
    if (!frame.src || frame.src === 'about:blank') frame.src = 'symptom-check.html?modal=1';
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('[data-sym-open]').forEach(function (a) {
    a.addEventListener('click', function (e) { e.preventDefault(); open(); });
  });
  closeBtn.addEventListener('click', close);
  modal.addEventListener('click', function (e) { if (e.target === modal) close(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal.classList.contains('open')) close();
  });
  // the embedded check asks to close when it finishes; only trust our own origin
  window.addEventListener('message', function (e) {
    if (e.origin === location.origin && e.data && e.data.type === 'sym-close') close();
  });
})();

// Hero typewriter — types a medical term, deletes, cycles to the next (~7 terms)
(function () {
  const h1 = document.getElementById('heroH1');
  if (!h1) return;
  const typeEl = h1.querySelector('.lp_type');
  let words = [];
  try { words = JSON.parse(h1.getAttribute('data-words') || '[]'); } catch (e) { words = []; }
  if (!typeEl || !words.length) return;

  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) { typeEl.textContent = words[0]; return; }

  const TYPE = 75, DEL = 38, HOLD = 1500, GAP = 380, START = 600;
  let wi = 0, ci = 0, deleting = false;

  function tick() {
    const word = words[wi];
    if (!deleting) {
      ci++;
      typeEl.textContent = word.slice(0, ci);
      if (ci >= word.length) { deleting = true; return setTimeout(tick, HOLD); }
      return setTimeout(tick, TYPE);
    }
    ci--;
    typeEl.textContent = word.slice(0, ci);
    if (ci <= 0) { deleting = false; wi = (wi + 1) % words.length; return setTimeout(tick, GAP); }
    return setTimeout(tick, DEL);
  }
  typeEl.textContent = '';
  setTimeout(tick, START);
})();

// ---- Mobile: services accordion auto opens the row you scroll to ----
(function () {
  const rows = Array.from(document.querySelectorAll('#services .svc_row'));
  if (!rows.length) return;
  const mq = window.matchMedia('(max-width: 768px)');
  let ticking = false;
  function update() {
    ticking = false;
    if (!mq.matches) { rows.forEach(r => r.contains(document.activeElement) || r.classList.remove('active')); return; }
    const center = window.innerHeight * 0.42;
    let best = null, bestDist = Infinity;
    rows.forEach(r => {
      const rect = r.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      const d = Math.abs(rect.top + rect.height / 2 - center);
      if (d < bestDist) { bestDist = d; best = r; }
    });
    rows.forEach(r => r.classList.toggle('active', r === best));
  }
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  window.addEventListener('resize', update);
  update();
})();

// ---- Mobile: promise carousel focuses the centered card ----
(function () {
  const grid = document.querySelector('.promise_grid');
  if (!grid) return;
  const cards = Array.from(grid.querySelectorAll('.promise_card'));
  if (!cards.length) return;
  const mq = window.matchMedia('(max-width: 768px)');
  let ticking = false;
  function focusCard() {
    ticking = false;
    if (!mq.matches) { cards.forEach(c => c.classList.remove('is-focus')); return; }
    const gc = grid.getBoundingClientRect();
    const mid = gc.left + gc.width / 2;
    let best = null, bestDist = Infinity;
    cards.forEach(c => {
      const r = c.getBoundingClientRect();
      const d = Math.abs(r.left + r.width / 2 - mid);
      if (d < bestDist) { bestDist = d; best = c; }
    });
    cards.forEach(c => c.classList.toggle('is-focus', c === best));
  }
  grid.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(focusCard); } }, { passive: true });
  window.addEventListener('resize', focusCard);
  // run after layout settles
  setTimeout(focusCard, 200);
})();

// ---- Mobile: testimonials become an unstoppable marquee (cloned for seamless loop) ----
(function () {
  const grid = document.querySelector('#testimonials .test_grid');
  if (!grid) return;
  function setup() {
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    if (isMobile && !grid.dataset.marquee) {
      const track = document.createElement('div');
      track.className = 'test_track';
      const originals = Array.from(grid.children);
      originals.forEach(c => track.appendChild(c));
      originals.forEach(c => {
        const clone = c.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        clone.tabIndex = -1;
        track.appendChild(clone);
      });
      grid.appendChild(track);
      grid.dataset.marquee = '1';
      grid.classList.add('is-marquee');
    }
  }
  setup();
  window.addEventListener('resize', setup, { passive: true });
})();

// Ensure hero video autoplays inline on mobile and desktop (no play button)
(function () {
  var vids = document.querySelectorAll('.lp_video');
  if (!vids.length) return;
  // iOS Low Power Mode (and some data-saver settings) refuse ALL video autoplay,
  // even muted. Safari plays an MP4 inside an <img> muted and looped regardless,
  // so when play() is refused there, swap the video for an <img> of the same file.
  var ua = navigator.userAgent;
  var imgVideo = /iPhone|iPad|iPod/.test(ua) || (/AppleWebKit/.test(ua) && !/Chrome|Chromium|Edg|Android/.test(ua));
  function toImage(v) {
    if (!imgVideo || v.dataset.swapped) return;
    var src = v.currentSrc || (v.querySelector('source') || {}).src;
    if (!src) return;
    v.dataset.swapped = '1';
    var img = new Image();
    img.className = v.className; img.alt = ''; img.setAttribute('aria-hidden', 'true');
    img.onload = function () { if (v.parentNode) v.parentNode.replaceChild(img, v); }; // swap once frames decode: no blank flash
    img.src = src;
  }
  function kick(v) {
    v.muted = true; v.defaultMuted = true;
    v.setAttribute('muted', ''); v.playsInline = true;
    v.setAttribute('playsinline', ''); v.setAttribute('webkit-playsinline', '');
    var p = v.play();
    if (p && p.catch) p.catch(function (err) { if (err && err.name === 'NotAllowedError') toImage(v); });
  }
  function kickAll() { vids.forEach(kick); }
  vids.forEach(function (v) {
    kick(v);
    ['loadeddata', 'canplay', 'canplaythrough'].forEach(function (ev) {
      v.addEventListener(ev, function () { kick(v); }, { once: true });
    });
  });
  document.addEventListener('visibilitychange', function () { if (!document.hidden) kickAll(); });
  // First interaction (scroll/tap) unlocks playback if the browser blocked autoplay
  var events = ['touchstart', 'pointerdown', 'click', 'scroll', 'keydown'];
  function unlock() { kickAll(); events.forEach(function (ev) { window.removeEventListener(ev, unlock, true); }); }
  events.forEach(function (ev) { window.addEventListener(ev, unlock, { capture: true, passive: true }); });
})();
