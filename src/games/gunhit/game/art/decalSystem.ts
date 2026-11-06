import type { Weapon } from '../weapons';
import { drawGlow } from './glowSprite';

const TAU = Math.PI * 2;
const rand = (a: number, b: number) => a + Math.random() * (b - a);
const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const prng = (seed: number) => {
  let s = seed;
  return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
};
const rgba = (h: string, a: number) => { const n = parseInt(h.slice(1), 16); return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`; };
// Soft bloom instead of a filled disc (slide 7 glowSprite): the acid entry
// crater used to show a flat neon-green circle around it.
const glowAt = (c: CanvasRenderingContext2D, x: number, y: number, r: number, color: string, a: number) => {
  drawGlow(c, x, y, r, color, a);
};

// -------------------------------------------------------------
// HIGH-END MATERIAL IMPACT DECAL GENERATOR
// Sesuai dengan jenis senjata (Laser, Peluru Logam, Pedang/Pisau, Air/Buah, Sihir, Ledakan, dll.)
// Menghasilkan bekas yang rapi, modern, dan sangat estetis!
// -------------------------------------------------------------

export function drawPreciseWeaponDecal(
  c: CanvasRenderingContext2D,
  R: number,
  a: number,
  w: Weapon,
  style: string,
  time = 0,
  /** Paintball only: the colour of the shot that landed, as an `r,g,b` triple. */
  tint?: string
) {
  const x = Math.cos(a) * (R - 2.5);
  const y = Math.sin(a) * (R - 2.5);
  const inward = a + Math.PI; // Menghadap ke arah pusat target

  c.save();
  c.beginPath();
  c.arc(0, 0, R, 0, TAU);
  c.clip();

  // Slide #3 Firework 8-Gun rockets, Slide #2 Yoyo wheels, and Slide #8 Keris stick cleanly onto the rim without a black hole.
  if (w.id === 'firework' || w.id === 'yoyo' || w.id === 'keris') {
    c.restore();
    return;
  }

  // Celestial/prismatic shots leave a tiny constellation, not a black laser
  // entry hole. This imprint survives after the particle aura has faded.
  if (w.id === 'moonbeam' || w.id === 'rainbow') {
    c.save(); c.translate(x - Math.cos(a) * 7, y - Math.sin(a) * 7);
    c.rotate(inward - Math.PI / 2);
    const isMoon = w.id === 'moonbeam';
    const halo = c.createRadialGradient(0, 0, 1, 0, 0, 20);
    halo.addColorStop(0, isMoon ? 'rgba(255,250,225,0.85)' : 'rgba(255,255,255,0.8)');
    halo.addColorStop(0.5, isMoon ? 'rgba(185,160,246,0.42)' : 'rgba(244,150,234,0.37)');
    halo.addColorStop(1, 'rgba(184,148,248,0)');
    c.fillStyle = halo; c.beginPath(); c.arc(0, 0, 20, 0, TAU); c.fill();
    if (!isMoon) {
      const bands = ['#fb7185', '#fb923c', '#fde047', '#4ade80', '#60a5fa', '#c084fc'];
      for (let i = 0; i < bands.length; i++) {
        c.strokeStyle = bands[i]; c.lineWidth = 1.2;
        c.beginPath(); c.moveTo((i - 2.5) * 2, 3);
        c.quadraticCurveTo((i - 2.5) * 2.6, 13, (i - 2.5) * 1.2, 19); c.stroke();
      }
    }
    c.fillStyle = isMoon ? '#fff5e1' : '#ffffff';
    c.beginPath();
    for (let i = 0; i < 12; i++) {
      const angle = i * TAU / 12 - Math.PI / 2;
      const r = i % 2 ? 2.5 : 6;
      c.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
    }
    c.closePath(); c.fill();
    c.restore(); c.restore(); return;
  }

  // Gauntlet Cannon leaves a heavy scorched knuckle-impact crater with golden-crimson fracture lines
  if (w.id === 'gauntlet_cannon') {
    c.save();
    c.translate(x, y);
    c.rotate(inward - Math.PI / 2);

    const craterG = c.createRadialGradient(0, 2, 1, 0, 2, 16);
    craterG.addColorStop(0, 'rgba(254,240,138,0.9)');
    craterG.addColorStop(0.45, 'rgba(239,68,68,0.55)');
    craterG.addColorStop(1, 'rgba(69,10,10,0)');
    c.fillStyle = craterG;
    c.beginPath();
    c.arc(0, 2, 16, 0, TAU);
    c.fill();

    c.strokeStyle = 'rgba(250,204,21,0.85)';
    c.lineWidth = 1.4;
    c.beginPath();
    c.moveTo(-3, 1); c.lineTo(-11, 7);
    c.moveTo(0, 2); c.lineTo(0, 11);
    c.moveTo(3, 1); c.lineTo(11, 7);
    c.stroke();

    c.restore();
    c.restore();
    return;
  }

  // 1. SENJATA LASER / PLASMA / ENERGI (Seperti di screenshot kamu: Plasma/Laser Gun!)
  // Bukan cakar retakan jelek, melainkan burn pin laser mikro mengkilap dengan cincin energi pendaran tipis!
  // Xenomorph acid: scorched organic blob with bubbling acid (game-3 drawDecal 'acid' kind)
  if (w.id === 'xeno') {
    const seed = Math.floor(Math.random() * 1000);
    const r = prng(seed);
    const pts = Array.from({ length: 16 }, () => rand(0.7, 1.25));
    const sc = 1;
    const t = time;
    c.save();
    c.translate(x, y);
    c.rotate(inward);
    // scorched wood halo
    const st = c.createRadialGradient(0, 0, 0, 0, 0, 40 * sc);
    st.addColorStop(0, 'rgba(30,20,5,0.8)'); st.addColorStop(0.5, 'rgba(60,40,10,0.45)'); st.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = st; c.beginPath(); c.arc(0, 0, 40 * sc, 0, TAU); c.fill();
    // char rim + hole path
    const path = (k: number) => {
      c.beginPath();
      for (let i = 0; i <= 16; i++) { const an = (i / 16) * TAU; const rr = 15 * sc * k * pts[i % 16]; i ? c.lineTo(Math.cos(an) * rr, Math.sin(an) * rr) : c.moveTo(rr, 0); }
      c.closePath();
    };
    path(1.22); c.fillStyle = 'rgba(25,14,4,0.95)'; c.fill();
    // hole: deep black with greenish acid pooling
    path(1);
    const hg = c.createRadialGradient(0, 0, 0, 0, 0, 15 * sc);
    hg.addColorStop(0, '#0a1a02'); hg.addColorStop(0.6, '#030702'); hg.addColorStop(1, '#1c2e04');
    c.fillStyle = hg; c.fill();
    // bubbling acid inside
    c.globalCompositeOperation = 'lighter';
    const pulse = 0.55 + 0.3 * Math.sin(t * 5 + seed);
    const pool = c.createRadialGradient(0, 0, 0, 0, 0, 12 * sc);
    pool.addColorStop(0, rgba('#c8ff3a', 0.55 * pulse)); pool.addColorStop(1, rgba('#4f8f00', 0));
    path(0.85); c.fillStyle = pool; c.fill();
    path(1); c.strokeStyle = rgba('#b6ff1a', pulse); c.lineWidth = 2.2; c.stroke();
    path(1.1); c.strokeStyle = rgba('#f4ff9a', pulse * 0.4); c.lineWidth = 1; c.stroke();
    glowAt(c, 0, 0, 30 * sc, '#9aff00', 0.22 + 0.15 * pulse);
    for (let i = 0; i < 7; i++) {
      const an = r() * TAU, rr = r() * 10 * sc;
      const br = Math.max(0, 1.2 + 1.8 * Math.sin(t * 6 + i * 2.1 + seed));
      c.beginPath(); c.arc(Math.cos(an) * rr, Math.sin(an) * rr, br, 0, TAU);
      c.strokeStyle = rgba('#f4ff9a', 0.85); c.lineWidth = 1; c.stroke();
    }
    c.globalCompositeOperation = 'source-over';
    c.restore();
    c.restore();
    return;
  }
  // Dora air cannon: compressed wood dent with radial cracks (game-3 drawDent)
  if (w.id === 'dora') {
    const seed = Math.floor(Math.random() * 1000);
    const r = prng(seed);
    const pts = Array.from({ length: 12 }, () => rand(0.6, 1.3));
    c.save();
    c.translate(x, y);
    c.rotate(inward);
    // crushed fibers
    const g = c.createRadialGradient(-4, 0, 0, 0, 0, 26);
    g.addColorStop(0, 'rgba(60,35,10,0.95)'); g.addColorStop(0.55, 'rgba(90,55,20,0.6)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = g;
    c.beginPath();
    for (let i = 0; i <= 12; i++) { const an = (i / 12) * TAU; const rr = 22 * pts[i % 12]; i ? c.lineTo(Math.cos(an) * rr, Math.sin(an) * rr) : c.moveTo(rr, 0); }
    c.closePath(); c.fill();
    // highlight rim
    c.strokeStyle = 'rgba(255,230,180,0.35)'; c.lineWidth = 1.5;
    c.beginPath(); c.arc(0, 0, 20, 0.6, 2.6); c.stroke();
    // radial cracks
    c.lineCap = 'round';
    for (let i = 0; i < 9; i++) {
      const a = r() * TAU;
      let cx = Math.cos(a) * 6, cy = Math.sin(a) * 6;
      c.beginPath(); c.moveTo(cx, cy);
      const segs = 3 + Math.floor(r() * 3);
      for (let k = 0; k < segs; k++) { cx += Math.cos(a + (r() - 0.5) * 0.9) * (8 + r() * 8); cy += Math.sin(a + (r() - 0.5) * 0.9) * (8 + r() * 8); c.lineTo(cx, cy); }
      c.strokeStyle = 'rgba(35,18,4,0.9)'; c.lineWidth = 2.2 - (i % 3) * 0.5; c.stroke();
      c.strokeStyle = 'rgba(240,210,150,0.35)'; c.lineWidth = 0.8; c.stroke();
    }
    // splinter flaps
    c.fillStyle = '#d9b47a';
    for (let i = 0; i < 5; i++) {
      const a = r() * TAU, rr = 14 + r() * 8;
      c.save(); c.translate(Math.cos(a) * rr, Math.sin(a) * rr); c.rotate(a);
      c.beginPath(); c.moveTo(0, -2); c.lineTo(9 + r() * 6, 0); c.lineTo(0, 2); c.closePath(); c.fill();
      c.restore();
    }
    c.restore();
    c.restore();
    return;
  }
  // Predator plasma: molten crater in wood (game-3 drawPlasmaCrater)
  if (w.id === 'pred') {
    const seed = Math.floor(Math.random() * 1000);
    const r = prng(seed);
    const pts = Array.from({ length: 14 }, () => rand(0.75, 1.25));
    const hot = 1;
    const t = time;
    c.save();
    c.translate(x, y);
    c.rotate(inward);
    // scorched halo
    const halo = c.createRadialGradient(0, 0, 0, 0, 0, 44);
    halo.addColorStop(0, 'rgba(10,6,2,0.95)'); halo.addColorStop(0.5, 'rgba(30,16,5,0.7)'); halo.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = halo; c.beginPath(); c.arc(0, 0, 44, 0, TAU); c.fill();
    // burn rays
    c.lineCap = 'round';
    for (let i = 0; i < 12; i++) {
      const a = r() * TAU, l = 18 + r() * 22;
      c.beginPath(); c.moveTo(Math.cos(a) * 8, Math.sin(a) * 8); c.lineTo(Math.cos(a) * l, Math.sin(a) * l);
      c.strokeStyle = 'rgba(15,8,2,0.85)'; c.lineWidth = 1.5 + r() * 2.5; c.stroke();
    }
    // crater bowl
    const path = (k: number) => {
      c.beginPath();
      for (let i = 0; i <= 14; i++) { const an = (i / 14) * TAU; const rr = 17 * k * pts[i % 14]; i ? c.lineTo(Math.cos(an) * rr, Math.sin(an) * rr) : c.moveTo(rr, 0); }
      c.closePath();
    };
    path(1.15); c.fillStyle = '#120a04'; c.fill();
    path(1);
    const bowl = c.createRadialGradient(0, 0, 0, 0, 0, 17);
    bowl.addColorStop(0, `rgb(${lerp(20, 255, hot)},${lerp(10, 240, hot)},${lerp(5, 200, hot)})`);
    bowl.addColorStop(0.5, rgba('#ff7a20', 0.4 + hot * 0.6));
    bowl.addColorStop(1, '#0a0603');
    c.fillStyle = bowl; c.fill();
    // glass-like cooled plasma sheen
    c.globalCompositeOperation = 'lighter';
    glowAt(c, 0, 0, 30, '#ff7a20', hot * 0.9);
    glowAt(c, 0, 0, 14, '#ffffff', Math.pow(hot, 2));
    const pulse = 0.5 + 0.5 * Math.sin(t * 10 + seed);
    glowAt(c, 0, 0, 24, '#6fd3ff', (0.12 + hot * 0.35) * pulse);
    path(1.02); c.strokeStyle = rgba('#6fd3ff', 0.25 + hot * 0.6); c.lineWidth = 1.5; c.stroke();
    // residual micro arcs
    if (Math.random() < 0.15 + hot * 0.4) {
      const a = r() * TAU + t;
      c.beginPath(); c.moveTo(0, 0);
      let ax = 0, ay = 0;
      for (let k = 0; k < 4; k++) { ax += Math.cos(a) * 5 + rand(-4, 4); ay += Math.sin(a) * 5 + rand(-4, 4); c.lineTo(ax, ay); }
      c.strokeStyle = '#ffffff'; c.lineWidth = 1; c.stroke();
    }
    c.globalCompositeOperation = 'source-over';
    c.restore();
    c.restore();
    return;
  }
  if (w.energy || w.beam || w.id === 'plasma' || w.id === 'laser' || w.id === 'emerald' || w.id === 'buster') {
    c.save();
    c.translate(x, y);
    c.rotate(inward);

    // Singe entry mark (lubang laser halus lonjong presisi)
    const col = w.color || '#39ff9c';
    c.fillStyle = 'rgba(10, 8, 12, 0.85)';
    c.beginPath();
    c.roundRect(-2, -1, 4, 7, 2);
    c.fill();

    // Hot inner core
    c.fillStyle = '#ffffff';
    c.beginPath();
    c.arc(0, 0, 1.2, 0, TAU);
    c.fill();

    // Radial micro energy singe halo (glow lembut sesuai warna peluru)
    c.strokeStyle = col;
    c.lineWidth = 1.2;
    c.beginPath();
    c.arc(0, 1, 3.5, 0, Math.PI);
    c.stroke();

    // 2 hairline laser cracks yang tajam dan bersih (hanya 2 garis faset pendek 6px)
    c.strokeStyle = 'rgba(255,255,255,0.7)';
    c.lineWidth = 0.8;
    c.beginPath();
    c.moveTo(-2, 0); c.lineTo(-6, 3);
    c.moveTo(2, 0); c.lineTo(6, 3);
    c.stroke();

    c.restore();
    c.restore();
    return;
  }

  if (w.id === 'bamboo') {
    // A modest ring of pale gunpowder/ash; never a giant black blast mark.
    c.save(); c.translate(x - Math.cos(a) * 5, y - Math.sin(a) * 5);
    c.rotate(inward - Math.PI / 2);
    const ash = c.createRadialGradient(0, 4, 1, 0, 4, 16);
    ash.addColorStop(0, 'rgba(255,255,234,0.81)');
    ash.addColorStop(0.55, 'rgba(240,221,164,0.53)');
    ash.addColorStop(1, 'rgba(226,215,186,0)');
    c.fillStyle = ash; c.beginPath(); c.ellipse(0, 4, 16, 11, 0, 0, TAU); c.fill();
    c.strokeStyle = 'rgba(255,248,216,0.91)'; c.lineWidth = 1.2;
    c.beginPath(); c.arc(0, 2, 5, 0, Math.PI * 1.4); c.stroke();
    c.fillStyle = '#f5a345'; c.beginPath(); c.arc(1, 2, 1.4, 0, TAU); c.fill();
    c.restore(); c.restore(); return;
  }

  if (w.id === 'dragon') {
    c.save(); c.translate(x - Math.cos(a) * 5, y - Math.sin(a) * 5);
    c.rotate(inward - Math.PI / 2);
    const ember = c.createRadialGradient(0, 2, 1, 0, 2, 14);
    ember.addColorStop(0, 'rgba(255,224,127,0.83)');
    ember.addColorStop(0.32, 'rgba(228,91,34,0.56)');
    ember.addColorStop(1, 'rgba(105,32,30,0)');
    c.fillStyle = ember; c.beginPath(); c.ellipse(0, 3, 13, 12, 0, 0, TAU); c.fill();
    c.strokeStyle = 'rgba(255,221,126,0.84)'; c.lineWidth = 1.1;
    c.beginPath(); c.moveTo(-5, 4); c.lineTo(-2, 10); c.lineTo(-4, 15);
    c.moveTo(2, 1); c.lineTo(6, 11); c.lineTo(3, 16); c.stroke();
    c.restore(); c.restore(); return;
  }

  // 2. SENJATA TAJAM / SLIT (Pisau, Crossbow, Nail Gun, Kartu, Jarum Sumpit)
  // Menghasilkan sayatan tipis bersih (Clean Blade Slit)
  if (w.half <= 3.2 || w.id === 'bee' || w.id === 'nail' || w.id === 'crossbow' || w.id === 'card' || w.id === 'blowgun' || w.id === 'pencil') {
    c.save();
    c.translate(x, y);
    c.rotate(inward);

    // Sayatan bersih 1 garis dengan bayangan celah tipis
    c.fillStyle = '#0a0808';
    c.beginPath();
    c.roundRect(-1.2, -1, 2.4, 8, 1.2);
    c.fill();

    // Highlight tajam perak
    c.fillStyle = 'rgba(255,255,255,0.85)';
    c.fillRect(-0.4, 0, 0.8, 6);

    c.restore();
    c.restore();
    return;
  }

  // A packed snowball leaves a pale crushed rim and crystalline hairlines,
  // never the dark entry hole of a metal bullet.
  if (w.id === 'snowball') {
    c.save();
    c.translate(x - Math.cos(a) * 6, y - Math.sin(a) * 6);
    c.rotate(a - Math.PI / 2);
    const frost = c.createRadialGradient(0, 0, 1, 0, 0, 17);
    frost.addColorStop(0, 'rgba(255,255,255,0.9)');
    frost.addColorStop(0.52, 'rgba(237,248,251,0.66)');
    frost.addColorStop(1, 'rgba(211,231,238,0)');
    c.fillStyle = frost;
    c.beginPath(); c.ellipse(0, 0, 17, 12, 0, 0, TAU); c.fill();
    c.strokeStyle = 'rgba(241,252,255,0.9)'; c.lineWidth = 1.15;
    c.beginPath();
    c.moveTo(-12, -2); c.lineTo(-7, 1); c.lineTo(-10, 6);
    c.moveTo(2, -9); c.lineTo(1, -3); c.lineTo(7, -1);
    c.moveTo(4, 4); c.lineTo(10, 7); c.lineTo(12, 10);
    c.stroke();
    c.fillStyle = '#ffffff';
    for (const [dx, dy, r] of [[-13, 5, 1.5], [11, -5, 1.6], [5, 11, 1]]) {
      c.beginPath(); c.arc(dx, dy, r, 0, TAU); c.fill();
    }
    c.restore();
    c.restore();
    return;
  }

  // Honey is a permanent glossy puddle on the rotating face. The bead that
  // remains embedded is drawn separately on top of this smear.
  if (w.id === 'honey') {
    c.save(); c.translate(x, y); c.rotate(inward - Math.PI / 2);
    const syrup = c.createRadialGradient(-2, 8, 1, 0, 10, 28);
    syrup.addColorStop(0, 'rgba(255,242,162,0.96)');
    syrup.addColorStop(0.42, 'rgba(247,175,37,0.91)');
    syrup.addColorStop(1, 'rgba(157,82,12,0.55)');
    c.fillStyle = syrup;
    c.beginPath(); c.moveTo(-12, 0);
    c.bezierCurveTo(-16, 5, -9, 10, -9, 16);
    c.quadraticCurveTo(-8, 24, -5, 25);
    c.quadraticCurveTo(-3, 24, -5, 16);
    c.bezierCurveTo(-2, 16, 1, 16, 2, 19);
    c.quadraticCurveTo(4, 29, 6, 26);
    c.quadraticCurveTo(8, 22, 6, 14);
    c.bezierCurveTo(13, 11, 16, 5, 11, 0);
    c.quadraticCurveTo(1, -6, -12, 0); c.fill();
    c.fillStyle = 'rgba(255,200,72,0.82)';
    for (const [dx, dy, size] of [[-15, 10, 2.9], [14, 14, 2.7], [9, 26, 1.8]]) {
      c.beginPath(); c.arc(dx, dy, size, 0, TAU); c.fill();
    }
    c.strokeStyle = 'rgba(255,250,204,0.84)'; c.lineWidth = 1.4;
    c.beginPath(); c.moveTo(-9, 2);
    c.quadraticCurveTo(0, -2, 8, 1); c.stroke();
    c.restore(); c.restore(); return;
  }

  // Water leaves a reflective, translucent wet stain, not three opaque
  // blue circles (or a bullet hole) on the rotating target.
  if (w.id === 'soaker') {
    c.save();
    c.translate(x - Math.cos(a) * 5, y - Math.sin(a) * 5);
    c.rotate(a - Math.PI / 2);
    const wet = c.createRadialGradient(-2, -2, 1, 0, 0, 12);
    wet.addColorStop(0, 'rgba(216,250,255,0.56)');
    wet.addColorStop(0.5, 'rgba(47,181,227,0.34)');
    wet.addColorStop(1, 'rgba(32,146,207,0)');
    c.fillStyle = wet;
    c.beginPath(); c.ellipse(0, 0, 12, 7, 0, 0, TAU); c.fill();
    c.strokeStyle = 'rgba(219,251,255,0.64)'; c.lineWidth = 1.2;
    c.beginPath(); c.ellipse(0, 0, 9, 4, 0, Math.PI * 1.08, Math.PI * 1.93); c.stroke();
    c.fillStyle = 'rgba(55,188,234,0.5)';
    for (const [dx, dy, size] of [[-8, 7, 2], [7, -7, 1.7], [10, 4, 1.2]]) {
      c.beginPath(); c.arc(dx, dy, size, 0, TAU); c.fill();
    }
    c.restore();
    c.restore();
    return;
  }

  // Mashed banana and juice spread from the flesh embedded halfway in the
  // rim. There is no yellow peel on the board: that stays on the launcher.
  if (w.id === 'banana') {
    c.save(); c.translate(x - Math.cos(a) * 4, y - Math.sin(a) * 4);
    c.rotate(inward - Math.PI / 2);
    const juice = c.createRadialGradient(0, 4, 1, 0, 7, 22);
    juice.addColorStop(0, 'rgba(255,253,222,0.92)');
    juice.addColorStop(0.55, 'rgba(248,221,153,0.64)');
    juice.addColorStop(1, 'rgba(225,177,74,0)');
    c.fillStyle = juice; c.beginPath(); c.ellipse(0, 6, 22, 14, 0, 0, TAU); c.fill();
    c.fillStyle = '#fff2ca';
    for (const [dx, dy, rr] of [[-14, 13, 2.6], [12, 17, 3.3], [5, 24, 1.8]]) {
      c.beginPath(); c.arc(dx, dy, rr, 0, TAU); c.fill();
    }
    c.strokeStyle = 'rgba(255,255,245,0.9)'; c.lineWidth = 1.4;
    c.beginPath(); c.moveTo(-10, 2); c.quadraticCurveTo(1, -4, 13, 2); c.stroke();
    c.restore(); c.restore(); return;
  }

  // 3. SENJATA CAIRAN / BUAH / ORGANIK (Fish, Paintball, Coconut)
  if (w.id === 'paintball' || w.id === 'fish' || w.id === 'coconut') {
    c.save();
    c.translate(x, y);
    c.rotate(inward);

    const fluidCol =
      w.id === 'paintball'
        // A paintball carries a random colour per shot; stamping the weapon's
        // fixed white trail left white splats on the wheel instead of paint.
        ? `rgba(${tint || w.trail || '244,63,94'}, 0.75)`
        : 'rgba(56, 189, 248, 0.5)';

    // Splat droplet kental
    c.fillStyle = fluidCol;
    c.beginPath();
    c.arc(0, 3, 4, 0, TAU);
    c.arc(-4, 6, 2, 0, TAU);
    c.arc(3, 7, 2.5, 0, TAU);
    c.fill();

    // Specular glossy reflection
    c.fillStyle = 'rgba(255,255,255,0.7)';
    c.beginPath();
    c.arc(-1, 2, 1.2, 0, TAU);
    c.fill();

    c.restore();
    c.restore();
    return;
  }

  // 4. SENJATA ES (Freeze Ray, Sapphire Shotgun)
  if (w.slow && (w.id === 'freeze' || w.id === 'sapphire')) {
    c.save();
    c.translate(x, y);
    c.rotate(inward);

    // Kristal es 4-sudut bersih berkilau
    c.strokeStyle = 'rgba(255,255,255,0.9)';
    c.lineWidth = 1;
    c.beginPath();
    c.moveTo(0, -2); c.lineTo(0, 8);
    c.moveTo(-4, 3); c.lineTo(4, 3);
    c.moveTo(-3, 1); c.lineTo(3, 5);
    c.moveTo(3, 1); c.lineTo(-3, 5);
    c.stroke();

    c.fillStyle = 'rgba(186, 230, 253, 0.7)';
    c.beginPath();
    c.arc(0, 3, 2, 0, TAU);
    c.fill();

    c.restore();
    c.restore();
    return;
  }

  // 5. SENJATA LEDAKAN BESAR (RPG, Bazooka, Meteor, Pirate, Bamboo)
  if (w.explode || w.id === 'bazooka' || w.id === 'rpg' || w.id === 'meteor' || w.id === 'pirate') {
    c.save();
    c.translate(x, y);
    c.rotate(inward);

    // Bekas gosong ledakan radial halus
    const g = c.createRadialGradient(0, 3, 1, 0, 3, 12);
    g.addColorStop(0, 'rgba(15, 10, 8, 0.85)');
    g.addColorStop(0.5, 'rgba(60, 30, 10, 0.4)');
    g.addColorStop(1, 'rgba(0, 0, 0, 0)');
    c.fillStyle = g;
    c.beginPath();
    c.arc(0, 3, 12, 0, TAU);
    c.fill();

    // Retakan tajam minimalis 3 arah
    c.strokeStyle = 'rgba(15, 10, 8, 0.9)';
    c.lineWidth = 1.4;
    c.beginPath();
    c.moveTo(0, 0); c.lineTo(-5, 9);
    c.moveTo(0, 0); c.lineTo(0, 11);
    c.moveTo(0, 0); c.lineTo(5, 9);
    c.stroke();

    // Hot ember center
    c.fillStyle = '#ff8000';
    c.beginPath();
    c.arc(0, 1, 1.2, 0, TAU);
    c.fill();

    c.restore();
    c.restore();
    return;
  }

  // 6. DEFAULT SENJATA PELURU LOGAM (Pistol, AK-47, Shotgun, Minigun, Sniper, dll.)
  // Lubang peluru berdimensi estetik profesional Knife Hit
  c.save();
  c.translate(x, y);
  c.rotate(inward);

  // Jika di atas irisan jeruk, gunakan warna sari buah/kulit gelap, jika kayu gunakan warna kayu tua
  const darkColor = style === 'orange' ? '#5a2d0c' : '#140c06';

  // A. Soft indentation halo
  c.fillStyle = 'rgba(0,0,0,0.22)';
  c.beginPath();
  c.arc(0, 2, 4.5, 0, TAU);
  c.fill();

  // B. Circular bullet entry hole
  c.fillStyle = darkColor;
  c.beginPath();
  c.arc(0, 1.5, 2.4, 0, TAU);
  c.fill();

  // C. Tiny specular rim highlight di sisi atas
  c.strokeStyle = 'rgba(255, 255, 255, 0.6)';
  c.lineWidth = 0.8;
  c.beginPath();
  c.arc(0, 1.5, 2.2, Math.PI * 0.9, Math.PI * 1.7);
  c.stroke();

  // D. 2 hairline fractures halus (panjang 5-7px, rapi, BUKAN kaki laba-laba)
  c.strokeStyle = darkColor;
  c.lineWidth = 1.1;
  c.beginPath();
  c.moveTo(-1.8, 1);
  c.lineTo(-4.5, 5);
  c.moveTo(1.8, 1);
  c.lineTo(4.5, 5);
  c.stroke();

  c.restore();
  c.restore();
}
