import { useId, type ReactNode } from "react";
import type { FlatName } from "../ui/FlatIcons";

/* =====================================================================
   BOSS HEADS — head only (no medallion). viewBox -100 -100 200 200.
   SIL[kind] = outer silhouette pieces → used to build the collision profile,
   so bullets / knives / coins stick on the actual head surface.
   ===================================================================== */
export type HeadKind = "pirate" | "jester" | "dragon" | "skeleton" | "tiki" | "viking" | "oni" | "robot" | "alien" | "vampire" | "sun";
export const HEAD_KINDS: HeadKind[] = ["pirate", "jester", "dragon", "skeleton", "tiki", "viking", "oni", "robot", "alien", "vampire", "sun"];

export const HEAD_INFO: Record<HeadKind, { name: string; icon: FlatName; desc: string; bg: [string, string] }> = {
  pirate: { name: "Pirate Captain", icon: "skull", desc: "Ruler of the seven seas. One eye is shut, but his aim never misses.", bg: ["#3a9be0", "#0b2e4f"] },
  jester: { name: "Mad Jester", icon: "party", desc: "A court clown who laughs while spinning wildly. Do not trust that smile!", bg: ["#d946ef", "#3b0764"] },
  dragon: { name: "Dragon Head", icon: "dragon", desc: "A horned fire dragon with steel-hard scales. It spins fast, then reverses direction.", bg: ["#ff9a4d", "#7c1d06"] },
  skeleton: { name: "Skull King", icon: "skull", desc: "Risen from an old graveyard. His eyes burn red in the dark.", bg: ["#4ade80", "#06180d"] },
  tiki: { name: "Tiki Totem", icon: "golem", desc: "An ancient wooden totem guarding a tropical island. Its grin carries a curse.", bg: ["#2dd4bf", "#064e3b"] },
  viking: { name: "Northern Viking", icon: "knight", desc: "A warrior from the land of ice with a horned helmet and braided beard.", bg: ["#93d8fd", "#0c4a6e"] },
  oni: { name: "Oni Mask", icon: "demon", desc: "A fanged red demon from eastern legend. His rage sends the wheel spinning madly.", bg: ["#4b5563", "#030712"] },
  robot: { name: "Robot X", icon: "robot", desc: "A combat machine with an LED visor. Its pattern is precise, as if computed.", bg: ["#22d3ee", "#082f49"] },
  alien: { name: "Alien Zorg", icon: "alien", desc: "A visitor from a distant galaxy with huge hypnotic black eyes.", bg: ["#a855f7", "#140628"] },
  vampire: { name: "Count Vampire", icon: "vampire", desc: "A high-collared noble of the night. He only appears under a red moon.", bg: ["#dc2626", "#1a0505"] },
  sun: { name: "Sun King", icon: "sun", desc: "Ruler of the solar system — Moon, Mars, Jupiter and Pluto all bow to him. His fiery tongue burns everything!", bg: ["#7c1d06", "#1c0503"] },
};

/* ---------------- helpers ---------------- */
const f = (n: number) => n.toFixed(2);
const rad = (d: number) => (d * Math.PI) / 180;
const E = (cx: number, cy: number, rx: number, ry: number) => `M${cx - rx} ${cy} a${rx} ${ry} 0 1 0 ${2 * rx} 0 a${rx} ${ry} 0 1 0 ${-2 * rx} 0 Z`;
const C = (cx: number, cy: number, r: number) => E(cx, cy, r, r);
const RR = (x: number, y: number, w: number, h: number, r: number) =>
  `M${x + r} ${y} H${x + w - r} Q${x + w} ${y} ${x + w} ${y + r} V${y + h - r} Q${x + w} ${y + h} ${x + w - r} ${y + h} H${x + r} Q${x} ${y + h} ${x} ${y + h - r} V${y + r} Q${x} ${y} ${x + r} ${y} Z`;
const mirror = (d: string) => d.replace(/(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)/g, (_, x, y) => `${f(-parseFloat(x))} ${y}`);
const star = (n: number, ro: number, ri: number, cy = 0, ph = -90) =>
  "M" +
  Array.from({ length: n * 2 }, (_, i) => {
    const a = rad(ph + (i * 180) / n);
    const r = i % 2 ? ri : ro;
    return `${f(Math.cos(a) * r)} ${f(Math.sin(a) * r + cy)}`;
  }).join(" L") +
  " Z";
/** soft, colour-tinted outline (much lighter than a black stroke) */
const so = (c: string, w = 2) => ({ stroke: c, strokeWidth: w, strokeLinejoin: "round" as const, strokeLinecap: "round" as const, strokeOpacity: 0.85 });
const Hi = ({ d, o = 0.35, w = 4 }: { d: string; o?: number; w?: number }) => <path d={d} fill="none" stroke="#fff" strokeOpacity={o} strokeWidth={w} strokeLinecap="round" />;

/* =====================================================================
   SHAPES (shared by drawing + collision)
   ===================================================================== */
const PIR = {
  hat: "M-92 -22 Q-72 -40 -44 -31 Q0 -50 44 -31 Q72 -40 92 -22 Q88 -62 50 -76 Q0 -102 -50 -76 Q-88 -62 -92 -22 Z",
  face: E(0, 12, 46, 50),
  earL: E(-45, 14, 8, 12),
  earR: E(45, 14, 8, 12),
  beard: "M-47 8 C-52 42 -40 70 -22 84 L-13 78 L-6 92 L0 82 L6 92 L13 78 L22 84 C40 70 52 42 47 8 C36 28 18 36 0 36 C-18 36 -36 28 -47 8 Z",
};
const JES = {
  lobeL: "M-30 -30 C-48 -80 -88 -78 -86 -30 C-74 -46 -56 -48 -24 -40 Z",
  lobeR: "M30 -30 C48 -80 88 -78 86 -30 C74 -46 56 -48 24 -40 Z",
  lobeM: "M-22 -38 C-22 -88 8 -104 34 -90 C16 -80 18 -60 26 -38 Z",
  band: "M-44 -22 Q0 -46 44 -22 L40 -38 Q0 -60 -40 -38 Z",
  face: E(0, 10, 40, 46),
  ruff:
    "M" +
    Array.from({ length: 36 }, (_, i) => {
      const a = (i / 36) * Math.PI * 2;
      const k = i % 2 ? 0.82 : 1;
      return `${f(Math.cos(a) * 68 * k)} ${f(62 + Math.sin(a) * 26 * k)}`;
    }).join(" L") +
    " Z",
  bells: [C(-86, -28, 9), C(86, -27, 9), C(34, -92, 9)],
};
const DRG = {
  horn: "M-30 -50 C-52 -68 -64 -86 -52 -100 C-46 -84 -34 -74 -14 -62 Z",
  frill: "M-52 -20 L-92 -34 L-70 -6 L-96 6 L-64 18 L-86 40 L-46 30 Z",
  head: "M0 -66 C38 -66 60 -44 58 -10 C56 18 38 36 30 58 C22 80 -22 80 -30 58 C-38 36 -56 18 -58 -10 C-60 -44 -38 -66 0 -66 Z",
  crest: "M-9 -64 L0 -86 L9 -64 Z",
  snout: "M-27 22 C-27 8 27 8 27 22 C27 52 18 70 0 72 C-18 70 -27 52 -27 22 Z",
};
const SKL = {
  skull: "M0 -82 C46 -82 66 -50 64 -14 C63 6 55 18 47 24 L43 42 L-43 42 L-47 24 C-55 18 -63 6 -64 -14 C-66 -50 -46 -82 0 -82 Z",
  jaw: "M-38 38 L-36 62 Q0 86 36 62 L38 38 Z",
};
const TIKI = {
  body: "M-46 -56 Q-48 -66 -38 -66 L38 -66 Q48 -66 46 -56 L52 64 Q52 82 36 84 L-36 84 Q-52 82 -52 64 Z",
  fan:
    "M" +
    Array.from({ length: 15 }, (_, i) => {
      const a = rad(-84 + i * 12);
      const r = i % 2 ? 46 : 66;
      return `${f(Math.sin(a) * r)} ${f(-40 - Math.cos(a) * r)}`;
    }).join(" L") +
    " L0 -40 Z",
};
const VIK = {
  horn: "M-48 -36 C-84 -40 -98 -72 -86 -98 C-78 -74 -66 -62 -44 -54 Z",
  helmet: "M-55 -20 Q-57 -84 0 -86 Q57 -84 55 -20 Z",
  face: E(0, 6, 40, 40),
  beard: "M-44 0 Q-52 52 -26 78 L-12 68 L0 86 L12 68 L26 78 Q52 52 44 0 Q38 24 0 28 Q-38 24 -44 0 Z",
  braidL: RR(-24, 70, 12, 26, 5),
  braidR: RR(12, 70, 12, 26, 5),
};
const ONI = {
  mane: star(16, 94, 74, 4),
  horn: "M-26 -56 L-44 -98 L-10 -64 Z",
  face: "M0 -62 C40 -62 56 -34 54 0 C52 34 36 64 0 66 C-36 64 -52 34 -54 0 C-56 -34 -40 -62 0 -62 Z",
};
const ROB = {
  head: RR(-54, -62, 108, 124, 24),
  earL: RR(-70, -18, 18, 38, 6),
  earR: RR(52, -18, 18, 38, 6),
  stem: RR(-3, -86, 6, 26, 2),
  ball: C(0, -90, 8),
};
const ALN = { head: "M0 -86 C52 -86 72 -44 68 -6 C64 32 30 72 0 80 C-30 72 -64 32 -68 -6 C-72 -44 -52 -86 0 -86 Z" };
const VAM = {
  collarL: "M-22 46 L-90 -18 L-78 84 Z",
  earL: "M-37 -2 L-60 -30 L-40 18 Z",
  face: E(0, 8, 40, 50),
  hair: "M-43 -4 Q-50 -62 0 -64 Q50 -62 43 -4 Q38 -34 18 -38 L0 -22 L-18 -38 Q-38 -34 -43 -4 Z",
};
function flamePath(n: number, ro: number, ri: number, ph: number) {
  let d = "";
  for (let i = 0; i < n; i++) {
    const a0 = rad(ph + (i * 360) / n);
    const a1 = rad(ph + ((i + 0.5) * 360) / n);
    const a2 = rad(ph + ((i + 1) * 360) / n);
    const p0 = [Math.cos(a0) * ri, Math.sin(a0) * ri];
    const tip = [Math.cos(a1 + 0.12) * ro, Math.sin(a1 + 0.12) * ro];
    const c1 = [Math.cos(a1 - 0.1) * (ri + (ro - ri) * 0.75), Math.sin(a1 - 0.1) * (ri + (ro - ri) * 0.75)];
    const c2 = [Math.cos(a1 + 0.3) * (ri + (ro - ri) * 0.4), Math.sin(a1 + 0.3) * (ri + (ro - ri) * 0.4)];
    const p2 = [Math.cos(a2) * ri, Math.sin(a2) * ri];
    d += `${i ? "L" : "M"}${f(p0[0])} ${f(p0[1])} Q${f(c1[0])} ${f(c1[1])} ${f(tip[0])} ${f(tip[1])} Q${f(c2[0])} ${f(c2[1])} ${f(p2[0])} ${f(p2[1])} `;
  }
  return d + "Z";
}
const SUN = { outer: flamePath(14, 94, 54, 0), inner: flamePath(14, 78, 54, 13), face: C(0, 0, 56) };

export const SIL: Record<HeadKind, string[]> = {
  pirate: [PIR.hat, PIR.face, PIR.earL, PIR.earR, PIR.beard],
  jester: [JES.lobeL, JES.lobeR, JES.lobeM, JES.band, JES.face, JES.ruff, ...JES.bells],
  dragon: [DRG.head, DRG.horn, mirror(DRG.horn), DRG.frill, mirror(DRG.frill), DRG.crest],
  skeleton: [SKL.skull, SKL.jaw],
  tiki: [TIKI.body, TIKI.fan],
  viking: [VIK.horn, mirror(VIK.horn), VIK.helmet, VIK.face, VIK.beard, VIK.braidL, VIK.braidR],
  oni: [ONI.mane, ONI.horn, mirror(ONI.horn)],
  robot: [ROB.head, ROB.earL, ROB.earR, ROB.stem, ROB.ball],
  alien: [ALN.head],
  vampire: [VAM.collarL, mirror(VAM.collarL), VAM.earL, mirror(VAM.earL), VAM.face, VAM.hair],
  sun: [SUN.outer],
};

/* =====================================================================
   collision profile: outer radius (head units, 0..100) for each degree.
   index = atan2(y, x) in degrees (SVG coords, y down).
   ===================================================================== */
const PROFILE = new Map<HeadKind, Float32Array>();
export function headProfile(kind: HeadKind): Float32Array {
  const cached = PROFILE.get(kind);
  if (cached) return cached;
  const raw = new Float32Array(360).fill(-1);
  if (typeof document !== "undefined") {
    const NS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("style", "position:absolute;width:0;height:0;overflow:hidden");
    const el = document.createElementNS(NS, "path");
    svg.appendChild(el);
    document.body.appendChild(svg);
    for (const d of SIL[kind]) {
      el.setAttribute("d", d);
      const L = el.getTotalLength();
      const n = Math.max(120, Math.ceil(L / 0.8));
      for (let i = 0; i < n; i++) {
        const pt = el.getPointAtLength((i / n) * L);
        const r = Math.hypot(pt.x, pt.y);
        const a = ((Math.round((Math.atan2(pt.y, pt.x) * 180) / Math.PI) % 360) + 360) % 360;
        if (r > raw[a]) raw[a] = r;
      }
    }
    svg.remove();
  }
  // fill empty bins by circular interpolation
  const known = [...raw.keys()].filter((i) => raw[i] >= 0);
  const out = new Float32Array(360);
  if (!known.length) out.fill(90);
  else
    for (let i = 0; i < 360; i++) {
      if (raw[i] >= 0) {
        out[i] = raw[i];
        continue;
      }
      let a = i;
      let b = i;
      let da = 0;
      let db = 0;
      while (raw[a] < 0) {
        a = (a + 359) % 360;
        da++;
      }
      while (raw[b] < 0) {
        b = (b + 1) % 360;
        db++;
      }
      out[i] = (raw[a] * db + raw[b] * da) / (da + db);
    }
  // light smoothing (keeps spikes from making bullets jitter)
  const sm = new Float32Array(360);
  for (let i = 0; i < 360; i++) sm[i] = (out[(i + 358) % 360] + out[(i + 359) % 360] * 2 + out[i] * 3 + out[(i + 1) % 360] * 2 + out[(i + 2) % 360]) / 9;
  PROFILE.set(kind, sm);
  return sm;
}

/* =====================================================================
   HEADS
   ===================================================================== */
function Pirate({ u }: { u: string }) {
  return (
    <>
      <defs>
        <radialGradient id={`${u}sk`} cx=".42" cy=".34">
          <stop offset="0" stopColor="#ffe0c2" />
          <stop offset=".6" stopColor="#f0ac7a" />
          <stop offset="1" stopColor="#c27845" />
        </radialGradient>
        <linearGradient id={`${u}hat`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#433a5e" />
          <stop offset="1" stopColor="#15111f" />
        </linearGradient>
        <linearGradient id={`${u}bd`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5a3820" />
          <stop offset="1" stopColor="#24140a" />
        </linearGradient>
        <linearGradient id={`${u}au`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff2b0" />
          <stop offset=".5" stopColor="#f2b829" />
          <stop offset="1" stopColor="#a86b00" />
        </linearGradient>
      </defs>
      <path d={PIR.earL} fill={`url(#${u}sk)`} {...so("#8a4a22")} />
      <path d={PIR.earR} fill={`url(#${u}sk)`} {...so("#8a4a22")} />
      <path d={PIR.face} fill={`url(#${u}sk)`} {...so("#8a4a22")} />
      <ellipse cx="-26" cy="24" rx="9" ry="6" fill="#ff7a6b" opacity=".35" />
      <ellipse cx="28" cy="24" rx="9" ry="6" fill="#ff7a6b" opacity=".35" />
      <path d={PIR.beard} fill={`url(#${u}bd)`} {...so("#170b03")} />
      <path d="M-34 44 Q-30 60 -20 72 M-18 50 Q-14 66 -8 78 M18 50 Q14 66 8 78 M34 44 Q30 60 20 72" stroke="#7a4f2c" strokeWidth="1.8" fill="none" strokeLinecap="round" opacity=".7" />
      <path d="M-15 40 Q0 50 15 40 Q11 55 0 55 Q-11 55 -15 40 Z" fill="#4a0f0f" />
      <path d="M-12 41.5 Q0 48 12 41.5 L11 45 Q0 51 -11 45 Z" fill="#fffaf0" />
      <rect x="3" y="42.5" width="5" height="5" rx="1" fill={`url(#${u}au)`} />
      <ellipse cx="3" cy="21" rx="9.5" ry="8.5" fill="#e3915e" />
      <ellipse cx="0" cy="17.5" rx="3.6" ry="2.4" fill="#fff" opacity=".55" />
      <path d="M0 33 C-8 27 -20 28 -28 36 C-33 41 -41 37 -38 30 C-30 41 -16 39 0 36 C16 39 30 41 38 30 C41 37 33 41 28 36 C20 28 8 27 0 33 Z" fill="#2e1b0d" />
      {/* eye */}
      <ellipse cx="18" cy="2" rx="9" ry="8" fill="#fff" />
      <circle cx="19" cy="3" r="4.8" fill="#4b2e17" />
      <circle cx="19" cy="3" r="2.5" fill="#000" />
      <circle cx="17.3" cy="1.3" r="1.5" fill="#fff" />
      <path d="M6 -10 Q18 -17 31 -9" stroke="#2e1b0d" strokeWidth="5" fill="none" strokeLinecap="round" />
      {/* patch */}
      <path d="M-52 -15 L48 -27" stroke="#0f0d14" strokeWidth="3.4" strokeLinecap="round" />
      <ellipse cx="-18" cy="2" rx="13" ry="11" fill="#15121b" />
      <ellipse cx="-22" cy="-2" rx="4" ry="2.4" fill="#fff" opacity=".18" />
      <path d="M-31 -12 L-6 -8" stroke="#2e1b0d" strokeWidth="5" strokeLinecap="round" />
      <path d="M29 14 L36 28 M29.5 22 L36 19" stroke="#b05a3a" strokeWidth="2" strokeLinecap="round" />
      <circle cx="46" cy="28" r="6" fill="none" stroke={`url(#${u}au)`} strokeWidth="3" />
      {/* hat */}
      <path d={PIR.hat} fill={`url(#${u}hat)`} {...so("#07050c")} />
      <path d="M-92 -22 Q-72 -40 -44 -31 Q0 -50 44 -31 Q72 -40 92 -22" stroke={`url(#${u}au)`} strokeWidth="4.5" fill="none" strokeLinecap="round" />
      <Hi d="M-56 -60 Q-26 -82 6 -86" o={0.2} w={5} />
      <g transform="translate(0 -64)">
        <path d="M-14 -9 L14 9 M14 -9 L-14 9" stroke="#f3f0e6" strokeWidth="4.2" strokeLinecap="round" />
        <circle cx="0" cy="-2" r="8.5" fill="#f3f0e6" />
        <rect x="-4.5" y="3" width="9" height="6" rx="2" fill="#f3f0e6" />
        <circle cx="-3.2" cy="-2.6" r="2.2" fill="#15111f" />
        <circle cx="3.2" cy="-2.6" r="2.2" fill="#15111f" />
      </g>
    </>
  );
}

function Jester({ u }: { u: string }) {
  return (
    <>
      <defs>
        <radialGradient id={`${u}face`} cx=".42" cy=".34">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset=".75" stopColor="#f3ece6" />
          <stop offset="1" stopColor="#d9cdc4" />
        </radialGradient>
        <linearGradient id={`${u}pu`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#b48cff" />
          <stop offset="1" stopColor="#5b21b6" />
        </linearGradient>
        <linearGradient id={`${u}gr`} x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6ee79a" />
          <stop offset="1" stopColor="#15803d" />
        </linearGradient>
        <linearGradient id={`${u}ye`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff3a0" />
          <stop offset="1" stopColor="#e3a008" />
        </linearGradient>
        <radialGradient id={`${u}bell`} cx=".35" cy=".3">
          <stop offset="0" stopColor="#fff6c2" />
          <stop offset=".6" stopColor="#f5b82e" />
          <stop offset="1" stopColor="#a86b00" />
        </radialGradient>
      </defs>
      <path d={JES.ruff} fill="#faf7ff" {...so("#a78bfa")} />
      <path d={JES.ruff} fill="none" stroke="#e9e2ff" strokeWidth="6" opacity=".6" transform="translate(0 2) scale(.9 .8) translate(0 15)" />
      <path d={JES.lobeL} fill={`url(#${u}pu)`} {...so("#3b0a7a")} />
      <path d={JES.lobeR} fill={`url(#${u}gr)`} {...so("#0d4d24")} />
      <path d={JES.lobeM} fill={`url(#${u}ye)`} {...so("#8a5a00")} />
      <Hi d="M-60 -60 Q-46 -72 -34 -66" o={0.4} w={3} />
      <Hi d="M2 -80 Q14 -92 26 -88" o={0.45} w={3} />
      {JES.bells.map((d, i) => (
        <g key={i}>
          <path d={d} fill={`url(#${u}bell)`} {...so("#7a4a00", 1.6)} />
        </g>
      ))}
      <path d={JES.face} fill={`url(#${u}face)`} {...so("#a99c92")} />
      <path d={JES.band} fill="#ef4444" {...so("#7f1d1d")} />
      {[-18, 0, 18].map((x, i) => (
        <path key={i} d={`M${x} ${-38 + Math.abs(x) * 0.25} l4 5 l-4 5 l-4 -5 Z`} fill="#fde047" />
      ))}
      {/* makeup */}
      <path d="M-18 -24 L-7 -6 L-18 12 L-29 -6 Z" fill="#a855f7" opacity=".9" />
      <path d="M18 -24 L29 -6 L18 12 L7 -6 Z" fill="#22c55e" opacity=".9" />
      <ellipse cx="-18" cy="-6" rx="6.2" ry="7" fill="#fff" />
      <ellipse cx="18" cy="-6" rx="6.2" ry="7" fill="#fff" />
      <circle cx="-16.8" cy="-4.8" r="3.2" fill="#1a1020" />
      <circle cx="19.2" cy="-4.8" r="3.2" fill="#1a1020" />
      <circle cx="-17.8" cy="-6" r="1.1" fill="#fff" />
      <circle cx="18.2" cy="-6" r="1.1" fill="#fff" />
      <circle cx="-30" cy="18" r="6.5" fill="#fb7185" opacity=".45" />
      <circle cx="30" cy="18" r="6.5" fill="#fb7185" opacity=".45" />
      <circle cx="0" cy="13" r="8.5" fill="#ef4444" />
      <circle cx="-2.6" cy="10" r="2.6" fill="#fff" opacity=".7" />
      <path d="M-27 23 Q0 56 27 23 Q0 37 -27 23 Z" fill="#9f1239" />
      <path d="M-20 28 Q0 37 20 28 L18 32 Q0 40 -18 32 Z" fill="#fff" />
    </>
  );
}

function Dragon({ u }: { u: string }) {
  return (
    <>
      <defs>
        <radialGradient id={`${u}g`} cx=".45" cy=".3">
          <stop offset="0" stopColor="#8ef07f" />
          <stop offset=".6" stopColor="#3fae4a" />
          <stop offset="1" stopColor="#1d6b2a" />
        </radialGradient>
        <linearGradient id={`${u}fr`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#14532d" />
          <stop offset="1" stopColor="#2f8a3a" />
        </linearGradient>
        <radialGradient id={`${u}eye`}>
          <stop offset="0" stopColor="#fffbc2" />
          <stop offset=".6" stopColor="#fbbf24" />
          <stop offset="1" stopColor="#d97706" />
        </radialGradient>
        <linearGradient id={`${u}horn`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#d9c08a" />
          <stop offset="1" stopColor="#fffaf0" />
        </linearGradient>
      </defs>
      <path d={DRG.horn} fill={`url(#${u}horn)`} {...so("#7a5a24")} />
      <path d={mirror(DRG.horn)} fill={`url(#${u}horn)`} {...so("#7a5a24")} />
      <path d={DRG.frill} fill={`url(#${u}fr)`} {...so("#0a3317")} />
      <path d={mirror(DRG.frill)} fill={`url(#${u}fr)`} transform="scale(1 1)" {...so("#0a3317")} />
      <path d={DRG.crest} fill="#2f8a3a" {...so("#0a3317")} />
      <path d={DRG.head} fill={`url(#${u}g)`} {...so("#0f4a1d")} />
      {/* scale texture */}
      {[
        [-22, -44], [-6, -50], [10, -46], [26, -40], [-14, -32], [4, -36], [20, -28], [-32, -26],
      ].map(([x, y], i) => (
        <path key={i} d={`M${x - 5} ${y} q5 -6 10 0`} stroke="#1f6e2a" strokeWidth="1.8" fill="none" opacity=".7" />
      ))}
      <path d={DRG.snout} fill="#b6ef9c" opacity=".95" />
      <path d="M-18 30 Q0 24 18 30" stroke="#6fbf5c" strokeWidth="1.6" fill="none" />
      <ellipse cx="-9" cy="34" rx="4" ry="6" fill="#0f3d18" transform="rotate(-20 -9 34)" />
      <ellipse cx="9" cy="34" rx="4" ry="6" fill="#0f3d18" transform="rotate(20 9 34)" />
      <path d="M-20 55 Q0 64 20 55" stroke="#14532d" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <path d="M-15 56 L-11 68 L-7 58 Z M15 56 L11 68 L7 58 Z" fill="#fffdf2" />
      <path d="M-46 -30 L-8 -18 L-10 -8 L-46 -18 Z" fill="#16602a" />
      <path d="M46 -30 L8 -18 L10 -8 L46 -18 Z" fill="#16602a" />
      <ellipse cx="-26" cy="-4" rx="12" ry="7" fill={`url(#${u}eye)`} transform="rotate(14 -26 -4)" />
      <ellipse cx="26" cy="-4" rx="12" ry="7" fill={`url(#${u}eye)`} transform="rotate(-14 26 -4)" />
      <ellipse cx="-26" cy="-4" rx="2.2" ry="6" fill="#111" />
      <ellipse cx="26" cy="-4" rx="2.2" ry="6" fill="#111" />
      <circle cx="-29" cy="-6.5" r="1.4" fill="#fff" />
      <circle cx="23" cy="-6.5" r="1.4" fill="#fff" />
      <Hi d="M-40 -46 Q-20 -60 6 -60" o={0.35} />
    </>
  );
}

function Skeleton({ u }: { u: string }) {
  return (
    <>
      <defs>
        <radialGradient id={`${u}b`} cx=".4" cy=".28">
          <stop offset="0" stopColor="#fffef8" />
          <stop offset=".65" stopColor="#ece3cb" />
          <stop offset="1" stopColor="#b9aa86" />
        </radialGradient>
        <radialGradient id={`${u}gl`}>
          <stop offset="0" stopColor="#ffd0d0" />
          <stop offset=".35" stopColor="#ef4444" />
          <stop offset="1" stopColor="#ef4444" stopOpacity="0" />
        </radialGradient>
      </defs>
      <path d={SKL.jaw} fill={`url(#${u}b)`} {...so("#7d6c47")} />
      <path d={SKL.skull} fill={`url(#${u}b)`} {...so("#7d6c47")} />
      <path d="M-30 38 H30 V50 H-30 Z" fill="#fffdf4" />
      <path d="M-20 38 V50 M-10 38 V50 M0 38 V50 M10 38 V50 M20 38 V50" stroke="#a8986e" strokeWidth="1.6" />
      <path d="M-26 52 H26 V62 Q0 68 -26 62 Z" fill="#fffdf4" />
      <path d="M-16 52 V64 M-5 52 V65 M5 52 V65 M16 52 V64" stroke="#a8986e" strokeWidth="1.6" />
      <path d="M-10 -12 C-10 -34 -48 -36 -46 -14 C-44 6 -12 8 -10 -12 Z" fill="#1a0f14" />
      <path d="M10 -12 C10 -34 48 -36 46 -14 C44 6 12 8 10 -12 Z" fill="#1a0f14" />
      <path d="M0 4 L-9 24 Q0 28 9 24 Z" fill="#1a0f14" />
      <path d="M-50 2 Q-42 14 -30 18 M50 2 Q42 14 30 18" stroke="#a8986e" strokeWidth="1.6" fill="none" opacity=".7" />
      <path d="M20 -78 L26 -62 L18 -54 L24 -42" stroke="#8a7a52" strokeWidth="2" fill="none" />
      <circle cx="-28" cy="-14" r="15" fill={`url(#${u}gl)`} />
      <circle cx="28" cy="-14" r="15" fill={`url(#${u}gl)`} />
      <circle cx="-28" cy="-14" r="3.8" fill="#fff" />
      <circle cx="28" cy="-14" r="3.8" fill="#fff" />
      <Hi d="M-52 -42 Q-36 -68 -6 -72" o={0.7} w={4.5} />
    </>
  );
}

function Tiki({ u }: { u: string }) {
  const leaf = "M0 0 C13 -18 13 -48 0 -64 C-13 -48 -13 -18 0 0 Z";
  return (
    <>
      <defs>
        <linearGradient id={`${u}w`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#7a4519" />
          <stop offset=".35" stopColor="#cf9152" />
          <stop offset=".7" stopColor="#b5743a" />
          <stop offset="1" stopColor="#6b3a14" />
        </linearGradient>
        <linearGradient id={`${u}lf`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#15803d" />
          <stop offset="1" stopColor="#4ade80" />
        </linearGradient>
      </defs>
      {[-72, -48, -24, 0, 24, 48, 72].map((a, i) => (
        <g key={i} transform={`translate(0 -40) rotate(${a})`}>
          <path d={leaf} fill={`url(#${u}lf)`} {...so("#0b4d24", 1.6)} />
          <path d="M0 -6 L0 -54" stroke="#0f5132" strokeWidth="1.6" />
        </g>
      ))}
      <path d={TIKI.body} fill={`url(#${u}w)`} {...so("#4a2208")} />
      <path d="M-32 -56 Q-36 0 -32 72 M30 -56 Q34 0 30 72" stroke="#5a2d0c" strokeWidth="1.4" fill="none" opacity=".4" />
      <path d="M-47 -48 H47 V-32 H-47 Z" fill="#6b3a14" />
      <path d="M-42 -36 l7 -8 l7 8 l7 -8 l7 8 l7 -8 l7 8 l7 -8 l7 8 l7 -8 l7 8 l7 -8 l6 7" stroke="#f5d9a8" strokeWidth="2" fill="none" />
      <circle cx="-22" cy="-12" r="19" fill="#8a4f1f" />
      <circle cx="22" cy="-12" r="19" fill="#8a4f1f" />
      <circle cx="-22" cy="-12" r="13" fill="#f5e6c8" />
      <circle cx="22" cy="-12" r="13" fill="#f5e6c8" />
      <circle cx="-22" cy="-11" r="6.5" fill="#1f0f05" />
      <circle cx="22" cy="-11" r="6.5" fill="#1f0f05" />
      <circle cx="-24.5" cy="-14" r="2.2" fill="#fff" />
      <circle cx="19.5" cy="-14" r="2.2" fill="#fff" />
      <path d="M-8 -2 L8 -2 L17 18 Q0 24 -17 18 Z" fill="#8a4f1f" />
      <path d="M-34 28 H34 L30 64 H-30 Z" fill="#2a1306" />
      <path d="M-32 28 H32 V38 H-32 Z" fill="#fffaf0" />
      <path d="M-20 28 V38 M-8 28 V38 M4 28 V38 M16 28 V38" stroke="#b9a582" strokeWidth="1.6" />
      <path d="M-29 54 H29 V63 H-29 Z" fill="#fffaf0" />
      <path d="M-14 54 V63 M0 54 V63 M14 54 V63" stroke="#b9a582" strokeWidth="1.6" />
      <path d="M-10 54 Q0 44 10 54 Z" fill="#e11d48" />
    </>
  );
}

function Viking({ u }: { u: string }) {
  return (
    <>
      <defs>
        <radialGradient id={`${u}sk`} cx=".42" cy=".35">
          <stop offset="0" stopColor="#ffe4cc" />
          <stop offset="1" stopColor="#e09a6c" />
        </radialGradient>
        <linearGradient id={`${u}st`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#eef2f6" />
          <stop offset=".5" stopColor="#9eabb8" />
          <stop offset="1" stopColor="#56616e" />
        </linearGradient>
        <linearGradient id={`${u}horn`} x1="1" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#d9c79a" />
          <stop offset="1" stopColor="#fffaf0" />
        </linearGradient>
        <linearGradient id={`${u}bd`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ff9a4d" />
          <stop offset="1" stopColor="#c2410c" />
        </linearGradient>
      </defs>
      <path d={VIK.horn} fill={`url(#${u}horn)`} {...so("#8a7445")} />
      <path d={mirror(VIK.horn)} fill={`url(#${u}horn)`} {...so("#8a7445")} />
      <path d={VIK.face} fill={`url(#${u}sk)`} {...so("#a8643a")} />
      <path d={VIK.braidL} fill={`url(#${u}bd)`} {...so("#7c2d12")} />
      <path d={VIK.braidR} fill={`url(#${u}bd)`} {...so("#7c2d12")} />
      <rect x="-25.5" y="86" width="15" height="5" rx="1.5" fill="#fbbf24" />
      <rect x="10.5" y="86" width="15" height="5" rx="1.5" fill="#fbbf24" />
      <path d={VIK.beard} fill={`url(#${u}bd)`} {...so("#7c2d12")} />
      <path d="M-30 30 Q-30 52 -20 64 M30 30 Q30 52 20 64 M-12 34 Q-12 56 -6 66 M12 34 Q12 56 6 66" stroke="#b9531a" strokeWidth="1.8" fill="none" />
      <path d="M0 22 C-12 16 -28 20 -36 34 C-24 28 -12 30 0 28 C12 30 24 28 36 34 C28 20 12 16 0 22 Z" fill="#c2551c" />
      <ellipse cx="-17" cy="-4" rx="8" ry="6" fill="#fff" />
      <ellipse cx="17" cy="-4" rx="8" ry="6" fill="#fff" />
      <circle cx="-16" cy="-3" r="3.6" fill="#1e3a8a" />
      <circle cx="18" cy="-3" r="3.6" fill="#1e3a8a" />
      <circle cx="-17" cy="-4.4" r="1.2" fill="#fff" />
      <circle cx="17" cy="-4.4" r="1.2" fill="#fff" />
      <path d="M-30 -14 L-6 -9 M30 -14 L6 -9" strokeWidth="5" stroke="#b9531a" strokeLinecap="round" />
      <ellipse cx="0" cy="10" rx="7" ry="6" fill="#e9926a" />
      <path d={VIK.helmet} fill={`url(#${u}st)`} {...so("#2f3742")} />
      <path d="M0 -86 V-24" stroke="#56616e" strokeWidth="2.4" />
      <rect x="-56" y="-30" width="112" height="13" rx="4" fill="#9a6b2a" />
      <path d="M-6 -18 H6 V14 Q0 18 -6 14 Z" fill={`url(#${u}st)`} />
      {[-44, -26, 26, 44].map((x) => (
        <circle key={x} cx={x} cy="-23.5" r="2.6" fill="#fde68a" />
      ))}
      <Hi d="M-36 -62 Q-14 -78 6 -78" o={0.6} />
    </>
  );
}

function Oni({ u }: { u: string }) {
  return (
    <>
      <defs>
        <radialGradient id={`${u}r`} cx=".45" cy=".35">
          <stop offset="0" stopColor="#ff8a7a" />
          <stop offset=".6" stopColor="#dc2626" />
          <stop offset="1" stopColor="#7f1d1d" />
        </radialGradient>
        <radialGradient id={`${u}m`} cx=".5" cy=".45">
          <stop offset=".6" stopColor="#ffffff" />
          <stop offset="1" stopColor="#cbd5e1" />
        </radialGradient>
        <linearGradient id={`${u}au`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#d99a1e" />
          <stop offset="1" stopColor="#fff3b0" />
        </linearGradient>
      </defs>
      <path d={ONI.mane} fill={`url(#${u}m)`} {...so("#94a3b8")} />
      <path d={ONI.horn} fill={`url(#${u}au)`} {...so("#7a4a00")} />
      <path d={mirror(ONI.horn)} fill={`url(#${u}au)`} {...so("#7a4a00")} />
      <path d={ONI.face} fill={`url(#${u}r)`} {...so("#5f0f0f")} />
      <path d="M-20 -46 Q0 -52 20 -46 M-14 -38 Q0 -42 14 -38" stroke="#7f1d1d" strokeWidth="2" fill="none" />
      <path d="M-48 -28 Q-28 -42 -6 -20 L-10 -14 Q-28 -28 -46 -20 Z" fill="#1a0505" />
      <path d="M48 -28 Q28 -42 6 -20 L10 -14 Q28 -28 46 -20 Z" fill="#1a0505" />
      <path d="M-40 -12 Q-26 -22 -10 -8 Q-26 0 -40 -12 Z" fill="#fde047" />
      <path d="M40 -12 Q26 -22 10 -8 Q26 0 40 -12 Z" fill="#fde047" />
      <circle cx="-24" cy="-10" r="4" fill="#111" />
      <circle cx="24" cy="-10" r="4" fill="#111" />
      <path d="M-14 4 Q0 -8 14 4 Q16 16 6 16 Q0 12 -6 16 Q-16 16 -14 4 Z" fill="#b91c1c" />
      <path d="M-36 26 Q0 18 36 26 Q32 58 0 60 Q-32 58 -36 26 Z" fill="#3b0606" />
      <path d="M-30 27 Q0 21 30 27 L28 34 Q0 29 -28 34 Z" fill="#fffaf0" />
      <path d="M-22 52 Q0 58 22 52 L20 46 Q0 52 -20 46 Z" fill="#fffaf0" />
      <path d="M-26 52 L-31 28 L-17 46 Z M26 52 L31 28 L17 46 Z" fill="#fffaf0" />
      <Hi d="M-36 -40 Q-20 -54 2 -56" o={0.35} />
    </>
  );
}

function Robot({ u }: { u: string }) {
  return (
    <>
      <defs>
        <linearGradient id={`${u}m`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f1f5f9" />
          <stop offset=".5" stopColor="#a5b4c4" />
          <stop offset="1" stopColor="#4b5a6b" />
        </linearGradient>
        <filter id={`${u}gl`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
      </defs>
      <path d={ROB.stem} fill="#64748b" />
      <path d={ROB.ball} fill="#ef4444" {...so("#7f1d1d", 1.6)} />
      <circle cx="0" cy="-90" r="12" fill="#ef4444" opacity=".35" filter={`url(#${u}gl)`} />
      <path d={ROB.earL} fill="#64748b" {...so("#334155")} />
      <path d={ROB.earR} fill="#64748b" {...so("#334155")} />
      <path d={ROB.head} fill={`url(#${u}m)`} {...so("#334155")} />
      <path d="M-34 -50 H34" stroke="#64748b" strokeWidth="2" strokeLinecap="round" />
      <rect x="-42" y="-36" width="84" height="32" rx="14" fill="#0b1220" />
      <rect x="-31" y="-27" width="20" height="13" rx="6" fill="#22d3ee" filter={`url(#${u}gl)`} />
      <rect x="11" y="-27" width="20" height="13" rx="6" fill="#22d3ee" filter={`url(#${u}gl)`} />
      <rect x="-30" y="-26" width="18" height="11" rx="5.5" fill="#a5f3fc" />
      <rect x="12" y="-26" width="18" height="11" rx="5.5" fill="#a5f3fc" />
      <rect x="-30" y="16" width="60" height="22" rx="6" fill="#1f2937" />
      <path d="M-18 18 V36 M-6 18 V36 M6 18 V36 M18 18 V36" stroke="#64748b" strokeWidth="2" />
      {[
        [-42, -50],
        [42, -50],
        [-42, 50],
        [42, 50],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3.6" fill="#e2e8f0" stroke="#64748b" strokeWidth="1.2" />
      ))}
      <circle cx="-36" cy="4" r="4" fill="#f472b6" opacity=".8" />
      <circle cx="36" cy="4" r="4" fill="#f472b6" opacity=".8" />
      <Hi d="M-44 -46 Q-30 -56 -10 -56" o={0.6} />
    </>
  );
}

function Alien({ u }: { u: string }) {
  return (
    <>
      <defs>
        <radialGradient id={`${u}g`} cx=".45" cy=".3">
          <stop offset="0" stopColor="#e6fcb2" />
          <stop offset=".55" stopColor="#84cc16" />
          <stop offset="1" stopColor="#3f6212" />
        </radialGradient>
        <radialGradient id={`${u}e`} cx=".4" cy=".35">
          <stop offset="0" stopColor="#3b3b4f" />
          <stop offset="1" stopColor="#020205" />
        </radialGradient>
      </defs>
      <path d={ALN.head} fill={`url(#${u}g)`} {...so("#365314")} />
      {[
        [-30, -50, 4],
        [22, -58, 3],
        [40, -30, 3.5],
        [-44, -18, 2.6],
      ].map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill="#65a30d" opacity=".45" />
      ))}
      <path d="M-8 -2 C-14 -26 -48 -32 -52 -10 C-54 6 -22 16 -8 -2 Z" fill={`url(#${u}e)`} />
      <path d="M8 -2 C14 -26 48 -32 52 -10 C54 6 22 16 8 -2 Z" fill={`url(#${u}e)`} />
      <ellipse cx="-34" cy="-14" rx="7" ry="4" fill="#fff" opacity=".9" transform="rotate(-20 -34 -14)" />
      <ellipse cx="30" cy="-16" rx="7" ry="4" fill="#fff" opacity=".9" transform="rotate(20 30 -16)" />
      <circle cx="-22" cy="-4" r="2" fill="#fff" opacity=".7" />
      <circle cx="40" cy="-6" r="2" fill="#fff" opacity=".7" />
      <circle cx="-4" cy="30" r="1.8" fill="#1a2e05" />
      <circle cx="4" cy="30" r="1.8" fill="#1a2e05" />
      <path d="M-7 52 Q0 56 7 52" stroke="#1a2e05" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <Hi d="M-42 -56 Q-22 -74 6 -74" o={0.5} w={5} />
    </>
  );
}

function Vampire({ u }: { u: string }) {
  return (
    <>
      <defs>
        <radialGradient id={`${u}sk`} cx=".42" cy=".35">
          <stop offset="0" stopColor="#f8f5fd" />
          <stop offset="1" stopColor="#beb3d2" />
        </radialGradient>
        <radialGradient id={`${u}eye`}>
          <stop offset="0" stopColor="#fecaca" />
          <stop offset=".5" stopColor="#ef4444" />
          <stop offset="1" stopColor="#7f1d1d" />
        </radialGradient>
        <linearGradient id={`${u}cl`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ef4444" />
          <stop offset="1" stopColor="#7f1d1d" />
        </linearGradient>
      </defs>
      <path d={VAM.collarL} fill="#14101a" {...so("#000")} />
      <path d={mirror(VAM.collarL)} fill="#14101a" {...so("#000")} />
      <path d="M-24 44 L-80 -4 L-70 72 Z" fill={`url(#${u}cl)`} />
      <path d="M24 44 L80 -4 L70 72 Z" fill={`url(#${u}cl)`} />
      <path d={VAM.earL} fill={`url(#${u}sk)`} {...so("#7c6f94")} />
      <path d={mirror(VAM.earL)} fill={`url(#${u}sk)`} {...so("#7c6f94")} />
      <path d={VAM.face} fill={`url(#${u}sk)`} {...so("#7c6f94")} />
      <path d={VAM.hair} fill="#151119" {...so("#000")} />
      <Hi d="M-26 -52 Q-10 -60 10 -58" o={0.25} w={3} />
      <path d="M-30 -12 L-8 -6 M30 -12 L8 -6" stroke="#151119" strokeWidth="4" strokeLinecap="round" />
      <ellipse cx="-17" cy="2" rx="8" ry="6" fill={`url(#${u}eye)`} />
      <ellipse cx="17" cy="2" rx="8" ry="6" fill={`url(#${u}eye)`} />
      <circle cx="-19" cy="0" r="1.8" fill="#fff" />
      <circle cx="15" cy="0" r="1.8" fill="#fff" />
      <path d="M0 6 L-4 22 L4 22" stroke="#8a7ca6" strokeWidth="2" fill="none" strokeLinejoin="round" />
      <path d="M-15 36 Q0 44 15 36" stroke="#5b1a2a" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <path d="M-8 39 L-6 51 L-3 41 Z M8 39 L6 51 L3 41 Z" fill="#fff" />
    </>
  );
}

function Sun({ u }: { u: string }) {
  return (
    <>
      <defs>
        <radialGradient id={`${u}co`}>
          <stop offset=".5" stopColor="#fde047" />
          <stop offset=".8" stopColor="#f97316" />
          <stop offset="1" stopColor="#dc2626" />
        </radialGradient>
        <radialGradient id={`${u}fc`} cx=".42" cy=".36">
          <stop offset="0" stopColor="#fffbe0" />
          <stop offset=".45" stopColor="#fde047" />
          <stop offset="1" stopColor="#f59e0b" />
        </radialGradient>
        <filter id={`${u}gl`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>
      <circle r="70" fill="#fb923c" opacity=".55" filter={`url(#${u}gl)`} />
      <path d={SUN.outer} fill={`url(#${u}co)`} {...so("#9a3412")} />
      <path d={SUN.inner} fill="#fde047" opacity=".95" />
      <path d={SUN.face} fill={`url(#${u}fc)`} {...so("#c2410c")} />
      <path d="M-40 -22 Q-26 -36 -8 -20 L-12 -14 Q-26 -26 -38 -16 Z" fill="#7c2d12" />
      <path d="M40 -22 Q26 -36 8 -20 L12 -14 Q26 -26 38 -16 Z" fill="#7c2d12" />
      <path d="M-36 -10 Q-23 -18 -10 -6 Q-23 4 -36 -10 Z" fill="#fff" />
      <path d="M36 -10 Q23 -18 10 -6 Q23 4 36 -10 Z" fill="#fff" />
      <circle cx="-22" cy="-8" r="4.4" fill="#111" />
      <circle cx="22" cy="-8" r="4.4" fill="#111" />
      <circle cx="-23.5" cy="-9.5" r="1.4" fill="#fff" />
      <circle cx="20.5" cy="-9.5" r="1.4" fill="#fff" />
      <path d="M-6 0 Q0 10 6 0" stroke="#7c2d12" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <path d="M-30 18 Q0 12 30 18 Q26 44 0 46 Q-26 44 -30 18 Z" fill="#7f1d1d" />
      <path d="M-25 19.5 Q0 14 25 19.5 L23 26 Q0 21 -23 26 Z" fill="#fff" />
      <path d="M-8 40 Q0 32 8 40 Q4 44 0 44 Q-4 44 -8 40 Z" fill="#f43f5e" />
      <circle cx="-34" cy="12" r="7" fill="#fb7185" opacity=".5" />
      <circle cx="34" cy="12" r="7" fill="#fb7185" opacity=".5" />
      <Hi d="M-38 -34 Q-22 -50 2 -50" o={0.55} />
    </>
  );
}

const BODY: Record<HeadKind, (p: { u: string }) => ReactNode> = {
  pirate: Pirate,
  jester: Jester,
  dragon: Dragon,
  skeleton: Skeleton,
  tiki: Tiki,
  viking: Viking,
  oni: Oni,
  robot: Robot,
  alien: Alien,
  vampire: Vampire,
  sun: Sun,
};

export function HeadArt({ kind, className = "" }: { kind: HeadKind; className?: string }) {
  const u = useId().replace(/[^a-zA-Z0-9]/g, "");
  const Body = BODY[kind];
  return (
    <svg viewBox="-100 -100 200 200" className={className} overflow="visible">
      <Body u={u} />
    </svg>
  );
}
