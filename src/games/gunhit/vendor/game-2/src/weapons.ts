/* eslint-disable @typescript-eslint/no-explicit-any */
export type ProjKind = 'arrow' | 'bullet' | 'electro' | 'fire' | 'plasma' | 'disc' | 'wave';
export type BeamKind = 'sniper' | 'phaser' | 'proton' | 'tripod' | 'iron';

export interface Weapon {
  id: string;
  name: string;
  sub: string;
  kind: 'proj' | 'beam';
  proj?: ProjKind;
  beam?: BeamKind;
  speed: number;
  cd: number;
  muzzle: number;
  mY: number;
  col: string; // "r,g,b"
  col2: string;
  stuck: string;
  shell?: boolean;
  flash: string;
}

export const WEAPONS: Weapon[] = [
  { id: 'bow', name: 'Busur & Panah', sub: 'Recurve Bow', kind: 'proj', proj: 'arrow', speed: 1500, cd: 0.45, muzzle: 88, mY: 0, col: '255,230,180', col2: '255,255,255', stuck: 'arrow', flash: 'bow' },
  { id: 'ak47', name: 'AK-47', sub: 'Kalashnikov 7.62', kind: 'proj', proj: 'bullet', speed: 2600, cd: 0.16, muzzle: 252, mY: 0, col: '255,190,80', col2: '255,240,200', stuck: 'bullet', shell: true, flash: 'gun' },
  { id: 'rifle', name: 'Rifle M4', sub: 'Assault Rifle 5.56', kind: 'proj', proj: 'bullet', speed: 2800, cd: 0.14, muzzle: 248, mY: 0, col: '255,210,110', col2: '255,250,220', stuck: 'bullet', shell: true, flash: 'gun' },
  { id: 'rifleE', name: 'Rifle Electro', sub: 'Arc Coil Rifle', kind: 'proj', proj: 'electro', speed: 2300, cd: 0.2, muzzle: 248, mY: 0, col: '80,220,255', col2: '220,250,255', stuck: 'electro', flash: 'electro' },
  { id: 'mp5', name: 'MP5', sub: 'H&K 9mm SMG', kind: 'proj', proj: 'bullet', speed: 2400, cd: 0.1, muzzle: 184, mY: 0, col: '255,200,90', col2: '255,245,210', stuck: 'bullet', shell: true, flash: 'gun' },
  { id: 'mp5E', name: 'MP5 Electro', sub: 'Volt SMG', kind: 'proj', proj: 'electro', speed: 2200, cd: 0.13, muzzle: 184, mY: 0, col: '200,90,255', col2: '245,220,255', stuck: 'electro', flash: 'electro' },
  { id: 'sniper', name: 'Sniper Beam', sub: 'Laser Sniper', kind: 'beam', beam: 'sniper', speed: 0, cd: 0.6, muzzle: 304, mY: 0, col: '255,40,60', col2: '255,220,220', stuck: 'scorch', flash: 'sniper' },
  { id: 'dragon', name: "Dragon's Breath", sub: 'Shotgun Naga Api', kind: 'proj', proj: 'fire', speed: 1100, cd: 0.55, muzzle: 262, mY: 3, col: '255,120,20', col2: '255,230,120', stuck: 'burn', flash: 'dragon' },
  { id: 'beretta', name: 'Beretta 92', sub: 'Pistol 9mm', kind: 'proj', proj: 'bullet', speed: 2300, cd: 0.22, muzzle: 116, mY: -7, col: '255,200,100', col2: '255,245,215', stuck: 'bullet', shell: true, flash: 'gun' },
  { id: 'phaser', name: 'Phaser', sub: 'Star Trek Type-2', kind: 'beam', beam: 'phaser', speed: 0, cd: 0.4, muzzle: 112, mY: -5, col: '255,110,40', col2: '255,230,180', stuck: 'scorch', flash: 'phaser' },
  { id: 'esword', name: 'Energy Sword', sub: 'Halo Plasma Blade', kind: 'proj', proj: 'wave', speed: 1300, cd: 0.45, muzzle: 150, mY: 0, col: '90,170,255', col2: '230,245,255', stuck: 'slash', flash: 'sword' },
  { id: 'plasma', name: 'Plasmacaster', sub: 'Predator Shoulder Cannon', kind: 'proj', proj: 'plasma', speed: 1400, cd: 0.5, muzzle: 106, mY: 0, col: '60,160,255', col2: '210,240,255', stuck: 'plasma', flash: 'plasma' },
  { id: 'disc', name: 'Identity Disc', sub: 'Tron Legacy', kind: 'proj', proj: 'disc', speed: 1200, cd: 0.5, muzzle: 62, mY: 0, col: '40,230,255', col2: '230,255,255', stuck: 'disc', flash: 'disc' },
  { id: 'proton', name: 'Proton Pack', sub: 'Ghostbusters Wand', kind: 'beam', beam: 'proton', speed: 0, cd: 0.55, muzzle: 152, mY: 0, col: '255,90,40', col2: '120,180,255', stuck: 'scorch', flash: 'proton' },
  { id: 'tripod', name: 'Tripod Heat-Ray', sub: 'War of the Worlds', kind: 'beam', beam: 'tripod', speed: 0, cd: 0.6, muzzle: 138, mY: 0, col: '90,255,120', col2: '230,255,230', stuck: 'scorch', flash: 'tripod' },
  { id: 'iron', name: 'Iron Man Repulsor', sub: 'Mark Gauntlet', kind: 'beam', beam: 'iron', speed: 0, cd: 0.45, muzzle: 58, mY: 0, col: '140,220,255', col2: '255,255,255', stuck: 'scorch', flash: 'iron' },
];

// ---------- helpers ----------
export function rr(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
}
export function lg(c: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, s: [number, string][]) {
  const g = c.createLinearGradient(x0, y0, x1, y1);
  s.forEach(([o, col]) => g.addColorStop(o, col));
  return g;
}
export function poly(c: CanvasRenderingContext2D, p: number[][], fill?: any, stroke?: string, lw = 1) {
  c.beginPath();
  c.moveTo(p[0][0], p[0][1]);
  for (let i = 1; i < p.length; i++) c.lineTo(p[i][0], p[i][1]);
  c.closePath();
  if (fill) { c.fillStyle = fill; c.fill(); }
  if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw; c.stroke(); }
}
export function glow(c: CanvasRenderingContext2D, x: number, y: number, r: number, col: string, a = 1) {
  if (r <= 0) return;
  const g = c.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(${col},${a})`);
  g.addColorStop(0.4, `rgba(${col},${a * 0.35})`);
  g.addColorStop(1, `rgba(${col},0)`);
  c.fillStyle = g;
  c.beginPath();
  c.arc(x, y, r, 0, Math.PI * 2);
  c.fill();
}
export function bolt(c: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, col: string, w = 2, segs = 8, jag = 10) {
  const pts: number[][] = [[x1, y1]];
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len, ny = dx / len;
  for (let i = 1; i < segs; i++) {
    const t = i / segs;
    const o = (Math.random() - 0.5) * jag * 2 * Math.sin(Math.PI * t);
    pts.push([x1 + dx * t + nx * o, y1 + dy * t + ny * o]);
  }
  pts.push([x2, y2]);
  const path = () => { c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); pts.forEach((p) => c.lineTo(p[0], p[1])); };
  c.lineCap = 'round'; c.lineJoin = 'round';
  path(); c.strokeStyle = `rgba(${col},0.25)`; c.lineWidth = w * 5; c.stroke();
  path(); c.strokeStyle = `rgba(${col},0.9)`; c.lineWidth = w * 1.8; c.stroke();
  path(); c.strokeStyle = 'rgba(255,255,255,0.95)'; c.lineWidth = w * 0.7; c.stroke();
}

const METAL: [number, string][] = [[0, '#6b7178'], [0.35, '#3a3e44'], [0.7, '#1d1f23'], [1, '#0e0f11']];
const WOOD: [number, string][] = [[0, '#b0703a'], [0.5, '#7a4318'], [1, '#43230b']];

function shine(c: CanvasRenderingContext2D, x: number, y: number, w: number) {
  c.strokeStyle = 'rgba(255,255,255,0.22)';
  c.lineWidth = 1;
  c.beginPath(); c.moveTo(x, y); c.lineTo(x + w, y); c.stroke();
}

// ---------- weapon art (local: barrel along +x) ----------
export interface WState { t: number; ready: number; fireT: number; }

export function drawWeapon(c: CanvasRenderingContext2D, id: string, s: WState) {
  c.save();
  switch (id) {
    case 'bow': drawBow(c, s); break;
    case 'ak47': drawAK(c); break;
    case 'rifle': drawRifle(c, s, null); break;
    case 'rifleE': drawRifle(c, s, '80,220,255'); break;
    case 'mp5': drawMP5(c, s, null); break;
    case 'mp5E': drawMP5(c, s, '200,90,255'); break;
    case 'sniper': drawSniper(c, s); break;
    case 'dragon': drawDragon(c, s); break;
    case 'beretta': drawBeretta(c); break;
    case 'phaser': drawPhaser(c, s); break;
    case 'esword': drawSword(c, s); break;
    case 'plasma': drawPlasma(c, s); break;
    case 'disc': drawDiscW(c, s); break;
    case 'proton': drawProton(c, s); break;
    case 'tripod': drawTripod(c, s); break;
    case 'iron': drawIron(c, s); break;
  }
  c.restore();
}

export function drawArrowShape(c: CanvasRenderingContext2D, len: number) {
  // tip at x=0, shaft toward -x
  c.fillStyle = lg(c, 0, -2, 0, 2, [[0, '#e8c58a'], [1, '#8a5a2a']]);
  c.fillRect(-len, -1.6, len - 12, 3.2);
  // head
  poly(c, [[2, 0], [-14, -5], [-11, 0], [-14, 5]], lg(c, 0, -5, 0, 5, [[0, '#f2f4f7'], [0.5, '#9aa3ad'], [1, '#4b525a']]));
  // nock
  c.fillStyle = '#e33'; c.fillRect(-len - 3, -2, 4, 4);
  // fletching
  for (const sgn of [-1, 1]) {
    poly(c, [[-len + 22, sgn * 1.5], [-len + 2, sgn * 9], [-len - 1, sgn * 8], [-len + 4, sgn * 1.5]], sgn < 0 ? '#ff3d5a' : '#ffd23d');
  }
  c.fillStyle = '#fff'; c.fillRect(-len + 26, -2, 3, 4);
}

function drawBow(c: CanvasRenderingContext2D, s: WState) {
  const ft = s.fireT;
  const pull = s.ready;
  const vib = ft < 0.5 ? Math.sin(ft * 90) * 6 * Math.exp(-ft * 9) : 0;
  const nockX = -22 - pull * 46 + (pull < 0.05 ? vib : 0);
  const tipX = -26, tipY = 104;
  // string
  c.strokeStyle = 'rgba(250,245,230,0.95)'; c.lineWidth = 1.4;
  c.beginPath(); c.moveTo(tipX, -tipY); c.lineTo(nockX, 0); c.lineTo(tipX, tipY); c.stroke();
  // limbs
  for (const sg of [-1, 1]) {
    c.beginPath();
    c.moveTo(4, sg * 16);
    c.quadraticCurveTo(34, sg * 62, 2, sg * 96);
    c.quadraticCurveTo(-8, sg * 106, tipX - 6, sg * (tipY + 4));
    c.quadraticCurveTo(-6, sg * 98, -4, sg * 94);
    c.quadraticCurveTo(22, sg * 60, -6, sg * 16);
    c.closePath();
    c.fillStyle = lg(c, -10, 0, 30, 0, [[0, '#2a1608'], [0.5, '#8e4e1f'], [1, '#c98a4a']]);
    c.fill();
    c.strokeStyle = '#f0c060'; c.lineWidth = 0.8;
    c.beginPath(); c.moveTo(2, sg * 20); c.quadraticCurveTo(27, sg * 62, 0, sg * 93); c.stroke();
  }
  // riser
  rr(c, -8, -24, 18, 48, 6); c.fillStyle = lg(c, -8, 0, 10, 0, [[0, '#1b1b1f'], [0.5, '#474b52'], [1, '#141416']]); c.fill();
  rr(c, -7, -10, 16, 20, 4); c.fillStyle = '#5a2c12'; c.fill();
  c.strokeStyle = 'rgba(0,0,0,0.5)';
  for (let i = -8; i < 10; i += 3) { c.beginPath(); c.moveTo(-7, i); c.lineTo(9, i + 2); c.stroke(); }
  c.fillStyle = '#f0c060'; c.beginPath(); c.arc(1, -18, 2, 0, 7); c.fill();
  // arrow
  if (pull > 0.02) {
    c.save(); c.globalAlpha = Math.min(1, pull * 3);
    c.translate(nockX + 150, 0); drawArrowShape(c, 150); c.restore();
  }
}

function drawAK(c: CanvasRenderingContext2D) {
  // stock kayu dengan buttpad karet
  poly(c, [[-106, -6], [-26, -11], [-26, 9], [-106, 26]], lg(c, 0, -10, 0, 26, WOOD));
  c.fillStyle = '#1a1a1a'; c.fillRect(-110, -6, 5, 32);
  // receiver besi dengan rivet
  rr(c, -28, -13, 100, 24, 3); c.fillStyle = lg(c, 0, -13, 0, 11, METAL); c.fill();
  shine(c, -24, -11, 92);
  c.fillStyle = '#070708';
  for (let i = 0; i < 4; i++) c.beginPath(), c.arc(-18 + i * 22, -5, 1.3, 0, 7), c.fill();
  for (let i = 0; i < 4; i++) c.beginPath(), c.arc(-18 + i * 22, 9, 1.3, 0, 7), c.fill();
  // selector switch (besi panjang)
  rr(c, -6, -14, 56, 3, 1); c.fillStyle = '#2a2d30'; c.fill();
  c.fillStyle = '#3a3d40'; c.fillRect(40, -14, 6, 3);
  // gas tube di atas (piston cover)
  rr(c, 42, -20, 90, 9, 3); c.fillStyle = lg(c, 0, -20, 0, -11, [[0, '#5a5e64'], [0.5, '#2d3035'], [1, '#141618']]); c.fill();
  shine(c, 46, -19, 82);
  // kayu handguard
  rr(c, 72, -9, 76, 19, 5); c.fillStyle = lg(c, 0, -9, 0, 10, WOOD); c.fill();
  c.strokeStyle = 'rgba(0,0,0,0.4)'; c.lineWidth = 0.9;
  for (let x = 78; x < 140; x += 7) { c.beginPath(); c.moveTo(x, -7); c.lineTo(x, 8); c.stroke(); }
  rr(c, 88, -9, 14, 4, 2); c.fillStyle = '#3a1b08'; c.fill();
  // pistol grip kayu
  poly(c, [[22, 10], [36, 10], [30, 44], [15, 42]], lg(c, 15, 0, 36, 0, [[0, '#4a2812'], [1, '#1c0a04']]));
  c.strokeStyle = 'rgba(0,0,0,0.4)';
  for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(18, 14 + i * 4.5); c.lineTo(32, 14 + i * 4.5); c.stroke(); }
  // trigger
  c.strokeStyle = '#111'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(38, 11); c.quadraticCurveTo(46, 26, 56, 11); c.stroke();
  c.fillStyle = '#2b2d30'; c.beginPath(); c.arc(47, 17, 3, 0, Math.PI); c.fill();
  // magazen bakelit melengkung (pisang)
  c.beginPath(); c.moveTo(50, 11);
  c.lineTo(74, 11); c.quadraticCurveTo(80, 45, 102, 72); c.lineTo(80, 84); c.quadraticCurveTo(57, 50, 50, 11); c.closePath();
  c.fillStyle = lg(c, 48, 0, 100, 60, [[0, '#d67c35'], [0.4, '#a04715'], [1, '#5b2207']]); c.fill();
  c.strokeStyle = 'rgba(0,0,0,0.4)'; c.lineWidth = 1;
  for (let i = 1; i <= 5; i++) {
    c.beginPath();
    c.moveTo(52 + i * 4, 13 + i * 2);
    c.quadraticCurveTo(70 + i * 3, 26 + i * 7, 80 + i * 3.6, 60 + i * 2);
    c.stroke();
  }
  c.strokeStyle = '#1a0a04'; c.lineWidth = 1.5; c.stroke();
  // barrel + cleaning rod
  rr(c, 150, -3, 102, 6, 2); c.fillStyle = lg(c, 0, -3, 0, 3, METAL); c.fill();
  rr(c, 150, 5, 96, 2.5, 1); c.fillStyle = '#222528'; c.fill();
  shine(c, 152, -2, 98);
  // rear sight leaf
  poly(c, [[64, -20], [78, -20], [76, -30], [66, -30]], '#232527');
  c.fillStyle = '#0a0a0a'; c.fillRect(70, -29, 2, 8);
  // front sight block + post
  poly(c, [[196, -3], [208, -3], [206, -28], [198, -28]], lg(c, 196, -3, 208, -28, [[0, '#4c5158'], [1, '#1a1c1f']]));
  c.fillStyle = '#050505'; c.fillRect(200, -24, 3, 12);
  c.fillStyle = '#fff'; c.fillRect(201, -14, 1, 2);
  // muzzle brake / front cap
  rr(c, 248, -6, 10, 10, 2); c.fillStyle = lg(c, 0, -6, 0, 4, [[0, '#5a5f66'], [1, '#1a1c1f']]); c.fill();
  c.fillStyle = '#000'; c.fillRect(250, -3, 6, 4);
  // sling swivel
  c.strokeStyle = '#1c1d1f'; c.lineWidth = 2; c.beginPath(); c.arc(-4, 10, 3, 0, Math.PI); c.stroke();
}

function drawRifle(c: CanvasRenderingContext2D, s: WState, e: string | null) {
  const pulse = 0.6 + 0.4 * Math.sin(s.t * 8);
  const body = e ? [[0, '#2d3a48'], [0.5, '#151a23'], [1, '#070a0f']] as [number, string][] : [[0, '#3e4247'], [0.5, '#202327'], [1, '#0b0c0e']] as [number, string][];
  // stock AR telescoping
  poly(c, [[-92, -10], [-44, -12], [-44, -2], [-92, 0]], lg(c, 0, -12, 0, 0, [[0, '#2a2d30'], [1, '#0e0f11']]));
  poly(c, [[-92, 6], [-44, 8], [-44, 16], [-92, 22]], lg(c, 0, 6, 0, 22, [[0, '#2a2d30'], [1, '#0e0f11']]));
  c.fillStyle = '#0a0a0a'; c.fillRect(-100, -10, 8, 32);
  rr(c, -50, -6, 12, 18, 3); c.fillStyle = '#1a1c1f'; c.fill();
  // buffer tube / receiver extension
  rr(c, -44, -4, 26, 14, 2); c.fillStyle = lg(c, 0, -4, 0, 10, METAL); c.fill();
  // upper receiver
  rr(c, -18, -14, 94, 22, 3); c.fillStyle = lg(c, 0, -14, 0, 8, body); c.fill();
  shine(c, -14, -12, 86);
  // dust cover + forward assist
  rr(c, -8, -9, 40, 3, 1); c.fillStyle = '#0b0c0e'; c.fill();
  rr(c, 48, -14, 8, 3, 1); c.fillStyle = '#0b0c0e'; c.fill();
  // picatinny rail di atas
  rr(c, -12, -22, 74, 7, 2); c.fillStyle = '#141618'; c.fill();
  c.fillStyle = '#32353a'; for (let x = -10; x < 58; x += 5) c.fillRect(x, -22, 2, 3);
  // carry handle / rear sight
  poly(c, [[22, -22], [50, -22], [48, -30], [24, -30]], '#1c1e21');
  c.fillStyle = '#050505'; c.fillRect(34, -29, 3, 7);
  // pistol grip
  poly(c, [[20, 8], [34, 8], [30, 44], [16, 42]], lg(c, 16, 0, 34, 0, [[0, '#2c2f33'], [1, '#0d0e10']]));
  c.strokeStyle = 'rgba(255,255,255,0.08)'; c.lineWidth = 0.7;
  for (let i = 0; i < 7; i++) { c.beginPath(); c.moveTo(20, 12 + i * 4); c.lineTo(32, 12 + i * 4); c.stroke(); }
  // trigger guard
  c.strokeStyle = '#0b0c0e'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(36, 9); c.quadraticCurveTo(42, 22, 50, 9); c.stroke();
  // STANAG mag
  if (e) {
    rr(c, 48, 9, 22, 52, 3); c.fillStyle = '#0c1118'; c.fill();
    c.globalCompositeOperation = 'lighter';
    const gg = c.createLinearGradient(48, 0, 70, 0);
    gg.addColorStop(0, `rgba(${e},0.15)`); gg.addColorStop(0.5, `rgba(${e},${0.8 * pulse})`); gg.addColorStop(1, `rgba(${e},0.15)`);
    c.fillStyle = gg; c.fillRect(50, 12, 18, 46);
    for (let i = 0; i < 8; i++) { c.fillStyle = `rgba(${e},${0.4 + 0.5 * Math.sin(s.t * 12 + i)})`; c.fillRect(51, 14 + i * 5, 16, 1.5); }
    glow(c, 59, 34, 28, e, 0.55 * pulse);
    c.globalCompositeOperation = 'source-over';
  } else {
    c.beginPath(); c.moveTo(46, 9); c.lineTo(70, 9); c.lineTo(72, 58); c.lineTo(54, 60); c.lineTo(50, 30); c.closePath();
    c.fillStyle = lg(c, 46, 9, 72, 60, [[0, '#363a40'], [1, '#0e1012']]); c.fill();
    c.strokeStyle = 'rgba(0,0,0,0.6)'; c.lineWidth = 1;
    for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(48, 22 + i * 9); c.lineTo(70, 22 + i * 9); c.stroke(); }
    c.strokeStyle = '#050505'; c.lineWidth = 1.2; c.stroke();
  }
  // handguard dengan picatinny / vent holes
  rr(c, 74, -11, 96, 22, 4); c.fillStyle = lg(c, 0, -11, 0, 11, [[0, '#3a3d42'], [0.5, '#1a1c1f'], [1, '#08090a']]); c.fill();
  rr(c, 74, -18, 90, 6, 2); c.fillStyle = '#141618'; c.fill();
  c.fillStyle = '#2a2d30'; for (let x = 76; x < 160; x += 5) c.fillRect(x, -18, 2, 3);
  for (let x = 82; x < 162; x += 12) {
    rr(c, x, -5, 7, 7, 2);
    c.fillStyle = e ? `rgba(${e},${0.4 + 0.5 * Math.sin(s.t * 10 + x)})` : '#050505'; c.fill();
  }
  // gas block
  rr(c, 164, -6, 16, 12, 2); c.fillStyle = lg(c, 0, -6, 0, 6, METAL); c.fill();
  // barrel
  rr(c, 178, -3, 58, 6, 2); c.fillStyle = lg(c, 0, -3, 0, 3, METAL); c.fill();
  shine(c, 180, -2, 54);
  // front sight post
  poly(c, [[188, -3], [196, -3], [194, -24], [190, -24]], '#1c1e21');
  c.fillStyle = '#050505'; c.fillRect(191, -20, 2, 8);
  // flash hider
  rr(c, 234, -5, 18, 10, 2); c.fillStyle = lg(c, 0, -5, 0, 5, METAL); c.fill();
  c.fillStyle = '#000'; for (let i = 0; i < 3; i++) c.fillRect(237 + i * 5, -5, 2, 3);
  if (e) {
    c.globalCompositeOperation = 'lighter';
    for (let x = 182; x < 228; x += 8) {
      rr(c, x, -9, 3, 18, 1); c.fillStyle = `rgba(${e},${0.6 + 0.4 * pulse})`; c.fill();
      glow(c, x + 1, 0, 10, e, 0.3);
    }
    if (Math.random() < 0.35) bolt(c, 180, (Math.random() - 0.5) * 14, 232, (Math.random() - 0.5) * 14, e, 0.9, 6, 6);
    c.globalCompositeOperation = 'source-over';
  }
}

function drawMP5(c: CanvasRenderingContext2D, s: WState, e: string | null) {
  const pulse = 0.6 + 0.4 * Math.sin(s.t * 9);
  c.strokeStyle = '#2a2c30'; c.lineWidth = 4;
  c.beginPath(); c.moveTo(-15, -7); c.lineTo(-70, -7); c.moveTo(-15, 5); c.lineTo(-70, 7); c.stroke();
  rr(c, -80, -13, 12, 28, 4); c.fillStyle = '#1b1c1f'; c.fill();
  rr(c, -15, -12, 112, 21, 5); c.fillStyle = lg(c, 0, -12, 0, 9, METAL); c.fill();
  shine(c, -10, -10, 100);
  c.fillStyle = '#26282c'; c.beginPath(); c.arc(-4, -15, 6, 0, 7); c.fill();
  rr(c, 58, -18, 84, 7, 3); c.fillStyle = lg(c, 0, -18, 0, -11, METAL); c.fill();
  // pistol grip
  poly(c, [[12, 9], [28, 9], [24, 46], [10, 44]], lg(c, 10, 0, 28, 0, [[0, '#2c2e33'], [1, '#0d0e10']]));
  // trigger guard
  c.strokeStyle = '#111'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(29, 10); c.quadraticCurveTo(34, 22, 42, 10); c.stroke();
  // box magazine (straight, MP5 style)
  rr(c, 44, 10, 18, 42, 2);
  if (e) {
    c.globalCompositeOperation = 'lighter';
    const g2 = c.createLinearGradient(44, 0, 62, 0);
    g2.addColorStop(0, `rgba(${e},0.2)`); g2.addColorStop(0.5, `rgba(${e},${0.8 * pulse})`); g2.addColorStop(1, `rgba(${e},0.2)`);
    c.fillStyle = g2; c.fill();
    for (let i = 0; i < 6; i++) { c.fillStyle = `rgba(${e},${0.6 + 0.4 * Math.sin(s.t * 14 + i)})`; c.fillRect(46, 14 + i * 6, 14, 2); }
    glow(c, 53, 32, 24, e, 0.5 * pulse);
    c.globalCompositeOperation = 'source-over';
  } else {
    c.fillStyle = lg(c, 44, 10, 44, 52, [[0, '#3a3c40'], [0.5, '#1d1f22'], [1, '#07080a']]); c.fill();
    c.strokeStyle = 'rgba(0,0,0,0.5)'; c.lineWidth = 1;
    for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(46, 18 + i * 8); c.lineTo(60, 18 + i * 8); c.stroke(); }
  }
  c.strokeStyle = '#050505'; c.lineWidth = 1.2; c.strokeRect(44, 10, 18, 42);
  rr(c, 95, -11, 56, 22, 10); c.fillStyle = lg(c, 0, -11, 0, 11, [[0, '#35373b'], [0.5, '#16171a'], [1, '#050505']]); c.fill();
  for (let x = 102; x < 146; x += 6) {
    c.strokeStyle = e ? `rgba(${e},${0.4 + 0.5 * Math.sin(s.t * 12 + x * 0.3)})` : 'rgba(0,0,0,0.7)'; c.lineWidth = 2;
    c.beginPath(); c.moveTo(x, -8); c.lineTo(x, 8); c.stroke();
  }
  rr(c, 150, -4, 34, 7, 2); c.fillStyle = lg(c, 0, -4, 0, 3, METAL); c.fill();
  c.strokeStyle = '#2a2c30'; c.lineWidth = 2.5; c.beginPath(); c.arc(160, -17, 6, 0, 7); c.stroke();
  if (e) {
    c.globalCompositeOperation = 'lighter';
    for (let x = 152; x < 182; x += 7) { c.strokeStyle = `rgba(${e},0.9)`; c.lineWidth = 2; c.beginPath(); c.ellipse(x, 0, 2, 7, 0, 0, 7); c.stroke(); }
    if (Math.random() < 0.3) bolt(c, 100, -12, 180, (Math.random() - 0.5) * 10, e, 0.9, 7, 6);
    c.globalCompositeOperation = 'source-over';
  }
}

function drawSniper(c: CanvasRenderingContext2D, s: WState) {
  const pulse = 0.5 + 0.5 * Math.sin(s.t * 5);
  const body: [number, string][] = [[0, '#4a5246'], [0.5, '#262b24'], [1, '#101310']];
  poly(c, [[-106, -10], [-20, -10], [-20, 8], [-50, 10], [-62, 24], [-106, 24]], lg(c, 0, -10, 0, 24, body));
  rr(c, -90, -16, 50, 8, 3); c.fillStyle = '#1a1d19'; c.fill();
  rr(c, -22, -11, 92, 20, 3); c.fillStyle = lg(c, 0, -11, 0, 9, METAL); c.fill();
  poly(c, [[0, 9], [14, 9], [10, 38], [-4, 36]], lg(c, 0, 0, 14, 0, body));
  rr(c, 28, 9, 22, 20, 2); c.fillStyle = '#16181a'; c.fill();
  c.strokeStyle = '#888'; c.lineWidth = 3; c.beginPath(); c.moveTo(56, 9); c.lineTo(62, 22); c.stroke();
  c.fillStyle = '#aaa'; c.beginPath(); c.arc(63, 24, 4, 0, 7); c.fill();
  rr(c, 10, -21, 8, 10, 1); c.fillStyle = '#222'; c.fill(); rr(c, 72, -21, 8, 10, 1); c.fill();
  rr(c, -4, -31, 92, 11, 5); c.fillStyle = lg(c, 0, -31, 0, -20, [[0, '#55595f'], [0.5, '#1d1f22'], [1, '#08090a']]); c.fill();
  rr(c, -14, -35, 16, 19, 4); c.fill();
  poly(c, [[84, -32], [92, -38], [114, -38], [114, -14], [92, -14], [84, -20]], lg(c, 0, -38, 0, -14, [[0, '#55595f'], [0.5, '#1d1f22'], [1, '#08090a']]));
  rr(c, 36, -39, 12, 9, 2); c.fillStyle = '#2c2f33'; c.fill();
  c.globalCompositeOperation = 'lighter';
  c.fillStyle = `rgba(255,60,80,0.8)`; c.beginPath(); c.ellipse(114, -26, 2.5, 11, 0, 0, 7); c.fill();
  glow(c, 114, -26, 12, '255,80,100', 0.6);
  c.globalCompositeOperation = 'source-over';
  rr(c, 68, -5, 214, 9, 3); c.fillStyle = lg(c, 0, -5, 0, 4, METAL); c.fill();
  c.strokeStyle = 'rgba(0,0,0,0.6)'; c.lineWidth = 1;
  for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(100, -3 + i * 3); c.lineTo(260, -3 + i * 3); c.stroke(); }
  c.strokeStyle = '#2a2d2a'; c.lineWidth = 3; c.beginPath(); c.moveTo(150, 5); c.lineTo(230, 9); c.moveTo(150, 5); c.lineTo(228, 13); c.stroke();
  rr(c, 280, -8, 26, 16, 3); c.fillStyle = lg(c, 0, -8, 0, 8, METAL); c.fill();
  c.globalCompositeOperation = 'lighter';
  for (let x = 284; x < 304; x += 6) { c.fillStyle = `rgba(255,40,60,${0.5 + 0.5 * pulse})`; c.fillRect(x, -6, 2, 12); }
  rr(c, 90, -1.2, 186, 2.4, 1); c.fillStyle = `rgba(255,50,70,${0.5 + 0.5 * pulse})`; c.fill();
  glow(c, 296, 0, 20 + pulse * 6, '255,40,60', 0.4);
  c.globalCompositeOperation = 'source-over';
}

// draw a curved dragon body along a spine array using variable width
function dragonBody(c: CanvasRenderingContext2D, pts: number[][], widths: number[], fill: any, outline?: string) {
  const left: number[][] = [], right: number[][] = [];
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i], pn = pts[Math.min(pts.length - 1, i + 1)], pp = pts[Math.max(0, i - 1)];
    const dx = pn[0] - pp[0], dy = pn[1] - pp[1];
    const L = Math.hypot(dx, dy) || 1;
    const nx = -dy / L, ny = dx / L;
    const w = widths[i];
    left.push([p[0] + nx * w, p[1] + ny * w]);
    right.push([p[0] - nx * w, p[1] - ny * w]);
  }
  c.beginPath();
  c.moveTo(left[0][0], left[0][1]);
  left.forEach((p) => c.lineTo(p[0], p[1]));
  c.lineTo(right[right.length - 1][0], right[right.length - 1][1]);
  for (let i = right.length - 2; i >= 0; i--) c.lineTo(right[i][0], right[i][1]);
  c.closePath();
  c.fillStyle = fill; c.fill();
  if (outline) { c.strokeStyle = outline; c.lineWidth = 1.2; c.stroke(); }
}

function drawDragon(c: CanvasRenderingContext2D, s: WState) {
  const t = s.t;
  const firing = s.fireT < 0.35;
  const gold: [number, string][] = [[0, '#fff3b8'], [0.35, '#f3c552'], [0.7, '#a8701a'], [1, '#4a2b05']];
  const crim: [number, string][] = [[0, '#ffb796'], [0.2, '#ff5a2a'], [0.55, '#c11208'], [1, '#4a0501']];
  const dark: [number, string][] = [[0, '#5a0c04'], [1, '#1a0200']];
  const wine: [number, string][] = [[0, '#a02a18'], [0.6, '#5a0f06'], [1, '#2a0401']];

  // ========= SHOTGUN BASE =========
  // stock kayu merah
  poly(c, [[-126, -7], [-28, -13], [-28, 11], [-126, 29]], lg(c, 0, -13, 0, 29, wine));
  c.fillStyle = '#140503'; c.fillRect(-132, -7, 6, 36);
  // gold inlay di stock
  c.strokeStyle = '#e8b64a'; c.lineWidth = 1.4;
  c.beginPath(); c.moveTo(-110, 8); c.bezierCurveTo(-86, -8, -64, 18, -36, 2); c.stroke();
  c.beginPath(); c.moveTo(-108, 22); c.quadraticCurveTo(-80, 6, -50, 18); c.stroke();
  // receiver emas berukir naga
  rr(c, -30, -14, 94, 26, 5); c.fillStyle = lg(c, 0, -14, 0, 12, gold); c.fill();
  c.strokeStyle = 'rgba(70,30,0,0.6)'; c.lineWidth = 0.9;
  for (let i = 0; i < 4; i++) { c.beginPath(); c.arc(-14 + i * 22, 0, 8, 0.3, Math.PI * 1.7); c.stroke(); }
  c.fillStyle = '#2a1405'; c.beginPath(); c.arc(-8, 10, 1.5, 0, 7); c.arc(14, 10, 1.5, 0, 7); c.arc(36, 10, 1.5, 0, 7); c.fill();
  // trigger guard metal + trigger
  c.strokeStyle = '#2a1405'; c.lineWidth = 3; c.beginPath(); c.moveTo(26, 12); c.quadraticCurveTo(32, 30, 48, 26); c.quadraticCurveTo(60, 24, 60, 12); c.stroke();
  c.fillStyle = '#3a2410'; c.beginPath(); c.arc(42, 22, 3, 0, Math.PI); c.fill();
  // pistol grip ukir emas
  poly(c, [[14, 12], [38, 12], [32, 50], [10, 48]], lg(c, 10, 12, 38, 50, wine));
  c.strokeStyle = '#e8b64a'; c.lineWidth = 1;
  for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(18, 18 + i * 6); c.lineTo(34, 18 + i * 6); c.stroke(); }
  // mag / tube pump kayu
  rr(c, 64, 5, 130, 10, 3); c.fillStyle = lg(c, 0, 5, 0, 15, METAL); c.fill();
  rr(c, 88, 2, 82, 18, 8); c.fillStyle = lg(c, 0, 2, 0, 20, wine); c.fill();
  c.strokeStyle = 'rgba(0,0,0,0.55)'; c.lineWidth = 1.2;
  for (let x = 94; x < 164; x += 7) { c.beginPath(); c.moveTo(x, 4); c.lineTo(x, 18); c.stroke(); }
  // gold bands di pump
  c.fillStyle = lg(c, 0, 0, 0, 20, gold); [90, 164].forEach((x) => { rr(c, x - 2, -2, 6, 24, 2); c.fill(); });
  // barrel gelap
  rr(c, 64, -10, 184, 14, 4); c.fillStyle = lg(c, 0, -10, 0, 4, [[0, '#3a4048'], [0.5, '#181b1f'], [1, '#050505']]); c.fill();
  // vent holes di barrel
  c.fillStyle = 'rgba(0,0,0,0.6)'; for (let x = 76; x < 200; x += 12) { c.beginPath(); c.arc(x, -3, 1.2, 0, 7); c.fill(); c.beginPath(); c.arc(x, 3, 1.2, 0, 7); c.fill(); }
  // front bead sight
  poly(c, [[234, -10], [244, -10], [242, -24], [236, -24]], lg(c, 234, -24, 244, -10, gold));
  c.fillStyle = '#ffd24a'; c.beginPath(); c.arc(240, -25, 2, 0, 7); c.fill();
  // muzzle
  rr(c, 246, -8, 14, 10, 2); c.fillStyle = lg(c, 0, -8, 0, 2, [[0, '#4a4f57'], [1, '#141619']]); c.fill();
  c.fillStyle = '#050505'; c.beginPath(); c.arc(253, -3, 3, 0, 7); c.fill();

  // ========= NAGA BADAN =========
  const breathe = Math.sin(t * 2) * 2;
  const tailSegs: [number, number][] = [];
  for (let i = 0; i <= 18; i++) {
    const u = i / 18;
    // spiral memutar dari bawah ke atas mengelilingi stock-receiver
    const ang = -Math.PI / 2 + u * Math.PI * 1.6;
    const rad = 26 + Math.sin(u * 6 + t * 2) * 2;
    const cx = -60 - (1 - u) * 50;
    const cy = 10 + Math.cos(u * Math.PI) * 18;
    tailSegs.push([cx + Math.cos(ang) * rad, cy + Math.sin(ang) * rad + breathe * u]);
  }
  // badan atas sepanjang laras, dimulai dari titik terakhir ekor (transisi mulus)
  const bodySegs: [number, number][] = [];
  const [sx, sy] = tailSegs[tailSegs.length - 1];
  const headX = 248;
  for (let i = 1; i <= 40; i++) {
    const u = i / 40;
    const x = sx + (headX - sx) * u;
    // bentuk S: di receiver (u=0) kecil membesar di tengah, mengecil di leher
    const amp = 12 + Math.sin(u * Math.PI) * 10;
    const wave = Math.sin(u * Math.PI * 2.4 + t * 1.8) * amp;
    const ripple = Math.sin(u * 12 + t * 3) * (1 + u * 1.5);
    const lift = u > 0.85 ? -(u - 0.85) * 20 : 0;
    bodySegs.push([x, (sy + wave + ripple + lift) * 0.55 + breathe * u * 0.25]);
  }
  const all = [...tailSegs, ...bodySegs];
  // width array yang sesuai dengan all.length
  const W: number[] = [];
  for (let i = 0; i < tailSegs.length; i++) {
    const u = i / (tailSegs.length - 1);
    W.push(3 + u * 11); // ekor tipis ke pangkal
  }
  for (let i = 1; i <= 40; i++) {
    const u = i / 40;
    const neckNarrow = u < 0.1 ? 0.4 + u * 6 : 1;
    const headNarrow = u > 0.9 ? 0.3 + (1 - u) * 4 : 1;
    const w = (14 + Math.sin(u * Math.PI) * 10) * Math.min(neckNarrow, headNarrow);
    W.push(w);
  }

  // ---------- draw body (layered) ----------
  // shadow bawah
  dragonBody(c, all, W.map((w) => w + 2.5), 'rgba(0,0,0,0.4)');
  // base gelap (outline tebal)
  dragonBody(c, all, W.map((w) => w + 1.5), lg(c, -130, 0, headX, 0, dark), '#1a0200');
  // gradient utama merah-oranye menyala
  dragonBody(c, all, W.map((w) => w), lg(c, -130, 0, headX, 0, crim));
  // perut krem-emas
  const bellyWidths = W.map((w, i) => {
    const u = i / (all.length - 1);
    return w * (0.35 + 0.15 * Math.sin(u * Math.PI));
  });
  dragonBody(c, all, bellyWidths, 'rgba(255,220,160,0.5)');
  // garis punggung highlight
  c.beginPath(); c.moveTo(all[0][0], all[0][1]);
  for (let i = 1; i < all.length; i++) c.lineTo(all[i][0], all[i][1] - W[i] * 0.25);
  c.strokeStyle = 'rgba(255,220,150,0.6)'; c.lineWidth = 1.5; c.lineCap = 'round'; c.stroke();

  // ---------- SISIK & DURI ----------
  for (let i = 2; i < all.length - 2; i++) {
    const [x, y] = all[i]; const w = W[i];
    const p = i / (all.length - 1);
    // duri punggung (spine ridge)
    if (i % 2 === 0 && w > 6) {
      const h = 5 + w * 0.6 + Math.sin(t * 3 + i) * 0.8;
      const tipY = y - w - h;
      poly(c, [
        [x - 2.5, y - w + 1],
        [x, tipY],
        [x + 2.5, y - w + 1],
      ], lg(c, x, tipY, x, y - w + 1, gold), '#3a1a00', 0.8);
    }
    // sisik
    if (i % 3 === 0 && w > 7) {
      c.save(); c.translate(x, y - w * 0.1);
      c.fillStyle = 'rgba(255,190,90,0.35)'; c.strokeStyle = 'rgba(120,30,0,0.7)'; c.lineWidth = 0.7;
      c.beginPath(); c.ellipse(0, 0, w * 0.42, w * 0.22, 0, 0, Math.PI); c.fill(); c.stroke();
      c.restore();
    }
    // sisik perut
    if (i % 3 === 1 && w > 6 && p > 0.3) {
      c.save();
      c.fillStyle = 'rgba(255,240,200,0.75)'; c.strokeStyle = 'rgba(120,40,0,0.55)'; c.lineWidth = 0.6;
      c.beginPath(); c.arc(x, y + w * 0.55, w * 0.22, 0, Math.PI); c.fill(); c.stroke();
      c.restore();
    }
  }

  // ---------- CANGKUK / Cakar di receiver area (tiga cakar naga memegang receiver) ----------
  [
    { cx: -10, cy: -12, sgn: -1 },
    { cx: 30, cy: -14, sgn: -1 },
    { cx: 62, cy: -12, sgn: -1 },
  ].forEach((cl, idx) => {
    c.save(); c.translate(cl.cx, cl.cy);
    for (let j = 0; j < 3; j++) {
      const a = -0.9 + j * 0.35 + Math.sin(t * 2 + idx) * 0.05;
      poly(c, [[0, 0], [Math.cos(a) * 10, Math.sin(a) * 14 - 4], [Math.cos(a) * 10 + 2, Math.sin(a) * 14 + 2]], lg(c, 0, 0, 10, 14, gold), '#3a1a00', 0.7);
    }
    c.restore();
  });

  // ---------- DUA SAYAP di dekat receiver ----------
  // sayap kiri-bawah
  const flap = Math.sin(t * 2.5) * 0.12;
  for (const side of [-1, 1]) {
    c.save();
    c.translate(8, side * (6));
    c.scale(1, side);
    c.rotate(-0.2 + flap * side);
    // tulang sayap
    const wingBase: [number, number] = [-6, -4];
    const ribs: [number, number][] = [[-50, -48], [-28, -58], [-2, -60], [24, -52]];
    // membran
    c.beginPath();
    c.moveTo(wingBase[0], wingBase[1]);
    c.quadraticCurveTo(-40, -30, ribs[0][0], ribs[0][1]);
    ribs.forEach((r, i) => {
      if (i > 0) c.quadraticCurveTo((ribs[i - 1][0] + r[0]) / 2 + 6, (ribs[i - 1][1] + r[1]) / 2 - 8, r[0], r[1]);
    });
    c.quadraticCurveTo(30, -14, 8, 2); c.quadraticCurveTo(-4, 0, wingBase[0], wingBase[1]);
    c.closePath();
    c.fillStyle = lg(c, 0, -60, 0, 0, [
      [0, 'rgba(255,90,40,0.95)'],
      [0.4, 'rgba(210,40,20,0.9)'],
      [1, 'rgba(60,10,0,0.95)'],
    ]); c.fill();
    c.strokeStyle = '#3a0400'; c.lineWidth = 1; c.stroke();
    // tulang
    c.strokeStyle = '#f2c14e'; c.lineWidth = 2; c.lineCap = 'round';
    ribs.forEach((r) => { c.beginPath(); c.moveTo(wingBase[0], wingBase[1]); c.lineTo(r[0], r[1]); c.stroke(); });
    // ujung cakar di setiap ruas
    ribs.forEach((r) => poly(c, [[r[0] - 2, r[1]], [r[0], r[1] - 6], [r[0] + 3, r[1]]], '#e8b54a', '#3a1a00', 0.5));
    // highlight membran
    c.strokeStyle = 'rgba(255,220,150,0.55)'; c.lineWidth = 0.8;
    c.beginPath(); c.moveTo(wingBase[0], wingBase[1] - 2); c.quadraticCurveTo(-30, -36, ribs[0][0] + 6, ribs[0][1] + 2); c.stroke();
    c.restore();
  }

  // sirip api di sekujur leher depan (sebelah kiri kepala), seperti jambul
  for (let i = 0; i < 6; i++) {
    const u = i / 5;
    const px = 200 - i * 16;
    const py = -16 - Math.sin(u * Math.PI) * 10 + Math.sin(t * 8 + i) * 1.5;
    const len = 14 + Math.sin(t * 10 + i) * 2;
    poly(c, [[px - 4, -8], [px, py - len], [px + 4, -8]], `rgba(255,${130 + i * 10},30,0.9)`, '#6a1a00', 0.7);
    poly(c, [[px - 2, -8], [px, py - len + 4], [px + 2, -8]], '#fff0a8');
  }

  // ========= KEPALA NAGA (proporsional, lebih besar, gagah) =========
  c.save();
  const hx = 246, hy = 0;
  c.translate(hx, hy);

  // rahang bawah
  const open = firing ? Math.sin((s.fireT / 0.35) * Math.PI) : 0.08 + Math.sin(t * 2) * 0.04;
  c.save();
  c.translate(0, 4); c.rotate(open * 0.6);
  c.beginPath();
  c.moveTo(-28, 0);
  c.quadraticCurveTo(-10, -4, 18, -3);
  c.quadraticCurveTo(40, -2, 48, 4);
  c.quadraticCurveTo(40, 10, 10, 12);
  c.quadraticCurveTo(-16, 12, -28, 6);
  c.closePath();
  c.fillStyle = lg(c, -28, 0, 48, 12, wine); c.fill();
  c.strokeStyle = '#1a0200'; c.lineWidth = 1.4; c.stroke();
  // gigi bawah
  if (open > 0.08) {
    c.fillStyle = '#fff8ee'; c.strokeStyle = '#c9b080'; c.lineWidth = 0.6;
    for (let x = -18; x < 42; x += 6) {
      c.beginPath(); c.moveTo(x, -3); c.lineTo(x + 2.5, -8 - open * 4); c.lineTo(x + 5, -3); c.closePath(); c.fill(); c.stroke();
    }
    // lidah api
    c.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 3; i++) {
      const len = 22 + Math.sin(t * 18 + i) * 4;
      poly(c, [[0, 0], [len - 4, -3 - i * 2], [len, 0], [len - 4, 3 + i * 2]], `rgba(255,${180 - i * 30},${40 + i * 30},0.8)`);
    }
    c.globalCompositeOperation = 'source-over';
  }
  c.restore();

  // tengkorak atas kepala
  c.beginPath();
  c.moveTo(-34, -8);
  c.quadraticCurveTo(-20, -32, 0, -28);
  c.quadraticCurveTo(24, -26, 40, -18);
  c.quadraticCurveTo(54, -12, 60, -4);
  c.quadraticCurveTo(56, 2, 40, 2);
  c.quadraticCurveTo(16, 6, -20, 8);
  c.quadraticCurveTo(-32, 4, -34, -8);
  c.closePath();
  c.fillStyle = lg(c, -34, -32, 60, 8, [
    [0, '#ffb58c'],
    [0.2, '#ff5a2a'],
    [0.5, '#c8140a'],
    [0.85, '#7a0804'],
    [1, '#2a0200'],
  ]); c.fill();
  c.strokeStyle = '#1a0200'; c.lineWidth = 1.4; c.stroke();
  // moncong lancip
  c.beginPath();
  c.moveTo(40, -10); c.quadraticCurveTo(60, -8, 66, -3); c.lineTo(64, -1); c.quadraticCurveTo(54, -3, 42, -2);
  c.fillStyle = 'rgba(255,180,140,0.7)'; c.fill();

  // moncong tanjak di atas (sungut/dahi)
  poly(c, [[-10, -28], [-28, -46], [-22, -28]], lg(c, -28, -46, -10, -28, gold), '#3a1a00', 1);
  poly(c, [[-4, -30], [-18, -52], [-14, -30]], lg(c, -18, -52, -4, -30, gold), '#3a1a00', 1);

  // dua tanduk bercabang seperti rusa
  for (const [hx0, hy0, ang, len, br] of [[-14, -28, -1.0, 28, 1], [-6, -30, -1.3, 24, 0.85]] as const) {
    c.save(); c.translate(hx0, hy0); c.rotate(ang);
    c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(len * 0.4, -6, len, -4); c.lineTo(len + 2, -2); c.quadraticCurveTo(len * 0.5, 0, 2, 3); c.closePath();
    c.fillStyle = lg(c, 0, -6, len, 3, gold); c.fill(); c.strokeStyle = '#3a1a00'; c.lineWidth = 1; c.stroke();
    // cabang
    c.beginPath(); c.moveTo(len * 0.5, -5); c.lineTo(len * 0.5 - 2, -16 * br); c.lineTo(len * 0.5 + 3, -5); c.closePath(); c.fillStyle = lg(c, len * 0.5, -16, len * 0.5 + 3, -5, gold); c.fill(); c.stroke();
    c.beginPath(); c.moveTo(len * 0.8, -4); c.lineTo(len * 0.8 + 2, -14 * br); c.lineTo(len * 0.8 + 5, -2); c.closePath(); c.fill(); c.stroke();
    c.restore();
  }

  // alis
  poly(c, [[-14, -20], [6, -22], [12, -16], [-10, -14]], '#6a0c04');
  // mata
  c.globalCompositeOperation = 'lighter';
  glow(c, -2, -16, 14, '255,220,60', 0.8);
  c.globalCompositeOperation = 'source-over';
  c.fillStyle = '#fff4c8'; c.beginPath(); c.ellipse(-2, -16, 6, 3.4, -0.2, 0, 7); c.fill();
  c.fillStyle = '#f2a020'; c.beginPath(); c.ellipse(-2, -15.5, 4, 2.4, -0.2, 0, 7); c.fill();
  c.fillStyle = '#1a0000'; c.beginPath(); c.ellipse(-1, -15.5, 1.2, 2.8, 0, 0, 7); c.fill();
  c.fillStyle = '#fff'; c.beginPath(); c.arc(-3, -17, 0.8, 0, 7); c.fill();

  // lubang hidung
  c.fillStyle = '#1a0200'; c.beginPath(); c.ellipse(58, -2, 2.4, 1.6, 0, 0, 7); c.fill();
  // asap tipis dari hidung saat idle
  if (!firing && Math.random() < 0.4) {
    c.globalCompositeOperation = 'lighter';
    glow(c, 60, -2, 6 + Math.sin(t * 7) * 2, '255,140,40', 0.25);
    c.globalCompositeOperation = 'source-over';
  }

  // gigi atas
  if (open > 0.08) {
    c.fillStyle = '#fff8ee'; c.strokeStyle = '#c9b080'; c.lineWidth = 0.6;
    for (let x = -14; x < 50; x += 6) {
      c.beginPath(); c.moveTo(x, 2); c.lineTo(x + 2.5, 8 + open * 4); c.lineTo(x + 5, 2); c.closePath(); c.fill(); c.stroke();
    }
  } else {
    // gigi yang sedikit menyembul saat mulut tertutup
    c.fillStyle = '#fff8ee';
    c.beginPath(); c.moveTo(40, 2); c.lineTo(44, 6); c.lineTo(46, 2); c.fill();
    c.beginPath(); c.moveTo(20, 4); c.lineTo(23, 8); c.lineTo(26, 4); c.fill();
  }

  // sisik di pipi
  c.strokeStyle = 'rgba(255,200,110,0.6)'; c.lineWidth = 0.9;
  for (let x = -20; x < 30; x += 7) { c.beginPath(); c.arc(x, -2 + (x + 20) * 0.05, 3.5, 0.2, Math.PI - 0.2); c.stroke(); }

  // jambul api di atas kepala
  for (let i = 0; i < 5; i++) {
    const a = -1.3 + i * 0.4;
    const L = 16 + Math.sin(t * 11 + i) * 4;
    c.save(); c.rotate(a * 0.25);
    poly(c, [[-8, -28], [-8 - L * 0.4, -28 - L], [0, -28 - L * 0.6], [8 - L * 0.2, -28 - L * 1.2], [6, -28]],
      `rgba(255,${120 + i * 18},${30 + i * 8},0.9)`);
    c.restore();
  }

  // kumis panjang beralun
  c.strokeStyle = 'rgba(255,220,140,0.95)'; c.lineWidth = 1.6; c.lineCap = 'round';
  for (const sg of [-1, 1]) {
    c.beginPath(); c.moveTo(50, sg * 0 - 2);
    for (let i = 1; i <= 16; i++) {
      const px = 50 - i * 9;
      const py = -2 + sg * (i * 3 + Math.sin(t * 3.5 + i * 0.8) * 4);
      c.lineTo(px, py);
    }
    c.stroke();
  }

  // nafas api kecil saat idle
  c.globalCompositeOperation = 'lighter';
  const fl = 0.35 + 0.2 * Math.sin(t * 6);
  if (!firing) {
    for (let i = 0; i < 3; i++) {
      const l = 10 + i * 5 + Math.sin(t * 5 + i) * 2;
      c.save(); c.translate(70, -1 + i - 1);
      poly(c, [[0, 0], [l, -1], [l + 4, 0], [l, 1]], `rgba(255,${180 - i * 20},${50 + i * 10},${0.25 * fl})`);
      c.restore();
    }
    glow(c, 74, 0, 10 * fl, '255,150,40', 0.4 * fl);
  }
  if (firing) {
    const fi = s.fireT / 0.35;
    glow(c, 80, 0, 50 * fi, '255,160,40', 0.9);
    for (let i = 0; i < 8; i++) {
      const a = -0.4 + i * 0.12;
      const l = 40 + Math.sin(t * 25 + i) * 6;
      c.save(); c.translate(64, 0); c.rotate(a);
      poly(c, [[0, 0], [l, -2], [l + 8, 0], [l, 2]], `rgba(255,${150 + i * 10},${40 + i * 15},0.9)`);
      c.restore();
    }
  }
  c.globalCompositeOperation = 'source-over';
  c.restore();
}

function drawBeretta(c: CanvasRenderingContext2D) {
  // frame alloy
  poly(c, [[-4, 6], [26, 6], [34, 58], [6, 60]], lg(c, 0, 6, 34, 60, [[0, '#8d9097'], [0.5, '#3e4247'], [1, '#1b1d1f']]));
  // grip panels kayu
  poly(c, [[3, 12], [22, 12], [28, 52], [9, 54]], lg(c, 3, 12, 28, 52, [[0, '#6b3617'], [1, '#2a1306']]));
  c.strokeStyle = 'rgba(0,0,0,0.4)'; c.lineWidth = 0.7;
  for (let i = 0; i < 8; i++) { c.beginPath(); c.moveTo(5, 16 + i * 4.5); c.lineTo(24, 18 + i * 4.5); c.stroke(); }
  c.fillStyle = '#0b0b0c'; c.beginPath(); c.arc(16, 44, 1.4, 0, 7); c.fill();
  c.beginPath(); c.arc(16, 34, 1.4, 0, 7); c.fill();
  // trigger guard & trigger
  c.strokeStyle = '#0a0a0a'; c.lineWidth = 3; c.beginPath(); c.moveTo(30, 9); c.quadraticCurveTo(30, 26, 48, 24); c.quadraticCurveTo(60, 22, 60, 9); c.stroke();
  c.strokeStyle = '#2a2d30'; c.lineWidth = 2; c.beginPath(); c.moveTo(40, 9); c.quadraticCurveTo(38, 17, 42, 20); c.stroke();
  // slide (open top khas Beretta)
  rr(c, -8, -14, 126, 17, 3); c.fillStyle = lg(c, 0, -14, 0, 3, [[0, '#6b717a'], [0.4, '#2c3036'], [1, '#0a0a0b']]); c.fill();
  shine(c, -4, -13, 118);
  // open top cut di atas slide (keluarkan barrel)
  c.save();
  rr(c, 44, -14, 66, 8, 2); c.clip();
  c.clearRect(44, -14, 66, 8);
  c.fillStyle = 'rgba(0,0,0,0.35)'; c.fillRect(44, -14, 66, 8);
  c.restore();
  c.strokeStyle = '#050505'; c.lineWidth = 1.2;
  c.beginPath(); c.moveTo(44, -14); c.lineTo(44, -6); c.moveTo(110, -14); c.lineTo(110, -6); c.stroke();
  rr(c, -8, -14, 126, 17, 3); c.stroke();
  // barrel di dalam open top
  rr(c, 46, -11, 62, 5, 1); c.fillStyle = lg(c, 0, -11, 0, -6, METAL); c.fill();
  // serrations di slide belakang
  for (let x = -4; x < 30; x += 3) { c.fillStyle = 'rgba(0,0,0,0.35)'; c.fillRect(x, -13, 1.2, 15); }
  // safety decocker lever
  c.fillStyle = '#0b0b0b'; c.fillRect(36, -12, 6, 2);
  // rear sight + front sight
  poly(c, [[0, -14], [10, -14], [10, -20], [2, -20]], '#1a1c1e');
  poly(c, [[112, -14], [118, -14], [116, -22], [114, -22]], '#1a1c1e');
  c.fillStyle = '#ffe9a0'; c.fillRect(114, -21, 1, 2);
  // ejection port
  rr(c, 42, -10, 22, 3, 1); c.fillStyle = '#050505'; c.fill();
  // hammer
  c.fillStyle = '#2a2d30'; c.beginPath(); c.arc(-2, -8, 4, Math.PI, Math.PI * 2); c.fill();
  // muzzle
  rr(c, 114, -6, 6, 9, 1); c.fillStyle = lg(c, 0, -6, 0, 3, METAL); c.fill();
  c.fillStyle = '#050505'; c.beginPath(); c.arc(117, -1.5, 2, 0, 7); c.fill();
  // mag bottom plate
  rr(c, 10, 58, 24, 4, 1); c.fillStyle = '#0f1012'; c.fill();
}

function drawPhaser(c: CanvasRenderingContext2D, s: WState) {
  const p = 0.6 + 0.4 * Math.sin(s.t * 6);
  poly(c, [[6, 4], [32, 4], [24, 52], [-2, 48]], lg(c, 0, 0, 32, 0, [[0, '#5d6066'], [0.5, '#9a9ea5'], [1, '#55585d']]));
  c.strokeStyle = 'rgba(0,0,0,0.35)'; for (let i = 0; i < 8; i++) { c.beginPath(); c.moveTo(4, 10 + i * 5); c.lineTo(26, 10 + i * 5); c.stroke(); }
  poly(c, [[0, -15], [94, -13], [101, -6], [94, 5], [0, 7]], lg(c, 0, -15, 0, 7, [[0, '#3a3c40'], [0.5, '#141517'], [1, '#050505']]));
  shine(c, 4, -13, 86);
  rr(c, 18, -23, 52, 9, 3); c.fillStyle = lg(c, 0, -23, 0, -14, [[0, '#c8ccd2'], [1, '#5c6066']]); c.fill();
  for (let i = 0; i < 4; i++) { c.fillStyle = i === Math.floor(s.t * 3) % 4 ? '#ff5a2a' : '#4a1a10'; c.fillRect(26 + i * 9, -20, 5, 3); }
  c.fillStyle = '#c0c4ca'; c.beginPath(); c.arc(56, -4, 5, 0, 7); c.fill();
  c.fillStyle = '#333'; c.fillRect(55, -9, 2, 5);
  rr(c, 98, -12, 10, 14, 2); c.fillStyle = lg(c, 0, -12, 0, 2, [[0, '#f0f0f0'], [1, '#777']]); c.fill();
  c.globalCompositeOperation = 'lighter';
  c.fillStyle = `rgba(255,140,60,${p})`; c.beginPath(); c.arc(110, -5, 3.5, 0, 7); c.fill();
  glow(c, 110, -5, 14, '255,110,40', 0.6 * p);
  c.globalCompositeOperation = 'source-over';
}

function swordBlades(c: CanvasRenderingContext2D, t: number, col: string, a = 1) {
  const fl = 0.85 + 0.15 * Math.sin(t * 30);
  for (const sg of [-1, 1]) {
    const path = () => {
      c.beginPath(); c.moveTo(22, sg * 5);
      c.quadraticCurveTo(80, sg * 26, 168, sg * 3);
      c.quadraticCurveTo(84, sg * 12, 22, sg * 2); c.closePath();
    };
    c.globalCompositeOperation = 'lighter';
    path(); c.strokeStyle = `rgba(${col},${0.25 * a * fl})`; c.lineWidth = 14; c.lineJoin = 'round'; c.stroke();
    path(); c.strokeStyle = `rgba(${col},${0.5 * a})`; c.lineWidth = 6; c.stroke();
    path(); c.fillStyle = `rgba(${col},${0.85 * a})`; c.fill();
    c.beginPath(); c.moveTo(26, sg * 4); c.quadraticCurveTo(84, sg * 18, 160, sg * 3.5);
    c.strokeStyle = `rgba(255,255,255,${0.95 * a * fl})`; c.lineWidth = 2; c.stroke();
    c.globalCompositeOperation = 'source-over';
  }
}

function drawSword(c: CanvasRenderingContext2D, s: WState) {
  const sw = s.fireT < 0.25 ? Math.sin((s.fireT / 0.25) * Math.PI) * 0.5 : 0;
  c.rotate(sw);
  rr(c, -52, -8, 74, 16, 7); c.fillStyle = lg(c, 0, -8, 0, 8, [[0, '#8a8f99'], [0.5, '#2c3038'], [1, '#101216']]); c.fill();
  for (let x = -44; x < 14; x += 10) { c.fillStyle = '#c9d2e0'; c.fillRect(x, -8, 3, 16); }
  for (const sg of [-1, 1]) {
    c.beginPath(); c.moveTo(14, sg * 4); c.quadraticCurveTo(26, sg * 16, 34, sg * 12); c.lineTo(24, sg * 2); c.closePath();
    c.fillStyle = '#5a6070'; c.fill();
  }
  swordBlades(c, s.t, '90,170,255', 0.5 + 0.5 * s.ready);
}

function drawPlasma(c: CanvasRenderingContext2D, s: WState) {
  const ch = s.ready;
  const bronze: [number, string][] = [[0, '#9a8a66'], [0.4, '#5a4c36'], [1, '#1e1810']];
  for (let i = 0; i < 4; i++) {
    rr(c, -100 + i * 22, -4 + i * -1, 24, 20, 4); c.fillStyle = lg(c, 0, -6, 0, 16, bronze); c.fill();
    c.strokeStyle = '#1a140a'; c.lineWidth = 1; c.stroke();
  }
  rr(c, -12, -14, 98, 28, 9); c.fillStyle = lg(c, 0, -14, 0, 14, bronze); c.fill();
  c.strokeStyle = 'rgba(0,0,0,0.5)'; c.lineWidth = 1.5;
  for (let x = 4; x < 80; x += 14) { c.beginPath(); c.moveTo(x, -14); c.lineTo(x, 14); c.stroke(); }
  c.strokeStyle = 'rgba(220,200,150,0.5)'; c.lineWidth = 0.8;
  c.beginPath(); c.moveTo(8, -6); c.lineTo(16, 0); c.lineTo(8, 6); c.moveTo(30, -6); c.lineTo(38, 0); c.lineTo(30, 6); c.stroke();
  rr(c, 18, -22, 32, 9, 3); c.fillStyle = '#3a3022'; c.fill();
  c.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 3; i++) { c.fillStyle = '#ff2020'; c.beginPath(); c.arc(42 + (i - 1) * 3, -17 + (i === 1 ? -2 : 1), 1.4, 0, 7); c.fill(); }
  glow(c, 42, -17, 8, '255,30,30', 0.8);
  c.globalCompositeOperation = 'source-over';
  rr(c, 84, -11, 20, 22, 5); c.fillStyle = lg(c, 0, -11, 0, 11, METAL); c.fill();
  c.globalCompositeOperation = 'lighter';
  glow(c, 100, 0, 10 + ch * 18 + Math.sin(s.t * 20) * 2, '60,160,255', 0.9);
  c.fillStyle = `rgba(200,235,255,${0.5 + 0.5 * ch})`; c.beginPath(); c.arc(100, 0, 4 + ch * 2, 0, 7); c.fill();
  if (ch > 0.95 && Math.random() < 0.3) bolt(c, 100, 0, 100 + (Math.random() - 0.3) * 20, (Math.random() - 0.5) * 24, '80,170,255', 0.8, 4, 4);
  c.globalCompositeOperation = 'source-over';
}

export function drawDiscShape(c: CanvasRenderingContext2D, r: number, rot: number, col = '40,230,255', a = 1) {
  c.save(); c.rotate(rot);
  c.fillStyle = '#05080c'; c.beginPath(); c.arc(0, 0, r, 0, 7); c.fill();
  c.globalCompositeOperation = 'lighter';
  glow(c, 0, 0, r * 1.6, col, 0.35 * a);
  c.strokeStyle = `rgba(${col},${a})`; c.lineWidth = r * 0.12; c.beginPath(); c.arc(0, 0, r * 0.92, 0, 7); c.stroke();
  c.strokeStyle = `rgba(255,255,255,${0.9 * a})`; c.lineWidth = r * 0.04; c.beginPath(); c.arc(0, 0, r * 0.92, 0, 7); c.stroke();
  c.strokeStyle = `rgba(${col},${0.8 * a})`; c.lineWidth = r * 0.07;
  for (let i = 0; i < 4; i++) { c.beginPath(); c.arc(0, 0, r * 0.58, i * Math.PI / 2 + 0.2, i * Math.PI / 2 + 1.3); c.stroke(); }
  c.fillStyle = `rgba(230,255,255,${a})`; c.beginPath(); c.arc(0, 0, r * 0.16, 0, 7); c.fill();
  c.globalCompositeOperation = 'source-over';
  c.restore();
}

function drawDiscW(c: CanvasRenderingContext2D, s: WState) {
  rr(c, -100, -14, 96, 28, 10); c.fillStyle = lg(c, 0, -14, 0, 14, [[0, '#2a2f38'], [1, '#07090c']]); c.fill();
  c.globalCompositeOperation = 'lighter';
  c.strokeStyle = 'rgba(40,230,255,0.9)'; c.lineWidth = 1.5;
  c.beginPath(); c.moveTo(-96, -6); c.lineTo(-30, -6); c.lineTo(-20, 0); c.lineTo(-8, 0); c.moveTo(-96, 6); c.lineTo(-40, 6); c.stroke();
  c.globalCompositeOperation = 'source-over';
  const r = s.ready;
  if (r > 0.02) {
    c.save(); c.translate(42, 0); c.scale(r, r);
    drawDiscShape(c, 30, s.t * 2, '40,230,255', r);
    c.restore();
  }
}

function drawProton(c: CanvasRenderingContext2D, s: WState) {
  c.beginPath(); c.moveTo(-120, 34); c.bezierCurveTo(-70, 40, -40, 20, 4, 8);
  c.strokeStyle = '#111'; c.lineWidth = 10; c.stroke();
  c.strokeStyle = '#444'; c.lineWidth = 6; c.setLineDash([2, 3]); c.stroke(); c.setLineDash([]);
  rr(c, 0, -12, 122, 22, 4); c.fillStyle = lg(c, 0, -12, 0, 10, [[0, '#9da2a8'], [0.5, '#5d6268'], [1, '#2a2d31']]); c.fill();
  rr(c, 10, -18, 60, 7, 2); c.fillStyle = '#1b1c1e'; c.fill();
  const b = Math.floor(s.t * 4) % 2;
  c.fillStyle = b ? '#ff3020' : '#501008'; c.beginPath(); c.arc(20, -14, 2.5, 0, 7); c.fill();
  c.fillStyle = !b ? '#ffd020' : '#504008'; c.beginPath(); c.arc(30, -14, 2.5, 0, 7); c.fill();
  c.fillStyle = '#20ff60'; c.fillRect(44, -16, 18, 3);
  poly(c, [[18, 10], [32, 10], [26, 36], [12, 34]], '#151618');
  rr(c, 74, 10, 13, 26, 4); c.fillStyle = '#151618'; c.fill();
  rr(c, 40, -6, 30, 10, 2); c.fillStyle = '#2a2d31'; c.fill();
  rr(c, 120, -8, 32, 16, 3); c.fillStyle = lg(c, 0, -8, 0, 8, [[0, '#ffb070'], [0.5, '#e05a10'], [1, '#7a2a04']]); c.fill();
  for (let x = 124; x < 150; x += 7) { c.fillStyle = 'rgba(0,0,0,0.3)'; c.fillRect(x, -8, 2, 16); }
  c.globalCompositeOperation = 'lighter';
  glow(c, 152, 0, 10 + Math.sin(s.t * 15) * 2, '255,120,40', 0.6);
  c.globalCompositeOperation = 'source-over';
}

function drawTripod(c: CanvasRenderingContext2D, s: WState) {
  const t = s.t;
  const P0 = [-120, 46], P1 = [-30, 46 + Math.sin(t) * 6], P2 = [62, Math.sin(t * 1.3) * 3];
  for (let i = 0; i <= 14; i++) {
    const u = i / 14;
    const x = (1 - u) ** 2 * P0[0] + 2 * (1 - u) * u * P1[0] + u * u * P2[0];
    const y = (1 - u) ** 2 * P0[1] + 2 * (1 - u) * u * P1[1] + u * u * P2[1];
    c.fillStyle = lg(c, x - 6, y - 9, x + 6, y + 9, [[0, '#b8c2c8'], [0.5, '#5a646c'], [1, '#1c2226']]);
    c.beginPath(); c.ellipse(x, y, 6, 9 - u * 2, 0.4 * (1 - u), 0, 7); c.fill();
    c.strokeStyle = 'rgba(0,0,0,0.4)'; c.stroke();
  }
  const met: [number, string][] = [[0, '#d8e0e6'], [0.4, '#7c8890'], [1, '#22292e']];
  poly(c, [[56, -30], [118, -15], [128, 0], [118, 15], [56, 30], [70, 0]], lg(c, 0, -30, 0, 30, met), '#11161a', 1.2);
  c.strokeStyle = 'rgba(0,0,0,0.35)'; c.lineWidth = 1;
  for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(64 + i * 12, -24 + i * 3); c.lineTo(64 + i * 12, 24 - i * 3); c.stroke(); }
  c.fillStyle = lg(c, 0, -18, 0, 18, met); c.beginPath(); c.ellipse(92, 0, 28, 16, 0, 0, 7); c.fill();
  rr(c, 112, -7, 20, 14, 4); c.fillStyle = '#20282c'; c.fill();
  const p = 0.6 + 0.4 * Math.sin(t * 4) + (s.ready > 0.95 ? 0.2 : 0);
  c.globalCompositeOperation = 'lighter';
  glow(c, 134, 0, 22 * p, '90,255,120', 0.8);
  c.fillStyle = '#e8ffe8'; c.beginPath(); c.arc(134, 0, 5, 0, 7); c.fill();
  c.globalCompositeOperation = 'source-over';
  c.strokeStyle = '#8c969c'; c.lineWidth = 1.5;
  c.beginPath(); c.moveTo(80, -14); c.lineTo(70, -38); c.moveTo(80, 14); c.lineTo(70, 38); c.stroke();
}

function drawIron(c: CanvasRenderingContext2D, s: WState) {
  const red: [number, string][] = [[0, '#ff6a5a'], [0.4, '#b8140e'], [1, '#4a0604']];
  const gold: [number, string][] = [[0, '#fff0b0'], [0.5, '#e0b040'], [1, '#7a5410']];
  rr(c, -118, -22, 128, 44, 16); c.fillStyle = lg(c, 0, -22, 0, 22, red); c.fill();
  rr(c, -90, -14, 70, 6, 3); c.fillStyle = lg(c, 0, -14, 0, -8, gold); c.fill();
  rr(c, -90, 8, 70, 6, 3); c.fill();
  rr(c, 6, -19, 14, 38, 4); c.fillStyle = '#3a3d42'; c.fill();
  // fingers spread
  const angs = [-1.25, -0.62, 0.62, 1.25];
  angs.forEach((a, i) => {
    c.save(); c.translate(42 + Math.cos(a) * 14, Math.sin(a) * 18); c.rotate(a * 0.9);
    rr(c, 0, -5, 30 - Math.abs(i - 1.5) * 3, 10, 5); c.fillStyle = lg(c, 0, -5, 0, 5, red); c.fill();
    c.fillStyle = lg(c, 0, -5, 0, 5, gold); c.fillRect(10, -5, 3, 10); c.fillRect(20, -5, 2.5, 10);
    c.restore();
  });
  c.fillStyle = lg(c, 0, -26, 0, 26, red); c.beginPath(); c.ellipse(42, 0, 26, 26, 0, 0, 7); c.fill();
  c.strokeStyle = 'rgba(255,220,120,0.7)'; c.lineWidth = 2; c.beginPath(); c.arc(42, 0, 21, 0, 7); c.stroke();
  const p = 0.7 + 0.3 * Math.sin(s.t * 6) + s.ready * 0.2;
  c.fillStyle = '#2a2e34'; c.beginPath(); c.arc(42, 0, 14, 0, 7); c.fill();
  c.globalCompositeOperation = 'lighter';
  glow(c, 42, 0, 30 * p, '140,220,255', 0.8);
  c.fillStyle = '#eaffff'; c.beginPath(); c.arc(42, 0, 9, 0, 7); c.fill();
  c.strokeStyle = 'rgba(140,220,255,0.9)'; c.lineWidth = 1.5; c.beginPath(); c.arc(42, 0, 12, 0, 7); c.stroke();
  c.globalCompositeOperation = 'source-over';
}
