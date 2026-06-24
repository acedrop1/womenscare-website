// premium animated background FX — inject once on every page
(function () {
  if (document.getElementById('bg-fx')) return;

  // medical motif SVGs (stroked, theme-tinted via currentColor)
  var ICONS = {
    cross: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M10 3h4v7h7v4h-7v7h-4v-7H3v-4h7z"/></svg>',
    heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 00-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 000-7.8z"/></svg>',
    venus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="9" r="6"/><path d="M12 15v7M9 19h6"/></svg>',
    capsule: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="2" y="8" width="20" height="8" rx="4"/><path d="M12 8v8"/></svg>',
    steth: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 3v5a4 4 0 008 0V3M5 3H3M5 3h2M9 3h2M9 3H7"/><path d="M9 15v1a6 6 0 0012 0v-3"/><circle cx="21" cy="11" r="2"/></svg>',
    dna: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 3c0 5 14 5 14 11s-14 6-14 11M19 3c0 5-14 5-14 11s14 6 14 11"/><path d="M7 6h10M7.5 18h9M9 9h6M9 15h6"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 5v14M5 12h14"/></svg>',
    pulse: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M2 12h5l2-6 4 12 2-6h7"/></svg>'
  };
  function ico(name, cls) { return '<span class="fx-ico ' + cls + '">' + ICONS[name] + '</span>'; }

  // long animated EKG / heartbeat line that sweeps across
  var EKG =
    '<svg class="fx-ekg-svg" viewBox="0 0 1200 80" preserveAspectRatio="none">' +
    '<path d="M0 40 H180 l18 -26 18 52 16 -40 14 22 H460 l18 -26 18 52 16 -40 14 22 H760 l18 -26 18 52 16 -40 14 22 H1060 l18 -26 18 52 16 -40 14 22 H1200" ' +
    'fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/></svg>';

  var fx = document.createElement('div');
  fx.id = 'bg-fx';
  fx.setAttribute('aria-hidden', 'true');
  fx.innerHTML =
    '<div class="fx-grid"></div>' +
    '<div class="fx-aurora fx-a1"></div>' +
    '<div class="fx-aurora fx-a2"></div>' +
    '<div class="fx-aurora fx-a3"></div>' +
    '<div class="fx-aurora fx-a4"></div>' +
    '<div class="fx-orb fx-o1"></div>' +
    '<div class="fx-orb fx-o2"></div>' +
    '<div class="fx-orb fx-o3"></div>' +
    '<div class="fx-orb fx-o4"></div>' +
    '<div class="fx-orb fx-o5"></div>' +
    '<div class="fx-parallax fx-pl-slow">' +
      ico('cross', 'fx-ic1 fx-rose') + ico('dna', 'fx-ic2 fx-ink') +
      ico('heart', 'fx-ic3 fx-rose') + ico('venus', 'fx-ic4 fx-ink') +
    '</div>' +
    '<div class="fx-parallax fx-pl-fast">' +
      ico('capsule', 'fx-ic5 fx-ink') + ico('steth', 'fx-ic6 fx-rose') +
      ico('plus', 'fx-ic7 fx-ink') + ico('pulse', 'fx-ic8 fx-rose') +
      ico('plus', 'fx-ic9 fx-rose') + ico('cross', 'fx-ic10 fx-ink') +
    '</div>' +
    '<div class="fx-ekg fx-ekg-a">' + EKG + '</div>' +
    '<div class="fx-ekg fx-ekg-b">' + EKG + '</div>' +
    '<div class="fx-tone"></div>';
  document.body.insertBefore(fx, document.body.firstChild);

  // scroll-driven tone + parallax (writes CSS vars, read in style.css)
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduce) {
    var root = document.documentElement, ticking = false;
    function update() {
      var sy = window.scrollY || 0;
      var h = (document.documentElement.scrollHeight - window.innerHeight) || 1;
      var f = Math.min(1, Math.max(0, sy / h));
      root.style.setProperty('--sy', f.toFixed(4));
      root.style.setProperty('--syp', sy.toFixed(1));
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
  }
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
  if (menuBtn) { menuBtn.innerHTML = ICON_CLOSE; menuBtn.setAttribute('aria-label', 'Close menu'); menuBtn.setAttribute('aria-expanded', 'true'); }
}
function closeMenu() {
  mobileMenu.classList.remove('open');
  document.body.style.overflow = '';
  if (menuBtn) { menuBtn.innerHTML = ICON_MENU; menuBtn.setAttribute('aria-label', 'Open menu'); menuBtn.setAttribute('aria-expanded', 'false'); }
}
function toggleMenu() { mobileMenu.classList.contains('open') ? closeMenu() : openMenu(); }
if (menuBtn) menuBtn.addEventListener('click', toggleMenu);
if (mobileClose) mobileClose.addEventListener('click', closeMenu);
if (mobileMenu) mobileMenu.addEventListener('click', (e) => { if (e.target === mobileMenu) closeMenu(); });
document.querySelectorAll('.mobile_link, #mobileMenuCta').forEach(a => a.addEventListener('click', closeMenu));
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && mobileMenu && mobileMenu.classList.contains('open')) closeMenu(); });

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

// Contact form submit (placeholder until backend is wired)
const contactForm = document.querySelector('.contact_form form');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = contactForm.querySelector('.form_btn');
    const originalText = btn.innerHTML;
    btn.innerHTML = 'Sending…';
    btn.disabled = true;
    setTimeout(() => {
      contactForm.innerHTML = '<div style="text-align:center; padding: 40px 20px;"><div style="width:64px; height:64px; border-radius:50%; background:#d1fae5; color:#065f46; display:grid; place-items:center; margin:0 auto 18px;"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 12l2 2 4-4M12 22a10 10 0 100-20 10 10 0 000 20z"/></svg></div><h3 style="font-size:22px; font-weight:500; letter-spacing:-0.02em; margin-bottom:8px;">Request sent</h3><p style="color: var(--ink_soft);">Thank you. We will get back to you by the end of the next business day. For urgent concerns, please call (973) 782 5577.</p></div>';
    }, 600);
  });
}

// AI FAB placeholder (opens a small alert until real chat is wired)
document.querySelectorAll('.ai_fab').forEach(btn => {
  btn.addEventListener('click', () => {
    alert("Our AI Care Assistant is coming soon. For now, please call (973) 782 5577 or use the Contact form.");
  });
});
