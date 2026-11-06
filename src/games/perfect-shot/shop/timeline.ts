import { scaleTL } from "../anim/speed";
/** Steel-door transition framing the Armory in both games (ms). */
export const ARMORY_SHUTTER = { cover: 420, hold: 380, reveal: 700 } as const;

/** Armory entrance / exit timeline (ms). Shared by visuals + audio. */
export const SHOP_IN = scaleTL({
  bg: { d: 0, dur: 900 },
  top: (i: number) => ({ d: 80 + i * 60, dur: 620 }), // back, svg, export, currency
  row2: { d: 260, dur: 600 },
  spot: { d: 250, dur: 700 },
  rays: { d: 320, dur: 900 },
  hero: { d: 380, dur: 900, land: 0.55 }, // lands at 875ms
  plate: { d: 820, dur: 460, land: 0.55 },
  pill: { d: 960, dur: 600 },
  tab: (i: number) => ({ d: 1000 + i * 55, dur: 520, land: 0.65 }),
  panel: { d: 1080, dur: 680, land: 0.6 },
  info: { d: 1320, dur: 600 },
  card: (i: number) => ({ d: 1420 + i * 85, dur: 680, land: 0.55 }),
  pager: { d: 1950, dur: 500 },
  dots: (i: number) => ({ d: 1980 + i * 22, dur: 450 }),
  bottom: { d: 1450, dur: 650 },
  fill: { d: 1750, dur: 1100 },
  ready: 1300,
});

export const SHOP_OUT = scaleTL({
  card: (i: number) => ({ d: (5 - i) * 35, dur: 400 }),
  pager: { d: 0, dur: 250 },
  panel: { d: 140, dur: 460 },
  tab: (i: number) => ({ d: 40 + i * 25, dur: 360 }),
  plate: { d: 60, dur: 380 },
  hero: { d: 90, dur: 540 },
  top: (i: number) => ({ d: i * 35, dur: 380 }),
  bottom: { d: 0, dur: 400 },
  bg: { d: 150, dur: 600 },
  total: 560,
});

export const PAGE_SIZE = 6;
