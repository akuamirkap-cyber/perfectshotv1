import { useEffect, useRef } from 'react';
import type { Weapon } from '../game/weapons';
import { drawProjectile } from '../game/art/projectiles';
import { drawCrystalEffectTwo, drawIronmanCombo } from '../game/art/combinedShots';
import { drawXenoHybridFlight } from '../game/art/xenoHybrid';
import { drawMaterialTrail } from '../game/art/projectileTrails';
import { drawClassicBeam, drawLaserBeam, drawVoidTether } from '../game/art/beamEffects';
import { drawSlide6String } from '../game/yoyoSlideFx';
import { createCrispBolt, renderCrispBolt } from '../game/kerisSlideFx';
import { star } from '../game/art/kit';
import { useSlideActive } from '../../shared/SlideActivity';
import { getGunVariant, type GunEffect } from '../game/art/gunVariants';
import { isZipShot, zipRoundPaint } from '../game/zipShotFx';
import { setOneIdFor } from '../game/setOneArt';
import { setSevenIdFor } from '../game/setSevenArt';
import { setElevenIdFor } from '../game/setElevenArt';
import { drawSetSevenShotShell } from '../game/setSevenFx';
import { drawSetElevenShotShell } from '../game/setElevenFx';
import { setNineIdFor } from '../game/setNineArt';
import { drawSetNineShotShell } from '../game/setNineFx';
import { setSixIdFor } from '../game/setSixArt';
import { drawSetSixShotShell } from '../game/setSixFx';
import { silentPreview } from '../game/previewAudio';
import { getSavedSgaSpeed } from '../game/gameSpeed';

/** Tiny live comparison using the exact same projectile/beam renderers as gameplay. */
export default function ShotEffectCanvas({ weapon, effect }: { weapon: Weapon; effect: GunEffect }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const active = useSlideActive();
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = 152, h = 88;
    cv.width = w * dpr; cv.height = h * dpr;
    const c = cv.getContext('2d');
    if (!c) return;
    let frame = 0, previous = -Infinity;
    const paint = (now: number) => {
      if (now - previous >= 1000 / 18 - 1) {
        previous = now;
        // These cards paint the layers' *real* shots by running their fire
        // recipes ~18 times a second, and those recipes play their own voice
        // (the EMERALD/RAILGUN/MOONBEAM charge-up especially). Keep the picker
        // silent — the sound belongs to the shot you actually fire.
        silentPreview(() => {
          const t = (now / 1000) * getSavedSgaSpeed();
          c.setTransform(dpr, 0, 0, dpr, 0, 0);
          c.clearRect(0, 0, w, h);
          // Small target rim makes the firing direction and hit point readable.
          c.strokeStyle = 'rgba(255,255,255,0.2)'; c.lineWidth = 2;
          c.beginPath(); c.arc(w / 2, -31, 42, 0, Math.PI * 2); c.stroke();
          // (Their "Slide 3" card is slide 3's own round, drawn further down.)
          if ((weapon.id === 'laser' || weapon.id === 'moonbeam') && effect !== 'set7') {
            if (effect === 'original') drawClassicBeam(c, w / 2, 8, 84, 0.88, weapon.trail);
            else if (weapon.id === 'laser') drawLaserBeam(c, w / 2, 8, 84, 0.84, t);
            else {
              drawClassicBeam(c, w / 2, 8, 84, 0.54, weapon.trail);
              for (let i = 0; i < 5; i++) {
                const yy = 17 + ((i * 20 + t * 31) % 66);
                star(c, w / 2 + Math.sin(t * 4 + i) * 4, yy, i % 2 ? 4 : 6,
                  i % 2 ? '#e9dcff' : '#fff9dc', 5);
              }
            }
          } else {
            c.save();
            c.translate(w / 2, 13 + Math.sin(t * 4) * 2);
            c.scale(1.15, 1.1);
            // BLACK HOLE's `new` card is slide 2's void with its slide-2 cannon,
            // and slide 3's own orb with slide 3's staff.
            const slide2Void = weapon.id === 'blackhole' && effect === 'new' && getGunVariant('blackhole') !== 'set1';
            if (slide2Void) {
              drawVoidTether(c, 0, 7, 0, 83, t);
            }
            if (weapon.id === 'yoyo') {
              drawSlide6String(c, { x: 0, y: 78 }, { x: 0, y: 18 }, 4, 3, t * 22, 0, 1);
            }
            if (weapon.id === 'keris') {
              renderCrispBolt(c, createCrispBolt(0, 74, 0, -4, { sway: 5, steps: 5, branchChance: 0.25 }), '#4deeea', 6);
            }
            // SET 1's "Slide 3" card: slide 3's own round, from its own recipe.
            const setOneId = effect === 'new' && !slide2Void ? setOneIdFor(weapon.id) : null;
            if (setOneId) {
              drawSetSevenShotShell(c, setOneId, 0.06, 22);
              c.restore();
              if (active) frame = requestAnimationFrame(paint);
              return;
            }
            // Slide-9 rounds and beams are painted by slide 9's own renderer.
            const setNineId = effect === 'set9' ? setNineIdFor(weapon.id) : null;
            if (setNineId) {
              drawSetNineShotShell(c, setNineId, 0.06, 26);
              c.restore();
              if (active) frame = requestAnimationFrame(paint);
              return;
            }
            // Slide-11 rounds and beams are painted by slide 11's own renderer.
            const setElevenId = effect === 'set11' ? setElevenIdFor(weapon.id) : null;
            if (setElevenId) {
              drawSetElevenShotShell(c, setElevenId, 0.06, 26);
              c.restore();
              if (active) frame = requestAnimationFrame(paint);
              return;
            }
            // Slide-6 beams are painted by slide 6's own renderer.
            const setSixId = effect === 'set6' ? setSixIdFor(weapon.id) : null;
            if (setSixId) {
              drawSetSixShotShell(c, setSixId, 0.06);
              c.restore();
              if (active) frame = requestAnimationFrame(paint);
              return;
            }
            // Hybrid cards preview the same visual layers as the live carrier.
            if (weapon.id === 'ironman_hand' && effect === 'ironman_combo') {
              // Effect #5's round (slide 9's repulsor) under effect #3's beam;
              // the card loops slide-6's own repulsor trigger interval (0.45 s):
              // burst and beam fade out completely, then the card re-fires.
              drawIronmanCombo(c, 0, -26, t,
                () => drawSetNineShotShell(c, setNineIdFor('gauntlet_cannon')!, 0.06, 26),
                { x: 0, y: 40, born: t - (t % 0.45) });
              c.restore();
              if (active) frame = requestAnimationFrame(paint);
              return;
            }
            // Crystal's third effect keeps its growth, but flies as effect 2.
            if (weapon.id === 'crystal' && effect === 'set7') {
              drawCrystalEffectTwo(c, 0, -8, t);
              c.restore();
              if (active) frame = requestAnimationFrame(paint);
              return;
            }
            // Slide-7 SET 2..5 rounds are painted by slide 7's own renderer.
            const setSevenId = effect === 'set7' ? setSevenIdFor(weapon.id) : null;
            if (setSevenId) {
              drawSetSevenShotShell(c, setSevenId, 0.06, 22);
              c.restore();
              if (active) frame = requestAnimationFrame(paint);
              return;
            }
            // The zip weapons' own card: each gun's round in its own colour — a
            // Diamond Gun's ice crystal, a Wars Blaster's red plasma bolt, the
            // Heat-Ray's lime mote (the trail follows the round, not the gem).
            if (isZipShot(weapon.id, effect)) {
              const glow = zipRoundPaint(weapon.id).glow;
              const trail = c.createLinearGradient(0, 14, 0, 80);
              trail.addColorStop(0, `rgba(${glow},0.75)`);
              trail.addColorStop(1, `rgba(${glow},0)`);
              c.fillStyle = trail;
              c.beginPath(); c.moveTo(-7, 17); c.lineTo(7, 17);
              c.lineTo(0, 82); c.closePath(); c.fill();
            }
            if (!drawMaterialTrail(c, weapon.id, effect)) {
              const trail = c.createLinearGradient(0, 14, 0, 80);
              trail.addColorStop(0, `rgba(${weapon.trail},0.6)`);
              trail.addColorStop(1, `rgba(${weapon.trail},0)`);
              c.fillStyle = trail;
              c.beginPath(); c.moveTo(-6, 17); c.lineTo(6, 17);
              c.lineTo(0, 82); c.closePath(); c.fill();
            }
            drawProjectile(c, weapon.id, Math.min(weapon.stick + 21, 44), t, 0, false, effect);
            if (weapon.id === 'xeno' && effect === 'xeno_hybrid') drawXenoHybridFlight(c, 0, 18, t);
            c.restore();
          }
        });
      }
      if (active) frame = requestAnimationFrame(paint);
    };
    paint(performance.now());
    return () => cancelAnimationFrame(frame);
  }, [weapon.id, weapon.stick, weapon.trail, effect, active]);
  return <canvas ref={ref} width={152} height={88} className="pointer-events-none block h-[74px] w-[128px] max-w-full sm:h-[88px] sm:w-[152px]" />;
}
