import { HEAD_INFO, HEAD_KINDS, type HeadKind } from '../../perfect-shot/play/HeadArt';

/**
 * GAME A'S BOSSES = GAME B'S BOSSES. ALL ELEVEN OF THEM.
 *
 * Game A used to carry its own four bosses (`dark_knight`, `oni_demon`,
 * `mecha_cyborg`, `pirate_lord`) with their own PNGs, their own vector heads and
 * their own radial hitbox table. None of that is a boss of this game any more:
 * the only bosses in Game A are the eleven heads Perfect Shot (Game B) ships in
 * `HEAD_KINDS`, and every name, colour, attack and menu entry below is read
 * from that same catalogue so the fight can never disagree with the drawing.
 *
 * The four `BossAttackFamily` values are not bosses — they are the four effect
 * shapes Game A's projectile/decal art is drawn with. A head picks the family
 * that matches its silhouette (a blade for the skeleton, fire for the dragon …)
 * and keeps its own accent colour, attack name and fire rhythm.
 */
export type BossHead = HeadKind;

/** How a head's attack and its weapon decals are drawn. Never a boss identity. */
export type BossAttackFamily = 'knight' | 'oni' | 'cyborg' | 'pirate';

export const BOSS_ATTACK_FAMILIES: BossAttackFamily[] = ['knight', 'oni', 'cyborg', 'pirate'];

export interface BossProfile {
  /** The Game B head this boss wears — the only id a boss has. */
  head: BossHead;
  /** Same value as `head`, kept for the existing `id`-keyed UI code. */
  id: BossHead;
  /** Uppercase name, exactly as Game B spells it in the HUD. */
  name: string;
  /** Game B's display name. */
  title: string;
  desc: string;
  accent: string;
  glow: string;
  /** `r,g,b` for canvas particles, trails and rings. */
  rgb: string;
  family: BossAttackFamily;
  projectileName: string;
  projectileEmoji: string;
  /** Seconds between two boss shots (jittered by ±20 % in the engine). */
  fireInterval: number;
  /** Multiplier for the boss shot speed — heavier heads throw slower rounds. */
  shotPace: number;
}

interface BossSeed {
  head: BossHead;
  /** Accent override when Game B's background gradient is too dark to read. */
  accent?: string;
  family: BossAttackFamily;
  projectileName: string;
  projectileEmoji: string;
  fireInterval: number;
  shotPace: number;
}

/**
 * One row per Game B head, in Game B's own rotation order (`HEAD_KINDS`).
 * Stage 5 is the pirate, 10 the jester, … 55 the sun, exactly like Perfect Shot.
 */
const SEEDS: BossSeed[] = [
  { head: 'pirate', family: 'pirate', projectileName: 'Meriam Hantu', projectileEmoji: '💣', fireInterval: 2.3, shotPace: 1 },
  { head: 'jester', family: 'knight', projectileName: 'Kartu Belati', projectileEmoji: '🃏', fireInterval: 1.85, shotPace: 1.08 },
  { head: 'dragon', family: 'oni', projectileName: 'Bola Api Naga', projectileEmoji: '🔥', fireInterval: 2.05, shotPace: 1.02 },
  { head: 'skeleton', family: 'knight', projectileName: 'Tulang Sabit', projectileEmoji: '🦴', fireInterval: 2.15, shotPace: 0.96 },
  { head: 'tiki', family: 'pirate', projectileName: 'Kutukan Totem', projectileEmoji: '🗿', fireInterval: 2.4, shotPace: 0.92 },
  { head: 'viking', family: 'knight', projectileName: 'Kapak Badai', projectileEmoji: '🪓', fireInterval: 2.2, shotPace: 0.98 },
  { head: 'oni', accent: '#ef4444', family: 'oni', projectileName: 'Bola Api Oni', projectileEmoji: '👹', fireInterval: 2.0, shotPace: 1.05 },
  { head: 'robot', family: 'cyborg', projectileName: 'Roket Mikro', projectileEmoji: '🚀', fireInterval: 1.9, shotPace: 1.12 },
  { head: 'alien', family: 'cyborg', projectileName: 'Bola Plasma', projectileEmoji: '🛸', fireInterval: 2.05, shotPace: 1.1 },
  { head: 'vampire', family: 'oni', projectileName: 'Kelelawar Darah', projectileEmoji: '🦇', fireInterval: 2.25, shotPace: 1.04 },
  { head: 'sun', accent: '#f59e0b', family: 'oni', projectileName: 'Flare Matahari', projectileEmoji: '☀️', fireInterval: 1.8, shotPace: 1.15 },
];

const hexToRgb = (hexColor: string): string => {
  const v = hexColor.replace('#', '');
  const n = parseInt(v.length === 3 ? v.split('').map((c) => c + c).join('') : v, 16);
  return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
};

const rgba = (rgb: string, alpha: number) => `rgba(${rgb}, ${alpha})`;

function makeProfile(seed: BossSeed): BossProfile {
  const info = HEAD_INFO[seed.head];
  const accent = seed.accent ?? info.bg[0];
  const rgb = hexToRgb(accent);
  return {
    head: seed.head,
    id: seed.head,
    name: info.name.toUpperCase(),
    title: info.name,
    desc: info.desc,
    accent,
    glow: rgba(rgb, 0.4),
    rgb,
    family: seed.family,
    projectileName: seed.projectileName,
    projectileEmoji: seed.projectileEmoji,
    fireInterval: seed.fireInterval,
    shotPace: seed.shotPace,
  };
}

/** The eleven bosses of Game A, in Game B's order. There is no twelfth. */
export const BOSS_CATALOG: BossProfile[] = SEEDS.map(makeProfile);

export const BOSS_BY_HEAD = Object.fromEntries(
  BOSS_CATALOG.map((boss) => [boss.head, boss]),
) as Record<BossHead, BossProfile>;

/** Every boss of Game A, keyed by head. Unknown ids fall back to the pirate. */
export function bossDef(id: string | null | undefined): BossProfile {
  const key = (id ?? '') as BossHead;
  return BOSS_BY_HEAD[key] ?? BOSS_BY_HEAD[BOSS_CATALOG[0].head];
}

export const BOSS_HEADS: BossHead[] = HEAD_KINDS.slice();

/** The FX family a head's shots and decals are drawn with. */
export const familyForHead = (head: BossHead): BossAttackFamily => bossDef(head).family;

/** Accent palette for one head's muzzle flash / projectile tint. */
export function bossPalette(head: BossHead): { accent: string; rgb: string; glow: string } {
  const boss = bossDef(head);
  return { accent: boss.accent, rgb: boss.rgb, glow: boss.glow };
}
