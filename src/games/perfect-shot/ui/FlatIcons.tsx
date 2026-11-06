import { useId, type CSSProperties } from "react";

/* =====================================================================
   FLAT ICON LIBRARY — single colour silhouettes, details cut out as gaps.
   viewBox 0 0 64 64.
     m = filled body
     a = filled inner part separated from the body by a thin gap
     d = cut line (width w)
     s = thick stroke (width w)
   ===================================================================== */
type L = { k: "m" | "a" | "d" | "s"; p: string; w?: number; eo?: boolean };

const C = (cx: number, cy: number, r: number) => `M${cx - r} ${cy} a${r} ${r} 0 1 0 ${2 * r} 0 a${r} ${r} 0 1 0 ${-2 * r} 0 Z`;
const R = (x: number, y: number, w: number, h: number, r: number) =>
  `M${x + r} ${y} H${x + w - r} Q${x + w} ${y} ${x + w} ${y + r} V${y + h - r} Q${x + w} ${y + h} ${x + w - r} ${y + h} H${x + r} Q${x} ${y + h} ${x} ${y + h - r} V${y + r} Q${x} ${y} ${x + r} ${y} Z`;
const DOT = (x: number, y: number) => `M${x} ${y} L${x} ${y + 0.01}`;
const STAR = (cx: number, cy: number, ro: number, ri: number) => {
  const p: string[] = [];
  for (let i = 0; i < 10; i++) {
    const a = (i * Math.PI) / 5 - Math.PI / 2;
    const r = i % 2 ? ri : ro;
    p.push(`${(cx + Math.cos(a) * r).toFixed(2)} ${(cy + Math.sin(a) * r).toFixed(2)}`);
  }
  return `M${p.join(" L")} Z`;
};
const SPARK = (cx: number, cy: number, r: number) =>
  `M${cx} ${cy - r} C${cx + r * 0.12} ${cy - r * 0.3} ${cx + r * 0.3} ${cy - r * 0.12} ${cx + r} ${cy} C${cx + r * 0.3} ${cy + r * 0.12} ${cx + r * 0.12} ${cy + r * 0.3} ${cx} ${cy + r} C${cx - r * 0.12} ${cy + r * 0.3} ${cx - r * 0.3} ${cy + r * 0.12} ${cx - r} ${cy} C${cx - r * 0.3} ${cy - r * 0.12} ${cx - r * 0.12} ${cy - r * 0.3} ${cx} ${cy - r} Z`;

export const FLAT = {
  /* ---------- ui ---------- */
  lock: [
    { k: "s", p: "M22 29 V21 a10 10 0 0 1 20 0 V29", w: 6 },
    { k: "m", p: R(13, 27, 38, 29, 6) },
    { k: "d", p: DOT(32, 39), w: 7 },
    { k: "d", p: "M32 41 V48", w: 3.4 },
  ],
  unlock: [
    { k: "s", p: "M22 29 V21 a10 10 0 0 1 19.6 -3", w: 6 },
    { k: "m", p: R(13, 27, 38, 29, 6) },
    { k: "d", p: DOT(32, 39), w: 7 },
    { k: "d", p: "M32 41 V48", w: 3.4 },
  ],
  check: [{ k: "s", p: "M13 33 L27 47 L51 19", w: 9 }],
  gem: [
    { k: "m", p: "M18 11 H46 L58 25 L32 56 L6 25 Z" },
    { k: "d", p: "M6 25 H58 M23 11 L18 25 L32 55 M41 11 L46 25 L32 55", w: 2.2 },
  ],
  download: [
    { k: "s", p: "M32 8 V34", w: 7 },
    { k: "m", p: "M18 28 L32 43 L46 28 Z" },
    { k: "s", p: "M11 43 V53 H53 V43", w: 6 },
  ],
  up: [{ k: "m", p: "M32 7 L55 32 H41 V57 H23 V32 H9 Z" }],
  right: [{ k: "m", p: "M7 23 H33 V10 L58 32 L33 54 V41 H7 Z" }],
  cart: [
    { k: "s", p: "M5 11 H13 L20 41 H50", w: 5 },
    { k: "m", p: "M16 18 H58 L51 41 H21 Z" },
    { k: "m", p: C(24, 51, 5.5) },
    { k: "m", p: C(46, 51, 5.5) },
    { k: "d", p: "M30 22 V37 M40 22 V37", w: 2.4 },
  ],
  dice: [
    { k: "m", p: R(8, 8, 48, 48, 11) },
    { k: "d", p: `${DOT(21, 21)} ${DOT(43, 21)} ${DOT(32, 32)} ${DOT(21, 43)} ${DOT(43, 43)}`, w: 9 },
  ],
  doc: [
    { k: "m", p: "M14 5 H40 L52 17 V59 H14 Z" },
    { k: "a", p: "M40 5 V17 H52 Z" },
    { k: "d", p: "M21 28 H45 M21 36 H45 M21 44 H36", w: 3 },
  ],
  swords: [
    { k: "s", p: "M11 11 L44 44 M53 11 L20 44", w: 6 },
    { k: "s", p: "M37 51 L51 37 M13 37 L27 51", w: 5 },
    { k: "s", p: "M46 46 L56 56 M18 46 L8 56", w: 6.5 },
  ],
  sparkle: [
    { k: "m", p: SPARK(28, 34, 25) },
    { k: "m", p: SPARK(51, 13, 9) },
  ],
  palette: [
    { k: "m", p: "M32 6 C16 6 6 18 6 31 C6 46 18 58 30 58 C35 58 36 54 34 50 C32 46 34 42 39 42 H47 C54 42 58 37 58 30 C58 16 46 6 32 6 Z" },
    { k: "d", p: `${DOT(20, 26)} ${DOT(30, 17)} ${DOT(43, 19)} ${DOT(19, 40)}`, w: 8.5 },
  ],
  star: [{ k: "m", p: STAR(32, 33, 28, 12.5) }],
  crown: [
    { k: "m", p: "M7 19 L20 32 L32 10 L44 32 L57 19 L51 50 H13 Z" },
    { k: "d", p: "M14 42 H50", w: 3 },
  ],
  shield: [
    { k: "m", p: "M32 4 L56 12 V30 C56 45 46 54 32 60 C18 54 8 45 8 30 V12 Z" },
    { k: "a", p: "M32 13 L47 18 V30 C47 40 41 47 32 51 Z" },
  ],
  bolt: [{ k: "m", p: "M37 3 L11 36 H29 L24 61 L53 26 H35 Z" }],
  fire: [
    { k: "m", p: "M32 3 C38 15 53 24 53 40 C53 52 44 60 32 60 C20 60 11 52 11 40 C11 30 18 23 22 14 C25 21 26 26 30 29 C30 20 30 11 32 3 Z" },
    { k: "a", p: "M32 34 C36 40 41 44 41 49 C41 54 37 57 32 57 C27 57 23 54 23 49 C23 44 29 40 32 34 Z" },
  ],
  timer: [
    { k: "m", p: C(32, 36, 23) },
    { k: "m", p: R(25, 4, 14, 7, 2) },
    { k: "s", p: "M48 16 L53 11", w: 4.5 },
    { k: "d", p: "M32 36 V22 M32 36 L42 42", w: 4 },
  ],
  calendar: [
    { k: "m", p: R(7, 12, 50, 45, 8) },
    { k: "s", p: "M20 5 V17 M44 5 V17", w: 5.5 },
    { k: "d", p: "M7 25 H57", w: 3 },
    { k: "d", p: `${DOT(20, 35)} ${DOT(32, 35)} ${DOT(44, 35)} ${DOT(20, 46)} ${DOT(32, 46)}`, w: 6.5 },
  ],
  target: [
    { k: "m", p: C(32, 32, 28) },
    { k: "d", p: `${C(32, 32, 19)} ${C(32, 32, 10)}`, w: 3.4 },
    { k: "d", p: DOT(32, 32), w: 6 },
  ],
  pin: [{ k: "m", eo: true, p: `M32 3 C20 3 11 12 11 24 C11 40 32 61 32 61 C32 61 53 40 53 24 C53 12 44 3 32 3 Z ${C(32, 24, 8.5)}` }],
  replay: [
    { k: "s", p: "M45.8 20.4 A18 18 0 1 0 48.9 38.2", w: 7 },
    { k: "m", p: "M54 29.5 L36.5 24.5 L50.8 11.5 Z" },
  ],
  play: [{ k: "m", p: "M19 12.5 Q19 7.5 23.5 10 L52 28.5 Q56 32 52 35.5 L23.5 54 Q19 56.5 19 51.5 Z" }],
  info: [
    { k: "m", p: C(32, 32, 28) },
    { k: "d", p: DOT(32, 19), w: 8 },
    { k: "d", p: "M32 28 V47", w: 7 },
  ],
  party: [
    { k: "m", p: "M7 59 L21 22 L44 45 Z" },
    { k: "d", p: "M12 47 L26 51 M17 34 L37 45", w: 3 },
    { k: "s", p: "M30 19 Q35 10 30 3 M45 34 Q54 29 61 34", w: 4 },
    { k: "m", p: C(43, 14, 4) },
    { k: "m", p: C(55, 22, 3.2) },
    { k: "m", p: C(51, 6, 2.6) },
  ],
  hand: [
    { k: "m", p: "M24 31 V10 Q24 4 29.5 4 Q35 4 35 10 V26 L48 28 Q56 30 55 38 L52 52 Q50 60 43 60 H31 Q26 60 23 56 L11 40 Q8 34 14 32 Q18 31 22 35 Z" },
    { k: "d", p: "M35 27 V37 M44 29 V38", w: 2.6 },
  ],
  coinbag: [
    { k: "m", p: "M23 13 H41 L37 20 C49 24 57 34 57 44 C57 54 47 59 32 59 C17 59 7 54 7 44 C7 34 15 24 27 20 Z" },
    { k: "d", p: "M24 20.5 H40", w: 3 },
    { k: "d", p: "M37.5 34 C34 31 26 31 26 36 C26 41 38.5 39 38.5 45 C38.5 50.5 30 50.5 26.5 47 M32 28 V53", w: 3.2 },
  ],
  joystick: [
    { k: "m", p: R(6, 43, 52, 15, 5) },
    { k: "s", p: "M32 44 V24", w: 6.5 },
    { k: "m", p: C(32, 16, 11) },
    { k: "d", p: DOT(46, 50.5), w: 5 },
  ],
  clapper: [
    { k: "m", p: R(8, 28, 48, 29, 4) },
    { k: "m", p: "M8 17 L51 9 L53 18 L10 26 Z" },
    { k: "d", p: "M18 16 L22 24 M30 14 L34 22 M42 11.5 L46 19.5", w: 3.2 },
    { k: "d", p: "M16 28 L12 36 M30 28 L26 36 M44 28 L40 36", w: 3.2 },
  ],
  dynamite: [
    { k: "m", p: R(9, 25, 12, 32, 4) },
    { k: "m", p: R(22, 25, 12, 32, 4) },
    { k: "m", p: R(35, 25, 12, 32, 4) },
    { k: "d", p: "M9 40 H47", w: 3.4 },
    { k: "s", p: "M28 25 C28 14 40 17 46 9", w: 3.4 },
    { k: "m", p: SPARK(49, 7, 7) },
  ],
  trophy: [
    { k: "s", p: "M21 15 H14 Q11 15 11 18.5 Q11 27 21.5 29 M43 15 H50 Q53 15 53 18.5 Q53 27 42.5 29", w: 4.5 },
    { k: "m", p: "M19 8 H45 V24 Q45 37 32 39 Q19 37 19 24 Z" },
    { k: "m", p: "M28.5 38 H35.5 V46 H28.5 Z" },
    { k: "m", p: R(17, 46, 30, 10, 3) },
    { k: "a", p: STAR(32, 22, 7, 3.2) },
  ],
  gift: [
    { k: "m", p: "M11.5 29 H52.5 V54 Q52.5 57 49.5 57 H14.5 Q11.5 57 11.5 54 Z" },
    { k: "m", p: R(6.5, 20.5, 51, 10, 3) },
    { k: "d", p: "M32 21 V57", w: 3 },
    { k: "m", p: "M32 20.5 C25 6 13 9 18 17 C20.5 20.5 27 20.5 32 20.5 Z M32 20.5 C39 6 51 9 46 17 C43.5 20.5 37 20.5 32 20.5 Z" },
  ],
  gun: [
    { k: "m", p: "M14 30 H31 L27 53.5 Q26.4 57 23 57 H13.4 Q9.6 57 10.4 53.2 Z" },
    { k: "m", p: "M10 17 H50 L57 21.5 V30.5 H10 Q6.5 30.5 6.5 27 V20.5 Q6.5 17 10 17 Z" },
    { k: "s", p: "M31 31 V37.5 Q31 42 35.5 42 H38.5 Q42.5 42 42.5 37.5 V31", w: 4 },
    { k: "d", p: "M37 20.5 V27 M41 20.5 V27 M45 20.5 V27", w: 2.2 },
  ],
  map: [
    { k: "m", p: "M7 16 L22 10.5 L42 16.5 L57 11 V48 L42 53.5 L22 47.5 L7 53 Z" },
    { k: "d", p: "M22 10.5 V47.5 M42 16.5 V53.5", w: 2.4 },
  ],
  skull: [
    { k: "m", p: "M32 5 C46 5 55 15 55 28 C55 36 51 41 47 43 V52 Q47 57 42 57 H22 Q17 57 17 52 V43 C13 41 9 36 9 28 C9 15 18 5 32 5 Z" },
    { k: "d", p: `${DOT(23, 29)} ${DOT(41, 29)}`, w: 11 },
    { k: "d", p: "M32 36 V41", w: 4.5 },
    { k: "d", p: "M26 48 V57 M32 48 V57 M38 48 V57", w: 2.4 },
  ],

  book: [
    { k: "m", p: "M5 15 Q18 9 31 15 V55 Q18 49 5 55 Z" },
    { k: "m", p: "M33 15 Q46 9 59 15 V55 Q46 49 33 55 Z" },
    { k: "d", p: "M10 24 Q18 21 26 24 M10 32 Q18 29 26 32 M10 40 Q18 37 26 40 M38 24 Q46 21 54 24 M38 32 Q46 29 54 32 M38 40 Q46 37 54 40", w: 2.4 },
  ],

  sun: [
    { k: "m", p: C(32, 32, 13) },
    {
      k: "m",
      p: Array.from({ length: 8 }, (_, i) => {
        const a = (i * Math.PI) / 4;
        const q = (r: number, d: number) => `${(32 + Math.cos(a + d) * r).toFixed(2)} ${(32 + Math.sin(a + d) * r).toFixed(2)}`;
        return `M${q(17.5, -0.26)} L${q(29, 0)} L${q(17.5, 0.26)} Z`;
      }).join(" "),
    },
  ],

  /* ---------- bosses ---------- */
  demon: [
    { k: "m", p: "M14 25 L5 3 L25 16 Z" },
    { k: "m", p: "M50 25 L59 3 L39 16 Z" },
    { k: "m", p: "M32 13 C46 13 55 23 55 36 C55 49 45 59 32 59 C19 59 9 49 9 36 C9 23 18 13 32 13 Z" },
    { k: "d", p: "M19 32 L28 37 M45 32 L36 37", w: 5.5 },
    { k: "d", p: "M21 46 Q32 53 43 46", w: 3.6 },
  ],
  knight: [
    { k: "m", p: "M32 3 C48 3 57 15 57 30 V58 H7 V30 C7 15 16 3 32 3 Z" },
    { k: "d", p: "M14 30 H50", w: 5 },
    { k: "d", p: "M32 35 V53", w: 3.2 },
    { k: "d", p: `${DOT(23, 43)} ${DOT(41, 43)} ${DOT(23, 50)} ${DOT(41, 50)}`, w: 4 },
  ],
  golem: [
    { k: "m", p: "M18 7 H46 L53 19 V44 L45 58 H19 L11 44 V19 Z" },
    { k: "d", p: "M21 28 H28 M36 28 H43", w: 7 },
    { k: "d", p: "M23 44 H41", w: 4 },
    { k: "d", p: "M31 7 L27 16 L33 20 M53 36 L45 40", w: 2.4 },
  ],
  dragon: [
    { k: "m", p: "M6 42 L19 26 L16 9 L29 19 L42 12 L43 23 L58 30 L51 36 L58 45 L41 45 L31 56 L28 45 Z" },
    { k: "d", p: DOT(37, 28), w: 6 },
    { k: "d", p: "M45 39 H55", w: 2.4 },
  ],
  kraken: [
    { k: "m", p: "M32 3 C44 3 53 12 53 25 C53 33 49 38 45 40 H19 C15 38 11 33 11 25 C11 12 20 3 32 3 Z" },
    { k: "s", p: "M19 39 C13 47 8 45 5 54 M27 40 C27 50 21 54 17 60 M37 40 C37 50 43 54 47 60 M45 39 C51 47 56 45 59 54", w: 5.5 },
    { k: "d", p: `${DOT(23, 23)} ${DOT(41, 23)}`, w: 7.5 },
  ],
  goblin: [
    { k: "m", p: "M14 32 L1 25 L15 43 Z" },
    { k: "m", p: "M50 32 L63 25 L49 43 Z" },
    { k: "m", p: "M32 20 C44 20 51 28 51 38 C51 50 43 59 32 59 C21 59 13 50 13 38 C13 28 20 20 32 20 Z" },
    { k: "a", p: "M17 21 L21 5 L27 13 L32 2 L37 13 L43 5 L47 21 Z" },
    { k: "d", p: "M21 35 L28 38 M43 35 L36 38", w: 5 },
    { k: "d", p: "M23 49 Q32 44 41 49", w: 3.2 },
  ],
  robot: [
    { k: "s", p: "M32 5 V13", w: 3.6 },
    { k: "m", p: C(32, 5, 4) },
    { k: "m", p: R(3, 25, 7, 16, 2.5) },
    { k: "m", p: R(54, 25, 7, 16, 2.5) },
    { k: "m", p: R(9, 13, 46, 41, 9) },
    { k: "d", p: `${DOT(22, 30)} ${DOT(42, 30)}`, w: 10 },
    { k: "d", p: "M21 43 H43", w: 3.6 },
  ],
  ghost: [
    { k: "m", p: "M32 5 C46 5 55 16 55 30 V57 L47.5 50.5 L40 57 L32 50.5 L24 57 L16.5 50.5 L9 57 V30 C9 16 18 5 32 5 Z" },
    { k: "d", p: `${DOT(24, 28)} ${DOT(40, 28)}`, w: 8.5 },
    { k: "d", p: "M32 38 V42", w: 6 },
  ],
  alien: [
    { k: "m", p: "M32 5 C48 5 57 17 57 28 C57 44 43 59 32 59 C21 59 7 44 7 28 C7 17 16 5 32 5 Z" },
    { k: "d", p: "M16 29 L27 36 M48 29 L37 36", w: 9 },
    { k: "d", p: "M28 48 H36", w: 3 },
  ],
  vampire: [
    { k: "m", p: "M32 11 C44 11 53 21 53 34 C53 48 43 59 32 59 C21 59 11 48 11 34 C11 21 20 11 32 11 Z" },
    { k: "a", p: "M11 30 C11 15 20 6 32 6 C44 6 53 15 53 30 C47 23 40 21 32 30 C24 21 17 23 11 30 Z" },
    { k: "d", p: `${DOT(24, 38)} ${DOT(40, 38)}`, w: 5.5 },
    { k: "d", p: "M24 48 H40 M27.5 48 L29 53 L30.5 48 M33.5 48 L35 53 L36.5 48", w: 2.4 },
  ],
  yeti: [
    { k: "m", p: "M15 15 L9 4 L23 10 Z" },
    { k: "m", p: "M49 15 L55 4 L41 10 Z" },
    { k: "m", p: "M32 6 C47 6 57 17 57 33 C57 49 46 59 32 59 C18 59 7 49 7 33 C7 17 17 6 32 6 Z" },
    { k: "a", p: "M21 26 H43 Q48 26 48 32 V40 C48 48 40 53 32 53 C24 53 16 48 16 40 V32 Q16 26 21 26 Z" },
    { k: "d", p: `${DOT(25, 35)} ${DOT(39, 35)}`, w: 6 },
    { k: "d", p: "M27 45 H37", w: 3 },
  ],

  /* ---------- scenery props ---------- */
  tree: [
    { k: "m", p: R(28, 34, 8, 25, 2) },
    { k: "m", p: C(32, 24, 21) },
    { k: "d", p: "M32 46 V34 M32 38 L25 31", w: 2.6 },
  ],
  pine: [
    { k: "m", p: R(28, 44, 8, 15, 2) },
    { k: "m", p: "M32 3 L49 25 H41 L55 45 H9 L23 25 H15 Z" },
    { k: "d", p: "M21 25 H43", w: 2.4 },
  ],
  palm: [
    { k: "s", p: "M29 60 C29 45 33 33 32 24", w: 6.5 },
    { k: "m", p: "M32 24 C24 13 11 13 5 22 C15 18 24 20 32 24 Z M32 24 C40 13 53 13 59 22 C49 18 40 20 32 24 Z M32 24 C25 22 15 28 13 39 C20 30 26 27 32 24 Z M32 24 C39 22 49 28 51 39 C44 30 38 27 32 24 Z" },
    { k: "m", p: C(29, 28, 3.5) },
  ],
  rock: [
    { k: "m", p: "M5 55 L13 32 L28 21 L43 25 L57 40 L59 55 Z" },
    { k: "d", p: "M28 21 L32 40 L57 40 M13 32 L32 40 L30 55", w: 2.6 },
  ],
  mushroom: [
    { k: "m", p: "M24 30 H40 L42 54 Q42 59 37 59 H27 Q22 59 22 54 Z" },
    { k: "m", p: "M5 32 C5 15 18 6 32 6 C46 6 59 15 59 32 Z" },
    { k: "d", p: `${DOT(19, 22)} ${DOT(35, 15)} ${DOT(47, 25)}`, w: 8 },
  ],
  crystal: [
    { k: "m", p: "M15 22 L5 32 L9 59 H20 L18 30 Z" },
    { k: "m", p: "M49 22 L59 32 L55 59 H44 L46 30 Z" },
    { k: "m", p: "M32 3 L45 18 L41 59 H23 L19 18 Z" },
    { k: "d", p: "M32 6 V56", w: 2.2 },
  ],
  house: [
    { k: "m", p: "M32 5 L59 28 H52 V59 H12 V28 H5 Z" },
    { k: "d", p: "M32 46 V59", w: 9 },
    { k: "d", p: `${DOT(20, 37)} ${DOT(44, 37)}`, w: 7 },
  ],
  lantern: [
    { k: "s", p: "M32 3 V10", w: 3.4 },
    { k: "m", p: "M21 10 H43 L47 18 H17 Z" },
    { k: "m", p: R(19, 18, 26, 30, 4) },
    { k: "m", p: "M17 48 H47 L43 57 H21 Z" },
    { k: "a", p: "M32 23 C36 29 38.5 33 38.5 37 C38.5 41 35.5 43.5 32 43.5 C28.5 43.5 25.5 41 25.5 37 C25.5 33 28 29 32 23 Z" },
  ],
  boat: [
    { k: "s", p: "M32 7 V40", w: 3.4 },
    { k: "m", p: "M35 9 L55 36 H35 Z" },
    { k: "m", p: "M29 15 L13 36 H29 Z" },
    { k: "m", p: "M3 40 H61 L51 55 H13 Z" },
  ],
  tomb: [
    { k: "m", p: "M13 59 V26 C13 13 21 5 32 5 C43 5 51 13 51 26 V59 Z" },
    { k: "d", p: "M32 17 V41 M23 26 H41", w: 4.5 },
  ],
  planet: [
    { k: "m", p: C(32, 32, 17) },
    { k: "s", p: "M7 44 C-2 37 31 20 51 17 C64 15 64 22 55 28", w: 3.8 },
  ],
  dome: [
    { k: "s", p: "M32 1 V8", w: 3.2 },
    { k: "m", p: "M32 7 C46 7 53 21 53 30 H11 C11 21 18 7 32 7 Z" },
    { k: "m", p: R(9, 30, 46, 29, 2) },
    { k: "d", p: "M32 47 V59", w: 9 },
    { k: "d", p: `${DOT(19, 41)} ${DOT(45, 41)}`, w: 5.5 },
  ],
  flower: [
    { k: "s", p: "M32 38 V61", w: 4.5 },
    { k: "m", p: `${C(32, 15, 9)} ${C(47, 25, 9)} ${C(41, 42, 9)} ${C(23, 42, 9)} ${C(17, 25, 9)}` },
    { k: "a", p: C(32, 30, 7.5) },
  ],
} satisfies Record<string, L[]>;

export type FlatName = keyof typeof FLAT;

type Props = { name: FlatName; color?: string; className?: string; style?: CSSProperties; title?: string; at?: { x: number; y: number; size: number } };

/** single-colour icon; inner details are real gaps (mask) */
export function Ico({ name, color = "currentColor", className = "h-5 w-5", style, title, at }: Props) {
  const u = useId().replace(/[^a-zA-Z0-9]/g, "");
  const layers = FLAT[name] as L[];
  return (
    <svg
      viewBox="0 0 64 64"
      {...(at ? { x: at.x, y: at.y, width: at.size, height: at.size } : { className: `inline-block shrink-0 ${className}` })}
      style={{ overflow: "visible", ...style }}
      aria-hidden={!title}
      role={title ? "img" : undefined}
    >
      {title && <title>{title}</title>}
      <defs>
        <mask id={`${u}k`} maskUnits="userSpaceOnUse" x="-12" y="-12" width="88" height="88">
          <rect x="-12" y="-12" width="88" height="88" fill="#000" />
          {layers.map((l, i) => {
            const rule = l.eo ? "evenodd" : undefined;
            if (l.k === "m") return <path key={i} d={l.p} fill="#fff" fillRule={rule} />;
            if (l.k === "s") return <path key={i} d={l.p} fill="none" stroke="#fff" strokeWidth={l.w ?? 5} strokeLinecap="round" strokeLinejoin="round" />;
            if (l.k === "a") return <path key={i} d={l.p} fill="#fff" stroke="#000" strokeWidth={3.4} strokeLinejoin="round" paintOrder="stroke" />;
            return <path key={i} d={l.p} fill="none" stroke="#000" strokeWidth={l.w ?? 2.4} strokeLinecap="round" strokeLinejoin="round" />;
          })}
        </mask>
      </defs>
      <rect x="-12" y="-12" width="88" height="88" fill={color} mask={`url(#${u}k)`} />
    </svg>
  );
}

/** flat white glyph on a coloured rounded tile */
export function IcoTile({ name, bg, size = 40, fg = "#ffffff", radius = 12 }: { name: FlatName; bg: [string, string] | string; size?: number; fg?: string; radius?: number }) {
  const back = Array.isArray(bg) ? `linear-gradient(180deg, ${bg[0]}, ${bg[1]})` : bg;
  return (
    <span className="relative grid shrink-0 place-items-center" style={{ width: size, height: size, borderRadius: radius, background: back, boxShadow: "inset 0 -3px 0 rgba(0,0,0,.18), inset 0 2px 0 rgba(255,255,255,.3)" }}>
      <Ico name={name} color={fg} style={{ width: size * 0.6, height: size * 0.6 }} />
    </span>
  );
}
