/**
 * Canvas geometry for Game A, kept out of the engine on purpose: the menu draws
 * the live weapon preview with exactly these numbers, and importing them from
 * `Game.ts` would drag the whole engine (art, FX, ported slides) into the first
 * chunk instead of its own lazily loaded one.
 */
export const W = 420;
export const H = 760;
export const CX = W / 2;
export const BASE_WHEEL_CY = 255;
/**
 * Where the wheel sat before this pass. The muzzle gap is measured against it,
 * so the two requests below are pinned to a number instead of drifting with
 * whatever the rig happens to be.
 */
const REFERENCE_CY = Math.round(BASE_WHEEL_CY * (1 - 0.28)); // 184

/**
 * The board-side packages — the wheel it shoots at (rim gems, coins and
 * everything buried in it), the boss head, the Diamond Breaker rock and the
 * treasure chest — are 10% smaller than the reference board.
 *
 * The board's radius is the single knob behind all four: gems, coins, knives
 * and the boss' artwork are radius-derived, so they shrink together instead of
 * drifting apart piece by piece.
 */
export const BOARD_PACKAGE_SCALE = 0.9;

/** The ordinary wheel's radius, kept here so the muzzle gap stays measurable. */
const WHEEL_RADIUS = 106;
/** How far the rim sits from the wheel's centre once the board is scaled. */
const RIM_R = Math.round(WHEEL_RADIUS * BOARD_PACKAGE_SCALE); // 95

/**
 * The weapon package is drawn in play at the size the title screen shows it.
 *
 * The menu fits every gun's ink to 0.78 of its 295 px canvas (≈230 px) and the
 * roster's median gun needs 1.12× to fill that, so the gameplay rig uses 1.12
 * instead of the 0.864 it shrank to: the gun no longer looks smaller the
 * moment the menu flight lands.
 */
/** The 1.08x rig the menu's proportions were tuned against. */
const TUNED_RIG = 1.08;
export const GAMEPLAY_GUN_SCALE = TUNED_RIG * 1.037; // 1.11996 ≈ 1.12
export const GUN_PACKAGE_SCALE = GAMEPLAY_GUN_SCALE / TUNED_RIG; // 1.037

/**
 * How far this rig's arm reaches below its muzzle (`185 * scale`). The muzzle
 * rides at the bottom of the screen with the grip flush against the edge, so
 * the bigger rig grows upwards instead of hanging off the canvas.
 */
const RIG_FOOT = Math.ceil(185 * GAMEPLAY_GUN_SCALE); // 208 — never a fraction past the edge
export const GUN_Y = H - RIG_FOOT; // 552

/**
 * The enemy — the wheel, the boss head, the Diamond Breaker rock — and the
 * treasure chest are pushed 15% farther from the muzzle (tip → nearest rim)
 * than the bigger rig left them.
 *
 * A larger gun eats the gap on its own: its muzzle rose 47 px, so the board has
 * to rise too or the barrel ends up in the wheel. The 15% is asked for, then
 * clamped to the line the top HUD needs — the score, the level label and the
 * stage stars own the strip above `HUD_SAFE_TOP`, and the wheel's top edge is
 * never allowed into it (the same rule the layout always enforced).
 */
export const BOARD_GAP_GROWTH = 1.15;
/** Nothing of the board may rise above this line. */
const HUD_SAFE_TOP = 59;
const WANTED_GAP = Math.round((GUN_Y - (REFERENCE_CY + RIM_R)) * BOARD_GAP_GROWTH); // 315
const WANTED_CY = GUN_Y - WANTED_GAP - RIM_R; // 143 — 15%, but under the HUD
export const CY = Math.max(WANTED_CY, HUD_SAFE_TOP + RIM_R); // 154
export const SPECIAL_CY = CY; // Bonus / Special stage wheel sits on the same line as the normal wheel.

export function initialGameplayWheelCenterY(boss = false, special = false) {
  if (special) return SPECIAL_CY;
  return boss ? CY + 36 : CY;
}

/**
 * How far the landscape presentation lifts the weapon rig in world space.
 *
 * Landscape turns the world on its side, so world Y becomes screen X and the
 * gun's grip would otherwise sit flush against — and slightly past — the left
 * edge of the screen. Lifting the rig by this many world units moves it right
 * on screen without changing the weapon, its scale or its firing lane.
 */
export const LAND_GUN_LIFT = 30;

/**
 * Landscape presentation.
 *
 * The engine simulates in its original portrait world (W x H) and never learns
 * about the screen it is shown on. In landscape mode the same world is laid on
 * its side: the display canvas swaps to H x W and the world is rotated 90°
 * clockwise around the top-left of the display.
 *
 * That single rotation buys every part of the requested layout at once, because
 * world "up" becomes screen "right":
 *
 *   world (x, y)  ->  display (H - y, x)
 *
 *   gun   (CX, GUN_Y)  ->  (H - GUN_Y, CX)      bottom-centre -> left-centre
 *   wheel (CX, CY)     ->  (H - CY, CX)         top-centre    -> right-centre
 *   muzzle direction (0, -1) -> (1, 0)          up            -> right
 *   world top edge y = 0     -> display x = H   enemies spawn there, so they
 *                                                  arrive from the RIGHT
 */
export const LAND_W = H; // 760 — landscape display width
export const LAND_H = W; // 420 — landscape display height

/** Canvas backing-store / CSS size for the given orientation. */
export function displaySize(orientation: 'portrait' | 'landscape'): { w: number; h: number } {
  return orientation === 'landscape' ? { w: LAND_W, h: LAND_H } : { w: W, h: H };
}

/**
 * World -> display mapping, expressed as the six values `setTransform` takes
 * (a, b, c, d, e, f) already multiplied by the pixel scale `k`. Portrait is the
 * identity; landscape is the 90° clockwise rotation described above.
 */
export function worldTransform(
  orientation: 'portrait' | 'landscape',
  k: number,
): [number, number, number, number, number, number] {
  if (orientation !== 'landscape') return [k, 0, 0, k, 0, 0];
  return [0, k, -k, 0, H * k, 0];
}

/**
 * Inverse of `worldTransform`: display pixels -> world coordinates. `nx`/`ny`
 * are normalised display coordinates in 0..1, which is what a pointer event
 * gives once it is divided by the element's bounding rect.
 */
export function displayToWorld(
  orientation: 'portrait' | 'landscape',
  nx: number,
  ny: number,
): { x: number; y: number } {
  if (orientation !== 'landscape') return { x: nx * W, y: ny * H };
  // display X = H - y  ->  y = H - nx * H
  // display Y = x      ->  x = ny * W
  return { x: ny * W, y: (1 - nx) * H };
}

