import { scaleTL } from "../anim/speed";
import type { FlatName } from "../ui/FlatIcons";
import { HEAD_INFO, type HeadKind } from "../play/HeadArt";
export type StageType = "normal" | "special" | "boss";
export type StageState = "done" | "current" | "locked";
export type StageBase = { n: number; type: StageType; name: string; icon: FlatName; head?: HeadKind };

export const TOTAL = 100;

const NORMALS: string[] = ["Jar", "Shield", "Goblin", "Iron Ore", "Watermelon", "Wood Barrel", "Bottle", "Pumpkin", "Crystal", "Bomb", "Apple", "Skull"];
const SPECIALS: [string, FlatName][] = [["Star", "star"], ["Treasure", "coinbag"], ["Rainbow", "sparkle"], ["Lightning", "bolt"]];
/** boss rotation (stage 5, 10, 15 …) — each boss has its own head medallion */
export const BOSS_ORDER: HeadKind[] = [
  "pirate", "jester", "dragon", "skeleton", "tiki", "viking", "oni", "robot", "alien", "vampire", // stage 5 … 50
  "sun", "pirate", "jester", "dragon", "skeleton", "tiki", "viking", "oni", "alien", "sun", //   stage 55 … 100 (final boss)
];

export const STAGES: StageBase[] = Array.from({ length: TOTAL }, (_, i) => {
  const n = i + 1;
  const pos = (n - 1) % 5;
  const cyc = Math.floor((n - 1) / 5);
  const type: StageType = pos === 4 ? "boss" : pos === 3 ? "special" : "normal";
  if (type === "boss") {
    const head = BOSS_ORDER[cyc % BOSS_ORDER.length];
    return { n, type, name: HEAD_INFO[head].name, icon: HEAD_INFO[head].icon, head };
  }
  const [name, icon]: [string, FlatName] = type === "special" ? SPECIALS[cyc % SPECIALS.length] : [NORMALS[(cyc * 3 + pos) % NORMALS.length], "target"];
  return { n, type, name, icon };
});

export const stageState = (n: number, cur: number): StageState => (n < cur ? "done" : n === cur ? "current" : "locked");

/* ---------------- 3D world layout ---------------- */
export const worldX = (n: number) => 0.34 * Math.sin((n - 1) * 0.9); // gentle zig-zag, -1..1
export const pillarW = (t: StageType) => (t === "boss" ? 124 : t === "special" ? 108 : 96);
/**
 * Every pillar is built to the same height. The stage rhythm then comes from
 * the perspective alone, so consecutive levels sit an even distance apart
 * instead of jumping around with a per-stage random height.
 */
export const PILLAR_H = 170;
export const pillarH = (_n: number, _t: StageType) => PILLAR_H;

/* ---------------- timeline (ms) ---------------- */
export const QUEST_IN = scaleTL({
  water: { d: 0, dur: 900 },
  cam: { d: 0, dur: 1500 },
  header: { d: 150, dur: 600 },
  chip: (i: number) => ({ d: 380 + i * 80, dur: 520 }),
  pillar: (k: number) => ({ d: 260 + k * 95, dur: 680, land: 0.62 }),
  dot: (k: number) => ({ d: 400 + k * 95, dur: 320 }),
  avatar: { d: 1000, dur: 850, land: 0.5 },
  bottom: { d: 1100, dur: 620 },
  ready: 1250,
});

export const QUEST_OUT = scaleTL({
  avatar: { d: 0, dur: 420 },
  pillar: (k: number) => ({ d: 40 + k * 32, dur: 400 }),
  header: { d: 60, dur: 380 },
  bottom: { d: 0, dur: 380 },
  cam: { d: 120, dur: 520 },
  total: 560,
});
