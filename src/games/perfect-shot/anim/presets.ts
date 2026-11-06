import { useSyncExternalStore } from "react";

export type StyleId = "classic" | "combo" | "pop" | "rise" | "fall" | "storm" | "spin" | "flip" | "jelly" | "glitch";
export type GroupId = "gun" | "buttons" | "nav" | "title";
export type Mode = "fixed" | "auto" | "mix";
export type GroupCfg = { mode: Mode; style: StyleId };
export type AnimCfg = { speed: number; groups: Record<GroupId, GroupCfg> };

/** fully resolved styles for one menu entrance (and the matching exit) */
export type Plan = {
  title: StyleId[]; // 11 letters (PERFECT + SHOT)
  gun: StyleId;
  buttons: StyleId[]; // [quest, play]
  nav: StyleId[]; // 4 icons
  k: number; // time multiplier (1 / speed)
};

// Both panes render the same menu choreography, so AUTO/MIX must share the
// resolved roll instead of independently choosing different animation styles.
let activeMenuPlan: Plan | null = null;
const menuPlanListeners = new Set<(plan: Plan) => void>();
export const publishMenuPlan = (plan: Plan) => {
  activeMenuPlan = plan;
  menuPlanListeners.forEach((listener) => listener(plan));
};
export const getSharedMenuPlan = () => activeMenuPlan;
export const subscribeMenuPlan = (listener: (plan: Plan) => void) => {
  menuPlanListeners.add(listener);
  return () => { menuPlanListeners.delete(listener); };
};

export const STYLES: { id: StyleId; name: string; icon: string; desc: string }[] = [
  { id: "classic", name: "Classic", icon: "⭐", desc: "The original animation" },
  { id: "combo", name: "Preset 1", icon: "🎯", desc: "Drop Up → Vortex Spin ↻ → Pop Blast (3 s)" },
  { id: "pop", name: "Pop Blast", icon: "💥", desc: "Blasts out of a point + shockwave" },
  { id: "rise", name: "Drop Up", icon: "🚀", desc: "Shoots up from below, squash & stretch" },
  { id: "fall", name: "Drop Fall", icon: "☄️", desc: "Falls from the sky & bounces" },
  { id: "storm", name: "Slide Storm", icon: "🌪️", desc: "Sweeps in from the side with motion blur" },
  { id: "spin", name: "Vortex Spin", icon: "🌀", desc: "Spins out of a vortex" },
  { id: "flip", name: "Flip 3D", icon: "🃏", desc: "Flips over like a card" },
  { id: "jelly", name: "Jelly Bounce", icon: "🍮", desc: "Wobbly elastic bounce" },
  { id: "glitch", name: "Glitch Warp", icon: "👾", desc: "Digital distortion" },
];
export const STYLE_MAP = Object.fromEntries(STYLES.map((s) => [s.id, s])) as Record<StyleId, (typeof STYLES)[number]>;

export const GROUPS: { id: GroupId; name: string; icon: string; count: number }[] = [
  { id: "gun", name: "Weapon", icon: "🔫", count: 1 },
  { id: "buttons", name: "Main Buttons", icon: "🎮", count: 2 },
  { id: "nav", name: "Bottom Nav", icon: "📱", count: 4 },
  { id: "title", name: "Title Logo", icon: "🔠", count: 11 },
];

export const SPEEDS = [0.5, 0.75, 1, 1.5, 2];

/** fraction of the animation at which the element visually "lands" (for SFX sync) */
export const LAND: Record<StyleId, number> = {
  classic: 0.6,
  combo: 0.95,
  pop: 0.38,
  rise: 0.55,
  fall: 0.45,
  storm: 0.55,
  spin: 0.7,
  flip: 0.6,
  jelly: 0.3,
  glitch: 0.55,
};

export function animClass(style: StyleId, phase: "in" | "out", classic: [string, string]) {
  if (style === "classic") return phase === "in" ? classic[0] : classic[1];
  return `st-${phase}-${style}`;
}

/* ------------------------------------------------------------------ */
/* store                                                              */
/* ------------------------------------------------------------------ */
const KEY = "ps_anim_v2";
const DEFAULT: AnimCfg = {
  speed: 1,
  groups: {
    gun: { mode: "fixed", style: "combo" },
    buttons: { mode: "fixed", style: "classic" },
    nav: { mode: "fixed", style: "classic" },
    title: { mode: "fixed", style: "classic" },
  },
};

function loadCfg(): AnimCfg {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const p = JSON.parse(raw) as AnimCfg;
      return { speed: p.speed ?? 1, groups: { ...DEFAULT.groups, ...p.groups } };
    }
  } catch {
    /* ignore */
  }
  return structuredClone(DEFAULT);
}

class AnimStore {
  cfg: AnimCfg = loadCfg();
  private ls = new Set<() => void>();
  subscribe = (f: () => void) => {
    this.ls.add(f);
    return () => this.ls.delete(f);
  };
  get = () => this.cfg;
  private set(c: AnimCfg) {
    this.cfg = c;
    try {
      localStorage.setItem(KEY, JSON.stringify(c));
    } catch {
      /* ignore */
    }
    this.ls.forEach((f) => f());
  }
  setGroup(id: GroupId, patch: Partial<GroupCfg>) {
    this.set({ ...this.cfg, groups: { ...this.cfg.groups, [id]: { ...this.cfg.groups[id], ...patch } } });
  }
  setSpeed(speed: number) {
    this.set({ ...this.cfg, speed });
  }
  setAllMode(mode: Mode) {
    const g = { ...this.cfg.groups };
    (Object.keys(g) as GroupId[]).forEach((k) => {
      g[k] = { ...g[k], mode: mode === "mix" && k === "gun" ? "auto" : mode };
    });
    this.set({ ...this.cfg, groups: g });
  }
  setAllStyle(style: StyleId) {
    const g = { ...this.cfg.groups };
    (Object.keys(g) as GroupId[]).forEach((k) => (g[k] = { mode: "fixed", style }));
    this.set({ ...this.cfg, groups: g });
  }
  reset() {
    this.set(structuredClone(DEFAULT));
  }
}

export const animStore = new AnimStore();
export const useAnimCfg = () => useSyncExternalStore(animStore.subscribe, animStore.get, animStore.get);

/* ------------------------------------------------------------------ */
/* resolver                                                           */
/* ------------------------------------------------------------------ */
const IDS = STYLES.map((s) => s.id);
let allowCombo = false;
const pick = (avoid?: StyleId) => {
  const pool = IDS.filter((i) => i !== avoid && (allowCombo || i !== "combo"));
  return pool[Math.floor(Math.random() * pool.length)];
};

function resolveGroup(g: GroupCfg, count: number, prev?: StyleId[]): StyleId[] {
  if (g.mode === "fixed") return Array(count).fill(g.style);
  if (g.mode === "auto") {
    const s = pick(prev?.[0]);
    return Array(count).fill(s);
  }
  // mix: each element gets its own style, neighbours never repeat
  const out: StyleId[] = [];
  for (let i = 0; i < count; i++) out.push(pick(out[i - 1] ?? prev?.[i]));
  return out;
}

export function resolvePlan(cfg: AnimCfg, prev?: Plan): Plan {
  allowCombo = true;
  const gun = resolveGroup(cfg.groups.gun.mode === "mix" ? { ...cfg.groups.gun, mode: "auto" } : cfg.groups.gun, 1, prev ? [prev.gun] : undefined)[0];
  allowCombo = false;
  return {
    gun,
    buttons: resolveGroup(cfg.groups.buttons, 2, prev?.buttons),
    nav: resolveGroup(cfg.groups.nav, 4, prev?.nav),
    title: resolveGroup(cfg.groups.title, 11, prev?.title),
    k: 1 / cfg.speed,
  };
}

/* ------------------------------------------------------------------ */
/* shared element timeline (ms, before speed scaling)                 */
/* ------------------------------------------------------------------ */
/** gun timing depends on its style — Preset 1 lasts exactly 3 s */
export const gunTiming = (st: StyleId) => (st === "combo" ? { inD: 600, inDur: 3000, outD: 60, outDur: 600 } : TL.gun);
/** the wheel (rays) behind the gun: drop down, then pop blast */
export const WHEEL = { d: 200, dur: 1100 };

export const TL = {
  letter: (i: number) => ({ inD: 300 + i * 70, inDur: 750, outD: 40 + i * 30, outDur: 420 }),
  // bullet travels 0→96% of the bar in 437ms; letter centres sit at ≈15/38/62/85%
  shot: (i: number) => ({ inD: [838, 943, 1052, 1157][i], inDur: 380, outD: 160 + i * 25, outDur: 460 }),
  gun: { inD: 600, inDur: 1000, outD: 60, outDur: 600 },
  buttons: (i: number) => ({ inD: 1350 + i * 80, inDur: 700, outD: 0, outDur: 480 }),
  nav: (i: number) => ({ inD: 1550 + i * 80, inDur: 650, outD: 20 + i * 45, outDur: 420 }),
};
