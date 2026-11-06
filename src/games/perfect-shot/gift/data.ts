import { WEAPONS, type Rarity, type Weapon } from "../shop/weapons";

export type Reward =
  | { kind: "coin"; amount: number; tier: number }
  | { kind: "gem"; amount: number; tier: number }
  | { kind: "weapon"; weapon: Weapon; dup: boolean; tier: number };

/** light / rarity tiers that the box glows with while charging */
export const TIERS = [
  { c: "#f1f5f9", name: "COMMON", chip: "bg-[#e2e8f0] text-[#1e293b]" },
  { c: "#38bdf8", name: "RARE", chip: "bg-[#0ea5e9] text-white" },
  { c: "#c084fc", name: "EPIC", chip: "bg-[#a855f7] text-white" },
  { c: "#fbbf24", name: "LEGENDARY", chip: "bg-gradient-to-b from-[#ffe27a] to-[#f59e0b] text-[#5a2a00]" },
];

export const RATES = { coin: 0.55, gem: 0.3, weapon: 0.15 };
export const WEAPON_RATES: [Rarity, number][] = [
  ["RARE", 0.6],
  ["EPIC", 0.28],
  ["LEGEND", 0.12],
];
export const GEM_COST = 10;
export const DUP_COINS = 300;

const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];

export function rollReward(owned: number[]): Reward {
  const r = Math.random();
  if (r < RATES.coin) {
    const jackpot = Math.random() < 0.12;
    const amount = jackpot ? 500 : pick([60, 80, 100, 120, 150, 200]);
    return { kind: "coin", amount, tier: jackpot ? 2 : amount >= 150 ? 1 : 0 };
  }
  if (r < RATES.coin + RATES.gem) {
    const amount = pick([3, 5, 5, 8, 10, 15]);
    return { kind: "gem", amount, tier: amount >= 10 ? 2 : 1 };
  }
  let x = Math.random();
  let rarity: Rarity = "RARE";
  for (const [rr, p] of WEAPON_RATES) {
    if (x < p) {
      rarity = rr;
      break;
    }
    x -= p;
  }
  const pool = WEAPONS.filter((w) => w.rarity === rarity);
  const fresh = pool.filter((w) => w.locked && !owned.includes(w.id));
  const weapon = pick(fresh.length ? fresh : pool);
  return { kind: "weapon", weapon, dup: !fresh.length, tier: rarity === "LEGEND" ? 3 : rarity === "EPIC" ? 2 : 1 };
}

/** glow tier shown after tap k (1,2). Higher tiers "upgrade" on the final tap for suspense */
export const glowAfter = (tier: number, k: number) => (k <= 1 ? 0 : Math.min(tier, 1));

/* ---------------- timeline (ms) ---------------- */
export const GIFT_IN = {
  bg: { d: 0, dur: 800 },
  top: (i: number) => ({ d: 80 + i * 70, dur: 600 }),
  banner: { d: 220, dur: 700, land: 0.5 },
  sub: { d: 520, dur: 520 },
  slot: (i: number) => ({ d: 620 + i * 90, dur: 480 }),
  spot: { d: 200, dur: 700 },
  rays: { d: 700, dur: 900 },
  pedestal: { d: 420, dur: 620 },
  box: { d: 640, dur: 950, land: 0.45 },
  hint: { d: 1450, dur: 500 },
  rates: { d: 1150, dur: 600 },
  ready: 1600,
};
export const GIFT_OUT = {
  top: (i: number) => ({ d: i * 30, dur: 360 }),
  box: { d: 0, dur: 460 },
  pedestal: { d: 80, dur: 380 },
  total: 520,
};
export const NEXT_DROP = { dur: 900, land: 0.45, ready: 950 };
