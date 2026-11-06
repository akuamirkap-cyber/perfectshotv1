import type { WeaponId } from '../weapons';
import { TAU, lin, steel, rr, guard, glow, radial, star, gunState } from './kit';
import { drawModernGrip } from './gripSystem';
import { xenoHeadGun, doraCannonGun, predCasterGun } from './guns8';

type C = CanvasRenderingContext2D;

// ------------------------------------------------------------- 1. REVOLVER KELANA (Cowboy)
function loneStar(c: C, cx: number, y0: number, t: number, ready: boolean) {
  drawModernGrip(c, cx, y0 + 54, '#b06a30', 'wood'); // nyambung ke frame y0+82
  guard(c, cx, y0 + 70, '#111', 12);
  // Frame
  rr(c, cx - 11, y0 + 42, 22, 40, 3, lin(c, cx - 11, cx + 11, ['#0a0a0a', '#3a3a3a', '#0a0a0a']), '#000', 1.5);
  // Barrel
  rr(c, cx - 5, y0 + 4, 10, 42, 2, lin(c, cx - 5, cx + 5, ['#111', '#64748b', '#111']), '#000', 1.2);
  // Muzzle ring
  rr(c, cx - 6, y0 - 2, 12, 8, 2, '#78350f', '#000', 1);
  // Drum peluru (berputar)
  const drum = cx;
  c.save();
  c.translate(drum, y0 + 62);
  c.beginPath();
  c.arc(0, 0, 17, 0, TAU);
  c.fillStyle = radial(c, 0, 0, 17, ['#a8a29e', '#44403c', '#1c1917']);
  c.fill();
  c.strokeStyle = '#fbbf24';
  c.lineWidth = 2;
  c.stroke();
  c.restore();
  // 6 chamber holes
  const rot = ready ? Math.sin(t) * 0.02 : 0;
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * TAU + rot;
    c.beginPath();
    c.arc(cx + Math.cos(a) * 11, y0 + 62 + Math.sin(a) * 11, 3.2, 0, TAU);
    c.fillStyle = '#0c0a09';
    c.fill();
    c.strokeStyle = '#a8a29e';
    c.lineWidth = 0.8;
    c.stroke();
  }
  // Hammer
  c.beginPath();
  c.moveTo(cx + 4, y0 + 40);
  c.lineTo(cx + 12, y0 + 26);
  c.lineTo(cx + 16, y0 + 32);
  c.lineTo(cx + 8, y0 + 46);
  c.closePath();
  c.fillStyle = '#44403c';
  c.fill();
  c.strokeStyle = '#000';
  c.lineWidth = 1;
  c.stroke();
  // Ukiran emas "LONE STAR"
  c.fillStyle = '#fbbf24';
  c.beginPath();
  c.arc(cx - 6, y0 + 22, 3, 0, TAU);
  c.fill();
}

// ------------------------------------------------------------- 2. PHOTON SABER
function photonSaber(c: C, cx: number, y0: number, t: number) {
  const pulse = 0.75 + 0.25 * Math.sin(t * 12);
  const age = gunState.sinceShot;
  const swing = age >= 0 && age < 0.3 ? gunState.saberSide * 0.65 * Math.sin(Math.PI * age / 0.3) : 0;
  c.save();
  c.translate(cx, y0 + 215);
  c.rotate(swing);
  c.translate(-cx, -y0 - 215);
  // Handle
  rr(c, cx - 5, y0 + 190, 10, 50, 3, steel(c, cx - 5, cx + 5), '#000', 1);
  for (let i = 0; i < 5; i++) rr(c, cx - 5, y0 + 200 + i * 7, 10, 3, 1, '#1f2937');
  // Emitter
  rr(c, cx - 7, y0 + 180, 14, 14, 2, '#334155', '#000', 1.2);
  // Bilah energi (photon blade) — gradient cyan
  c.save();
  c.globalCompositeOperation = 'lighter';
  c.shadowColor = '#22d3ee';
  c.shadowBlur = 22 * pulse;
  const bg = c.createLinearGradient(0, y0, 0, y0 + 180);
  bg.addColorStop(0, '#ffffff');
  bg.addColorStop(0.35, '#e0f2fe');
  bg.addColorStop(0.7, '#22d3ee');
  bg.addColorStop(1, 'rgba(34,211,238,0.2)');
  c.fillStyle = bg;
  c.beginPath();
  c.roundRect(cx - 3.5, y0, 7, 185, 4);
  c.fill();
  // Core putih
  c.fillStyle = `rgba(255,255,255,${0.85 * pulse})`;
  c.beginPath();
  c.roundRect(cx - 1.2, y0 + 4, 2.4, 178, 2);
  c.fill();
  c.restore();
  glow(c, cx, y0 + 2, 4, '#ffffff', 16);
  c.restore();
}

// ------------------------------------------------------------- 3. PLASMA REPEATER
function plasmaRepeater(c: C, cx: number, y0: number) {
  drawModernGrip(c, cx, y0 + 84, '#f43f5e', 'g10'); // nyambung ke body y0+112
  guard(c, cx, y0 + 100, '#000', 13);
  // Body sci-fi
  rr(c, cx - 13, y0 + 72, 26, 40, 4, lin(c, cx - 13, cx + 13, ['#0f172a', '#475569', '#0f172a']), '#000', 1.5);
  // Cooling vents
  c.fillStyle = '#f43f5e';
  for (let i = 0; i < 4; i++) c.fillRect(cx - 9, y0 + 78 + i * 6, 18, 2);
  // Barrel dengan dua lubang
  rr(c, cx - 6, y0 + 4, 12, 70, 3, lin(c, cx - 6, cx + 6, ['#111', '#64748b', '#111']), '#000', 1);
  for (const s of [-1, 1]) {
    c.beginPath();
    c.arc(cx + s * 4, y0 + 4, 2, 0, TAU);
    c.fillStyle = '#000';
    c.fill();
    glow(c, cx + s * 4, y0 + 3, 1.8, '#f43f5e', 8);
  }
  // LED strip
  c.fillStyle = '#f43f5e';
  c.shadowColor = '#f43f5e';
  c.shadowBlur = 6;
  c.fillRect(cx - 4, y0 + 50, 8, 16);
  c.shadowBlur = 0;
  // Scope
  rr(c, cx - 20, y0 + 60, 9, 26, 3, '#1e293b', '#000', 1);
}

// ------------------------------------------------------------- 4. WARP DISRUPTOR
function warpDisruptor(c: C, cx: number, y0: number) {
  // Genggam belakang (nyambung ke badan y0+160)
  drawModernGrip(c, cx, y0 + 132, '#22c55e', 'g10');
  // Cakrawala superlaser
  c.beginPath();
  c.moveTo(cx - 40, y0 + 160);
  c.lineTo(cx + 40, y0 + 160);
  c.lineTo(cx + 26, y0 + 40);
  c.lineTo(cx - 26, y0 + 40);
  c.closePath();
  c.fillStyle = lin(c, cx - 40, cx + 40, ['#0a0f0a', '#2a3a2a', '#0a0f0a']);
  c.fill();
  c.strokeStyle = '#16a34a';
  c.lineWidth = 2;
  c.stroke();
  // Lensa hijau raksasa
  c.beginPath();
  c.arc(cx, y0 + 44, 20, 0, TAU);
  c.fillStyle = radial(c, cx, y0 + 44, 20, ['#dcfce7', '#22c55e', '#052e16']);
  c.shadowColor = '#22c55e';
  c.shadowBlur = 20;
  c.fill();
  c.shadowBlur = 0;
  c.strokeStyle = '#166534';
  c.lineWidth = 3;
  c.stroke();
  // Ring lensa
  c.strokeStyle = '#4ade80';
  c.lineWidth = 2;
  c.beginPath();
  c.arc(cx, y0 + 44, 26, 0, TAU);
  c.stroke();
  // Panel-panel detail
  c.fillStyle = '#22c55e';
  for (let i = 0; i < 5; i++) c.fillRect(cx - 30 + i * 15, y0 + 140, 8, 3);
  // Cahaya sinar hijau naik
  c.save();
  c.globalCompositeOperation = 'lighter';
  const g = c.createLinearGradient(0, y0 + 44, 0, y0 - 40);
  g.addColorStop(0, 'rgba(34,197,94,0.55)');
  g.addColorStop(1, 'rgba(34,197,94,0)');
  c.fillStyle = g;
  c.beginPath();
  c.moveTo(cx - 16, y0 + 44);
  c.lineTo(cx + 16, y0 + 44);
  c.lineTo(cx + 30, y0 - 40);
  c.lineTo(cx - 30, y0 - 40);
  c.closePath();
  c.fill();
  c.restore();
}

// ------------------------------------------------------------- 5. DEFLECTOR SHIELD
function deflectorShield(c: C, cx: number, y0: number, t: number) {
  drawModernGrip(c, cx, y0 + 80, '#818cf8', 'g10'); // nyambung ke body y0+108
  guard(c, cx, y0 + 96, '#000', 12);
  rr(c, cx - 14, y0 + 66, 28, 42, 5, lin(c, cx - 14, cx + 14, ['#0f172a', '#4338ca', '#0f172a']), '#000', 1.5);
  // Peluncur berbentuk sayap
  for (const s of [-1, 1]) {
    c.beginPath();
    c.moveTo(cx + s * 8, y0 + 70);
    c.lineTo(cx + s * 28, y0 + 44);
    c.lineTo(cx + s * 26, y0 + 36);
    c.lineTo(cx + s * 6, y0 + 60);
    c.closePath();
    c.fillStyle = '#4f46e5';
    c.fill();
    c.strokeStyle = '#0f172a';
    c.lineWidth = 1;
    c.stroke();
  }
  // Emitter inti
  const pulse = 0.7 + 0.3 * Math.sin(t * 8);
  c.beginPath();
  c.arc(cx, y0 + 20, 11, 0, TAU);
  c.fillStyle = radial(c, cx, y0 + 20, 11, ['#ffffff', '#818cf8', '#312e81']);
  c.shadowColor = '#818cf8';
  c.shadowBlur = 16 * pulse;
  c.fill();
  c.shadowBlur = 0;
  // Cincin perisai
  c.strokeStyle = `rgba(199,210,254,${0.5 + 0.4 * pulse})`;
  c.lineWidth = 2;
  c.beginPath();
  c.ellipse(cx, y0 + 20, 18, 7, 0, 0, TAU);
  c.stroke();
}

// ------------------------------------------------------------- 6. GAUNTLET CANNON
function gauntletCannon(c: C, cx: number, y0: number, t: number) {
  const pulse = 0.78 + 0.22 * Math.sin(t * 7);
  const kick = gunState.sinceShot >= 0 && gunState.sinceShot < 0.22
    ? Math.sin((1 - gunState.sinceShot / 0.22) * Math.PI * 0.5)
    : 0;
  const headShift = kick * 6.5;

  // ══════════════════ 1. PEGANGAN / DARK GUNMETAL FOREARM GRIP (WIDTH 38px: cx-19 .. cx+19) ══════════════════
  const gripW = 38;
  const gx0 = cx - gripW / 2; // cx - 19
  const gx1 = cx + gripW / 2; // cx + 19

  // Soft golden-yellow exhaust bloom beneath the bottom cap (using radial gradient so there is no hard circle)
  const botBloom = c.createRadialGradient(cx, y0 + 193, 1, cx, y0 + 195, 18);
  botBloom.addColorStop(0, `rgba(254,240,138,${0.65 * pulse})`);
  botBloom.addColorStop(0.5, `rgba(250,204,21,${0.25 * pulse})`);
  botBloom.addColorStop(1, 'rgba(250,204,21,0)');
  c.fillStyle = botBloom;
  c.beginPath();
  c.ellipse(cx, y0 + 195, 16, 8, 0, 0, TAU);
  c.fill();

  // Beveled dark-gunmetal bottom end-cap (y0+180 .. y0+195)
  c.beginPath();
  c.moveTo(gx0, y0 + 180);
  c.lineTo(gx1, y0 + 180);
  c.lineTo(cx + 13.5, y0 + 193.5);
  c.quadraticCurveTo(cx, y0 + 197, cx - 13.5, y0 + 193.5);
  c.closePath();
  c.fillStyle = lin(c, gx0, gx1, ['#090d16', '#1e293b', '#475569', '#1e293b', '#090d16']);
  c.fill();
  c.strokeStyle = 'rgba(9,13,22,0.68)';
  c.lineWidth = 0.82;
  c.stroke();

  // Glowing golden-yellow power core port at the bottom base of the grip
  c.beginPath();
  c.ellipse(cx, y0 + 193.2, 9.5, 3.2, 0, 0, TAU);
  c.fillStyle = radial(c, cx, y0 + 193.2, 10, ['#ffffff', '#fef08a', '#facc15', '#d97706']);
  c.shadowColor = '#facc15';
  c.shadowBlur = 12 * pulse;
  c.fill();
  c.shadowBlur = 0;
  c.strokeStyle = 'rgba(120,53,15,0.68)';
  c.lineWidth = 0.78;
  c.stroke();

  // Main cylindrical dark-slate / gunmetal forearm sleeve (y0+109 .. y0+182, width 38px)
  c.beginPath();
  c.roundRect(gx0, y0 + 109, gripW, 73, [4, 4, 8, 8]);
  c.fillStyle = lin(c, gx0, gx1, ['#0b101b', '#283548', '#64748b', '#475569', '#1e293b', '#090d16']);
  c.fill();
  c.strokeStyle = 'rgba(9,13,22,0.68)';
  c.lineWidth = 0.85;
  c.stroke();

  // Broad glossy vertical specular highlight along the left-front curve of the grip cylinder
  c.fillStyle = 'rgba(226,232,240,0.34)';
  c.beginPath();
  c.roundRect(cx - 13.8, y0 + 112, 5.2, 67, 2.5);
  c.fill();
  c.strokeStyle = 'rgba(248,250,252,0.68)';
  c.lineWidth = 1.1;
  c.beginPath();
  c.moveTo(cx - 14.2, y0 + 113);
  c.lineTo(cx - 14.2, y0 + 178);
  c.stroke();

  // Subtle dark bevel seam near the bottom of the grip cylinder
  c.strokeStyle = 'rgba(9,13,22,0.72)';
  c.lineWidth = 0.95;
  c.beginPath();
  c.moveTo(gx0 + 1.5, y0 + 179.5);
  c.lineTo(gx1 - 1.5, y0 + 179.5);
  c.stroke();

  // Segmented metallic Gold Collar Ring around the upper grip (y0+117 .. y0+130, width 40px)
  c.beginPath();
  c.roundRect(cx - 20, y0 + 117, 40, 13, 3);
  c.fillStyle = lin(c, cx - 20, cx + 20, ['#78350f', '#d97706', '#fde047', '#fef9c3', '#f59e0b', '#b45309', '#451a03']);
  c.fill();
  c.strokeStyle = 'rgba(69,26,3,0.68)';
  c.lineWidth = 0.82;
  c.stroke();

  // Recessed rectangular notches around the gold collar ring
  for (const nx of [-13.5, -6.8, 0, 6.8, 13.5]) {
    c.fillStyle = 'rgba(120,53,15,0.65)';
    c.strokeStyle = 'rgba(254,240,138,0.6)';
    c.lineWidth = 0.72;
    c.beginPath();
    c.roundRect(cx + nx - 1.8, y0 + 119.5, 3.6, 8, 1);
    c.fill();
    c.stroke();
  }
  // Top bright gold rim highlight on the collar
  c.strokeStyle = 'rgba(255,251,235,0.85)';
  c.lineWidth = 0.95;
  c.beginPath();
  c.moveTo(cx - 18, y0 + 118.5);
  c.lineTo(cx + 14, y0 + 118.5);
  c.stroke();

  // ══════════════════ 2. GAUNTLET HEAD & WRIST CUFFS (+20% LARGER THAN GRIP: 46px..50px WIDE!) ══════════════════
  c.save();
  c.translate(0, headShift);

  const redGrad = (x0: number, x1: number) =>
    lin(c, x0, x1, ['#3b0707', '#991b1b', '#ef4444', '#fca5a5', '#dc2626', '#991b1b', '#2a0404']);
  const darkRedGrad = (x0: number, x1: number) =>
    lin(c, x0, x1, ['#2a0404', '#7f1d1d', '#dc2626', '#f87171', '#b91c1c', '#651212', '#1f0303']);

  // Lower crimson beveled wrist ring (y0+96 .. y0+109, width 46px — 21% wider than 38px grip)
  c.beginPath();
  c.roundRect(cx - 23, y0 + 96, 46, 13, 5);
  c.fillStyle = darkRedGrad(cx - 23, cx + 23);
  c.fill();
  c.strokeStyle = 'rgba(42,4,4,0.68)';
  c.lineWidth = 0.85;
  c.stroke();
  // Specular highlight on lower crimson ring
  c.strokeStyle = 'rgba(254,202,202,0.75)';
  c.lineWidth = 1.15;
  c.beginPath();
  c.moveTo(cx - 19, y0 + 98.5);
  c.lineTo(cx - 6, y0 + 98.5);
  c.stroke();

  // Dark recessed joint groove between the two crimson wrist rings
  c.fillStyle = '#090b10';
  c.fillRect(cx - 20.5, y0 + 92.5, 41, 4.5);

  // Upper thick ribbed crimson armor cuff (y0+76 .. y0+94, width 49px — 29% wider than grip)
  c.beginPath();
  c.roundRect(cx - 24.5, y0 + 76, 49, 18, 6);
  c.fillStyle = redGrad(cx - 24.5, cx + 24.5);
  c.fill();
  c.strokeStyle = 'rgba(42,4,4,0.68)';
  c.lineWidth = 0.85;
  c.stroke();

  // Segmented vertical armor slots on the thick crimson cuff (matching reference image)
  for (const sx of [-15.5, -5.5, 5.5, 15.5]) {
    c.fillStyle = 'rgba(69,10,10,0.78)';
    c.strokeStyle = 'rgba(254,202,202,0.45)';
    c.lineWidth = 0.72;
    c.beginPath();
    c.roundRect(cx + sx - 2.1, y0 + 79, 4.2, 12, 1.3);
    c.fill();
    c.stroke();
  }
  // Top-left glossy highlight on upper crimson cuff
  c.strokeStyle = 'rgba(255,228,230,0.82)';
  c.lineWidth = 1.25;
  c.beginPath();
  c.moveTo(cx - 21, y0 + 78.2);
  c.lineTo(cx - 2, y0 + 78.2);
  c.stroke();

  // Dark recessed neck seam below main gauntlet housing
  c.fillStyle = '#090b10';
  c.fillRect(cx - 21.5, y0 + 72.5, 43, 4.5);

  // ── MAIN FACETED CRIMSON GAUNTLET HEAD (y0+8 .. y0+75, width 48px — 26% wider than 38px grip!) ──
  const gw = 24; // half-width = 24px -> 48px total width (38px * 1.26)
  c.beginPath();
  c.moveTo(cx - 16.5, y0 + 8);
  c.lineTo(cx + 16.5, y0 + 8);
  // Chamfered upper corners with armored knuckle shoulder step
  c.lineTo(cx + gw, y0 + 18);
  c.lineTo(cx + gw, y0 + 62);
  // Angled lower cheek bevel
  c.lineTo(cx + 19.5, y0 + 74.5);
  c.lineTo(cx - 19.5, y0 + 74.5);
  c.lineTo(cx - gw, y0 + 62);
  c.lineTo(cx - gw, y0 + 18);
  c.closePath();
  c.fillStyle = redGrad(cx - gw, cx + gw);
  c.fill();
  c.strokeStyle = 'rgba(42,4,4,0.68)';
  c.lineWidth = 0.9;
  c.stroke();

  // Subtle sculpted top knuckle-plates along the crown so it reads unmistakably as a heavy Gauntlet
  for (const kx of [-11.5, -3.8, 3.8, 11.5]) {
    c.fillStyle = 'rgba(127,29,29,0.75)';
    c.strokeStyle = 'rgba(254,202,202,0.5)';
    c.lineWidth = 0.72;
    c.beginPath();
    c.roundRect(cx + kx - 3.1, y0 + 9.2, 6.2, 4.2, 1.4);
    c.fill();
    c.stroke();
  }

  // Broad glossy vertical specular sheen along the left armor bevel of the gauntlet head
  const sheen = c.createLinearGradient(cx - 21, 0, cx - 8, 0);
  sheen.addColorStop(0, 'rgba(255,255,255,0.08)');
  sheen.addColorStop(0.45, 'rgba(255,228,230,0.46)');
  sheen.addColorStop(1, 'rgba(255,255,255,0)');
  c.fillStyle = sheen;
  c.beginPath();
  c.moveTo(cx - 21.5, y0 + 19);
  c.lineTo(cx - 10, y0 + 13);
  c.lineTo(cx - 10, y0 + 72);
  c.lineTo(cx - 18.5, y0 + 72);
  c.lineTo(cx - 21.5, y0 + 61);
  c.closePath();
  c.fill();

  // Inner 3D chamfered armor panel lines on the gauntlet face
  c.strokeStyle = 'rgba(254,202,202,0.62)';
  c.lineWidth = 1.1;
  c.beginPath();
  c.moveTo(cx - 20.5, y0 + 60);
  c.lineTo(cx - 20.5, y0 + 20);
  c.lineTo(cx - 14.5, y0 + 12.5);
  c.lineTo(cx + 14.5, y0 + 12.5);
  c.stroke();

  c.strokeStyle = 'rgba(69,10,10,0.72)';
  c.lineWidth = 1.1;
  c.beginPath();
  c.moveTo(cx + 20.5, y0 + 20);
  c.lineTo(cx + 20.5, y0 + 60);
  c.lineTo(cx + 16.5, y0 + 70.5);
  c.lineTo(cx - 16.5, y0 + 70.5);
  c.stroke();

  // Two recessed angled rectangular/trapezoidal cheek vents on lower-left & lower-right (as in reference image)
  for (const dir of [-1, 1] as const) {
    c.beginPath();
    c.moveTo(cx + dir * 12, y0 + 53);
    c.lineTo(cx + dir * 18.5, y0 + 55);
    c.lineTo(cx + dir * 18.5, y0 + 66.5);
    c.lineTo(cx + dir * 12, y0 + 65);
    c.closePath();
    c.fillStyle = '#5c0f0f';
    c.fill();
    c.strokeStyle = 'rgba(254,202,202,0.55)';
    c.lineWidth = 0.85;
    c.stroke();
  }

  // ══════════════════ 3. GIANT GOLD-RIMMED SOLAR REPULSOR CORE IN GAUNTLET PALM ══════════════════
  const coreY = y0 + 36;
  const outerR = 17.5;

  // Soft radial golden-crimson bloom behind the repulsor core (fades smoothly to 0)
  const coreBloom = c.createRadialGradient(cx, coreY, outerR * 0.6, cx, coreY, outerR + 9);
  coreBloom.addColorStop(0, `rgba(251,191,36,${0.45 * pulse})`);
  coreBloom.addColorStop(0.6, `rgba(239,68,68,${0.22 * pulse})`);
  coreBloom.addColorStop(1, 'rgba(239,68,68,0)');
  c.fillStyle = coreBloom;
  c.beginPath();
  c.arc(cx, coreY, outerR + 9, 0, TAU);
  c.fill();

  // Outer metallic Gold Bezel Ring (r = 17.5)
  c.beginPath();
  c.arc(cx, coreY, outerR, 0, TAU);
  c.fillStyle = lin(c, cx - outerR, cx + outerR, ['#78350f', '#f59e0b', '#fef08a', '#facc15', '#d97706', '#78350f']);
  c.fill();
  c.strokeStyle = 'rgba(69,26,3,0.72)';
  c.lineWidth = 0.85;
  c.stroke();

  // Recessed crimson-orange inner ring inside the gold bezel (r = 13.8)
  c.beginPath();
  c.arc(cx, coreY, 13.8, 0, TAU);
  c.fillStyle = radial(c, cx, coreY, 13.8, ['#fb923c', '#ea580c', '#991b1b', '#450a0a']);
  c.fill();
  c.strokeStyle = 'rgba(120,53,15,0.72)';
  c.lineWidth = 0.8;
  c.stroke();

  // Blazing white-hot to solar-gold & orange repulsor orb (r = 10.6)
  c.beginPath();
  c.arc(cx, coreY, 10.6, 0, TAU);
  c.fillStyle = radial(c, cx - 1.5, coreY - 1.5, 11, ['#ffffff', '#ffffff', '#fef08a', '#facc15', '#f97316', '#dc2626']);
  c.shadowColor = '#facc15';
  c.shadowBlur = (20 + kick * 14) * pulse;
  c.fill();
  c.shadowBlur = 0;

  // Pure white-hot core highlight + 4-point starburst lens flare on the upper-right of the gold bezel (matching image-1.png!)
  glow(c, cx - 2, coreY - 2, 4.5, '#ffffff', 14);
  star(c, cx + 11, coreY - 12.5, 5.5 + pulse * 1.5, '#ffffff', 4);
  star(c, cx + 11, coreY - 12.5, 3.2, '#fef08a', 4);

  // Recoil shock-ring when firing
  if (kick > 0.05) {
    c.strokeStyle = `rgba(254,240,138,${0.85 * kick})`;
    c.lineWidth = 2.4;
    c.beginPath();
    c.ellipse(cx, y0 + 10, 24 + (1 - kick) * 14, 7 + (1 - kick) * 4, 0, 0, TAU);
    c.stroke();
  }

  c.restore();
}

// ------------------------------------------------------------- 8. PULSE RIFLE
function pulseRifle(c: C, cx: number, y0: number) {
  drawModernGrip(c, cx, y0 + 92, '#38bdf8', 'g10'); // nyambung ke receiver y0+120
  guard(c, cx, y0 + 108, '#000', 12);
  // Receiver
  rr(c, cx - 13, y0 + 78, 26, 42, 4, lin(c, cx - 13, cx + 13, ['#020617', '#334155', '#020617']), '#000', 1.5);
  // Scope kotak sci-fi
  rr(c, cx - 22, y0 + 60, 10, 30, 2, '#0f172a', '#000', 1);
  c.fillStyle = '#38bdf8';
  c.fillRect(cx - 20, y0 + 66, 6, 3);
  // Barrel panjang dengan coil
  rr(c, cx - 5, y0 + 6, 10, 76, 2, lin(c, cx - 5, cx + 5, ['#111', '#64748b', '#111']), '#000', 1.2);
  c.strokeStyle = '#38bdf8';
  c.lineWidth = 2;
  for (let i = 0; i < 6; i++) {
    c.beginPath();
    c.moveTo(cx - 8, y0 + 16 + i * 11);
    c.lineTo(cx + 8, y0 + 22 + i * 11);
    c.stroke();
  }
  // Muzzle
  rr(c, cx - 7, y0 - 2, 14, 10, 3, '#0f172a', '#000', 1);
  glow(c, cx, y0 - 1, 3, '#38bdf8', 12);
  // LED
  c.fillStyle = '#38bdf8';
  c.shadowColor = '#38bdf8';
  c.shadowBlur = 8;
  c.fillRect(cx - 8, y0 + 44, 16, 4);
  c.shadowBlur = 0;
}

// ------------------------------------------------------------- 9. CRYO BLASTER
function cryoBlaster(c: C, cx: number, y0: number, t: number) {
  const pulse = 0.68 + 0.32 * Math.sin(t * 5.6);
  const shotAge = gunState.sinceShot >= 0 && gunState.sinceShot < 0.34 ? gunState.sinceShot / 0.34 : -1;
  const recoil = shotAge >= 0 ? Math.sin(shotAge * Math.PI) * 5.0 : 0;
  const nozzleKick = shotAge >= 0 ? Math.sin(shotAge * Math.PI) * 2.6 : 0;
  const trigPull = shotAge >= 0 ? Math.sin(shotAge * Math.PI) * 2.2 : 0;

  c.save();
  c.translate(0, recoil);

  const silverPipeStroke = (drawPath: () => void) => {
    c.lineCap = 'round';
    c.lineJoin = 'round';
    drawPath();
    c.strokeStyle = 'rgba(15,23,42,0.92)';
    c.lineWidth = 7.4;
    c.stroke();
    drawPath();
    c.strokeStyle = '#64748b';
    c.lineWidth = 5.6;
    c.stroke();
    drawPath();
    c.strokeStyle = '#cbd5e1';
    c.lineWidth = 3.6;
    c.stroke();
    drawPath();
    c.strokeStyle = '#f8fafc';
    c.lineWidth = 1.5;
    c.stroke();
  };

  // ══════════════════ 1. DORSAL (-X) BENT SILVER COOLANT PIPES & MOUNTING BRACKET (matching image 1!) ══════════════════
  // Central dark slate mounting block between dorsal cyan tank and white receiver (`cx - 16 .. cx - 10, y0 + 64 .. y0 + 84`)
  c.beginPath();
  c.roundRect(cx - 16, y0 + 64, 6.5, 20, 1.5);
  c.fillStyle = lin(c, cx - 16, cx - 9.5, ['#0f172a', '#334155', '#1e293b']);
  c.fill();
  c.strokeStyle = 'rgba(15,23,42,0.9)';
  c.lineWidth = 0.82;
  c.stroke();

  // Rear bent silver coolant pipe (`cx - 11, y0 + 111` -> `cx - 25.5, y0 + 111` -> `cx - 25.5, y0 + 98`)
  silverPipeStroke(() => {
    c.beginPath();
    c.moveTo(cx - 10.5, y0 + 111);
    c.lineTo(cx - 22.5, y0 + 111);
    c.quadraticCurveTo(cx - 25.5, y0 + 111, cx - 25.5, y0 + 107.5);
    c.lineTo(cx - 25.5, y0 + 98);
  });

  // Cyan sealing ring at rear pipe -> white receiver joint (`cx - 14.5 .. cx - 10, y0 + 107 .. y0 + 115`)
  c.beginPath();
  c.roundRect(cx - 14.5, y0 + 107, 4.2, 8, 1.4);
  c.fillStyle = lin(c, cx - 14.5, cx - 10.3, ['#0369a1', '#38bdf8', '#a5f3fc', '#0284c7']);
  c.fill();
  c.strokeStyle = 'rgba(15,23,42,0.88)';
  c.lineWidth = 0.78;
  c.stroke();

  // Front bent silver coolant pipe (`cx - 25.5, y0 + 46` -> `cx - 25.5, y0 + 36` -> `cx - 12, y0 + 36` -> `cx - 12, y0 + 44`)
  silverPipeStroke(() => {
    c.beginPath();
    c.moveTo(cx - 25.5, y0 + 46);
    c.lineTo(cx - 25.5, y0 + 39);
    c.quadraticCurveTo(cx - 25.5, y0 + 35.5, cx - 22, y0 + 35.5);
    c.lineTo(cx - 15.5, y0 + 35.5);
    c.quadraticCurveTo(cx - 12, y0 + 35.5, cx - 12, y0 + 39);
    c.lineTo(cx - 12, y0 + 44);
  });

  // Cyan sealing ring where front pipe enters the cobalt-blue nozzle collar (`cx - 16 .. cx - 8, y0 + 39.5 .. y0 + 44`)
  c.beginPath();
  c.roundRect(cx - 16, y0 + 39.5, 8, 4.2, 1.4);
  c.fillStyle = lin(c, cx - 16, cx - 8, ['#0369a1', '#38bdf8', '#a5f3fc', '#0284c7']);
  c.fill();
  c.strokeStyle = 'rgba(15,23,42,0.88)';
  c.lineWidth = 0.78;
  c.stroke();

  // Rear & front silver-grey metallic tank end-collars + cyan sealing bands (`cx - 31.5 .. cx - 19.5`)
  // Rear tank collar (`y0 + 96 .. y0 + 101.5`)
  c.beginPath();
  c.roundRect(cx - 31.5, y0 + 96, 12, 5.5, 2);
  c.fillStyle = lin(c, cx - 31.5, cx - 19.5, ['#475569', '#cbd5e1', '#f8fafc', '#64748b']);
  c.fill();
  c.strokeStyle = 'rgba(15,23,42,0.9)';
  c.lineWidth = 0.82;
  c.stroke();
  c.beginPath();
  c.roundRect(cx - 29.5, y0 + 100.8, 8, 3.2, 1);
  c.fillStyle = lin(c, cx - 29.5, cx - 21.5, ['#0284c7', '#38bdf8', '#a5f3fc', '#0369a1']);
  c.fill();
  c.strokeStyle = 'rgba(15,23,42,0.85)';
  c.lineWidth = 0.72;
  c.stroke();

  // Front tank collar (`y0 + 42.5 .. y0 + 48`)
  c.beginPath();
  c.roundRect(cx - 31.5, y0 + 42.5, 12, 5.5, 2);
  c.fillStyle = lin(c, cx - 31.5, cx - 19.5, ['#475569', '#cbd5e1', '#f8fafc', '#64748b']);
  c.fill();
  c.strokeStyle = 'rgba(15,23,42,0.9)';
  c.lineWidth = 0.82;
  c.stroke();
  c.beginPath();
  c.roundRect(cx - 29.5, y0 + 40, 8, 3.2, 1);
  c.fillStyle = lin(c, cx - 29.5, cx - 21.5, ['#0284c7', '#38bdf8', '#a5f3fc', '#0369a1']);
  c.fill();
  c.strokeStyle = 'rgba(15,23,42,0.85)';
  c.lineWidth = 0.72;
  c.stroke();

  // ══════════════════ 2. PLUMP PRESSURIZED CYAN CRYO CAPSULE TANK (`cx - 37 .. cx - 14, y0 + 45.5 .. y0 + 98.5`, matching image 1!) ══════════════════
  c.save();
  c.beginPath();
  c.roundRect(cx - 37, y0 + 45.5, 23, 53, 11.5);
  const tankGrad = c.createLinearGradient(cx - 37, 0, cx - 14, 0);
  tankGrad.addColorStop(0, '#0284c7');
  tankGrad.addColorStop(0.18, '#22d3ee');
  tankGrad.addColorStop(0.38, '#a5f3fc');
  tankGrad.addColorStop(0.62, '#38bdf8');
  tankGrad.addColorStop(0.84, '#0284c7');
  tankGrad.addColorStop(1, '#075985');
  c.fillStyle = tankGrad;
  c.fill();
  c.clip();

  // Subtle internal animated cryogenic liquid wave & rising frost bubbles inside the capsule
  const waveY = y0 + 54 + Math.sin(t * 3.8) * 1.8;
  c.fillStyle = 'rgba(14,165,233,0.28)';
  c.fillRect(cx - 37, waveY, 23, 46);
  for (let i = 0; i < 6; i++) {
    const by = y0 + 94 - ((t * 22 + i * 8.5) % 44);
    const bx = cx - 31 + (i % 3) * 4.5 + Math.sin(t * 4.5 + i * 1.7) * 1.3;
    const br = 1.2 + (i % 2) * 0.7;
    c.beginPath();
    c.arc(bx, by, br, 0, TAU);
    c.fillStyle = `rgba(240,253,255,${0.55 + 0.3 * Math.sin(t * 5 + i)})`;
    c.fill();
  }

  // Glossy white-cyan specular capsule highlight along the upper-left (`-x`) curve
  c.beginPath();
  c.roundRect(cx - 34.2, y0 + 51, 5.2, 41, 2.6);
  c.fillStyle = 'rgba(255,255,255,0.68)';
  c.fill();
  c.beginPath();
  c.roundRect(cx - 33.2, y0 + 54, 2.4, 26, 1.2);
  c.fillStyle = 'rgba(255,255,255,0.88)';
  c.fill();
  c.restore();

  // Crisp outer outline of the cyan cryo tank
  c.beginPath();
  c.roundRect(cx - 37, y0 + 45.5, 23, 53, 11.5);
  c.strokeStyle = 'rgba(15,23,42,0.92)';
  c.lineWidth = 0.92;
  c.stroke();

  // ══════════════════ 3. VENTRAL (+X) UNDER-BARREL SILVER COOLANT PIPE LOOP (`cx + 10 .. cx + 23, y0 + 49 .. y0 + 78`, matching image 1!) ══════════════════
  silverPipeStroke(() => {
    c.beginPath();
    c.moveTo(cx + 10, y0 + 75);
    c.lineTo(cx + 18.5, y0 + 75);
    c.quadraticCurveTo(cx + 22, y0 + 75, cx + 22, y0 + 71.5);
    c.lineTo(cx + 22, y0 + 54.5);
    c.quadraticCurveTo(cx + 22, y0 + 51, cx + 18.5, y0 + 51);
    c.lineTo(cx + 11, y0 + 51);
  });

  // Cyan/cobalt collar rings on both ends of the ventral pipe loop
  c.beginPath();
  c.roundRect(cx + 10.5, y0 + 71, 4.2, 8, 1.3);
  c.fillStyle = lin(c, cx + 10.5, cx + 14.7, ['#0369a1', '#38bdf8', '#a5f3fc', '#0284c7']);
  c.fill();
  c.strokeStyle = 'rgba(15,23,42,0.88)';
  c.lineWidth = 0.76;
  c.stroke();

  c.beginPath();
  c.roundRect(cx + 11, y0 + 47, 4.2, 8, 1.3);
  c.fillStyle = lin(c, cx + 11, cx + 15.2, ['#0369a1', '#38bdf8', '#a5f3fc', '#0284c7']);
  c.fill();
  c.strokeStyle = 'rgba(15,23,42,0.88)';
  c.lineWidth = 0.76;
  c.stroke();

  // ══════════════════ 4. BLACK D-SHAPED TRIGGER GUARD & CURVED CYAN TRIGGER (`cx + 8 .. cx + 22, y0 + 80 .. y0 + 112`, matching image 1!) ══════════════════
  // Curved bright-cyan trigger blade inside the guard
  c.beginPath();
  c.moveTo(cx + 9.5, y0 + 88 + trigPull);
  c.quadraticCurveTo(cx + 16.5, y0 + 91 + trigPull, cx + 15.5, y0 + 99 + trigPull);
  c.lineTo(cx + 11.8, y0 + 98 + trigPull);
  c.quadraticCurveTo(cx + 12.5, y0 + 93 + trigPull, cx + 8.5, y0 + 91 + trigPull);
  c.closePath();
  c.fillStyle = lin(c, cx + 8.5, cx + 16.5, ['#0284c7', '#38bdf8', '#bae6fd']);
  c.fill();
  c.strokeStyle = 'rgba(15,23,42,0.88)';
  c.lineWidth = 0.78;
  c.stroke();

  // Black ergonomic D-shaped trigger guard loop
  c.beginPath();
  c.moveTo(cx + 9.5, y0 + 80);
  c.lineTo(cx + 14.5, y0 + 80);
  c.bezierCurveTo(cx + 22.5, y0 + 84, cx + 22.5, y0 + 103, cx + 15, y0 + 110);
  c.lineTo(cx + 10.5, y0 + 108);
  c.bezierCurveTo(cx + 17.5, y0 + 102, cx + 17.5, y0 + 86, cx + 9.5, y0 + 84);
  c.closePath();
  c.fillStyle = lin(c, cx + 9.5, cx + 22, ['#0f172a', '#334155', '#1e293b', '#090d16']);
  c.fill();
  c.strokeStyle = 'rgba(15,23,42,0.92)';
  c.lineWidth = 0.86;
  c.stroke();

  // ══════════════════ 5. CERAMIC-WHITE & COBALT-BLUE RECEIVER + INTEGRATED ANGLED BUTTSTOCK/GRIP (matching image 1!) ══════════════════
  // Main white ceramic receiver body seamlessly transitioning into the angled rear stock (`y0 + 53 .. y0 + 142`)
  c.beginPath();
  c.moveTo(cx - 11.5, y0 + 54);
  c.lineTo(cx + 11.5, y0 + 54);
  c.lineTo(cx + 11.5, y0 + 102);
  // Outer white grip contour extending down-right (`+x, +y`)
  c.lineTo(cx + 19.5, y0 + 112);
  c.lineTo(cx + 17.5, y0 + 132);
  c.lineTo(cx + 11.5, y0 + 141);
  // Angled buttstock base
  c.lineTo(cx - 7.5, y0 + 141);
  c.lineTo(cx - 11.5, y0 + 132);
  c.closePath();
  const whiteBodyGrad = c.createLinearGradient(cx - 12, 0, cx + 20, 0);
  whiteBodyGrad.addColorStop(0, '#cbd5e1');
  whiteBodyGrad.addColorStop(0.28, '#f8fafc');
  whiteBodyGrad.addColorStop(0.58, '#ffffff');
  whiteBodyGrad.addColorStop(0.84, '#e2e8f0');
  whiteBodyGrad.addColorStop(1, '#94a3b8');
  c.fillStyle = whiteBodyGrad;
  c.fill();
  c.strokeStyle = 'rgba(15,23,42,0.92)';
  c.lineWidth = 0.92;
  c.stroke();

  // Cobalt-blue rear stock upper armor section (`cx - 11.5 .. cx + 7.5, y0 + 113 .. y0 + 140`, matching image 1!)
  c.beginPath();
  c.moveTo(cx - 11.5, y0 + 114);
  c.lineTo(cx + 2.5, y0 + 114);
  c.lineTo(cx + 7.5, y0 + 123);
  c.lineTo(cx + 1.5, y0 + 140);
  c.lineTo(cx - 7.5, y0 + 140);
  c.lineTo(cx - 11.5, y0 + 132);
  c.closePath();
  c.fillStyle = lin(c, cx - 11.5, cx + 7.5, ['#1e3a8a', '#2563eb', '#3b82f6', '#60a5fa', '#1d4ed8']);
  c.fill();
  c.strokeStyle = 'rgba(15,23,42,0.9)';
  c.lineWidth = 0.86;
  c.stroke();

  // Diagonal seam line & small glowing pink-orange indicator dot on the cobalt-blue stock section (matching image 1!)
  c.strokeStyle = 'rgba(15,23,42,0.75)';
  c.lineWidth = 0.78;
  c.beginPath();
  c.moveTo(cx - 11, y0 + 124);
  c.lineTo(cx + 5.5, y0 + 124);
  c.stroke();
  c.beginPath();
  c.arc(cx - 3.5, y0 + 118, 1.5, 0, TAU);
  c.fillStyle = '#fb7185';
  c.fill();
  c.strokeStyle = '#0f172a';
  c.lineWidth = 0.55;
  c.stroke();

  // Contoured black ergonomic inner front grip pad right behind the trigger guard (`cx + 4.5 .. cx + 13, y0 + 82 .. y0 + 132`, matching image 1!)
  c.beginPath();
  c.moveTo(cx + 8.5, y0 + 81);
  c.lineTo(cx + 11.8, y0 + 81);
  c.lineTo(cx + 11.8, y0 + 109);
  c.lineTo(cx + 13.2, y0 + 130);
  c.lineTo(cx + 8.2, y0 + 131);
  c.lineTo(cx + 5.5, y0 + 109);
  c.closePath();
  c.fillStyle = lin(c, cx + 5.5, cx + 13.2, ['#090d16', '#1e293b', '#334155', '#0f172a']);
  c.fill();
  c.strokeStyle = 'rgba(15,23,42,0.9)';
  c.lineWidth = 0.82;
  c.stroke();

  // Thick black ribbed buttpad at the bottom-rear of the stock (`cx - 8 .. cx + 12, y0 + 136.5 .. y0 + 144.5`)
  c.beginPath();
  c.roundRect(cx - 8, y0 + 136.5, 20, 7.5, 2.5);
  c.fillStyle = lin(c, cx - 8, cx + 12, ['#090d16', '#1e293b', '#334155', '#0f172a']);
  c.fill();
  c.strokeStyle = 'rgba(15,23,42,0.92)';
  c.lineWidth = 0.88;
  c.stroke();

  // Two sleek cobalt-blue recessed accent bars along the upper-left (`-x`) side of the white receiver (`y0 + 60 .. y0 + 96`, matching image 1!)
  // Upper/front angled cobalt accent bar (`y0 + 60 .. y0 + 74`)
  c.beginPath();
  c.moveTo(cx - 2.2, y0 + 60);
  c.lineTo(cx - 2.2, y0 + 73.5);
  c.lineTo(cx - 7.4, y0 + 75);
  c.lineTo(cx - 7.4, y0 + 64.5);
  c.closePath();
  c.fillStyle = lin(c, cx - 7.4, cx - 2.2, ['#1e40af', '#3b82f6', '#60a5fa']);
  c.fill();
  c.strokeStyle = 'rgba(15,23,42,0.85)';
  c.lineWidth = 0.72;
  c.stroke();

  // Lower/rear rounded cobalt accent bar (`y0 + 76.5 .. y0 + 96`)
  c.beginPath();
  c.roundRect(cx - 7.4, y0 + 76.5, 5.2, 19.5, 2.0);
  c.fillStyle = lin(c, cx - 7.4, cx - 2.2, ['#1e40af', '#3b82f6', '#60a5fa']);
  c.fill();
  c.strokeStyle = 'rgba(15,23,42,0.85)';
  c.lineWidth = 0.72;
  c.stroke();

  // Crisp dark side slit on the front-right of the white receiver (`cx + 6.8, y0 + 61 .. y0 + 71`)
  c.strokeStyle = '#1e293b';
  c.lineWidth = 1.3;
  c.beginPath();
  c.moveTo(cx + 6.8, y0 + 61);
  c.lineTo(cx + 6.8, y0 + 71);
  c.stroke();

  // ══════════════════ 6. COBALT-BLUE COLLAR, TAPERED PERIWINKLE CONICAL NOZZLE & GLOWING CRYO MUZZLE (matching image 1!) ══════════════════
  c.save();
  c.translate(0, nozzleKick);

  // Cobalt-blue cylindrical barrel collar (`cx - 15 .. cx + 15, y0 + 42 .. y0 + 56`)
  c.beginPath();
  c.roundRect(cx - 15, y0 + 42, 30, 14, 3.5);
  const collarGrad = c.createLinearGradient(cx - 15, 0, cx + 15, 0);
  collarGrad.addColorStop(0, '#172554');
  collarGrad.addColorStop(0.24, '#2563eb');
  collarGrad.addColorStop(0.5, '#60a5fa');
  collarGrad.addColorStop(0.78, '#1d4ed8');
  collarGrad.addColorStop(1, '#0f172a');
  c.fillStyle = collarGrad;
  c.fill();
  c.strokeStyle = 'rgba(15,23,42,0.92)';
  c.lineWidth = 0.92;
  c.stroke();

  // Tapered periwinkle / ice-blue conical muzzle nozzle (`y0 + 10 .. y0 + 44`, matching image 1!)
  c.beginPath();
  c.moveTo(cx - 13.8, y0 + 43.5);
  c.lineTo(cx + 13.8, y0 + 43.5);
  c.lineTo(cx + 5.8, y0 + 10.5);
  c.lineTo(cx - 5.8, y0 + 10.5);
  c.closePath();
  const coneGrad = c.createLinearGradient(cx - 14, 0, cx + 14, 0);
  coneGrad.addColorStop(0, '#1e3a8a');
  coneGrad.addColorStop(0.22, '#3b82f6');
  coneGrad.addColorStop(0.45, '#bfdbfe');
  coneGrad.addColorStop(0.6, '#eff6ff');
  coneGrad.addColorStop(0.8, '#60a5fa');
  coneGrad.addColorStop(1, '#172554');
  c.fillStyle = coneGrad;
  c.fill();
  c.strokeStyle = 'rgba(15,23,42,0.92)';
  c.lineWidth = 0.92;
  c.stroke();

  // Glossy longitudinal highlight streak along the conical nozzle
  c.beginPath();
  c.moveTo(cx - 5.2, y0 + 42);
  c.lineTo(cx - 1.5, y0 + 42);
  c.lineTo(cx - 0.6, y0 + 12);
  c.lineTo(cx - 2.4, y0 + 12);
  c.closePath();
  c.fillStyle = 'rgba(255,255,255,0.52)';
  c.fill();

  // Polished silver emitter collar at the nozzle tip (`cx - 4.8 .. cx + 4.8, y0 + 6.8 .. y0 + 11`)
  c.beginPath();
  c.roundRect(cx - 4.8, y0 + 6.8, 9.6, 4.2, 1.5);
  c.fillStyle = lin(c, cx - 4.8, cx + 4.8, ['#475569', '#cbd5e1', '#ffffff', '#94a3b8', '#334155']);
  c.fill();
  c.strokeStyle = 'rgba(15,23,42,0.9)';
  c.lineWidth = 0.82;
  c.stroke();

  // Soft glowing cyan-white cryo energy orb at the muzzle tip (`cx, y0 + 3.8`, matching image 1!)
  const orbR = 3.4 + (shotAge >= 0 ? Math.sin(shotAge * Math.PI) * 1.6 : 0.35 * Math.sin(t * 7));
  c.beginPath();
  c.arc(cx, y0 + 3.8, orbR * 1.65, 0, TAU);
  c.fillStyle = `rgba(103,232,249,${0.28 * pulse})`;
  c.fill();
  c.beginPath();
  c.arc(cx, y0 + 3.8, orbR, 0, TAU);
  c.fillStyle = radial(c, cx - 0.8, y0 + 3.2, orbR, ['#ffffff', '#cffafe', '#67e8f9', '#22d3ee']);
  c.fill();

  // Soft glowing translucent cryo frost bubbles / motes drifting above the muzzle tip (matching image 1!)
  const frostMotes = [
    { dx: -6.5, dy: -2.5, r: 2.3, ph: 0.0 },
    { dx: 4.8, dy: -4.8, r: 1.7, ph: 0.38 },
    { dx: -1.5, dy: -8.2, r: 1.3, ph: 0.72 },
  ];
  for (const m of frostMotes) {
    const bob = Math.sin(t * 4.2 + m.ph * 6) * 1.2;
    const bx = cx + m.dx + bob * 0.5;
    const by = y0 + m.dy + bob;
    c.beginPath();
    c.arc(bx, by, m.r * 1.4, 0, TAU);
    c.fillStyle = `rgba(165,243,252,${0.22 * pulse})`;
    c.fill();
    c.beginPath();
    c.arc(bx, by, m.r, 0, TAU);
    c.fillStyle = `rgba(224,242,254,${0.55 * pulse})`;
    c.fill();
  }
  c.restore();

  c.restore();
}

// ------------------------------------------------------------- 10. HYPERDRIVE CANNON
function hyperdrive(c: C, cx: number, y0: number, t: number) {
  const pulse = 0.72 + 0.28 * Math.sin(t * 8.5);
  const shotAge = gunState.sinceShot >= 0 && gunState.sinceShot < 0.34 ? gunState.sinceShot / 0.34 : -1;
  const recoil = shotAge >= 0 ? Math.sin(shotAge * Math.PI) * 5.8 : 0;
  const barrelKick = shotAge >= 0 ? Math.sin(shotAge * Math.PI) * 3.2 : 0;
  const trigPull = shotAge >= 0 ? Math.sin(shotAge * Math.PI) * 2.4 : 0;

  c.save();
  c.translate(0, recoil);

  // High-contrast vibrant royal/cobalt/sky-blue gradient helper so the body & wings POP against the dark card
  const blueArmorGrad = (x0: number, x1: number) =>
    lin(c, x0, x1, ['#1e3a8a', '#2563eb', '#3b82f6', '#60a5fa', '#2563eb', '#172554']);

  // High-contrast titanium-gunmetal gradient with bright silver specular reflection (never muddy/dark!)
  const gunmetalBrightGrad = (x0: number, x1: number) =>
    lin(c, x0, x1, ['#0f172a', '#334155', '#94a3b8', '#e2e8f0', '#64748b', '#1e293b']);

  // ══════════════════ 1. HIGH-CONTRAST TWO-TONE ERGONOMIC PISTOL GRIP (`cx + 4 .. cx + 50, y0 + 112 .. y0 + 150`, matching image 2!) ══════════════════
  // Contoured muscular tactical pistol grip extending out to `+x` with rearward (`+y`) rake
  c.beginPath();
  // Front strap starting behind the trigger guard (`cx + 12, y0 + 112`)
  c.moveTo(cx + 12, y0 + 112);
  c.lineTo(cx + 21, y0 + 115);
  // 3 sculpted finger grooves along the front strap (`-y` side facing muzzle)
  c.quadraticCurveTo(cx + 24, y0 + 120, cx + 30, y0 + 118.5);
  c.quadraticCurveTo(cx + 34, y0 + 123.5, cx + 40, y0 + 122.5);
  c.quadraticCurveTo(cx + 44, y0 + 127, cx + 49.5, y0 + 127.5);
  // Flared tactical magwell baseplate (`cx + 49.5, y0 + 127.5` -> `cx + 43, y0 + 148.5`)
  c.lineTo(cx + 50.5, y0 + 131);
  c.lineTo(cx + 44, y0 + 148.5);
  c.lineTo(cx + 38, y0 + 147);
  // Smooth curved backstrap (`+y` rear side) up to the sculpted beavertail (`cx + 4, y0 + 134`)
  c.bezierCurveTo(cx + 31, y0 + 138, cx + 19, y0 + 132, cx + 8.5, y0 + 134.5);
  c.quadraticCurveTo(cx + 4, y0 + 135, cx + 4.5, y0 + 130);
  c.lineTo(cx + 6.5, y0 + 114);
  c.closePath();
  c.fillStyle = lin(c, cx + 5, cx + 50, ['#1e293b', '#334155', '#64748b', '#475569', '#1e293b']);
  c.fill();
  c.strokeStyle = 'rgba(15,23,42,0.92)';
  c.lineWidth = 0.92;
  c.stroke();

  // Bright steel-blue metallic backstrap spine insert (`cx + 9 .. cx + 42, y0 + 125 .. y0 + 144`, high contrast!)
  c.beginPath();
  c.moveTo(cx + 9.5, y0 + 126);
  c.bezierCurveTo(cx + 20, y0 + 126, cx + 32, y0 + 133, cx + 41.5, y0 + 142.5);
  c.lineTo(cx + 38, y0 + 145.5);
  c.bezierCurveTo(cx + 29, y0 + 136, cx + 18, y0 + 130, cx + 8, y0 + 131);
  c.closePath();
  c.fillStyle = lin(c, cx + 8, cx + 41.5, ['#64748b', '#cbd5e1', '#f1f5f9', '#94a3b8']);
  c.fill();
  c.strokeStyle = 'rgba(15,23,42,0.82)';
  c.lineWidth = 0.72;
  c.stroke();

  // Dark textured cross-hatched grip insert panel in the center of the handle (`cx + 19 .. cx + 45, y0 + 118 .. y0 + 140`)
  c.save();
  c.beginPath();
  c.moveTo(cx + 21, y0 + 118.5);
  c.lineTo(cx + 44.5, y0 + 127);
  c.lineTo(cx + 40.5, y0 + 139.5);
  c.lineTo(cx + 17.5, y0 + 127.5);
  c.closePath();
  c.fillStyle = '#0f172a';
  c.fill();
  c.strokeStyle = 'rgba(148,163,184,0.5)';
  c.lineWidth = 0.75;
  c.stroke();
  c.clip();
  c.strokeStyle = 'rgba(148,163,184,0.32)';
  c.lineWidth = 0.65;
  for (let k = -4; k <= 8; k++) {
    c.beginPath();
    c.moveTo(cx + 17 + k * 3.2, y0 + 115);
    c.lineTo(cx + 25 + k * 3.2, y0 + 143);
    c.stroke();
  }
  c.restore();

  // Royal-blue magazine baseplate strip & rear lanyard bolt at the bottom of the grip (`cx + 44 .. cx + 51, y0 + 132 .. y0 + 147`)
  c.beginPath();
  c.moveTo(cx + 49.5, y0 + 132);
  c.lineTo(cx + 51.5, y0 + 133.5);
  c.lineTo(cx + 46.5, y0 + 147);
  c.lineTo(cx + 44.5, y0 + 145.5);
  c.closePath();
  c.fillStyle = '#3b82f6';
  c.fill();
  c.strokeStyle = 'rgba(15,23,42,0.88)';
  c.lineWidth = 0.75;
  c.stroke();
  c.beginPath();
  c.arc(cx + 40.5, y0 + 145, 1.4, 0, TAU);
  c.fillStyle = '#cbd5e1';
  c.fill();
  c.strokeStyle = '#0f172a';
  c.lineWidth = 0.55;
  c.stroke();

  // ══════════════════ 2. ANGULAR TACTICAL TRIGGER GUARD & CURVED TRIGGER (`cx + 9 .. cx + 23, y0 + 94 .. y0 + 118`, matching image 2!) ══════════════════
  // Curved metallic trigger blade inside the guard
  c.beginPath();
  c.moveTo(cx + 10, y0 + 101 + trigPull);
  c.quadraticCurveTo(cx + 17.5, y0 + 104 + trigPull, cx + 16.5, y0 + 111.5 + trigPull);
  c.lineTo(cx + 12.8, y0 + 110.5 + trigPull);
  c.quadraticCurveTo(cx + 13.5, y0 + 106 + trigPull, cx + 9.5, y0 + 104 + trigPull);
  c.closePath();
  c.fillStyle = lin(c, cx + 9.5, cx + 17.5, ['#334155', '#cbd5e1', '#f8fafc', '#475569']);
  c.fill();
  c.strokeStyle = 'rgba(15,23,42,0.9)';
  c.lineWidth = 0.78;
  c.stroke();

  // Angular gunmetal trigger guard with notched front face & corner bolt (`cx + 9.5 .. cx + 23, y0 + 93 .. y0 + 118`)
  c.beginPath();
  c.moveTo(cx + 10, y0 + 93);
  c.lineTo(cx + 21.8, y0 + 97);
  c.lineTo(cx + 23.2, y0 + 104.5);
  c.lineTo(cx + 20.5, y0 + 116.5);
  c.lineTo(cx + 10, y0 + 117.5);
  c.lineTo(cx + 10, y0 + 113.5);
  c.lineTo(cx + 17.5, y0 + 113);
  c.lineTo(cx + 18.8, y0 + 103.5);
  c.lineTo(cx + 10, y0 + 98.5);
  c.closePath();
  c.fillStyle = lin(c, cx + 10, cx + 23, ['#1e293b', '#64748b', '#cbd5e1', '#334155']);
  c.fill();
  c.strokeStyle = 'rgba(15,23,42,0.92)';
  c.lineWidth = 0.86;
  c.stroke();

  // Corner bolt on the trigger guard (`cx + 20.4, y0 + 103.5`)
  c.beginPath();
  c.arc(cx + 20.4, y0 + 103.5, 1.5, 0, TAU);
  c.fillStyle = '#e2e8f0';
  c.fill();
  c.strokeStyle = '#0f172a';
  c.lineWidth = 0.6;
  c.stroke();

  // ══════════════════ 3. HEAVY CYLINDRICAL TITANIUM-GUNMETAL BARREL, DORSAL FRONT SIGHT & UNDER-BARREL RAIL (`y0 + 2 .. y0 + 65`, matching image 2!) ══════════════════
  c.save();
  c.translate(0, barrelKick);

  // Under-barrel stepped tactical guide rail on `+x` side (`cx + 6.5 .. cx + 15.5, y0 + 14 .. y0 + 65`)
  c.beginPath();
  c.moveTo(cx + 6.5, y0 + 18);
  c.lineTo(cx + 11.5, y0 + 14);
  c.lineTo(cx + 15.5, y0 + 17);
  c.lineTo(cx + 15.5, y0 + 65);
  c.lineTo(cx + 6.5, y0 + 65);
  c.closePath();
  c.fillStyle = lin(c, cx + 6.5, cx + 15.5, ['#1e293b', '#64748b', '#cbd5e1', '#475569', '#0f172a']);
  c.fill();
  c.strokeStyle = 'rgba(15,23,42,0.92)';
  c.lineWidth = 0.88;
  c.stroke();

  // Recessed bright silver-grey inner slot along the under-barrel rail (`cx + 8.5 .. cx + 13, y0 + 24 .. y0 + 63`)
  c.beginPath();
  c.roundRect(cx + 8.8, y0 + 24, 4.2, 39, 1.2);
  c.fillStyle = lin(c, cx + 8.8, cx + 13, ['#334155', '#94a3b8', '#e2e8f0', '#475569']);
  c.fill();
  c.strokeStyle = 'rgba(15,23,42,0.8)';
  c.lineWidth = 0.68;
  c.stroke();

  // Raised trapezoidal dorsal front sight on `-x` muzzle end (`cx - 16 .. cx - 9, y0 + 6 .. y0 + 26`)
  c.beginPath();
  c.moveTo(cx - 9.5, y0 + 6);
  c.lineTo(cx - 12.8, y0 + 8);
  c.lineTo(cx - 15.8, y0 + 9.5);
  c.lineTo(cx - 15.8, y0 + 17.5);
  c.lineTo(cx - 12.8, y0 + 20);
  c.lineTo(cx - 9.5, y0 + 25.5);
  c.closePath();
  c.fillStyle = lin(c, cx - 16, cx - 9.5, ['#94a3b8', '#e2e8f0', '#64748b', '#1e293b']);
  c.fill();
  c.strokeStyle = 'rgba(15,23,42,0.92)';
  c.lineWidth = 0.86;
  c.stroke();

  // Main heavy cylindrical barrel (`cx - 10 .. cx + 7.5, y0 + 2 .. y0 + 64`)
  c.beginPath();
  c.moveTo(cx - 7.8, y0 + 2);
  c.lineTo(cx + 5.5, y0 + 2);
  c.lineTo(cx + 7.5, y0 + 5.5);
  c.lineTo(cx + 7.5, y0 + 64);
  c.lineTo(cx - 10, y0 + 64);
  c.lineTo(cx - 10, y0 + 5.5);
  c.closePath();
  c.fillStyle = gunmetalBrightGrad(cx - 10, cx + 7.5);
  c.fill();
  c.strokeStyle = 'rgba(15,23,42,0.94)';
  c.lineWidth = 0.94;
  c.stroke();

  // Chamfered muzzle crown seam line (`y0 + 5.5`)
  c.strokeStyle = 'rgba(226,232,240,0.75)';
  c.lineWidth = 0.8;
  c.beginPath();
  c.moveTo(cx - 9.5, y0 + 5.5);
  c.lineTo(cx + 7, y0 + 5.5);
  c.stroke();

  // Bright longitudinal silver-white specular highlight along the cylindrical barrel (for strong contrast!)
  c.beginPath();
  c.roundRect(cx - 4.8, y0 + 6.5, 3.4, 54, 1.5);
  c.fillStyle = 'rgba(248,250,252,0.68)';
  c.fill();
  // Edge highlight along the `-x` dorsal side of the barrel
  c.strokeStyle = 'rgba(203,213,225,0.65)';
  c.lineWidth = 1.1;
  c.beginPath();
  c.moveTo(cx - 8.8, y0 + 6.5);
  c.lineTo(cx - 8.8, y0 + 60);
  c.stroke();

  // Two angled dark muzzle vent slots near the front of the barrel (`y0 + 9 .. y0 + 22`, matching image 2!)
  for (let i = 0; i < 2; i++) {
    const vy = y0 + 9.5 + i * 5.8;
    c.beginPath();
    c.moveTo(cx - 7.5, vy);
    c.lineTo(cx - 1.5, vy + 3.2);
    c.lineTo(cx - 1.5, vy + 5.8);
    c.lineTo(cx - 7.5, vy + 2.6);
    c.closePath();
    c.fillStyle = '#090d16';
    c.fill();
    c.strokeStyle = '#cbd5e1';
    c.lineWidth = 0.65;
    c.stroke();
  }

  // Polished silver-chrome barrel collar ring separating the barrel from the blue receiver (`cx - 10.5 .. cx + 8, y0 + 59.5 .. y0 + 65`)
  c.beginPath();
  c.roundRect(cx - 10.5, y0 + 59.5, 18.5, 5.5, 1.5);
  c.fillStyle = lin(c, cx - 10.5, cx + 8, ['#475569', '#cbd5e1', '#ffffff', '#e2e8f0', '#334155']);
  c.fill();
  c.strokeStyle = 'rgba(15,23,42,0.92)';
  c.lineWidth = 0.88;
  c.stroke();
  c.restore();

  // ══════════════════ 4. SIGNATURE SWEPT-BACK DUAL FINNED VALKYRIE / HYPERDRIVE WINGS (`-x` dorsal rear, matching image 2!) ══════════════════
  // Outer/upper swept dorsal fin (`cx - 38 .. cx - 11.5, y0 + 74 .. y0 + 137`)
  c.beginPath();
  c.moveTo(cx - 11.5, y0 + 74);
  c.lineTo(cx - 21.5, y0 + 85);
  c.lineTo(cx - 21.5, y0 + 94);
  c.lineTo(cx - 37.5, y0 + 109);
  c.lineTo(cx - 37.5, y0 + 136);
  c.lineTo(cx - 23.5, y0 + 124);
  c.lineTo(cx - 11.5, y0 + 114);
  c.closePath();
  c.fillStyle = lin(c, cx - 37.5, cx - 11.5, ['#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8']);
  c.fill();
  c.strokeStyle = 'rgba(15,23,42,0.92)';
  c.lineWidth = 0.9;
  c.stroke();

  // Bright sky-blue leading-edge bevel highlight on the outer dorsal fin
  c.strokeStyle = '#bfdbfe';
  c.lineWidth = 1.25;
  c.beginPath();
  c.moveTo(cx - 12.5, y0 + 75.5);
  c.lineTo(cx - 20.5, y0 + 85);
  c.lineTo(cx - 20.5, y0 + 94);
  c.lineTo(cx - 36.2, y0 + 109.5);
  c.lineTo(cx - 36.2, y0 + 133);
  c.stroke();

  // 5 stepped rearward aerodynamic feather louvers extending from the wing (`y0 + 114 .. y0 + 150`, matching image 2!)
  for (let i = 0; i < 5; i++) {
    const fxOuter = cx - 30.5 + i * 3.5;
    const fxInner = fxOuter + 2.8;
    const fyTop = y0 + 112 + i * 2.2;
    const fyBot = y0 + 150 - i * 4.2;
    c.beginPath();
    c.moveTo(fxOuter, fyTop);
    c.lineTo(fxOuter, fyBot);
    c.lineTo(fxInner, fyBot - 2.6);
    c.lineTo(fxInner, fyTop + 2);
    c.closePath();
    c.fillStyle = lin(c, fxOuter, fxInner, ['#60a5fa', '#3b82f6', '#1d4ed8']);
    c.fill();
    c.strokeStyle = 'rgba(15,23,42,0.92)';
    c.lineWidth = 0.82;
    c.stroke();

    // Bright sky-blue highlight along each feather fin's outer edge
    c.strokeStyle = '#93c5fd';
    c.lineWidth = 0.9;
    c.beginPath();
    c.moveTo(fxOuter + 0.6, fyTop + 2);
    c.lineTo(fxOuter + 0.6, fyBot - 1.5);
    c.stroke();
  }

  // Main angular wing shield plate (`cx - 30.5 .. cx - 9.5, y0 + 95 .. y0 + 126`, matching image 2!)
  c.beginPath();
  c.moveTo(cx - 15.5, y0 + 95);
  c.lineTo(cx - 30.5, y0 + 108);
  c.lineTo(cx - 30.5, y0 + 126);
  c.lineTo(cx - 9.5, y0 + 114);
  c.lineTo(cx - 9.5, y0 + 100);
  c.closePath();
  c.fillStyle = lin(c, cx - 30.5, cx - 9.5, ['#60a5fa', '#3b82f6', '#2563eb', '#1e40af']);
  c.fill();
  c.strokeStyle = 'rgba(15,23,42,0.92)';
  c.lineWidth = 0.9;
  c.stroke();

  // Bright sky-blue bevel & 2 dark vent slits on the wing shield plate
  c.strokeStyle = '#bfdbfe';
  c.lineWidth = 1.15;
  c.beginPath();
  c.moveTo(cx - 15.5, y0 + 96.2);
  c.lineTo(cx - 29.2, y0 + 108.2);
  c.lineTo(cx - 29.2, y0 + 124);
  c.stroke();
  c.strokeStyle = '#0f172a';
  c.lineWidth = 1.1;
  c.beginPath();
  c.moveTo(cx - 17, y0 + 101.5);
  c.lineTo(cx - 20, y0 + 104.5);
  c.moveTo(cx - 15.5, y0 + 109.5);
  c.lineTo(cx - 19, y0 + 112);
  c.stroke();

  // ══════════════════ 5. HIGH-CONTRAST COBALT-BLUE RECEIVER BODY & GLASS HYPERDRIVE PLASMA CORE (matching image 2!) ══════════════════
  // Main angular cobalt-blue receiver housing (`cx - 12.5 .. cx + 23.5, y0 + 64 .. y0 + 134`)
  c.beginPath();
  c.moveTo(cx - 11, y0 + 64);
  c.lineTo(cx + 21.5, y0 + 64);
  c.lineTo(cx + 23.5, y0 + 66.5);
  // Stepped lower-front chin on `+x` side (`y0 + 66.5 .. y0 + 94`)
  c.lineTo(cx + 23.5, y0 + 93);
  c.lineTo(cx + 20.5, y0 + 96);
  c.lineTo(cx + 10.5, y0 + 96);
  // Above trigger guard (`y0 + 96 .. y0 + 116`)
  c.lineTo(cx + 10.5, y0 + 116);
  c.lineTo(cx + 7.5, y0 + 132);
  c.lineTo(cx + 4, y0 + 134);
  // Rear receiver contour
  c.lineTo(cx - 7.5, y0 + 129);
  c.lineTo(cx - 12.5, y0 + 116);
  c.lineTo(cx - 12.5, y0 + 66);
  c.closePath();
  c.fillStyle = blueArmorGrad(cx - 12.5, cx + 23.5);
  c.fill();
  c.strokeStyle = 'rgba(15,23,42,0.94)';
  c.lineWidth = 0.94;
  c.stroke();

  // Bright sky-blue (`#93c5fd` / `#dbeafe`) edge highlights along the receiver so it has crisp high contrast!
  c.strokeStyle = '#93c5fd';
  c.lineWidth = 1.2;
  c.beginPath();
  c.moveTo(cx - 11, y0 + 65.2);
  c.lineTo(cx + 21, y0 + 65.2);
  c.moveTo(cx - 11.2, y0 + 66);
  c.lineTo(cx - 11.2, y0 + 115);
  c.stroke();

  // Internal armor panel seam lines on the blue receiver (matching image 2!)
  c.strokeStyle = 'rgba(15,23,42,0.68)';
  c.lineWidth = 0.78;
  c.beginPath();
  c.moveTo(cx + 7, y0 + 64.5);
  c.lineTo(cx + 7, y0 + 78);
  c.lineTo(cx + 14.5, y0 + 78);
  c.lineTo(cx + 14.5, y0 + 95.5);
  c.stroke();

  // Glowing 3-bar cyan battery indicator on the lower-front blue receiver chin (`cx + 16.5 .. cx + 21, y0 + 83 .. y0 + 92`, matching image 2!)
  c.strokeStyle = '#93c5fd';
  c.lineWidth = 0.72;
  c.strokeRect(cx + 16.8, y0 + 83.5, 3.8, 7.8);
  c.fillStyle = '#67e8f9';
  c.fillRect(cx + 17.5, y0 + 84.5, 2.4, 1.8);
  c.fillRect(cx + 17.5, y0 + 86.9, 2.4, 1.8);
  c.fillRect(cx + 17.5, y0 + 89.2, 2.4, 1.4);

  // Octagonal stepped blue frame around the central plasma core window (`cx - 9 .. cx + 7, y0 + 78 .. y0 + 111`)
  c.beginPath();
  c.moveTo(cx - 6, y0 + 78);
  c.lineTo(cx + 4, y0 + 78);
  c.lineTo(cx + 7, y0 + 81);
  c.lineTo(cx + 7, y0 + 108);
  c.lineTo(cx + 4, y0 + 111);
  c.lineTo(cx - 6, y0 + 111);
  c.lineTo(cx - 9, y0 + 108);
  c.lineTo(cx - 9, y0 + 81);
  c.closePath();
  c.fillStyle = lin(c, cx - 9, cx + 7, ['#1e40af', '#3b82f6', '#60a5fa', '#1d4ed8']);
  c.fill();
  c.strokeStyle = 'rgba(15,23,42,0.9)';
  c.lineWidth = 0.85;
  c.stroke();
  c.strokeStyle = '#93c5fd';
  c.lineWidth = 0.75;
  c.strokeRect(cx - 7.2, y0 + 80, 12.4, 29);

  // Dark gunmetal inner chamber housing (`cx - 6 .. cx + 4, y0 + 81 .. y0 + 108`)
  c.beginPath();
  c.roundRect(cx - 6, y0 + 81, 10, 27, 2.2);
  c.fillStyle = '#0f172a';
  c.fill();
  c.strokeStyle = 'rgba(15,23,42,0.92)';
  c.lineWidth = 0.82;
  c.stroke();

  // Top & bottom metallic silver chamber end-caps inside the window (`y0 + 81.5 .. y0 + 86` and `y0 + 103 .. y0 + 107.5`)
  c.fillStyle = lin(c, cx - 5.5, cx + 3.5, ['#334155', '#cbd5e1', '#f8fafc', '#475569']);
  c.fillRect(cx - 5.4, y0 + 81.8, 8.8, 4.2);
  c.fillRect(cx - 5.4, y0 + 103, 8.8, 4.2);

  // Dark-tinted glass cylinder housing a blazing electric cyan-white plasma core (`cx - 5.2 .. cx + 3.2, y0 + 85.8 .. y0 + 103.2`, matching image 2!)
  c.save();
  c.beginPath();
  c.roundRect(cx - 5.2, y0 + 85.8, 8.4, 17.4, 1.5);
  const coreGrad = c.createLinearGradient(cx - 5.2, 0, cx + 3.2, 0);
  coreGrad.addColorStop(0, '#082f49');
  coreGrad.addColorStop(0.22, '#0284c7');
  coreGrad.addColorStop(0.5, '#67e8f9');
  coreGrad.addColorStop(0.78, '#0284c7');
  coreGrad.addColorStop(1, '#082f49');
  c.fillStyle = coreGrad;
  c.fill();
  c.clip();

  // Glowing cyan-white plasma core beam in the center of the glass chamber
  c.fillStyle = `rgba(186,230,253,${0.65 + 0.35 * pulse})`;
  c.fillRect(cx - 3.2, y0 + 86, 4.4, 17);
  c.fillStyle = '#ffffff';
  c.fillRect(cx - 1.9, y0 + 86.5, 1.8, 16);
  c.restore();

  // Cyan glass window frame highlight
  c.strokeStyle = '#67e8f9';
  c.lineWidth = 0.8;
  c.strokeRect(cx - 5.2, y0 + 85.8, 8.4, 17.4);

  // Selector switch lever (`cx + 5 .. cx + 9, y0 + 107 .. y0 + 118`) & glowing lightning symbol (`⚡`) + rear LED slot (matching image 2!)
  c.beginPath();
  c.arc(cx + 6.8, y0 + 109.5, 2.8, 0, TAU);
  c.fillStyle = '#1e293b';
  c.fill();
  c.strokeStyle = '#94a3b8';
  c.lineWidth = 0.7;
  c.stroke();
  c.beginPath();
  c.roundRect(cx + 5.7, y0 + 109, 2.2, 8.5, 1);
  c.fillStyle = '#cbd5e1';
  c.fill();
  c.strokeStyle = '#0f172a';
  c.lineWidth = 0.65;
  c.stroke();

  // Glowing cyan lightning bolt icon (`cx + 10.5, y0 + 120 .. y0 + 125`)
  c.fillStyle = '#67e8f9';
  c.beginPath();
  c.moveTo(cx + 11.5, y0 + 119.5);
  c.lineTo(cx + 9.6, y0 + 122.5);
  c.lineTo(cx + 11.2, y0 + 122.5);
  c.lineTo(cx + 10.2, y0 + 125.5);
  c.lineTo(cx + 12.6, y0 + 122);
  c.lineTo(cx + 11.0, y0 + 122);
  c.closePath();
  c.fill();

  // Rear dark status switch slot with red indicator dot (`cx + 1 .. cx + 4.8, y0 + 120 .. y0 + 127.5`)
  c.beginPath();
  c.roundRect(cx + 1, y0 + 120, 3.8, 7.5, 1.2);
  c.fillStyle = '#0f172a';
  c.fill();
  c.strokeStyle = '#64748b';
  c.lineWidth = 0.65;
  c.stroke();
  c.beginPath();
  c.arc(cx + 2.9, y0 + 122.5, 1.1, 0, TAU);
  c.fillStyle = '#f43f5e';
  c.fill();

  c.restore();
}

// ------------------------------------------------------------- 11. QUANTUM DESTABILIZER
function quantumDestabilizer(c: C, cx: number, y0: number, t: number) {
  drawModernGrip(c, cx, y0 + 84, '#a855f7', 'g10'); // nyambung ke badan y0+112
  guard(c, cx, y0 + 100, '#000', 12);
  // Badan ungu
  rr(c, cx - 15, y0 + 68, 30, 44, 5, lin(c, cx - 15, cx + 15, ['#1a0533', '#7e22ce', '#1a0533']), '#000', 1.5);
  // Cincin kuantum
  for (let i = 0; i < 3; i++) {
    const yy = y0 + 74 + i * 12;
    c.strokeStyle = i === 1 ? '#e9d5ff' : '#a855f7';
    c.lineWidth = 2;
    c.beginPath();
    c.ellipse(cx, yy, 18, 4, Math.sin(t * 2 + i) * 0.2, 0, TAU);
    c.stroke();
  }
  // Laras
  rr(c, cx - 6, y0 + 4, 12, 68, 3, lin(c, cx - 6, cx + 6, ['#111', '#a855f7', '#111']), '#000', 1.2);
  // Mata portal
  const pulse = 0.7 + 0.3 * Math.sin(t * 8);
  c.beginPath();
  c.ellipse(cx, y0 + 8, 10, 8, 0, 0, TAU);
  c.fillStyle = radial(c, cx, y0 + 8, 10, ['#ffffff', '#d8b4fe', '#4c1d95']);
  c.shadowColor = '#a855f7';
  c.shadowBlur = 16 * pulse;
  c.fill();
  c.shadowBlur = 0;
  c.fillStyle = '#000';
  c.beginPath();
  c.ellipse(cx, y0 + 8, 3, 2.5, 0, 0, TAU);
  c.fill();
  // Partikel kuantum
  for (let i = 0; i < 3; i++) {
    const a = t * 2 + i * 2;
    glow(c, cx + Math.cos(a) * 18, y0 + 70 + Math.sin(a * 1.5) * 10, 1.5, '#e9d5ff', 8);
  }
}

// ================================================================ dispatch
export function drawGunExtra4(c: C, id: WeaponId, cx: number, y0: number, t: number, _ready: boolean) {
  switch (id) {
    case 'photon_saber': photonSaber(c, cx, y0, t); break;
    case 'gauntlet_cannon': gauntletCannon(c, cx, y0, t); break;
    case 'pulse_rifle': pulseRifle(c, cx, y0); break;
    case 'cryo_blaster': cryoBlaster(c, cx, y0, t); break;
    case 'hyperdrive': hyperdrive(c, cx, y0, t); break;
    case 'quantum_destabilizer': quantumDestabilizer(c, cx, y0, t); break;
    case 'xeno': xenoHeadGun(c, cx, y0, t); break;
    case 'dora': doraCannonGun(c, cx, y0, t); break;
    case 'pred': predCasterGun(c, cx, y0, t, gunState.charge || 0, gunState.servo || 0, gunState.heat || 0); break;
    default: {
      void loneStar; void plasmaRepeater; void warpDisruptor; void deflectorShield;
      break;
    }
  }
}

// ================================================================ muzzle flashes
type Flash4 = { k: 'fire'; s: number } | { k: 'energy'; rgb: string; r: number };
export const FLASH4: Partial<Record<WeaponId, Flash4>> = {
  photon_saber: { k: 'energy', rgb: '34,211,238', r: 50 },
  gauntlet_cannon: { k: 'energy', rgb: '251,146,60', r: 68 },
  pulse_rifle: { k: 'energy', rgb: '56,189,248', r: 34 },
  cryo_blaster: { k: 'energy', rgb: '103,232,249', r: 44 },
  hyperdrive: { k: 'energy', rgb: '96,165,250', r: 48 },
  quantum_destabilizer: { k: 'energy', rgb: '168,85,247', r: 40 },
  xeno: { k: 'energy', rgb: '182,255,26', r: 55 },
  dora: { k: 'energy', rgb: '255,255,255', r: 60 },
  pred: { k: 'energy', rgb: '111,211,255', r: 65 },
};
