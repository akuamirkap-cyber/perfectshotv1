import { TAU, lin, steel, chrome, brass, rr, grip, guard, glow, radial } from './kit';

type C = CanvasRenderingContext2D;

// ------------------------------------------------------------- DISC GUN
export function discGun(c: C, cx: number, y0: number, t: number, ready: boolean) {
  grip(c, cx, y0 + 106, '#083344', '#06b6d4', 0.8);
  guard(c, cx, y0 + 98, '#082f49');
  // Futuristic launcher body
  rr(c, cx - 18, y0 + 36, 36, 84, 8, lin(c, cx - 18, cx + 18, ['#0f172a', '#06b6d4', '#164e63']), '#082f49', 2);
  c.fillStyle = '#22d3ee';
  c.fillRect(cx - 18, y0 + 80, 36, 4);

  // Flat disc magazine slot
  rr(c, cx - 22, y0 + 26, 44, 16, 4, '#0e7490', '#083344', 1.5);

  if (ready) {
    // Glowing neon circular disc loaded at top
    c.save();
    c.translate(cx, y0 + 12);
    c.rotate(t * 8);
    c.beginPath();
    c.arc(0, 0, 16, 0, TAU);
    c.fillStyle = radial(c, 0, 0, 16, ['#a5f3fc', '#06b6d4', '#083344']);
    c.shadowColor = '#22d3ee';
    c.shadowBlur = 12;
    c.fill();
    c.shadowBlur = 0;
    c.strokeStyle = '#cffafe';
    c.lineWidth = 2;
    c.stroke();
    // Inner cross slot
    c.strokeStyle = '#083344';
    c.lineWidth = 3;
    c.beginPath();
    c.moveTo(-10, 0); c.lineTo(10, 0);
    c.moveTo(0, -10); c.lineTo(0, 10);
    c.stroke();
    c.restore();
  }
}

// ------------------------------------------------------------- 8-BIT RETRO GUN
export function bit8Gun(c: C, cx: number, y0: number) {
  // Stepped blocky pixel NES-style Zapper
  const P = 4;
  c.save();
  c.translate(cx, y0);

  // Pixel handle
  c.fillStyle = '#1e293b';
  c.fillRect(2 * P, 22 * P, 6 * P, 14 * P);
  c.fillRect(4 * P, 30 * P, 6 * P, 10 * P);
  c.strokeStyle = '#020617';
  c.lineWidth = 2;
  c.strokeRect(2 * P, 22 * P, 6 * P, 14 * P);

  // Pixel body (Retro Bright Orange & Gray)
  c.fillStyle = '#ea580c';
  c.fillRect(-4 * P, 8 * P, 10 * P, 16 * P);
  c.fillStyle = '#f97316';
  c.fillRect(-4 * P, 8 * P, 4 * P, 16 * P);

  // Pixel barrel
  c.fillStyle = '#64748b';
  c.fillRect(-2 * P, 0, 5 * P, 10 * P);
  c.fillStyle = '#94a3b8';
  c.fillRect(-2 * P, 0, 2 * P, 10 * P);

  // Pixel sights
  c.fillStyle = '#1e293b';
  c.fillRect(-2 * P, -P, 2 * P, P);

  // Pixel trigger
  c.fillStyle = '#dc2626';
  c.fillRect(-P, 18 * P, 2 * P, 4 * P);

  c.restore();
}

// ------------------------------------------------------------- COIN GUN
export function coinGun(c: C, cx: number, y0: number, _t: number, ready: boolean) {
  grip(c, cx, y0 + 112, '#451a03', '#a16207', 0.8);
  guard(c, cx, y0 + 104, '#713f12');

  // Piggy-bank style / golden coin stack cylinder
  rr(c, cx - 18, y0 + 44, 36, 82, 8, lin(c, cx - 18, cx + 18, ['#78350f', '#fde047', '#eab308', '#713f12']), '#451a03', 2);

  // Coin slot on top
  rr(c, cx - 8, y0 + 48, 16, 6, 2, '#451a03');

  // Stack of gold coins visible in transparent chamber
  c.save();
  c.beginPath();
  c.roundRect(cx - 12, y0 + 60, 24, 60, 6);
  c.clip();
  for (let i = 0; i < 7; i++) {
    const cy = y0 + 64 + i * 8;
    c.fillStyle = i % 2 === 0 ? '#fde047' : '#ca8a04';
    c.fillRect(cx - 12, cy, 24, 6);
    c.strokeStyle = '#713f12';
    c.lineWidth = 1;
    c.strokeRect(cx - 12, cy, 24, 6);
  }
  c.restore();

  // Barrel
  rr(c, cx - 5, y0 + 8, 10, 40, 2, brass(c, cx - 5, cx + 5), '#713f12', 1);

  if (ready) {
    // Loaded giant shiny coin at muzzle
    c.save();
    c.translate(cx, y0 + 8);
    c.scale(1, 0.4);
    c.beginPath();
    c.arc(0, 0, 15, 0, TAU);
    c.fillStyle = radial(c, 0, 0, 15, ['#fef08a', '#eab308', '#a16207']);
    c.shadowColor = '#fde047';
    c.shadowBlur = 10;
    c.fill();
    c.strokeStyle = '#451a03';
    c.lineWidth = 2;
    c.stroke();
    c.fillStyle = '#713f12';
    c.font = 'bold 16px sans-serif';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText('$', 0, 0);
    c.restore();
  }
}

// ------------------------------------------------------------- KUNAI GUN
export function kunaiGun(c: C, cx: number, y0: number, ready: boolean) {
  // Ninja gauntlet launcher mounted on forearm
  rr(c, cx - 12, y0 + 60, 24, 110, 4, lin(c, cx - 12, cx + 12, ['#090d16', '#1e293b', '#0f172a']), '#020617', 2);

  // Bandage / wraps around gauntlet
  c.strokeStyle = '#e2e8f0';
  c.lineWidth = 2.5;
  for (let i = 0; i < 7; i++) {
    c.beginPath();
    c.moveTo(cx - 12, y0 + 70 + i * 14);
    c.lineTo(cx + 12, y0 + 76 + i * 14);
    c.stroke();
  }

  // Steel launcher rail
  rr(c, cx - 4, y0 + 10, 8, 90, 2, steel(c, cx - 4, cx + 4), '#000', 1);

  if (ready) {
    // Authentic Japanese Kunai ready to launch
    c.save();
    c.translate(cx, y0 - 2);

    // Blade (rhombus leaf shape)
    c.beginPath();
    c.moveTo(0, -20); // Tip
    c.lineTo(9, 6);
    c.lineTo(4, 14);
    c.lineTo(-4, 14);
    c.lineTo(-9, 6);
    c.closePath();
    c.fillStyle = chrome(c, -9, 9);
    c.fill();
    c.strokeStyle = '#1e293b';
    c.lineWidth = 1.5;
    c.stroke();

    // Center blade ridge
    c.strokeStyle = '#ffffff';
    c.lineWidth = 1.2;
    c.beginPath();
    c.moveTo(0, -18); c.lineTo(0, 14);
    c.stroke();

    // Handle wrapped in white cloth
    c.fillStyle = '#f8fafc';
    c.fillRect(-2.5, 14, 5, 22);
    c.strokeStyle = '#94a3b8';
    c.lineWidth = 1;
    for (let k = 0; k < 4; k++) {
      c.beginPath();
      c.moveTo(-2.5, 18 + k * 4); c.lineTo(2.5, 20 + k * 4);
      c.stroke();
    }

    // Iron ring at pommel
    c.beginPath();
    c.arc(0, 40, 5, 0, TAU);
    c.strokeStyle = '#334155';
    c.lineWidth = 2.5;
    c.stroke();
    c.restore();
  }
}

// ------------------------------------------------------------- STAR WARS BLASTER
export function starWarsBlaster(c: C, cx: number, y0: number, t: number) {
  // Iconic DL-44 / E-11 style heavy sci-fi blaster
  grip(c, cx, y0 + 118, '#1e1b18', '#382e25', 0.82);
  guard(c, cx, y0 + 110, '#0a0a0a');

  // Heavy blackened receiver
  rr(c, cx - 14, y0 + 64, 28, 64, 4, lin(c, cx - 14, cx + 14, ['#09090b', '#27272a', '#18181b', '#09090b']), '#000', 2);

  // Side scope with glass lens
  rr(c, cx + 14, y0 + 74, 10, 48, 3, '#18181b', '#000', 1);
  c.beginPath();
  c.ellipse(cx + 19, y0 + 74, 5, 2, 0, 0, TAU);
  c.fillStyle = '#38bdf8';
  c.fill();

  // Cooling fins along the barrel
  rr(c, cx - 7, y0 + 14, 14, 54, 2, steel(c, cx - 7, cx + 7), '#000', 1.5);
  for (let i = 0; i < 6; i++) {
    c.fillStyle = '#09090b';
    c.fillRect(cx - 8, y0 + 20 + i * 7, 16, 2.5);
  }

  // Flared conical flash hider / muzzle
  c.beginPath();
  c.moveTo(cx - 11, y0);
  c.lineTo(cx + 11, y0);
  c.lineTo(cx + 6, y0 + 16);
  c.lineTo(cx - 6, y0 + 16);
  c.closePath();
  c.fillStyle = lin(c, cx - 11, cx + 11, ['#18181b', '#52525b', '#18181b']);
  c.fill();
  c.strokeStyle = '#000';
  c.lineWidth = 1.5;
  c.stroke();

  // Red plasma glow ready inside muzzle
  glow(c, cx, y0 + 2, 3 + Math.sin(t * 12) * 1, '#ef4444', 12);
}
