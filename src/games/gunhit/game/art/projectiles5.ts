import type { ProjKind } from '../weapons';
import { TAU, lin, radial, star } from './kit';

type C = CanvasRenderingContext2D;

// game-3 blob sprite: pow(1-d2,2) falloff creates ultra-soft fluid glow
let _blobGreen: HTMLCanvasElement | null = null;
function blobGreen() {
  if (_blobGreen) return _blobGreen;
  const S = 64;
  const c = document.createElement('canvas');
  c.width = c.height = S;
  const g = c.getContext('2d')!;
  const img = g.createImageData(S, S);
  for (let y = 0; y < S; y++)
    for (let x = 0; x < S; x++) {
      const dx = (x + 0.5) / (S / 2) - 1, dy = (y + 0.5) / (S / 2) - 1;
      const d2 = dx * dx + dy * dy;
      const v = d2 >= 1 ? 0 : Math.pow(1 - d2, 2);
      const i = (y * S + x) * 4;
      // green tint like game-3 xeno acid
      img.data[i] = Math.round(182 + (244 - 182) * v);
      img.data[i + 1] = Math.round(255);
      img.data[i + 2] = Math.round(26 + (154 - 26) * v * v);
      img.data[i + 3] = Math.round(v * 255);
    }
  g.putImageData(img, 0, 0);
  _blobGreen = c;
  return _blobGreen;
}

function drawBlob(c: C, x: number, y: number, r: number, a: number) {
  c.save();
  c.globalAlpha = Math.min(1, a);
  c.drawImage(blobGreen(), x - r, y - r, r * 2, r * 2);
  c.restore();
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
const rgba = (h: string, a: number) => { const n = parseInt(h.slice(1), 16); return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`; };

export function drawProjectileExtra4(c: C, kind: ProjKind, len: number, t: number, embedded = false) {
  switch (kind) {
    // ---------------------------------------------------------- PHOTON SABER
    case 'photon_saber': {
      const pulse = 0.8 + 0.2 * Math.sin(t * 14);
      glowE(c, len / 2, 10, len * 0.6, '34,211,238', 0.6 * pulse);
      c.save();
      c.shadowColor = '#22d3ee';
      c.shadowBlur = 16 * pulse;
      c.beginPath();
      c.roundRect(-3.5, -1, 7, len, 3.5);
      c.fillStyle = lin(c, 0, 0, ['#ffffff', '#a5f3fc', '#22d3ee']);
      c.fill();
      c.restore();
      c.fillStyle = `rgba(255,255,255,${0.9 * pulse})`;
      c.beginPath();
      c.roundRect(-1.2, 1, 2.4, len - 2, 1.2);
      c.fill();
      break;
    }
    // ---------------------------------------------------------- GAUNTLET CANNON
    case 'gauntlet_cannon': {
      const pulse = 0.8 + 0.2 * Math.sin(t * 10);
      c.save();
      // Stuck Gauntlet is 20% larger ("yg nancep tu adl gauntlet jg dan lebihbesar 20 persen yg nancepnya")
      if (embedded) {
        c.scale(1.2, 1.2);
      }

      // Roaring rocket thruster flame & supersonic Mach shock-rings while flying
      if (!embedded) {
        glowE(c, 26, 20, 38, '249,115,22', 0.62 * pulse);
        // Outer crimson-orange thruster jet plume
        const jetLen = 24 + 7 * Math.sin(t * 36);
        const jetG = c.createLinearGradient(0, 50, 0, 52 + jetLen);
        jetG.addColorStop(0, 'rgba(255,255,255,0.95)');
        jetG.addColorStop(0.25, 'rgba(254,240,138,0.92)');
        jetG.addColorStop(0.6, 'rgba(249,115,22,0.78)');
        jetG.addColorStop(1, 'rgba(220,38,38,0)');
        c.fillStyle = jetG;
        c.beginPath();
        c.moveTo(-6.5, 51);
        c.quadraticCurveTo(-8.5, 51 + jetLen * 0.45, 0, 52 + jetLen);
        c.quadraticCurveTo(8.5, 51 + jetLen * 0.45, 6.5, 51);
        c.closePath();
        c.fill();

        // Inner white-hot thruster core
        c.fillStyle = '#ffffff';
        c.beginPath();
        c.moveTo(-3.2, 51);
        c.lineTo(0, 51 + jetLen * 0.52);
        c.lineTo(3.2, 51);
        c.closePath();
        c.fill();
      } else {
        // Warm pulsing aura around the embedded Gauntlet on the target rim
        glowE(c, 18, 18, 26, '249,115,22', 0.48 * pulse);
      }

      // ── 1. PEGANGAN / DARK GUNMETAL GRIP SLEEVE (width 18.4px: -9.2 .. +9.2) ──
      // Beveled bottom cap & glowing golden power port (y = 48 .. 53)
      c.beginPath();
      c.moveTo(-9.2, 48);
      c.lineTo(9.2, 48);
      c.lineTo(6.4, 52.5);
      c.quadraticCurveTo(0, 54.2, -6.4, 52.5);
      c.closePath();
      c.fillStyle = lin(c, -9.2, 9.2, ['#090d16', '#1e293b', '#475569', '#1e293b', '#090d16']);
      c.fill();
      c.strokeStyle = 'rgba(9,13,22,0.68)';
      c.lineWidth = 0.72;
      c.stroke();

      // Glowing golden bottom exhaust port
      c.beginPath();
      c.ellipse(0, 52.3, 4.6, 1.7, 0, 0, TAU);
      c.fillStyle = radial(c, 0, 52.3, 5, ['#ffffff', '#fef08a', '#facc15', '#d97706']);
      c.fill();

      // Cylindrical dark-slate / gunmetal grip body (y = 35 .. 49, width 18.4px)
      c.beginPath();
      c.roundRect(-9.2, 35, 18.4, 14, [2, 2, 3.5, 3.5]);
      c.fillStyle = lin(c, -9.2, 9.2, ['#0b101b', '#283548', '#64748b', '#475569', '#1e293b', '#090d16']);
      c.fill();
      c.strokeStyle = 'rgba(9,13,22,0.68)';
      c.lineWidth = 0.75;
      c.stroke();

      // Vertical glossy specular highlight on left of grip sleeve
      c.fillStyle = 'rgba(226,232,240,0.38)';
      c.fillRect(-6.8, 36.5, 2.5, 11.5);

      // Segmented metallic Gold Collar Ring around upper grip (y = 37 .. 42, width 19.6px)
      c.beginPath();
      c.roundRect(-9.8, 37, 19.6, 5, 1.4);
      c.fillStyle = lin(c, -9.8, 9.8, ['#78350f', '#d97706', '#fde047', '#fef9c3', '#f59e0b', '#92400e']);
      c.fill();
      c.strokeStyle = 'rgba(69,26,3,0.68)';
      c.lineWidth = 0.7;
      c.stroke();
      for (const nx of [-5.8, -1.9, 1.9, 5.8]) {
        c.fillStyle = 'rgba(120,53,15,0.7)';
        c.fillRect(nx - 0.9, 38, 1.8, 3);
      }

      // ── 2. DUAL SEGMENTED CRIMSON WRIST RINGS (+20% WIDER THAN GRIP!) ──
      const redGrad = (x0: number, x1: number) =>
        lin(c, x0, x1, ['#3b0707', '#991b1b', '#ef4444', '#fca5a5', '#dc2626', '#991b1b', '#2a0404']);

      // Lower crimson beveled wrist ring (y = 30.5 .. 35.5, width 22px)
      c.beginPath();
      c.roundRect(-11, 30.5, 22, 5, 2.2);
      c.fillStyle = redGrad(-11, 11);
      c.fill();
      c.strokeStyle = 'rgba(42,4,4,0.68)';
      c.lineWidth = 0.72;
      c.stroke();

      // Upper thick ribbed crimson cuff (y = 23.5 .. 30, width 23.6px)
      c.beginPath();
      c.roundRect(-11.8, 23.5, 23.6, 6.5, 2.6);
      c.fillStyle = redGrad(-11.8, 11.8);
      c.fill();
      c.strokeStyle = 'rgba(42,4,4,0.68)';
      c.lineWidth = 0.75;
      c.stroke();
      for (const sx of [-7.2, -2.4, 2.4, 7.2]) {
        c.fillStyle = 'rgba(69,10,10,0.8)';
        c.fillRect(sx - 1, 24.7, 2, 4.1);
      }

      // ── 3. MAIN FACETED CRIMSON GAUNTLET HEAD (y = 0 .. 23, width 23.2px — 26% wider than 18.4px grip!) ──
      const gw = 11.6;
      c.beginPath();
      c.moveTo(-8, 0);
      c.lineTo(8, 0);
      c.lineTo(gw, 4.5);
      c.lineTo(gw, 18.5);
      c.lineTo(9.4, 23);
      c.lineTo(-9.4, 23);
      c.lineTo(-gw, 18.5);
      c.lineTo(-gw, 4.5);
      c.closePath();
      c.fillStyle = redGrad(-gw, gw);
      c.fill();
      c.strokeStyle = 'rgba(42,4,4,0.68)';
      c.lineWidth = 0.8;
      c.stroke();

      // Sculpted top knuckle plates at the leading punch edge
      for (const kx of [-5.4, -1.8, 1.8, 5.4]) {
        c.fillStyle = '#7f1d1d';
        c.fillRect(kx - 1.4, 0.7, 2.8, 1.8);
      }

      // Left glossy highlight on crimson gauntlet head
      c.fillStyle = 'rgba(255,228,230,0.42)';
      c.beginPath();
      c.roundRect(-9.6, 4, 3.2, 16, 1.4);
      c.fill();

      // Two recessed lower cheek vents on left & right of gauntlet head
      for (const dir of [-1, 1] as const) {
        c.fillStyle = '#5c0f0f';
        c.strokeStyle = 'rgba(254,202,202,0.5)';
        c.lineWidth = 0.65;
        c.beginPath();
        c.roundRect(dir * 7.2 - 1.5, 16.2, 3, 4.6, 0.6);
        c.fill();
        c.stroke();
      }

      // ── 4. GOLD-RIMMED SOLAR REPULSOR CORE IN GAUNTLET PALM (y = 10.5, r = 6.8) ──
      const coreY = 10.5;
      // Outer metallic Gold Bezel Ring
      c.beginPath();
      c.arc(0, coreY, 6.8, 0, TAU);
      c.fillStyle = lin(c, -6.8, 6.8, ['#78350f', '#f59e0b', '#fef08a', '#facc15', '#d97706', '#78350f']);
      c.fill();
      c.strokeStyle = 'rgba(69,26,3,0.72)';
      c.lineWidth = 0.75;
      c.stroke();

      // Recessed crimson-orange inner ring
      c.beginPath();
      c.arc(0, coreY, 5.2, 0, TAU);
      c.fillStyle = radial(c, 0, coreY, 5.2, ['#fb923c', '#ea580c', '#991b1b']);
      c.fill();

      // Blazing white-hot to solar-gold repulsor core
      c.beginPath();
      c.arc(0, coreY, 3.9, 0, TAU);
      c.fillStyle = radial(c, -0.6, coreY - 0.6, 4.2, ['#ffffff', '#fef08a', '#facc15', '#f97316', '#dc2626']);
      c.shadowColor = '#facc15';
      c.shadowBlur = 12 * pulse;
      c.fill();
      c.shadowBlur = 0;

      // 4-point starburst gleam on upper-right of gold bezel
      star(c, 4.2, coreY - 4.6, 2.8 + pulse * 0.6, '#ffffff', 4);

      if (!embedded) {
        // Leading supersonic knuckle shock-arc & Mach ring during flight
        c.strokeStyle = `rgba(254,240,138,${0.82 * pulse})`;
        c.lineWidth = 1.6;
        c.beginPath();
        c.arc(0, 4, 13.5, Math.PI * 1.15, Math.PI * 1.85);
        c.stroke();

        c.strokeStyle = `rgba(251,146,60,${0.65 * pulse})`;
        c.lineWidth = 1.3;
        c.beginPath();
        c.ellipse(0, 28, 15.5, 4.2, 0, 0, TAU);
        c.stroke();
      } else {
        // Embedded impact shock-ring & crackling golden-red energy arcs at the target rim (y = 5.5)
        c.strokeStyle = `rgba(254,240,138,${0.85 * pulse})`;
        c.lineWidth = 1.8;
        c.beginPath();
        c.ellipse(0, 5.5, 14.5, 3.4, 0, 0, TAU);
        c.stroke();

        c.strokeStyle = `rgba(239,68,68,${0.75 * pulse})`;
        c.lineWidth = 1.2;
        c.beginPath();
        c.moveTo(-11, 5.5);
        c.lineTo(-16, 3.2);
        c.moveTo(11, 5.5);
        c.lineTo(16, 3.2);
        c.stroke();
      }

      c.restore();
      break;
    }
    // ---------------------------------------------------------- PULSE RIFLE
    case 'pulse_rifle': {
      const pulse = 0.8 + 0.2 * Math.sin(t * 16);
      glowE(c, len / 2, 8, len * 0.55, '56,189,248', 0.55 * pulse);
      // Peluru listrik dart
      c.beginPath();
      c.moveTo(0, -3);
      c.lineTo(4, 8);
      c.lineTo(2, len - 4);
      c.lineTo(-2, len - 4);
      c.lineTo(-4, 8);
      c.closePath();
      c.fillStyle = lin(c, -4, 4, ['#0c4a6e', '#bae6fd', '#38bdf8', '#0c4a6e']);
      c.fill();
      // Kilatan listrik
      c.strokeStyle = `rgba(255,255,255,${0.85 * pulse})`;
      c.lineWidth = 1.2;
      c.beginPath();
      c.moveTo(-3, 4); c.lineTo(3, 10);
      c.moveTo(3, 12); c.lineTo(-3, 18);
      c.stroke();
      break;
    }
    // ---------------------------------------------------------- CRYO BLASTER
    case 'cryo_blaster': {
      const pulse = 0.8 + 0.2 * Math.sin(t * 9);
      glowE(c, len / 2, 10, len * 0.6, '103,232,249', 0.55 * pulse);
      // Kristal es tajam
      c.beginPath();
      c.moveTo(0, -4);
      c.lineTo(6, 8);
      c.lineTo(3, len - 3);
      c.lineTo(-3, len - 3);
      c.lineTo(-6, 8);
      c.closePath();
      c.fillStyle = lin(c, -6, 6, ['#ffffff', '#cffafe', '#22d3ee', '#0e7490']);
      c.fill();
      c.strokeStyle = `rgba(255,255,255,${0.9 * pulse})`;
      c.lineWidth = 1;
      c.beginPath();
      c.moveTo(0, -4); c.lineTo(0, len - 4);
      c.moveTo(-6, 8); c.lineTo(6, 8);
      c.stroke();
      break;
    }
    // ---------------------------------------------------------- HYPERDRIVE
    case 'hyperdrive': {
      const pulse = 0.8 + 0.2 * Math.sin(t * 11);
      glowE(c, len / 2, 11, len * 0.6, '96,165,250', 0.6 * pulse);
      // Peluru berlubang (torus)
      c.beginPath();
      c.arc(0, len / 2, Math.min(8, len * 0.4), 0, TAU);
      c.fillStyle = radial(c, 0, len / 2, Math.min(8, len * 0.4), ['#ffffff', '#bfdbfe', '#3b82f6', '#1e3a8a']);
      c.shadowColor = '#60a5fa';
      c.shadowBlur = 14;
      c.fill();
      c.shadowBlur = 0;
      c.fillStyle = 'rgba(30,58,138,0.9)';
      c.beginPath();
      c.arc(0, len / 2, Math.min(3.5, len * 0.18), 0, TAU);
      c.fill();
      break;
    }
    // ---------------------------------------------------------- QUANTUM DESTABILIZER
    case 'quantum_destabilizer': {
      const pulse = 0.75 + 0.25 * Math.sin(t * 12);
      glowE(c, len / 2, 10, len * 0.6, '168,85,247', 0.6 * pulse);
      // Bola portal ungu dengan cincin
      c.beginPath();
      c.arc(0, len / 2, Math.min(8, len * 0.42), 0, TAU);
      c.fillStyle = radial(c, 0, len / 2, Math.min(8, len * 0.42), ['#ffffff', '#e9d5ff', '#a855f7', '#4c1d95']);
      c.shadowColor = '#a855f7';
      c.shadowBlur = 14;
      c.fill();
      c.shadowBlur = 0;
      // Cincin berputar
      c.save();
      c.translate(0, len / 2);
      c.rotate(t * 4);
      c.strokeStyle = `rgba(233,213,255,${0.9 * pulse})`;
      c.lineWidth = 1.4;
      c.beginPath();
      c.ellipse(0, 0, 11, 4, 0, 0, TAU);
      c.stroke();
      c.restore();
      // Pusat hitam
      c.fillStyle = '#000';
      c.beginPath();
      c.arc(0, len / 2, 3, 0, TAU);
      c.fill();
      break;
    }
    // ---------------------------------------------------------- XENOMORPH ACID SPIT
    case 'xeno': {
      const pulse = 0.8 + 0.2 * Math.sin(t * 14);
      // game-3 fluid-layer blob rendering: drawImage of blob sprite with 'lighter'
      c.save();
      c.globalCompositeOperation = 'lighter';
      // head blob (r=13, game-3 line 893)
      drawBlob(c, 0, len / 2 - 4, 13, 0.9 * pulse);
      // body blob (r=11, game-3 line 894)
      drawBlob(c, 0, len / 2 + 5, 11, 0.75 * pulse);
      // tail blob (r=8.5, game-3 line 895)
      drawBlob(c, Math.sin(t * 40) * 1.5, len / 2 + 19, 8.5, 0.6 * pulse);
      // trail blobs (game-3 line 896-897: decreasing radius)
      for (let i = 1; i <= 4; i++) {
        const tk = i / 4;
        const tx = Math.sin(t * 40 - i * 0.8) * 1.5;
        const tr = 7.5 * (1 - tk) + 1.5;
        drawBlob(c, tx, len / 2 + 19 + i * 6, tr, 0.5 * pulse * (1 - tk));
      }
      c.restore();
      // viscous body outline (translucent, game-3 line 898-899)
      c.save();
      c.globalCompositeOperation = 'lighter';
      c.strokeStyle = rgba('#b6ff1a', 0.4 * pulse);
      c.lineWidth = 1.5;
      c.beginPath();
      c.moveTo(-7, len - 2);
      c.bezierCurveTo(-10, len / 2, -5, 0, 0, 2);
      c.bezierCurveTo(5, 0, 10, len / 2, 7, len - 2);
      c.bezierCurveTo(0, len + 4, -7, len + 4, -7, len - 2);
      c.stroke();
      // inner bright core
      drawBlob(c, -2, len / 2 - 6, 5, 0.5 * pulse);
      c.restore();
      // drips (game-3 line 900: viscous drips trailing)
      for (let i = 0; i < 5; i++) {
        const dy = ((t * 0.5 + i * 0.2) % 1) * len;
        c.globalCompositeOperation = 'lighter';
        glowE(c, len / 2 + dy * 0.3, 3, 3, '182,255,26', 0.4 * (1 - dy / len));
        c.globalCompositeOperation = 'source-over';
      }
      break;
    }
    // ---------------------------------------------------------- DORAEMON AIR RING
    case 'dora': {
      const pulse = 0.85 + 0.15 * Math.sin(t * 20);
      c.save();
      c.globalCompositeOperation = 'lighter';
      glowE(c, len / 2, 14, 8, '255,255,255', 0.4 * pulse);
      c.restore();
      // torus ring seen edge-on (game-3: 4 ellipse strokes)
      c.lineCap = 'round';
      c.strokeStyle = 'rgba(255,255,255,0.22)'; c.lineWidth = 12;
      c.beginPath(); c.ellipse(0, len / 2, 12, 5, 0, 0, TAU); c.stroke();
      c.strokeStyle = 'rgba(255,255,255,0.9)'; c.lineWidth = 3;
      c.beginPath(); c.ellipse(0, len / 2, 12, 5, 0, 0, TAU); c.stroke();
      c.strokeStyle = 'rgba(159,220,255,0.7)'; c.lineWidth = 1.5;
      c.beginPath(); c.ellipse(0, len / 2, 20, 9, 0, 0, TAU); c.stroke();
      c.strokeStyle = 'rgba(255,255,255,0.5)'; c.lineWidth = 1.5;
      c.beginPath(); c.ellipse(0, len / 2, 3, 1.5, 0, 0, TAU); c.stroke();
      // Vortex curls and speed lines animate exactly as before, but each set
      // shares one disconnected path. The HUD repeats this glyph for every
      // round, so drawing each curl/line separately was particularly costly.
      c.strokeStyle = 'rgba(255,255,255,0.7)'; c.lineWidth = 2;
      c.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = t * 18 + (i / 6) * TAU;
        const px = Math.cos(a) * 12, py = len / 2 + Math.sin(a) * 5;
        c.moveTo(px + Math.cos(a) * 6, py + Math.sin(a) * 6);
        c.arc(px, py, 6, a, a + 3.5);
      }
      c.stroke();
      c.save();
      c.globalCompositeOperation = 'lighter';
      c.strokeStyle = 'rgba(255,255,255,0.35)'; c.lineWidth = 2;
      c.beginPath();
      for (let i = 0; i < 7; i++) {
        const lx = (i - 3) * 13 + Math.sin(t * 50 + i) * 2;
        const ll = 30 + (3 - Math.abs(i - 3)) * 18;
        c.moveTo(lx, len / 2 + 14); c.lineTo(lx, len / 2 + 14 + ll);
      }
      c.stroke();
      c.restore();
      break;
    }
    // ---------------------------------------------------------- PREDATOR PLASMA BOLT
    case 'pred': {
      const pulse = 0.9 + 0.1 * Math.sin(t * 30);
      c.save();
      c.globalCompositeOperation = 'lighter';
      // ion tail (game-3: tapered triangle, white→blue→transparent)
      const tail = c.createLinearGradient(0, len, 0, 0);
      tail.addColorStop(0, 'rgba(56,138,255,0)');
      tail.addColorStop(0.25, 'rgba(111,211,255,0.6)');
      tail.addColorStop(0.7, 'rgba(150,210,255,0.8)');
      tail.addColorStop(1, 'rgba(255,255,255,0.95)');
      c.fillStyle = tail;
      c.beginPath();
      c.moveTo(-12, 0); c.quadraticCurveTo(-6, len * 0.5, -1.5, len);
      c.lineTo(1.5, len); c.quadraticCurveTo(6, len * 0.5, 12, 0);
      c.closePath(); c.fill();
      // wobbling plasma filaments in tail (game-3: 3 lines)
      c.lineWidth = 1.2;
      for (let k = 0; k < 3; k++) {
        c.strokeStyle = k ? rgba('111,211,255', 0.6) : rgba('255,255,255', 0.6);
        c.beginPath(); c.moveTo(0, 0);
        for (let yy = 0; yy < len * 0.7; yy += 10) c.lineTo(Math.sin(yy * 0.12 + t * 60 + k * 2) * (3 + yy * 0.06), yy);
        c.stroke();
      }
      c.restore();
      // glow stack (game-3: 3 layers)
      glowE(c, 2, 34, 46, '56,138,255', 0.7 * pulse);
      glowE(c, 2, 20, 28, '111,211,255', pulse);
      glowE(c, 2, 10, 14, '255,255,255', pulse);
      // elongated core (game-3: scale(1,1.6) + white ellipse)
      c.save();
      c.translate(0, 2); c.scale(1, 1.6);
      c.shadowColor = '#6fd3ff';
      c.shadowBlur = 14 * pulse;
      c.fillStyle = '#ffffff';
      c.beginPath(); c.ellipse(0, 0, 7, 13, 0, 0, TAU); c.fill();
      c.restore();
      // electric arcs (game-3: 4 arcs, 4 segments each)
      c.save();
      c.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 4; i++) {
        const a = t * 40 + i * 1.5;
        c.strokeStyle = rgba('111,211,255', 0.7); c.lineWidth = 2.5;
        c.beginPath(); c.moveTo(0, 2);
        let px = 0, py = 2;
        for (let k = 0; k < 4; k++) { px += Math.cos(a) * 7 + Math.sin(a + k * 3) * 4; py += Math.sin(a) * 7 + Math.cos(a + k * 3) * 4; c.lineTo(px, py); }
        c.stroke();
        c.strokeStyle = '#ffffff'; c.lineWidth = 1;
        c.stroke();
      }
      c.restore();
      // spinning corona ring (game-3: 2 ellipses)
      c.save();
      c.globalCompositeOperation = 'lighter';
      c.strokeStyle = rgba('255,255,255', 0.8); c.lineWidth = 1.5;
      c.beginPath(); c.ellipse(0, 2, 20, 7, 0, 0, TAU); c.stroke();
      c.beginPath(); c.ellipse(0, 2 + 4, 14 + Math.sin(t * 40) * 3, 5, 0, 0, TAU); c.stroke();
      c.restore();
      break;
    }
    default:
      star(c, 0, len / 2, 6, '#fff');
  }
}
