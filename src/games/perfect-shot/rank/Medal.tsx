import { useId } from "react";

/* =====================================================================
   PODIUM MEDALS — polished metal, no black outlines.
   1 = gold starburst + laurel + crown (red/white ribbon)
   2 = silver faceted hexagon (blue/white ribbon)
   3 = bronze scalloped coin (green/white ribbon)
   ===================================================================== */
const f = (n: number) => n.toFixed(2);
const P = (r: number, deg: number) => [Math.cos((deg * Math.PI) / 180) * r, Math.sin((deg * Math.PI) / 180) * r] as const;
const poly = (n: number, r1: number, r2: number, ph = -90) =>
  "M" +
  Array.from({ length: n }, (_, i) => {
    const [x, y] = P(i % 2 ? r2 : r1, ph + (i * 360) / n);
    return `${f(x)} ${f(y)}`;
  }).join(" L") +
  " Z";

const METAL = {
  1: { a: "#fff8cf", b: "#ffd84a", c: "#e0a312", d: "#9a6200", rib: ["#ef4444", "#ffffff", "#b91c1c"], txt: "#8a4b00" },
  2: { a: "#ffffff", b: "#dbe4ee", c: "#9fb0c2", d: "#5e7086", rib: ["#3b82f6", "#ffffff", "#1d4ed8"], txt: "#3e4c5e" },
  3: { a: "#ffe2c8", b: "#f0a36b", c: "#c96a32", d: "#7c3510", rib: ["#22c55e", "#ffffff", "#15803d"], txt: "#6b2a0a" },
} as const;

function Ribbon({ c, u }: { c: readonly string[]; u: string }) {
  const strip = (side: -1 | 1) => {
    const d = side < 0 ? "M-20 0 L-34 56 L-23 49 L-16 62 L-2 6 Z" : "M20 0 L34 56 L23 49 L16 62 L2 6 Z";
    return (
      <g>
        <path d={d} fill={`url(#${u}rb)`} />
        <path d={d} fill="none" stroke={c[2]} strokeOpacity=".55" strokeWidth="1.2" strokeLinejoin="round" />
        <path d={side < 0 ? "M-12 4 L-24 52" : "M12 4 L24 52"} stroke={c[1]} strokeWidth="4" strokeLinecap="round" opacity=".9" />
      </g>
    );
  };
  return (
    <g transform="translate(0 4)">
      {strip(-1)}
      {strip(1)}
    </g>
  );
}

export function PodiumMedal({ n, className = "" }: { n: 1 | 2 | 3; className?: string }) {
  const u = useId().replace(/[^a-zA-Z0-9]/g, "");
  const m = METAL[n];
  const suffix = n === 1 ? "ST" : n === 2 ? "ND" : "RD";
  const face = (
    <>
      <circle r="20" fill={`url(#${u}cn)`} />
      <circle r="20" fill="none" stroke={m.d} strokeOpacity=".35" strokeWidth="1.2" />
      <circle r="16.5" fill="none" stroke="#fff" strokeOpacity=".6" strokeWidth="1" />
      <text x="-1.5" y="7.5" textAnchor="middle" fontSize="23" fill={m.txt} style={{ fontFamily: "'Russo One', sans-serif" }}>
        {n}
      </text>
      <text x="9.5" y="-1" textAnchor="middle" fontSize="7" fill={m.txt} style={{ fontFamily: "'Russo One', sans-serif" }}>
        {suffix}
      </text>
      <path d="M-14 -10 A17 17 0 0 1 4 -17" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" fill="none" opacity=".75" />
    </>
  );
  return (
    <svg viewBox="-60 -70 120 136" className={className} overflow="visible">
      <defs>
        <linearGradient id={`${u}m`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={m.a} />
          <stop offset=".45" stopColor={m.b} />
          <stop offset=".75" stopColor={m.c} />
          <stop offset="1" stopColor={m.d} />
        </linearGradient>
        <radialGradient id={`${u}cn`} cx=".38" cy=".32">
          <stop offset="0" stopColor={m.a} />
          <stop offset=".6" stopColor={m.b} />
          <stop offset="1" stopColor={m.c} />
        </radialGradient>
        <linearGradient id={`${u}rb`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={m.rib[2]} />
          <stop offset=".5" stopColor={m.rib[0]} />
          <stop offset="1" stopColor={m.rib[2]} />
        </linearGradient>
        <radialGradient id={`${u}glow`}>
          <stop offset="0" stopColor={m.b} stopOpacity=".7" />
          <stop offset="1" stopColor={m.b} stopOpacity="0" />
        </radialGradient>
      </defs>

      <Ribbon c={m.rib} u={u} />
      <circle r="44" fill={`url(#${u}glow)`} />

      {n === 1 && (
        <>
          {/* laurel */}
          {[-1, 1].map((s) =>
            Array.from({ length: 7 }).map((_, i) => {
              const a = 112 + i * 20;
              const [x, y] = P(39, s < 0 ? a : 180 - a);
              const rot = s < 0 ? a + 100 : 80 - a;
              return <ellipse key={`${s}${i}`} cx={f(x)} cy={f(y + 6)} rx="4.6" ry="9.5" fill={i % 2 ? "#ffd84a" : "#f2b51f"} transform={`rotate(${f(rot)} ${f(x)} ${f(y + 6)})`} />;
            }),
          )}
          <path d={poly(24, 35, 27)} fill={`url(#${u}m)`} />
          <path d={poly(24, 35, 27)} fill="none" stroke={m.d} strokeOpacity=".4" strokeWidth="1.2" strokeLinejoin="round" />
          <circle r="25" fill={m.c} opacity=".55" />
          {face}
          <g transform="translate(0 -45)">
            <path d="M-17 6 L-12 -9 L-5 -1 L0 -13 L5 -1 L12 -9 L17 6 Z" fill={`url(#${u}m)`} />
            <rect x="-17" y="4" width="34" height="5" rx="1.5" fill={m.c} />
            <circle cx="0" cy="-14" r="2.6" fill="#ef4444" />
            <circle cx="-12" cy="-10" r="2" fill="#38bdf8" />
            <circle cx="12" cy="-10" r="2" fill="#22c55e" />
          </g>
        </>
      )}

      {n === 2 && (
        <>
          {/* faceted hexagon */}
          {Array.from({ length: 6 }).map((_, i) => {
            const [x1, y1] = P(36, -90 + i * 60);
            const [x2, y2] = P(36, -30 + i * 60);
            const col = [m.a, m.b, m.c, m.d, m.c, m.b][i];
            return <path key={i} d={`M0 0 L${f(x1)} ${f(y1)} L${f(x2)} ${f(y2)} Z`} fill={col} />;
          })}
          <path d={poly(6, 36, 36)} fill="none" stroke={m.d} strokeOpacity=".45" strokeWidth="1.2" strokeLinejoin="round" />
          <path d={poly(6, 29, 29)} fill={`url(#${u}m)`} />
          {face}
        </>
      )}

      {n === 3 && (
        <>
          {/* scalloped coin */}
          {Array.from({ length: 16 }).map((_, i) => {
            const [x, y] = P(30, i * 22.5);
            return <circle key={i} cx={f(x)} cy={f(y)} r="6.6" fill={`url(#${u}m)`} />;
          })}
          <circle r="31" fill={`url(#${u}m)`} />
          <circle r="27" fill="none" stroke="#fff" strokeOpacity=".35" strokeWidth="1.2" strokeDasharray="2 3" />
          {face}
        </>
      )}

      {/* sparkle */}
      <path d="M-30 -30 l2 6 6 2 -6 2 -2 6 -2 -6 -6 -2 6 -2 Z" fill="#fff" opacity=".9" />
    </svg>
  );
}

/* =====================================================================
   RANK NUMBER (4th and below) & LEVEL BADGE
   ===================================================================== */
export function RankNum({ n, me = false, size = 38 }: { n: number; me?: boolean; size?: number }) {
  const [a, b, d] = me ? ["#fff3b0", "#f5b82e", "#8a4b00"] : ["#c4b5fd", "#7c3aed", "#2e1065"];
  return (
    <span className="relative grid shrink-0 place-items-center" style={{ height: size, width: size }}>
      <svg viewBox="0 0 40 40" className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id={`rn${me ? "m" : "o"}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={a} />
            <stop offset="1" stopColor={b} />
          </linearGradient>
        </defs>
        <circle cx="20" cy="20" r="18" fill={`url(#rn${me ? "m" : "o"})`} />
        <circle cx="20" cy="20" r="14.5" fill={d} opacity=".55" />
        <path d="M8 14 A13 13 0 0 1 20 7" stroke="#fff" strokeOpacity=".6" strokeWidth="2" strokeLinecap="round" fill="none" />
      </svg>
      <span className="font-title relative leading-none text-white" style={{ fontSize: n >= 100 ? size * 0.32 : size * 0.42, textShadow: "0 1px 0 rgba(0,0,0,.35)" }}>
        {n}
      </span>
    </span>
  );
}

/** stage level shown as a gem-cut shield; colour tier grows with progress */
export function LevelBadge({ lv, me = false, size = 48 }: { lv: number; me?: boolean; size?: number }) {
  const tier = me ? ["#fff3b0", "#f5b82e", "#a35c06"] : lv >= 60 ? ["#fbcfe8", "#ec4899", "#831843"] : lv >= 35 ? ["#ddd6fe", "#8b5cf6", "#4c1d95"] : lv >= 15 ? ["#bae6fd", "#0ea5e9", "#0c4a6e"] : ["#bbf7d0", "#22c55e", "#14532d"];
  const id = `lv${tier[1].slice(1)}`;
  return (
    <span className="relative grid shrink-0 place-items-center" style={{ height: size, width: Math.round(size * 0.875) }}>
      <svg viewBox="0 0 42 48" className="absolute inset-0 h-full w-full drop-shadow-[0_3px_3px_rgba(0,0,0,.35)]">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={tier[0]} />
            <stop offset=".55" stopColor={tier[1]} />
            <stop offset="1" stopColor={tier[2]} />
          </linearGradient>
        </defs>
        <path d="M21 1 L40 9 V25 C40 36 31 43 21 47 C11 43 2 36 2 25 V9 Z" fill={`url(#${id})`} />
        <path d="M21 5 L36 11.5 V25 C36 34 29 40 21 43 C13 40 6 34 6 25 V11.5 Z" fill="#000" opacity=".18" />
        <path d="M6 12 L21 5.5 L21 18 Z" fill="#fff" opacity=".35" />
      </svg>
      <span className="relative -mt-1 flex flex-col items-center leading-none text-white" style={{ textShadow: "0 1px 0 rgba(0,0,0,.4)" }}>
        <span className="font-title tracking-wider opacity-90" style={{ fontSize: size * 0.18 }}>LV</span>
        <span className="font-title" style={{ fontSize: lv >= 100 ? size * 0.25 : size * 0.31 }}>
          {lv}
        </span>
      </span>
    </span>
  );
}

/** kept for older imports */
export function RankChip({ n, me = false }: { n: number; me?: boolean }) {
  return <RankNum n={n} me={me} />;
}
