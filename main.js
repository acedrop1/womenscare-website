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
