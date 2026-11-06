import { W, H } from './layout';
import { STYLE_COLORS, type Style } from './faces';

/**
 * Gun Hit's stage world, shared by the game and the menu.
 *
 * The menu used to paint a different sky from the one the player lands in, so
 * leaving the cover and starting a run felt like walking into another game.
 * Both now paint the *same* function: the teal forest gradient, the far and
 * near tree trunks, their branches, the bottom grass and the vignette.
 *
 * Every length here is expressed against the portrait stage (420 x 760). The
 * menu is rotated by CSS in landscape exactly like the game canvas is rotated
 * by its world transform, so painting in stage space keeps both orientations
 * identical for free.
 */

/** The forest sky gradient plus its far / near tree silhouettes and branches. */
export function paintStageForest(
  c: CanvasRenderingContext2D,
  style: Style,
  w: number = W,
  h: number = H,
): void {
  const pal = STYLE_COLORS[style] ?? STYLE_COLORS.orange;
    // 1. Gradasi Langit Hutan 2D (+20% lebih cerah khas Knife Hit)
    const bg = c.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, pal.bgTop);
    bg.addColorStop(0.7, pal.bgBot);
    bg.addColorStop(1, '#0d252c');
    c.fillStyle = bg;
    c.fillRect(0, 0, w, h);

    // 2. Siluet Batang Pohon Lapisan Belakang (Far Background Trees - lebih terlihat jelas)
    c.fillStyle = 'rgba(24, 52, 60, 0.65)';
    // Batang pohon jauh 1
    c.beginPath();
    c.moveTo(50, 0); c.lineTo(84, 0); c.lineTo(74, h); c.lineTo(40, h); c.closePath();
    c.fill();
    // Cabang kecil
    c.beginPath();
    c.moveTo(65, 200); c.lineTo(118, 138); c.lineTo(112, 132); c.lineTo(63, 190); c.closePath();
    c.fill();

    // Batang pohon jauh 2
    c.beginPath();
    c.moveTo(330, 0); c.lineTo(370, 0); c.lineTo(354, h); c.lineTo(315, h); c.closePath();
    c.fill();
    c.beginPath();
    c.moveTo(345, 260); c.lineTo(286, 206); c.lineTo(292, 200); c.lineTo(348, 252); c.closePath();
    c.fill();

    // 3. Siluet Batang Pohon Lapisan Depan (Near Foreground Trees - Kiri & Kanan Sesuai Foto 1)
    const nearTree = (x0: number, x1: number, x2: number, x3: number) => {
      const tg = c.createLinearGradient(x0, 0, x1, 0);
      tg.addColorStop(0, 'rgba(14, 34, 40, 0.95)');
      tg.addColorStop(0.5, 'rgba(22, 50, 58, 0.92)');
      tg.addColorStop(1, 'rgba(12, 30, 36, 0.98)');
      c.fillStyle = tg;
      c.beginPath();
      c.moveTo(x0, 0); c.lineTo(x1, 0); c.lineTo(x2, h); c.lineTo(x3, h); c.closePath();
      c.fill();
    };

    // Pohon Kiri Utama
    nearTree(-15, 45, 35, -25);
    // Cabang pohon kiri menjorok ke target
    c.fillStyle = 'rgba(6, 15, 18, 0.95)';
    c.beginPath();
    c.moveTo(30, 120); c.quadraticCurveTo(80, 100, 130, 40); c.lineTo(120, 35); c.quadraticCurveTo(75, 90, 28, 105); c.closePath();
    c.fill();
    c.beginPath();
    c.moveTo(25, 420); c.quadraticCurveTo(70, 390, 115, 350); c.lineTo(110, 345); c.quadraticCurveTo(65, 382, 23, 405); c.closePath();
    c.fill();

    // Pohon Kanan Utama
    nearTree(375, 435, 445, 385);
    // Cabang pohon kanan menjorok ke target
    c.beginPath();
    c.moveTo(390, 150); c.quadraticCurveTo(340, 120, 290, 50); c.lineTo(298, 45); c.quadraticCurveTo(345, 112, 395, 135); c.closePath();
    c.fill();
    c.beginPath();
    c.moveTo(395, 440); c.quadraticCurveTo(350, 410, 300, 370); c.lineTo(306, 364); c.quadraticCurveTo(355, 402, 398, 425); c.closePath();
    c.fill();
}

/** Bottom grass blades; `time` drives the wind sway (0 = a still frame). */
export function paintStageGrass(
  c: CanvasRenderingContext2D,
  time = 0,
  w: number = W,
  h: number = H,
): void {
  c.fillStyle = '#020507';
  c.beginPath();
  c.moveTo(0, h);
  const blades = 28;
  for (let i = 0; i <= blades; i++) {
    const bx = (i / blades) * w;
    const wind = Math.sin(time * 2 + i * 0.5) * 4;
    const hBlade = 22 + (i % 3) * 12 + Math.sin(i * 1.5) * 8;
    c.lineTo(bx - 4, h);
    c.quadraticCurveTo(bx + wind * 0.5, h - hBlade * 0.6, bx + wind, h - hBlade);
    c.quadraticCurveTo(bx + 4 + wind * 0.5, h - hBlade * 0.6, bx + 6, h);
  }
  c.lineTo(w, h);
  c.closePath();
  c.fill();
}

/** A restrained bottom vignette: depth without hiding the lower forest. */
export function paintStageVignette(c: CanvasRenderingContext2D, w: number = W, h: number = H): void {
  const lowerShade = c.createLinearGradient(0, h * 0.48, 0, h);
  lowerShade.addColorStop(0, 'rgba(2, 10, 18, 0)');
  lowerShade.addColorStop(0.58, 'rgba(2, 10, 18, 0.045)');
  lowerShade.addColorStop(1, 'rgba(2, 10, 18, 0.12)');
  c.fillStyle = lowerShade;
  c.fillRect(0, 0, w, h);
}
