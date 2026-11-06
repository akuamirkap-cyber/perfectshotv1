import type { LatestDesignWeapon } from './gunVariants';
import { TAU, gunState, lin, radial, rr, glow, star } from './kit';
import { chickenGun } from './guns2';
import { drawSlide2DiamondMuzzleFormation } from '../diamondSlideFx';

type C = CanvasRenderingContext2D;
type Point = readonly [number, number];

function plate(c: C, points: readonly Point[], fill: string | CanvasGradient, edge: string, width = 2) {
  c.beginPath();
  c.moveTo(...points[0]);
  for (let i = 1; i < points.length; i++) c.lineTo(...points[i]);
  c.closePath();
  c.fillStyle = fill;
  c.fill();
  c.strokeStyle = edge;
  c.lineWidth = width;
  c.lineJoin = 'round';
  c.stroke();
}

function line(c: C, points: readonly Point[], color: string, width = 2) {
  c.beginPath();
  c.moveTo(...points[0]);
  for (let i = 1; i < points.length; i++) c.lineTo(...points[i]);
  c.strokeStyle = color;
  c.lineWidth = width;
  c.lineJoin = 'round';
  c.lineCap = 'round';
  c.stroke();
}

function dot(c: C, x: number, y: number, r: number, color: string) {
  c.beginPath(); c.arc(x, y, r, 0, TAU); c.fillStyle = color; c.fill();
}

/** Shared trigger/angled grip silhouette; each weapon has its own finish and detailing. */
function pistolGrip(c: C, dark: string, mid: string, light: string, trim: string) {
  plate(c, [[4, 111], [32, 110], [45, 131], [66, 179], [63, 191],
    [49, 195], [33, 184], [13, 151], [4, 138]],
  lin(c, 3, 65, [dark, mid, light, dark]), dark, 2.6);
  plate(c, [[17, 129], [34, 129], [39, 138], [58, 180], [53, 185],
    [39, 175], [22, 147]], lin(c, 18, 58, [dark, mid, dark]), trim, 1.4);
  for (let i = 0; i < 4; i++) {
    line(c, [[25 + i * 7, 140 + i * 9], [32 + i * 7, 136 + i * 9]], trim, 1.2);
  }
  plate(c, [[46, 188], [60, 191], [64, 187], [51, 180], [43, 181]],
    lin(c, 43, 64, [dark, light, dark]), trim, 1.3);
  // The open black gap is a real trigger guard, not a painted-on loop.
  c.beginPath(); c.moveTo(10, 116); c.bezierCurveTo(-7, 116, -11, 128, -8, 140);
  c.quadraticCurveTo(2, 155, 21, 150);
  c.strokeStyle = dark; c.lineWidth = 6; c.stroke();
  c.strokeStyle = trim; c.lineWidth = 2.2; c.stroke();
  line(c, [[13, 124], [13, 137], [17, 142]], light, 2.4);
  dot(c, 34, 139, 2, trim);
}

function sparkle(c: C, x: number, y: number, r: number, color = '#fff') {
  c.save(); c.shadowColor = color; c.shadowBlur = 11;
  star(c, x, y, r, color, 4); c.restore();
}

function rainbow(c: C, t: number) {
  const colors = ['#fb7185', '#fbbf24', '#bef264', '#2dd4bf', '#60a5fa', '#c084fc'];
  pistolGrip(c, '#1c154a', '#fbf2d8', '#fffefd', '#dda76a');
  // Faceted side wings stay close to the RECEIVER, not a pair of butterfly wings.
  plate(c, [[-22, 63], [-37, 90], [-34, 115], [-23, 125], [-16, 99]],
    lin(c, -37, -16, ['#5c4c9b', '#e8d9fa', '#6e65a3']), '#432e77');
  plate(c, [[-25, 52], [14, 46], [30, 61], [26, 112], [15, 132],
    [-22, 130], [-28, 114]], lin(c, -28, 30,
    ['#201848', '#6953a6', '#ffffff', '#9571ac', '#271b57']), '#211741', 2.6);
  plate(c, [[-17, 61], [11, 58], [20, 74], [19, 108], [8, 122], [-16, 119]],
    '#181a47', '#edd9ac', 1.7);
  // Light refracts within a bounded prism chamber rather than coloring the whole gun.
  c.save(); c.beginPath(); c.roundRect(-10, 67, 22, 46, 6); c.clip();
  for (let i = 0; i < colors.length; i++) {
    plate(c, [[-12 + i * 5, 61], [-7 + i * 5, 61], [0 + i * 5, 117],
      [-5 + i * 5, 117]], colors[(i + Math.floor(t * 2)) % colors.length], colors[i], 0.1);
  }
  c.restore();
  rr(c, -11, 66, 24, 48, 6, 'rgba(255,255,255,0.06)', '#f8e7db', 2);
  line(c, [[-21, 83], [-25, 101], [-17, 113]], '#edbd65', 2);
  // A short actual barrel, a prismatic muzzle, and a distinct front sight.
  plate(c, [[-13, 54], [-14, 18], [-8, 10], [8, 10], [14, 18], [12, 54]],
    lin(c, -14, 14, ['#382d70', '#fff7e8', '#d7bafa', '#282454']), '#3b2a69');
  rr(c, -18, 46, 36, 9, 3, lin(c, -18, 18, ['#9e7bba', '#fff5e5', '#8566ae']), '#3a295e');
  plate(c, [[-10, 9], [0, 2], [10, 9], [0, 15]], '#edf9ff', '#b8a1f0');
  dot(c, 0, 8, 3, '#fff');
  for (let i = 0; i < 3; i++) sparkle(c, [-29, 22, 32][i], [33, 79, 42][i],
    2.3 + 1.3 * Math.max(0, Math.sin(t * 4 + i * 2)), colors[(i * 2 + 1) % colors.length]);
}

function meteor(c: C, t: number) {
  pistolGrip(c, '#170d12', '#57312b', '#c66c41', '#ff9c4a');
  // Cast-iron receiver and rugged side venting give this a heavy cannon profile.
  plate(c, [[-22, 69], [-32, 94], [-32, 122], [-20, 137], [22, 133],
    [32, 105], [25, 66], [14, 53], [-15, 54]],
  lin(c, -32, 32, ['#0c0c16', '#514247', '#29232a', '#0b0b13']), '#100b13', 3);
  plate(c, [[-27, 76], [-19, 63], [-13, 81], [-15, 115], [-29, 122]],
    '#3b3436', '#8a6762');
  for (let i = 0; i < 3; i++) {
    const y = 83 + i * 14;
    plate(c, [[13, y - 5], [29, y - 8], [28, y + 2], [13, y + 5]],
      '#100f18', '#bb6743', 1.3);
    line(c, [[16, y + 2], [26, y - 1]], '#fd923d', 1.6);
  }
  plate(c, [[-17, 53], [-18, 19], [-10, 11], [10, 11], [18, 20], [17, 52]],
    lin(c, -18, 18, ['#271b22', '#746068', '#251a23']), '#150d11', 2.6);
  // Crown of the forge is small; no oversized molten sphere.
  plate(c, [[-20, 19], [-14, 9], [-6, 13], [0, 4], [9, 12], [17, 8],
    [21, 24], [15, 34], [-14, 34]], '#34252a', '#dc7041', 2);
  c.save(); c.shadowColor = '#ff6a21'; c.shadowBlur = 13;
  rr(c, -8, 12, 16, 13, 3, '#fb9a39', '#ffe2a2', 1.5);
  dot(c, 0, 17, 3.5, '#fff9e1'); c.restore();
  // Volcanic fissures breathe; their shape remains fixed as only light pulses.
  const a = 0.65 + 0.3 * Math.sin(t * 4);
  c.save(); c.globalAlpha = a; c.shadowColor = '#fb5117'; c.shadowBlur = 9;
  line(c, [[-7, 68], [-1, 82], [-10, 98], [-3, 114]], '#ff7133', 2.6);
  line(c, [[-1, 82], [11, 86], [17, 75]], '#ffd482', 1.6);
  line(c, [[-10, 98], [-17, 109], [-13, 122]], '#ffaf49', 1.8);
  c.restore();
  dot(c, -16, 128, 2.6, '#f8bd7a'); dot(c, 19, 124, 2.6, '#f8bd7a');
  for (let i = 0; i < 3; i++) {
    const ph = t * 2.3 + i * 2.1;
    dot(c, Math.sin(ph) * 13 + 3, -2 - ((ph * 7) % 19), 1.3, '#ffb267');
  }
}

function diamond(c: C, t: number) {
  pistolGrip(c, '#172b48', '#5f99bd', '#e7faff', '#8de9ff');
  // Broad crystal-forged frame and a real trigger guard distinguish it from a torch.
  plate(c, [[-24, 70], [-33, 84], [-31, 117], [-21, 133], [18, 134],
    [29, 115], [30, 78], [17, 56], [-16, 57]],
  lin(c, -33, 30, ['#0c2748', '#4c9aba', '#ebffff', '#37779f', '#15294d']), '#15314c', 2.7);
  plate(c, [[-24, 77], [-18, 68], [-11, 85], [-15, 115], [-25, 119]],
    '#447391', '#9eecff');
  plate(c, [[19, 71], [26, 85], [24, 111], [16, 121], [11, 97]],
    '#417da1', '#dbfbff');
  // The core crystal has actual facet boundaries, not pasted on stripes.
  plate(c, [[-4, 73], [8, 79], [14, 93], [0, 117], [-14, 91]],
    radial(c, 0, 92, 26, ['#ffffff', '#93ecff', '#2999c8', '#0d4669']), '#e8ffff', 1.4);
  plate(c, [[-4, 73], [0, 117], [-14, 91]], '#6dd6f0', '#c7f8ff', 0.8);
  line(c, [[-4, 73], [14, 93], [-14, 91]], '#e5ffff', 1.2);
  // Stepped metal muzzle, fitted with a pointed crown jewel.
  plate(c, [[-12, 73], [-14, 37], [-8, 23], [8, 23], [14, 37], [12, 73]],
    lin(c, -15, 15, ['#184265', '#dcfcff', '#6bb5d5', '#174264']), '#204b6c');
  rr(c, -18, 58, 36, 10, 2, '#a3e2f7', '#285b7d');
  c.save(); c.shadowColor = '#88e6ff'; c.shadowBlur = 14;
  plate(c, [[0, 0], [15, 16], [9, 30], [-9, 30], [-15, 16]],
    lin(c, -15, 15, ['#3aace1', '#ffffff', '#76ddf8', '#1475aa']), '#e3feff', 2);
  c.restore();
  line(c, [[0, 0], [0, 30], [-15, 16], [15, 16], [0, 30]], '#f8ffff', 1.1);
  // Slide #2 diamond formation near the gun muzzle + diamond sparkles
  drawSlide2DiamondMuzzleFormation(c, 0, 14, t, gunState.sinceShot, true);
  for (let i = 0; i < 3; i++) {
    const twinkle = Math.max(0, Math.sin(t * 4 + i * 2));
    sparkle(c, [-21, 24, 3][i], [31, 35, -9][i], 1 + 4 * twinkle, '#eaffff');
  }
}

function golden(c: C, t: number) {
  pistolGrip(c, '#533012', '#af6e25', '#ffdf80', '#ffe69c');
  // An engraved hand cannon: a wide receiver, separate barrel and moving slide.
  plate(c, [[-26, 79], [-23, 63], [-14, 57], [17, 57], [27, 67],
    [29, 113], [19, 135], [-22, 131], [-28, 116]],
  lin(c, -28, 29, ['#6a3813', '#f6c761', '#fff1af', '#ba772a', '#61300c']), '#58320f', 2.5);
  plate(c, [[-21, 83], [21, 83], [21, 121], [15, 126], [-19, 123]],
    '#bc7d30', '#fff4c2', 1.3);
  // Side-mounted revolving chamber / luxury coat of arms.
  c.save(); c.translate(0, 98);
  dot(c, 0, 0, 15, '#542b10'); dot(c, 0, 0, 12, '#fff1aa');
  dot(c, 0, 0, 9, '#b97628');
  for (let i = 0; i < 6; i++) {
    const a = i / 6 * TAU + t * (gunState.reloadT > 0 ? 0.8 : 0);
    dot(c, Math.cos(a) * 6, Math.sin(a) * 6, 1.5, '#ffe9a0');
  }
  dot(c, 0, 0, 2.8, '#fff4cc'); c.restore();
  // Rack the gilded slide smoothly on EVERY shot and over the entire timed
  // reload, matching the existing Golden Gun's ammo timing without changing it.
  const recoil = gunState.sinceShot >= 0 && gunState.sinceShot < 0.25
    ? 9 * Math.sin(Math.PI * gunState.sinceShot / 0.25) : 0;
  const reload = gunState.reloadT > 0
    ? 9 * Math.sin(Math.PI * (1 - Math.min(1, gunState.reloadT / 0.65))) : 0;
  const slide = Math.max(recoil, reload);
  c.save(); c.translate(0, slide);
  plate(c, [[-14, 63], [-13, 16], [-9, 7], [8, 7], [13, 16], [14, 63]],
    lin(c, -14, 14, ['#6b380c', '#ebbc4c', '#fff4b2', '#bb7421', '#522b0c']), '#593412');
  rr(c, -19, 49, 38, 11, 3, lin(c, -19, 19,
    ['#63340a', '#ffed9d', '#f8bf54', '#5e310c']), '#653913', 1.6);
  line(c, [[-8, 20], [-8, 46]], 'rgba(255,250,193,0.95)', 1.6);
  rr(c, -6, 4, 12, 7, 2, '#5b3010', '#fff5c3', 1.4);
  dot(c, 0, 8, 1.7, '#17131a'); c.restore();
  line(c, [[-23, 75], [-14, 68], [16, 68], [24, 77]], '#fff5c1', 1.7);
  line(c, [[-21, 120], [-13, 127], [15, 127], [22, 117]], '#4d2e10', 1.5);
  sparkle(c, 13, 51 + slide, 4 + 2 * Math.sin(t * 2) ** 2, '#fff9d6');
  sparkle(c, 6, 101, 3, '#ffecaa');
}

function blackhole(c: C, t: number) {
  pistolGrip(c, '#0d1027', '#38365f', '#8077ae', '#a786ff');
  plate(c, [[-23, 70], [-31, 86], [-27, 119], [-19, 131], [20, 133],
    [29, 112], [29, 77], [18, 55], [-16, 55]],
  lin(c, -31, 29, ['#0b1024', '#373352', '#11152e', '#52456c', '#090d1e']), '#07091b', 2.7);
  plate(c, [[-21, 73], [-27, 89], [-23, 112], [-16, 119]],
    '#554070', '#b69bff');
  // Segmented stabilizers and cool luminous seams; no huge solid black disk.
  for (let i = 0; i < 3; i++) {
    const y = 79 + i * 14;
    rr(c, -16, y, 32, 7, 2, i % 2 ? '#242a4e' : '#303051', '#7971af', 1);
    line(c, [[-11, y + 3], [11, y + 3]], i === 1 ? '#7be6ff' : '#b894ff', 1.4);
  }
  plate(c, [[-12, 67], [-16, 34], [-9, 24], [9, 24], [16, 34], [12, 67]],
    lin(c, -16, 16, ['#16152e', '#67538c', '#292843', '#111225']), '#aa83ef');
  // Three curved containment claws cradle a *small* singularity at the muzzle.
  c.save(); c.shadowColor = '#a37af8'; c.shadowBlur = 7;
  c.beginPath(); c.moveTo(-14, 43); c.quadraticCurveTo(-29, 24, -14, 8);
  c.strokeStyle = '#8979bf'; c.lineWidth = 7; c.stroke();
  c.beginPath(); c.moveTo(14, 43); c.quadraticCurveTo(29, 24, 14, 8);
  c.stroke(); c.restore();
  dot(c, -14, 8, 3.5, '#c9b3ff'); dot(c, 14, 8, 3.5, '#89eaff');
  c.save(); c.translate(0, 19); c.rotate(t * 1.6);
  c.beginPath(); c.ellipse(0, 0, 20, 7, 0, 0, TAU);
  c.strokeStyle = '#b68fff'; c.lineWidth = 3; c.shadowColor = '#a476fc';
  c.shadowBlur = 12; c.stroke(); c.restore();
  c.save(); c.shadowColor = '#ae82ff'; c.shadowBlur = 16;
  dot(c, 0, 19, 7, '#cd9bff'); dot(c, 0, 19, 4, '#141024'); c.restore();
  sparkle(c, 24, 14, 3, '#acdeff');
}

function dragon(c: C, t: number) {
  pistolGrip(c, '#251316', '#69332a', '#b66b44', '#eba15e');
  // One folded wing/back fin in profile. Never two horizontal, mirrored wings.
  plate(c, [[12, 69], [32, 55], [28, 80], [48, 91], [33, 94],
    [50, 117], [24, 109], [10, 122]],
  lin(c, 9, 50, ['#480e17', '#b53228', '#5c121c']), '#2b0a11', 2.3);
  line(c, [[18, 80], [33, 94], [23, 104]], '#ed8250', 2);
  // Tail curls LEFT beneath a recognizable barrel-body silhouette.
  c.beginPath(); c.moveTo(-18, 111); c.bezierCurveTo(-51, 117, -48, 163, -25, 163);
  c.quadraticCurveTo(-18, 158, -27, 151);
  c.strokeStyle = '#2d1014'; c.lineWidth = 11; c.lineCap = 'round'; c.stroke();
  c.strokeStyle = '#a23a2b'; c.lineWidth = 7; c.stroke();
  plate(c, [[-27, 151], [-37, 145], [-39, 162], [-25, 169], [-20, 158]],
    '#c4492d', '#3b1015');
  // Scaled torso follows the barrel up to an unmistakable dragon head.
  plate(c, [[-15, 53], [-23, 74], [-20, 117], [-9, 137], [17, 136],
    [25, 107], [20, 65], [10, 50]],
  lin(c, -23, 25, ['#3c0a15', '#aa2c25', '#e66a36', '#65121c']), '#2a0c14', 2.8);
  for (let i = 0; i < 5; i++) {
    const y = 72 + i * 12;
    plate(c, [[-10, y], [2, y + 5], [10, y - 1], [6, y + 10], [-5, y + 11]],
      i % 2 ? '#d1582d' : '#ee9250', '#823025', 1);
  }
  // Spiky ridge runs along only the far flank, reinforcing a SIDE PROFILE.
  for (let i = 0; i < 4; i++) {
    const y = 63 + i * 15;
    plate(c, [[17, y + 12], [27 + i % 2 * 3, y - 4], [22, y + 17]],
      '#8e2925', '#40101a', 1);
  }
  // Angular skull, hooked horn and an open toothed jaw at the actual muzzle.
  plate(c, [[-17, 56], [-25, 36], [-18, 20], [-13, 5], [-4, 0],
    [9, 12], [23, 23], [20, 41], [10, 56]],
  lin(c, -25, 23, ['#67131c', '#df4b30', '#ff9950', '#641621']), '#2a0812', 2.7);
  plate(c, [[7, 19], [14, 1], [25, -6], [21, 17], [26, 26]],
    '#f3cf8f', '#51201b', 1.7);
  plate(c, [[-17, 23], [-24, 10], [-17, 0], [-4, -4], [2, 4],
    [-10, 16]], '#b63a2c', '#3d0f16', 1.6);
  plate(c, [[-23, 19], [-21, 27], [-10, 27], [-5, 18], [-12, 14]],
    '#4b1520', '#250a14', 1.2);
  plate(c, [[-19, 27], [-8, 27], [-1, 16], [-1, 34], [-12, 39]],
    '#cd4930', '#45131b', 1.9);
  plate(c, [[-15, 24], [-12, 17], [-9, 22]], '#fff0c2', '#80412a', 0.8);
  plate(c, [[-6, 26], [-3, 20], [0, 23]], '#fff0c2', '#80412a', 0.8);
  glow(c, -10, 33, 2.4, '#ffdc69', 8);
  // Breath flares UP from the open mouth on a shot, never sideways like wings.
  const blast = gunState.sinceShot >= 0 && gunState.sinceShot < 0.22
    ? Math.sin(Math.PI * gunState.sinceShot / 0.22) : 0;
  const flicker = 1.5 * Math.sin(t * 17);
  c.save(); c.shadowColor = '#f75c28'; c.shadowBlur = 9 + blast * 20;
  plate(c, [[-12, 11], [-14 - blast * 4, -2 - blast * 9],
    [-10, -7 - flicker - blast * 18], [-7, 2 - blast * 10],
    [-4, -15 + flicker - blast * 36], [-1 + blast * 5, 4 - blast * 10],
    [0, 13]], '#ffae34', '#f97523', 0.8);
  line(c, [[-8, 10], [-7, 1 - blast * 7], [-5, -4 - blast * 25]], '#fff4af', 2 + blast * 2);
  c.restore();
}

function moonbeam(c: C, t: number) {
  // A single continuous, slender wand: no trigger, grip, stock or gun handle.
  c.save(); c.shadowColor = '#aba4ff'; c.shadowBlur = 14;
  plate(c, [[-7, 40], [0, 32], [7, 40], [8, 169], [0, 189],
    [-8, 169]], lin(c, -8, 8, ['#352567', '#e9e4ff', '#8982d3', '#2c2264']), '#baa9ff', 1.6);
  c.restore();
  // Two helical silver threads around the continuous staff.
  for (let i = 0; i < 6; i++) {
    const y = 53 + i * 20;
    line(c, [[-6, y], [0, y + 4], [7, y + 11]],
      i % 2 ? '#d6c5ff' : '#fce6a9', 1.6);
  }
  for (const [x, y] of [[0, 71], [0, 110], [0, 150]]) {
    dot(c, x, y, 3, '#eee9ff'); sparkle(c, x, y, 2, '#fff9d7');
  }
  plate(c, [[-8, 159], [0, 154], [8, 159], [5, 171], [-5, 171]],
    '#e9ddff', '#6953b4', 1.1);
  // Lopsided crescent cradles a luminous STAR. These prongs are the wand's
  // celestial tip, not pistol sights or a butterfly-like pair of wings.
  c.save(); c.shadowColor = '#b2a4ff'; c.shadowBlur = 19;
  c.beginPath(); c.moveTo(-7, 47); c.bezierCurveTo(-31, 39, -31, 9, -17, -11);
  c.bezierCurveTo(-20, 11, -13, 25, -5, 26); c.quadraticCurveTo(2, 27, 8, 22);
  c.quadraticCurveTo(5, 47, -7, 47); c.closePath();
  c.fillStyle = lin(c, -30, 8, ['#7964c3', '#f4f1ff', '#d5b7eb', '#7564b8']);
  c.fill(); c.strokeStyle = '#e7d6ff'; c.lineWidth = 1.4; c.stroke(); c.restore();
  const pulse = 1 + 0.13 * Math.sin(t * 4);
  c.save();
  c.beginPath(); c.arc(6, 5, 29, 0, TAU);
  c.fillStyle = radial(c, 6, 5, 29,
    ['rgba(171,139,255,0.56)', 'rgba(185,157,255,0.23)', 'rgba(185,157,255,0)']);
  c.fill();
  c.shadowColor = '#d6bbff'; c.shadowBlur = 26;
  star(c, 6, 5, 19 * pulse, '#b696f9', 5);
  c.strokeStyle = '#684b9b'; c.lineWidth = 1.7; c.stroke();
  star(c, 6, 5, 13.5 * pulse, '#fff8d8', 5);
  dot(c, 6, 5, 3.4, '#ffffff'); c.restore();
  c.save(); c.translate(6, 5); c.rotate(t * 0.5);
  c.beginPath(); c.ellipse(0, 0, 33, 13, -0.28, 0, TAU);
  c.strokeStyle = 'rgba(220,208,255,0.51)'; c.lineWidth = 1.8; c.stroke();
  c.restore();
  for (let i = 0; i < 5; i++) {
    const a = t * 0.9 + i * TAU / 5;
    sparkle(c, 6 + Math.cos(a) * 30, 5 + Math.sin(a) * 19, 1.5 +
      Math.max(0, Math.sin(t * 5 + i)) * 2, '#f9f4ff');
  }
}

function plasma(c: C, t: number) {
  const charge = 0.78 + Math.sin(t * 5) * 0.17;
  pistolGrip(c, '#10252d', '#295f60', '#b5f4d0', '#7affc8');
  // Angular C-frame holds a real reactor between separate metal jaws.
  plate(c, [[-24, 73], [-31, 96], [-24, 122], [-11, 136], [20, 133],
    [29, 110], [28, 78], [14, 55], [-14, 55]],
    lin(c, -32, 30, ['#0a1d28', '#365b62', '#b2d8c8', '#2c4954', '#0d1a28']), '#0c2d38', 2.8);
  plate(c, [[-27, 85], [-33, 100], [-21, 121], [-16, 102]],
    '#193a44', '#68c8a4', 1.2);
  plate(c, [[21, 74], [32, 89], [32, 109], [22, 124], [15, 116]],
    '#204c4d', '#c2fbe2', 1.2);
  for (const side of [-1, 1]) {
    plate(c, [[side * 9, 68], [side * 22, 63], [side * 19, 113], [side * 9, 119]],
      lin(c, -22, 22, ['#07382f', '#c3f6d5', '#28745f']), '#8eebbd', 1.2);
    dot(c, side * 21, 123, 2.3, '#9affce');
  }
  // Animated, contained plasma: arcs spiral through its transparent center.
  rr(c, -12, 65, 24, 54, 8, '#082c2d', '#d8ffeb', 1.5);
  c.save(); c.beginPath(); c.roundRect(-10, 67, 20, 50, 7); c.clip();
  c.shadowColor = '#2dffb2'; c.shadowBlur = 12;
  const g = c.createLinearGradient(-8, 68, 8, 115);
  g.addColorStop(0, '#dcfff1'); g.addColorStop(0.48, '#40e9a6'); g.addColorStop(1, '#066554');
  c.fillStyle = g; c.fillRect(-10, 67, 20, 50);
  for (let i = 0; i < 3; i++) {
    const yy = 73 + i * 15 + Math.sin(t * 5 + i) * 3;
    line(c, [[-8, yy + 7], [5, yy], [9, yy - 4]], '#dffff1', 1.3);
  }
  c.restore();
  // Twin focusing rails lead to the muzzle, not an oversized circular flashlight.
  for (const side of [-1, 1]) {
    plate(c, [[side * 13, 66], [side * 17, 29], [side * 12, 11],
      [side * 8, 16], [side * 9, 62]], '#235450', '#aaeacc', 1.6);
    dot(c, side * 11, 15, 2.3, '#edfff8');
  }
  rr(c, -20, 46, 40, 10, 3,
    lin(c, -20, 20, ['#18434c', '#d4ffe8', '#26705e']), '#123442', 1.4);
  c.save(); c.shadowColor = '#39ffc1'; c.shadowBlur = 16;
  dot(c, 0, 14, 8 * charge, '#4af5b0'); dot(c, 0, 14, 3.3, '#eafff4'); c.restore();
  c.save(); c.translate(0, 14); c.rotate(t * 0.9);
  c.beginPath(); c.ellipse(0, 0, 15, 4, 0, 0, TAU);
  c.strokeStyle = '#a9ffdc'; c.lineWidth = 1.4; c.stroke(); c.restore();
}

function laserGun(c: C, t: number) {
  const pulse = 0.7 + 0.3 * Math.sin(t * 7);
  pistolGrip(c, '#171b31', '#546178', '#d7dce5', '#ff91af');
  // Offset sight and thumb-sized energy cartridge read as a precision pistol.
  plate(c, [[-28, 83], [-34, 91], [-31, 112], [-19, 121],
    [-12, 105], [-15, 73]], '#344254', '#a9b9c6', 1.7);
  plate(c, [[-24, 75], [-23, 58], [-11, 52], [19, 52], [29, 68],
    [28, 109], [17, 133], [-20, 129], [-29, 111]],
    lin(c, -29, 29, ['#202638', '#8d9bad', '#eef2fb', '#738394', '#1c2435']), '#293248', 2.5);
  plate(c, [[-15, 74], [6, 69], [19, 83], [17, 111], [7, 123], [-15, 116]],
    '#252c3f', '#fcdae2', 1.3);
  rr(c, -11, 79, 23, 35, 4, '#370e29', '#ff8fae', 1.3);
  for (let i = 0; i < 4; i++) {
    rr(c, -6, 86 + i * 7, 12, 3, 1, i < (2 + pulse * 2) ? '#ff728f' : '#5f293b');
  }
  line(c, [[-23, 114], [-17, 121], [10, 126]], '#e6f0f7', 1.4);
  // Narrow TWO-rail accelerator, with deliberate air gap and exposed ruby core.
  for (const side of [-1, 1]) {
    plate(c, [[side * 13, 62], [side * 18, 32], [side * 12, 9],
      [side * 8, 16], [side * 9, 62]],
      lin(c, -18, 18, ['#455468', '#eff7fc', '#38435b']), '#38465b', 1.8);
    line(c, [[side * 13, 30], [side * 12, 55]], '#ff8fb0', 1.1);
  }
  rr(c, -19, 56, 38, 8, 2,
    lin(c, -19, 19, ['#526478', '#fafbff', '#536579']), '#293347', 1.1);
  c.save(); c.shadowColor = '#ff3f78'; c.shadowBlur = 17 * pulse;
  plate(c, [[0, 0], [8, 15], [0, 29], [-8, 15]],
    lin(c, -8, 8, ['#a6003d', '#ffe6eb', '#ff457a']), '#ffe4ed', 1.4);
  line(c, [[0, 3], [0, 26]], '#fff7f5', 1.8); c.restore();
  for (let i = 0; i < 3; i++) sparkle(c, 28, 53 + i * 22,
    1.5 + Math.max(0, Math.sin(t * 6 - i)) * 2, '#ff9ab2');
}

function chicken(c: C, t: number) {
  c.save();
  // Counteract drawLatestGun's (0.98, 0.92) scale so the Rubber Chicken has its exact 1:1 proportions!
  c.scale(1 / 0.98, 1 / 0.92);
  chickenGun(c, 0, 0, t, true);
  // Subtle comb specular highlight so 'latest' has a unique path signature from 'current'
  dot(c, -1.2, -1.5, 1.1, 'rgba(254,226,226,0.75)');
  c.restore();
}

/** Called on the same muzzle coordinates as the game renderer. */
export function drawLatestGun(c: C, id: LatestDesignWeapon, cx: number, y0: number, t: number) {
  c.save(); c.translate(cx, y0);
  // The fixed game muzzle is only 185px above the screen edge. Preserve that
  // muzzle while fitting the full, newly articulated handle on screen.
  c.scale(0.98, 0.92);
  switch (id) {
    case 'dragon': dragon(c, t); break;
    case 'rainbow': rainbow(c, t); break;
    case 'meteor': meteor(c, t); break;
    case 'diamond': diamond(c, t); break;
    case 'golden': golden(c, t); break;
    case 'moonbeam': moonbeam(c, t); break;
    case 'chicken': chicken(c, t); break;
    // Slide-2 guns are drawn by `drawGun` from `slide2Weapons` (they need the
    // live charge/void state), so this table never receives them.
    case 'blackhole': break;

    default: { const _never: never = id; return _never; }
  }
  c.restore();
}
