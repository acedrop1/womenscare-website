// Homepage cut of the human-atlas-enhanced female study model (MIT; geometry
// BodyParts3D + HRA female, CC BY 4.0): muscles, skeleton, breast adipose and
// reproductive organs, decimated per part and meshopt-compressed into one GLB.
import { Document, NodeIO } from '@gltf-transform/core';
import { EXTMeshoptCompression, KHRMeshQuantization } from '@gltf-transform/extensions';
import { quantize } from '@gltf-transform/functions';
import { MeshoptSimplifier, MeshoptEncoder } from 'meshoptimizer';
import fs from 'node:fs';

await MeshoptSimplifier.ready; await MeshoptEncoder.ready;
const SRC = '../hae/';
const man = JSON.parse(fs.readFileSync(SRC + 'atlas-female-reconstructed.json'));
const chunks = man.chunks.map((c) => fs.readFileSync(SRC + c.url.split('/').pop()));

// part -> group, and how hard to decimate each group
function groupOf(p) {
  const n = p.name.toLowerCase();
  if (p.system === 'muscular') return 'muscle';
  if (p.system === 'skeletal' && !/gingiva|tooth|cartilage/.test(n)) return 'bone';
  if (p.system === 'mammary' && n.includes('adipose')) return 'breast';
  if (p.system === 'reproductive') return 'organ';
  return null;
}
const RATIO = { muscle: 0.12, bone: 0.1, breast: 0.25, organ: 0.4 };
const ERR = { muscle: 0.08, bone: 0.08, breast: 0.02, organ: 0.02 }; // relative to each part's size

const merged = {};
const anchors = {};
const tally = {};
for (const p of man.parts) {
  const g = groupOf(p);
  const n = p.name.toLowerCase();
  const c = (b) => b[0].map((v, i) => +((v + b[1][i]) / 2).toFixed(3));
  if (n === 'adipose tissue of left breast') anchors.breast = c(p.bounds);
  if (n === 'uterine cervix') anchors.cervix = c(p.bounds);
  if (n === 'left ovary') anchors.ovary = c(p.bounds);
  if (/^(body of uterus|uterus)$/.test(n)) anchors.uterus = c(p.bounds);
  if (!g) continue;
  const buf = chunks[p.chunk];
  const P = new Float32Array(buf.buffer.slice(buf.byteOffset + p.positions, buf.byteOffset + p.positions + p.vertexCount * 12));
  const N16 = new Int16Array(buf.buffer.slice(buf.byteOffset + p.normals, buf.byteOffset + p.normals + p.vertexCount * 6));
  const I0 = new Uint32Array(buf.buffer.slice(buf.byteOffset + p.indices, buf.byteOffset + p.indices + p.indexCount * 4));
  // source parts are split at every seam; weld by position so edges can collapse
  const key = new Map(), weldTo = new Uint32Array(p.vertexCount);
  for (let v = 0; v < p.vertexCount; v++) {
    const k = Math.round(P[v * 3] * 2e4) + ',' + Math.round(P[v * 3 + 1] * 2e4) + ',' + Math.round(P[v * 3 + 2] * 2e4);
    if (!key.has(k)) key.set(k, v);
    weldTo[v] = key.get(k);
  }
  const I = I0.map((v) => weldTo[v]);
  const target = Math.max(3, Math.floor((I.length * RATIO[g]) / 3) * 3);
  let [S] = MeshoptSimplifier.simplify(I, P, 3, target, ERR[g], []);
  // topology-bound parts (most muscles are already low-poly) need sloppy mode to reach the budget
  if ((g === 'muscle' || g === 'bone') && S.length > target * 1.3) {
    const [L] = MeshoptSimplifier.simplifySloppy(I, P, 3, null, target, 0.05);
    if (L.length < S.length) S = L;
  }
  // compact to the vertices the simplified triangles still use
  const remap = new Int32Array(p.vertexCount).fill(-1), pos = [], nor = [];
  const m = merged[g] ??= { pos: [], nor: [], idx: [], base: 0 };
  for (let k = 0; k < S.length; k++) {
    const v = S[k];
    if (remap[v] < 0) {
      remap[v] = pos.length / 3;
      pos.push(P[v * 3], P[v * 3 + 1], P[v * 3 + 2]);
      nor.push(N16[v * 3] / 32767, N16[v * 3 + 1] / 32767, N16[v * 3 + 2] / 32767);
    }
    m.idx.push(m.base + remap[v]);
  }
  m.pos.push(...pos); m.nor.push(...nor); m.base += pos.length / 3;
  tally[g] = (tally[g] ?? 0) + S.length / 3;
}

const doc = new Document();
const buffer = doc.createBuffer();
const scene = doc.createScene();
for (const [g, m] of Object.entries(merged)) {
  const prim = doc.createPrimitive()
    .setAttribute('POSITION', doc.createAccessor().setType('VEC3').setArray(new Float32Array(m.pos)).setBuffer(buffer))
    .setAttribute('NORMAL', doc.createAccessor().setType('VEC3').setArray(new Float32Array(m.nor)).setBuffer(buffer))
    .setIndices(doc.createAccessor().setType('SCALAR').setArray(new Uint32Array(m.idx)).setBuffer(buffer))
    .setMaterial(doc.createMaterial(g));
  scene.addChild(doc.createNode(g).setMesh(doc.createMesh(g).addPrimitive(prim)));
}
doc.createExtension(KHRMeshQuantization).setRequired(true);
await doc.transform(quantize());
doc.createExtension(EXTMeshoptCompression).setRequired(true).setEncoderOptions({ method: EXTMeshoptCompression.EncoderMethod.QUANTIZE });
const io = new NodeIO().registerExtensions([EXTMeshoptCompression, KHRMeshQuantization]).registerDependencies({ 'meshopt.encoder': MeshoptEncoder });
await io.write('../female-ecorche.glb', doc);
console.log('tris', tally, 'anchors', JSON.stringify(anchors), 'bytes', fs.statSync('../female-ecorche.glb').size);
