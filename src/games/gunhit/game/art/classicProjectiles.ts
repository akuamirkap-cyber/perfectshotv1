import type { VariantWeapon } from './gunVariants';
import { TAU, rand, lin, radial, star } from './kit';

type C = CanvasRenderingContext2D;

// Original shot drawings from c0769f5, not a recolor of the new projectile.
// Only visuals are reused: collisions, speed, stick depth and buffs stay current.
const NO_CLASSIC_ART = [
  'slingshot', 'blowgun', 'shotgun', 'soaker', 'snowball',
  'sniper', 'flamethrower', 'bubble', 'bamboo', 'banana',
  'harpoon', 'confetti', 'seed', 'pizza', 'minigun',
  'crossbow', 'plasma', 'laser', 'gravity', 'coconut',
  'angklung', 'bee', 'sakura', 'firework', 'keris',
  'storm', 'pencil', 'sandal', 'paintball', 'wand',
  'shark', 'ghost', 'ufo', 'rpg', 'bazooka',
  'freeze', 'magnet', 'shrink', 'grow', 'pirate',
  'card', 'holy', 'unicorn', 'obliterator', 'coingun',
  'photon_saber', 'gauntlet_cannon', 'ironman_hand', 'ruby', 'emerald', 'sapphire',
  'crystal', 'beerifle', 'buster', 'pulse_rifle', 'cryo_blaster',
  'hyperdrive', 'quantum_destabilizer', 'blaster', 'railgun',
] as const;

/** True when the gun has a genuine pre-variant shot to show as "Sebelumnya". */
export function hasClassicProjectile(id: VariantWeapon): boolean {
  return !(NO_CLASSIC_ART as readonly string[]).includes(id);
}

export function drawClassicProjectile(c: C, kind: VariantWeapon, len: number, t: number) {
  switch (kind) {
    case 'golden': classicRound(c, len, 'gold'); break;
    case 'plasma': classicPlasma(c, len, t); break;
    case 'laser': classicLaser(c, len, t); break;
    case 'blackhole': classicVoidOrb(c, len, t); break;
    case 'dragon': classicDragon(c, len, t); break;
    case 'rainbow': classicRainbow(c, len, t); break;
    case 'meteor': classicMeteor(c, len, t); break;
    case 'diamond': classicDiamond(c, len, t); break;
    case 'moonbeam': classicMoonbeam(c, len, t); break;
    case 'chicken': classicChicken(c, len); break;
    case 'honey': classicHoney(c, len, t); break;
    case 'cricket': classicCricket(c, len, t); break;
    case 'electro': classicElectro(c, len, t); break;
    case 'fish': classicFish(c, len, t); break;
    // SET 1 weapons keep their existing slide-1 projectile as the "Sebelumnya"
    // effect; `hasClassicProjectile` sends them down their normal renderer.
    case 'slingshot':
    case 'blowgun':
    case 'shotgun':
    case 'soaker':
    case 'snowball':
    case 'sniper':
    case 'flamethrower':
    case 'bubble':
    case 'bamboo':
    case 'banana':
    case 'harpoon':
    case 'confetti':
    case 'seed':
    case 'pizza':
    case 'minigun':
    case 'crossbow':
    case 'plasma':
    case 'laser':
    case 'gravity':
    case 'coconut':
    case 'angklung':
    case 'bee':
    case 'sakura':
    case 'firework':
    case 'keris':
    case 'storm':
    case 'pencil':
    case 'sandal':
    case 'paintball':
    case 'wand':
    case 'shark':
    case 'ghost':
    case 'ufo':
      return;
    case 'rpg':
    case 'bazooka':
    case 'freeze':
    case 'magnet':
    case 'shrink':
    case 'grow':
    case 'pirate':
    case 'card':
    case 'holy':
    case 'unicorn':
    case 'obliterator':
    case 'coingun':
    case 'photon_saber':
    case 'gauntlet_cannon':
    case 'ironman_hand':
    case 'ruby':
    case 'emerald':
    case 'sapphire':
    case 'crystal':
    case 'beerifle':
    case 'buster':
    case 'pulse_rifle':
    case 'cryo_blaster':
    case 'hyperdrive':
    case 'quantum_destabilizer':
    case 'blaster':
    case 'railgun':
    // Slide 9 ports (and the nine guns it added) draw their own rounds.
    case 'pistol':
    case 'ak47':
    case 'pred':
    case 'longbow':
    case 'mp5':
    case 'tesla_rifle':
    case 'ion_smg':
    case 'phaser':
    case 'yautja':
    case 'identity_disc':
    case 'proton_pack':
    case 'heat_ray':
    case 'xeno':
    case 'mega_buster':
    case 'harmonic_disruptor':
    case 'absolute_zero':
    case 'helios_flare':
    case 'chrono_rifle':
    case 'orbital_beacon':
    case 'helix_pulsar':
    case 'singularity':
    case 'prism_lance':
    case 'nano_swarm':
      return;
    default: { const _never: never = kind; return _never; }
  }
}

function classicCricket(c: C, len: number, t: number) {
  const y = len * 0.38;
  c.save(); c.globalCompositeOperation = 'lighter';
  c.shadowColor = '#62caff'; c.shadowBlur = 9;
  c.fillStyle = '#8edaff'; c.beginPath(); c.ellipse(0, y, 4, 7, 0, 0, TAU); c.fill();
  c.shadowBlur = 0; c.strokeStyle = `rgba(220,248,255,${0.55 + 0.35 * Math.sin(t * 12)})`;
  c.lineWidth = 1;
  for (const r of [7, 10]) { c.beginPath(); c.ellipse(0, y, r, 2.5, t * 0.7, 0, TAU); c.stroke(); }
  c.restore();
}

function classicElectro(c: C, len: number, t: number) {
  const end = Math.max(10, len * 0.7);
  c.save(); c.globalCompositeOperation = 'lighter';
  c.strokeStyle = 'rgba(90,209,255,0.45)'; c.lineWidth = 6; c.beginPath(); c.moveTo(0, 0);
  c.lineTo(Math.sin(t * 9) * 3, end * 0.5); c.lineTo(0, end); c.stroke();
  c.strokeStyle = '#c6f5ff'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, 0);
  c.lineTo(Math.sin(t * 9) * 3, end * 0.5); c.lineTo(0, end); c.stroke();
  c.restore();
}

function classicFish(c: C, len: number, t: number) {
  const y = len * 0.38, sway = Math.sin(t * 9) * 2;
  c.fillStyle = '#ff9a3a'; c.beginPath();
  c.moveTo(0, y + 3); c.lineTo(-5 + sway, y + 10); c.lineTo(0, y + 7); c.lineTo(5 + sway, y + 10); c.closePath(); c.fill();
  c.fillStyle = '#ef6c1b'; c.beginPath(); c.ellipse(0, y, 4, 8, 0, 0, TAU); c.fill();
  c.strokeStyle = 'rgba(255,246,220,0.85)'; c.lineWidth = 1;
  c.beginPath(); c.ellipse(0, y, 4.5, 8.5, 0, 0, TAU); c.stroke();
  c.fillStyle = '#fff'; c.beginPath(); c.arc(2, y - 3, 1, 0, TAU); c.fill();
}

// The pre-rework syrup droplet: short, pointed and without the newer liquid
// trail. Its impact still uses the selected visual FX without changing stick.
function classicHoney(c: C, len: number, t: number) {
  c.beginPath();
  c.moveTo(0, -2);
  c.bezierCurveTo(8, 2, 8, len * 0.6, 3, len * 0.8);
  c.quadraticCurveTo(0, len + 2, -3, len * 0.8);
  c.bezierCurveTo(-8, len * 0.6, -8, 2, 0, -2);
  c.fillStyle = radial(c, -2, len * 0.3, len * 0.7, ['#fef3c7', '#fbbf24', '#b45309']);
  c.fill();
  c.fillStyle = 'rgba(255,255,255,0.65)';
  c.beginPath();
  c.ellipse(-2.5, len * 0.25, 1.5, 4, 0.2, 0, TAU);
  c.fill();
  c.strokeStyle = 'rgba(245,158,11,0.8)';
  c.lineWidth = 1.5;
  c.beginPath();
  c.moveTo(-2, len * 0.8);
  c.quadraticCurveTo(-3, len + 4, -1, len + 6 + Math.sin(t * 8) * 2);
  c.stroke();
}

function classicRound(c: C, len: number, v: 'normal' | 'old' | 'gold') {
  const head = Math.round(len * 0.38);
  const tip = v === 'old' ? ['#2a1a14', '#8b6a5a', '#2a1a14'] : v === 'gold' ? ['#8a6400', '#fff6c0', '#a07800'] : ['#7a3212', '#f6b07a', '#7a3212'];
  const body = v === 'old' ? ['#2f3236', '#a3a8ad', '#2f3236'] : v === 'gold' ? ['#7a5800', '#ffe46a', '#7a5800'] : ['#8c5e10', '#ffe695', '#8c5e10'];
  c.beginPath();
  c.moveTo(-5, head);
  c.lineTo(-5, 7);
  c.quadraticCurveTo(-4.5, 0, 0, -1);
  c.quadraticCurveTo(4.5, 0, 5, 7);
  c.lineTo(5, head);
  c.closePath();
  c.fillStyle = lin(c, -6, 6, tip);
  c.fill();
  c.fillStyle = lin(c, -6, 6, body);
  c.fillRect(-5.5, head, 11, len - head - 3.5);
  c.fillStyle = 'rgba(0,0,0,0.35)';
  c.fillRect(-5.5, head, 11, 1.5);
  c.fillRect(-5.5, len - 5.5, 11, 1.5);
  c.fillStyle = v === 'old' ? '#55595e' : v === 'gold' ? '#d4a017' : '#c08a24';
  c.fillRect(-6.5, len - 3.5, 13, 3.5);
  if (v === 'gold') {
    c.fillStyle = 'rgba(255,255,255,0.8)';
    c.fillRect(-2.5, 4, 1.2, len - 10);
  }
}

function glowEllipse(c: C, y: number, rx: number, ry: number, rgb: string, a: number) {
  const g = c.createRadialGradient(0, y, 1, 0, y, Math.max(rx, ry));
  g.addColorStop(0, `rgba(${rgb},${a})`);
  g.addColorStop(1, `rgba(${rgb},0)`);
  c.fillStyle = g;
  c.beginPath();
  c.ellipse(0, y, rx, ry, 0, 0, TAU);
  c.fill();
}

function classicPlasma(c: C, len: number, t: number) {
  const pulse = 0.75 + 0.25 * Math.sin(t * 12);
  c.globalCompositeOperation = 'lighter';
  glowEllipse(c, len * 0.45, 13, len * 0.65, '57,255,156', 0.55 * pulse);
  c.shadowColor = '#39ff9c';
  c.shadowBlur = 14;
  c.fillStyle = '#1fe08a';
  c.beginPath();
  c.roundRect(-5.5, -1, 11, len * 0.92, 5.5);
  c.fill();
  c.shadowBlur = 0;
  c.fillStyle = '#eafff4';
  c.beginPath();
  c.roundRect(-2.2, 2, 4.4, len * 0.82, 2.2);
  c.fill();
}

function classicLaser(c: C, len: number, t: number) {
  const pulse = 0.8 + 0.2 * Math.sin(t * 15);
  c.shadowColor = '#ff2a55';
  c.shadowBlur = 16 * pulse;
  c.fillStyle = lin(c, -5, 5, ['#8a001c', '#ff8fa6', '#ff3a63', '#8a001c']);
  c.beginPath();
  c.moveTo(0, -2);
  c.lineTo(5, 10);
  c.lineTo(4, len - 7);
  c.lineTo(0, len);
  c.lineTo(-4, len - 7);
  c.lineTo(-5, 10);
  c.closePath();
  c.fill();
  c.shadowBlur = 0;
  c.strokeStyle = `rgba(255,255,255,${0.75 * pulse})`;
  c.lineWidth = 1.5;
  c.beginPath();
  c.moveTo(0, 2);
  c.lineTo(0, len - 6);
  c.stroke();
}

function classicVoidOrb(c: C, len: number, t: number) {
  c.save();
  c.globalCompositeOperation = 'lighter';
  glowEllipse(c, len * 0.45, 11, len * 0.6, '168,85,247', 0.6);
  c.restore();
  const y = 9;
  c.save();
  c.translate(0, y);
  c.rotate(t * 5);
  const g = c.createRadialGradient(0, 0, 4, 0, 0, 13);
  g.addColorStop(0, 'rgba(255,170,80,1)');
  g.addColorStop(0.4, 'rgba(200,90,255,0.9)');
  g.addColorStop(1, 'rgba(120,40,220,0)');
  c.fillStyle = g;
  c.beginPath();
  c.ellipse(0, 0, 13, 5, 0, 0, TAU);
  c.fill();
  c.restore();
  c.fillStyle = '#000';
  c.beginPath();
  c.arc(0, y, 5.5, 0, TAU);
  c.fill();
  c.strokeStyle = 'rgba(230,200,255,0.9)';
  c.lineWidth = 1;
  c.beginPath();
  c.arc(0, y, 6.3, 0, TAU);
  c.stroke();
}

function glowE(c: C, y: number, rx: number, ry: number, rgb: string, a: number) {
  c.save();
  c.globalCompositeOperation = 'lighter';
  const g = c.createRadialGradient(0, y, 1, 0, y, Math.max(rx, ry));
  g.addColorStop(0, `rgba(${rgb},${a})`);
  g.addColorStop(1, `rgba(${rgb},0)`);
  c.fillStyle = g;
  c.beginPath();
  c.ellipse(0, y, rx, ry, 0, 0, TAU);
  c.fill();
  c.restore();
}

const RB = ['#f87171', '#fb923c', '#facc15', '#4ade80', '#60a5fa', '#a78bfa'];

function classicDragon(c: C, len: number, t: number) {

      const isD = true;
      glowE(c, len * 0.4, 12, len * 0.6, '255,120,30', 0.6);
      const fl = 1 + 0.1 * Math.sin(t * 30);
      c.save();
      c.globalCompositeOperation = 'lighter';
      c.beginPath();
      c.moveTo(0, -2);
      c.bezierCurveTo(8 * fl, len * 0.2, 7, len * 0.7, 0, len * fl);
      c.bezierCurveTo(-7, len * 0.7, -8 * fl, len * 0.2, 0, -2);
      const g = c.createLinearGradient(0, 0, 0, len);
      g.addColorStop(0, '#fffbe0');
      g.addColorStop(0.3, '#fbbf24');
      g.addColorStop(0.7, '#f97316');
      g.addColorStop(1, 'rgba(220,38,38,0)');
      c.fillStyle = g;
      c.fill();
      c.beginPath();
      c.ellipse(0, len * 0.25, 2.5, len * 0.2, 0, 0, TAU);
      c.fillStyle = '#ffffff';
      c.fill();
      c.restore();
      if (isD) {
        // tiny dragon horns + eyes on the fireball
        c.fillStyle = '#fef3c7';
        c.beginPath();
        c.moveTo(-4, 6);
        c.lineTo(-7, -2);
        c.lineTo(-2, 4);
        c.moveTo(4, 6);
        c.lineTo(7, -2);
        c.lineTo(2, 4);
        c.fill();
        c.fillStyle = '#7f1d1d';
        c.beginPath();
        c.arc(-2.2, 9, 1.2, 0, TAU);
        c.arc(2.2, 9, 1.2, 0, TAU);
        c.fill();
      }
}

function classicChicken(c: C, len: number) {

      // body (rubber chicken, head first)
      c.save();
      c.fillStyle = lin(c, -6, 6, ['#ca8a04', '#fde047', '#eab308']);
      c.beginPath();
      c.ellipse(0, len * 0.68, 6, len * 0.3, 0, 0, TAU);
      c.fill();
      c.fillRect(-2.2, 8, 4.4, len * 0.45);
      c.beginPath();
      c.arc(0, 6, 5, 0, TAU);
      c.fill();
      c.strokeStyle = '#a16207';
      c.lineWidth = 1;
      c.stroke();
      // comb
      c.fillStyle = '#ef4444';
      c.beginPath();
      c.arc(-2.5, 2, 2, 0, TAU);
      c.arc(0, 0.5, 2, 0, TAU);
      c.arc(2.5, 2, 2, 0, TAU);
      c.fill();
      // beak
      c.fillStyle = '#f97316';
      c.beginPath();
      c.moveTo(-2, 9);
      c.lineTo(2, 9);
      c.lineTo(0, 13);
      c.fill();
      // X eyes
      c.strokeStyle = '#111';
      c.lineWidth = 0.9;
      for (const s of [-1, 1]) {
        c.beginPath();
        c.moveTo(s * 2.2 - 1, 4.5);
        c.lineTo(s * 2.2 + 1, 6.5);
        c.moveTo(s * 2.2 + 1, 4.5);
        c.lineTo(s * 2.2 - 1, 6.5);
        c.stroke();
      }
      // feet
      c.strokeStyle = '#f97316';
      c.lineWidth = 1.5;
      c.beginPath();
      c.moveTo(-2, len * 0.95);
      c.lineTo(-4, len + 2);
      c.moveTo(2, len * 0.95);
      c.lineTo(4, len + 2);
      c.stroke();
      c.restore();
}

function classicRainbow(c: C, len: number, t: number) {

      glowE(c, len * 0.4, 12, len * 0.6, '255,200,230', 0.55);
      for (let i = 0; i < 6; i++) {
        c.fillStyle = RB[(i + Math.floor(t * 12)) % 6];
        c.fillRect(-6 + i * 2, 6, 2, len - 8);
      }
      c.fillStyle = 'rgba(255,255,255,0.45)';
      c.fillRect(-1, 6, 2, len - 8);
      c.save();
      c.translate(0, 4);
      c.rotate(t * 6);
      star(c, 0, 0, 7, '#fde047');
      c.restore();
      c.fillStyle = '#ffffff';
      c.beginPath();
      c.arc(0, 4, 2, 0, TAU);
      c.fill();
}

function classicMeteor(c: C, len: number, t: number) {

      const r = Math.min(9, len * 0.4);
      glowE(c, r + 6, 16, len * 0.8, '255,140,50', 0.6);
      c.save();
      c.globalCompositeOperation = 'lighter';
      const fg = c.createLinearGradient(0, r, 0, len + 14);
      fg.addColorStop(0, 'rgba(255,240,200,0.9)');
      fg.addColorStop(0.4, 'rgba(251,146,60,0.7)');
      fg.addColorStop(1, 'rgba(220,38,38,0)');
      c.fillStyle = fg;
      c.beginPath();
      c.moveTo(-r, r);
      c.lineTo(r, r);
      c.lineTo(rand(-2, 2), len + 14);
      c.closePath();
      c.fill();
      c.restore();
      c.beginPath();
      for (let i = 0; i < 9; i++) {
        const a = (i / 9) * TAU;
        const rr2 = r * (0.8 + Math.sin(i * 3.1) * 0.2);
        c.lineTo(Math.cos(a) * rr2, r + Math.sin(a) * rr2);
      }
      c.closePath();
      c.fillStyle = radial(c, 0, r, r, ['#78716c', '#44403c', '#1c1917']);
      c.fill();
      c.strokeStyle = '#fb923c';
      c.lineWidth = 1.2;
      c.beginPath();
      c.moveTo(-r * 0.5, r - 2);
      c.lineTo(0, r + 1);
      c.lineTo(r * 0.4, r - 3);
      c.moveTo(-1, r + 3);
      c.lineTo(2, r + r * 0.6);
      c.stroke();
}

function classicDiamond(c: C, len: number, t: number) {

      c.save();
      c.shadowColor = '#a5f3fc';
      c.shadowBlur = 10;
      c.beginPath();
      c.moveTo(0, -2);
      c.lineTo(6, len * 0.55);
      c.lineTo(4, len * 0.72);
      c.lineTo(-4, len * 0.72);
      c.lineTo(-6, len * 0.55);
      c.closePath();
      const g = c.createLinearGradient(-6, 0, 6, len);
      g.addColorStop(0, '#ecfeff');
      g.addColorStop(0.5, '#67e8f9');
      g.addColorStop(1, '#0891b2');
      c.fillStyle = g;
      c.fill();
      c.restore();
      c.strokeStyle = 'rgba(255,255,255,0.9)';
      c.lineWidth = 0.8;
      c.beginPath();
      c.moveTo(-6, len * 0.55);
      c.lineTo(6, len * 0.55);
      c.moveTo(0, -2);
      c.lineTo(-2, len * 0.55);
      c.lineTo(0, len * 0.72);
      c.lineTo(2, len * 0.55);
      c.lineTo(0, -2);
      c.stroke();
      c.fillStyle = lin(c, -3, 3, ['#94a3b8', '#f8fafc', '#94a3b8']);
      c.fillRect(-2, len * 0.72, 4, len * 0.28);
      if (Math.sin(t * 6) > 0.3) star(c, 3, len * 0.3, 4, '#ffffff', 4);
}

function classicMoonbeam(c: C, len: number, t: number) {

      glowE(c, len * 0.4, 10, len * 0.6, '196,181,253', 0.6);
      c.save();
      c.translate(0, 8);
      c.shadowColor = '#ede9fe';
      c.shadowBlur = 10;
      c.beginPath();
      c.arc(0, 0, 7, Math.PI * 0.2, Math.PI * 1.8);
      c.arc(3, 0, 5.5, Math.PI * 1.7, Math.PI * 0.3, true);
      c.closePath();
      c.fillStyle = '#f5f3ff';
      c.fill();
      c.restore();
      c.fillStyle = 'rgba(221,214,254,0.85)';
      c.fillRect(-1.2, 15, 2.4, len - 15);
      star(c, -4, len * 0.6, 2.5, '#ffffff', 4);
      star(c, 4, len * 0.8, 2, '#ffffff', 4);
}
