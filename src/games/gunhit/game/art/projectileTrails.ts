import type { ProjKind } from '../weapons';
import { getGunEffect, hasNoNewShot, isFixedClassicGun, type GunEffect } from './gunVariants';

type C = CanvasRenderingContext2D;

/** Material trails for shots that should not have the ordinary sharp laser wedge. */
export function drawMaterialTrail(c: C, kind: ProjKind, effect: GunEffect = getGunEffect(kind)): boolean {
  if (kind === 'firework' || kind === 'yoyo' || kind === 'keris' || kind === 'bazooka') return true;
  if (kind === 'diamond' && effect !== 'original') return true;
  if (kind === 'gauntlet_cannon') {
    c.save();
    c.globalCompositeOperation = 'lighter';
    // Roaring golden-solar & crimson-plasma thruster jet plume behind the flying Gauntlet
    const plume = c.createLinearGradient(0, 48, 0, 132);
    plume.addColorStop(0, 'rgba(255,255,255,0.92)');
    plume.addColorStop(0.22, 'rgba(254,240,138,0.85)');
    plume.addColorStop(0.55, 'rgba(249,115,22,0.58)');
    plume.addColorStop(1, 'rgba(220,38,38,0)');
    c.fillStyle = plume;
    c.beginPath();
    c.moveTo(-7.5, 50);
    c.bezierCurveTo(-13, 72, -5, 96, 0, 132);
    c.bezierCurveTo(5, 96, 13, 72, 7.5, 50);
    c.closePath();
    c.fill();

    // Supersonic Mach shock-rings along the thruster wake
    c.strokeStyle = 'rgba(254,240,138,0.68)';
    c.lineWidth = 1.6;
    c.beginPath();
    c.ellipse(0, 62, 11, 3.2, 0, 0, Math.PI * 2);
    c.stroke();
    c.strokeStyle = 'rgba(239,68,68,0.48)';
    c.lineWidth = 1.3;
    c.beginPath();
    c.ellipse(0, 82, 8.5, 2.5, 0, 0, Math.PI * 2);
    c.stroke();

    // Trailing golden-crimson ember sparks
    c.fillStyle = '#fef08a';
    for (const [x, y, r] of [[-9, 66, 2.2], [9, 76, 2.0], [-5, 96, 1.7], [4, 110, 1.4]] as const) {
      c.beginPath();
      c.arc(x, y, r, 0, Math.PI * 2);
      c.fill();
    }
    c.restore();
    return true;
  }
  // Classic shots keep the old simple tapered trail. This is strictly visual;
  // it does not alter the projectile's velocity, collision, or embedded depth.
  if (effect === 'original' || isFixedClassicGun(kind) || hasNoNewShot(kind)) return false;
  if (kind === 'golden') {
    c.save(); c.globalCompositeOperation = 'lighter';
    const ribbon = c.createLinearGradient(0, 10, 0, 100);
    ribbon.addColorStop(0, 'rgba(255,241,165,0.8)');
    ribbon.addColorStop(0.5, 'rgba(250,182,52,0.38)');
    ribbon.addColorStop(1, 'rgba(250,182,52,0)');
    c.fillStyle = ribbon; c.beginPath(); c.moveTo(-5, 12);
    c.quadraticCurveTo(-11, 45, -2, 70); c.lineTo(0, 104);
    c.lineTo(2, 70); c.quadraticCurveTo(11, 45, 5, 12);
    c.closePath(); c.fill();
    c.fillStyle = '#fff4b8';
    for (const [x, y, r] of [[-9, 30, 2.3], [8, 49, 2], [-4, 73, 1.5]] as const) {
      c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
    }
    c.restore(); return true;
  }
  if (kind === 'honey') {
    // A slow elastic strand breaking into amber beads, not a laser wedge.
    c.save();
    const syrup = c.createLinearGradient(0, 17, 0, 85);
    syrup.addColorStop(0, 'rgba(255,219,101,0.77)');
    syrup.addColorStop(0.5, 'rgba(218,139,26,0.43)');
    syrup.addColorStop(1, 'rgba(165,89,15,0)');
    c.fillStyle = syrup; c.beginPath(); c.moveTo(-3, 17);
    c.bezierCurveTo(-7, 32, 2, 36, -1, 51);
    c.bezierCurveTo(-4, 65, 2, 69, 0, 85);
    c.bezierCurveTo(4, 68, 0, 57, 3, 47);
    c.bezierCurveTo(7, 33, 3, 25, 3, 17); c.closePath(); c.fill();
    c.fillStyle = '#ffd578';
    for (const [x, y, r] of [[-7, 35, 2.2], [7, 53, 1.7], [2, 73, 1.6]]) {
      c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
    }
    c.restore(); return true;
  }
  if (kind === 'banana') {
    // Flecks of creamy pulp/juice behind the flesh, not a white laser spear
    // or a trail of yellow banana skins (the peel reloads the launcher).
    c.save();
    const juice = c.createLinearGradient(0, 17, 0, 79);
    juice.addColorStop(0, 'rgba(255,248,202,0.68)');
    juice.addColorStop(0.55, 'rgba(248,223,154,0.37)');
    juice.addColorStop(1, 'rgba(248,223,154,0)');
    c.fillStyle = juice; c.beginPath(); c.moveTo(-4, 17);
    c.bezierCurveTo(-7, 34, 2, 38, -2, 57);
    c.quadraticCurveTo(0, 91, 3, 56);
    c.bezierCurveTo(8, 40, 1, 30, 4, 17);
    c.closePath(); c.fill();
    c.fillStyle = '#fff3c4';
    for (const [x, y, r] of [[-7, 33, 2.3], [8, 44, 1.8], [-4, 62, 1.7]]) {
      c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
    }
    c.restore(); return true;
  }
  if (kind === 'moonbeam') {
    c.save();
    const aura = c.createLinearGradient(0, 18, 0, 94);
    aura.addColorStop(0, 'rgba(231,216,255,0.63)');
    aura.addColorStop(0.5, 'rgba(176,149,245,0.30)');
    aura.addColorStop(1, 'rgba(168,126,255,0)');
    c.fillStyle = aura; c.beginPath(); c.moveTo(-8, 17);
    c.bezierCurveTo(-13, 42, -3, 47, -8, 81);
    c.quadraticCurveTo(0, 101, 8, 81);
    c.bezierCurveTo(3, 47, 13, 42, 8, 17); c.closePath(); c.fill();
    c.fillStyle = '#f8f2ff';
    for (const [x, y, r] of [[-8, 27, 3], [10, 43, 3.7], [-6, 62, 2.6], [5, 77, 2.5]]) {
      c.beginPath();
      for (let i = 0; i < 8; i++) {
        const a = i * Math.PI / 4 - Math.PI / 2;
        const radius = i % 2 ? r * 0.3 : r;
        c.lineTo(x + Math.cos(a) * radius, y + Math.sin(a) * radius);
      }
      c.closePath(); c.fill();
    }
    c.restore(); return true;
  }
  if (kind === 'rainbow') {
    c.save(); c.lineCap = 'round';
    const cols = ['#f87171', '#fb923c', '#facc15', '#4ade80', '#60a5fa', '#c084fc'];
    for (let i = 0; i < cols.length; i++) {
      c.globalAlpha = 0.5; c.strokeStyle = cols[i]; c.lineWidth = 2.6;
      c.beginPath(); c.moveTo((i - 2.5) * 2, 25);
      c.bezierCurveTo((i - 2.5) * 2.7, 49, (i - 2.5) * 1.5, 62,
        (i - 2.5) * 0.7, 78); c.stroke();
    }
    c.restore(); return true;
  }
  if (kind === 'dragon' || kind === 'meteor') {
    c.save();
    const ember = c.createLinearGradient(0, 13, 0, 105);
    ember.addColorStop(0, 'rgba(255,239,159,0.73)');
    ember.addColorStop(0.4, 'rgba(251,121,33,0.54)');
    ember.addColorStop(1, 'rgba(220,38,38,0)');
    c.fillStyle = ember; c.beginPath(); c.moveTo(-7, 12);
    c.bezierCurveTo(-14, 32, -3, 47, -8, 77);
    c.quadraticCurveTo(0, 110, 8, 77);
    c.bezierCurveTo(3, 47, 14, 32, 7, 12); c.closePath(); c.fill();
    c.fillStyle = 'rgba(255,215,123,0.74)';
    for (const [x, y, r] of [[-12, 36, 1.8], [10, 59, 1.6], [-4, 84, 1.4]]) {
      c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
    }
    c.restore(); return true;
  }
  if (kind === 'bamboo') {
    // Pale powder/ash blown off a sizzling firecracker rather than the
    // generic bullet's pointed laser cone.
    c.save();
    for (const [x, y, size, opacity] of [[0, 23, 10, 0.36], [5, 38, 13, 0.28], [-6, 57, 11, 0.2], [3, 75, 8, 0.12]]) {
      const ash = c.createRadialGradient(x, y, 0, x, y, size);
      ash.addColorStop(0, `rgba(247,245,235,${opacity})`);
      ash.addColorStop(1, 'rgba(247,245,235,0)');
      c.fillStyle = ash; c.beginPath(); c.arc(x, y, size, 0, Math.PI * 2); c.fill();
    }
    c.fillStyle = '#ffe6a2';
    for (const [x, y, r] of [[-8, 38, 2], [9, 53, 1.4], [-3, 71, 1.1]]) {
      c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
    }
    c.restore(); return true;
  }
  if (kind === 'chicken') {
    c.save(); c.lineCap = 'round';
    const wake = c.createLinearGradient(0, 25, 0, 110);
    wake.addColorStop(0, 'rgba(255,231,135,0.39)');
    wake.addColorStop(1, 'rgba(255,231,135,0)');
    c.strokeStyle = wake;
    for (const side of [-1, 1]) {
      c.lineWidth = 2.3; c.beginPath(); c.moveTo(side * 10, 27);
      c.quadraticCurveTo(side * 20, 47, side * 8, 91); c.stroke();
    }
    c.fillStyle = '#fff2b0';
    for (const [x, y] of [[-17, 45], [16, 60], [-11, 84]]) {
      c.beginPath(); c.arc(x, y, 1.7, 0, Math.PI * 2); c.fill();
    }
    c.restore(); return true;
  }
  if (kind === 'snowball') {
    c.save();
    // A lumpy wake of loose powder, not a solid cone behind the ball.
    for (const [x, y, size, opacity] of [
      [-2, 27, 12, 0.4], [5, 41, 9, 0.31], [-5, 55, 8, 0.23],
      [4, 69, 6, 0.18], [-3, 81, 4, 0.11],
    ]) {
      const puff = c.createRadialGradient(x, y, 0, x, y, size);
      puff.addColorStop(0, `rgba(255,255,255,${opacity})`);
      puff.addColorStop(0.55, `rgba(235,249,255,${opacity * 0.6})`);
      puff.addColorStop(1, 'rgba(235,249,255,0)');
      c.fillStyle = puff;
      c.beginPath(); c.arc(x, y, size, 0, Math.PI * 2); c.fill();
    }
    c.fillStyle = 'rgba(255,255,255,0.8)';
    for (const [x, y, r] of [[-10, 31, 1.6], [9, 42, 1.9], [-7, 63, 1.3], [4, 77, 1]]) {
      c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
    }
    c.restore();
    return true;
  }
  if (kind === 'soaker') {
    c.save();
    // The jet undulates, breaks and recombines like flowing water. There is
    // deliberately no needle-straight white beam or triangular laser tail.
    const water = c.createLinearGradient(0, 17, 0, 72);
    water.addColorStop(0, 'rgba(182,244,255,0.68)');
    water.addColorStop(0.38, 'rgba(64,197,239,0.48)');
    water.addColorStop(1, 'rgba(39,177,227,0)');
    c.fillStyle = water;
    c.beginPath();
    c.moveTo(-3, 18);
    c.bezierCurveTo(-9, 29, -3, 33, -6, 42);
    c.bezierCurveTo(-10, 50, -3, 55, -3, 61);
    c.bezierCurveTo(-3, 68, 0, 73, 2, 69);
    c.bezierCurveTo(4, 59, 9, 53, 5, 45);
    c.bezierCurveTo(3, 37, 9, 28, 4, 18);
    c.closePath(); c.fill();
    c.lineCap = 'round';
    c.strokeStyle = 'rgba(236,254,255,0.7)'; c.lineWidth = 1.3;
    c.beginPath(); c.moveTo(-3, 22);
    c.bezierCurveTo(-8, 31, -3, 34, -5, 42);
    c.bezierCurveTo(-8, 47, -5, 53, -3, 56); c.stroke();
    c.fillStyle = 'rgba(193,248,255,0.74)';
    for (const [x, y, r] of [[-10, 32, 1.5], [9, 39, 2.3], [-8, 56, 1.8], [5, 70, 2.6]]) {
      c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
    }
    c.restore();
    return true;
  }
  return false;
}
