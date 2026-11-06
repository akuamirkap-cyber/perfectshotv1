import { bossHeadFor, bossNameFor } from './bossIdentity';
import { BOSS_CATALOG, type BossHead } from './bossCatalog';
import { HEAD_INFO } from '../../perfect-shot/play/HeadArt';

export const GUN_HIT_MAP_MAX_LEVEL = 100;

/** Mirror the existing SGA five-stage cycle; this only describes map nodes. */
export type GunHitMapStage = 'normal' | 'special' | 'boss';

export interface GunHitMapNodeTheme {
  kind: GunHitMapStage;
  label: string;
  symbol: string;
}

interface GunHitMapCycle {
  icons: readonly [GunHitMapNodeTheme, GunHitMapNodeTheme, GunHitMapNodeTheme];
}

/**
 * The three ordinary icons of each five-stage cycle. The boss of a cycle is no
 * longer a Game A name: every boss on this map is one of Game B's eleven heads,
 * named by the artwork the stage actually puts on screen (`bossHeadFor`).
 */
export const GUN_HIT_MAP_CYCLES: readonly GunHitMapCycle[] = [
  { icons: [{ kind: 'normal', label: 'Gentong', symbol: '🛢️' }, { kind: 'normal', label: 'Perisai', symbol: '🛡️' }, { kind: 'normal', label: 'Goblin', symbol: '👺' }] },
  { icons: [{ kind: 'normal', label: 'Bijih besi', symbol: '⛏️' }, { kind: 'normal', label: 'Landasan', symbol: '🔨' }, { kind: 'normal', label: 'Prajurit', symbol: '🪖' }] },
  { icons: [{ kind: 'normal', label: 'Lentera gelap', symbol: '🏮' }, { kind: 'normal', label: 'Perisai hitam', symbol: '🛡️' }, { kind: 'normal', label: 'Bayangan', symbol: '👤' }] },
  { icons: [{ kind: 'normal', label: 'Mahkota', symbol: '👑' }, { kind: 'normal', label: 'Perisai kerajaan', symbol: '🛡️' }, { kind: 'normal', label: 'Pengawal', symbol: '🪖' }] },
  { icons: [{ kind: 'normal', label: 'Kristal void', symbol: '💠' }, { kind: 'normal', label: 'Perisai retak', symbol: '🛡️' }, { kind: 'normal', label: 'Penjaga gelap', symbol: '🗡️' }] },
  { icons: [{ kind: 'normal', label: 'Lentera Jepang', symbol: '🏮' }, { kind: 'normal', label: 'Topeng Oni', symbol: '👹' }, { kind: 'normal', label: 'Goblin samurai', symbol: '👺' }] },
  { icons: [{ kind: 'normal', label: 'Arang', symbol: '⚫' }, { kind: 'normal', label: 'Perisai api', symbol: '🛡️' }, { kind: 'normal', label: 'Penjaga merah', symbol: '🥷' }] },
  { icons: [{ kind: 'normal', label: 'Genderang', symbol: '🥁' }, { kind: 'normal', label: 'Tameng', symbol: '🛡️' }, { kind: 'normal', label: 'Prajurit Oni', symbol: '👹' }] },
  { icons: [{ kind: 'normal', label: 'Mahkota iblis', symbol: '👑' }, { kind: 'normal', label: 'Segel', symbol: '🔏' }, { kind: 'normal', label: 'Pengawal iblis', symbol: '👿' }] },
  { icons: [{ kind: 'normal', label: 'Bendera', symbol: '🚩' }, { kind: 'normal', label: 'Katana', symbol: '🗡️' }, { kind: 'normal', label: 'Samurai', symbol: '🥷' }] },
  { icons: [{ kind: 'normal', label: 'Roda gigi', symbol: '⚙️' }, { kind: 'normal', label: 'Pelat baja', symbol: '🧱' }, { kind: 'normal', label: 'Robot penjaga', symbol: '🤖' }] },
  { icons: [{ kind: 'normal', label: 'Chip', symbol: '🔲' }, { kind: 'normal', label: 'Perisai energi', symbol: '🛡️' }, { kind: 'normal', label: 'Drone', symbol: '🚁' }] },
  { icons: [{ kind: 'normal', label: 'Inti reaktor', symbol: '☢️' }, { kind: 'normal', label: 'Armor berat', symbol: '🦾' }, { kind: 'normal', label: 'Robot tempur', symbol: '🤖' }] },
  { icons: [{ kind: 'normal', label: 'Kristal energi', symbol: '💎' }, { kind: 'normal', label: 'Kubah', symbol: '🔰' }, { kind: 'normal', label: 'Drone plasma', symbol: '🚁' }] },
  { icons: [{ kind: 'normal', label: 'Baterai', symbol: '🔋' }, { kind: 'normal', label: 'Armor berat', symbol: '🦾' }, { kind: 'normal', label: 'Robot elit', symbol: '🤖' }] },
  { icons: [{ kind: 'normal', label: 'Tong mesiu', symbol: '💣' }, { kind: 'normal', label: 'Jangkar', symbol: '⚓' }, { kind: 'normal', label: 'Bajak laut', symbol: '🏴‍☠️' }] },
  { icons: [{ kind: 'normal', label: 'Lentera hantu', symbol: '🏮' }, { kind: 'normal', label: 'Jangkar karat', symbol: '⚓' }, { kind: 'normal', label: 'Kerangka', symbol: '💀' }] },
  { icons: [{ kind: 'normal', label: 'Kompas', symbol: '🧭' }, { kind: 'normal', label: 'Meriam', symbol: '💥' }, { kind: 'normal', label: 'Penjaga kerangka', symbol: '💀' }] },
  { icons: [{ kind: 'normal', label: 'Mutiara gelap', symbol: '⚫' }, { kind: 'normal', label: 'Karang', symbol: '🪸' }, { kind: 'normal', label: 'Penjaga laut', symbol: '🧜' }] },
  { icons: [{ kind: 'normal', label: 'Peti harta', symbol: '🧰' }, { kind: 'normal', label: 'Pedang kerajaan', symbol: '⚔️' }, { kind: 'normal', label: 'Pengawal elite', symbol: '🛡️' }] },
];

/** All eleven bosses of Game A — the only boss roster there is. */
export const GUN_HIT_MAP_BOSSES = BOSS_CATALOG;

/** The eleven unique boss names, in Game B's rotation order. */
export const GUN_HIT_MAP_BOSS_NAMES = BOSS_CATALOG.map((boss) => boss.title);

/**
 * The boss Game B puts on each of the twenty boss stages (5 … 100), in order.
 * Repeats are intentional: twenty fights, eleven bosses, exactly like Game B.
 */
export const GUN_HIT_MAP_BOSS_ROTATION = Array.from({ length: 20 }, (_, index) =>
  bossNameFor((index + 1) * 5));

export function getGunHitMapStage(level: number): GunHitMapStage {
  const stageInCycle = ((Math.floor(level) - 1) % 5 + 5) % 5;
  if (stageInCycle === 4) return 'boss';
  if (stageInCycle === 3) return 'special';
  return 'normal';
}

/** The Game B head this stage fights, or null when the stage has no boss. */
export function getGunHitMapBossHead(level: number): BossHead | null {
  return getGunHitMapStage(level) === 'boss' ? bossHeadFor(Math.floor(level)) : null;
}

export function getGunHitMapNodeTheme(level: number): GunHitMapNodeTheme {
  const stage = Math.max(1, Math.floor(level));
  const cycleIndex = Math.max(0, Math.min(GUN_HIT_MAP_CYCLES.length - 1, Math.floor((stage - 1) / 5)));
  const stageInCycle = (stage - 1) % 5;
  if (stageInCycle < 3) return GUN_HIT_MAP_CYCLES[cycleIndex].icons[stageInCycle];
  if (stageInCycle === 3) return { kind: 'special', label: 'Spesial', symbol: '✨' };
  const head = getGunHitMapBossHead(stage);
  return {
    kind: 'boss',
    label: head ? HEAD_INFO[head].name : BOSS_CATALOG[0].title,
    symbol: '👑',
  };
}

export function getGunHitMapNodeCaption(level: number): string {
  return `${getGunHitMapNodeTheme(level).label.toUpperCase()} LV${Math.max(1, Math.floor(level))}`;
}
