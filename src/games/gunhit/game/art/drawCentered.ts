import type { WeaponId } from '../weapons';
import { getGunVariant, type GunVariant } from './gunVariants';
import { drawGun } from './guns';
import { getGunMetrics } from './metrics';
import { gunState } from './kit';
import { SNOWBALL_MAG_SIZE } from './guns2';
import { commonGunPreviewState, isCommonGun } from './commonGunMotion';
import { buildSevenAnim } from '../setSevenArt';

/**
 * Draws any weapon with its true geometric mass center placed EXACTLY at (0, 0).
 * This eliminates the issue where grips point outward or barrels shoot off-screen.
 */
export function drawGunCentered(
  c: CanvasRenderingContext2D,
  id: WeaponId,
  t = 0,
  flash = 0,
  ready = true,
  variant?: GunVariant,
  demo = false,
) {
  const m = getGunMetrics(id, variant);
  // Offsetting by (-centerOffsetX, -centerOffsetY) shifts the true visual center directly to (0, 0)!
  const x = -m.centerOffsetX, y = -m.centerOffsetY;
  if (!demo || (!isCommonGun(id) && id !== 'yoyo' && id !== 'keris' && id !== 'ghost' && id !== 'photon_saber')) {
    drawGun(c, id, x, y, t, flash, ready, undefined, variant);
    return;
  }

  // A short fire/reload demonstration in the menu and the selected Arsenal
  // canvases. Never leak this synthetic shot into a live game or another gun.
  const state = commonGunPreviewState(t);
  const previousShot = gunState.sinceShot, previousReload = gunState.reloadT, previousPreview = gunState.inPreview, previousGhostSide = gunState.ghostSide;
  const previousSaberSide = gunState.saberSide, previousSeven = gunState.s7Anim;
  const previousNine = gunState.s9State, previousEleven = gunState.elevenState;
  try {
    gunState.sinceShot = state.sinceShot;
    gunState.reloadT = state.reloadT;
    gunState.inPreview = true;
    if (id === 'ghost') gunState.ghostSide = Math.floor(t / 2.8) % 2 ? -1 : 1;
    if (id === 'photon_saber') {
      // The selected preview demonstrates both directions without advancing
      // the game's own trigger counter or reusing a stale live weapon state.
      gunState.saberSide = Math.floor(t / 2.8) % 2 ? -1 : 1;
      gunState.s7Anim = (variant ?? getGunVariant(id)) === 'set7'
        ? buildSevenAnim({ sinceShot: state.sinceShot, charge: 0, spin: 0 }) : null;
      gunState.s9State = null;
      gunState.elevenState = null;
    }
    const snowLoaded = id === 'snowball' && !state.ready ? SNOWBALL_MAG_SIZE - 1 : undefined;
    // The slingshot completes its own band-draw by 0.36s; do not reset its
    // pouch while the rest of the showcase is still displaying the reload.
    const demoReady = state.ready || id === 'yoyo' || id === 'keris' || (id === 'slingshot' && state.sinceShot >= 0.36);
    drawGun(c, id, x, y, t, Math.max(flash, state.flash), ready && demoReady, snowLoaded, variant);
  } finally {
    gunState.sinceShot = previousShot;
    gunState.reloadT = previousReload;
    gunState.inPreview = previousPreview;
    gunState.ghostSide = previousGhostSide;
    gunState.saberSide = previousSaberSide;
    gunState.s7Anim = previousSeven;
    gunState.s9State = previousNine;
    gunState.elevenState = previousEleven;
  }
}
