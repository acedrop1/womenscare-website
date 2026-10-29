// Cut the HuBMAP female reference body down to a homepage-sized model:
// skin + breast + reproductive organs + pelvis, simplified and meshopt-compressed.
import { NodeIO, getBounds } from '@gltf-transform/core';
import { ALL_EXTENSIONS, EXTMeshoptCompression } from '@gltf-transform/extensions';
import { prune, join, flatten, quantize, dedup, compactPrimitive } from '@gltf-transform/functions';
import { MeshoptSimplifier, MeshoptEncoder } from 'meshoptimizer';
import fs from 'node:fs';

await MeshoptSimplifier.ready; await MeshoptEncoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.encoder': MeshoptEncoder });
const doc = await io.read('female.glb');
const root = doc.getRoot();

// node name -> group; anything outside these subtrees is dropped
const GROUPS = {
  VH_F_skin: 'skin', VH_F_mammary_gland: 'breast', VH_F_pelvis: 'bone',
  VH_F_uterus: 'uterus', VH_F_ovary: 'ovary', VH_F_fallopian_tube: 'tube',
  VH_F_vagina: 'repro', VH_F_ligaments_of_uterus_and_ovaries: 'repro',
};
const MAT = { skin: 'skin', breast: 'organ', uterus: 'organ', ovary: 'organ', tube: 'organ', repro: 'organ', bone: 'bone' };
const mats = {};
[...new Set(Object.values(MAT))].forEach((k, i) => { mats[k] = doc.createMaterial(k).setBaseColorFactor([i / 4, 0.5, 0.5, 1]); });

// gltf-transform's simplify() leaves this asset untouched, so call meshoptimizer directly
const RATIO = { skin: 0.03, bone: 0.08 };
function shrink(p, g) {
  const idx = p.getIndices(); if (!idx) return;
  const I = new Uint32Array(idx.getArray()), P = new Float32Array(p.getAttribute('POSITION').getArray());
  const target = Math.max(3, Math.floor(I.length * (RATIO[g] ?? 0.2) / 3) * 3);
  const [out] = MeshoptSimplifier.simplify(I, P, 3, target, 0.01, []);
  (globalThis.T ??= {})[g] = [(T[g]?.[0] ?? 0) + I.length / 3, (T[g]?.[1] ?? 0) + out.length / 3];
  idx.setArray(out);
  compactPrimitive(p);
}


// The source skin is a scan of a fuller-figured older woman. Reshape it to a
// slimmer feminine build: taper waist + belly, keep hips, slim thighs, lift the bust.
// Only the torso/legs are scaled; arms are excluded wherever a gap separates them.
const KEYS = [ // y (m), x scale, front-z scale, back-z scale
  [0.56, 1, 1, 1], [0.46, 0.95, 1, 0.97], [0.36, 0.91, 0.95, 0.95], [0.30, 0.86, 0.80, 0.94], [0.22, 0.79, 0.70, 0.92], [0.12, 0.87, 0.74, 0.95],
  [0.03, 0.94, 0.84, 1], [-0.06, 0.94, 0.90, 1], [-0.15, 0.88, 0.90, 0.95], [-0.35, 0.87, 0.92, 0.92],
  [-0.55, 0.92, 0.95, 0.95], [-0.80, 1, 1, 1],
];
function profile(y) {
  if (y >= KEYS[0][0]) return [1, 1, 1];
  for (let k = 1; k < KEYS.length; k++) if (y >= KEYS[k][0]) {
    const a = KEYS[k - 1], b = KEYS[k], t = (y - a[0]) / (b[0] - a[0]);
    return [1, 2, 3].map((i) => a[i] + (b[i] - a[i]) * t);
  }
  return [1, 1, 1];
}
function slim(p) {
  const acc = p.getAttribute('POSITION'), P = acc.getArray();
  // torso half-width per 1 cm slice: first gap > 2 cm walking out from the midline
  const edge = new Map(), reach = new Map();
  const slice = (y) => Math.round(y * 100);
  const buckets = new Map();
  for (let i = 0; i < P.length; i += 3) { const k = slice(P[i + 1]); (buckets.get(k) ?? buckets.set(k, []).get(k)).push(Math.abs(P[i])); }
  buckets.forEach((xs, k) => { xs.sort((a, b) => a - b); let e = xs[xs.length - 1]; reach.set(k, e); for (let j = 1; j < xs.length; j++) if (xs[j] - xs[j - 1] > 0.02) { e = xs[j - 1]; break; } edge.set(k, e); });
  for (let i = 0; i < P.length; i += 3) {
    let x = P[i], y = P[i + 1], z = P[i + 2];
    const [fx, ff, fb] = profile(y);
    const k = slice(y), zc = y > -0.08 ? -0.05 : -0.065;
    if (edge.get(k) < reach.get(k) - 0.03) {
      // arms hang free at this height: scale only the torso/legs cluster
      if (Math.abs(x) <= edge.get(k) + 0.004) { x *= fx; z = zc + (z - zc) * (z > zc ? ff : fb); }
    } else {
      // chest/shoulders, arms attached: compress inside 15 cm, blend back to 1:1 by 24 cm
      const a = 0.15, b = 0.24, ax = Math.abs(x);
      const w = ax < a ? 1 : ax < b ? (b - ax) / (b - a) : 0;
      x = Math.sign(x) * (ax < a ? ax * fx : ax < b ? a * fx + (ax - a) * (b - a * fx) / (b - a) : ax);
      const s = z > zc ? ff : fb;
      z = zc + (z - zc) * (1 + (s - 1) * w);
    }
    // bust: gentle forward/upward fullness centred on each breast
    if (z > 0 && Math.abs(x) < 0.17) {
      const b = Math.exp(-((Math.abs(x) - 0.085) ** 2) / (2 * 0.04 ** 2) - ((y - 0.425) ** 2) / (2 * 0.05 ** 2));
      z += 0.026 * b; y += 0.008 * b;
    }
    P[i] = x; P[i + 1] = y; P[i + 2] = z;
  }
  acc.setArray(P);
}

// area-weighted smooth normals, so the fresnel rim follows the reshaped skin
function smoothNormals(p) {
  const P = p.getAttribute('POSITION').getArray(), I = p.getIndices().getArray(), N = new Float32Array(P.length);
  for (let t = 0; t < I.length; t += 3) {
    const a = I[t] * 3, b = I[t + 1] * 3, c = I[t + 2] * 3;
    const ux = P[b] - P[a], uy = P[b + 1] - P[a + 1], uz = P[b + 2] - P[a + 2];
    const vx = P[c] - P[a], vy = P[c + 1] - P[a + 1], vz = P[c + 2] - P[a + 2];
    const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    for (const v of [a, b, c]) { N[v] += nx; N[v + 1] += ny; N[v + 2] += nz; }
  }
  for (let i = 0; i < N.length; i += 3) { const l = Math.hypot(N[i], N[i + 1], N[i + 2]) || 1; N[i] /= l; N[i + 1] /= l; N[i + 2] /= l; }
  p.getAttribute('NORMAL').setArray(N);
}

const groupOf = new Map();
const anchors = {};
function tag(node, g) {
  const name = node.getName();
  if (GROUPS[name]) g = GROUPS[name];
  groupOf.set(node, g);
  node.listChildren().forEach((c) => tag(c, g));
}
root.listScenes()[0].listChildren().forEach((n) => tag(n, null));

// organ anchor points for the HTML hotspots (world-space bbox centres, before centring)
for (const node of root.listNodes()) {
  const g = groupOf.get(node);
  if (!g || g === 'skin' || g === 'repro' || !GROUPS[node.getName()]) continue;
  const b = getBounds(node);
  anchors[g] = b.min.map((v, i) => (v + b.max[i]) / 2);
}
for (const node of root.listNodes()) {
  const g = groupOf.get(node), mesh = node.getMesh();
  if (!mesh) continue;
  // mammary gland is ~850k tris of tiny lobules that won't simplify; the skin shows the form
  if (!g || g === 'breast') { node.setMesh(null); continue; }
  mesh.listPrimitives().forEach((p) => { p.setMaterial(mats[MAT[g]]); p.setAttribute('COLOR_0', null); if (g === 'skin') slim(p); shrink(p, g); if (g === 'skin') smoothNormals(p); });
}
const body = getBounds(root.listScenes()[0]);

await doc.transform(
  prune(), dedup(), flatten(), join({ keepNamed: false }),
  prune(), quantize(),
);
doc.createExtension(EXTMeshoptCompression).setRequired(true).setEncoderOptions({ method: EXTMeshoptCompression.EncoderMethod.QUANTIZE });
await io.write('../female-body.glb', doc);

const tris = root.listMeshes().flatMap((m) => m.listPrimitives()).reduce((a, p) => a + (p.getIndices()?.getCount() ?? 0) / 3, 0);
console.log('triangles', tris, 'primitives', root.listMeshes().flatMap((m) => m.listPrimitives()).map((p) => p.getMaterial()?.getName()));
console.log(JSON.stringify({ min: body.min, max: body.max, anchors }));
console.log('bytes', fs.statSync('../female-body.glb').size);
