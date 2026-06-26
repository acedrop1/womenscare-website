// Dot field — vanilla canvas. Light pink dots that bulge away from the cursor.
// Mounted into a #heroDots canvas inside .lp_hero. Lightweight, no deps.
(function () {
  const canvas = document.getElementById('heroDots');
  if (!canvas) return;
  const parent = canvas.parentElement;
  const ctx = canvas.getContext('2d', { alpha: true });
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  const CONF = {
    dotRadius: 1.4,
    dotSpacing: 18,
    cursorRadius: 220,
    bulgeStrength: 22,
    gradientFrom: 'rgba(241, 69, 129, 0.32)',
    gradientTo: 'rgba(180, 151, 207, 0.22)'
  };

  let W = 0, H = 0, offsetX = 0, offsetY = 0;
  let dots = [];
  let mouse = { x: -9999, y: -9999, prevX: -9999, prevY: -9999, speed: 0 };
  let raf = null, frame = 0, eng = 0;

  function size() {
    const rect = parent.getBoundingClientRect();
    W = rect.width; H = rect.height;
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    offsetX = rect.left + window.scrollX;
    offsetY = rect.top + window.scrollY;
    build();
  }
  function build() {
    const step = CONF.dotRadius + CONF.dotSpacing;
    const cols = Math.floor(W / step);
    const rows = Math.floor(H / step);
    const padX = (W % step) / 2;
    const padY = (H % step) / 2;
    dots = new Array(rows * cols);
    let i = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const ax = padX + c * step + step / 2;
        const ay = padY + r * step + step / 2;
        dots[i++] = { ax: ax, ay: ay, sx: ax, sy: ay };
      }
    }
  }

  function onMove(e) {
    const r = parent.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
  }
  function onLeave() { mouse.x = -9999; mouse.y = -9999; }

  setInterval(function () {
    const dx = mouse.prevX - mouse.x;
    const dy = mouse.prevY - mouse.y;
    const d = Math.sqrt(dx * dx + dy * dy);
    mouse.speed += (d - mouse.speed) * 0.5;
    if (mouse.speed < 0.001) mouse.speed = 0;
    mouse.prevX = mouse.x; mouse.prevY = mouse.y;
  }, 20);

  function tick() {
    frame++;
    const target = Math.min(mouse.speed / 5, 1);
    eng += (target - eng) * 0.06;
    if (eng < 0.001) eng = 0;

    ctx.clearRect(0, 0, W, H);
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, CONF.gradientFrom);
    grad.addColorStop(1, CONF.gradientTo);
    ctx.fillStyle = grad;

    const cr = CONF.cursorRadius;
    const crSq = cr * cr;
    const rad = CONF.dotRadius / 2;
    ctx.beginPath();
    for (let i = 0, len = dots.length; i < len; i++) {
      const d = dots[i];
      const dx = mouse.x - d.ax;
      const dy = mouse.y - d.ay;
      const sq = dx * dx + dy * dy;
      if (sq < crSq && eng > 0.01) {
        const dist = Math.sqrt(sq);
        const t = 1 - dist / cr;
        const push = t * t * CONF.bulgeStrength * eng;
        const angle = Math.atan2(dy, dx);
        d.sx += (d.ax - Math.cos(angle) * push - d.sx) * 0.15;
        d.sy += (d.ay - Math.sin(angle) * push - d.sy) * 0.15;
      } else {
        d.sx += (d.ax - d.sx) * 0.1;
        d.sy += (d.ay - d.sy) * 0.1;
      }
      ctx.moveTo(d.sx + rad, d.sy);
      ctx.arc(d.sx, d.sy, rad, 0, Math.PI * 2);
    }
    ctx.fill();
    raf = requestAnimationFrame(tick);
  }

  let rt;
  window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(size, 100); });
  parent.addEventListener('mousemove', onMove, { passive: true });
  parent.addEventListener('mouseleave', onLeave, { passive: true });
  size();
  raf = requestAnimationFrame(tick);
})();

// Symptom Check modal — open from any [data-sym-open] link, embeds symptom-check.html in iframe
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
    a.addEventListener('click', function (e) {
      e.preventDefault();
      open();
    });
  });
  closeBtn.addEventListener('click', close);
  modal.addEventListener('click', function (e) {
    if (e.target === modal) close();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal.classList.contains('open')) close();
  });

  // Allow the iframe to close the modal via postMessage (when symptom check finishes/exits)
  window.addEventListener('message', function (e) {
    if (e.data && e.data.type === 'sym-close') close();
  });
})();
