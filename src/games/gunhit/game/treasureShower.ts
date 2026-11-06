import { H, LAND_H, LAND_W, W } from './layout';

const HUD_INSET = 28;
const HUD_Y = 34;
const FLOOR_INSET = 32;
const TAU = Math.PI * 2;

/**
 * The screen the player is looking at, in world units.
 *
 * Portrait shows the world as it is drawn, so the shower's own coordinates are
 * the world's. Landscape lays that world on its side (`layout.ts`: world
 * (x, y) is display (H - y, x)), which makes world +y point at the *left* edge
 * of the screen and world +x point at the floor. A shower simulated in world
 * coordinates therefore throws the chest's gold sideways across the screen
 * instead of up and down it — this is the reason the coins used to slide left.
 *
 * Everything below is stored in *screen* space (x right, y down) and the game
 * converts it to world space when it draws or bursts, so one set of physics
 * looks right on both screens.
 */
export interface ShowerScreen {
  width: number;
  height: number;
}

export const SHOWER_PORTRAIT: ShowerScreen = { width: W, height: H };
export const SHOWER_LANDSCAPE: ShowerScreen = { width: LAND_W, height: LAND_H };

export interface TreasureCoin {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  phase: number;
  spin: number;
  value: number;
  delay: number;
  gravity: number;
  flight: number;
  bounces: number;
  state: 'burst' | 'collect';
  fromX: number;
  fromY: number;
  collectT: number;
  collectDuration: number;
}

const randomBetween = (random: () => number, a: number, b: number) => a + random() * (b - a);

/** One hit throws a handful of *real* coins; their values always add up to the reward. */
export function throwTreasureCoins(
  hitX: number,
  chestY: number,
  reward: number,
  random = Math.random,
  screen: ShowerScreen = SHOWER_PORTRAIT,
): TreasureCoin[] {
  const amount = Math.max(0, Math.floor(reward));
  const count = Math.min(amount, 6);
  if (!count) return [];
  // Out of the mouth of the chest that was hit — not pulled toward the middle of
  // the screen. In portrait the chest is centred so the two are the same point;
  // in landscape the chest sits right of centre, and pulling the gold toward the
  // middle of the screen made it look like it leaked out of the chest's left side.
  const spawnX = Math.max(24, Math.min(screen.width - 24, hitX));
  return Array.from({ length: count }, (_, i) => ({
    x: spawnX + randomBetween(random, -19, 19),
    y: chestY - 26 + randomBetween(random, -8, 8),
    vx: (i - (count - 1) / 2) * 105 + randomBetween(random, -76, 76),
    vy: randomBetween(random, -590, -390),
    r: randomBetween(random, 8, 12),
    phase: randomBetween(random, 0, TAU),
    spin: randomBetween(random, 6, 12),
    value: Math.floor(amount / count) + (i < amount % count ? 1 : 0),
    delay: i * 0.055 + random() * 0.025,
    gravity: randomBetween(random, 1100, 1370),
    flight: 0,
    bounces: 0,
    state: 'burst' as const,
    fromX: 0,
    fromY: 0,
    collectT: 0,
    collectDuration: randomBetween(random, 0.37, 0.53),
  }));
}

/** Bounce on the ground, then fly one by one to the HUD. Returns the coins that actually arrived. */
export function advanceTreasureCoins(
  coins: TreasureCoin[],
  dt: number,
  onBounce?: (x: number, y: number) => void,
  screen: ShowerScreen = SHOWER_PORTRAIT,
): number {
  const floorY = screen.height - FLOOR_INSET;
  const hudX = screen.width - HUD_INSET;
  let collected = 0;
  for (let i = coins.length - 1; i >= 0; i--) {
    const coin = coins[i];
    if (coin.delay > 0) {
      coin.delay -= dt;
      continue;
    }
    coin.phase += coin.spin * dt;
    if (coin.state === 'burst') {
      coin.flight += dt;
      coin.vy += coin.gravity * dt;
      coin.x += coin.vx * dt;
      coin.y += coin.vy * dt;
      if (coin.x < coin.r + 4 || coin.x > screen.width - coin.r - 4) {
        coin.x = Math.max(coin.r + 4, Math.min(screen.width - coin.r - 4, coin.x));
        coin.vx *= -0.6;
      }
      if (coin.y >= floorY - coin.r && coin.vy > 0) {
        coin.y = floorY - coin.r;
        onBounce?.(coin.x, coin.y);
        if (coin.bounces === 0) {
          coin.bounces = 1;
          coin.vy = -Math.min(260, Math.abs(coin.vy) * 0.22);
          coin.vx *= 0.65;
        } else {
          coin.state = 'collect';
          coin.fromX = coin.x;
          coin.fromY = coin.y;
        }
      } else if (coin.flight > 2.7) {
        // Never strand a paid-for coin, even if an extreme weapon changes the physics.
        coin.state = 'collect';
        coin.fromX = coin.x;
        coin.fromY = coin.y;
      }
    } else {
      coin.collectT = Math.min(coin.collectDuration, coin.collectT + dt);
      const t = coin.collectT / coin.collectDuration;
      const ease = t * t * (3 - 2 * t);
      coin.x = coin.fromX + (hudX - coin.fromX) * ease;
      coin.y = coin.fromY + (HUD_Y - coin.fromY) * ease - Math.sin(t * Math.PI) * 34;
      if (t >= 1) {
        collected += coin.value;
        coins.splice(i, 1);
      }
    }
  }
  return collected;
}
