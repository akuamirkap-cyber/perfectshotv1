type C = CanvasRenderingContext2D;
const TAU = Math.PI * 2;

/** Visual tether for a travelling BLACK HOLE round; NOT an instant-hit beam. */
export function drawVoidTether(c: C, headX: number, headY: number, baseX: number, baseY: number, t: number) {
  const dy = baseY - headY;
  if (dy < 14) return;
  c.save(); c.globalCompositeOperation = 'lighter';
  const shroud = c.createLinearGradient(headX - 16, 0, headX + 16, 0);
  shroud.addColorStop(0, 'rgba(100,38,176,0)');
  shroud.addColorStop(0.5, 'rgba(168,85,247,0.27)');
  shroud.addColorStop(1, 'rgba(100,38,176,0)');
  c.fillStyle = shroud; c.beginPath();
  c.moveTo(headX - 10, headY + 6); c.lineTo(headX + 10, headY + 6);
  c.lineTo(baseX + 3, baseY); c.lineTo(baseX - 3, baseY); c.closePath(); c.fill();
  c.lineCap = 'round';
  for (const side of [-1, 1]) {
    c.shadowColor = '#bb86fc'; c.shadowBlur = 6;
    c.strokeStyle = side < 0 ? 'rgba(255,219,179,0.67)' : 'rgba(189,132,248,0.83)';
    c.lineWidth = 1.8; c.beginPath();
    for (let i = 0; i <= 22; i++) {
      const k = i / 22, yy = headY + 6 + (dy - 6) * k;
      const x = headX + (baseX - headX) * k
        + side * Math.sin(k * dy * 0.05 + t * 14) * (3.4 + 4 * k);
      if (i === 0) c.moveTo(x, yy); else c.lineTo(x, yy);
    }
    c.stroke();
  }
  c.shadowBlur = 0;
  for (let i = 0; i < 5; i++) {
    const k = (t * 1.7 + i / 5) % 1, y = baseY - k * dy;
    const x = baseX + (headX - baseX) * k + Math.sin(t * 18 + i * 2) * 5;
    c.fillStyle = i % 2 ? '#fff2cf' : '#d8b4fe';
    c.beginPath(); c.ellipse(x, y, 1.6, 3.8, 0, 0, TAU); c.fill();
  }
  c.restore();
}

/** Pre-overhaul straight beam, centered on each real barrel (also for dual guns). */
export function drawClassicBeam(c: C, x: number, hitY: number, gunY: number, alpha: number, rgb: string) {
  const height = gunY - hitY;
  if (height <= 0 || alpha <= 0) return;
  c.save(); c.globalCompositeOperation = 'lighter';
  const width = 14 * alpha + 2;
  const bg = c.createLinearGradient(x - width, 0, x + width, 0);
  bg.addColorStop(0, `rgba(${rgb},0)`);
  bg.addColorStop(0.5, `rgba(${rgb},${alpha * 0.9})`);
  bg.addColorStop(1, `rgba(${rgb},0)`);
  c.fillStyle = bg; c.fillRect(x - width, hitY, width * 2, height);
  c.fillStyle = `rgba(255,255,255,${alpha})`;
  c.fillRect(x - 1.5 * alpha - 0.5, hitY, 3 * alpha + 1, height);
  const halo = c.createRadialGradient(x, hitY, 1, x, hitY, 30);
  halo.addColorStop(0, `rgba(255,255,255,${alpha})`);
  halo.addColorStop(1, `rgba(${rgb},0)`);
  c.fillStyle = halo; c.beginPath(); c.arc(x, hitY, 30, 0, TAU); c.fill();
  c.restore();
}

/** Segmented ruby laser with flickering interferometer filaments and pulses. */
export function drawLaserBeam(c: C, x: number, hitY: number, gunY: number, alpha: number, t: number) {
  const length = Math.max(0, gunY - hitY);
  if (!length || alpha <= 0) return;
  c.save(); c.globalCompositeOperation = 'lighter';
  const field = c.createLinearGradient(x - 23, 0, x + 23, 0);
  field.addColorStop(0, 'rgba(230,28,95,0)');
  field.addColorStop(0.48, `rgba(255,48,104,${alpha * 0.65})`);
  field.addColorStop(0.52, `rgba(255,160,194,${alpha * 0.72})`);
  field.addColorStop(1, 'rgba(230,28,95,0)');
  c.fillStyle = field; c.fillRect(x - 23, hitY, 46, length);
  c.shadowColor = '#ff4b80'; c.shadowBlur = 16;
  c.strokeStyle = `rgba(255,30,100,${alpha * 0.86})`;
  c.lineWidth = 8 * alpha + 2; c.beginPath();
  c.moveTo(x, hitY); c.lineTo(x, gunY); c.stroke();
  c.shadowBlur = 0;
  c.strokeStyle = `rgba(255,239,247,${alpha})`;
  c.lineWidth = Math.max(1.2, alpha * 2.8); c.stroke();
  // Retaining the straight hit scan, chromatic sidebands oscillate around it.
  for (const side of [-1, 1]) {
    c.strokeStyle = side < 0 ? `rgba(255,114,173,${alpha * 0.85})`
      : `rgba(162,229,255,${alpha * 0.61})`;
    c.lineWidth = 1.7; c.beginPath();
    for (let i = 0; i <= 16; i++) {
      const k = i / 16;
      const yy = hitY + length * k;
      const xx = x + side * (6 + Math.sin(k * 13 + t * 26) * 2.5);
      if (i === 0) c.moveTo(xx, yy); else c.lineTo(xx, yy);
    }
    c.stroke();
  }
  // Bright pulses stream toward the hit and make the 0.22s beam feel alive.
  for (let i = 0; i < 7; i++) {
    const k = (t * 4 + i / 7) % 1, yy = gunY - k * length;
    const r = (i % 3 ? 3.3 : 5.6) * (0.4 + alpha * 0.6);
    c.fillStyle = i % 3 ? '#fff5fa' : '#ffe0f0';
    c.beginPath(); c.moveTo(x, yy - r * 2.4); c.lineTo(x + r * 0.35, yy - r * 0.25);
    c.lineTo(x + r, yy); c.lineTo(x + r * 0.35, yy + r * 0.25);
    c.lineTo(x, yy + r * 2.4); c.lineTo(x - r * 0.35, yy + r * 0.25);
    c.lineTo(x - r, yy); c.lineTo(x - r * 0.35, yy - r * 0.25);
    c.closePath(); c.fill();
  }
  const flare = c.createRadialGradient(x, hitY, 1, x, hitY, 24);
  flare.addColorStop(0, `rgba(255,255,255,${alpha})`);
  flare.addColorStop(0.4, `rgba(255,89,142,${alpha * 0.78})`);
  flare.addColorStop(1, 'rgba(255,67,127,0)');
  c.fillStyle = flare; c.beginPath(); c.arc(x, hitY, 24, 0, TAU); c.fill();
  c.restore();
}
