import type { NewKind } from "./TargetArt2";
import type { HeadKind } from "./HeadArt";
import type { FlatName } from "../ui/FlatIcons";
import { STAGES, type StageType } from "../quest/data";

export type TargetKind = "orange" | "wood" | "watermelon" | "lime" | "lemon" | "boss" | NewKind;
export type Pattern = "steady" | "wave" | "reverse" | "pulse" | "boss";
export type Level = {
  n: number;
  type: StageType;
  name: string;
  icon: FlatName;
  boss: boolean;
  ammo: number;
  obstacles: number;
  coins: number;
  base: number; // deg/s
  pattern: Pattern;
  target: TargetKind;
  head?: HeadKind;
};

/** wheel rotation for normal stages (boss stages excluded from the count) */
export const TARGETS: TargetKind[] = [
  "orange", "soccer", "kiwi", "durian",
  "carrom", "volleyball", "moon", "eyeball",
  "icecream", "dartboard", "ufo", "cannon",
  "spiral",
  "dragonfruit", "eightball", "umbrella", "mars",
  "friedegg", "disco", "peppermint", "pearl",
  "basketball", "coconut", "carrom2", "jupiter",
  "grapesoda", "ornament", "quailegg", "starfish",
  "pineapple", "tennis", "pluto", "casino",
  "apple", "bowling", "watermelon", "baseball",
  "wood", "lime", "lemon",
];
const PATTERNS: Pattern[] = ["steady", "wave", "reverse", "pulse"];

export function levelConfig(n: number): Level {
  const b = STAGES[Math.min(99, Math.max(0, n - 1))];
  const boss = b.type === "boss";
  return {
    n,
    type: b.type,
    name: b.name,
    icon: b.icon,
    boss,
    ammo: boss ? 10 + Math.min(6, Math.floor(n / 12)) : 6 + Math.min(5, Math.floor(n / 9)) + (b.type === "special" ? 1 : 0),
    // every wheel starts with at least one stuck knife
    obstacles: boss ? Math.min(5, 3 + Math.floor(n / 30)) : Math.min(5, 1 + Math.floor((n - 1) / 4)),
    coins: b.type === "special" ? 4 : 1 + (n % 2),
    base: 72 + Math.min(110, n * 4),
    pattern: boss ? "boss" : PATTERNS[n % 4],
    target: boss ? "boss" : TARGETS[(n - 1 - Math.floor((n - 1) / 5)) % TARGETS.length],
    head: b.head,
  };
}

export function speedAt(l: Level, t: number) {
  const b = l.base;
  switch (l.pattern) {
    case "steady":
      return b;
    case "wave":
      return b * (1 + 0.65 * Math.sin(t * 1.7));
    case "reverse":
      return b * 1.35 * Math.sin(t * 0.85);
    case "pulse":
      return b * (0.3 + 1.5 * Math.pow(Math.max(0, Math.sin(t * 2.2)), 2));
    case "boss": {
      // 6 s cycle: fast spin → fake brake → reverse burst → freeze → jitter
      const c = t % 6;
      if (c < 2.1) return b * 1.25;
      if (c < 2.6) return b * 0.12;
      if (c < 4.1) return -b * 1.5;
      if (c < 4.5) return 0;
      return b * (0.85 + 0.75 * Math.sin(t * 6));
    }
  }
}

export const JUICE: Record<TargetKind, string[]> = {
  orange: ["#fb923c", "#fdba74", "#fff7ed"],
  lemon: ["#fde047", "#fef08a", "#fffbeb"],
  lime: ["#84cc16", "#bef264", "#f7fee7"],
  watermelon: ["#f43f5e", "#fb7185", "#16a34a"],
  wood: ["#a16207", "#d6a35c", "#78350f"],
  boss: ["#ef4444", "#7f1d1d", "#fbbf24"],
  durian: ["#f9d64a", "#6c8a22", "#f4edd2"],
  kiwi: ["#9acd32", "#e4f3a6", "#1c1309"],
  dragonfruit: ["#e63a88", "#ffffff", "#141014"],
  pineapple: ["#ffd23f", "#f1a800", "#fff4c8"],
  apple: ["#e63946", "#fbefd2", "#5b3410"],
  soccer: ["#ffffff", "#111827", "#9ca3af"],
  basketball: ["#f07a1e", "#1f1308", "#ffb469"],
  tennis: ["#d5ec34", "#ffffff", "#9bb914"],
  baseball: ["#fffaf0", "#d62828", "#e2dac5"],
  bowling: ["#3f1f99", "#a78bfa", "#22d3ee"],
  carrom: ["#f6deb0", "#111111", "#ef4444"],
  casino: ["#e11d2f", "#ffffff", "#fbbf24"],
  carrom2: ["#f472b6", "#1e3a8a", "#fbbf24"],
  volleyball: ["#1d4ed8", "#facc15", "#ffffff"],
  umbrella: ["#ef4444", "#facc15", "#3b82f6"],
  starfish: ["#fb923c", "#2dd4bf", "#ffedd5"],
  coconut: ["#ffffff", "#7a4a22", "#e3eeea"],
  eightball: ["#111111", "#ffffff", "#4b5563"],
  moon: ["#cbd5e1", "#94a3b8", "#f1f5f9"],
  mars: ["#c2410c", "#fdba74", "#7c2d12"],
  jupiter: ["#d49a62", "#f2e3c6", "#c2410c"],
  pluto: ["#e8d5b5", "#5b3b2a", "#fff7ea"],
  eyeball: ["#ffffff", "#dc2626", "#65a30d"],
  ufo: ["#94a3b8", "#22d3ee", "#84cc16"],
  dartboard: ["#1c1917", "#f3e7c9", "#dc2626"],
  disco: ["#e2e8f0", "#a5f3fc", "#f0abfc"],
  icecream: ["#f9a8c4", "#ffe4ec", "#be123c"],
  spiral: ["#0a0a0a", "#ffffff", "#94a3b8"],
  ornament: ["#dc2626", "#ffe28a", "#ffffff"],
  peppermint: ["#e11d2f", "#ffffff", "#fecdd3"],
  friedegg: ["#ffffff", "#ffa31a", "#ffe08a"],
  pearl: ["#ffffff", "#f5d0fe", "#bae6fd"],
  quailegg: ["#f5f0e6", "#292524", "#a8a29e"],
  grapesoda: ["#7c4dbe", "#ffffff", "#c7b0ef"],
  cannon: ["#1f2937", "#ff9800", "#fff176"],
};

/** which knife style the i-th obstacle of stage n uses */
export const knifeVariant = (n: number, i: number) => (n + i) % 3;

/* ---------------- timeline (ms) ---------------- */
export const PLAY_IN = {
  hud: { d: 0, dur: 460 },
  target: { d: 60, dur: 1100, land: 0.42, pop: 0.56 }, // lands inside the scope lens, pops as it opens
  gun: { d: 0, dur: 560 },
  ammo: (i: number) => ({ d: 200 + i * 34, dur: 300 }),
  level: { d: 1050 },
  ready: 1350,
};
export const NEXT_IN = { target: { d: 0, dur: 1300, land: 0.42, pop: 0.56 }, level: { d: 1150 }, ready: 1350 };
export const PLAY_OUT = { total: 460 };
