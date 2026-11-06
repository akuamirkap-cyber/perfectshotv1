import type { FlatName } from "../ui/FlatIcons";
import { useSyncExternalStore } from "react";

export type ThemeId =
  | "hutan" | "pagi" | "town" | "salju" | "malam" | "perang"
  | "mistis" | "kristal" | "neon" | "kubah" | "cyber" | "nebula";
export type ThemeSel = ThemeId | "auto";
export type Particle = "firefly" | "snow" | "ember" | "star" | "rain" | "pollen" | "spark";
export type FloorKind = "water" | "ice" | "grid" | "stone" | "lava" | "void";
export type SkyKind =
  | "trees" | "pines" | "hills" | "houses" | "city" | "ruins"
  | "crystals" | "domes" | "mountains" | "neonMtn" | "rocks" | "none";
export type Feature = "sun" | "moon" | "neonSun" | "planets" | "clouds" | "fog" | "fire" | "aurora" | "runes";

export type Theme = {
  id: ThemeId;
  name: string;
  icon: string;
  desc: string;
  sky: [string, string, string];
  glow: string;
  far: { kind: SkyKind; color: string };
  near: { kind: SkyKind; color: string };
  trunks?: boolean;
  features: Feature[];
  particle: Particle;
  pc: string;
  floor: { a: string; b: string; line: string; kind: FloorKind; island: string };
  column: [string, string, string];
  accent: string;
  tile: [string, string];
  props: FlatName[];
  grass: string;
};

export const THEMES: Theme[] = [
  {
    id: "hutan", name: "FOREST", icon: "🌲", desc: "Classic jungle forest with tree silhouettes & golden fireflies",
    sky: ["#0b1a1f", "#2a4d55", "#10242a"], glow: "#4f8088",
    far: { kind: "trees", color: "#1a333a" }, near: { kind: "trees", color: "#0d1c21" }, trunks: true,
    features: ["fog"], particle: "firefly", pc: "#ffe48a",
    floor: { a: "#2a6466", b: "#123236", line: "rgba(170,240,225,.22)", kind: "water", island: "#4a6b3a" },
    column: ["#f2f7f4", "#c3d4cf", "#6f8a86"], accent: "#3fdc72", tile: ["#2f6a5e", "#0f2427"],
    props: ["pine", "mushroom", "rock", "tree", "flower"], grass: "#05090b",
  },
  {
    id: "pagi", name: "MORNING", icon: "🌅", desc: "Bright morning lake with a rising sun & green hills",
    sky: ["#ff9e6b", "#ffd6a0", "#a8e2f0"], glow: "#fff4c9",
    far: { kind: "hills", color: "#8fc79a" }, near: { kind: "trees", color: "#4f8f5a" },
    features: ["sun", "clouds"], particle: "pollen", pc: "#fffbe0",
    floor: { a: "#3fc1e0", b: "#9fe3f2", line: "rgba(255,255,255,.4)", kind: "water", island: "#f5d58a" },
    column: ["#ffffff", "#e3eef3", "#9ab3bf"], accent: "#ff8a3d", tile: ["#ffa25e", "#8a3f1c"],
    props: ["palm", "boat", "flower", "tree", "rock"], grass: "#2f5a35",
  },
  {
    id: "town", name: "TOWN", icon: "🏘️", desc: "Small town at dusk with warm window lights",
    sky: ["#2b1b4a", "#b0506e", "#ffa06b"], glow: "#ffcf8a",
    far: { kind: "houses", color: "#4a2d55" }, near: { kind: "houses", color: "#24152f" },
    features: ["clouds"], particle: "spark", pc: "#ffd27a",
    floor: { a: "#6b5672", b: "#3a2a48", line: "rgba(255,210,160,.28)", kind: "stone", island: "#8a6a55" },
    column: ["#fbefe0", "#d4bca2", "#7d6550"], accent: "#ffb347", tile: ["#c0607a", "#3d1f3f"],
    props: ["house", "lantern", "tree", "house", "flower"], grass: "#1a0f22",
  },
  {
    id: "salju", name: "SNOW", icon: "❄️", desc: "Snowy mountains with white pines & a soft snowfall",
    sky: ["#bfe2ff", "#8fc0ec", "#dff1ff"], glow: "#ffffff",
    far: { kind: "mountains", color: "#9fbfe0" }, near: { kind: "pines", color: "#3f6a8f" },
    features: ["clouds"], particle: "snow", pc: "#ffffff",
    floor: { a: "#bfe6ff", b: "#e8f6ff", line: "rgba(255,255,255,.75)", kind: "ice", island: "#ffffff" },
    column: ["#ffffff", "#dcecf7", "#8fb1cc"], accent: "#38bdf8", tile: ["#9fd6f7", "#3b6a96"],
    props: ["pine", "crystal", "rock", "pine", "house"], grass: "#e6f3ff",
  },
  {
    id: "malam", name: "NIGHT", icon: "🌙", desc: "Starry night with a full moon over a calm lake",
    sky: ["#04061a", "#1d1656", "#3c2d80"], glow: "#7464d8",
    far: { kind: "hills", color: "#1d1a4d" }, near: { kind: "pines", color: "#0a0822" },
    features: ["moon"], particle: "star", pc: "#ffffff",
    floor: { a: "#26307a", b: "#0b1036", line: "rgba(180,170,255,.25)", kind: "water", island: "#3a3a6b" },
    column: ["#e2e0fa", "#a4a0d6", "#4d4785"], accent: "#a78bfa", tile: ["#2d2275", "#0b0824"],
    props: ["pine", "lantern", "rock", "tree", "flower"], grass: "#03041a",
  },
  {
    id: "perang", name: "WAR", icon: "🔥", desc: "Burning battlefield with ruins & flying embers",
    sky: ["#1a0705", "#6b1d0e", "#ff7a2f"], glow: "#ff9a4d",
    far: { kind: "ruins", color: "#4a160c" }, near: { kind: "ruins", color: "#1c0907" },
    features: ["fire", "fog"], particle: "ember", pc: "#ffb347",
    floor: { a: "#4a1a12", b: "#1d0806", line: "rgba(255,130,50,.55)", kind: "lava", island: "#5a3a2a" },
    column: ["#d6c4b2", "#94806e", "#463529"], accent: "#ff6a2b", tile: ["#d0480f", "#3b0d05"],
    props: ["rock", "tomb", "house", "dynamite", "rock"], grass: "#120403",
  },
  {
    id: "mistis", name: "MYSTIC", icon: "🔮", desc: "Foggy mysterious swamp with light spirits & ancient runes",
    sky: ["#08160f", "#1f3d30", "#3d2b5e"], glow: "#7ef0c0",
    far: { kind: "trees", color: "#1d3a35" }, near: { kind: "trees", color: "#0a1712" }, trunks: true,
    features: ["fog", "runes"], particle: "firefly", pc: "#9dffd8",
    floor: { a: "#1d4a40", b: "#0a1a16", line: "rgba(126,240,192,.25)", kind: "water", island: "#2d4a3a" },
    column: ["#dcece3", "#9ab8aa", "#4f6b5e"], accent: "#7ef0c0", tile: ["#2b6a55", "#1d1233"],
    props: ["mushroom", "crystal", "tomb", "tree", "lantern"], grass: "#040b08",
  },
  {
    id: "kristal", name: "CRYSTAL", icon: "💎", desc: "Glittering crystal cave with an aurora & blue ice floor",
    sky: ["#051433", "#0e3d70", "#22b8dd"], glow: "#8afcff",
    far: { kind: "crystals", color: "#1a5a8f" }, near: { kind: "crystals", color: "#0a2a52" },
    features: ["aurora"], particle: "spark", pc: "#c8fbff",
    floor: { a: "#1e78b0", b: "#0b2f5a", line: "rgba(190,250,255,.5)", kind: "ice", island: "#8fe8ff" },
    column: ["#effcff", "#a8e6f7", "#3c8fb5"], accent: "#22d3ee", tile: ["#1aa6d6", "#0a2050"],
    props: ["crystal", "rock", "gem", "crystal", "rock"], grass: "#03132b",
  },
  {
    id: "neon", name: "NEON", icon: "🌆", desc: "Retro synthwave with a neon sun & glowing grid floor",
    sky: ["#12002b", "#4d0a70", "#ff3ea5"], glow: "#ff8ae0",
    far: { kind: "neonMtn", color: "#2a0050" }, near: { kind: "none", color: "#000" },
    features: ["neonSun"], particle: "spark", pc: "#ff8ae0",
    floor: { a: "#22003f", b: "#07001a", line: "#ff3ea5", kind: "grid", island: "#3a0a5a" },
    column: ["#ffe6f8", "#e290d4", "#7a2a8a"], accent: "#ff3ea5", tile: ["#8a20b0", "#22003d"],
    props: ["palm", "joystick", "crystal", "palm", "lantern"], grass: "#0d0020",
  },
  {
    id: "kubah", name: "DOME", icon: "🕌", desc: "Golden dome city under a purple sky & crescent moon",
    sky: ["#140a2e", "#3d2070", "#9a5fd0"], glow: "#ffd27a",
    far: { kind: "domes", color: "#2d1a55" }, near: { kind: "domes", color: "#170d33" },
    features: ["moon"], particle: "star", pc: "#ffe7a8",
    floor: { a: "#54428a", b: "#221848", line: "rgba(255,220,150,.3)", kind: "stone", island: "#a08a5a" },
    column: ["#fff7e6", "#e3cca3", "#8a6d45"], accent: "#ffd27a", tile: ["#6a40b0", "#1a0f38"],
    props: ["dome", "lantern", "dome", "palm", "house"], grass: "#0a0520",
  },
  {
    id: "cyber", name: "CYBER", icon: "🌐", desc: "Cyber metropolis with skyscrapers & data rain",
    sky: ["#020a1a", "#06264d", "#0b7090"], glow: "#22d3ee",
    far: { kind: "city", color: "#0a2a4f" }, near: { kind: "city", color: "#031428" },
    features: [], particle: "rain", pc: "#38e0ff",
    floor: { a: "#04213f", b: "#010812", line: "#22d3ee", kind: "grid", island: "#0b3a5f" },
    column: ["#e2f9ff", "#86cbe2", "#1f5a75"], accent: "#22d3ee", tile: ["#0b5a80", "#020a1a"],
    props: ["house", "robot", "crystal", "lantern", "rock"], grass: "#010610",
  },
  {
    id: "nebula", name: "NEBULA", icon: "🪐", desc: "Deep space with nebula clouds, a ringed planet & stars",
    sky: ["#05010f", "#2c0b4e", "#6e2080"], glow: "#ff8ad8",
    far: { kind: "rocks", color: "#1d0a33" }, near: { kind: "none", color: "#000" },
    features: ["planets"], particle: "star", pc: "#ffffff",
    floor: { a: "#1c0838", b: "#04000c", line: "rgba(255,150,230,.28)", kind: "void", island: "#3a2060" },
    column: ["#f1e6ff", "#b69de2", "#5a3d8f"], accent: "#e879f9", tile: ["#561c8a", "#0a0220"],
    props: ["planet", "rock", "alien", "crystal", "planet"], grass: "#03000a",
  },
];

export const THEME_MAP = Object.fromEntries(THEMES.map((t) => [t.id, t])) as Record<ThemeId, Theme>;
export const GAME_SPEEDS = [
  { v: 1, label: "NORMAL" },
  { v: 1.2, label: "TURBO" },
  { v: 1.3, label: "TURBO" },
  { v: 1.4, label: "TURBO" },
];

/* ---------------- settings store ---------------- */
type Settings = { theme: ThemeSel; speed: number; icons: "flat" | "classic" | "gold" | "neon"; iconsV?: number; quickBack: boolean };
const KEY = "ps_settings_v1";
const load = (): Settings => {
  try {
    const r = localStorage.getItem(KEY);
    if (r) {
      const o = { theme: "hutan" as ThemeSel, speed: 1, icons: "flat" as Settings["icons"], quickBack: true, ...JSON.parse(r) } as Settings;
      if (!o.iconsV) {
        o.icons = "flat";
        o.iconsV = 2;
      }
      return o;
    }
  } catch {
    /* ignore */
  }
  return { theme: "hutan", speed: 1, icons: "flat", iconsV: 2, quickBack: true };
};
let state = load();
const ls = new Set<() => void>();
const set = (p: Partial<Settings>) => {
  state = { ...state, ...p };
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
  ls.forEach((f) => f());
};
export const settings = {
  get: () => state,
  subscribe: (f: () => void) => {
    ls.add(f);
    return () => ls.delete(f);
  },
  setTheme: (theme: ThemeSel) => set({ theme }),
  setSpeed: (speed: number) => set({ speed }),
  setIcons: (icons: Settings["icons"]) => set({ icons }),
  setQuickBack: (quickBack: boolean) => set({ quickBack }),
};
export const useSettings = () => useSyncExternalStore(settings.subscribe, settings.get, settings.get);

/* ---------------- resolution ---------------- */
let menuVisit = 0;
export const bumpMenuVisit = () => {
  menuVisit++;
};
export const cycleOf = (n: number) => Math.floor((n - 1) / 5);
/** ctx = "menu" or a quest cycle index */
export function themeFor(sel: ThemeSel, ctx: "menu" | number): Theme {
  if (sel !== "auto") return THEME_MAP[sel];
  const i = ctx === "menu" ? menuVisit : ctx;
  return THEMES[((i % THEMES.length) + THEMES.length) % THEMES.length];
}
