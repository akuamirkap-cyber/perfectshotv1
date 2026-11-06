import { levelConfig } from '../../perfect-shot/play/levels';
import { HEAD_INFO, type HeadKind } from '../../perfect-shot/play/HeadArt';
import {
  bossDef,
  familyForHead,
  type BossAttackFamily,
  type BossHead,
  type BossProfile,
} from './bossCatalog';

/**
 * Which boss is this? Game A draws Perfect Shot's own heads, so the boss' name,
 * colours and attack must come from the *same* source as the artwork.
 *
 * Slide 1 used to keep its own list — `['DARK KNIGHT', 'ONI DEMON', …]` indexed by
 * every fifth stage — while the head art came from Perfect Shot's `BOSS_ORDER`
 * (stage 5 is the pirate, not a knight). The HUD then announced "BOSS • DARK
 * KNIGHT" over a pirate, and the name disagreed with the thing on screen.
 *
 * Game A has no bosses of its own at all now: the only boss roster is Game B's
 * eleven heads (`bossCatalog.ts`), and a stage's boss is read from
 * `levelConfig(n).head` — one source of truth for the art, the name, the menu
 * entry and the attack.
 */
export type BossArtStyle = BossAttackFamily;

/** Game B's head on this stage, or null for a non-boss stage. */
export function bossHeadFor(level: number): HeadKind | null {
  const cfg = levelConfig(level);
  return cfg.boss && cfg.head ? cfg.head : null;
}

/** The boss' own name, exactly as the game that owns the artwork calls it. */
export function bossNameFor(level: number): string {
  const head = bossHeadFor(level);
  return head ? HEAD_INFO[head].name.toUpperCase() : '';
}

/** Short label for logs/debug overlays, e.g. `PIRATE`. */
export function bossSlugFor(level: number): string {
  const head = bossHeadFor(level);
  return head ? head.toUpperCase() : '';
}

/** The FX family this head's shots and decals are drawn with. */
export function bossStyleFor(level: number): BossArtStyle | null {
  const head = bossHeadFor(level);
  return head ? familyForHead(head) : null;
}

/** The whole Game B boss record for this stage (name, colours, attack). */
export function bossProfileFor(level: number): BossProfile | null {
  const head = bossHeadFor(level);
  return head ? bossDef(head) : null;
}

export function headInfoFor(level: number) {
  const head = bossHeadFor(level);
  return head ? HEAD_INFO[head] : null;
}

export type { BossHead, BossProfile };
