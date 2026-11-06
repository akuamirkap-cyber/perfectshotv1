import { scaleTL } from "../anim/speed";
import type { GameState } from "../game/store";
import type { Country } from "./Avatar";

export type Player = { id: string; name: string; score: number; trend: number; seed: number; stage: number; country: Country; me?: boolean };

const NAMES: [string, Country][] = [
  ["Rizky Sniper", "ID"], ["Emma Bullseye", "US"], ["Haruto Headshot", "JP"], ["Sinta Ratatat", "ID"], ["Lucas Deadeye", "BR"],
  ["Ji-woo Quickdraw", "KR"], ["Oliver Trigger", "GB"], ["Laras Hawkeye", "ID"], ["Max Blaster", "DE"], ["Chloé Kunai", "FR"],
  ["Aiman Ricochet", "MY"], ["Somchai Boom", "TH"], ["Miguel Ironsight", "PH"], ["Linh Pistolero", "VN"], ["Arjun Shotgun", "IN"],
  ["Giulia Laser", "IT"], ["Eko Magnum", "ID"], ["Sofía Crossbow", "ES"], ["Liam Gatling", "CA"], ["Tari Sharpshot", "ID"],
  ["Noah Bazooka", "US"], ["Yuki Dartgirl", "JP"],
];

/** player score: stars are worth the most, then cleared stages, then coins */
export function myScore(g: GameState) {
  const stars = Object.values(g.stars).reduce((a, b) => a + b, 0);
  return stars * 1200 + Math.max(0, g.stage - 1) * 2600 + Math.round(g.coins * 2);
}

export function buildBoard(g: GameState, scope: "global" | "week"): Player[] {
  const k = scope === "global" ? 1 : 0.32;
  const bots: Player[] = NAMES.map(([name, country], i) => {
    const base = Math.round((128000 * Math.pow(0.86, i) + 2400) * k);
    return { id: `b${i}`, name, country, score: base, trend: Math.round(base * (0.02 + ((i * 37) % 9) / 100)), seed: i * 7 + (scope === "week" ? 3 : 1), stage: Math.max(3, Math.round(98 * Math.pow(0.87, i))) };
  });
  const me: Player = { id: "me", name: "You", country: "ID", score: Math.round(myScore(g) * (scope === "global" ? 1 : 0.9)), trend: 0, seed: 999, stage: g.stage, me: true };
  me.trend = Math.round(me.score * 0.12);
  return [...bots, me].sort((a, b) => b.score - a.score);
}

export const fmt = (n: number) => n.toLocaleString("en-US");

/* ---------------- timeline (ms) ---------------- */
export const LB_IN = scaleTL({
  bg: { d: 0, dur: 800 },
  top: (i: number) => ({ d: 80 + i * 70, dur: 560 }),
  title: { d: 160, dur: 650 },
  crown: { d: 520, dur: 750, land: 0.5 },
  avatar: { d: 380, dur: 620 },
  badge: { d: 780, dur: 600 },
  name: { d: 920, dur: 520 },
  score: { d: 1000, dur: 520 },
  btn: (i: number) => ({ d: 1120 + i * 90, dur: 520 }),
  podium: (i: number) => ({ d: 260 + i * 120, dur: 640 }),
  row: (i: number) => ({ d: 620 + i * 55, dur: 480 }),
  ready: 1200,
});
export const LB_OUT = scaleTL({ total: 520 });
