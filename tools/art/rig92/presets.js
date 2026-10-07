/* =====================================================================
   rig92/presets.js — pose presets for the posable tokens
   =====================================================================
   A preset is a SPEC that rig.js resolveSpec() turns into a plain pose (see rig.js for the pose format):
     p  pelvis offset (mm)        j  joint eulers (deg, XYZ; see rig.js for the axes)
     f  pinned feet {L|R: [ankle x mm, ankle z mm, foot yaw deg]} — every preset pins both feet on the base
     h  wrist targets {L|R: [x, y, z] mm in base space} placed by two-bone arm IK (shoulder + elbow)
     hp elbow pole per side [x, y, z] — x is mirrored for the right side (so +x always means "elbow out")
   The resolved pose carries only FK eulers + the pins, so a preset exports exactly like a hand-made pose.
   Weapon hand = RIGHT (red), shield / off hand = LEFT (blue). The figure faces +z; its left is +x. */
export const PRESETS = {
  stand: {
    label: 'Stand',
    spec: { p: [0, -6, 0], j: { sL: [-4, 0, -12], eL: [-14, 0, 0], sR: [-4, 0, 12], eR: [-14, 0, 0], wL: [0, -10, 0], wR: [0, 10, 0] },
      f: { L: [118, -10, 8], R: [-118, -10, -8] } },
  },
  guard: {
    label: 'Guard',
    spec: { p: [0, -85, 10],
      j: { pe: [0, -22, 0], sp: [8, 8, 0], ch: [6, 10, 0], he: [-6, 6, 0], wL: [0, 0, 0], wR: [-30, 0, 0] },
      f: { L: [150, 190, 4], R: [-150, -200, -45] },
      h: { L: [170, 1200, 330], R: [-110, 1120, 300] }, hp: { L: [1, -0.6, -0.2], R: [1, -1, -0.3] } },
  },
  lunge: {
    label: 'Lunge',
    spec: { p: [0, -215, 40],
      j: { pe: [10, -14, 0], sp: [10, 6, 0], ch: [10, 8, 0], he: [-18, 4, 0], wR: [-10, 0, 0] },
      f: { L: [150, 380, 4], R: [-120, -380, -30] },
      h: { L: [300, 850, -240], R: [-80, 1180, 640] }, hp: { L: [1, -0.2, -1], R: [1, -1, -0.2] } },
  },
  victory: {
    label: 'Victory',
    spec: { p: [0, -10, 0],
      j: { sp: [-4, 0, 0], ch: [-8, -6, 4], ne: [-6, 0, 0], he: [-16, 10, 0], wL: [0, 0, 0] },
      f: { L: [165, 20, 14], R: [-160, -30, -16] },
      h: { L: [250, 1010, 60], R: [-150, 2160, 60] }, hp: { L: [1, 0, -0.6], R: [1, 0.2, -0.3] } },
  },
  defend: {
    label: 'Defend',
    spec: { p: [0, -130, -10],
      j: { pe: [6, -24, 0], sp: [12, 12, 0], ch: [8, 10, 0], he: [-16, 4, 0], wL: [0, 60, 0], wR: [-40, 0, 0] },
      f: { L: [165, 200, 10], R: [-170, -180, -40] },
      h: { L: [-10, 1300, 340], R: [-240, 1540, -90] }, hp: { L: [1, -0.5, -0.2], R: [1, 0.2, -1] } },
  },
  taunt: {
    label: 'Taunt',
    spec: { p: [15, -18, 0],
      j: { pe: [0, 8, -4], sp: [-6, 0, 2], ch: [-10, 6, 0], ne: [-6, 0, 0], he: [-12, -12, 8], wL: [0, -80, 0], wR: [0, 80, 0] },
      f: { L: [150, 100, 18], R: [-150, -80, -26] },
      h: { L: [560, 1230, 170], R: [-560, 1230, 170] }, hp: { L: [0.4, -1, -0.4], R: [0.4, -1, -0.4] } },
  },
};
export const PRESET_ORDER = ['stand', 'guard', 'lunge', 'victory', 'defend', 'taunt'];
