import type { FlatName } from "../ui/FlatIcons";
export type Kind =
  | "pistol"
  | "rifle"
  | "smg"
  | "crossbow"
  | "plasma"
  | "laser"
  | "shotgun"
  | "sniper"
  | "revolver"
  | "minigun"
  | "bazooka"
  | "blaster"
  | "launcher"
  | "flamer";

export type Rarity = "UMUM" | "RARE" | "EPIC" | "LEGEND" | "SKIN" | "BOSS";

export type Pal = {
  body: string;
  bodyD: string;
  accent: string;
  wood: string;
  woodD: string;
  glow: string;
  metal: string;
  metalD: string;
};

export type Weapon = {
  id: number;
  name: string;
  kind: Kind;
  rarity: Rarity;
  pal: Pal;
  locked: boolean;
  isNew: boolean;
  star: boolean;
  stat: string;
};

export const RARITY_LEVEL: Record<Rarity, number> = { UMUM: 0, SKIN: 1, RARE: 1, EPIC: 2, LEGEND: 3, BOSS: 4 };

export const RARITY_STYLE: Record<Rarity, { chip: string; text: string; ring: string }> = {
  UMUM: { chip: "bg-[#c9ced6] text-[#2b3038]", text: "text-[#c9ced6]", ring: "#9aa3ad" },
  RARE: { chip: "bg-[#3b82f6] text-white", text: "text-[#60a5fa]", ring: "#3b82f6" },
  EPIC: { chip: "bg-[#a855f7] text-white", text: "text-[#c084fc]", ring: "#a855f7" },
  LEGEND: { chip: "bg-gradient-to-b from-[#ffd23f] to-[#f59e0b] text-[#3a2400]", text: "text-[#fbbf24]", ring: "#f59e0b" },
  SKIN: { chip: "bg-[#ec4899] text-white", text: "text-[#f472b6]", ring: "#ec4899" },
  BOSS: { chip: "bg-[#dc2626] text-white", text: "text-[#f87171]", ring: "#dc2626" },
};

const BASE: Record<Rarity, Pal> = {
  UMUM: { body: "#8a939c", bodyD: "#3f474f", accent: "#ffb020", wood: "#d2732e", woodD: "#7a3a14", glow: "#ffd56a", metal: "#e6ebef", metalD: "#59636c" },
  RARE: { body: "#3b82f6", bodyD: "#1e3a8a", accent: "#67e8f9", wood: "#334155", woodD: "#1e293b", glow: "#38bdf8", metal: "#dbeafe", metalD: "#475569" },
  EPIC: { body: "#a855f7", bodyD: "#4c1d95", accent: "#f0abfc", wood: "#3b2a52", woodD: "#1f1430", glow: "#e879f9", metal: "#ede9fe", metalD: "#5b4a73" },
  LEGEND: { body: "#fbbf24", bodyD: "#a16207", accent: "#fff7cc", wood: "#7c2d12", woodD: "#431407", glow: "#fde047", metal: "#fff7d6", metalD: "#92651a" },
  SKIN: { body: "#f472b6", bodyD: "#9d174d", accent: "#a7f3d0", wood: "#fde68a", woodD: "#b45309", glow: "#f9a8d4", metal: "#fdf2f8", metalD: "#9f5f80" },
  BOSS: { body: "#ef4444", bodyD: "#3f0a0a", accent: "#fca5a5", wood: "#262626", woodD: "#0a0a0a", glow: "#ff5a3d", metal: "#fde2e2", metalD: "#4a1d1d" },
};

const UMUM_BODIES = ["#8a939c", "#4b5563", "#6b7a4a", "#a8916a", "#3a3f45", "#9aa7b4"];

const OVERRIDE: Record<string, Partial<Pal>> = {
  "AK-47": { body: "#7d858d", bodyD: "#2f353b", wood: "#d9732a" },
  "Nail Gun": { body: "#facc15", bodyD: "#2a2a2a", accent: "#1f1f1f", metal: "#d6dadf" },
  Crossbow: { body: "#3a3f45", bodyD: "#1f2327", wood: "#c26a2c" },
  "Plasma Gun": { body: "#64748b", bodyD: "#1e293b", glow: "#22d3ee" },
  "Laser Beam": { body: "#475569", bodyD: "#0f172a", glow: "#38bdf8" },
  "Golden Eagle": { body: "#fbbf24", metal: "#fff1b8" },
  "Banana Gun": { body: "#fde047" },
};

const LIST: [string, Kind][][] = [
  // UMUM (24)
  [
    ["Pistol", "pistol"], ["AK-47", "rifle"], ["Nail Gun", "smg"], ["Crossbow", "crossbow"],
    ["Revolver", "revolver"], ["Shotgun", "shotgun"], ["Uzi", "smg"], ["Hunting Rifle", "sniper"],
    ["Desert Eagle", "pistol"], ["M16", "rifle"], ["Double Barrel", "shotgun"], ["Flare Gun", "blaster"],
    ["Glock", "pistol"], ["MP5", "smg"], ["Colt .45", "revolver"], ["Pump Action", "shotgun"],
    ["Carbine", "rifle"], ["Hand Cannon", "revolver"], ["Tommy Gun", "smg"], ["Musket", "sniper"],
    ["Water Blaster", "blaster"], ["Paintball", "smg"], ["Rocket Lite", "bazooka"], ["Grenade Tube", "launcher"],
  ],
  // RARE (18)
  [
    ["Plasma Gun", "plasma"], ["Laser Beam", "laser"], ["Ion Rifle", "laser"], ["Pulse SMG", "smg"],
    ["Frost Blaster", "blaster"], ["Thunder Bolt", "crossbow"], ["Venom Sniper", "sniper"], ["Shock Shotgun", "shotgun"],
    ["Neon Pistol", "pistol"], ["Gatling", "minigun"], ["Napalm", "flamer"], ["Storm Rifle", "rifle"],
    ["Photon", "plasma"], ["Viper", "revolver"], ["Bazooka", "bazooka"], ["Sonic Cannon", "launcher"],
    ["Hawk Eye", "sniper"], ["Ember", "flamer"],
  ],
  // EPIC (16)
  [
    ["Dragon Breath", "flamer"], ["Void Cannon", "plasma"], ["Quantum Rifle", "laser"], ["Inferno", "minigun"],
    ["Shadow Bow", "crossbow"], ["Nebula", "blaster"], ["Titan", "bazooka"], ["Phantom", "sniper"],
    ["Hydra", "shotgun"], ["Tesla Coil", "plasma"], ["Cyclone", "minigun"], ["Nova", "laser"],
    ["Raptor", "rifle"], ["Obsidian", "revolver"], ["Eclipse", "smg"], ["Meteor", "launcher"],
  ],
  // LEGEND (12)
  [
    ["Golden Eagle", "pistol"], ["Excalibur", "laser"], ["Thor Hammer", "launcher"], ["Phoenix", "flamer"],
    ["Zeus Bolt", "crossbow"], ["Leviathan", "minigun"], ["Odin Eye", "sniper"], ["Ragnarok", "bazooka"],
    ["Solaris", "plasma"], ["Valkyrie", "rifle"], ["Midas", "revolver"], ["Genesis", "blaster"],
  ],
  // SKIN (12)
  [
    ["Candy Pistol", "pistol"], ["Pixel AK", "rifle"], ["Toy Blaster", "blaster"], ["Bubble Gun", "plasma"],
    ["Disco Laser", "laser"], ["Pumpkin Cannon", "launcher"], ["Snow Shotgun", "shotgun"], ["Neko Bow", "crossbow"],
    ["Banana Gun", "smg"], ["Lava Sniper", "sniper"], ["Cyber Revolver", "revolver"], ["Party Rocket", "bazooka"],
  ],
  // BOSS (8)
  [
    ["Overlord", "minigun"], ["Doom Cannon", "bazooka"], ["Kraken", "launcher"], ["Behemoth", "minigun"],
    ["Reaper", "sniper"], ["Hellfire", "flamer"], ["Omega", "plasma"], ["Dark Matter", "laser"],
  ],
];
const RARS: Rarity[] = ["UMUM", "RARE", "EPIC", "LEGEND", "SKIN", "BOSS"];

const STAT: Record<Kind, string> = {
  pistol: "BALANCED",
  rifle: "FAST",
  smg: "BRUTAL",
  crossbow: "SILENT",
  plasma: "ENERGY",
  laser: "PRECISION",
  shotgun: "POWERFUL",
  sniper: "LONG RANGE",
  revolver: "DEADLY",
  minigun: "SAVAGE",
  bazooka: "EXPLOSIVE",
  blaster: "UNIQUE",
  launcher: "AREA",
  flamer: "BURNING",
};

// locked set: Plasma Gun, Laser Beam, 2 more RARE, 4 EPIC, 8 LEGEND, all 8 BOSS → 24 locked / 66 open
const LOCKED = new Set([
  "Plasma Gun", "Laser Beam", "Hawk Eye", "Sonic Cannon",
  "Void Cannon", "Tesla Coil", "Cyclone", "Meteor",
  "Excalibur", "Thor Hammer", "Phoenix", "Leviathan", "Odin Eye", "Ragnarok", "Solaris", "Genesis",
  "Overlord", "Doom Cannon", "Kraken", "Behemoth", "Reaper", "Hellfire", "Omega", "Dark Matter",
]);

// "ALL" order: first page exactly like the reference, then round-robin through rarities
function build(): Weapon[] {
  const pools = LIST.map((l, ri) => l.map((x, i) => ({ name: x[0], kind: x[1], rarity: RARS[ri], i })));
  const first = [...pools[0].splice(0, 4), ...pools[1].splice(0, 2)];
  const ordered = [...first];
  let r = 0;
  while (pools.some((p) => p.length)) {
    const p = pools[r % pools.length];
    const take = r % pools.length === 0 ? 2 : 1;
    for (let k = 0; k < take && p.length; k++) ordered.push(p.shift()!);
    r++;
  }
  return ordered.map((w, id) => {
    const base = BASE[w.rarity];
    const pal: Pal = {
      ...base,
      ...(w.rarity === "UMUM" ? { body: UMUM_BODIES[w.i % UMUM_BODIES.length] } : {}),
      ...(OVERRIDE[w.name] ?? {}),
    };
    return {
      id,
      name: w.name,
      kind: w.kind,
      rarity: w.rarity,
      pal,
      locked: LOCKED.has(w.name),
      isNew: id < 36 || w.rarity === "BOSS",
      star: id % 2 === 1 && id < 62,
      stat: STAT[w.kind],
    };
  });
}

export const WEAPONS = build();
export const OPEN_COUNT = WEAPONS.filter((w) => !w.locked).length;
export const STAR_COUNT = WEAPONS.filter((w) => w.star).length;

export type TabId = "ALL" | Rarity;
/** English label for every tab/rarity id. The ids stay unchanged: saves and
 *  filters key off them, only the visible word changes. */
export const RARITY_LABEL: Record<TabId, string> = {
  ALL: "ALL", UMUM: "COMMON", RARE: "RARE", EPIC: "EPIC", LEGEND: "LEGEND", SKIN: "SKIN", BOSS: "BOSS",
};
export const TABS: { id: TabId; icon: FlatName }[] = [
  { id: "ALL", icon: "crown" },
  { id: "UMUM", icon: "shield" },
  { id: "RARE", icon: "gem" },
  { id: "EPIC", icon: "bolt" },
  { id: "LEGEND", icon: "fire" },
  { id: "SKIN", icon: "palette" },
  { id: "BOSS", icon: "demon" },
];

export const filterWeapons = (tab: TabId) => (tab === "ALL" ? WEAPONS : WEAPONS.filter((w) => w.rarity === tab));
