// anatomy.js — interactive 3D female anatomy (HuBMAP female reference, CC BY 4.0).
// three.js loads only when the section nears the viewport.
const stage = document.querySelector('.fx3d_stage');

if (stage) {
  new IntersectionObserver((e, o) => {
    if (!e[0].isIntersecting) return;
    o.disconnect();
    init().catch(() => {
      stage.classList.add('is-failed');
      stage.querySelector('.fx3d_load span').textContent = stage.dataset.fail;
    });
  }, { rootMargin: '300px' }).observe(stage);
}

// organ centres in model space (from the source GLB node bounds)
const ANCHORS = {
  breast: [0.075, 0.437, 0.033],
  uterus: [-0.013, 0.036, -0.052],
  ovary: [0.044, 0.061, -0.045],
  cervix: [-0.011, 0.021, -0.074],
};

async function init() {
  const THREE = await import('three');
  const { GLTFLoader } = await import('three/addons/loaders/GLTFLoader.js');
  const { MeshoptDecoder } = await import('three/addons/libs/meshopt_decoder.module.js');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  stage.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(26, 1, 0.05, 20);
  scene.add(new THREE.HemisphereLight(0xfff4f8, 0xd9a3bb, 1.6));
  const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(1.5, 2, 2.5); scene.add(key);
  const rimL = new THREE.DirectionalLight(0xff9cc2, 1.4); rimL.position.set(-2, 0.5, -1.5); scene.add(rimL);

  // pearl glass shell: fresnel rim, nearly clear face-on
  const skin = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, side: THREE.FrontSide,
    uniforms: { uRim: { value: new THREE.Color('#c93d76') }, uFace: { value: new THREE.Color('#ffffff') }, uTime: { value: 0 } },
    vertexShader: `varying vec3 vN; varying vec3 vV; varying float vY;
      void main(){ vec4 mv = modelViewMatrix * vec4(position,1.); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); vY = position.y; gl_Position = projectionMatrix*mv; }`,
    fragmentShader: `uniform vec3 uRim; uniform vec3 uFace; uniform float uTime; varying vec3 vN; varying vec3 vV; varying float vY;
      void main(){ float f = pow(1. - abs(dot(normalize(vN), normalize(vV))), 2.2);
        float scan = (1. - smoothstep(0., .012, abs(fract(vY*1.2 - uTime*.07) - .5))) * .18; // slow light band sweeping up the body
        vec3 c = mix(uFace, uRim, f); gl_FragColor = vec4(c, .06 + f*.62 + scan); }`,
  });
  // standard (not physical) material: clearcoat + sheen cost seconds of shader compile on weaker GPUs
  const organ = new THREE.MeshStandardMaterial({ color: '#e8588c', roughness: 0.3, metalness: 0.05, emissive: '#ff5c93', emissiveIntensity: 0.45 });
  const bone = new THREE.MeshStandardMaterial({ color: '#f6e6da', roughness: 0.6, transparent: true, opacity: 0.55, depthWrite: false });

  const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  const gltf = await loader.loadAsync('models/female-body.glb');
  const body = gltf.scene;
  body.traverse((o) => {
    if (!o.isMesh) return;
    const n = o.material.name;
    o.material = n === 'skin' ? skin : n === 'bone' ? bone : organ;
    if (n === 'skin') o.renderOrder = 2;
    if (n === 'organ') o.renderOrder = 1;
  });

  // centre on the torso so the organs read at a useful size
  const pivot = new THREE.Group();
  const focus = new THREE.Vector3(0, 0.2, -0.05);
  body.position.sub(focus);
  pivot.add(body);
  scene.add(pivot);

  // soft glow halo behind the pelvis organs
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({
    map: (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'); const r = g.createRadialGradient(64, 64, 0, 64, 64, 64); r.addColorStop(0, 'rgba(255,120,170,.9)'); r.addColorStop(1, 'rgba(255,120,170,0)'); g.fillStyle = r; g.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c); })(),
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  }));
  halo.scale.setScalar(0.4); halo.position.set(...ANCHORS.uterus); halo.renderOrder = 0;
  body.add(halo);

  // hotspots: HTML buttons pinned to organ anchors
  const hots = [...stage.querySelectorAll('.fx3d_hot')].map((btn) => {
    const o = new THREE.Object3D(); o.position.set(...ANCHORS[btn.dataset.anchor]); body.add(o);
    return { btn, o };
  });
  const list = document.querySelectorAll('.fx3d_list a[data-anchor]');
  // hovering a list row glides the camera in on that organ; pins only show their label
  const WIDE = { y: 0.04, span: 1.35 };
  const ZOOM = { breast: { y: 0.24, span: 0.55 }, uterus: { y: -0.16, span: 0.34 }, ovary: { y: -0.15, span: 0.38 }, cervix: { y: -0.17, span: 0.32 } };
  const view = { ...WIDE };
  let want = WIDE;
  function hot(name, zoom) {
    hots.forEach((h) => h.btn.classList.toggle('is-hot', h.btn.dataset.anchor === name));
    list.forEach((a) => a.classList.toggle('is-hot', a.dataset.anchor === name));
    if (zoom) { want = (name && ZOOM[name]) || WIDE; if (name) target = Math.round(rot / (2 * Math.PI)) * 2 * Math.PI; }
  }
  hots.forEach((h) => { h.btn.addEventListener('mouseenter', () => hot(h.btn.dataset.anchor)); h.btn.addEventListener('mouseleave', () => hot(null)); });
  list.forEach((a) => {
    a.addEventListener('mouseenter', () => hot(a.dataset.anchor, true));
    a.addEventListener('focus', () => hot(a.dataset.anchor, true));
    a.addEventListener('mouseleave', () => hot(null, true));
    a.addEventListener('blur', () => hot(null, true));
  });

  function size() {
    renderer.setSize(stage.clientWidth, stage.clientHeight, false);
    camera.aspect = stage.clientWidth / stage.clientHeight;
    camera.updateProjectionMatrix();
  }
  function aim() {
    view.y += (want.y - view.y) * 0.07;
    view.span += (want.span - view.span) * 0.07;
    // keep the framed height, but never let a narrow stage crop the body sideways
    const span = view.span * Math.max(1, 0.62 / camera.aspect);
    camera.position.set(0, view.y + 0.02, (span / 2) / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
    camera.lookAt(0, view.y, 0);
  }
  new ResizeObserver(size).observe(stage);
  size();

  // drag to turn, with inertia; idles into a slow sway
  let rot = -0.35, vel = 0, target = null, dragging = false, lastX = 0, idle = 0, tiltX = 0, tiltY = 0;
  stage.addEventListener('pointerdown', (e) => { if (e.target.closest('.fx3d_hot')) return; dragging = true; lastX = e.clientX; vel = 0; target = null; stage.setPointerCapture(e.pointerId); stage.classList.add('is-touched'); });
  stage.addEventListener('pointermove', (e) => {
    const r = stage.getBoundingClientRect();
    stage.style.setProperty('--mx', e.clientX - r.left + 'px'); stage.style.setProperty('--my', e.clientY - r.top + 'px');
    tiltX = ((e.clientY - r.top) / r.height - 0.5) * 0.12; tiltY = ((e.clientX - r.left) / r.width - 0.5) * 0.1;
    if (!dragging) return;
    const dx = e.clientX - lastX; lastX = e.clientX; vel = dx * 0.008; rot += vel; idle = 0;
  });
  const end = () => { dragging = false; };
  stage.addEventListener('pointerup', end); stage.addEventListener('pointercancel', end);
  stage.addEventListener('pointerleave', () => { tiltX = tiltY = 0; });

  let visible = true;
  new IntersectionObserver((e) => { visible = e[0].isIntersecting; if (visible) loop(); }).observe(stage);
  const v = new THREE.Vector3();
  let raf = 0, t0 = performance.now();

  function loop() {
    if (raf) return;
    raf = requestAnimationFrame(frame);
  }
  function frame(now) {
    raf = 0;
    const t = (now - t0) / 1000;
    if (!dragging) {
      idle += 1 / 60;
      if (target !== null) { rot += (target - rot) * 0.08; if (Math.abs(target - rot) < 0.001) target = null; }
      else { rot += vel; vel *= 0.94; if (idle > 2.5 && !reduce) rot += Math.sin(t * 0.35) * 0.0016 + 0.0009; }
    }
    pivot.rotation.y = rot;
    pivot.rotation.x += (tiltX - pivot.rotation.x) * 0.06;
    pivot.position.x += (tiltY * 0.15 - pivot.position.x) * 0.06;
    aim();
    skin.uniforms.uTime.value = reduce ? 0 : t;
    halo.material.opacity = 0.55 + Math.sin(t * 1.6) * 0.15;
    renderer.render(scene, camera);

    // hotspots fade out as the body turns away from the camera
    const facing = Math.cos(rot), w = stage.clientWidth, h = stage.clientHeight;
    hots.forEach(({ btn, o }) => {
      o.getWorldPosition(v).project(camera);
      // the cervix pin sits on top of the uterus pin until the camera zooms in
      const near = btn.dataset.anchor === 'cervix' ? Math.max(0, Math.min(1, (0.9 - view.span) * 3)) : 1;
      const op = Math.max(0, Math.min(1, (facing - 0.45) * 3)) * near;
      btn.style.setProperty('--x', ((v.x + 1) / 2 * w).toFixed(1) + 'px');
      btn.style.setProperty('--y', ((1 - v.y) / 2 * h).toFixed(1) + 'px');
      btn.style.setProperty('--o', op.toFixed(2));
      btn.classList.toggle('is-live', op > 0.5);
      btn.tabIndex = op > 0.5 ? 0 : -1;
    });
    if (visible && !document.hidden) loop();
  }
  document.addEventListener('visibilitychange', loop);
  stage.classList.add('is-ready');
  loop();
}
