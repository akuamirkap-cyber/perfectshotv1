/** A tiny floating sheet-spirit, not a glowing head with a trailing squiggle. */
export function drawSpiritMote(
  c: CanvasRenderingContext2D, x: number, y: number, size: number, phase: number, alpha = 1,
) {
  if (size <= 0 || alpha <= 0) return;
  c.save();
  c.translate(x, y);
  c.rotate(Math.sin(phase) * 0.12);
  c.scale(size / 12, size / 12);
  c.globalAlpha *= Math.min(1, alpha);

  // A rounded hood and a three-lobed hem read as a ghost even at phone size.
  c.beginPath();
  c.moveTo(-6, 4);
  c.lineTo(-6, -1);
  c.bezierCurveTo(-6, -9, 6, -9, 6, -1);
  c.lineTo(6, 4);
  c.quadraticCurveTo(4.5, 7, 3, 4.5);
  c.quadraticCurveTo(1.5, 7, 0, 4.5);
  c.quadraticCurveTo(-1.5, 7, -3, 4.5);
  c.quadraticCurveTo(-4.5, 7, -6, 4);
  c.closePath();
  c.fillStyle = 'rgba(238,255,255,0.88)';
  c.fill();
  c.strokeStyle = 'rgba(115,225,229,0.75)';
  c.lineWidth = 0.75;
  c.stroke();
  c.fillStyle = 'rgba(24,64,77,0.9)';
  c.beginPath();
  c.ellipse(-2.1, -1.4, 0.85, 1.25, 0, 0, Math.PI * 2);
  c.ellipse(2.1, -1.4, 0.85, 1.25, 0, 0, Math.PI * 2);
  c.fill();
  c.restore();
}
