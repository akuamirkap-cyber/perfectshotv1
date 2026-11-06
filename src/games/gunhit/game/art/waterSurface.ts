const TAU = Math.PI * 2;

/** Thin refractive film and moving caustics for the Soaker's wet slowdown. */
export function drawWetSurface(c: CanvasRenderingContext2D, radius: number, time: number, alpha: number) {
  const R = radius;
  c.save();
  c.beginPath(); c.arc(0, 0, R, 0, TAU); c.clip();
  const film = c.createLinearGradient(-R, -R, R, R);
  film.addColorStop(0, `rgba(34,162,224,${0.10 * alpha})`);
  film.addColorStop(0.42, `rgba(204,247,255,${0.16 * alpha})`);
  film.addColorStop(1, `rgba(13,126,200,${0.10 * alpha})`);
  c.fillStyle = film;
  c.fillRect(-R, -R, R * 2, R * 2);

  // Soft travelling highlights follow the wet surface rather than painting a
  // static blue disk or icy spokes across the diamond and stone texture.
  c.lineCap = 'round';
  for (let i = 0; i < 4; i++) {
    const y = (i - 1.5) * R * 0.42 + Math.sin(time * 3 + i * 1.6) * 6;
    c.strokeStyle = `rgba(226,251,255,${(0.12 + i * 0.025) * alpha})`;
    c.lineWidth = 2 + (i % 2);
    c.beginPath();
    c.moveTo(-R, y + 12);
    c.bezierCurveTo(-R * 0.55, y - 13, R * 0.4, y + 17, R, y - 6);
    c.stroke();
  }
  c.restore();

  c.save();
  c.strokeStyle = `rgba(78,202,239,${0.65 * alpha})`;
  c.lineWidth = 2.8;
  c.beginPath();
  for (let i = 0; i <= 64; i++) {
    const a = (i / 64) * TAU;
    const wave = Math.sin(a * 11 - time * 5) * 1.8;
    const r = R - 1 + wave;
    const x = Math.cos(a) * r, y = Math.sin(a) * r;
    if (i === 0) c.moveTo(x, y); else c.lineTo(x, y);
  }
  c.stroke();
  c.strokeStyle = `rgba(232,253,255,${0.55 * alpha})`;
  c.lineWidth = 1.1;
  c.beginPath(); c.arc(0, 0, R - 4, time * 0.4 - 2.3, time * 0.4 - 0.4); c.stroke();

  for (let i = 0; i < 9; i++) {
    const angle = (i / 9) * TAU + time * (i % 2 ? 0.13 : -0.11);
    const r = R * (0.76 + 0.12 * Math.sin(i * 4.2));
    const x = Math.cos(angle) * r, y = Math.sin(angle) * r;
    const size = 2.3 + (i % 3) * 0.6;
    c.fillStyle = `rgba(78,191,233,${0.45 * alpha})`;
    c.beginPath(); c.ellipse(x, y, size, size * 1.4, -angle, 0, TAU); c.fill();
    c.fillStyle = `rgba(238,253,255,${0.75 * alpha})`;
    c.beginPath(); c.arc(x - size * 0.35, y - size * 0.55, 0.85, 0, TAU); c.fill();
  }
  c.restore();
}
