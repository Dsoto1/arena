/* =====================================================================
   rig92/rig.js — the skeleton, the pose format and the solvers for the posable 3D tokens (v0.92 groundwork)
   =====================================================================
   Space: metres, y up, the figure stands on the base top (y = 0) and faces +z; its LEFT is +x.
   Every bone's rest rotation is the identity, so a joint's euler angles read in world axes at rest:
     limbs hanging down:  +X swings the limb BACK, −X swings it FORWARD; +Z moves it toward +x (left arm/leg: out to the side)
     spine / neck / head: +X bends FORWARD, +Y turns toward its left, +Z leans toward its right
   Joint colours follow Virgilante's pose app: spine chain yellow, left side blue, right side red, hands + pelvis pink. */
import * as THREE from 'three';

export const BODY_H = 1.85;            /* crown height, metres (≈7.5 heads) */
export const SOLE_Y = 0.016;           /* foot sole height above the base top (the sandal sole fills it) */
export const MM_PER_M = 32.5 / BODY_H; /* 32.5 mm figure on a 25.4 mm base, sized beside the printed minis */
export const BASE_R = 12.7 / MM_PER_M; /* base radius in body metres (≈0.723) */
export const BASE_H = 3.2 / MM_PER_M;  /* base thickness in body metres */

const L = (x, y, z) => [x, y, z];
/* key, name, parent, rest position, handle colour group */
const LEFT = [
  ['s', 'shoulder', 'ch', L(0.190, 1.445, -0.025)],
  ['e', 'elbow', 's', L(0.305, 1.183, -0.040)],
  ['w', 'wrist', 'e', L(0.410, 0.940, -0.010)],
  ['h', 'hip', 'pe', L(0.088, 0.925, 0.000)],
  ['k', 'knee', 'h', L(0.108, 0.505, 0.014)],
  ['a', 'ankle', 'k', L(0.125, 0.095, -0.020)],
];
export const JOINTS = [
  { k: 'pe', n: 'pelvis', p: null, pos: L(0, 0.975, 0), c: 'pink' },
  { k: 'sp', n: 'spine', p: 'pe', pos: L(0, 1.100, -0.008), c: 'spine' },
  { k: 'ch', n: 'chest', p: 'sp', pos: L(0, 1.260, -0.015), c: 'spine' },
  { k: 'ne', n: 'neck', p: 'ch', pos: L(0, 1.515, -0.025), c: 'spine' },
  { k: 'he', n: 'head', p: 'ne', pos: L(0, 1.625, -0.005), c: 'spine' },
];
for (const side of ['L', 'R']) {
  const sx = side === 'L' ? 1 : -1;
  for (const [k, n, p, pos] of LEFT)
    JOINTS.push({ k: k + side, n: n + '_' + side, p: p.length === 1 ? p + side : p, pos: [pos[0] * sx, pos[1], pos[2]], c: side });
}
export const JK = Object.fromEntries(JOINTS.map(j => [j.k, j]));
/* end points (not joints): the hand tip and the toe, for handles and IK reach */
export const ENDS = { wL: L(0.474, 0.770, 0.012), wR: L(-0.474, 0.770, 0.012), aL: L(0.135, SOLE_Y, 0.165), aR: L(-0.135, SOLE_Y, 0.165) };
export const HANDLE_COL = { spine: 0xf4d03f, L: 0x3b7dd8, R: 0xd8433b, pink: 0xf28dc4 };

/* build THREE.Bones for the skeleton */
export function makeBones() {
  const bones = {}, list = [];
  for (const j of JOINTS) {
    const b = new THREE.Bone(); b.name = j.n; bones[j.k] = b; list.push(b);
    const pp = j.p ? JK[j.p].pos : [0, 0, 0];
    b.position.set(j.pos[0] - pp[0], j.pos[1] - pp[1], j.pos[2] - pp[2]);
    if (j.p) bones[j.p].add(b);
  }
  return { bones, list, root: bones.pe, index: Object.fromEntries(JOINTS.map((j, i) => [j.k, i])) };
}

/* ---------------- pose format ----------------
   { v:1,
     p:[x,y,z]            pelvis offset from rest, mm of body space (body metres × 1000), ints
     j:{ key:[x,y,z] }     joint eulers in degrees, ints, order XYZ; joints left out are 0
     f:{ L:[x,z,yaw], R:[x,z,yaw] }  a pinned foot: ankle over the base at (x,z) mm, foot yaw in degrees
                                      (the leg is solved by IK and the sole lies flat on the base)
   }  — a whole pose is ~200–450 bytes. */
export const POSE_VER = 1;
export function emptyPose() { return { v: POSE_VER, p: [0, 0, 0], j: {}, f: {} }; }
export function poseToJSON(pose) {
  const o = { v: POSE_VER };
  const p = (pose.p || [0, 0, 0]).map(v => Math.round(v));
  if (p.some(v => v)) o.p = p;
  const j = {};
  for (const J of JOINTS) {
    const e = pose.j && pose.j[J.k]; if (!e) continue;
    const r = e.map(v => Math.round(v)); if (r.some(v => v)) j[J.k] = r;
  }
  o.j = j;
  const f = {};
  for (const s of ['L', 'R']) if (pose.f && pose.f[s]) f[s] = pose.f[s].map(v => Math.round(v));
  if (Object.keys(f).length) o.f = f;
  return JSON.stringify(o);
}
export function poseFromJSON(s) {
  const o = typeof s === 'string' ? JSON.parse(s) : JSON.parse(JSON.stringify(s));
  if (o.v !== POSE_VER) throw new Error('pose version ' + o.v);
  return { v: POSE_VER, p: o.p || [0, 0, 0], j: o.j || {}, f: o.f || {} };
}

const D2R = Math.PI / 180;
const _e = new THREE.Euler(), _q = new THREE.Quaternion(), _q2 = new THREE.Quaternion(), _m = new THREE.Matrix4();
const V = (a) => new THREE.Vector3(a[0], a[1], a[2]);

/* rest lengths */
const len = (a, b) => V(JK[a].pos).distanceTo(V(JK[b].pos));
export const SEG = { thigh: len('hL', 'kL'), shin: len('kL', 'aL'), upper: len('sL', 'eL'), fore: len('eL', 'wL') };
export const ANKLE_H = JK.aL.pos[1];

/* foot outline relative to the ankle (for keeping the stance on the base): heel, toe, sides */
const FOOT_PTS = [[0, -0.075], [0, 0.205], [0.05, 0.12], [-0.05, 0.12], [0.04, -0.05], [-0.04, -0.05]];
/* keep a pinned foot on the base disc: pull the ankle toward the centre until heel and toe are inside */
export function clampFoot(x, z, yaw, margin = 0.035) {
  const R = BASE_R - margin; let s = 1;
  const c = Math.cos(yaw * D2R), sn = Math.sin(yaw * D2R);
  for (let it = 0; it < 30; it++) {
    let worst = 0;
    for (const [ox, oz] of FOOT_PTS) {
      const px = x * s + ox * c + oz * sn, pz = z * s - ox * sn + oz * c;
      worst = Math.max(worst, Math.hypot(px, pz) / R);
    }
    if (worst <= 1) break; s *= 0.97;
  }
  return [x * s, z * s];
}

/* a world quaternion of bone b (rig root space = the figure group) */
function worldQ(b, out) { b.updateWorldMatrix(true, false); b.matrixWorld.decompose(new THREE.Vector3(), out, new THREE.Vector3()); return out; }
function rootSpace(rig) { return rig.space || null; }
/* positions/rotations are taken relative to the rig's "space" object (the figure group) so the figure can be yawed on the board */
function spaceInv(rig) { const s = rootSpace(rig); if (!s) return new THREE.Matrix4(); s.updateWorldMatrix(true, false); return s.matrixWorld.clone().invert(); }
export function jointPos(rig, k) {
  const b = rig.bones[k]; b.updateWorldMatrix(true, false);
  return new THREE.Vector3().setFromMatrixPosition(b.matrixWorld).applyMatrix4(spaceInv(rig));
}
export function jointQ(rig, k) {
  const b = rig.bones[k]; b.updateWorldMatrix(true, false);
  const m = spaceInv(rig).multiply(b.matrixWorld); const q = new THREE.Quaternion(); m.decompose(new THREE.Vector3(), q, new THREE.Vector3()); return q;
}
export function endPos(rig, k) {
  /* hand tip / toe follow their bone */
  const j = JK[k], e = ENDS[k]; const off = V(e).sub(V(j.pos));
  return off.applyQuaternion(jointQ(rig, k)).add(jointPos(rig, k));
}

/* frame from a direction and a pole (bend) direction */
function frameQ(dir, pole) {
  const x = dir.clone().normalize();
  const y = pole.clone().sub(x.clone().multiplyScalar(pole.dot(x)));
  if (y.lengthSq() < 1e-8) y.set(0, 0, 1).sub(x.clone().multiplyScalar(x.z));
  y.normalize(); const z = new THREE.Vector3().crossVectors(x, y);
  _m.makeBasis(x, y, z); return new THREE.Quaternion().setFromRotationMatrix(_m);
}
/* set bone k's world (space) rotation to q, by changing its local rotation */
function setWorldQ(rig, k, q) {
  const j = JK[k]; const pq = j.p ? jointQ(rig, j.p) : new THREE.Quaternion();
  rig.bones[k].quaternion.copy(pq.invert().multiply(q)); rig.bones[k].updateMatrixWorld(true);
}

/* two-bone IK: a→b→c reaches target t, bending toward pole (space directions).  restPole = the bend direction in rest. */
export function solveTwoBone(rig, a, b, c, target, pole, restPole) {
  const A = jointPos(rig, a);
  const L1 = V(JK[a].pos).distanceTo(V(JK[b].pos)), L2 = V(JK[b].pos).distanceTo(V(JK[c].pos));
  const T = target.clone(); let d = T.distanceTo(A);
  const dmax = L1 + L2 - 1e-4, dmin = Math.abs(L1 - L2) + 1e-3;
  const axis = T.clone().sub(A).normalize(); d = Math.min(dmax, Math.max(dmin, d));
  const pn = pole.clone().sub(axis.clone().multiplyScalar(pole.dot(axis)));
  if (pn.lengthSq() < 1e-8) pn.copy(restPole); pn.normalize();
  const cosA = (L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), sinA = Math.sqrt(Math.max(0, 1 - cosA * cosA));
  const B = A.clone().add(axis.clone().multiplyScalar(L1 * cosA)).add(pn.clone().multiplyScalar(L1 * sinA));
  const C = A.clone().add(axis.clone().multiplyScalar(d));
  /* rest frames */
  const rA = V(JK[a].pos), rB = V(JK[b].pos), rC = V(JK[c].pos);
  const qU0 = frameQ(rB.clone().sub(rA), restPole), qL0 = frameQ(rC.clone().sub(rB), restPole);
  const qU = frameQ(B.clone().sub(A), pn).multiply(qU0.clone().invert());
  const qL = frameQ(C.clone().sub(B), pn).multiply(qL0.clone().invert());
  setWorldQ(rig, a, qU); setWorldQ(rig, b, qL);
  return d >= dmax - 1e-6 && T.distanceTo(A) > dmax + 1e-3 ? T.distanceTo(A) - dmax : 0;
}

/* foot pinned: ankle at (x, ANKLE_H, z), yaw degrees; knee bends toward the foot's direction (slightly out) */
export function solveFoot(rig, side, x, z, yaw) {
  const sx = side === 'L' ? 1 : -1;
  const T = new THREE.Vector3(x, ANKLE_H, z);
  const fwd = new THREE.Vector3(Math.sin(yaw * D2R), 0, Math.cos(yaw * D2R));
  const pole = fwd.clone().add(new THREE.Vector3(0.15 * sx, 0, 0));
  const miss = solveTwoBone(rig, 'h' + side, 'k' + side, 'a' + side, T, pole, new THREE.Vector3(0, 0, 1));
  setWorldQ(rig, 'a' + side, new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), yaw * D2R));
  return miss;
}
/* arm IK to a wrist target (elbow bends back and out unless a pole is given) */
export function solveArm(rig, side, target, pole) {
  const sx = side === 'L' ? 1 : -1;
  const pl = pole ? new THREE.Vector3(pole[0] * sx, pole[1], pole[2]) : new THREE.Vector3(0.35 * sx, -0.3, -1);
  return solveTwoBone(rig, 's' + side, 'e' + side, 'w' + side, target, pl, new THREE.Vector3(0, 0, -1));
}
/* a preset spec → a plain pose: FK + pinned feet, then wrists placed by arm IK (h: {L:[x,y,z] mm, …}, hp: poles, pole x mirrored per side).
   The result keeps only FK eulers + pins, so it serialises like any pose. */
export function resolveSpec(rig, spec) {
  const pose = { v: POSE_VER, p: spec.p || [0, 0, 0], j: JSON.parse(JSON.stringify(spec.j || {})), f: spec.f || {} };
  applyPose(rig, pose);
  for (const s of ['L', 'R']) {
    const h = spec.h && spec.h[s]; if (!h) continue;
    solveArm(rig, s, new THREE.Vector3(h[0] / 1000, h[1] / 1000, h[2] / 1000), spec.hp && spec.hp[s]);
  }
  const out = readPose(rig, pose.f);
  for (const s of ['L', 'R']) if (spec.j && spec.j['w' + s]) out.j['w' + s] = spec.j['w' + s].slice();
  return JSON.parse(poseToJSON(out));
}

/* put a pose on the rig. Pinned feet are solved after the FK; if a leg cannot reach, the pelvis drops (opt.drop, default on). */
export function applyPose(rig, pose, opt = {}) {
  pose = pose || emptyPose();
  for (const J of JOINTS) {
    const e = (pose.j && pose.j[J.k]) || [0, 0, 0];
    _e.set(e[0] * D2R, e[1] * D2R, e[2] * D2R, 'XYZ');
    rig.bones[J.k].quaternion.setFromEuler(_e);
  }
  const p = pose.p || [0, 0, 0], r = JK.pe.pos;
  rig.bones.pe.position.set(r[0] + p[0] / 1000, r[1] + p[1] / 1000, r[2] + p[2] / 1000);
  rig.bones.pe.updateMatrixWorld(true);
  const f = pose.f || {};
  if (f.L || f.R) {
    for (let it = 0; it < 6; it++) {
      let drop = 0;
      for (const s of ['L', 'R']) {
        if (!f[s]) continue;
        const [x, z] = clampFoot(f[s][0] / 1000, f[s][1] / 1000, f[s][2] || 0);
        const miss = solveFoot(rig, s, x, z, f[s][2] || 0);
        drop = Math.max(drop, miss);
      }
      if (!drop || opt.drop === false) break;
      rig.bones.pe.position.y -= drop + 0.002; rig.bones.pe.updateMatrixWorld(true);
    }
  }
  return rig;
}

/* read the rig back into a pose (FK eulers of every joint + the pinned feet kept as given) */
export function readPose(rig, pins) {
  const pose = emptyPose(); const r = JK.pe.pos, pp = rig.bones.pe.position;
  pose.p = [(pp.x - r[0]) * 1000, (pp.y - r[1]) * 1000, (pp.z - r[2]) * 1000];
  for (const J of JOINTS) {
    _e.setFromQuaternion(rig.bones[J.k].quaternion, 'XYZ');
    const e = [_e.x / D2R, _e.y / D2R, _e.z / D2R];
    if (e.some(v => Math.abs(v) >= 0.5)) pose.j[J.k] = e;
  }
  if (pins) for (const s of ['L', 'R']) if (pins[s]) pose.f[s] = pins[s].slice();
  return pose;
}

/* where a foot is now (for pinning a foot that was posed by FK): ankle x,z in mm + yaw */
export function footNow(rig, side) {
  const a = jointPos(rig, 'a' + side), q = jointQ(rig, 'a' + side);
  const f = new THREE.Vector3(0, 0, 1).applyQuaternion(q);
  return [a.x * 1000, a.z * 1000, Math.atan2(f.x, f.z) / D2R];
}

/* rotate joint k by a world-space (space) axis/angle — used by the editor's drag */
export function rotateJointWorld(rig, k, axis, ang) {
  const q = jointQ(rig, k); const dq = new THREE.Quaternion().setFromAxisAngle(axis.clone().normalize(), ang);
  setWorldQ(rig, k, dq.multiply(q));
}
