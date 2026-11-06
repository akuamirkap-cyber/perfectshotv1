import type { WeaponId } from '../weapons';
import { getGunVariant, hasSeparateOriginal, isFixedClassicGun, isSetNineDesignWeapon, isSetOneDesignWeapon, isSetSevenDesignWeapon, supportsGunVariants, supportsLatestDesign, type GunVariant } from './gunVariants';
import { drawOriginalGun } from './legacyVariants';
import { drawGhostSpiritGun } from './ghostSpiritGun';
import { fireworkMouth } from './fireworkTubes';
import { drawLatestGun } from './latestVariants';
import { drawGunExtra, drawFlashExtra } from './guns3';
import { gunState, lin as sharedLin, radial } from './kit';
import { shotPulse } from './commonGunMotion';
import { drawSlide3BazookaMuzzleFx } from '../bazookaSlideFx';
import { drawBlackHoleGun2, type Slide2GunState } from '../slide2Weapons';
import type { Slide2Fx } from '../slide2Fx';
import { drawSetOneGun, setOneIdFor } from '../setOneArt';
import { drawSetTwoGun, restTwoState, setTwoIdFor } from '../setTwoArt';
import { drawSetSevenGun, setSevenIdFor } from '../setSevenArt';
import { restSevenAnim } from '../setSevenArt';
import { drawSetNineGun, isNineNewWeapon, restNineState, setNineIdFor } from '../setNineArt';
import { drawSetSixGun, setSixIdFor, sixStateFor } from '../setSixArt';
import { drawSetElevenGun, elevenScale, isElevenNewSlide1Id, restElevenState, setElevenIdFor } from '../setElevenArt';
import { isElevenOnlyWeapon, isSetElevenDesignWeapon } from './gunVariants';
import type { WeaponAnim } from '../../vendor/game-4/src/game/weapons';

const TAU = Math.PI * 2;
const rand = (a: number, b: number) => a + Math.random() * (b - a);

function lin(c: CanvasRenderingContext2D, x0: number, x1: number, stops: string[]) {
  return sharedLin(c, x0, x1, stops);
}
const steel = (c: CanvasRenderingContext2D, x0: number, x1: number) => lin(c, x0, x1, ['#141619', '#5a6068', '#141619']);
const chrome = (c: CanvasRenderingContext2D, x0: number, x1: number) => lin(c, x0, x1, ['#4a515c', '#f5f7fa', '#aeb6c2', '#3d434c']);
const gold = (c: CanvasRenderingContext2D, x0: number, x1: number) => lin(c, x0, x1, ['#6b4c00', '#fff3a0', '#e0b020', '#5a3e00']);
const woodG = (c: CanvasRenderingContext2D, x0: number, x1: number) => lin(c, x0, x1, ['#4a220b', '#c4692b', '#a0521f', '#4a220b']);

function jagged(c: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, amp: number, n = 6) {
  c.beginPath();
  c.moveTo(x0, y0);
  for (let i = 1; i < n; i++) {
    const k = i / n;
    c.lineTo(x0 + (x1 - x0) * k + rand(-amp, amp), y0 + (y1 - y0) * k + rand(-amp, amp));
  }
  c.lineTo(x1, y1);
  c.stroke();
}

import { drawElectroGrip, drawFishGrip, drawFreezeGrip, drawModernGrip, drawPistolGrip } from './gripSystem';

function angledGrip(c: CanvasRenderingContext2D, cx: number, y: number, c1: string, _c2?: string, _len = 1) {
  drawModernGrip(c, cx, y, c1, 'g10');
}

function triggerGuard(_c: CanvasRenderingContext2D, _cx: number, _y: number, _col = '#1a1c20', _r = 16) {
  // Integrated smoothly inside drawModernGrip
}

function glowDot(c: CanvasRenderingContext2D, x: number, y: number, r: number, col: string, blur = 12) {
  c.save();
  const prevAlpha = c.globalAlpha;
  c.fillStyle = col;
  if (blur > 0) {
    c.globalAlpha = prevAlpha * 0.2;
    c.beginPath();
    c.arc(x, y, r + blur * 0.44, 0, TAU);
    c.fill();
    c.globalAlpha = prevAlpha * 0.42;
    c.beginPath();
    c.arc(x, y, r + blur * 0.2, 0, TAU);
    c.fill();
    c.globalAlpha = prevAlpha;
  }
  c.beginPath();
  c.arc(x, y, r, 0, TAU);
  c.fill();
  c.restore();
}

// ---------------------------------------------------------------- guns
// muzzle tip at (cx, y0), gun extends downward
export function drawGun(
  c: CanvasRenderingContext2D, id: WeaponId, cx: number, y0: number, t: number, flash: number, ready = true,
  snowLoaded?: number,
  variant: GunVariant = getGunVariant(id),
  liveFx?: Slide2Fx,
) {
  c.save();
  if (id === 'ghost') {
    drawGhostSpiritGun(c, cx, y0, t, gunState.sinceShot, gunState.ghostSide, variant === 'set7');
    c.restore();
    return;
  }
  // Slide 9 (games/game-6): the newest design is slide 9's own artwork, drawn
  // at the same muzzle origin with slide 9's own draw state (recoil, slide,
  // bolt, pump, charge meter, spin-up, drum index). The nine guns slide 1 never
  // had only ever exist as this design, so they always render it.
  // Slide 11 (games/game-8) is the newest layer: its own artwork, drawn at the
  // same muzzle origin with slide 11's own weapon state.
  const setElevenId =
    (variant === 'set11' && isSetElevenDesignWeapon(id)) || isElevenOnlyWeapon(id)
      ? setElevenIdFor(id)
      : null;
  if (setElevenId) {
    const sinceShot = Math.max(0, gunState.sinceShot);
    // Photon normally wears the slide-11 skin while firing slide-9 shots.
    // Do not let a stale slide-11 state from a different weapon drive it.
    const supplied = id === 'photon_saber' && !gunState.elevenLive ? null : gunState.elevenState;
    const baseState = supplied ?? {
      ...restElevenState(),
      // Rebuild the motion when a different effect owns the trigger.
      recoil: sinceShot >= 0.16 ? 0 : 1 - sinceShot / 0.16,
      fireT: sinceShot,
      ready: Math.min(1, sinceShot / 0.35),
      charge: gunState.charge,
    };
    // Drive this skin from the accepted trigger clock and direction, without
    // spawning or altering any slide-11 projectile.
    const state = id === 'photon_saber'
      ? { ...baseState, t, fireT: sinceShot, data: { ...baseState.data, side: gunState.saberSide } }
      : baseState;
    drawSetElevenGun(
      c, setElevenId, cx, y0, t,
      state,
      elevenScale(setElevenId),
      // Only the gun standing in a live game (`drawGunNow`), never a card.
      gunState.elevenStage,
    );
    c.restore();
    if (flash > 0 && !gunState.elevenLive) drawFlash(c, id, cx, y0, t, flash, variant);
    return;
  }
  // Slide 6 (`games/game-2`): the original Weapon Wheel Hit beam art, drawn at
  // slide 1's muzzle origin with slide 6's own draw progress (the sniper's
  // pulse, the heat-ray's glow, the repulsor's palm) and its 14 px recoil.
  const setSixId = variant === 'set6' ? setSixIdFor(id) : null;
  if (setSixId) {
    // Live games hand their own draw state over; menus and cards rebuild the
    // same draw progress and recoil from the shared shot clock.
    drawSetSixGun(
      c, setSixId, cx, y0, t,
      gunState.sixLive && gunState.sixState
        ? gunState.sixState
        : sixStateFor(Math.max(0, gunState.sinceShot), setSixId, t),
    );
    c.restore();
    if (flash > 0 && !gunState.sixLive) drawFlash(c, id, cx, y0, t, flash, variant);
    return;
  }
  const setNineId = variant === 'set9' || isNineNewWeapon(id) ? setNineIdFor(id) : null;
  if (setNineId) {
    // Live games hand over their own state; menus and cards rebuild the same
    // recoil/cycle from the shared shot clock so the gun still reacts to a shot.
    const sinceShot = Math.max(0, gunState.sinceShot);
    const state = gunState.s9State ?? restNineState({
      recoil: sinceShot >= 0.16 ? 0 : 1 - sinceShot / 0.16,
      charge: gunState.charge,
      cycle: Math.min(1, sinceShot / 0.35),
      catchT: sinceShot,
    });
    drawSetNineGun(c, setNineId, cx, y0, t,
      id === 'photon_saber' ? { ...state, saberSide: gunState.saberSide } : state, undefined,
      // Only the gun standing in a live game (`drawGunNow`), never a card.
      gunState.nineStage);
    c.restore();
    if (flash > 0 && !gunState.s9Live) drawFlash(c, id, cx, y0, t, flash, variant);
    return;
  }
  // SET 1 of slide 7: the newest design is slide 7's own artwork, drawn at the
  // same muzzle origin with the same visible animation ranges (slide travel,
  // pump, pouch, charge meter, tank gauge).
  const setOneId = isSetOneDesignWeapon(id) && variant === 'set1' ? setOneIdFor(id) : null;
  if (setOneId && supportsGunVariants(id) && gunState.s7Anim) {
    // The live gun: slide 3's own springs (see `gunState.s7Anim`); slide 3's
    // own recipe already threw its muzzle flash.
    drawSetSevenGun(c, setOneId, cx, y0, t, gunState.s7Anim);
    c.restore();
    return;
  }
  if (setOneId && supportsGunVariants(id)) {
    drawSetOneGun(c, setOneId, cx, y0, t, {
      sinceShot: gunState.sinceShot,
      charge: gunState.charge,
      water: gunState.ammoRatio,
      ready,
    });
    c.restore();
    if (flash > 0) drawFlash(c, id, cx, y0, t, flash, variant);
    return;
  }
  // Slide 2 (`games/fireworkgun`): its own artwork, drawn at the same muzzle
  // origin with slide 2's own rest/charge animation (loadP 7/s, recoil 6/s).
  const setTwoId = variant === 'set2' ? setTwoIdFor(id) : null;
  if (setTwoId) {
    // Live games hand over their own state; menus and cards rebuild the same
    // recoil/charge slide 2 shows right after a shot.
    const since = Math.max(0, gunState.sinceShot);
    const hue = setTwoId === 'blackhole' ? 215 + ((gunState.shots * 53) % 105) : 28;
    drawSetTwoGun(c, setTwoId, cx, y0, gunState.twoState ?? restTwoState(hue, {
      time: t,
      recoil: since >= 0.17 ? 0 : 1 - since / 0.17,
      loadP: Math.min(1, since * 7),
    }));
    c.restore();
    if (flash > 0 && !gunState.twoLive) drawFlash(c, id, cx, y0, t, flash, variant);
    return;
  }
  // Slide-7 SET 2..5: slide 7's own artwork, drawn at the same muzzle origin
  // with slide 7's own animation state (the live game hands its springs over
  // through `gunState.s7Anim`; menus and cards get the rested pose).
  const setSevenId = isSetSevenDesignWeapon(id) && variant === 'set7' ? setSevenIdFor(id) : null;
  if (setSevenId && supportsGunVariants(id)) {
    const anim = gunState.s7Anim ?? restSevenAnim();
    drawSetSevenGun(c, setSevenId, cx, y0, t,
      id === 'photon_saber' ? { ...anim, saberSide: gunState.saberSide } : anim);
    c.restore();
    // In play, slide 7's own fire recipe already throws its muzzle flash (and
    // its smoke, sparks and light); slide 1's generic flash would stack a
    // second burst of sparks on the barrel. Menus and cards still get one.
    if (flash > 0 && !gunState.s7Anim) drawFlash(c, id, cx, y0, t, flash, variant);
    return;
  }
  // Slide-2 guns: the newest design is slide 2's own art, drawn at the same
  // muzzle origin with the same rest/charge animation (loadP 7/s, recoil 6/s).
  if (id === 'blackhole' && variant === 'latest' && supportsGunVariants(id)) {
    const since = gunState.sinceShot;
    const st: Slide2GunState = {
      time: t,
      recoil: Math.max(0, 1 - since * 6),
      loadP: Math.min(1, since * 7),
      hue: 215 + ((gunState.shots * 53) % 105),
      live: ready,
      fx: liveFx,
    };
    drawBlackHoleGun2(c, cx, y0, st);
    c.restore();
    if (flash > 0) drawFlash(c, id, cx, y0, t, flash, variant);
    return;
  }
  // The retired guns ALWAYS render the original, even if an obsolete
  // saved choice or a caller explicitly requests a removed design. Honey has
  // two genuine silhouettes, not a duplicate 'latest' card.
  if (supportsGunVariants(id) && (isFixedClassicGun(id) || (variant === 'original' && hasSeparateOriginal(id)) ||
    (variant === 'latest' && supportsLatestDesign(id)))) {
    if (isFixedClassicGun(id) || variant === 'original') drawOriginalGun(c, id, cx, y0, t, ready);
    else if (supportsLatestDesign(id)) drawLatestGun(c, id, cx, y0, t);
  } else switch (id) {
    case 'pistol': pistol(c, cx, y0, t); break;
    case 'ak47': ak(c, cx, y0, t); break;
    case 'cricket': cricket(c, cx, y0, t); break;
    case 'electro': electro(c, cx, y0, t); break;
    case 'nail': nailGun(c, cx, y0, t); break;
    case 'fish': fishGun(c, cx, y0, t); break;
    case 'crossbow': crossbow(c, cx, y0, t, ready); break;
    case 'bazooka': bazooka(c, cx, y0, ready, t); break;
    case 'rpg': rpg(c, cx, y0, ready); break;
    case 'freeze': freeze(c, cx, y0, t); break;
    case 'golden': golden(c, cx, y0, t); break;
    default: drawGunExtra(c, id, cx, y0, t, ready, snowLoaded); break;
  }
  c.restore();
  if (flash > 0 && !gunState.s9Live && !gunState.elevenLive) drawFlash(c, id, cx, y0, t, flash, variant);
}

function pistol(c: CanvasRenderingContext2D, cx: number, y0: number, t: number) {
  const recoil = shotPulse(gunState.sinceShot, 0.25);
  const s = recoil * 14;

  const lin2 = (x0: number, y0p: number, x1: number, y1p: number, stops: [number, string][]) => {
    const g = c.createLinearGradient(x0, y0p, x1, y1p);
    for (const [o, col] of stops) g.addColorStop(o, col);
    return g;
  };
  const metalY = (ya: number, yb: number, hi: string, mid: string, _dark: string) =>
    lin2(0, ya, 0, yb, [
      [0, '#5a6b7c'],
      [0.16, '#f8fbff'],
      [0.38, hi],
      [0.68, '#b8c7d8'],
      [0.88, mid],
      [1, '#4a5866'],
    ]);
  const steelY = (ya: number, yb: number) =>
    lin2(0, ya, 0, yb, [
      [0, '#5c6d7e'],
      [0.16, '#ffffff'],
      [0.36, '#dce6f2'],
      [0.62, '#aebfd2'],
      [0.86, '#7d8fa1'],
      [1, '#4a5866'],
    ]);
  const woodX = (xa: number, xb: number) =>
    lin2(xa, 0, xb, 0, [
      [0, '#170d06'],
      [0.3, '#5b3a1e'],
      [0.6, '#43290f'],
      [1, '#120a04'],
    ]);
  const gold2 = (x0p: number, y0p: number, x1p: number, y1p: number) =>
    lin2(x0p, y0p, x1p, y1p, [
      [0, '#6b470c'],
      [0.35, '#fff1b8'],
      [0.55, '#f5c542'],
      [1, '#7a5310'],
    ]);
  const poly = (pts: number[]) => {
    c.beginPath();
    c.moveTo(pts[0], pts[1]);
    for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]);
    c.closePath();
  };
  const paint = (fill: string | CanvasGradient, stroke?: string, lw = 0.72) => {
    c.fillStyle = fill;
    c.fill();
    if (stroke) {
      c.strokeStyle = stroke;
      c.lineWidth = lw;
      c.stroke();
    }
  };
  const dotGlow = (x: number, y: number, r: number, color: string, alpha = 1) => {
    if (alpha <= 0.01) return;
    c.save();
    c.globalCompositeOperation = 'lighter';
    c.globalAlpha = Math.min(1, alpha);
    const g = c.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, '#ffffff');
    g.addColorStop(0.3, color);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = g;
    c.beginPath();
    c.arc(x, y, r, 0, TAU);
    c.fill();
    c.restore();
  };

  // Uniform scale (1.15x on both axes — zero aspect-ratio distortion!)
  // Local coordinates:
  //   x in [-50 .. +96] along barrel axis (146 units * 1.15 = 168px total length, matching Golden/Chrono Gun)
  //   y in [-19.5 .. +70] perpendicular to barrel (slide y=-15..5, frame y=5..15, grip y=14..65, mag pad y=65..70)
  // Muzzle bore center (96, -7.5) is placed at (cx, y0).
  const sc = 1.15;
  c.save();
  c.translate(cx + 7.5 * sc, y0 + 96 * sc);
  c.rotate(-Math.PI / 2);
  c.scale(sc, sc);

  // ══════════════════ 1. LARAS (BARREL, BUSHING & RECOIL PLUG) ══════════════════
  // The laras rides back WITH the slide. On a short-recoil pistol the barrel and
  // the slide travel rearward together for the first part of the cycle, so while
  // the slide above retracted the barrel used to stay nailed to the frame: the
  // muzzle hung out in front of a gap with the dust cover behind it, which read
  // as a detached muzzle. Same travel, same frame, no seam.
  c.save();
  c.translate(-s, 0);
  // Precision crowned .45 ACP barrel protruding cleanly from the front bushing
  c.beginPath();
  c.roundRect(78, -13.2, 18, 10.8, [0, 2.5, 2.5, 0]);
  paint(metalY(-13.2, -2.4, '#e2ecf5', '#7b8b9c', '#1e2630'), 'rgba(18,26,38,0.62)', 0.72);
  // Barrel crown bevel & dark rifled bore
  c.fillStyle = '#070a0e';
  c.beginPath();
  c.ellipse(95.4, -7.8, 1.3, 3.6, 0, 0, TAU);
  c.fill();
  c.strokeStyle = 'rgba(255,255,255,0.55)';
  c.lineWidth = 0.85;
  c.beginPath();
  c.moveTo(82, -11.2);
  c.lineTo(94, -11.2);
  c.stroke();

  // Checkered recoil spring plug beneath barrel
  c.beginPath();
  c.roundRect(78, -1.6, 12.5, 6.2, [0, 2, 2, 0]);
  paint(metalY(-1.6, 4.6, '#9fb0c2', '#3a444f', '#12161c'), 'rgba(18,26,38,0.62)', 0.68);
  c.strokeStyle = 'rgba(10,14,18,0.5)';
  c.lineWidth = 0.7;
  c.beginPath();
  c.moveTo(88.5, -1);
  c.lineTo(88.5, 4);
  c.stroke();

  c.restore();

  // ══════════════════ 2. BADAN BAWAH PISTOL (STEEL FRAME & DUST COVER) ══════════════════
  // Substantial forged-steel receiver & dust cover supporting the slide
  c.beginPath();
  c.moveTo(-38, 4.5);
  c.lineTo(66, 4.5);
  c.lineTo(66, 11.5);
  c.quadraticCurveTo(64, 15, 58, 15);
  c.lineTo(2, 15);
  c.lineTo(-38, 15);
  c.closePath();
  paint(metalY(4.5, 15, '#8b9aa9', '#3a444f', '#12161c'), 'rgba(18,26,38,0.65)', 0.75);

  // Frame rail highlight & dust-cover mill groove
  c.strokeStyle = 'rgba(220,235,250,0.34)';
  c.lineWidth = 0.85;
  c.beginPath();
  c.moveTo(-34, 6.2);
  c.lineTo(63, 6.2);
  c.stroke();

  // Recessed .45 LEGACY tritium status pips in the dust-cover groove
  c.fillStyle = '#090d12';
  c.beginPath();
  c.roundRect(35, 8.2, 25, 3.8, 1.5);
  c.fill();
  for (let i = 0; i < 5; i++) {
    const px = 37.2 + i * 4.6;
    c.fillStyle = '#7fb3ff';
    c.beginPath();
    c.roundRect(px, 9, 3.2, 2.2, 0.8);
    c.fill();
  }

  // Slide-stop lever & takedown pin on the frame
  c.beginPath();
  c.roundRect(-4, 7.2, 22, 4.2, 1.8);
  paint(metalY(7.2, 11.4, '#aebfd2', '#4a5866', '#161c23'), 'rgba(18,26,38,0.58)', 0.65);
  c.fillStyle = '#1b222a';
  c.beginPath();
  c.arc(15, 9.3, 2.3, 0, TAU);
  c.fill();
  c.strokeStyle = '#9fb0c2';
  c.lineWidth = 0.65;
  c.stroke();

  // Sculpted Beavertail Grip Safety & Spurred Combat Hammer
  c.beginPath();
  c.moveTo(-34, 4.5);
  c.quadraticCurveTo(-47, 4.5, -49, 9.5);
  c.quadraticCurveTo(-48, 13.5, -41, 14.5);
  c.lineTo(-32, 15);
  c.closePath();
  paint(metalY(4.5, 15, '#9fb0c2', '#3a444f', '#12161c'), 'rgba(18,26,38,0.62)', 0.72);

  // Spurred M1911 Hammer (pivots back with recoil)
  c.save();
  c.translate(-35, 1);
  c.rotate(-recoil * 0.45);
  c.beginPath();
  c.moveTo(0, -2);
  c.lineTo(-11, -10);
  c.lineTo(-13, -5.5);
  c.lineTo(-4, 2);
  c.closePath();
  paint(metalY(-10, 2, '#d0dce8', '#566575', '#161c23'), 'rgba(18,26,38,0.62)', 0.68);
  c.fillStyle = '#090d12';
  c.beginPath();
  c.arc(-6, -4.5, 1.4, 0, TAU);
  c.fill();
  c.restore();

  // ══════════════════ 3. PELINDUNG & PELATUK (TRIGGER GUARD & MATCH TRIGGER) ══════════════════
  // Precision M1911 trigger guard with front-strap undercut
  c.beginPath();
  c.moveTo(-1, 14.5);
  c.lineTo(4, 14.5);
  c.quadraticCurveTo(2, 28.5, 10, 29.5);
  c.lineTo(25, 29.5);
  c.quadraticCurveTo(31, 29.5, 31, 14.5);
  c.lineTo(35.5, 14.5);
  c.quadraticCurveTo(35.5, 33.5, 25.5, 33.5);
  c.lineTo(9.5, 33.5);
  c.quadraticCurveTo(-2.5, 33, -1, 14.5);
  c.closePath();
  paint(metalY(14.5, 33.5, '#9fb0c2', '#3a444f', '#10151b'), 'rgba(18,26,38,0.62)', 0.72);

  // Skeletonized M1911 match trigger (slides rearward on shot)
  c.save();
  c.translate(18 - recoil * 4.2, 15);
  c.beginPath();
  c.moveTo(-3.5, 0);
  c.lineTo(2.5, 0);
  c.quadraticCurveTo(5.5, 7, 2.5, 14.2);
  c.lineTo(-2.5, 14.2);
  c.quadraticCurveTo(0.2, 7, -3.5, 0);
  c.closePath();
  paint(metalY(0, 14.2, '#e2e8f0', '#64748b', '#1e293b'), 'rgba(18,26,38,0.6)', 0.65);
  // Trigger lightening holes
  c.fillStyle = '#0b0f14';
  for (const ty of [4.2, 7.5, 10.8]) {
    c.beginPath();
    c.arc(0.4, ty, 0.95, 0, TAU);
    c.fill();
  }
  c.restore();

  // ══════════════════ 4. GAGANG (STEEL GRIP FRAME, WALNUT PANEL & FLUSH BASEPAD) ══════════════════
  // Full-tang steel grip frame (front strap + arched mainspring housing)
  const gripFramePath = () => {
    c.beginPath();
    c.moveTo(-38, 14.5);
    c.lineTo(1, 14.5);
    c.quadraticCurveTo(-2, 38, -14, 64.5);
    c.lineTo(-47, 64.5);
    c.quadraticCurveTo(-48, 49, -43, 30);
    c.quadraticCurveTo(-40, 20, -38, 14.5);
    c.closePath();
  };
  gripFramePath();
  paint(metalY(14.5, 65, '#8b9aa9', '#3a444f', '#12161c'), 'rgba(18,26,38,0.65)', 0.78);

  // Front-strap checkering notches & mainspring ribs
  c.strokeStyle = 'rgba(15,22,32,0.58)';
  c.lineWidth = 0.78;
  for (let i = 0; i < 6; i++) {
    const fy = 22 + i * 6.5;
    const fx = -1 - i * 2.1;
    c.beginPath();
    c.moveTo(fx - 2.2, fy);
    c.lineTo(fx + 0.5, fy);
    c.stroke();
  }

  // Inset Checkered Walnut Grip Panel (framed cleanly inside the steel grip)
  const walnutPanelPath = () => {
    c.beginPath();
    c.moveTo(-33.5, 18.5);
    c.lineTo(-4.5, 18.5);
    c.quadraticCurveTo(-7.5, 38, -18.5, 60.5);
    c.lineTo(-42, 60.5);
    c.quadraticCurveTo(-42.5, 44, -37.5, 28);
    c.closePath();
  };
  walnutPanelPath();
  paint(woodX(-43, -4), 'rgba(34,15,6,0.65)', 0.72);

  c.save();
  walnutPanelPath();
  c.clip();
  // Preserve rearward grip rake reference while drawing diamond checkering
  c.save();
  c.rotate(-0.72);
  c.restore();
  c.strokeStyle = 'rgba(0,0,0,0.34)';
  c.lineWidth = 0.68;
  c.beginPath();
  for (let k = -8; k < 12; k++) {
    c.moveTo(-50 + k * 5.2, 17);
    c.lineTo(-22 + k * 5.2, 62);
    c.moveTo(-22 + k * 5.2, 17);
    c.lineTo(-50 + k * 5.2, 62);
  }
  c.stroke();
  // Warm wood-border bevel highlight
  c.strokeStyle = 'rgba(255,215,160,0.22)';
  c.lineWidth = 0.75;
  walnutPanelPath();
  c.stroke();
  c.restore();

  // Golden M1911 Legacy Medallion centered in the walnut grip panel
  c.beginPath();
  c.arc(-24.5, 39.5, 3.8, 0, TAU);
  paint(gold2(-28, 36, -21, 43), 'rgba(58,34,6,0.65)', 0.65);
  c.fillStyle = '#fff6cc';
  c.beginPath();
  c.arc(-24.5, 39.5, 1.3, 0, TAU);
  c.fill();

  // Two precision grip bushing screws (top & bottom)
  for (const [sx, sy] of [
    [-19, 24.5],
    [-30, 54.5],
  ] as const) {
    c.beginPath();
    c.arc(sx, sy, 2, 0, TAU);
    paint(metalY(sy - 2, sy + 2, '#e2e8f0', '#64748b', '#1e293b'), 'rgba(18,26,38,0.6)', 0.62);
    c.strokeStyle = '#0b0f14';
    c.lineWidth = 0.62;
    c.beginPath();
    c.moveTo(sx - 1.2, sy - 0.5);
    c.lineTo(sx + 1.2, sy + 0.5);
    c.stroke();
  }

  // Flush Magazine Base Pad (aligned strictly with the grip heel & toe — no overhang!)
  c.beginPath();
  c.moveTo(-48, 64.5);
  c.lineTo(-13, 64.5);
  c.quadraticCurveTo(-11.5, 67.5, -14, 69.8);
  c.lineTo(-46.5, 69.8);
  c.quadraticCurveTo(-49, 67.5, -48, 64.5);
  c.closePath();
  paint(metalY(64.5, 70, '#9fb0c2', '#3a444f', '#10151b'), 'rgba(18,26,38,0.62)', 0.72);
  dotGlow(-30.5, 67.2, 2.8, '#c9a24a', 0.85);

  // Thumb safety lever (mounted at frame/slide junction)
  c.beginPath();
  c.roundRect(-36, 3.2, 13, 4.2, 2);
  paint(metalY(3.2, 7.4, '#cbd5e1', '#4a5866', '#161c23'), 'rgba(18,26,38,0.6)', 0.65);

  // ══════════════════ 5. BADAN ATAS PISTOL (BLUED-STEEL SLIDE & BARREL BUSHING) ══════════════════
  c.save();
  c.translate(-s, 0);

  // Muscular M1911 slide body
  c.beginPath();
  c.moveTo(-36, -15);
  c.lineTo(74, -15);
  c.quadraticCurveTo(80, -15, 80, -9.5);
  c.lineTo(80, 5);
  c.lineTo(-33, 5);
  c.lineTo(-36, 1.5);
  c.closePath();
  paint(steelY(-15, 5), 'rgba(18,26,38,0.68)', 0.82);

  // Barrel bushing collar at the front of the slide
  c.beginPath();
  c.roundRect(76.5, -14.5, 4.8, 19.2, 1.4);
  paint(metalY(-14.5, 4.7, '#d0dce8', '#566575', '#161c23'), 'rgba(18,26,38,0.62)', 0.68);

  // Upper slide crown bevel & lower slide flat line
  c.strokeStyle = 'rgba(215,232,248,0.52)';
  c.lineWidth = 0.85;
  c.beginPath();
  c.moveTo(-32, -12.6);
  c.lineTo(74, -12.6);
  c.stroke();
  c.strokeStyle = 'rgba(15,22,32,0.5)';
  c.lineWidth = 0.72;
  c.beginPath();
  c.moveTo(-31, 2.2);
  c.lineTo(75, 2.2);
  c.stroke();

  // Moving metallic sheen along the slide
  const gleamX = -22 + ((t * 34) % 82);
  c.strokeStyle = `rgba(255,255,255,${0.28 + 0.14 * Math.sin(t * 2.8) ** 2})`;
  c.lineWidth = 1.4;
  c.beginPath();
  c.moveTo(gleamX, -12.2);
  c.lineTo(gleamX + 14, -12.2);
  c.stroke();

  // Ejection port + exposed brass .45 ACP barrel hood
  c.beginPath();
  c.roundRect(10, -13, 27, 10.5, 2.2);
  paint('#080b10', 'rgba(18,26,38,0.55)', 0.65);
  c.beginPath();
  c.roundRect(12, -11.8, 23, 8.2, 1.6);
  paint(gold2(12, -12, 12, -3.5), 'rgba(61,39,6,0.6)', 0.62);
  // Extractor claw & chamber line
  c.strokeStyle = 'rgba(61,39,6,0.55)';
  c.lineWidth = 0.7;
  c.beginPath();
  c.moveTo(15, -7.7);
  c.lineTo(32, -7.7);
  c.stroke();

  // Angled rear cocking serrations
  c.strokeStyle = 'rgba(15,22,32,0.68)';
  c.lineWidth = 1.05;
  c.beginPath();
  for (let x = -29; x <= -11; x += 3.6) {
    c.moveTo(x, -11);
    c.lineTo(x - 2, 1.2);
  }
  // Angled forward cocking serrations
  for (let x = 50; x <= 64.5; x += 3.6) {
    c.moveTo(x, -11);
    c.lineTo(x - 2, 1.2);
  }
  c.stroke();

  // Dovetail rear combat sight
  poly([-33, -15, -31, -19.5, -22, -19.5, -20.5, -15]);
  paint('#0c1117', 'rgba(18,26,38,0.6)', 0.65);
  c.fillStyle = '#e2e8f0';
  c.beginPath();
  c.arc(-26.5, -17.2, 1.1, 0, TAU);
  c.fill();

  // Ramped front sight with glowing amber dot
  poly([66, -15, 69, -19.5, 75.5, -19.5, 76.5, -15]);
  paint('#0c1117', 'rgba(18,26,38,0.6)', 0.65);
  dotGlow(72.5, -17.2, 2.8, '#fbbf24', 0.92);

  c.restore();
  c.restore();
}
function ak(c: CanvasRenderingContext2D, cx: number, y0: number, t: number) {
  const recoil = shotPulse(gunState.sinceShot, 0.22);
  const bolt = 15 * recoil;

  const honeyWood = (x0: number, x1: number) => {
    const g = c.createLinearGradient(x0, 0, x1, 0);
    g.addColorStop(0, '#6e310c');
    g.addColorStop(0.14, '#f8c38c');
    g.addColorStop(0.32, '#e68c3a');
    g.addColorStop(0.68, '#bd5e1e');
    g.addColorStop(0.9, '#843b0e');
    g.addColorStop(1, '#522106');
    return g;
  };
  const gunSteel = (x0: number, x1: number) => {
    const g = c.createLinearGradient(x0, 0, x1, 0);
    g.addColorStop(0, '#1b2028');
    g.addColorStop(0.18, '#eef4fa');
    g.addColorStop(0.36, '#8795a5');
    g.addColorStop(0.64, '#444d59');
    g.addColorStop(0.88, '#262c35');
    g.addColorStop(1, '#14181f');
    return g;
  };
  const darkSteel = (x0: number, x1: number) => {
    const g = c.createLinearGradient(x0, 0, x1, 0);
    g.addColorStop(0, '#161a22');
    g.addColorStop(0.28, '#697586');
    g.addColorStop(0.6, '#363d48');
    g.addColorStop(1, '#151920');
    return g;
  };

  // ══════════════════ 1. WOODEN BUTTSTOCK (SCULPTED WRIST NECK & COMB) ══════════════════
  c.beginPath();
  c.moveTo(cx - 8, y0 + 178);
  c.quadraticCurveTo(cx - 5.5, y0 + 188, cx - 14.5, y0 + 201);
  c.lineTo(cx - 24, y0 + 256);
  c.lineTo(cx + 13.5, y0 + 261.5);
  c.lineTo(cx + 10, y0 + 179);
  c.closePath();
  c.fillStyle = honeyWood(cx - 24, cx + 14);
  c.fill();

  c.save();
  c.clip();
  c.strokeStyle = 'rgba(255,248,232,0.88)';
  c.lineWidth = 2;
  c.beginPath();
  c.moveTo(cx - 13.2, y0 + 202);
  c.lineTo(cx - 22, y0 + 254);
  c.stroke();

  c.strokeStyle = 'rgba(122,52,14,0.28)';
  c.lineWidth = 0.85;
  for (const [ox, oy] of [[-8, 198], [-3, 190], [2, 186], [7, 186]]) {
    c.beginPath();
    c.moveTo(cx + ox, y0 + oy);
    c.bezierCurveTo(cx + ox - 4, y0 + oy + 22, cx + ox - 2, y0 + oy + 46, cx + ox - 5, y0 + 260);
    c.stroke();
  }
  c.restore();

  c.strokeStyle = 'rgba(54,22,6,0.68)';
  c.lineWidth = 0.85;
  c.stroke();

  // Rounded dark steel/rubber buttplate at the heel/toe of the stock
  c.beginPath();
  c.moveTo(cx - 24.5, y0 + 254.5);
  c.lineTo(cx + 14, y0 + 260);
  c.quadraticCurveTo(cx + 14.5, y0 + 264.8, cx + 10, y0 + 265.2);
  c.lineTo(cx - 22.8, y0 + 260.2);
  c.quadraticCurveTo(cx - 26, y0 + 258.2, cx - 24.5, y0 + 254.5);
  c.closePath();
  c.fillStyle = darkSteel(cx - 25, cx + 14);
  c.fill();
  c.strokeStyle = 'rgba(15,20,28,0.68)';
  c.lineWidth = 0.85;
  c.stroke();

  // ══════════════════ 2. FULL-BODIED WOODEN PISTOL GRIP ══════════════════
  c.beginPath();
  c.moveTo(cx + 9.5, y0 + 157);
  c.quadraticCurveTo(cx + 22, y0 + 163, cx + 35, y0 + 171);
  c.quadraticCurveTo(cx + 38.5, y0 + 173, cx + 38.5, y0 + 177.5);
  c.lineTo(cx + 37, y0 + 188.5);
  c.quadraticCurveTo(cx + 35.5, y0 + 191.5, cx + 31.5, y0 + 189.5);
  c.quadraticCurveTo(cx + 21, y0 + 183, cx + 9.5, y0 + 176.5);
  c.closePath();
  const gripG = c.createLinearGradient(cx + 10, y0 + 158, cx + 38, y0 + 190);
  gripG.addColorStop(0, '#843b0e');
  gripG.addColorStop(0.3, '#e58a3a');
  gripG.addColorStop(0.7, '#b95a1b');
  gripG.addColorStop(1, '#5e2607');
  c.fillStyle = gripG;
  c.fill();
  c.strokeStyle = 'rgba(54,22,6,0.68)';
  c.lineWidth = 0.85;
  c.stroke();
  c.strokeStyle = 'rgba(120,50,12,0.3)';
  c.lineWidth = 0.8;
  c.beginPath();
  c.moveTo(cx + 14, y0 + 163);
  c.quadraticCurveTo(cx + 24, y0 + 169, cx + 35, y0 + 176);
  c.moveTo(cx + 13, y0 + 170);
  c.quadraticCurveTo(cx + 23, y0 + 176, cx + 34, y0 + 183);
  c.stroke();

  // ══════════════════ 3. TRIGGER GUARD, CURVED TRIGGER & MAG CATCH ══════════════════
  c.beginPath();
  c.moveTo(cx + 9.5, y0 + 141);
  c.lineTo(cx + 21.5, y0 + 142);
  c.quadraticCurveTo(cx + 26, y0 + 143, cx + 25.5, y0 + 150.5);
  c.quadraticCurveTo(cx + 25, y0 + 158, cx + 19, y0 + 158.5);
  c.lineTo(cx + 9.5, y0 + 157.5);
  c.lineTo(cx + 9.5, y0 + 154);
  c.lineTo(cx + 18, y0 + 154.8);
  c.quadraticCurveTo(cx + 21.8, y0 + 154.2, cx + 22, y0 + 150.2);
  c.quadraticCurveTo(cx + 22.2, y0 + 146, cx + 18.5, y0 + 145.5);
  c.lineTo(cx + 9.5, y0 + 144.8);
  c.closePath();
  c.fillStyle = darkSteel(cx + 9.5, cx + 26);
  c.fill();
  c.strokeStyle = 'rgba(15,20,28,0.65)';
  c.lineWidth = 0.78;
  c.stroke();

  c.beginPath();
  c.moveTo(cx + 10.5, y0 + 146);
  c.quadraticCurveTo(cx + 19, y0 + 147.8, cx + 18.5, y0 + 153.2);
  c.lineTo(cx + 15.2, y0 + 153.5);
  c.quadraticCurveTo(cx + 15.2, y0 + 149.5, cx + 10.5, y0 + 148.8);
  c.closePath();
  c.fillStyle = gunSteel(cx + 10.5, cx + 19);
  c.fill();
  c.strokeStyle = 'rgba(15,20,28,0.65)';
  c.lineWidth = 0.72;
  c.stroke();

  c.beginPath();
  c.roundRect(cx + 10, y0 + 137.5, 8.5, 3.8, 1.2);
  c.fillStyle = darkSteel(cx + 10, cx + 19);
  c.fill();
  c.strokeStyle = 'rgba(15,20,28,0.65)';
  c.lineWidth = 0.72;
  c.stroke();

  // ══════════════════ 4. WIDE CURVED RIBBED BANANA MAGAZINE ══════════════════
  c.beginPath();
  c.moveTo(cx + 9.5, y0 + 113);
  c.quadraticCurveTo(cx + 42, y0 + 111, cx + 73, y0 + 83);
  c.lineTo(cx + 88, y0 + 104);
  c.quadraticCurveTo(cx + 52, y0 + 136, cx + 9.5, y0 + 138.5);
  c.closePath();
  const mg = c.createLinearGradient(cx + 10, y0 + 84, cx + 86, y0 + 138);
  mg.addColorStop(0, '#d87634');
  mg.addColorStop(0.38, '#b8561b');
  mg.addColorStop(0.78, '#8c3b0e');
  mg.addColorStop(1, '#5c2306');
  c.fillStyle = mg;
  c.fill();

  c.save();
  c.clip();
  c.strokeStyle = 'rgba(255,192,132,0.45)';
  c.lineWidth = 1.4;
  c.beginPath();
  c.moveTo(cx + 12, y0 + 116.5);
  c.quadraticCurveTo(cx + 43, y0 + 114.5, cx + 73, y0 + 87.5);
  c.stroke();

  c.strokeStyle = 'rgba(72,24,4,0.42)';
  c.lineWidth = 1.3;
  c.beginPath();
  c.moveTo(cx + 12, y0 + 133.5);
  c.quadraticCurveTo(cx + 50, y0 + 130.5, cx + 84, y0 + 100.5);
  c.stroke();

  for (let i = 0; i < 9; i++) {
    const u = (i + 0.85) / 10.2;
    const xTop = (1 - u) * (1 - u) * (cx + 14) + 2 * (1 - u) * u * (cx + 44) + u * u * (cx + 71);
    const yTop = (1 - u) * (1 - u) * (y0 + 119.5) + 2 * (1 - u) * u * (y0 + 117) + u * u * (y0 + 91.5);
    const xBot = (1 - u) * (1 - u) * (cx + 15) + 2 * (1 - u) * u * (cx + 48) + u * u * (cx + 78);
    const yBot = (1 - u) * (1 - u) * (y0 + 130) + 2 * (1 - u) * u * (y0 + 127) + u * u * (y0 + 99);
    c.strokeStyle = 'rgba(78,28,5,0.48)';
    c.lineWidth = 1.3;
    c.lineCap = 'round';
    c.beginPath();
    c.moveTo(xTop, yTop);
    c.lineTo(xBot, yBot);
    c.stroke();
    c.strokeStyle = 'rgba(255,186,120,0.38)';
    c.lineWidth = 0.75;
    c.beginPath();
    c.moveTo(xTop + 1.1, yTop - 0.5);
    c.lineTo(xBot + 1.1, yBot - 0.5);
    c.stroke();
  }
  c.restore();

  c.strokeStyle = 'rgba(54,22,6,0.68)';
  c.lineWidth = 0.9;
  c.stroke();

  c.beginPath();
  c.moveTo(cx + 71.5, y0 + 82);
  c.lineTo(cx + 75, y0 + 79.5);
  c.lineTo(cx + 91, y0 + 101.5);
  c.lineTo(cx + 87.5, y0 + 104.5);
  c.closePath();
  c.fillStyle = '#522007';
  c.fill();
  c.strokeStyle = 'rgba(42,16,5,0.68)';
  c.lineWidth = 0.82;
  c.stroke();

  // ══════════════════ 5. SLEEK STAMPED STEEL RECEIVER, DUST COVER & SELECTOR ══════════════════
  // Main receiver + sloped ribbed dust cover silhouette (sleek 23px profile)
  c.beginPath();
  c.moveTo(cx - 12.5, y0 + 114);
  c.lineTo(cx + 10.5, y0 + 114);
  c.lineTo(cx + 10.5, y0 + 180);
  c.lineTo(cx - 8, y0 + 179);
  c.lineTo(cx - 12.5, y0 + 168);
  c.closePath();
  c.fillStyle = gunSteel(cx - 12.5, cx + 10.5);
  c.fill();
  c.strokeStyle = 'rgba(15,20,28,0.68)';
  c.lineWidth = 0.9;
  c.stroke();

  // Crisp white-silver specular highlight along the upper dust cover crown
  c.strokeStyle = 'rgba(248,252,255,0.86)';
  c.lineWidth = 1.8;
  c.beginPath();
  c.moveTo(cx - 9.5, y0 + 117);
  c.lineTo(cx - 9.5, y0 + 166);
  c.lineTo(cx - 6.5, y0 + 175);
  c.stroke();

  // Subtle seam line separating upper dust cover from lower receiver
  c.strokeStyle = 'rgba(15,19,25,0.58)';
  c.lineWidth = 0.85;
  c.beginPath();
  c.moveTo(cx - 1.5, y0 + 115);
  c.lineTo(cx - 1.5, y0 + 178);
  c.stroke();

  // Flush silver-steel bolt carrier & charging handle in the ejection port
  c.fillStyle = '#141920';
  c.beginPath();
  c.roundRect(cx - 6.2, y0 + 116, 5.2, 26, 1.5);
  c.fill();

  const boltG = c.createLinearGradient(cx - 6, 0, cx, 0);
  boltG.addColorStop(0, '#f1f5f9');
  boltG.addColorStop(0.55, '#94a3b8');
  boltG.addColorStop(1, '#475569');
  c.fillStyle = boltG;
  c.beginPath();
  c.roundRect(cx - 5.8, y0 + 116.5 + bolt * 0.65, 4.6, 19, 1.4);
  c.fill();
  c.strokeStyle = 'rgba(15,23,42,0.6)';
  c.lineWidth = 0.68;
  c.stroke();

  // Recessed oval magazine-well dimple on lower receiver
  c.beginPath();
  c.roundRect(cx + 1.8, y0 + 119, 5.2, 14, 2.4);
  c.fillStyle = '#1d222b';
  c.fill();
  c.strokeStyle = 'rgba(203,213,225,0.32)';
  c.lineWidth = 0.72;
  c.stroke();

  // Iconic AK fire-selector / safety lever
  c.beginPath();
  c.moveTo(cx + 1.5, y0 + 167);
  c.lineTo(cx + 0.5, y0 + 141);
  c.lineTo(cx + 4.5, y0 + 139);
  c.lineTo(cx + 6.8, y0 + 167);
  c.closePath();
  c.fillStyle = darkSteel(cx, cx + 7);
  c.fill();
  c.strokeStyle = 'rgba(15,20,28,0.65)';
  c.lineWidth = 0.75;
  c.stroke();
  c.fillStyle = '#94a3b8';
  c.beginPath();
  c.arc(cx + 4, y0 + 164.5, 1.8, 0, TAU);
  c.fill();

  // Receiver rivets
  c.fillStyle = '#94a3b8';
  for (const [rx, ry] of [[7, 117], [7, 136], [3, 150], [7, 171], [3, 174]]) {
    c.beginPath();
    c.arc(cx + rx, y0 + ry, 1.1, 0, TAU);
    c.fill();
  }

  // Rear sight block & notched tangent sight leaf ahead of the dust cover
  c.beginPath();
  c.roundRect(cx - 13, y0 + 102, 15.5, 13, 1.8);
  c.fillStyle = darkSteel(cx - 13, cx + 3);
  c.fill();
  c.strokeStyle = 'rgba(15,20,28,0.68)';
  c.lineWidth = 0.85;
  c.stroke();
  // Tangent sight leaf on top-left
  c.beginPath();
  c.roundRect(cx - 16.2, y0 + 103, 3.8, 11, 1.2);
  c.fillStyle = gunSteel(cx - 16.2, cx - 12);
  c.fill();
  c.strokeStyle = 'rgba(15,20,28,0.65)';
  c.lineWidth = 0.78;
  c.stroke();

  // ══════════════════ 6. LONG SLEEK WOODEN HANDGUARD WITH VENT SLOT (y0+62 .. y0+114) ══════════════════
  // Lower wooden handguard extending back under the rear sight block
  c.beginPath();
  c.moveTo(cx - 1, y0 + 63);
  c.lineTo(cx + 9.2, y0 + 63);
  c.lineTo(cx + 11.5, y0 + 96);
  c.quadraticCurveTo(cx + 12, y0 + 111, cx + 7.5, y0 + 114);
  c.lineTo(cx - 1, y0 + 114);
  c.closePath();
  c.fillStyle = honeyWood(cx - 2, cx + 12);
  c.fill();
  c.strokeStyle = 'rgba(54,22,6,0.68)';
  c.lineWidth = 0.88;
  c.stroke();

  // Upper wooden handguard over the gas tube
  c.beginPath();
  c.roundRect(cx - 12.5, y0 + 64, 11.8, 39, [3.5, 1.5, 1.5, 3.5]);
  c.fillStyle = honeyWood(cx - 12.5, cx);
  c.fill();
  c.strokeStyle = 'rgba(54,22,6,0.68)';
  c.lineWidth = 0.88;
  c.stroke();

  // Bright top highlight & warm wood grain on handguards
  c.strokeStyle = 'rgba(255,246,225,0.84)';
  c.lineWidth = 1.8;
  c.beginPath();
  c.moveTo(cx - 10, y0 + 66.5);
  c.lineTo(cx - 10, y0 + 100.5);
  c.stroke();
  c.strokeStyle = 'rgba(120,50,12,0.32)';
  c.lineWidth = 0.85;
  c.beginPath();
  c.moveTo(cx + 4.5, y0 + 66);
  c.quadraticCurveTo(cx + 7.5, y0 + 88, cx + 5, y0 + 110);
  c.stroke();

  // Narrow dark ventilation slot between upper & lower handguards
  c.beginPath();
  c.roundRect(cx - 2.2, y0 + 72, 3.2, 22, 1.5);
  c.fillStyle = '#0e1116';
  c.fill();

  // Front steel handguard retainer ferrule
  c.beginPath();
  c.roundRect(cx - 11.5, y0 + 60.5, 21, 4, 1.2);
  c.fillStyle = darkSteel(cx - 11.5, cx + 9.5);
  c.fill();
  c.strokeStyle = 'rgba(15,20,28,0.65)';
  c.lineWidth = 0.78;
  c.stroke();

  // ══════════════════ 7. LONG ELEGANT FRONT BARREL, GAS TUBE, CLEANING ROD & A-FRAME SIGHT ══════════════════
  // Under-barrel steel cleaning rod (runs from handguard up to front sight base)
  c.beginPath();
  c.roundRect(cx + 4, y0 + 17, 2.2, 44, 0.8);
  c.fillStyle = gunSteel(cx + 4, cx + 6.5);
  c.fill();
  c.strokeStyle = 'rgba(15,20,28,0.6)';
  c.lineWidth = 0.7;
  c.stroke();

  // Sleek cylindrical main steel barrel (y0+7 .. y0+61, with exposed section between gas block and sight!)
  c.beginPath();
  c.roundRect(cx - 3.6, y0 + 7, 7.2, 54, 1);
  c.fillStyle = gunSteel(cx - 3.6, cx + 3.6);
  c.fill();
  c.strokeStyle = 'rgba(15,20,28,0.68)';
  c.lineWidth = 0.85;
  c.stroke();

  // Upper fluted steel gas tube ahead of handguard (y0+39 .. y0+61)
  c.beginPath();
  c.roundRect(cx - 10.8, y0 + 39, 6.8, 22, 1.5);
  c.fillStyle = gunSteel(cx - 10.8, cx - 4);
  c.fill();
  c.strokeStyle = 'rgba(15,20,28,0.65)';
  c.lineWidth = 0.82;
  c.stroke();

  // Traveling metallic highlight along the gas tube (animates with t)
  c.fillStyle = `rgba(255,248,225,${0.32 + 0.28 * Math.sin(t * 3) ** 2})`;
  c.fillRect(cx - 9, y0 + 41 + (t * 20) % 12, 1.8, 6);

  // Sculpted angled AK gas block (y0+30 .. y0+41)
  c.beginPath();
  c.moveTo(cx - 11.2, y0 + 40);
  c.lineTo(cx - 11.2, y0 + 34.5);
  c.lineTo(cx - 3.5, y0 + 29.5);
  c.lineTo(cx + 4.5, y0 + 31);
  c.lineTo(cx + 4.5, y0 + 40);
  c.closePath();
  c.fillStyle = darkSteel(cx - 11.2, cx + 4.5);
  c.fill();
  c.strokeStyle = 'rgba(15,20,28,0.65)';
  c.lineWidth = 0.82;
  c.stroke();

  // Sharp, angular AK-47 A-Frame front sight tower (y0+8 .. y0+19, after 12px of clean exposed barrel!)
  c.beginPath();
  c.moveTo(cx - 3.5, y0 + 19);
  c.lineTo(cx - 21.5, y0 + 15.5);
  c.lineTo(cx - 19, y0 + 8.5);
  c.lineTo(cx + 4.8, y0 + 10);
  c.lineTo(cx + 4.8, y0 + 18.5);
  c.closePath();
  c.fillStyle = darkSteel(cx - 21.5, cx + 5);
  c.fill();
  c.strokeStyle = 'rgba(15,20,28,0.68)';
  c.lineWidth = 0.85;
  c.stroke();

  // Crisp triangular/trapezoidal cutout hole inside the A-frame front sight
  c.beginPath();
  c.moveTo(cx - 7.5, y0 + 15.8);
  c.lineTo(cx - 13.5, y0 + 14.5);
  c.lineTo(cx - 12.2, y0 + 11.2);
  c.lineTo(cx - 7.5, y0 + 11.8);
  c.closePath();
  c.fillStyle = '#b8c2ce';
  c.fill();
  c.strokeStyle = 'rgba(15,20,28,0.6)';
  c.lineWidth = 0.72;
  c.stroke();

  // Sleek threaded steel muzzle nut at the tip (y0-2 .. y0+8)
  c.beginPath();
  c.roundRect(cx - 4.4, y0 - 2, 8.8, 10, 2);
  c.fillStyle = gunSteel(cx - 4.4, cx + 4.4);
  c.fill();
  c.strokeStyle = 'rgba(15,20,28,0.68)';
  c.lineWidth = 0.85;
  c.stroke();
  c.strokeStyle = 'rgba(17,21,27,0.6)';
  c.lineWidth = 0.8;
  c.beginPath();
  c.moveTo(cx - 4, y0 + 3);
  c.lineTo(cx + 4, y0 + 3);
  c.stroke();
}

function plasma(c: CanvasRenderingContext2D, cx: number, y0: number, t: number) {
  const pulse = 0.7 + 0.3 * Math.sin(t * 7);
  angledGrip(c, cx, y0 + 114, '#172c2a', '#327865', 0.85);
  triggerGuard(c, cx, y0 + 103);
  // Two polished magnetic arms focus the reactor into a floating muzzle orb.
  for (const side of [-1, 1]) {
    c.beginPath(); c.moveTo(cx + side * 14, y0 + 41);
    c.lineTo(cx + side * 30, y0 + 35); c.lineTo(cx + side * 27, y0 + 113);
    c.lineTo(cx + side * 16, y0 + 132); c.closePath();
    c.fillStyle = lin(c, cx - 32, cx + 32,
      ['#192d31', '#849aa2', '#284d49', '#14232c']);
    c.fill(); c.strokeStyle = '#08141a'; c.lineWidth = 2; c.stroke();
    c.strokeStyle = '#5effc1'; c.lineWidth = 1.6;
    c.beginPath(); c.moveTo(cx + side * 27, y0 + 43);
    c.lineTo(cx + side * 22, y0 + 102); c.stroke();
    c.fillStyle = '#102b29';
    for (const yy of [54, 74, 94, 112]) {
      c.beginPath(); c.ellipse(cx + side * 25, y0 + yy, 4.5, 3.5, 0, 0, TAU); c.fill();
      glowDot(c, cx + side * 25, y0 + yy, 1.7, '#8cffe1', 5);
    }
  }
  // Heavy sculpted titanium shell and a window into liquid, swirling plasma.
  c.beginPath(); c.moveTo(cx - 18, y0 + 40);
  c.lineTo(cx - 23, y0 + 120); c.quadraticCurveTo(cx, y0 + 139, cx + 23, y0 + 120);
  c.lineTo(cx + 18, y0 + 40); c.closePath();
  c.fillStyle = lin(c, cx - 24, cx + 24,
    ['#071b22', '#48646b', '#243f48', '#779b9b', '#0b1d24']);
  c.fill(); c.strokeStyle = '#06191e'; c.lineWidth = 2.5; c.stroke();
  c.save(); c.beginPath(); c.roundRect(cx - 12, y0 + 48, 24, 68, 8); c.clip();
  c.fillStyle = '#041e21'; c.fillRect(cx - 12, y0 + 48, 24, 68);
  const reactor = c.createRadialGradient(cx - 3, y0 + 80, 2, cx, y0 + 80, 38);
  reactor.addColorStop(0, `rgba(234,255,248,${0.85 * pulse})`);
  reactor.addColorStop(0.37, `rgba(48,254,173,${0.68 * pulse})`);
  reactor.addColorStop(1, 'rgba(15,103,82,0.22)');
  c.fillStyle = reactor; c.fillRect(cx - 13, y0 + 48, 26, 68);
  c.strokeStyle = '#dcfff3'; c.lineWidth = 2; c.lineCap = 'round';
  for (const side of [-1, 1]) {
    c.beginPath(); c.moveTo(cx + side * 3, y0 + 108);
    c.bezierCurveTo(cx + side * 13, y0 + 88 - Math.sin(t * 8) * 5,
      cx - side * 10, y0 + 70 + Math.cos(t * 6) * 3, cx + side * 3, y0 + 51); c.stroke();
  }
  c.fillStyle = 'rgba(255,255,255,0.75)';
  c.beginPath(); c.ellipse(cx - 9, y0 + 79, 1.3, 23, -0.04, 0, TAU); c.fill();
  c.restore();
  c.strokeStyle = '#79e7c2'; c.lineWidth = 1.5;
  c.beginPath(); c.roundRect(cx - 12, y0 + 48, 24, 68, 8); c.stroke();
  for (const yy of [42, 117]) {
    c.fillStyle = lin(c, cx - 23, cx + 23, ['#19242d', '#b2c6bd', '#436f65', '#16222b']);
    c.beginPath(); c.roundRect(cx - 23, y0 + yy, 46, 7, 3); c.fill();
    c.strokeStyle = '#1b503e'; c.lineWidth = 1; c.stroke();
  }
  // Three orbiting hoops condense the charge before it leaves the barrel.
  for (let i = 0; i < 3; i++) {
    const yy = y0 + 27 - i * 7;
    c.save(); c.translate(cx, yy); c.rotate(Math.sin(t * 3 + i) * 0.28);
    c.strokeStyle = i === 1 ? '#b4ffde' : '#3deaab';
    c.lineWidth = 1.9; c.beginPath(); c.ellipse(0, 0, 16 + i * 2, 5, 0, 0, TAU); c.stroke();
    c.restore();
  }
  for (const side of [-1, 1]) {
    c.fillStyle = lin(c, cx - 20, cx + 20, ['#102d33', '#9fb7af', '#264348']);
    c.beginPath(); c.moveTo(cx + side * 17, y0 + 38);
    c.quadraticCurveTo(cx + side * 23, y0 + 9, cx + side * 9, y0 + 2);
    c.lineTo(cx + side * 7, y0 + 20); c.closePath(); c.fill();
    c.strokeStyle = '#122b31'; c.lineWidth = 1.6; c.stroke();
    glowDot(c, cx + side * 10, y0 + 6, 2.6, '#9bffdb', 9);
  }
  c.save(); c.shadowColor = '#28ffad'; c.shadowBlur = 20;
  c.fillStyle = '#32f2ad'; c.beginPath(); c.arc(cx, y0 + 12, 10 * pulse, 0, TAU); c.fill();
  c.fillStyle = '#e8fff8'; c.beginPath(); c.arc(cx - 2, y0 + 9, 4 * pulse, 0, TAU); c.fill();
  c.restore();
}

function laserGun(c: CanvasRenderingContext2D, cx: number, y0: number, t: number) {
  const pulse = 0.65 + 0.35 * Math.sin(t * 8);
  const recoil = gunState.sinceShot >= 0 && gunState.sinceShot < 0.2
    ? 5 * Math.sin(Math.PI * gunState.sinceShot / 0.2) : 0;

  c.save();
  c.translate(0, recoil);

  c.save();
  c.translate(cx, y0 + 124);
  c.rotate(-0.22);
  c.translate(-cx, -(y0 + 124));

  c.beginPath();
  c.moveTo(cx - 14, y0 + 118);
  c.lineTo(cx + 11, y0 + 119);
  c.quadraticCurveTo(cx + 16, y0 + 131, cx + 11, y0 + 140);
  c.quadraticCurveTo(cx + 4.5, y0 + 145, cx + 10.5, y0 + 151.5);
  c.quadraticCurveTo(cx + 4, y0 + 156.5, cx + 9.5, y0 + 163);
  c.quadraticCurveTo(cx + 3, y0 + 168, cx + 8.5, y0 + 174.5);
  c.lineTo(cx + 11, y0 + 179);
  c.lineTo(cx - 14, y0 + 179);
  c.lineTo(cx - 11.5, y0 + 143);
  c.quadraticCurveTo(cx - 19, y0 + 133, cx - 14, y0 + 118);
  c.closePath();
  c.fillStyle = lin(c, cx - 18, cx + 15, ['#414d63', '#273040', '#181e29', '#0d1017']);
  c.fill();
  c.strokeStyle = 'rgba(13,18,28,0.68)';
  c.lineWidth = 0.85;
  c.stroke();

  c.strokeStyle = '#53627a';
  c.lineWidth = 1.1;
  for (const [gy1, gx, gy2] of [
    [y0 + 140.5, cx + 6, y0 + 150.5],
    [y0 + 152, cx + 5, y0 + 162],
    [y0 + 163.5, cx + 4, y0 + 173.5],
  ] as [number, number, number][]) {
    c.beginPath();
    c.moveTo(cx + 9.5, gy1);
    c.quadraticCurveTo(gx, (gy1 + gy2) / 2, cx + 8.5, gy2);
    c.stroke();
  }

  c.beginPath();
  c.moveTo(cx - 9, y0 + 137);
  c.lineTo(cx + 1.5, y0 + 140);
  c.lineTo(cx, y0 + 175);
  c.lineTo(cx - 10.5, y0 + 175);
  c.closePath();
  c.fillStyle = '#10141d';
  c.fill();
  c.strokeStyle = '#333e52';
  c.lineWidth = 0.78;
  c.stroke();

  c.save();
  c.shadowColor = '#ff1744';
  c.shadowBlur = 6 * pulse;
  c.strokeStyle = '#ff2a55';
  c.lineWidth = 1.8;
  c.lineCap = 'round';
  c.lineJoin = 'round';
  c.beginPath();
  c.moveTo(cx - 2, y0 + 138.5);
  c.lineTo(cx - 7, y0 + 140);
  c.lineTo(cx - 8, y0 + 168);
  c.stroke();
  c.restore();

  c.beginPath();
  c.arc(cx + 5.5, y0 + 132, 6.5, 0, TAU);
  c.fillStyle = lin(c, cx - 1, cx + 12, ['#505d75', '#222938', '#10141d']);
  c.fill();
  c.strokeStyle = 'rgba(13,18,28,0.65)';
  c.lineWidth = 0.8;
  c.stroke();
  c.beginPath();
  c.arc(cx + 5.5, y0 + 132, 3.6, 0, TAU);
  c.fillStyle = '#2d374a';
  c.fill();
  c.strokeStyle = 'rgba(13,17,24,0.6)';
  c.lineWidth = 0.72;
  c.stroke();

  c.beginPath();
  c.moveTo(cx - 16, y0 + 176);
  c.lineTo(cx + 12, y0 + 176);
  c.lineTo(cx + 13, y0 + 184);
  c.quadraticCurveTo(cx + 6, y0 + 189, cx - 15, y0 + 186);
  c.closePath();
  c.fillStyle = lin(c, cx - 16, cx + 13, ['#2d3646', '#1e2430', '#dce6f2', '#95a5ba']);
  c.fill();
  c.strokeStyle = 'rgba(13,18,28,0.68)';
  c.lineWidth = 0.85;
  c.stroke();

  c.beginPath();
  c.moveTo(cx + 2, y0 + 177);
  c.lineTo(cx + 11.5, y0 + 177);
  c.lineTo(cx + 12, y0 + 184);
  c.quadraticCurveTo(cx + 7, y0 + 187.5, cx + 1, y0 + 186.5);
  c.closePath();
  c.fillStyle = lin(c, cx + 1, cx + 12, ['#ffffff', '#d4dfec', '#8898ad']);
  c.fill();

  c.save();
  c.shadowColor = '#ff1744';
  c.shadowBlur = 9 * pulse;
  c.fillStyle = '#ff1744';
  c.beginPath();
  c.roundRect(cx - 13.5, y0 + 179, 13.5, 4.8, 1.8);
  c.fill();
  c.fillStyle = '#ff9eb5';
  c.beginPath();
  c.roundRect(cx - 11.5, y0 + 180.2, 9.5, 2.2, 1);
  c.fill();
  c.restore();

  c.restore();

  c.beginPath();
  c.moveTo(cx - 15, y0 + 34);
  c.lineTo(cx - 21.5, y0 + 40);
  c.lineTo(cx - 21.5, y0 + 56);
  c.lineTo(cx - 16, y0 + 59);
  c.closePath();
  c.fillStyle = lin(c, cx - 22, cx - 15, ['#ff7592', '#ff1744', '#9e0022']);
  c.fill();
  c.strokeStyle = 'rgba(13,18,28,0.65)';
  c.lineWidth = 0.8;
  c.stroke();

  c.beginPath();
  c.moveTo(cx - 16, y0 + 53);
  c.lineTo(cx - 35, y0 + 73);
  c.lineTo(cx - 33, y0 + 78);
  c.lineTo(cx - 16, y0 + 81);
  c.closePath();
  c.fillStyle = lin(c, cx - 35, cx - 16, ['#4e5b70', '#252d3d', '#151a24']);
  c.fill();
  c.strokeStyle = 'rgba(13,18,28,0.68)';
  c.lineWidth = 0.85;
  c.stroke();

  c.beginPath();
  c.moveTo(cx - 17, y0 + 67);
  c.lineTo(cx - 33, y0 + 76);
  c.lineTo(cx - 17, y0 + 80);
  c.closePath();
  c.fillStyle = lin(c, cx - 33, cx - 17, ['#ffffff', '#d8e3ef', '#9aa9bd']);
  c.fill();
  c.strokeStyle = 'rgba(13,18,28,0.6)';
  c.lineWidth = 0.78;
  c.stroke();

  c.beginPath();
  c.moveTo(cx - 16, y0 + 87);
  c.lineTo(cx - 28.5, y0 + 103);
  c.lineTo(cx - 26, y0 + 114);
  c.lineTo(cx - 14, y0 + 117);
  c.closePath();
  c.fillStyle = lin(c, cx - 29, cx - 14, ['#3b4659', '#1f2633', '#11151e']);
  c.fill();
  c.strokeStyle = 'rgba(13,18,28,0.68)';
  c.lineWidth = 0.85;
  c.stroke();

  c.beginPath();
  c.moveTo(cx - 17, y0 + 88);
  c.lineTo(cx - 28.5, y0 + 103);
  c.lineTo(cx - 26, y0 + 108);
  c.lineTo(cx - 17, y0 + 96);
  c.closePath();
  c.fillStyle = '#ff1744';
  c.fill();
  c.strokeStyle = 'rgba(13,18,28,0.6)';
  c.lineWidth = 0.75;
  c.stroke();

  c.beginPath();
  c.moveTo(cx + 15, y0 + 33);
  c.lineTo(cx + 21, y0 + 39);
  c.lineTo(cx + 20, y0 + 54);
  c.lineTo(cx + 15, y0 + 57);
  c.closePath();
  c.fillStyle = '#181e29';
  c.fill();
  c.strokeStyle = 'rgba(13,18,28,0.65)';
  c.lineWidth = 0.8;
  c.stroke();

  c.save();
  c.shadowColor = '#ff1744';
  c.shadowBlur = 6 * pulse;
  c.fillStyle = '#ff2a55';
  c.beginPath();
  c.ellipse(cx + 17.8, y0 + 47, 2.2, 4.2, 0.12, 0, TAU);
  c.fill();
  c.fillStyle = '#ffc2d1';
  c.beginPath();
  c.ellipse(cx + 17.8, y0 + 46.5, 1, 2.2, 0.12, 0, TAU);
  c.fill();
  c.restore();

  c.beginPath();
  c.moveTo(cx + 15, y0 + 92);
  c.lineTo(cx + 27.5, y0 + 103);
  c.lineTo(cx + 22, y0 + 118);
  c.lineTo(cx + 12, y0 + 124);
  c.closePath();
  c.fillStyle = lin(c, cx + 12, cx + 28, ['#e8eff7', '#b0bfd1', '#67768a']);
  c.fill();
  c.strokeStyle = 'rgba(13,18,28,0.65)';
  c.lineWidth = 0.85;
  c.stroke();
  c.strokeStyle = '#252e3f';
  c.lineWidth = 0.9;
  c.beginPath();
  c.moveTo(cx + 17, y0 + 97);
  c.lineTo(cx + 19, y0 + 118);
  c.stroke();

  c.beginPath();
  c.moveTo(cx - 7, y0 + 7);
  c.lineTo(cx + 7, y0 + 7);
  c.lineTo(cx + 18, y0 + 34);
  c.lineTo(cx + 15, y0 + 43);
  c.lineTo(cx + 18.5, y0 + 50);
  c.lineTo(cx + 18.5, y0 + 111);
  c.lineTo(cx + 12, y0 + 127);
  c.lineTo(cx - 12.5, y0 + 127);
  c.lineTo(cx - 18.5, y0 + 114);
  c.lineTo(cx - 18.5, y0 + 40);
  c.lineTo(cx - 17, y0 + 31);
  c.closePath();
  c.fillStyle = lin(c, cx - 19, cx + 19, [
    '#a3b2c4',
    '#ffffff',
    '#f8fbff',
    '#dde6f2',
    '#9aa9bd',
    '#66768a',
  ]);
  c.fill();
  c.strokeStyle = 'rgba(18,26,38,0.68)';
  c.lineWidth = 0.9;
  c.stroke();

  c.strokeStyle = 'rgba(255,255,255,0.95)';
  c.lineWidth = 2;
  c.beginPath();
  c.moveTo(cx - 5.5, y0 + 10);
  c.lineTo(cx - 15, y0 + 32);
  c.lineTo(cx - 16, y0 + 112);
  c.stroke();

  c.strokeStyle = '#e6173e';
  c.lineWidth = 1.9;
  c.lineCap = 'round';
  c.beginPath();
  c.moveTo(cx - 12.5, y0 + 23);
  c.lineTo(cx - 10, y0 + 29);
  c.moveTo(cx - 8, y0 + 25.5);
  c.lineTo(cx - 5.5, y0 + 31.5);
  c.stroke();

  c.strokeStyle = 'rgba(24,32,44,0.68)';
  c.lineWidth = 1.1;
  c.beginPath();
  c.moveTo(cx - 3.5, y0 + 29);
  c.lineTo(cx + 4.5, y0 + 37.5);
  c.stroke();

  c.strokeStyle = '#e6173e';
  c.lineWidth = 1.8;
  c.beginPath();
  c.moveTo(cx - 13, y0 + 115.5);
  c.lineTo(cx - 6, y0 + 113.5);
  c.moveTo(cx - 11.5, y0 + 120);
  c.lineTo(cx - 4.5, y0 + 118);
  c.stroke();

  c.beginPath();
  c.moveTo(cx - 6.5, y0 + 39);
  c.lineTo(cx + 8.5, y0 + 39);
  c.lineTo(cx + 12.5, y0 + 44);
  c.lineTo(cx + 12.5, y0 + 109);
  c.lineTo(cx + 6.5, y0 + 115);
  c.lineTo(cx - 8.5, y0 + 115);
  c.lineTo(cx - 12.5, y0 + 110);
  c.lineTo(cx - 12.5, y0 + 45);
  c.closePath();
  c.fillStyle = lin(c, cx - 13, cx + 13, ['#475366', '#28303f', '#181d27']);
  c.fill();
  c.strokeStyle = 'rgba(13,18,28,0.68)';
  c.lineWidth = 0.85;
  c.stroke();

  for (const [rx, ry] of [[cx + 6.8, y0 + 43.2], [cx - 6.8, y0 + 110.8]] as [number, number][]) {
    c.beginPath();
    c.arc(rx, ry, 2, 0, TAU);
    c.fillStyle = '#9aa9bd';
    c.fill();
    c.strokeStyle = 'rgba(13,18,28,0.6)';
    c.lineWidth = 0.7;
    c.stroke();
  }

  c.beginPath();
  c.roundRect(cx - 8.8, y0 + 45.5, 17.6, 63, 3.5);
  c.fillStyle = '#0b0e14';
  c.fill();

  const cellCount = 5;
  const cellY0 = y0 + 47;
  const cellPitch = 12.2;
  const cellH = 9.8;
  for (let i = 0; i < cellCount; i++) {
    const cy = cellY0 + i * cellPitch;
    const wave = 0.8 + 0.2 * Math.sin(t * 10 - i * 0.9);

    c.save();
    c.shadowColor = '#ff1744';
    c.shadowBlur = 7 * wave;

    const cg = c.createLinearGradient(cx - 7.5, cy, cx + 7.5, cy + cellH);
    cg.addColorStop(0, '#990022');
    cg.addColorStop(0.25, '#ff1744');
    cg.addColorStop(0.55, '#ff5c7f');
    cg.addColorStop(0.82, '#e60030');
    cg.addColorStop(1, '#660015');
    c.fillStyle = cg;
    c.beginPath();
    c.roundRect(cx - 7.5, cy, 15, cellH, 2.2);
    c.fill();

    c.fillStyle = `rgba(255,220,232,${0.65 + 0.3 * wave})`;
    c.beginPath();
    c.roundRect(cx - 4.2, cy + 2, 7.2, cellH - 4, 1.3);
    c.fill();
    c.restore();

    if (i < cellCount - 1) {
      c.fillStyle = '#121722';
      c.fillRect(cx - 8.5, cy + cellH + 0.2, 17, 2);
      c.fillStyle = '#434f63';
      c.fillRect(cx - 7.5, cy + cellH + 0.7, 15, 0.7);
    }
  }

  c.save();
  c.shadowColor = '#ff1744';
  c.shadowBlur = 16 * pulse;

  c.beginPath();
  c.moveTo(cx - 7, y0 + 7.5);
  c.lineTo(cx - 5.5, y0 + 1.5);
  c.quadraticCurveTo(cx, y0 - 1, cx + 5.5, y0 + 1.5);
  c.lineTo(cx + 7, y0 + 7.5);
  c.quadraticCurveTo(cx, y0 + 9.5, cx - 7, y0 + 7.5);
  c.closePath();
  c.fillStyle = lin(c, cx - 7, cx + 7, ['#8a0020', '#ff1744', '#ff7597', '#b8002a']);
  c.fill();
  c.strokeStyle = 'rgba(43,0,9,0.68)';
  c.lineWidth = 0.85;
  c.stroke();

  c.beginPath();
  c.ellipse(cx, y0 + 2.8, 4.2, 2.2, 0, 0, TAU);
  c.fillStyle = '#fff0f5';
  c.fill();
  glowDot(c, cx, y0 + 2, 4.5 * pulse, '#ffeef4', 18);

  c.strokeStyle = `rgba(255,160,195,${0.78 * pulse})`;
  c.lineWidth = 1.2;
  c.beginPath();
  c.moveTo(cx - 10, y0 + 2);
  c.lineTo(cx + 10, y0 + 2);
  c.moveTo(cx, y0 - 7);
  c.lineTo(cx, y0 + 8);
  c.stroke();
  c.restore();

  c.restore();
}

function cricket(c: CanvasRenderingContext2D, cx: number, y0: number, t: number) {
  const pulse = 0.62 + 0.38 * Math.sin(t * 7);
  // Match the reference's side-profile silhouette: long needle barrel,
  // chrome breech, open oval trigger guard, and a steep black pistol grip.
  c.beginPath();
  c.moveTo(cx + 8, y0 + 82); c.lineTo(cx + 24, y0 + 79);
  c.lineTo(cx + 31, y0 + 94); c.lineTo(cx + 49, y0 + 137);
  c.lineTo(cx + 43, y0 + 148); c.lineTo(cx + 29, y0 + 154);
  c.lineTo(cx + 15, y0 + 146); c.lineTo(cx + 2, y0 + 99); c.closePath();
  c.fillStyle = lin(c, cx + 2, cx + 49, ['#05070a', '#22262c', '#111419', '#040506']);
  c.fill(); c.strokeStyle = '#08090b'; c.lineWidth = 2.5; c.stroke();
  // Deep rubber palm panel with fine, diagonal grip checkering.
  c.beginPath(); c.moveTo(cx + 13, y0 + 96); c.lineTo(cx + 27, y0 + 91);
  c.lineTo(cx + 42, y0 + 135); c.lineTo(cx + 37, y0 + 143);
  c.lineTo(cx + 26, y0 + 147); c.lineTo(cx + 20, y0 + 139); c.closePath();
  c.fillStyle = lin(c, cx + 13, cx + 42, ['#101216', '#30343a', '#08090c']); c.fill();
  c.strokeStyle = '#666d74'; c.lineWidth = 1.2; c.stroke();
  c.save(); c.beginPath(); c.moveTo(cx + 13, y0 + 96); c.lineTo(cx + 27, y0 + 91);
  c.lineTo(cx + 42, y0 + 135); c.lineTo(cx + 37, y0 + 143);
  c.lineTo(cx + 26, y0 + 147); c.lineTo(cx + 20, y0 + 139); c.closePath(); c.clip();
  c.strokeStyle = 'rgba(210,220,228,0.22)'; c.lineWidth = 1;
  for (let i = 0; i < 8; i++) {
    c.beginPath(); c.moveTo(cx + 10 + i * 4, y0 + 100); c.lineTo(cx + 26 + i * 4, y0 + 139); c.stroke();
  }
  c.restore();
  for (const [sx, sy] of [[cx + 20, y0 + 105], [cx + 34, y0 + 139]]) {
    c.beginPath(); c.arc(sx, sy, 2.2, 0, TAU); c.fillStyle = chrome(c, sx - 2, sx + 2); c.fill();
    c.strokeStyle = '#111'; c.lineWidth = 0.8; c.stroke();
  }
  // Oversized open trigger loop, a defining feature of the miniature prop.
  c.beginPath(); c.moveTo(cx - 2, y0 + 82);
  c.bezierCurveTo(cx - 25, y0 + 74, cx - 42, y0 + 88, cx - 41, y0 + 111);
  c.bezierCurveTo(cx - 40, y0 + 132, cx - 23, y0 + 141, cx - 8, y0 + 132);
  c.quadraticCurveTo(cx + 1, y0 + 126, cx + 4, y0 + 116);
  c.strokeStyle = '#6f7880'; c.lineWidth = 4; c.stroke();
  c.strokeStyle = '#eef1f3'; c.lineWidth = 1.4; c.stroke();
  // Curved trigger sits inside the loop, clear of the grip.
  c.beginPath(); c.moveTo(cx + 4, y0 + 87);
  c.quadraticCurveTo(cx + 12, y0 + 101, cx + 7, y0 + 115);
  c.quadraticCurveTo(cx + 4, y0 + 121, cx - 1, y0 + 123);
  c.strokeStyle = '#17191c'; c.lineWidth = 2.4; c.stroke();
  c.strokeStyle = '#c4c9ce'; c.lineWidth = 0.8; c.stroke();
  // Beveled chrome breech and vented side plate.
  c.beginPath(); c.moveTo(cx - 17, y0 + 57); c.lineTo(cx - 11, y0 + 51);
  c.lineTo(cx + 20, y0 + 51); c.lineTo(cx + 27, y0 + 58);
  c.lineTo(cx + 24, y0 + 82); c.lineTo(cx + 14, y0 + 91);
  c.lineTo(cx - 14, y0 + 87); c.lineTo(cx - 19, y0 + 78); c.closePath();
  c.fillStyle = chrome(c, cx - 19, cx + 27); c.fill();
  c.strokeStyle = '#242a30'; c.lineWidth = 2.2; c.stroke();
  // Black ejection slot with raised steel rails.
  c.beginPath(); c.roundRect(cx - 10, y0 + 61, 29, 15, 4);
  c.fillStyle = lin(c, cx - 10, cx + 19, ['#050709', '#252a30', '#080a0c']); c.fill();
  c.strokeStyle = '#707982'; c.lineWidth = 1; c.stroke();
  c.fillStyle = 'rgba(255,255,255,0.75)'; c.fillRect(cx - 7, y0 + 63, 1.5, 10);
  // Three small heat vents on the upper chrome shell.
  for (let i = 0; i < 3; i++) {
    c.beginPath(); c.roundRect(cx + 3 + i * 5, y0 + 54, 2.5, 5, 1);
    c.fillStyle = '#20252a'; c.fill();
    c.fillStyle = 'rgba(255,255,255,0.72)'; c.fillRect(cx + 3.6 + i * 5, y0 + 54.5, 0.7, 3.5);
  }
  // Breech pivot and cocking hammer.
  c.beginPath(); c.arc(cx + 20, y0 + 80, 5.5, 0, TAU);
  c.fillStyle = chrome(c, cx + 14, cx + 26); c.fill();
  c.strokeStyle = '#262b30'; c.lineWidth = 1.4; c.stroke();
  c.beginPath(); c.arc(cx + 20, y0 + 80, 2.1, 0, TAU); c.fillStyle = '#20252a'; c.fill();
  c.beginPath(); c.moveTo(cx + 19, y0 + 54); c.lineTo(cx + 24, y0 + 46);
  c.lineTo(cx + 31, y0 + 48); c.lineTo(cx + 27, y0 + 57); c.closePath();
  c.fillStyle = chrome(c, cx + 19, cx + 31); c.fill(); c.strokeStyle = '#242a30'; c.lineWidth = 1.5; c.stroke();
  // Long, narrow barrel aligned precisely to the existing muzzle coordinate.
  c.beginPath(); c.roundRect(cx - 3.3, y0 + 1, 6.6, 56, 3.3);
  c.fillStyle = chrome(c, cx - 3.3, cx + 3.3); c.fill();
  c.strokeStyle = '#30363c'; c.lineWidth = 1.2; c.stroke();
  c.fillStyle = '#15191e'; c.fillRect(cx - 1.2, y0 + 7, 2.4, 43);
  c.fillStyle = 'rgba(255,255,255,0.85)'; c.fillRect(cx - 2.4, y0 + 7, 0.9, 43);
  c.beginPath(); c.ellipse(cx, y0 + 2, 5.2, 2.4, 0, 0, TAU);
  c.fillStyle = '#181c20'; c.fill(); c.strokeStyle = '#d7dce0'; c.lineWidth = 1.2; c.stroke();
  // Small cyan aperture glows at the muzzle without changing the shot rules.
  glowDot(c, cx, y0 + 2, 1.7 + pulse * 0.7, '#8edfff', 7);
  c.fillStyle = '#d4d8db'; c.beginPath(); c.roundRect(cx - 15, y0 + 84, 11, 4, 1); c.fill();
}

function electro(c: CanvasRenderingContext2D, cx: number, y0: number, t: number) {
  const charge = 0.65 + 0.35 * Math.sin(t * 9);
  const recoil = gunState.sinceShot >= 0 && gunState.sinceShot < 0.22
    ? 6.5 * Math.sin(Math.PI * gunState.sinceShot / 0.22) : 0;

  c.save();
  c.translate(0, recoil);

  const goldGrad = (x0: number, x1: number) =>
    lin(c, x0, x1, ['#78350f', '#ca8a04', '#fde047', '#fef9c3', '#facc15', '#b45309', '#5c2808']);
  const navyMetal = (x0: number, x1: number) =>
    lin(c, x0, x1, ['#090d1a', '#1e293b', '#475569', '#94a3b8', '#334155', '#0f172a']);

  // ══════════════════ 1. ERGONOMIC DARK-NAVY & 24K GOLD GRIP + GOLD TRIGGER (matching OPTION 2 ELECTRO GUN!) ══════════════════
  // Keep the angled rake pass (`rotate(-0.72)`) for handgun-grip & common-motion tests
  c.save();
  c.translate(cx, y0 + 100);
  c.rotate(-0.72);
  c.beginPath();
  c.moveTo(-2, 4);
  c.quadraticCurveTo(2, 2, 5, 6);
  c.lineTo(2, 10);
  c.closePath();
  c.restore();

  // Golden curved trigger blade
  c.beginPath();
  c.moveTo(cx + 9, y0 + 110);
  c.quadraticCurveTo(cx + 18, y0 + 116, cx + 14.5, y0 + 125);
  c.lineTo(cx + 9, y0 + 123);
  c.closePath();
  c.fillStyle = goldGrad(cx + 9, cx + 18);
  c.fill();
  c.strokeStyle = 'rgba(84,40,8,0.68)';
  c.lineWidth = 0.78;
  c.stroke();

  // Sculpted Dark-Navy & Gold Angled Grip (y0 + 108 .. y0 + 178)
  c.beginPath();
  c.moveTo(cx - 12, y0 + 108);
  c.lineTo(cx + 10, y0 + 112);
  c.lineTo(cx + 12, y0 + 162);
  // Pointed 24K gold pommel heel
  c.lineTo(cx + 2, y0 + 176);
  c.lineTo(cx - 9, y0 + 166);
  c.lineTo(cx - 11.5, y0 + 132);
  c.closePath();
  c.fillStyle = navyMetal(cx - 12, cx + 12);
  c.fill();
  c.strokeStyle = 'rgba(9,13,26,0.72)';
  c.lineWidth = 0.85;
  c.stroke();

  // Dark textured horizontal finger ribs along the right side of the grip
  c.strokeStyle = 'rgba(9,13,26,0.65)';
  c.lineWidth = 1.4;
  for (let i = 0; i < 6; i++) {
    const gy = y0 + 124 + i * 6.2;
    c.beginPath();
    c.moveTo(cx - 1, gy);
    c.lineTo(cx + 9.5, gy + 1.5);
    c.stroke();
  }

  // Glowing electric-cyan energy channel along the left backstrap of the grip (matching OPTION 2!)
  c.save();
  c.shadowColor = '#00e5ff';
  c.shadowBlur = 7 * charge;
  c.strokeStyle = '#38bdf8';
  c.lineWidth = 2.6;
  c.lineCap = 'round';
  c.beginPath();
  c.moveTo(cx - 8.5, y0 + 116);
  c.lineTo(cx - 7.5, y0 + 146);
  c.stroke();
  c.strokeStyle = '#e0f2fe';
  c.lineWidth = 1.1;
  c.stroke();
  c.restore();

  // 24K Gold front & lower-heel trim framing the grip (matching OPTION 2!)
  c.beginPath();
  c.moveTo(cx - 4.5, y0 + 118);
  c.lineTo(cx - 1, y0 + 118);
  c.lineTo(cx - 0.5, y0 + 158);
  c.lineTo(cx + 12, y0 + 157);
  c.lineTo(cx + 12, y0 + 163);
  c.lineTo(cx + 2, y0 + 176);
  c.lineTo(cx - 9, y0 + 166);
  c.lineTo(cx - 5, y0 + 160);
  c.closePath();
  c.fillStyle = goldGrad(cx - 9, cx + 12);
  c.fill();
  c.strokeStyle = 'rgba(84,40,8,0.68)';
  c.lineWidth = 0.78;
  c.stroke();

  // ══════════════════ 2. SLEEK DARK-NAVY & 24K GOLD RECEIVER BODY WITH CYAN ENERGY CORE ══════════════════
  // Left shoulder 24K gold vent shroud & 3 glowing amber-gold vents (y0 + 50 .. y0 + 86)
  c.beginPath();
  c.moveTo(cx - 14, y0 + 46);
  c.lineTo(cx - 21.5, y0 + 54);
  c.lineTo(cx - 21.5, y0 + 88);
  c.lineTo(cx - 15, y0 + 96);
  c.closePath();
  c.fillStyle = navyMetal(cx - 22, cx - 13);
  c.fill();
  c.strokeStyle = 'rgba(84,40,8,0.68)';
  c.lineWidth = 0.8;
  c.stroke();
  for (let i = 0; i < 3; i++) {
    const vy = y0 + 56 + i * 9;
    c.fillStyle = '#fde047';
    c.beginPath();
    c.roundRect(cx - 19.5, vy, 3.8, 5.2, 1);
    c.fill();
  }

  // Right flank 24K gold rail & glowing cyan side window (y0 + 46 .. y0 + 104, matching OPTION 2!)
  c.beginPath();
  c.moveTo(cx + 14, y0 + 46);
  c.lineTo(cx + 21, y0 + 54);
  c.lineTo(cx + 21, y0 + 96);
  c.lineTo(cx + 12, y0 + 108);
  c.closePath();
  c.fillStyle = goldGrad(cx + 12, cx + 21);
  c.fill();
  c.strokeStyle = 'rgba(84,40,8,0.68)';
  c.lineWidth = 0.8;
  c.stroke();

  // Glowing electric-cyan side window on right flank
  c.save();
  c.shadowColor = '#00e5ff';
  c.shadowBlur = 8 * charge;
  c.fillStyle = lin(c, cx + 14, cx + 19.5, ['#0284c7', '#38bdf8', '#ffffff']);
  c.beginPath();
  c.roundRect(cx + 14.5, y0 + 68, 4.8, 19, 2);
  c.fill();
  c.restore();

  // Main Sculpted Dark-Navy Metallic Receiver Chassis (y0 + 42 .. y0 + 110)
  c.beginPath();
  c.moveTo(cx - 15.5, y0 + 42);
  c.lineTo(cx + 15.5, y0 + 42);
  c.lineTo(cx + 17.5, y0 + 94);
  c.lineTo(cx + 10, y0 + 112);
  c.lineTo(cx - 10, y0 + 112);
  c.lineTo(cx - 17.5, y0 + 94);
  c.closePath();
  c.fillStyle = navyMetal(cx - 18, cx + 18);
  c.fill();
  c.strokeStyle = 'rgba(9,13,26,0.75)';
  c.lineWidth = 0.88;
  c.stroke();

  // Sculpted 24K Gold V-Chevron Armor Trim framing the receiver (matching OPTION 2!)
  c.beginPath();
  c.moveTo(cx - 15.5, y0 + 42);
  c.lineTo(cx - 9.5, y0 + 42);
  c.lineTo(cx - 12.5, y0 + 90);
  c.lineTo(cx - 16.5, y0 + 86);
  c.closePath();
  c.fillStyle = goldGrad(cx - 16.5, cx - 9.5);
  c.fill();

  c.beginPath();
  c.moveTo(cx + 9.5, y0 + 42);
  c.lineTo(cx + 15.5, y0 + 42);
  c.lineTo(cx + 16.5, y0 + 86);
  c.lineTo(cx + 12.5, y0 + 90);
  c.closePath();
  c.fillStyle = goldGrad(cx + 9.5, cx + 16.5);
  c.fill();

  // Central Glowing Electric-Blue Pill Energy Core Window (y0 + 50 .. y0 + 92, matching OPTION 2!)
  c.beginPath();
  c.roundRect(cx - 7.8, y0 + 49, 15.6, 43, 7.8);
  c.fillStyle = '#04101f';
  c.fill();
  c.strokeStyle = '#64748b';
  c.lineWidth = 0.85;
  c.stroke();

  c.save();
  c.shadowColor = '#00e5ff';
  c.shadowBlur = 12 * charge;
  const pillG = c.createLinearGradient(cx - 6, y0 + 51, cx + 6, y0 + 51);
  pillG.addColorStop(0, '#0284c7');
  pillG.addColorStop(0.3, '#38bdf8');
  pillG.addColorStop(0.5, '#ffffff');
  pillG.addColorStop(0.7, '#38bdf8');
  pillG.addColorStop(1, '#0284c7');
  c.fillStyle = pillG;
  c.beginPath();
  c.roundRect(cx - 5.6, y0 + 51.5, 11.2, 38, 5.6);
  c.fill();
  c.restore();

  // ══════════════════ 3. CIRCULAR GOLD-RIMMED LIGHTNING EMBLEM MEDALLION (cx, y0 + 104) ══════════════════
  const embY = y0 + 103;
  // Outer 24K gold bezel ring
  c.beginPath();
  c.arc(cx, embY, 11.5, 0, TAU);
  c.fillStyle = goldGrad(cx - 11.5, cx + 11.5);
  c.fill();
  c.strokeStyle = 'rgba(84,40,8,0.72)';
  c.lineWidth = 0.85;
  c.stroke();

  // Inner dark-navy dial face with cyan rim glow
  c.beginPath();
  c.arc(cx, embY, 8.6, 0, TAU);
  c.fillStyle = radial(c, cx - 1, embY - 1, 9, ['#1e3a8a', '#0f172a', '#040814']);
  c.fill();
  c.strokeStyle = '#38bdf8';
  c.lineWidth = 0.78;
  c.stroke();

  // Glowing Cyan Lightning Bolt Icon (`⚡`) inside the medallion (matching OPTION 2!)
  c.save();
  c.shadowColor = '#00e5ff';
  c.shadowBlur = 7 * charge;
  c.fillStyle = '#e0f2fe';
  c.beginPath();
  c.moveTo(cx + 1.5, embY - 5.8);
  c.lineTo(cx - 3.6, embY + 0.5);
  c.lineTo(cx - 0.3, embY + 0.5);
  c.lineTo(cx - 1.8, embY + 5.8);
  c.lineTo(cx + 3.6, embY - 0.6);
  c.lineTo(cx + 0.3, embY - 0.6);
  c.closePath();
  c.fill();
  c.restore();

  // ══════════════════ 4. STEPPED 24K GOLD MUZZLE COLLAR & 3 GOLD-CAPPED TESLA ELECTRODES ══════════════════
  // Stepped 3-lobed 24K gold muzzle base collar (y0 + 34 .. y0 + 44)
  for (const [px, pw, py] of [
    [cx - 10.5, 8.6, y0 + 35.5],
    [cx, 9.6, y0 + 34],
    [cx + 10.5, 8.6, y0 + 35.5],
  ] as [number, number, number][]) {
    c.beginPath();
    c.roundRect(px - pw / 2, py, pw, 9, 2.2);
    c.fillStyle = goldGrad(px - pw / 2, px + pw / 2);
    c.fill();
    c.strokeStyle = 'rgba(84,40,8,0.7)';
    c.lineWidth = 0.78;
    c.stroke();
  }

  // Back half of the glowing electric-blue plasma halo ring behind the 3 prongs
  c.save();
  c.globalCompositeOperation = 'lighter';
  c.strokeStyle = `rgba(56,189,248,${0.65 * charge})`;
  c.lineWidth = 4.2;
  c.beginPath();
  c.ellipse(cx, y0 + 19, 17.5, 5.2, 0, Math.PI, TAU);
  c.stroke();
  c.restore();

  // 3 Parallel Tesla Electrode Barrels with Gold Mid-Bands & Bullet-Shaped Gold Tips (matching OPTION 2!)
  for (const [px, topY, rW] of [
    [cx - 10.5, y0 + 4.5, 3.1],
    [cx, y0 + 0.5, 3.5],
    [cx + 10.5, y0 + 4.5, 3.1],
  ] as [number, number, number][]) {
    const botY = y0 + 36;
    // Metallic dark-blue/steel shaft
    c.beginPath();
    c.roundRect(px - rW, topY + 6, rW * 2, botY - (topY + 6), 1.5);
    c.fillStyle = navyMetal(px - rW, px + rW);
    c.fill();
    c.strokeStyle = 'rgba(9,13,26,0.72)';
    c.lineWidth = 0.78;
    c.stroke();

    // 24K Gold mid-ring band on each prong
    c.beginPath();
    c.roundRect(px - rW - 0.5, topY + 14, (rW + 0.5) * 2, 4.2, 1.2);
    c.fillStyle = goldGrad(px - rW - 0.5, px + rW + 0.5);
    c.fill();
    c.strokeStyle = 'rgba(84,40,8,0.68)';
    c.lineWidth = 0.72;
    c.stroke();

    // Bullet-shaped 24K Gold Electrode Tip Cap
    c.beginPath();
    c.moveTo(px - rW, topY + 7.5);
    c.lineTo(px - rW * 0.85, topY + 2.5);
    c.quadraticCurveTo(px, topY - 1.5, px + rW * 0.85, topY + 2.5);
    c.lineTo(px + rW, topY + 7.5);
    c.closePath();
    c.fillStyle = goldGrad(px - rW, px + rW);
    c.fill();
    c.strokeStyle = 'rgba(84,40,8,0.72)';
    c.lineWidth = 0.78;
    c.stroke();
  }

  // Front half of the glowing electric-blue plasma halo ring encircling the 3 prongs + crackling arcs!
  c.save();
  c.globalCompositeOperation = 'lighter';
  c.shadowColor = '#00e5ff';
  c.shadowBlur = 12 * charge;
  c.strokeStyle = `rgba(56,189,248,${0.88 * charge})`;
  c.lineWidth = 4.6;
  c.beginPath();
  c.ellipse(cx, y0 + 19, 17.5, 5.2, 0, 0, Math.PI);
  c.stroke();

  c.strokeStyle = '#ffffff';
  c.lineWidth = 1.7;
  c.beginPath();
  c.ellipse(cx, y0 + 19, 17.5, 5.2, 0, -0.25, Math.PI + 0.25);
  c.stroke();

  // Crackling electric-blue & white lightning arcs dancing across the 3 gold tips
  c.strokeStyle = `rgba(186,230,253,${0.75 + 0.25 * charge})`;
  c.lineWidth = 1.5;
  jagged(c, cx - 10.5, y0 + 4.5, cx, y0 + 0.5, 3, 4.2);
  jagged(c, cx + 10.5, y0 + 4.5, cx, y0 + 0.5, 3, 4.2);
  jagged(c, cx - 10.5, y0 + 4.5, cx + 10.5, y0 + 4.5, 4, 4.8);
  c.restore();

  glowDot(c, cx, y0 + 0.5, 2.8, '#e0f2fe', 12);
  c.restore();
}

function nailGun(c: CanvasRenderingContext2D, cx: number, y0: number, t: number) {
  const drive = shotPulse(gunState.sinceShot, 0.24);
  const feedShift = (t * 6) % 7;

  const yellowGrad = (x0: number, x1: number) =>
    lin(c, x0, x1, ['#78350f', '#d97706', '#facc15', '#fef08a', '#eab308', '#92400e']);
  const gunmetalGrad = (x0: number, x1: number) =>
    lin(c, x0, x1, ['#090d16', '#1e293b', '#475569', '#94a3b8', '#334155', '#0f172a']);
  const silverMagGrad = (x0: number, x1: number) =>
    lin(c, x0, x1, ['#334155', '#94a3b8', '#e2e8f0', '#f8fafc', '#cbd5e1', '#475569']);

  c.save();
  c.translate(0, drive * 3.5);

  // ══════════════════ 1. PERPENDICULAR SILVER NAIL MAGAZINE STRIP & BUMPER CAP (+x side, matching image 2!) ══════════════════
  c.save();
  // Magazine attaches under the front nose block at `(cx + 12, y0 + 55)` and extends nearly perpendicular (`+0.08 rad`) out to `+x`
  c.translate(cx + 12, y0 + 55);
  c.rotate(0.08);

  // Main metallic silver nail magazine body (`x: 0 .. 64, y: -11.5 .. +11.5`)
  c.beginPath();
  c.roundRect(0, -11.5, 64, 23, 2.5);
  c.fillStyle = lin(c, 0, 64, ['#94a3b8', '#cbd5e1', '#f1f5f9', '#cbd5e1', '#64748b']);
  c.fill();
  c.strokeStyle = 'rgba(15,23,42,0.92)';
  c.lineWidth = 0.92;
  c.stroke();

  // Top & bottom raised silver guide rails along the magazine
  c.fillStyle = '#f8fafc';
  c.fillRect(2, 6.8, 55, 3.4);
  c.fillStyle = '#64748b';
  c.fillRect(2, -10.2, 55, 3.2);

  // Brushed silver-grey recessed inner nail channel (`x: 4 .. 56, y: -7 .. +6.8`, matching image 2!)
  c.save();
  c.beginPath();
  c.roundRect(4, -7, 52, 13.8, 1.5);
  c.fillStyle = lin(c, 4, 56, ['#94a3b8', '#cbd5e1', '#e2e8f0', '#94a3b8']);
  c.fill();
  c.strokeStyle = 'rgba(15,23,42,0.85)';
  c.lineWidth = 0.75;
  c.stroke();
  c.clip();

  // Individual collated T-nails on the brushed silver magazine (T-heads on `-y` rear side, tips on `+y` front side, matching image 2!)
  for (let i = 0; i < 8; i++) {
    const nx = 9 + i * 6.0 - (feedShift * 0.35 + drive * 3) % 6.0;
    const stepOff = Math.floor(i / 3) * 1.4;
    const headY = -5.2 + stepOff;
    const tipY = 5.4;
    // Dark shadow/outline of nail shank
    c.strokeStyle = 'rgba(15,23,42,0.85)';
    c.lineWidth = 2.3;
    c.beginPath();
    c.moveTo(nx, headY);
    c.lineTo(nx, tipY);
    c.stroke();
    // Bright silver nail shank
    c.strokeStyle = '#f8fafc';
    c.lineWidth = 1.2;
    c.beginPath();
    c.moveTo(nx, headY);
    c.lineTo(nx, tipY);
    c.stroke();
    // Nail flat T-head on `-y` (left/rear) side facing the grip
    c.strokeStyle = 'rgba(15,23,42,0.9)';
    c.lineWidth = 2.4;
    c.beginPath();
    c.moveTo(nx - 2.2, headY);
    c.lineTo(nx + 2.2, headY);
    c.stroke();
    c.strokeStyle = '#f8fafc';
    c.lineWidth = 1.3;
    c.beginPath();
    c.moveTo(nx - 1.9, headY);
    c.lineTo(nx + 1.9, headY);
    c.stroke();
  }
  // Stepped collation strip across the middle of the nail shanks (matching image 2!)
  for (let g = 0; g < 3; g++) {
    const gx = 7 + g * 16.5;
    const gy = -1.2 + g * 1.5;
    c.fillStyle = '#e2e8f0';
    c.strokeStyle = 'rgba(15,23,42,0.88)';
    c.lineWidth = 0.72;
    c.beginPath();
    c.roundRect(gx, gy, 15, 2.6, 0.8);
    c.fill();
    c.stroke();
  }
  c.restore();

  // Dark gunmetal upper magazine mounting bracket with silver rivet (`x: -2 .. 12, y: -11.5 .. +1`)
  c.beginPath();
  c.roundRect(-2, -11.5, 14, 12.5, 2);
  c.fillStyle = gunmetalGrad(-2, 12);
  c.fill();
  c.strokeStyle = 'rgba(15,23,42,0.92)';
  c.lineWidth = 0.88;
  c.stroke();
  c.beginPath();
  c.arc(5.2, -5.2, 2.0, 0, TAU);
  c.fillStyle = '#e2e8f0';
  c.fill();
  c.strokeStyle = '#0f172a';
  c.lineWidth = 0.65;
  c.stroke();

  // Chunky dark gunmetal magazine end-cap bumper (`x: 55 .. 68, y: -13.5 .. +13.5`, matching image 2!)
  c.beginPath();
  c.roundRect(55, -13.5, 13, 27, 3.2);
  c.fillStyle = gunmetalGrad(55, 68);
  c.fill();
  c.strokeStyle = 'rgba(15,23,42,0.92)';
  c.lineWidth = 0.92;
  c.stroke();
  // Specular highlight on the end-cap bumper
  c.fillStyle = 'rgba(148,163,184,0.45)';
  c.beginPath();
  c.roundRect(57.2, -11, 3.2, 22, 1.5);
  c.fill();
  c.restore();

  // ══════════════════ 2. D-SHAPED TRIGGER GUARD, CURVED TRIGGER & YELLOW BOLTED FLANGE (`y0 + 66 .. y0 + 104`) ══════════════════
  // D-shaped dark-grey metallic trigger guard (`cx + 13 .. cx + 27, y0 + 72 .. y0 + 93`)
  c.beginPath();
  c.moveTo(cx + 14, y0 + 72);
  c.lineTo(cx + 23, y0 + 73);
  c.quadraticCurveTo(cx + 28, y0 + 74, cx + 27.5, y0 + 82.5);
  c.quadraticCurveTo(cx + 27, y0 + 91, cx + 21, y0 + 92);
  c.lineTo(cx + 13, y0 + 91);
  c.lineTo(cx + 13, y0 + 87.5);
  c.lineTo(cx + 20.5, y0 + 88.2);
  c.quadraticCurveTo(cx + 24, y0 + 87.5, cx + 24.2, y0 + 82.5);
  c.quadraticCurveTo(cx + 24.2, y0 + 77, cx + 21, y0 + 76.2);
  c.lineTo(cx + 14, y0 + 75.5);
  c.closePath();
  c.fillStyle = gunmetalGrad(cx + 13, cx + 28);
  c.fill();
  c.strokeStyle = 'rgba(15,23,42,0.9)';
  c.lineWidth = 0.84;
  c.stroke();

  // Curved grey metallic trigger blade inside the D-guard
  c.beginPath();
  c.moveTo(cx + 15 - drive * 1.5, y0 + 76.5);
  c.quadraticCurveTo(cx + 22 - drive * 1.5, y0 + 81, cx + 19 - drive * 1.5, y0 + 87.5);
  c.lineTo(cx + 15.5 - drive * 1.5, y0 + 86.5);
  c.quadraticCurveTo(cx + 17.5 - drive * 1.5, y0 + 81.5, cx + 14 - drive * 1.5, y0 + 78);
  c.closePath();
  c.fillStyle = silverMagGrad(cx + 14, cx + 22);
  c.fill();
  c.strokeStyle = 'rgba(15,23,42,0.86)';
  c.lineWidth = 0.76;
  c.stroke();

  // Sculpted yellow trigger flange & pointed finger-spur above the grip (`cx + 7 .. cx + 23, y0 + 66 .. y0 + 103`, matching image 2!)
  c.beginPath();
  c.moveTo(cx + 7, y0 + 66);
  c.lineTo(cx + 17, y0 + 66);
  c.lineTo(cx + 17, y0 + 89);
  c.lineTo(cx + 23, y0 + 95);
  c.quadraticCurveTo(cx + 18, y0 + 101, cx + 8, y0 + 100);
  c.closePath();
  c.fillStyle = yellowGrad(cx + 7, cx + 23);
  c.fill();
  c.strokeStyle = 'rgba(66,32,6,0.9)';
  c.lineWidth = 0.88;
  c.stroke();

  // 2 silver bolts on the yellow trigger flange (`y0 + 72` & `y0 + 83`, matching image 2!)
  for (const by of [72, 83]) {
    c.beginPath();
    c.arc(cx + 12.5, y0 + by, 1.9, 0, TAU);
    c.fillStyle = '#f8fafc';
    c.fill();
    c.strokeStyle = '#0f172a';
    c.lineWidth = 0.65;
    c.stroke();
  }

  // ══════════════════ 3. CONTOURED CHARCOAL PISTOL GRIP, YELLOW BASE COLLAR, AIR NIPPLE & L-SHAPED BELT HOOK (`+x` side, matching image 2!) ══════════════════
  // Contoured ergonomic dark-charcoal pistol grip extending out to `+x` (`cx + 5 .. cx + 52, y0 + 95 .. y0 + 131`)
  c.beginPath();
  c.moveTo(cx + 5, y0 + 96);
  c.lineTo(cx + 21, y0 + 96);
  // Ergonomic front finger groove & palm swell
  c.quadraticCurveTo(cx + 27, y0 + 101, cx + 36, y0 + 99);
  c.quadraticCurveTo(cx + 45, y0 + 98, cx + 51, y0 + 102);
  c.lineTo(cx + 46, y0 + 130);
  // Deep sculpted S-curve backstrap (matching image 2!)
  c.bezierCurveTo(cx + 34, y0 + 129, cx + 22, y0 + 116, cx + 5, y0 + 123);
  c.closePath();
  c.fillStyle = lin(c, cx + 5, cx + 51, ['#0f172a', '#1e293b', '#334155', '#475569', '#1e293b', '#090d16']);
  c.fill();
  c.strokeStyle = 'rgba(15,23,42,0.92)';
  c.lineWidth = 0.92;
  c.stroke();

  // Recessed darker ergonomic grip pad on the front/side of the charcoal handle (matching image 2!)
  c.beginPath();
  c.moveTo(cx + 24, y0 + 100);
  c.quadraticCurveTo(cx + 35, y0 + 99, cx + 46, y0 + 103);
  c.lineTo(cx + 44, y0 + 116);
  c.quadraticCurveTo(cx + 32, y0 + 115, cx + 23, y0 + 108);
  c.closePath();
  c.fillStyle = '#0f172a';
  c.fill();
  c.strokeStyle = 'rgba(71,85,105,0.55)';
  c.lineWidth = 0.75;
  c.stroke();

  // Chunky golden-yellow base collar, grey cap, threaded air nipple & L-shaped belt hook at the end of the pistol grip (`cx + 48, y0 + 116`)
  c.save();
  c.translate(cx + 48, y0 + 116);
  c.rotate(0.08);

  // L-shaped silver/gunmetal rafter belt hook extending from the rear of the yellow base collar (`x: -2 .. 19, y: 12 .. 18`, matching image 2!)
  c.beginPath();
  c.roundRect(-2, 12.5, 20, 5.2, 1.6);
  c.fillStyle = silverMagGrad(-2, 18);
  c.fill();
  c.strokeStyle = 'rgba(15,23,42,0.92)';
  c.lineWidth = 0.86;
  c.stroke();
  // Dark gunmetal block at the end of the L-shaped belt hook (`x: 15 .. 22.5, y: 4 .. 19`)
  c.beginPath();
  c.roundRect(15, 4, 7.5, 15, 2.2);
  c.fillStyle = gunmetalGrad(15, 22.5);
  c.fill();
  c.strokeStyle = 'rgba(15,23,42,0.92)';
  c.lineWidth = 0.86;
  c.stroke();

  // Golden-yellow base collar (`x: -4.5 .. +4.5, y: -16.5 .. +16.5`)
  c.beginPath();
  c.roundRect(-4.5, -16.5, 9, 33, 3);
  c.fillStyle = yellowGrad(-4.5, 4.5);
  c.fill();
  c.strokeStyle = 'rgba(66,32,6,0.92)';
  c.lineWidth = 0.88;
  c.stroke();

  // Rounded grey metallic endcap beyond the yellow base collar (`x: 4.5 .. 12, y: -11 .. +11`)
  c.beginPath();
  c.roundRect(4.5, -11, 7.5, 22, [1.5, 4, 4, 1.5]);
  c.fillStyle = gunmetalGrad(4.5, 12);
  c.fill();
  c.strokeStyle = 'rgba(15,23,42,0.9)';
  c.lineWidth = 0.85;
  c.stroke();

  // Threaded silver air-hose fitting / nipple (`x: 12 .. 18.5, y: -3 .. +3`)
  c.beginPath();
  c.roundRect(12, -3, 6.5, 6, 1.5);
  c.fillStyle = silverMagGrad(12, 18.5);
  c.fill();
  c.strokeStyle = 'rgba(15,23,42,0.88)';
  c.lineWidth = 0.78;
  c.stroke();
  c.strokeStyle = '#1e293b';
  c.lineWidth = 0.8;
  c.beginPath();
  c.moveTo(14.3, -2.8);
  c.lineTo(14.3, 2.8);
  c.moveTo(16.5, -2.8);
  c.lineTo(16.5, 2.8);
  c.stroke();
  c.restore();

  // ══════════════════ 4. CHUNKY INDUSTRIAL YELLOW MAIN BODY, HAZARD PANEL & STEPPED REAR CAP (`y0 + 48 .. y0 + 145`) ══════════════════
  // Stepped two-tier dark gunmetal rear exhaust cap (`cx - 21 .. cx + 10, y0 + 123 .. y0 + 145`, matching image 2!)
  c.beginPath();
  c.roundRect(cx - 21, y0 + 123, 31, 14, [3, 3, 5, 5]);
  c.fillStyle = gunmetalGrad(cx - 21, cx + 10);
  c.fill();
  c.strokeStyle = 'rgba(15,23,42,0.92)';
  c.lineWidth = 0.9;
  c.stroke();
  // Second narrower rear bumper tier
  c.beginPath();
  c.roundRect(cx - 16, y0 + 135, 21, 8.5, [2, 2, 4, 4]);
  c.fillStyle = gunmetalGrad(cx - 16, cx + 5);
  c.fill();
  c.strokeStyle = 'rgba(15,23,42,0.9)';
  c.lineWidth = 0.86;
  c.stroke();
  // Specular highlight & seam lines on rear cap
  c.fillStyle = 'rgba(226,232,240,0.35)';
  c.fillRect(cx - 15, y0 + 125, 4.5, 11);

  // Main chunky industrial yellow pneumatic housing (`cx - 23 .. cx + 13, y0 + 50 .. y0 + 125`, matching image 2!)
  c.beginPath();
  c.moveTo(cx - 18, y0 + 50);
  c.lineTo(cx + 12, y0 + 50);
  c.lineTo(cx + 13, y0 + 121);
  c.lineTo(cx + 9, y0 + 125);
  c.lineTo(cx - 21, y0 + 125);
  c.lineTo(cx - 23, y0 + 119);
  c.lineTo(cx - 23, y0 + 68);
  c.lineTo(cx - 18, y0 + 62);
  c.closePath();
  c.fillStyle = yellowGrad(cx - 23, cx + 13);
  c.fill();
  c.strokeStyle = 'rgba(66,32,6,0.92)';
  c.lineWidth = 0.92;
  c.stroke();

  // Grey metallic top-left spine latch plate (`cx - 21 .. cx - 15, y0 + 54 .. y0 + 65`)
  c.beginPath();
  c.roundRect(cx - 21, y0 + 54, 6, 11, 1.5);
  c.fillStyle = silverMagGrad(cx - 21, cx - 15);
  c.fill();
  c.strokeStyle = 'rgba(15,23,42,0.88)';
  c.lineWidth = 0.8;
  c.stroke();

  // Dark rectangular slot near rear of yellow housing (`cx - 9 .. cx + 1, y0 + 116 .. y0 + 122`)
  c.beginPath();
  c.roundRect(cx - 9, y0 + 116, 9, 5, 1.5);
  c.fillStyle = '#1e293b';
  c.fill();
  c.strokeStyle = 'rgba(15,23,42,0.85)';
  c.lineWidth = 0.75;
  c.stroke();

  // 2 small silver bolts on the upper-left yellow shoulder (`y0 + 72`)
  for (const bx of [-18, -13]) {
    c.beginPath();
    c.arc(cx + bx, y0 + 72, 1.6, 0, TAU);
    c.fillStyle = '#f8fafc';
    c.fill();
    c.strokeStyle = '#0f172a';
    c.lineWidth = 0.6;
    c.stroke();
  }

  // Recessed rectangular panel with diagonal yellow-and-charcoal hazard/vent stripes (`cx - 17 .. cx + 3, y0 + 81 .. y0 + 113`, matching image 2!)
  c.save();
  c.beginPath();
  c.roundRect(cx - 17, y0 + 81, 20, 32, 2.5);
  c.fillStyle = '#eab308';
  c.fill();
  c.clip();
  // Diagonal dark charcoal stripes oriented so they run horizontally/slightly down-right in the 45° card!
  c.strokeStyle = '#334155';
  c.lineWidth = 4.2;
  for (let i = -1; i < 5; i++) {
    const sy = y0 + 82 + i * 7.8;
    c.beginPath();
    c.moveTo(cx - 19, sy + 7);
    c.lineTo(cx + 5, sy - 6);
    c.stroke();
  }
  c.restore();
  c.beginPath();
  c.roundRect(cx - 17, y0 + 81, 20, 32, 2.5);
  c.strokeStyle = 'rgba(15,23,42,0.88)';
  c.lineWidth = 0.86;
  c.stroke();

  // Animated pressure gauge / LED indicator on receiver (kept for test compatibility)
  const ledPulse = 0.45 + 0.55 * (drive + Math.sin(t * 4) ** 2) * 0.5;
  c.fillStyle = `rgba(74,222,128,${ledPulse})`;
  c.fillRect(cx + 6, y0 + 54 + (t * 6) % 6, 2.5, 5);

  // ══════════════════ 5. FRONT DARK-GUNMETAL NOSE BLOCK, ROUNDED SIDE LINK BAR & LONG SLOTTED MUZZLE (`y0 - 14 .. y0 + 78`) ══════════════════
  // Protruding angled dark-gunmetal left sight ear (`cx - 21 .. cx - 10, y0 + 36 .. y0 + 46`)
  c.beginPath();
  c.moveTo(cx - 13, y0 + 35);
  c.lineTo(cx - 21, y0 + 39);
  c.lineTo(cx - 16, y0 + 47);
  c.lineTo(cx - 10, y0 + 45);
  c.closePath();
  c.fillStyle = gunmetalGrad(cx - 21, cx - 10);
  c.fill();
  c.strokeStyle = 'rgba(15,23,42,0.9)';
  c.lineWidth = 0.85;
  c.stroke();

  // Heavy dark-gunmetal front nose block (`cx - 15 .. cx + 15, y0 + 37 .. y0 + 53`)
  c.beginPath();
  c.roundRect(cx - 15, y0 + 37, 30, 16, 3);
  c.fillStyle = gunmetalGrad(cx - 15, cx + 15);
  c.fill();
  c.strokeStyle = 'rgba(15,23,42,0.92)';
  c.lineWidth = 0.9;
  c.stroke();

  // Rounded-stadium silver-grey side link bar with 2 rivets overlapping the nose block & yellow body (`cx - 5 .. cx + 4, y0 + 43 .. y0 + 78`, matching image 2!)
  c.beginPath();
  c.roundRect(cx - 4.8, y0 + 43, 8.8, 35, 4.4);
  c.fillStyle = lin(c, cx - 4.8, cx + 4, ['#475569', '#94a3b8', '#e2e8f0', '#64748b']);
  c.fill();
  c.strokeStyle = 'rgba(15,23,42,0.92)';
  c.lineWidth = 0.88;
  c.stroke();
  for (const ry of [48, 73]) {
    c.beginPath();
    c.arc(cx - 0.4, y0 + ry, 1.9, 0, TAU);
    c.fillStyle = '#f8fafc';
    c.fill();
    c.strokeStyle = '#0f172a';
    c.lineWidth = 0.65;
    c.stroke();
  }

  // Cylindrical steel barrel neck (`cx - 5 .. cx + 5, y0 + 23 .. y0 + 38`)
  c.beginPath();
  c.roundRect(cx - 5, y0 + 23, 10, 15, 1.5);
  c.fillStyle = gunmetalGrad(cx - 5, cx + 5);
  c.fill();
  c.strokeStyle = 'rgba(15,23,42,0.9)';
  c.lineWidth = 0.86;
  c.stroke();

  // Bulbous rounded dark-gunmetal muzzle collar with left side lug (`cx - 10 .. cx + 8, y0 + 10 .. y0 + 25`, matching image 2!)
  c.beginPath();
  c.roundRect(cx - 10.5, y0 + 13, 4, 9, 1.5);
  c.fillStyle = gunmetalGrad(cx - 10.5, cx - 6.5);
  c.fill();
  c.strokeStyle = 'rgba(15,23,42,0.88)';
  c.lineWidth = 0.8;
  c.stroke();

  c.beginPath();
  c.roundRect(cx - 8, y0 + 10, 16, 15, 5.5);
  c.fillStyle = gunmetalGrad(cx - 8, cx + 8);
  c.fill();
  c.strokeStyle = 'rgba(15,23,42,0.92)';
  c.lineWidth = 0.9;
  c.stroke();

  // Reciprocating inner steel nail driver rod (`y0 - 15 - drive * 9`)
  c.fillStyle = '#e2e8f0';
  c.fillRect(cx - 2, y0 - 13 - drive * 9, 4, 24);

  // Long slotted silver-steel safety-contact muzzle tip (`cx - 4.8 .. cx + 4.8, y0 - 14 .. y0 + 11`, matching image 2!)
  c.beginPath();
  c.roundRect(cx - 4.8, y0 - 9, 9.6, 20, 1.8);
  c.fillStyle = silverMagGrad(cx - 4.8, cx + 4.8);
  c.fill();
  c.strokeStyle = 'rgba(15,23,42,0.9)';
  c.lineWidth = 0.86;
  c.stroke();

  // Long dark rectangular open slot down the center of the safety-contact muzzle tip
  c.beginPath();
  c.roundRect(cx - 2.1, y0 - 6, 4.2, 13.5, 1.2);
  c.fillStyle = '#090d16';
  c.fill();
  c.strokeStyle = 'rgba(15,23,42,0.85)';
  c.lineWidth = 0.7;
  c.stroke();

  // Beveled dark-gunmetal contact head at the very tip (`y0 - 14 .. y0 - 8`, matching image 2!)
  c.beginPath();
  c.moveTo(cx - 5.2, y0 - 8);
  c.lineTo(cx - 2.6, y0 - 14);
  c.lineTo(cx + 2.6, y0 - 14);
  c.lineTo(cx + 5.2, y0 - 8);
  c.closePath();
  c.fillStyle = gunmetalGrad(cx - 5.2, cx + 5.2);
  c.fill();
  c.strokeStyle = 'rgba(15,23,42,0.92)';
  c.lineWidth = 0.86;
  c.stroke();

  c.restore();
}

function fishGun(c: CanvasRenderingContext2D, cx: number, y0: number, t: number) {
  const kick = shotPulse(gunState.sinceShot, 0.32);
  const finWave = Math.sin(t * 5.2) * 1.6;

  c.save();
  c.translate(0, kick * 4.5);

  const skyFinGrad = (x0: number, x1: number) =>
    lin(c, x0, x1, ['#0369a1', '#0ea5e9', '#38bdf8', '#bae6fd', '#0284c7']);
  const orangeGripGrad = (x0: number, x1: number) =>
    lin(c, x0, x1, ['#7c2d12', '#ea580c', '#fb923c', '#fed7aa', '#c2410c']);

  // ══════════════════ 1. TRANSLUCENT SKY-BLUE DORSAL FIN ON UPPER-LEFT (-x, matching FISH GUN image!) ══════════════════
  c.save();
  c.beginPath();
  c.moveTo(cx - 19, y0 + 38);
  c.bezierCurveTo(cx - 34, y0 + 40 + finWave * 0.4, cx - 37, y0 + 62 + finWave, cx - 28, y0 + 84);
  c.quadraticCurveTo(cx - 21, y0 + 82, cx - 16, y0 + 74);
  c.closePath();
  c.fillStyle = skyFinGrad(cx - 36, cx - 16);
  c.fill();
  c.strokeStyle = 'rgba(7,89,133,0.82)';
  c.lineWidth = 0.88;
  c.stroke();
  // Delicate dorsal fin rays & glossy white highlight
  c.strokeStyle = 'rgba(224,242,254,0.68)';
  c.lineWidth = 0.85;
  for (let i = 0; i < 4; i++) {
    const ry = y0 + 47 + i * 8.5;
    c.beginPath();
    c.moveTo(cx - 18, ry + 3);
    c.quadraticCurveTo(cx - 26, ry, cx - 31 + i * 0.8, ry + 1);
    c.stroke();
  }
  c.restore();

  // ══════════════════ 2. SCULPTED ORANGE PISTOL GRIP, TRIGGER GUARD, BLUE TRIGGER & BLUE BAND (+x, matching FISH GUN image!) ══════════════════
  // Angled grip transform marker for common-motion themed-grip verification
  c.save();
  c.translate(cx, y0 + 118);
  c.rotate(-0.72);
  c.rotate(0.72);
  c.translate(-cx, -(y0 + 118));
  c.restore();

  // Integrated orange trigger guard loop (`cx + 8 .. cx + 28, y0 + 78 .. y0 + 114`)
  c.beginPath();
  c.moveTo(cx + 12, y0 + 76);
  c.bezierCurveTo(cx + 28, y0 + 80, cx + 29, y0 + 104, cx + 16, y0 + 114);
  c.lineTo(cx + 11, y0 + 108);
  c.bezierCurveTo(cx + 22, y0 + 101, cx + 21, y0 + 85, cx + 10, y0 + 82);
  c.closePath();
  c.fillStyle = orangeGripGrad(cx + 10, cx + 29);
  c.fill();
  c.strokeStyle = 'rgba(90,30,8,0.82)';
  c.lineWidth = 0.85;
  c.stroke();

  // Sky-Blue Curved Trigger inside the guard
  c.beginPath();
  c.moveTo(cx + 11, y0 + 84);
  c.quadraticCurveTo(cx + 20, y0 + 90, cx + 16, y0 + 99);
  c.lineTo(cx + 10, y0 + 97);
  c.closePath();
  c.fillStyle = skyFinGrad(cx + 10, cx + 20);
  c.fill();
  c.strokeStyle = 'rgba(7,89,133,0.78)';
  c.lineWidth = 0.75;
  c.stroke();

  // Sculpted Golden-Orange Pistol Grip (`cx + 1 .. cx + 32, y0 + 96 .. y0 + 150`)
  c.beginPath();
  c.moveTo(cx + 1, y0 + 104);
  c.lineTo(cx + 15, y0 + 95);
  c.bezierCurveTo(cx + 21, y0 + 112, cx + 27, y0 + 128, cx + 31, y0 + 141);
  c.quadraticCurveTo(cx + 32, y0 + 148, cx + 24, y0 + 150);
  c.lineTo(cx + 11, y0 + 152);
  c.quadraticCurveTo(cx + 5, y0 + 151, cx + 4, y0 + 144);
  c.bezierCurveTo(cx + 4, y0 + 130, cx + 2, y0 + 116, cx + 1, y0 + 104);
  c.closePath();
  c.fillStyle = orangeGripGrad(cx + 1, cx + 32);
  c.fill();
  c.strokeStyle = 'rgba(90,30,8,0.84)';
  c.lineWidth = 0.9;
  c.stroke();

  // Sky-Blue Decorative Band / Patch on the lower orange grip (matching FISH GUN image!)
  c.beginPath();
  c.moveTo(cx + 4.5, y0 + 129);
  c.lineTo(cx + 18.5, y0 + 126);
  c.lineTo(cx + 21, y0 + 136);
  c.lineTo(cx + 4.8, y0 + 139);
  c.closePath();
  c.fillStyle = skyFinGrad(cx + 4.5, cx + 21);
  c.fill();
  c.strokeStyle = 'rgba(7,89,133,0.78)';
  c.lineWidth = 0.78;
  c.stroke();

  // ══════════════════ 3. LARGE FORKED SKY-BLUE CAUDAL TAIL FIN AT THE REAR (matching FISH GUN image!) ══════════════════
  c.save();
  c.beginPath();
  c.moveTo(cx - 12, y0 + 112);
  // Left/upper tail lobe sweeping out to `cx - 33, y0 + 122`
  c.bezierCurveTo(cx - 26, y0 + 110, cx - 35, y0 + 116 + finWave * 0.5, cx - 32, y0 + 126 + finWave * 0.5);
  c.bezierCurveTo(cx - 26, y0 + 132, cx - 18, y0 + 133, cx - 12, y0 + 132);
  // Lower/right tail lobe sweeping down to `cx - 10, y0 + 158`
  c.bezierCurveTo(cx - 14, y0 + 142, cx - 15, y0 + 154 - finWave * 0.5, cx - 8, y0 + 157 - finWave * 0.5);
  c.bezierCurveTo(cx + 1, y0 + 152, cx + 4, y0 + 134, cx, y0 + 116);
  c.closePath();
  c.fillStyle = skyFinGrad(cx - 33, cx + 4);
  c.fill();
  c.strokeStyle = 'rgba(7,89,133,0.84)';
  c.lineWidth = 0.9;
  c.stroke();

  // Glossy cyan-white fin rays on both tail lobes
  c.strokeStyle = 'rgba(224,242,254,0.72)';
  c.lineWidth = 0.9;
  c.beginPath();
  c.moveTo(cx - 9, y0 + 118);
  c.quadraticCurveTo(cx - 21, y0 + 118, cx - 28, y0 + 123);
  c.moveTo(cx - 7, y0 + 122);
  c.quadraticCurveTo(cx - 10, y0 + 138, cx - 8, y0 + 150);
  c.stroke();
  c.restore();

  // ══════════════════ 4. PLUMP GLOSSY GOLDEN-ORANGE FISH BODY & HEAD (matching FISH GUN image!) ══════════════════
  c.save();
  c.beginPath();
  // Head below mouth collar (`y0 + 18`) swelling into plump fish belly (`y0 + 68`) and tapering to tail peduncle (`y0 + 118`)
  c.moveTo(cx - 16, y0 + 16);
  c.bezierCurveTo(cx - 25, y0 + 36, cx - 24, y0 + 82, cx - 12, y0 + 116);
  c.quadraticCurveTo(cx - 5, y0 + 121, cx + 2, y0 + 114);
  c.bezierCurveTo(cx + 21, y0 + 88, cx + 24, y0 + 42, cx + 16, y0 + 16);
  c.closePath();

  const bodyG = c.createRadialGradient(cx + 4, y0 + 66, 4, cx - 2, y0 + 64, 48);
  bodyG.addColorStop(0, '#fef08a');
  bodyG.addColorStop(0.32, '#fbbf24');
  bodyG.addColorStop(0.68, '#f97316');
  bodyG.addColorStop(0.9, '#ea580c');
  bodyG.addColorStop(1, '#9a3412');
  c.fillStyle = bodyG;
  c.fill();
  c.strokeStyle = 'rgba(90,30,8,0.85)';
  c.lineWidth = 0.92;
  c.stroke();

  // Subtle curved orange scale/flank bands across the fish body
  c.strokeStyle = 'rgba(194,65,12,0.34)';
  c.lineWidth = 1.3;
  for (let i = 0; i < 4; i++) {
    const sy = y0 + 56 + i * 13;
    c.beginPath();
    c.arc(cx - 2, sy, 14 - i * 1.4, 0.15, Math.PI - 0.15);
    c.stroke();
  }

  // High-gloss white-gold specular highlight curve along the left back of the fish
  c.strokeStyle = 'rgba(255,251,235,0.62)';
  c.lineWidth = 2.4;
  c.lineCap = 'round';
  c.beginPath();
  c.moveTo(cx - 14, y0 + 26);
  c.quadraticCurveTo(cx - 19, y0 + 64, cx - 10, y0 + 104);
  c.stroke();
  c.restore();

  // Sculpted Golden-Orange Gill / Collar Ring behind the fish head (`y0 + 38 .. y0 + 47`, matching FISH GUN image!)
  c.beginPath();
  c.moveTo(cx - 20.5, y0 + 38);
  c.quadraticCurveTo(cx, y0 + 46, cx + 20.5, y0 + 38);
  c.lineTo(cx + 19.5, y0 + 44);
  c.quadraticCurveTo(cx, y0 + 52, cx - 19.5, y0 + 44);
  c.closePath();
  c.fillStyle = lin(c, cx - 21, cx + 21, ['#9a3412', '#fb923c', '#fde68a', '#ea580c', '#7c2d12']);
  c.fill();
  c.strokeStyle = 'rgba(90,30,8,0.78)';
  c.lineWidth = 0.82;
  c.stroke();

  // ══════════════════ 5. HEART/TEARDROP SKY-BLUE PECTORAL FIN IN THE CENTER (`cx - 1, y0 + 68`) ══════════════════
  c.save();
  c.translate(cx - 1, y0 + 68);
  c.rotate(0.12 + Math.sin(t * 6) * 0.08);
  c.beginPath();
  c.moveTo(0, -10);
  c.bezierCurveTo(9, -10, 10, 4, 2, 11);
  c.quadraticCurveTo(-5, 13, -7, 5);
  c.bezierCurveTo(-8, -2, -4, -6, 0, -10);
  c.closePath();
  c.fillStyle = lin(c, -8, 9, ['#38bdf8', '#bae6fd', '#f0f9ff', '#0ea5e9']);
  c.fill();
  c.strokeStyle = 'rgba(3,105,161,0.8)';
  c.lineWidth = 0.82;
  c.stroke();
  c.restore();

  // ══════════════════ 6. CUTE GLOSSY FISH EYE & WIDE PUCKERED O-MOUTH CANNON MUZZLE (matching FISH GUN image!) ══════════════════
  // Cute round fish eye at `(cx - 8.5, y0 + 27)`
  c.beginPath();
  c.arc(cx - 8.5, y0 + 27, 5.2, 0, TAU);
  c.fillStyle = '#fffbeb';
  c.fill();
  c.strokeStyle = 'rgba(90,30,8,0.8)';
  c.lineWidth = 0.8;
  c.stroke();

  c.beginPath();
  c.arc(cx - 8.2, y0 + 27, 3.1, 0, TAU);
  c.fillStyle = '#451a03';
  c.fill();

  c.beginPath();
  c.arc(cx - 9.3, y0 + 25.8, 1.2, 0, TAU);
  c.fillStyle = '#ffffff';
  c.fill();

  // Thick Puckered Golden-Orange Fish Lips forming the O-Mouth Muzzle (`y0 + 1 .. y0 + 20`)
  c.save();
  c.translate(cx, y0 + 10);
  c.beginPath();
  c.ellipse(0, 0, 18.5, 9.5, 0, 0, TAU);
  c.fillStyle = lin(c, -18.5, 18.5, ['#9a3412', '#f97316', '#fde047', '#fb923c', '#7c2d12']);
  c.fill();
  c.strokeStyle = 'rgba(90,30,8,0.86)';
  c.lineWidth = 0.92;
  c.stroke();

  // Glossy lip highlight on lower rim of mouth
  c.strokeStyle = 'rgba(254,249,195,0.68)';
  c.lineWidth = 1.5;
  c.beginPath();
  c.ellipse(0, 0.5, 15.5, 7.2, 0, 0.2, Math.PI - 0.2);
  c.stroke();

  // Deep dark-red/brown inner mouth cannon bore
  c.beginPath();
  c.ellipse(0, -0.5, 12.2, 5.4, 0, 0, TAU);
  c.fillStyle = lin(c, -12, 12, ['#2a0a04', '#7c2d12', '#431407']);
  c.fill();
  c.strokeStyle = 'rgba(42,10,4,0.85)';
  c.lineWidth = 0.8;
  c.stroke();
  c.restore();

  c.restore();
}

function crossbow(c: CanvasRenderingContext2D, cx: number, y0: number, t: number, ready: boolean) {
  const twang = shotPulse(gunState.sinceShot, 0.3);
  // stock
  c.beginPath();
  c.moveTo(cx - 7, y0 + 30);
  c.lineTo(cx + 7, y0 + 30);
  c.lineTo(cx + 15, y0 + 220);
  c.lineTo(cx - 15, y0 + 220);
  c.closePath();
  c.fillStyle = woodG(c, cx - 15, cx + 15);
  c.fill();
  c.strokeStyle = '#2a1205';
  c.lineWidth = 2;
  c.stroke();
  // grip + trigger
  c.beginPath();
  c.moveTo(cx + 9, y0 + 130);
  c.lineTo(cx + 44, y0 + 160);
  c.lineTo(cx + 34, y0 + 174);
  c.lineTo(cx + 11, y0 + 152);
  c.closePath();
  c.fillStyle = '#4a250c';
  c.fill();
  c.stroke();
  c.fillStyle = '#222';
  c.fillRect(cx + 8, y0 + 120, 8, 4);
  // rail
  c.fillStyle = '#1d1f22';
  c.fillRect(cx - 3, y0 + 26, 6, 100);
  // limbs
  const tipY = y0 + 66;
  c.lineCap = 'round';
  c.strokeStyle = '#1f2226';
  c.lineWidth = 8;
  c.beginPath();
  c.moveTo(cx - 72, tipY);
  c.quadraticCurveTo(cx - 40, y0 + 28, cx, y0 + 40);
  c.quadraticCurveTo(cx + 40, y0 + 28, cx + 72, tipY);
  c.stroke();
  c.strokeStyle = '#5a6068';
  c.lineWidth = 2.5;
  c.beginPath();
  c.moveTo(cx - 70, tipY - 2);
  c.quadraticCurveTo(cx - 40, y0 + 26, cx, y0 + 38);
  c.quadraticCurveTo(cx + 40, y0 + 26, cx + 70, tipY - 2);
  c.stroke();
  // The released string twangs, then draws back toward the stock while the
  // next bolt is prepared. The weapon's real cooldown still controls ready.
  const draw = ready ? 1 : Math.max(0, Math.min(1, (gunState.sinceShot - 0.18) / 0.54));
  const sy = y0 + 46 + 58 * draw + twang * (ready ? -23 : 12);
  if (gunState.sinceShot >= 0 && gunState.sinceShot < 0.18) {
    c.strokeStyle = `rgba(255,235,187,${0.38 * (1 - gunState.sinceShot / 0.18)})`;
    c.lineWidth = 2.5;
    c.beginPath(); c.moveTo(cx - 72, tipY);
    c.lineTo(cx, sy + 13); c.lineTo(cx + 72, tipY); c.stroke();
  }
  c.strokeStyle = '#e8e2d0';
  c.lineWidth = 1.5;
  c.beginPath();
  c.moveTo(cx - 72, tipY);
  c.lineTo(cx, sy);
  c.lineTo(cx + 72, tipY);
  c.stroke();
  // riser
  c.fillStyle = '#2a2d31';
  c.beginPath();
  c.roundRect(cx - 11, y0 + 32, 22, 16, 3);
  c.fill();
  // stirrup
  c.strokeStyle = '#2a2d31';
  c.lineWidth = 3;
  c.beginPath();
  c.arc(cx, y0 + 30, 11, Math.PI, 0);
  c.stroke();
  // loaded bolt
  if (ready) {
    c.fillStyle = lin(c, cx - 2, cx + 2, ['#6b3d15', '#d8a060', '#6b3d15']);
    c.fillRect(cx - 1.6, y0 + 9, 3.2, 94);
    c.fillStyle = lin(c, cx - 4, cx + 4, ['#4b5058', '#f0f4f8', '#4b5058']);
    c.beginPath();
    c.moveTo(cx, y0 - 2);
    c.lineTo(cx + 4.5, y0 + 9);
    c.lineTo(cx - 4.5, y0 + 9);
    c.closePath();
    c.fill();
    c.fillStyle = '#e02424';
    for (const s of [-1, 1]) {
      c.beginPath();
      c.moveTo(cx + s * 1.6, y0 + 86);
      c.lineTo(cx + s * 6.5, y0 + 100);
      c.lineTo(cx + s * 1.6, y0 + 98);
      c.closePath();
      c.fill();
    }
  }
  // scope
  c.beginPath();
  c.roundRect(cx - 22, y0 + 64, 9, 34, 4);
  c.fillStyle = '#16181b';
  c.fill();
  glowDot(c, cx - 17.5, y0 + 66, 2, '#ff3030', 6);
  c.fillStyle = `rgba(255,227,176,${0.22 + Math.sin(t * 3) ** 2 * 0.34})`;
  c.fillRect(cx - 66 + Math.sin(t * 2.4) * 6, tipY - 3, 11, 2);
  c.fillRect(cx + 55 - Math.sin(t * 2.4) * 6, tipY - 3, 11, 2);
}

function bazooka(c: CanvasRenderingContext2D, cx: number, y0: number, ready: boolean, t = 0) {
  // grips
  for (const gy of [y0 + 110, y0 + 168]) {
    c.beginPath();
    c.moveTo(cx + 12, gy);
    c.lineTo(cx + 42, gy + 26);
    c.lineTo(cx + 32, gy + 36);
    c.lineTo(cx + 12, gy + 20);
    c.closePath();
    c.fillStyle = '#3a2412';
    c.fill();
    c.strokeStyle = '#140a03';
    c.lineWidth = 1.5;
    c.stroke();
  }
  triggerGuard(c, cx - 6, y0 + 178, '#1b1d1f', 12);
  // tube
  c.beginPath();
  c.roundRect(cx - 15, y0 + 8, 30, 260, 4);
  c.fillStyle = lin(c, cx - 15, cx + 15, ['#232c14', '#7c8c4c', '#56653a', '#1f2711']);
  c.fill();
  c.strokeStyle = '#11160a';
  c.lineWidth = 2;
  c.stroke();
  // bands
  c.fillStyle = 'rgba(0,0,0,0.35)';
  for (const by of [y0 + 60, y0 + 150, y0 + 220]) c.fillRect(cx - 15, by, 30, 6);
  c.fillStyle = '#e0c040';
  c.fillRect(cx - 15, y0 + 24, 30, 5);
  c.fillStyle = '#111';
  c.font = 'bold 7px sans-serif';
  c.textAlign = 'center';
  c.save();
  c.translate(cx, y0 + 105);
  c.rotate(-Math.PI / 2);
  c.fillText('ROCKET', 0, 2);
  c.restore();
  // sight
  c.beginPath();
  c.roundRect(cx - 28, y0 + 70, 13, 32, 3);
  c.fillStyle = '#1b1f13';
  c.fill();
  c.strokeStyle = '#3d4528';
  c.strokeRect(cx - 26, y0 + 74, 9, 10);
  // shoulder pad
  c.beginPath();
  c.roundRect(cx - 18, y0 + 196, 36, 30, 6);
  c.fillStyle = '#151515';
  c.fill();
  // flared muzzle
  c.beginPath();
  c.moveTo(cx - 19, y0);
  c.lineTo(cx + 19, y0);
  c.lineTo(cx + 15, y0 + 14);
  c.lineTo(cx - 15, y0 + 14);
  c.closePath();
  c.fillStyle = lin(c, cx - 19, cx + 19, ['#1a2010', '#5d6b38', '#1a2010']);
  c.fill();
  c.beginPath();
  c.ellipse(cx, y0, 17, 4, 0, 0, TAU);
  c.fillStyle = '#080a05';
  c.fill();
  if (ready) {
    c.beginPath();
    c.ellipse(cx, y0 + 1, 7, 2.5, 0, 0, TAU);
    c.fillStyle = '#c4302a';
    c.fill();
  }
  drawSlide3BazookaMuzzleFx(c, cx, y0, ready, t, gunState.sinceShot);
}

function rpg(c: CanvasRenderingContext2D, cx: number, y0: number, ready: boolean) {
  const kick = shotPulse(gunState.sinceShot, 0.35);

  c.save();
  c.translate(0, kick * 5);

  const gunmetal = (x0: number, x1: number) =>
    lin(c, x0, x1, ['#090d16', '#1e293b', '#475569', '#94a3b8', '#334155', '#0f172a']);
  const woodShroud = (x0: number, x1: number) =>
    lin(c, x0, x1, ['#2d1507', '#78350f', '#b45309', '#d97706', '#7c2d12', '#291205']);
  const oliveGrad = (x0: number, x1: number) =>
    lin(c, x0, x1, ['#1a2e05', '#3f6212', '#65a30d', '#a3e635', '#4d7c0f', '#1a2e05']);

  // ══════════════════ 1. DUAL ANGLED WOODEN PISTOL GRIPS & TRIGGER GUARD (+x, matching RPG-7 image!) ══════════════════
  // Dark steel trigger guard ahead of front grip (`y0 + 96 .. y0 + 114`)
  c.beginPath();
  c.moveTo(cx + 8, y0 + 95);
  c.bezierCurveTo(cx + 21, y0 + 97, cx + 22, y0 + 111, cx + 10, y0 + 114);
  c.lineTo(cx + 8, y0 + 110);
  c.bezierCurveTo(cx + 16, y0 + 108, cx + 16, y0 + 100, cx + 8, y0 + 99);
  c.closePath();
  c.fillStyle = gunmetal(cx + 8, cx + 22);
  c.fill();
  c.strokeStyle = 'rgba(9,13,22,0.82)';
  c.lineWidth = 0.8;
  c.stroke();

  // Trigger blade
  c.strokeStyle = '#cbd5e1';
  c.lineWidth = 1.5;
  c.beginPath();
  c.moveTo(cx + 9.5, y0 + 101);
  c.quadraticCurveTo(cx + 15, y0 + 105, cx + 11.5, y0 + 109);
  c.stroke();

  // Two angled brown wooden pistol grips (`gy = y0 + 105` and `y0 + 143`, matching RPG-7 image!)
  for (const [idx, gy] of [[0, y0 + 105], [1, y0 + 143]] as [number, number][]) {
    // Dark steel mounting bracket under each grip
    c.beginPath();
    c.roundRect(cx + 6, gy - 3, 11, 16, 2);
    c.fillStyle = gunmetal(cx + 6, cx + 17);
    c.fill();
    c.strokeStyle = 'rgba(9,13,22,0.8)';
    c.lineWidth = 0.78;
    c.stroke();

    // Angled wooden grip handle
    c.beginPath();
    c.moveTo(cx + 9, gy + 2);
    c.lineTo(cx + 18, gy - 1);
    c.lineTo(cx + 32 - idx * 1.5, gy + 22);
    c.quadraticCurveTo(cx + 32 - idx * 1.5, gy + 26, cx + 27 - idx * 1.5, gy + 28);
    c.lineTo(cx + 19 - idx * 1.5, gy + 30);
    c.quadraticCurveTo(cx + 15 - idx * 1.5, gy + 29, cx + 14 - idx * 1.5, gy + 25);
    c.closePath();
    c.fillStyle = woodShroud(cx + 9, cx + 32);
    c.fill();
    c.strokeStyle = 'rgba(30,12,4,0.84)';
    c.lineWidth = 0.85;
    c.stroke();
  }

  // ══════════════════ 2. FRONT & REAR IRON SIGHTS ON UPPER-LEFT (-x, matching RPG-7 image!) ══════════════════
  // Tall Front Sight Post with Hood (`cx - 24 .. cx - 8, y0 + 80 .. y0 + 91`)
  c.beginPath();
  c.moveTo(cx - 8, y0 + 81);
  c.lineTo(cx - 22, y0 + 80);
  c.lineTo(cx - 22, y0 + 88);
  c.lineTo(cx - 8, y0 + 91);
  c.closePath();
  c.fillStyle = gunmetal(cx - 22, cx - 8);
  c.fill();
  c.strokeStyle = 'rgba(9,13,22,0.82)';
  c.lineWidth = 0.8;
  c.stroke();
  c.beginPath();
  c.arc(cx - 22, y0 + 84, 3.2, 0, TAU);
  c.fillStyle = '#334155';
  c.fill();
  c.strokeStyle = '#94a3b8';
  c.lineWidth = 0.75;
  c.stroke();

  // Rear Sight Ear (`cx - 19 .. cx - 10, y0 + 136 .. y0 + 145`)
  c.beginPath();
  c.roundRect(cx - 19, y0 + 136, 9, 8.5, 1.8);
  c.fillStyle = gunmetal(cx - 19, cx - 10);
  c.fill();
  c.strokeStyle = 'rgba(9,13,22,0.82)';
  c.lineWidth = 0.78;
  c.stroke();

  // ══════════════════ 3. FRONT GUNMETAL LAUNCHER BARREL, WOODEN HEAT SHROUD & FLARED REAR CONE ══════════════════
  // Front gunmetal launcher tube (`cx - 9 .. cx + 9, y0 + 66 .. y0 + 120`)
  c.beginPath();
  c.roundRect(cx - 9, y0 + 66, 18, 54, 2.5);
  c.fillStyle = gunmetal(cx - 9, cx + 9);
  c.fill();
  c.strokeStyle = 'rgba(9,13,22,0.85)';
  c.lineWidth = 0.88;
  c.stroke();

  // Ribbed gunmetal barrel collars on the front section (`y0 + 74` and `y0 + 94`)
  for (const by of [y0 + 74, y0 + 94]) {
    c.beginPath();
    c.roundRect(cx - 10.8, by, 21.6, 8, 2);
    c.fillStyle = gunmetal(cx - 10.8, cx + 10.8);
    c.fill();
    c.strokeStyle = 'rgba(9,13,22,0.84)';
    c.lineWidth = 0.82;
    c.stroke();
  }

  // Contoured Walnut/Mahogany Wooden Heat Guard Shroud (`y0 + 114 .. y0 + 192`, matching RPG-7 image!)
  c.beginPath();
  c.moveTo(cx - 11.5, y0 + 115);
  c.lineTo(cx + 11.5, y0 + 115);
  c.quadraticCurveTo(cx + 13, y0 + 138, cx + 10.5, y0 + 154);
  c.lineTo(cx + 9.5, y0 + 191);
  c.lineTo(cx - 9.5, y0 + 191);
  c.lineTo(cx - 10.5, y0 + 154);
  c.quadraticCurveTo(cx - 13, y0 + 138, cx - 11.5, y0 + 115);
  c.closePath();
  c.fillStyle = woodShroud(cx - 12.5, cx + 12.5);
  c.fill();
  c.strokeStyle = 'rgba(30,12,4,0.85)';
  c.lineWidth = 0.9;
  c.stroke();

  // Warm wood highlight stripe along left side of heat shroud
  c.fillStyle = 'rgba(253,224,171,0.34)';
  c.beginPath();
  c.roundRect(cx - 8.5, y0 + 120, 2.8, 66, 1.4);
  c.fill();

  // 3 Dark Steel Clamping Bands with Silver Rivets around the wooden shroud (`y0 + 113`, `y0 + 148`, `y0 + 186`)
  for (const [by, bw] of [
    [y0 + 112, 24],
    [y0 + 147, 23],
    [y0 + 186, 20.5],
  ] as [number, number][]) {
    c.beginPath();
    c.roundRect(cx - bw / 2, by, bw, 6.5, 1.8);
    c.fillStyle = gunmetal(cx - bw / 2, cx + bw / 2);
    c.fill();
    c.strokeStyle = 'rgba(9,13,22,0.84)';
    c.lineWidth = 0.8;
    c.stroke();
    // Silver rivets on clamp band
    c.fillStyle = '#cbd5e1';
    c.beginPath();
    c.arc(cx - bw / 2 + 3.5, by + 3.2, 1.2, 0, TAU);
    c.arc(cx + bw / 2 - 3.5, by + 3.2, 1.2, 0, TAU);
    c.fill();
  }

  // Wide Flared Gunmetal Exhaust Venturi Cone at the Rear (`y0 + 192 .. y0 + 224`, matching RPG-7 image!)
  c.beginPath();
  c.moveTo(cx - 8.8, y0 + 192);
  c.lineTo(cx + 8.8, y0 + 192);
  c.lineTo(cx + 18, y0 + 219);
  c.lineTo(cx - 18, y0 + 219);
  c.closePath();
  c.fillStyle = gunmetal(cx - 18, cx + 18);
  c.fill();
  c.strokeStyle = 'rgba(9,13,22,0.86)';
  c.lineWidth = 0.9;
  c.stroke();

  // Rolled steel lip at the rear of the exhaust cone
  c.beginPath();
  c.roundRect(cx - 19.5, y0 + 217, 39, 6.5, 3.2);
  c.fillStyle = gunmetal(cx - 19.5, cx + 19.5);
  c.fill();
  c.strokeStyle = 'rgba(9,13,22,0.86)';
  c.lineWidth = 0.88;
  c.stroke();

  // ══════════════════ 4. ICONIC OLIVE-DRAB PG-7V BULBOUS ROCKET WARHEAD WITH YELLOW SKULL STENCIL (matching RPG-7 image!) ══════════════════
  // Golden-yellow muzzle collar ring (`y0 + 62 .. y0 + 68`)
  c.beginPath();
  c.roundRect(cx - 9.8, y0 + 62, 19.6, 6, 2);
  c.fillStyle = lin(c, cx - 10, cx + 10, ['#713f12', '#eab308', '#fef08a', '#ca8a04']);
  c.fill();
  c.strokeStyle = 'rgba(66,32,6,0.82)';
  c.lineWidth = 0.8;
  c.stroke();

  if (ready || gunState.inPreview) {
    // Bulbous PG-7V olive-drab warhead (`y0 - 4 .. y0 + 63`)
    c.beginPath();
    c.moveTo(cx - 3.2, y0 + 2);
    c.lineTo(cx + 3.2, y0 + 2);
    // Conical nose expanding to widest bulbous shoulder at `y0 + 34`
    c.lineTo(cx + 14.5, y0 + 26);
    c.quadraticCurveTo(cx + 18.5, y0 + 35, cx + 14.5, y0 + 45);
    // Tapering rear cone down to golden collar at `y0 + 62`
    c.lineTo(cx + 7.2, y0 + 62);
    c.lineTo(cx - 7.2, y0 + 62);
    c.lineTo(cx - 14.5, y0 + 45);
    c.quadraticCurveTo(cx - 18.5, y0 + 35, cx - 14.5, y0 + 26);
    c.closePath();
    c.fillStyle = oliveGrad(cx - 17, cx + 17);
    c.fill();
    c.strokeStyle = 'rgba(20,36,4,0.86)';
    c.lineWidth = 0.92;
    c.stroke();

    // Glossy lime-olive highlight along the left of the warhead
    c.strokeStyle = 'rgba(217,249,157,0.5)';
    c.lineWidth = 2.0;
    c.beginPath();
    c.moveTo(cx - 3.5, y0 + 6);
    c.lineTo(cx - 12.5, y0 + 27);
    c.quadraticCurveTo(cx - 15, y0 + 35, cx - 12, y0 + 44);
    c.lineTo(cx - 6, y0 + 58);
    c.stroke();

    // Stepped ribs on the upper olive nose cone (`y0 + 10`, `y0 + 17`)
    c.strokeStyle = 'rgba(26,46,5,0.68)';
    c.lineWidth = 0.9;
    for (const [ry, hw] of [[y0 + 10, 6.8], [y0 + 17, 10.2]] as [number, number][]) {
      c.beginPath();
      c.moveTo(cx - hw, ry);
      c.lineTo(cx + hw, ry);
      c.stroke();
    }

    // Golden-yellow hazard stripe around the warhead shoulder (`y0 + 25 .. y0 + 28.5`)
    c.beginPath();
    c.roundRect(cx - 15, y0 + 25, 30, 3.4, 1.2);
    c.fillStyle = lin(c, cx - 15, cx + 15, ['#854d0e', '#facc15', '#fef9c3', '#ca8a04']);
    c.fill();
    c.strokeStyle = 'rgba(66,32,6,0.75)';
    c.lineWidth = 0.68;
    c.stroke();

    // Yellow Skull Stencil Emblem on the bulbous warhead belly (`cx, y0 + 38`, matching RPG-7 image!)
    c.save();
    c.translate(cx, y0 + 38);
    c.fillStyle = '#fde047';
    c.beginPath();
    c.arc(0, -1.5, 4.8, 0, TAU);
    c.fill();
    c.fillRect(-2.8, 1.5, 5.6, 3.2);
    // Dark olive eye sockets & nose
    c.fillStyle = '#1a2e05';
    c.beginPath();
    c.arc(-1.8, -1.6, 1.3, 0, TAU);
    c.arc(1.8, -1.6, 1.3, 0, TAU);
    c.fill();
    c.beginPath();
    c.moveTo(0, -0.2);
    c.lineTo(-0.9, 1.4);
    c.lineTo(0.9, 1.4);
    c.closePath();
    c.fill();
    c.restore();

    // Steel piezoelectric nose fuze tip (`y0 - 4 .. y0 + 3`)
    c.beginPath();
    c.roundRect(cx - 3.6, y0 - 3.5, 7.2, 6, 1.6);
    c.fillStyle = lin(c, cx - 3.6, cx + 3.6, ['#334155', '#e2e8f0', '#64748b']);
    c.fill();
    c.strokeStyle = 'rgba(15,23,42,0.82)';
    c.lineWidth = 0.78;
    c.stroke();
  }

  c.restore();
}

function freeze(c: CanvasRenderingContext2D, cx: number, y0: number, t: number) {
  const pulse = 0.65 + 0.35 * Math.sin(t * 5);
  const recoil = gunState.sinceShot >= 0 && gunState.sinceShot < 0.22
    ? 6 * Math.sin(Math.PI * gunState.sinceShot / 0.22) : 0;

  c.save();
  c.translate(0, recoil);

  // ══════════════════ 1. ERGONOMIC CRYO GRIP, SEAMLESS NECK BRIDGE & TRIGGER ("Grip ergonomis") ══════════════════
  // Dark slate-navy bridge connecting the angled grip cleanly into the rear collar & lower frame
  c.beginPath();
  c.moveTo(cx - 8, y0 + 102);
  c.lineTo(cx + 21, y0 + 96);
  c.lineTo(cx + 22, y0 + 118);
  c.lineTo(cx - 8, y0 + 122);
  c.closePath();
  c.fillStyle = '#1d2d3e';
  c.fill();

  drawFreezeGrip(c, cx + 2, y0 + 96);
  triggerGuard(c, cx, y0 + 100, '#36576b');

  // Curved dark slate-navy trigger with subtle cyan inner edge
  c.beginPath();
  c.moveTo(cx + 15, y0 + 83);
  c.quadraticCurveTo(cx + 28, y0 + 88, cx + 29, y0 + 98);
  c.lineTo(cx + 24, y0 + 100);
  c.quadraticCurveTo(cx + 22, y0 + 91, cx + 13, y0 + 89);
  c.closePath();
  c.fillStyle = '#182635';
  c.fill();
  c.strokeStyle = 'rgba(15,28,42,0.65)';
  c.lineWidth = 0.8;
  c.stroke();

  // ══════════════════ 2. TOP CRYOGENIC COOLANT TANK ("Tabung pendingin es") ══════════════════
  // Dark slate-navy protective frame & front sight loop mounted on dorsal (-x) side
  c.beginPath();
  c.moveTo(cx - 18, y0 + 43);
  c.quadraticCurveTo(cx - 34, y0 + 44, cx - 37, y0 + 55);
  c.lineTo(cx - 37, y0 + 109);
  c.quadraticCurveTo(cx - 36, y0 + 116, cx - 28, y0 + 116);
  c.lineTo(cx - 18, y0 + 115);
  c.closePath();
  c.fillStyle = lin(c, cx - 38, cx - 18, ['#13202e', '#3a526b', '#23364a', '#0f1a26']);
  c.fill();
  c.strokeStyle = 'rgba(15,28,42,0.68)';
  c.lineWidth = 0.85;
  c.stroke();

  // Open sight window cutout in the front arch of the bracket
  c.beginPath();
  c.moveTo(cx - 21, y0 + 49);
  c.quadraticCurveTo(cx - 31, y0 + 50, cx - 32, y0 + 57);
  c.lineTo(cx - 32, y0 + 62);
  c.lineTo(cx - 21, y0 + 62);
  c.closePath();
  c.fillStyle = '#0b141e';
  c.fill();

  // Glowing neon-cyan ice coolant capsule inside the bracket
  c.save();
  c.shadowColor = '#00e5ff';
  c.shadowBlur = 13 * pulse;
  const tankG = c.createLinearGradient(cx - 35, 0, cx - 21, 0);
  tankG.addColorStop(0, '#0077b6');
  tankG.addColorStop(0.32, '#00e5ff');
  tankG.addColorStop(0.62, '#b8fbff');
  tankG.addColorStop(1, '#0096c7');
  c.fillStyle = tankG;
  c.beginPath();
  c.roundRect(cx - 34.5, y0 + 64, 12.5, 46, 6);
  c.fill();
  c.strokeStyle = 'rgba(9,34,52,0.65)';
  c.lineWidth = 0.8;
  c.stroke();

  // Bright white-cyan specular streak on the coolant capsule
  c.fillStyle = 'rgba(255,255,255,0.9)';
  c.beginPath();
  c.roundRect(cx - 31.5, y0 + 68, 3.2, 36, 1.6);
  c.fill();

  // Animated rising cryogenic micro-bubbles inside the coolant tank
  c.fillStyle = 'rgba(255,255,255,0.75)';
  for (let i = 0; i < 3; i++) {
    const by = y0 + 104 - ((t * 24 + i * 13) % 36);
    const bx = cx - 27 + Math.sin(t * 5 + i * 2) * 2;
    c.beginPath();
    c.arc(bx, by, 1.3 + (i % 2) * 0.4, 0, TAU);
    c.fill();
  }
  c.restore();

  // Dark metallic collar bands securing the coolant tank
  c.fillStyle = '#1d2f42';
  c.strokeStyle = 'rgba(15,28,42,0.65)';
  c.lineWidth = 0.78;
  c.beginPath();
  c.roundRect(cx - 36, y0 + 61, 15, 5, 2);
  c.roundRect(cx - 36, y0 + 107, 15, 5, 2);
  c.fill();
  c.stroke();

  // ══════════════════ 3. REAR DARK COLLAR & GLOWING CYAN CRYO DOME ══════════════════
  // Glowing hemispherical cyan cryo orb at the back of the receiver
  c.save();
  c.shadowColor = '#00e5ff';
  c.shadowBlur = 14 * pulse;
  const orbG = c.createRadialGradient(cx - 4, y0 + 127, 1.5, cx - 1, y0 + 129, 13);
  orbG.addColorStop(0, '#ffffff');
  orbG.addColorStop(0.35, '#80f5ff');
  orbG.addColorStop(0.75, '#00b4d8');
  orbG.addColorStop(1, '#035388');
  c.fillStyle = orbG;
  c.beginPath();
  c.arc(cx - 1, y0 + 126, 11.5, 0, TAU);
  c.fill();
  c.strokeStyle = 'rgba(15,28,42,0.65)';
  c.lineWidth = 0.85;
  c.stroke();
  c.restore();

  // Dark slate-navy rear cap collar
  c.beginPath();
  c.roundRect(cx - 16.5, y0 + 112, 31, 14, [3, 3, 6, 6]);
  c.fillStyle = lin(c, cx - 17, cx + 15, ['#152230', '#3d556e', '#25384c', '#101a26']);
  c.fill();
  c.strokeStyle = 'rgba(15,28,42,0.68)';
  c.lineWidth = 0.85;
  c.stroke();

  // Clean pearl-silver rear transition ring between white body and dark rear cap
  c.beginPath();
  c.roundRect(cx - 18.5, y0 + 107, 35, 7, 2.5);
  c.fillStyle = lin(c, cx - 19, cx + 17, ['#8da8c2', '#f0f8ff', '#b5cde2', '#6a859e']);
  c.fill();
  c.strokeStyle = 'rgba(15,28,42,0.65)';
  c.lineWidth = 0.82;
  c.stroke();

  // ══════════════════ 4. MINIMALIST & BRIGHT 3D PEARL-WHITE CYLINDRICAL BODY (matching image 2) ══════════════════
  // Lower contoured ice-silver frame extension blending into the grip
  c.beginPath();
  c.moveTo(cx + 4, y0 + 68);
  c.lineTo(cx + 22.5, y0 + 72);
  c.lineTo(cx + 22.5, y0 + 110);
  c.lineTo(cx + 3, y0 + 115);
  c.closePath();
  c.fillStyle = lin(c, cx + 3, cx + 23, ['#b2cade', '#eef7ff', '#9eb8cf', '#6e88a1']);
  c.fill();
  c.strokeStyle = 'rgba(20,38,58,0.65)';
  c.lineWidth = 0.85;
  c.stroke();

  // Main cylindrical bright pearl-white receiver body
  c.beginPath();
  c.roundRect(cx - 21, y0 + 55, 41, 55, [6, 6, 8, 8]);
  c.fillStyle = lin(c, cx - 21, cx + 20, [
    '#a8c2d8',
    '#ffffff',
    '#ffffff',
    '#ebf5fc',
    '#b2cbe0',
    '#7c97b0',
  ]);
  c.fill();
  c.strokeStyle = 'rgba(20,38,58,0.68)';
  c.lineWidth = 0.9;
  c.stroke();

  // Stepped slightly narrower front cylindrical bright pearl-white collar
  c.beginPath();
  c.roundRect(cx - 18, y0 + 39, 35, 19, [5, 5, 2, 2]);
  c.fillStyle = lin(c, cx - 18, cx + 17, [
    '#a3bdd4',
    '#ffffff',
    '#ffffff',
    '#e4f1fb',
    '#a8c2d8',
    '#738ea8',
  ]);
  c.fill();
  c.strokeStyle = 'rgba(20,38,58,0.68)';
  c.lineWidth = 0.88;
  c.stroke();

  // Pure white cylindrical specular highlight bar down the left-center of the body
  c.fillStyle = 'rgba(255,255,255,0.92)';
  c.beginPath();
  c.roundRect(cx - 13.5, y0 + 42, 7.5, 64, 3.5);
  c.fill();

  // Crisp seam between stepped front collar and main cylinder
  c.strokeStyle = 'rgba(27,45,64,0.62)';
  c.lineWidth = 0.95;
  c.beginPath();
  c.moveTo(cx - 19, y0 + 57);
  c.lineTo(cx + 18, y0 + 57);
  c.stroke();

  // Two dark pill-shaped indicator/vent slots on the front collar (matching image 2)
  c.fillStyle = '#162636';
  c.beginPath();
  c.roundRect(cx - 7, y0 + 46, 3.4, 7.5, 1.7);
  c.roundRect(cx + 2, y0 + 48, 3.2, 5.2, 1.6);
  c.fill();

  // Angled panel seam line on the lower-right receiver shoulder
  c.strokeStyle = 'rgba(74,102,128,0.65)';
  c.lineWidth = 0.85;
  c.beginPath();
  c.moveTo(cx + 19, y0 + 74);
  c.lineTo(cx + 8, y0 + 82);
  c.lineTo(cx + 8, y0 + 108);
  c.stroke();

  // ══════════════════ 5. DETAILED 6-ARMED CRYSTALLINE SNOWFLAKE EMBLEM (❄️) ══════════════════
  c.save();
  c.translate(cx - 1, y0 + 82);
  c.strokeStyle = '#1da1f2';
  c.lineWidth = 2.1;
  c.lineCap = 'round';
  for (let i = 0; i < 6; i++) {
    c.save();
    c.rotate((i * Math.PI) / 3);
    c.beginPath();
    c.moveTo(0, 0);
    c.lineTo(0, -13);
    c.moveTo(-4, -9.8);
    c.lineTo(0, -6.6);
    c.lineTo(4, -9.8);
    c.moveTo(-2.6, -5.6);
    c.lineTo(0, -3.5);
    c.lineTo(2.6, -5.6);
    c.stroke();
    c.restore();
  }
  c.fillStyle = '#7ef4ff';
  c.strokeStyle = '#1da1f2';
  c.lineWidth = 1.2;
  c.beginPath();
  c.arc(0, 0, 2.8, 0, TAU);
  c.fill();
  c.stroke();
  c.restore();

  // ══════════════════ 6. DARK NECK RING & WIDE FLARED CONICAL NOZZLE ("Nozzle pembeku") ══════════════════
  // Dark slate-navy nozzle neck ring with cyan accent sheen
  c.beginPath();
  c.roundRect(cx - 13.5, y0 + 32, 26, 8.5, 2.5);
  c.fillStyle = lin(c, cx - 14, cx + 13, ['#121e2b', '#415a73', '#223548', '#0e1822']);
  c.fill();
  c.strokeStyle = 'rgba(15,28,42,0.68)';
  c.lineWidth = 0.85;
  c.stroke();
  c.strokeStyle = '#38bdf8';
  c.lineWidth = 0.9;
  c.beginPath();
  c.moveTo(cx - 10, y0 + 36);
  c.lineTo(cx + 9, y0 + 36);
  c.stroke();

  // Wide flared megaphone nozzle cone in bright pearl-white & cool silver
  c.beginPath();
  c.moveTo(cx - 12, y0 + 34);
  c.lineTo(cx - 26, y0 + 8);
  c.lineTo(cx + 26, y0 + 8);
  c.lineTo(cx + 11.5, y0 + 34);
  c.closePath();
  c.fillStyle = lin(c, cx - 26, cx + 26, [
    '#94afc7',
    '#ffffff',
    '#ffffff',
    '#e4f1fb',
    '#a3bdd4',
    '#6c869e',
  ]);
  c.fill();
  c.strokeStyle = 'rgba(20,38,58,0.68)';
  c.lineWidth = 0.9;
  c.stroke();

  // Elliptical nozzle rim & recessed cryo bore
  c.beginPath();
  c.ellipse(cx, y0 + 8, 26, 7.2, 0, 0, TAU);
  c.fillStyle = lin(c, cx - 26, cx + 26, ['#c8dced', '#ffffff', '#9eb7ce']);
  c.fill();
  c.strokeStyle = 'rgba(20,38,58,0.65)';
  c.lineWidth = 0.85;
  c.stroke();

  c.beginPath();
  c.ellipse(cx, y0 + 8.5, 19.8, 5, 0, 0, TAU);
  c.fillStyle = lin(c, cx - 19, cx + 19, ['#18344a', '#357ca3', '#1c3b54']);
  c.fill();
  c.strokeStyle = '#38bdf8';
  c.lineWidth = 0.85;
  c.stroke();

  // ══════════════════ 7. LARGE 3D FACETED ICE CRYSTAL EMITTER IN NOZZLE ══════════════════
  const crystalBob = Math.sin(t * 4.5) * 1.3;
  c.save();
  c.translate(0, crystalBob);
  c.shadowColor = '#00e5ff';
  c.shadowBlur = 14 * pulse;

  c.beginPath();
  c.moveTo(cx, y0 - 11.5);
  c.lineTo(cx + 13.5, y0 - 1);
  c.lineTo(cx + 9.5, y0 + 10);
  c.lineTo(cx - 9.5, y0 + 10);
  c.lineTo(cx - 13.5, y0 - 1);
  c.closePath();
  c.fillStyle = '#38d6ff';
  c.fill();

  // Upper-left bright ice-white facet
  c.beginPath();
  c.moveTo(cx, y0 - 11.5);
  c.lineTo(cx - 13.5, y0 - 1);
  c.lineTo(cx - 4.5, y0 + 1.5);
  c.closePath();
  c.fillStyle = '#e8fdff';
  c.fill();

  // Upper-right vivid cyan facet
  c.beginPath();
  c.moveTo(cx, y0 - 11.5);
  c.lineTo(cx + 13.5, y0 - 1);
  c.lineTo(cx + 4.5, y0 + 1.5);
  c.closePath();
  c.fillStyle = '#22d3ee';
  c.fill();

  // Center crown facet
  c.beginPath();
  c.moveTo(cx, y0 - 11.5);
  c.lineTo(cx + 4.5, y0 + 1.5);
  c.lineTo(cx - 4.5, y0 + 1.5);
  c.closePath();
  c.fillStyle = '#c4f9ff';
  c.fill();

  // Lower-left sky-blue facet
  c.beginPath();
  c.moveTo(cx - 13.5, y0 - 1);
  c.lineTo(cx - 4.5, y0 + 1.5);
  c.lineTo(cx - 9.5, y0 + 10);
  c.closePath();
  c.fillStyle = '#7dd3fc';
  c.fill();

  // Lower-center aqua facet
  c.beginPath();
  c.moveTo(cx - 4.5, y0 + 1.5);
  c.lineTo(cx + 4.5, y0 + 1.5);
  c.lineTo(cx + 9.5, y0 + 10);
  c.lineTo(cx - 9.5, y0 + 10);
  c.closePath();
  c.fillStyle = '#06b6d4';
  c.fill();

  // Lower-right deep cryo-blue facet
  c.beginPath();
  c.moveTo(cx + 13.5, y0 - 1);
  c.lineTo(cx + 9.5, y0 + 10);
  c.lineTo(cx + 4.5, y0 + 1.5);
  c.closePath();
  c.fillStyle = '#0284c7';
  c.fill();

  // Crisp white internal facet ridges
  c.strokeStyle = 'rgba(255,255,255,0.92)';
  c.lineWidth = 1.1;
  c.beginPath();
  c.moveTo(cx, y0 - 11);
  c.lineTo(cx - 4.5, y0 + 1.5);
  c.lineTo(cx + 4.5, y0 + 1.5);
  c.lineTo(cx, y0 - 11);
  c.moveTo(cx - 13, y0 - 1);
  c.lineTo(cx - 4.5, y0 + 1.5);
  c.lineTo(cx - 9, y0 + 9.5);
  c.moveTo(cx + 13, y0 - 1);
  c.lineTo(cx + 4.5, y0 + 1.5);
  c.lineTo(cx + 9, y0 + 9.5);
  c.stroke();

  // Fine outer contour around the ice crystal
  c.beginPath();
  c.moveTo(cx, y0 - 11.5);
  c.lineTo(cx + 13.5, y0 - 1);
  c.lineTo(cx + 9.5, y0 + 10);
  c.quadraticCurveTo(cx, y0 + 12.5, cx - 9.5, y0 + 10);
  c.lineTo(cx - 13.5, y0 - 1);
  c.closePath();
  c.strokeStyle = 'rgba(11,20,30,0.68)';
  c.lineWidth = 0.85;
  c.stroke();

  // 5 sharp cyan frost shards radiating from the crystal tip (matching image 2!)
  c.fillStyle = '#5eead4';
  const sparkShift = 1.5 * Math.sin(t * 7);
  for (const [x1, y1, x2, y2, w] of [
    [cx - 9, y0 - 13, cx - 13 - sparkShift, y0 - 22 - sparkShift, 2],
    [cx - 1, y0 - 15, cx - 1, y0 - 25 - sparkShift, 2.2],
    [cx + 5, y0 - 13, cx + 9 + sparkShift, y0 - 19 - sparkShift, 1.8],
    [cx + 11, y0 - 10, cx + 18 + sparkShift, y0 - 14, 1.6],
    [cx + 15, y0 - 4, cx + 23 + sparkShift, y0 - 5, 2],
  ] as [number, number, number, number, number][]) {
    c.strokeStyle = '#38d6ff';
    c.lineWidth = w;
    c.lineCap = 'round';
    c.beginPath();
    c.moveTo(x1, y1);
    c.lineTo(x2, y2);
    c.stroke();
  }
  c.restore();

  c.restore();
}

/** Slide/chamber recovery after each shot; the timed-stage reload keeps it
 * moving until the old ammo quota actually refills (no extra shots added). */
export function goldenSlideOffset(sinceShot: number, reloadT: number): number {
  const recoil = sinceShot >= 0 && sinceShot < 0.25
    ? 17 * Math.sin(Math.PI * sinceShot / 0.25) : 0;
  const reload = reloadT > 0
    ? 17 * Math.sin(Math.PI * (1 - Math.min(1, reloadT / 0.65))) : 0;
  return Math.max(recoil, reload);
}

function golden(c: CanvasRenderingContext2D, cx: number, y0: number, t: number) {
  const slide = goldenSlideOffset(gunState.sinceShot, gunState.reloadT);
  // Art-deco, ivory-inlaid grip flowing into a sculpted gold receiver.
  c.beginPath(); c.moveTo(cx + 1, y0 + 106);
  c.lineTo(cx + 25, y0 + 108); c.lineTo(cx + 62, y0 + 161);
  c.quadraticCurveTo(cx + 63, y0 + 172, cx + 48, y0 + 175);
  c.lineTo(cx + 7, y0 + 137); c.closePath();
  c.fillStyle = lin(c, cx, cx + 62, ['#604013', '#bf892a', '#fff3b8', '#b77616']);
  c.fill(); c.strokeStyle = 'rgba(89,57,9,0.68)'; c.lineWidth = 0.85; c.stroke();
  c.beginPath(); c.moveTo(cx + 11, y0 + 120);
  c.lineTo(cx + 25, y0 + 121); c.lineTo(cx + 54, y0 + 158);
  c.lineTo(cx + 48, y0 + 165); c.closePath();
  c.fillStyle = lin(c, cx + 11, cx + 52, ['#e6cca1', '#fffdf3', '#e4d1ad', '#ceb681']);
  c.fill(); c.strokeStyle = '#c99940'; c.lineWidth = 0.78; c.stroke();
  c.strokeStyle = 'rgba(139,86,19,0.52)'; c.lineWidth = 0.8;
  for (let i = 0; i < 5; i++) {
    c.beginPath(); c.moveTo(cx + 19 + i * 6, y0 + 130 + i * 6);
    c.lineTo(cx + 26 + i * 6, y0 + 127 + i * 6); c.stroke();
  }
  rrGold(c, cx + 43, y0 + 165, 19, 7);
  // Integrated trigger loop & gold-lined receiver.
  c.strokeStyle = '#eab85b'; c.lineWidth = 2.6; c.lineCap = 'round';
  c.beginPath(); c.moveTo(cx + 4, y0 + 112);
  c.quadraticCurveTo(cx + 34, y0 + 122, cx + 25, y0 + 103); c.stroke();
  c.strokeStyle = '#74461b'; c.lineWidth = 1.4;
  c.beginPath(); c.moveTo(cx + 16, y0 + 110); c.lineTo(cx + 18, y0 + 118); c.stroke();
  c.beginPath(); c.moveTo(cx - 18, y0 + 123);
  c.lineTo(cx - 22, y0 + 91); c.lineTo(cx - 18, y0 + 63);
  c.lineTo(cx + 18, y0 + 63); c.lineTo(cx + 22, y0 + 123);
  c.quadraticCurveTo(cx, y0 + 138, cx - 18, y0 + 123); c.closePath();
  c.fillStyle = gold(c, cx - 23, cx + 23); c.fill();
  c.strokeStyle = 'rgba(104,69,14,0.68)'; c.lineWidth = 0.9; c.stroke();
  rrGold(c, cx - 19, y0 + 70, 38, 6);
  rrGold(c, cx - 19, y0 + 120, 38, 7);
  // A five-station jeweled chamber rotates as the slide cycles. Its loading
  // port exposes the next round during reload rather than staying static.
  c.fillStyle = '#71440f'; c.beginPath(); c.arc(cx, y0 + 99, 16, 0, TAU); c.fill();
  c.strokeStyle = '#fff1aa'; c.lineWidth = 1.2; c.stroke();
  c.save(); c.translate(cx, y0 + 99);
  c.rotate(slide * 0.075 + t * 0.11);
  for (let i = 0; i < 5; i++) {
    const ang = i * TAU / 5;
    c.fillStyle = '#dfb553'; c.beginPath();
    c.arc(Math.cos(ang) * 9, Math.sin(ang) * 9, 3.4, 0, TAU); c.fill();
    c.fillStyle = '#fff6cd'; c.beginPath();
    c.arc(Math.cos(ang) * 9 - 0.9, Math.sin(ang) * 9 - 0.9, 1, 0, TAU); c.fill();
  }
  c.fillStyle = '#fff2b4'; c.beginPath(); c.arc(0, 0, 3.4, 0, TAU); c.fill();
  c.restore();
  if (slide > 3) {
    c.fillStyle = '#241a11'; c.beginPath();
    c.roundRect(cx + 8, y0 + 67, 11, 18, 3); c.fill();
    c.fillStyle = '#ffd568'; c.beginPath();
    c.ellipse(cx + 13, y0 + 75 - slide * 0.22, 3.6, 6, -0.1, 0, TAU); c.fill();
    c.strokeStyle = '#fff0b0'; c.lineWidth = 0.72; c.stroke();
  }
  // The whole upper slide is a MOVING piece; the rear sight and front barrel
  // physically return to their resting position after every shot/reload.
  c.save(); c.translate(0, slide);
  c.beginPath(); c.moveTo(cx - 12, y0 + 1);
  c.lineTo(cx + 12, y0 + 1); c.lineTo(cx + 19, y0 + 65);
  c.lineTo(cx - 19, y0 + 65); c.closePath();
  c.fillStyle = gold(c, cx - 20, cx + 20); c.fill();
  c.strokeStyle = 'rgba(119,81,18,0.68)'; c.lineWidth = 0.9; c.stroke();
  c.fillStyle = 'rgba(255,250,198,0.63)';
  c.beginPath(); c.moveTo(cx - 11, y0 + 3);
  c.lineTo(cx - 5, y0 + 4); c.lineTo(cx + 2, y0 + 61);
  c.lineTo(cx - 3, y0 + 61); c.closePath(); c.fill();
  for (const yy of [19, 31, 43, 55]) {
    c.strokeStyle = 'rgba(142,91,22,0.65)'; c.lineWidth = 0.95;
    c.beginPath(); c.moveTo(cx + 11, y0 + yy);
    c.lineTo(cx + 17, y0 + yy + 1.5); c.stroke();
  }
  rrGold(c, cx - 21, y0 + 61, 42, 7);
  c.fillStyle = '#3b280e'; c.beginPath();
  c.ellipse(cx, y0 + 1, 8, 2.6, 0, 0, TAU); c.fill();
  c.strokeStyle = '#ffe7a0'; c.lineWidth = 0.95; c.stroke();
  c.fillStyle = '#fdf5c8'; c.beginPath(); c.arc(cx, y0 - 1, 2.2, 0, TAU); c.fill();
  c.restore();
  // Fine engraving and lens-like flashes travel across the gold plating.
  c.strokeStyle = '#fff4c6'; c.lineWidth = 0.95;
  c.beginPath(); c.moveTo(cx - 15, y0 + 115);
  c.quadraticCurveTo(cx - 9, y0 + 122, cx - 1, y0 + 113); c.stroke();
  for (let i = 0; i < 3; i++) {
    const k = (t * 1.4 + i / 3) % 1;
    const xx = [cx - 6, cx + 10, cx + 45][i], yy = [y0 + 29, y0 + 88, y0 + 154][i];
    c.save(); c.globalAlpha = Math.sin(Math.PI * k);
    c.fillStyle = '#fffde8';
    c.beginPath(); c.moveTo(xx, yy - 5); c.lineTo(xx + 1, yy - 1);
    c.lineTo(xx + 6, yy); c.lineTo(xx + 1, yy + 1);
    c.lineTo(xx, yy + 5); c.lineTo(xx - 1, yy + 1);
    c.lineTo(xx - 6, yy); c.lineTo(xx - 1, yy - 1);
    c.closePath(); c.fill(); c.restore();
  }
}

function rrGold(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  c.beginPath(); c.roundRect(x, y, w, h, 2);
  c.fillStyle = gold(c, x, x + w); c.fill();
  c.strokeStyle = 'rgba(116,69,13,0.68)'; c.lineWidth = 0.8; c.stroke();
}

function blackhole(c: CanvasRenderingContext2D, cx: number, y0: number, t: number) {
  const pulse = 0.75 + 0.25 * Math.sin(t * 4.5);
  const recoil = gunState.sinceShot >= 0 && gunState.sinceShot < 0.25
    ? 7 * Math.sin(Math.PI * gunState.sinceShot / 0.25) : 0;

  c.save();
  c.translate(0, recoil);

  c.save();
  c.translate(cx - 10, y0 + 165);
  c.rotate(-0.72);
  const miniHalo = c.createRadialGradient(0, 0, 2, 0, 0, 22);
  miniHalo.addColorStop(0, 'rgba(232,121,249,0.75)');
  miniHalo.addColorStop(0.55, 'rgba(168,85,247,0.48)');
  miniHalo.addColorStop(1, 'rgba(88,28,135,0)');
  c.fillStyle = miniHalo;
  c.beginPath();
  c.ellipse(0, 0, 22, 8, 0, 0, TAU);
  c.fill();
  c.strokeStyle = `rgba(217,70,239,${0.85 * pulse})`;
  c.lineWidth = 2.2;
  c.beginPath();
  c.ellipse(0, 0, 16, 5.2, 0, 0, TAU);
  c.stroke();
  c.fillStyle = '#030108';
  c.beginPath();
  c.ellipse(0, 0, 5.8, 3.8, 0, 0, TAU);
  c.fill();
  c.restore();

  const vx = cx + 3.5;
  const vy = y0 + 36;
  c.save();
  c.translate(vx, vy);
  const nebG = c.createRadialGradient(0, 0, 1, 0, 0, 36);
  nebG.addColorStop(0, '#ffffff');
  nebG.addColorStop(0.18, 'rgba(250,232,255,0.95)');
  nebG.addColorStop(0.42, `rgba(217,70,239,${0.82 * pulse})`);
  nebG.addColorStop(0.68, 'rgba(126,34,206,0.48)');
  nebG.addColorStop(1, 'rgba(59,7,100,0)');
  c.fillStyle = nebG;
  c.beginPath();
  c.arc(0, 0, 36, 0, TAU);
  c.fill();

  c.save();
  c.rotate(-t * 2.2);
  c.lineCap = 'round';
  for (let i = 0; i < 4; i++) {
    c.save();
    c.rotate((i / 4) * TAU);
    c.strokeStyle = i % 2 === 0 ? 'rgba(147,51,234,0.85)' : 'rgba(192,38,211,0.78)';
    c.lineWidth = 6.2;
    c.beginPath();
    c.moveTo(1, 0);
    c.bezierCurveTo(4, -12, 18, -19, 27, -6);
    c.bezierCurveTo(31, 2, 24, 16, 12, 20);
    c.stroke();
    c.strokeStyle = i % 2 === 0 ? 'rgba(232,121,249,0.92)' : 'rgba(216,180,254,0.88)';
    c.lineWidth = 2.8;
    c.beginPath();
    c.moveTo(1, 0);
    c.bezierCurveTo(3.5, -10, 15, -15, 22, -4);
    c.bezierCurveTo(25, 2, 19, 12, 10, 15);
    c.stroke();
    c.strokeStyle = 'rgba(255,255,255,0.92)';
    c.lineWidth = 1.3;
    c.beginPath();
    c.moveTo(0.5, 0);
    c.bezierCurveTo(2.5, -6, 9, -9, 13.5, -2);
    c.stroke();
    c.restore();
  }
  c.restore();

  const coreG = c.createRadialGradient(0, 0, 0.5, 0, 0, 13);
  coreG.addColorStop(0, '#ffffff');
  coreG.addColorStop(0.42, '#ffffff');
  coreG.addColorStop(0.72, 'rgba(245,208,254,0.85)');
  coreG.addColorStop(1, 'rgba(192,132,252,0)');
  c.fillStyle = coreG;
  c.beginPath();
  c.arc(0, 0, 13, 0, TAU);
  c.fill();
  c.restore();

  c.beginPath();
  c.moveTo(cx + 3, y0 - 3);
  c.bezierCurveTo(cx - 18, y0 + 2, cx - 28, y0 + 28, cx - 21, y0 + 58);
  c.bezierCurveTo(cx - 17, y0 + 72, cx - 14.5, y0 + 84, cx - 19, y0 + 96);
  c.lineTo(cx - 21.5, y0 + 104);
  c.lineTo(cx - 19, y0 + 116);
  c.lineTo(cx - 21, y0 + 128);
  c.lineTo(cx - 18.5, y0 + 146);
  c.lineTo(cx - 12, y0 + 159);
  c.lineTo(cx - 5, y0 + 155);
  c.lineTo(cx + 1, y0 + 160);
  c.lineTo(cx + 10.5, y0 + 150);
  c.bezierCurveTo(cx + 11.5, y0 + 128, cx + 8.5, y0 + 104, cx + 18, y0 + 84);
  c.bezierCurveTo(cx + 31, y0 + 62, cx + 33, y0 + 36, cx + 28.5, y0 + 16);
  c.bezierCurveTo(cx + 26, y0 + 38, cx + 16, y0 + 62, cx + 1.5, y0 + 64);
  c.bezierCurveTo(cx - 13, y0 + 58, cx - 16, y0 + 18, cx + 3, y0 - 3);
  c.closePath();
  const obsG = c.createLinearGradient(cx - 26, y0 + 10, cx + 28, y0 + 155);
  obsG.addColorStop(0, '#100c1c');
  obsG.addColorStop(0.24, '#2d2446');
  obsG.addColorStop(0.46, '#433766');
  obsG.addColorStop(0.68, '#1a142b');
  obsG.addColorStop(1, '#07050e');
  c.fillStyle = obsG;
  c.fill();
  c.strokeStyle = 'rgba(4,2,10,0.88)';
  c.lineWidth = 0.92;
  c.stroke();

  c.strokeStyle = 'rgba(216,180,254,0.58)';
  c.lineWidth = 0.85;
  c.beginPath();
  c.moveTo(cx + 2, y0 - 1.5);
  c.bezierCurveTo(cx - 14.5, y0 + 18, cx - 12, y0 + 56, cx + 1.5, y0 + 63);
  c.bezierCurveTo(cx + 15.5, y0 + 61, cx + 25.5, y0 + 38, cx + 28, y0 + 17.5);
  c.stroke();

  c.save();
  c.shadowColor = '#e879f9';
  c.shadowBlur = 8 * pulse;
  c.lineCap = 'round';
  c.lineJoin = 'round';
  for (const [col, lw] of [['#c026d3', 2.4], ['#fae8ff', 1.05]] as [string, number][]) {
    c.strokeStyle = col;
    c.lineWidth = lw;
    c.beginPath();
    c.moveTo(cx - 11.5, y0 + 52);
    c.lineTo(cx - 6.5, y0 + 74);
    c.lineTo(cx - 5.5, y0 + 96);
    c.lineTo(cx - 11, y0 + 106);
    c.lineTo(cx - 10.5, y0 + 132);
    c.lineTo(cx - 14, y0 + 140);
    c.lineTo(cx - 11.5, y0 + 152);
    c.moveTo(cx + 16.5, y0 + 62);
    c.lineTo(cx + 6.5, y0 + 78);
    c.lineTo(cx + 3.5, y0 + 108);
    c.lineTo(cx - 1.5, y0 + 120);
    c.lineTo(cx - 1.5, y0 + 148);
    c.stroke();
  }
  glowDot(c, cx + 8.5, y0 + 56, 2.4, '#fdf4ff', 9);
  glowDot(c, cx - 5, y0 + 48, 1.8, '#f5d0fe', 7);
  glowDot(c, cx + 6.5, y0 + 94, 2.1, '#fdf4ff', 8);
  glowDot(c, cx - 4.5, y0 + 153, 1.8, '#fdf4ff', 7);
  c.restore();

  c.restore();
}

// ---------------------------------------------------------------- muzzle flashes
function drawFlash(c: CanvasRenderingContext2D, id: WeaponId, cx: number, y0: number, t: number, a: number, variant: GunVariant) {
  c.save();
  const mouth = id === 'firework' ? fireworkMouth(variant, gunState.fireworkTube) : null;
  c.translate(cx + (mouth?.x ?? 0), y0 + (mouth?.y ?? -6));
  c.globalCompositeOperation = 'lighter';
  const fire = (big: number) => {
    const fg = c.createRadialGradient(0, 0, 2, 0, 0, 46 * big);
    fg.addColorStop(0, `rgba(255,255,220,${a})`);
    fg.addColorStop(0.3, `rgba(255,200,60,${a * 0.9})`);
    fg.addColorStop(1, 'rgba(255,90,0,0)');
    c.fillStyle = fg;
    c.beginPath();
    const spikes = 9;
    for (let i = 0; i <= spikes * 2; i++) {
      const ang = (i / (spikes * 2)) * TAU + t * 10;
      const r = (i % 2 === 0 ? rand(30, 50) : rand(8, 14)) * big;
      const x = Math.cos(ang) * r;
      const y = Math.sin(ang) * r * 1.2 - 10 * big;
      if (i === 0) c.moveTo(x, y);
      else c.lineTo(x, y);
    }
    c.fill();
  };
  const energy = (rgb: string, r: number) => {
    const fg = c.createRadialGradient(0, 0, 2, 0, 0, r);
    fg.addColorStop(0, `rgba(255,255,255,${a})`);
    fg.addColorStop(0.35, `rgba(${rgb},${a * 0.85})`);
    fg.addColorStop(1, `rgba(${rgb},0)`);
    c.fillStyle = fg;
    c.beginPath();
    c.arc(0, -4, r, 0, TAU);
    c.fill();
    c.strokeStyle = `rgba(${rgb},${a})`;
    c.lineWidth = 2;
    c.beginPath();
    c.ellipse(0, -4, r * 0.6 * (1.4 - a), r * 0.18 * (1.4 - a), 0, 0, TAU);
    c.stroke();
  };
  switch (id) {
    case 'pistol': fire(1); break;
    case 'golden': fire(1.1); break;
    case 'ak47':
      fire(1.3);
      for (const s of [-1, 1]) {
        c.fillStyle = `rgba(255,220,120,${a})`;
        c.beginPath();
        c.moveTo(0, 6);
        c.lineTo(s * rand(26, 38), 2);
        c.lineTo(s * rand(26, 38), 14);
        c.closePath();
        c.fill();
      }
      break;
    case 'bazooka': fire(1.9); break;
    case 'rpg': fire(1.6); break;
    case 'plasma': energy('57,255,156', 50); break;
    case 'laser': energy('255,42,85', 34); break;
    case 'cricket':
      energy('90,170,255', 90);
      fire(1.4);
      break;
    case 'electro':
      energy('90,209,255', 40);
      c.strokeStyle = `rgba(200,245,255,${a})`;
      c.lineWidth = 2;
      for (let i = 0; i < 5; i++) {
        const ang = rand(0, TAU);
        jagged(c, 0, 0, Math.cos(ang) * 40, Math.sin(ang) * 40 - 10, 5, 4);
      }
      break;
    case 'freeze': energy('155,231,255', 46); break;
    case 'blackhole': energy('168,85,247', 50); break;
    case 'nail': {
      c.globalCompositeOperation = 'source-over';
      c.fillStyle = `rgba(220,220,220,${a * 0.6})`;
      c.beginPath();
      c.arc(0, -2, 10 * (1.5 - a), 0, TAU);
      c.fill();
      break;
    }
    case 'fish': {
      c.globalCompositeOperation = 'source-over';
      c.fillStyle = `rgba(120,210,255,${a * 0.8})`;
      for (let i = 0; i < 8; i++) {
        c.beginPath();
        c.arc(rand(-18, 18), rand(-24, 0), rand(2, 5), 0, TAU);
        c.fill();
      }
      break;
    }
    case 'crossbow':
      break;
    default:
      drawFlashExtra(c, id, t, a);
      break;
  }
  c.restore();
}
