import { useId, type CSSProperties, type ReactNode } from "react";

/* =====================================================================
   PERFECT SHOT — custom vector icon set (no emoji)
   Each icon is built from layers:
     main   → body (filled)
     accent → secondary colour (filled)
     detail → engraved lines (stroked)
     stroke → body drawn as a thick stroke (e.g. arcs)
   The same geometry renders in 3 styles: classic · gold · neon.
   ===================================================================== */

export type IconName = "gun" | "ranks" | "gift" | "gear" | "quest" | "play" | "studio" | "replay" | "sound" | "mute" | "book";
export type IconSet = "flat" | "classic" | "gold" | "neon";

/** single flat colour used by the FLAT set (Knife-Hit style) */
export const FLAT_COLOR = "#8fd0f2";
export const FLAT_WARM = "#ffb648";

type Layer = { d: string; role: "main" | "accent" | "detail" | "stroke"; w?: number; evenodd?: boolean };

function gearPath(cx: number, cy: number, teeth: number, ro: number, ri: number, hole: number) {
  const pts: string[] = [];
  const step = (Math.PI * 2) / teeth;
  for (let i = 0; i < teeth; i++) {
    const a = i * step - Math.PI / 2;
    const seq = [
      [a - step * 0.5, ri],
      [a - step * 0.24, ri],
      [a - step * 0.15, ro],
      [a + step * 0.15, ro],
      [a + step * 0.24, ri],
    ];
    for (const [ang, r] of seq) pts.push(`${(cx + Math.cos(ang) * r).toFixed(2)} ${(cy + Math.sin(ang) * r).toFixed(2)}`);
  }
  const ring = `M${pts.join(" L")} Z`;
  const h = `M${cx + hole} ${cy} A${hole} ${hole} 0 1 0 ${cx - hole} ${cy} A${hole} ${hole} 0 1 0 ${cx + hole} ${cy} Z`;
  return `${ring} ${h}`;
}

function star(cx: number, cy: number, ro: number, ri: number) {
  const p: string[] = [];
  for (let i = 0; i < 10; i++) {
    const a = (i * Math.PI) / 5 - Math.PI / 2;
    const r = i % 2 ? ri : ro;
    p.push(`${(cx + Math.cos(a) * r).toFixed(2)} ${(cy + Math.sin(a) * r).toFixed(2)}`);
  }
  return `M${p.join(" L")} Z`;
}

const ICONS: Record<IconName, Layer[]> = {
  gun: [
    { role: "main", d: "M14 30 H31 L27 53.5 Q26.4 57 23 57 H13.4 Q9.6 57 10.4 53.2 Z" },
    { role: "main", d: "M10 17 H50 L57 21.5 V30.5 H10 Q6.5 30.5 6.5 27 V20.5 Q6.5 17 10 17 Z" },
    { role: "stroke", w: 4, d: "M31 31 V37.5 Q31 42 35.5 42 H38.5 Q42.5 42 42.5 37.5 V31" },
    { role: "accent", d: "M50.5 19.5 H55 V28 H50.5 Z" },
    { role: "accent", d: "M16 36 H24 V40 H16 Z" },
    { role: "detail", w: 1.8, d: "M37 20.5 V27 M41 20.5 V27 M45 20.5 V27" },
  ],
  ranks: [
    { role: "stroke", w: 4.5, d: "M21 15 H14 Q11 15 11 18.5 Q11 27 21.5 29 M43 15 H50 Q53 15 53 18.5 Q53 27 42.5 29" },
    { role: "main", d: "M19 9 H45 V24 Q45 37 32 39 Q19 37 19 24 Z" },
    { role: "main", d: "M28.5 38 H35.5 V46 H28.5 Z" },
    { role: "main", d: "M20 45.5 H44 Q46.5 45.5 46.5 48 V55.5 H17.5 V48 Q17.5 45.5 20 45.5 Z" },
    { role: "accent", d: star(32, 23, 7.5, 3.4) },
    { role: "detail", w: 1.8, d: "M22 50.5 H42" },
  ],
  gift: [
    { role: "main", d: "M11.5 29 H52.5 V53.5 Q52.5 56.5 49.5 56.5 H14.5 Q11.5 56.5 11.5 53.5 Z" },
    { role: "main", d: "M9 20.5 H55 Q57.5 20.5 57.5 23 V30.5 H6.5 V23 Q6.5 20.5 9 20.5 Z" },
    { role: "accent", d: "M27.5 20.5 H36.5 V56.5 H27.5 Z" },
    { role: "accent", d: "M32 20.5 C25 6 13 9 18 17 C20.5 20.5 27 20.5 32 20.5 Z M32 20.5 C39 6 51 9 46 17 C43.5 20.5 37 20.5 32 20.5 Z" },
    { role: "detail", w: 1.8, d: "M11.5 34.5 H27.5 M36.5 34.5 H52.5" },
  ],
  gear: [
    { role: "main", evenodd: true, d: gearPath(32, 32, 8, 26, 19.5, 8.5) },
    { role: "detail", w: 2, d: "M32 18.5 A13.5 13.5 0 1 1 31.9 18.5" },
    { role: "accent", d: "M32 27.5 A4.5 4.5 0 1 1 31.9 27.5 Z" },
  ],
  quest: [
    { role: "main", d: "M7 16 L22 10.5 L42 16.5 L57 11 V48 L42 53.5 L22 47.5 L7 53 Z" },
    { role: "detail", w: 1.8, d: "M22 10.5 V47.5 M42 16.5 V53.5" },
    { role: "detail", w: 2, d: "M12 44 Q20 38 26 41 T38 36" },
    { role: "accent", evenodd: true, d: "M44 15 C36.5 15 33.5 20.5 33.5 25 C33.5 32.5 44 41 44 41 C44 41 54.5 32.5 54.5 25 C54.5 20.5 51.5 15 44 15 Z M44 21 A4 4 0 1 0 44.01 21 Z" },
  ],
  play: [{ role: "main", d: "M19 12.5 Q19 7.5 23.5 10 L52 28.5 Q56 32 52 35.5 L23.5 54 Q19 56.5 19 51.5 Z" }],
  studio: [
    { role: "main", d: "M9 28 H55 V52 Q55 56 51 56 H13 Q9 56 9 52 Z" },
    { role: "main", d: "M8.5 18.5 L51 10 L53 18.5 L10.5 27 Z" },
    { role: "accent", d: "M17 16.8 L24 15.4 L27 23.7 L20 25.1 Z M31 14 L38 12.6 L41 20.9 L34 22.3 Z M45 11.2 L50.5 10.1 L52.6 18.4 L48 19.3 Z" },
    { role: "accent", d: "M16 28 H23 L18.5 37 H11.5 Z M30 28 H37 L32.5 37 H25.5 Z M44 28 H51 L46.5 37 H39.5 Z" },
    { role: "detail", w: 1.8, d: "M14 44 H38 M14 49.5 H30" },
  ],
  replay: [
    { role: "stroke", w: 7, d: "M45.8 20.4 A18 18 0 1 0 48.9 38.2" },
    { role: "main", d: "M53.5 29.5 L36.5 24.5 L50.5 11.5 Z" },
  ],
  sound: [
    { role: "main", d: "M10 25.5 H20 L34 13.5 V50.5 L20 38.5 H10 Q7.5 38.5 7.5 36 V28 Q7.5 25.5 10 25.5 Z" },
    { role: "stroke", w: 5, d: "M42 24 Q47.5 32 42 40" },
    { role: "stroke", w: 5, d: "M49 17 Q59 32 49 47" },
  ],
  mute: [
    { role: "main", d: "M10 25.5 H20 L34 13.5 V50.5 L20 38.5 H10 Q7.5 38.5 7.5 36 V28 Q7.5 25.5 10 25.5 Z" },
    { role: "stroke", w: 5.5, d: "M42 24 L56 40 M56 24 L42 40" },
  ],
  book: [
    { role: "main", d: "M5 15 Q18 9 31 15 V55 Q18 49 5 55 Z" },
    { role: "main", d: "M33 15 Q46 9 59 15 V55 Q46 49 33 55 Z" },
    { role: "accent", d: "M44 7 H51 V27 L47.5 23.5 L44 27 Z" },
    { role: "detail", w: 2, d: "M10 24 Q18 21 26 24 M10 32 Q18 29 26 32 M10 40 Q18 37 26 40 M38 34 Q45 31 54 34 M38 42 Q45 39 54 42" },
  ],
};

/* ---------------- per-icon palettes ---------------- */
type Pal = { a: string; b: string; acc: [string, string]; neon: string };
const PAL: Record<IconName, Pal> = {
  gun: { a: "#f4f7fa", b: "#7d8996", acc: ["#7dd3fc", "#0369a1"], neon: "#38bdf8" },
  ranks: { a: "#fff3b0", b: "#e09310", acc: ["#ffffff", "#fde68a"], neon: "#fbbf24" },
  gift: { a: "#ff7a9a", b: "#be123c", acc: ["#fff3b0", "#e5a00d"], neon: "#f472b6" },
  gear: { a: "#e2e8f0", b: "#64748b", acc: ["#fdba74", "#ea580c"], neon: "#a78bfa" },
  quest: { a: "#fff1c4", b: "#d6a24e", acc: ["#ff8a8a", "#dc2626"], neon: "#34d399" },
  play: { a: "#ffffff", b: "#d9f99d", acc: ["#ffffff", "#ffffff"], neon: "#a3e635" },
  studio: { a: "#475569", b: "#1e293b", acc: ["#ffffff", "#cbd5e1"], neon: "#fb923c" },
  replay: { a: "#e0f2fe", b: "#38bdf8", acc: ["#ffffff", "#ffffff"], neon: "#22d3ee" },
  sound: { a: "#d1fae5", b: "#10b981", acc: ["#ffffff", "#ffffff"], neon: "#34d399" },
  mute: { a: "#fecaca", b: "#ef4444", acc: ["#ffffff", "#ffffff"], neon: "#f87171" },
  book: { a: "#fde68a", b: "#d97706", acc: ["#fca5a5", "#b91c1c"], neon: "#fbbf24" },
};

type IconProps = {
  name: IconName;
  set?: IconSet;
  className?: string;
  style?: CSSProperties;
  /** force a flat 2-tone look (used on coloured buttons) */
  mono?: { fill: string; line: string };
  /** colour for the FLAT set */
  color?: string;
};

/** one solid colour; inner details are cut out as thin gaps (mask) */
function FlatIcon({ name, color, className, style }: { name: IconName; color: string; className?: string; style?: CSSProperties }) {
  const u = useId().replace(/[^a-zA-Z0-9]/g, "");
  const layers = ICONS[name];
  return (
    <svg viewBox="0 0 64 64" className={className} style={{ overflow: "visible", ...style }} aria-hidden>
      <defs>
        <mask id={`${u}k`} maskUnits="userSpaceOnUse" x="-10" y="-10" width="84" height="84">
          <rect x="-10" y="-10" width="84" height="84" fill="#000" />
          {layers.map((l, i) => {
            const rule = l.evenodd ? "evenodd" : undefined;
            if (l.role === "main") return <path key={i} d={l.d} fill="#fff" fillRule={rule} />;
            if (l.role === "stroke") return <path key={i} d={l.d} fill="none" stroke="#fff" strokeWidth={(l.w ?? 5) + 1} strokeLinecap="round" strokeLinejoin="round" />;
            if (l.role === "accent") return <path key={i} d={l.d} fill="#fff" fillRule={rule} stroke="#000" strokeWidth={3.2} strokeLinejoin="round" paintOrder="stroke" />;
            return <path key={i} d={l.d} fill="none" stroke="#000" strokeWidth={(l.w ?? 1.8) + 0.8} strokeLinecap="round" />;
          })}
        </mask>
      </defs>
      <rect x="-10" y="-10" width="84" height="84" fill={color} mask={`url(#${u}k)`} />
    </svg>
  );
}

export function GameIcon(props: IconProps) {
  if (props.set === "flat" && !props.mono) return <FlatIcon name={props.name} color={props.color ?? FLAT_COLOR} className={props.className} style={props.style} />;
  return <RichIcon {...props} />;
}

function RichIcon({ name, set = "classic", className = "", style, mono }: IconProps) {
  const u = useId().replace(/[^a-zA-Z0-9]/g, "");
  const layers = ICONS[name];
  const p = PAL[name];
  const neon = set === "neon" && !mono;

  const OUT = mono ? mono.line : set === "gold" ? "#4a2705" : "#16111f";
  const mainFill = mono ? mono.fill : neon ? `${p.neon}22` : `url(#${u}m)`;
  const accFill = mono ? mono.line : neon ? `${p.neon}55` : `url(#${u}a)`;
  const lineCol = neon ? p.neon : OUT;
  const ow = neon ? 2.4 : 3.4;

  const draw = (l: Layer, i: number): ReactNode => {
    const rule = l.evenodd ? "evenodd" : undefined;
    if (l.role === "stroke") {
      const w = l.w ?? 5;
      if (neon)
        return <path key={i} d={l.d} fill="none" stroke={p.neon} strokeWidth={w * 0.62} strokeLinecap="round" strokeLinejoin="round" />;
      return (
        <g key={i}>
          <path d={l.d} fill="none" stroke={OUT} strokeWidth={w + ow * 1.6} strokeLinecap="round" strokeLinejoin="round" />
          <path d={l.d} fill="none" stroke={mono ? mono.fill : `url(#${u}m)`} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
        </g>
      );
    }
    if (l.role === "detail")
      return <path key={i} d={l.d} fill="none" stroke={lineCol} strokeOpacity={neon ? 0.9 : 0.55} strokeWidth={l.w ?? 1.8} strokeLinecap="round" />;
    const fill = l.role === "main" ? mainFill : accFill;
    return (
      <path
        key={i}
        d={l.d}
        fillRule={rule}
        clipRule={rule}
        fill={fill}
        stroke={l.role === "accent" && neon ? "#ffffff" : lineCol}
        strokeOpacity={l.role === "accent" && neon ? 0.85 : 1}
        strokeWidth={l.role === "accent" ? ow * 0.75 : ow}
        strokeLinejoin="round"
        paintOrder="stroke"
      />
    );
  };

  const mains = layers.filter((l) => l.role === "main");

  return (
    <svg viewBox="0 0 64 64" className={className} style={{ overflow: "visible", ...style }} aria-hidden>
      <defs>
        <linearGradient id={`${u}m`} x1="0" y1="0" x2="0" y2="1">
          {set === "gold" ? (
            <>
              <stop offset="0" stopColor="#fff6c2" />
              <stop offset=".45" stopColor="#f5c33b" />
              <stop offset="1" stopColor="#a35c06" />
            </>
          ) : (
            <>
              <stop offset="0" stopColor={p.a} />
              <stop offset="1" stopColor={p.b} />
            </>
          )}
        </linearGradient>
        <linearGradient id={`${u}a`} x1="0" y1="0" x2="0" y2="1">
          {set === "gold" ? (
            <>
              <stop offset="0" stopColor="#ff8a8a" />
              <stop offset="1" stopColor="#8b1111" />
            </>
          ) : (
            <>
              <stop offset="0" stopColor={p.acc[0]} />
              <stop offset="1" stopColor={p.acc[1]} />
            </>
          )}
        </linearGradient>
        <clipPath id={`${u}c`}>
          <rect x="0" y="0" width="64" height="27" />
        </clipPath>
        {neon && (
          <filter id={`${u}g`} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="2.2" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        )}
      </defs>
      <g filter={neon ? `url(#${u}g)` : undefined}>
        {layers.map(draw)}
        {/* glossy highlight on the body (classic / gold) */}
        {!neon && !mono && (
          <g clipPath={`url(#${u}c)`} opacity={0.32}>
            {mains.map((l, i) => (
              <path key={i} d={l.d} fillRule={l.evenodd ? "evenodd" : undefined} fill="#ffffff" />
            ))}
          </g>
        )}
      </g>
    </svg>
  );
}

/* =====================================================================
   NAV FRAMES — the plate behind each bottom-nav icon
   ===================================================================== */
const SHAPE: Record<Exclude<IconSet, "flat">, string> = {
  classic: "M32 2.5 L57.5 17 V47 L32 61.5 L6.5 47 V17 Z", // hexagon steel plate
  gold: "M32 2.5 L57 9.5 V30 Q57 50 32 61.5 Q7 50 7 30 V9.5 Z", // royal shield
  neon: "M20 3 H44 L61 20 V44 L44 61 H20 L3 44 V20 Z", // tactical octagon
};

export function NavFrame({ set, name, active = false, children }: { set: IconSet; name: IconName; active?: boolean; children?: ReactNode }) {
  const u = useId().replace(/[^a-zA-Z0-9]/g, "");
  if (set === "flat") return <span className="relative grid aspect-square w-full place-items-center p-[8%]">{children}</span>;
  const p = PAL[name];
  const d = SHAPE[set];
  const rim = set === "gold" ? "#f5c33b" : set === "neon" ? p.neon : "#cfd8e3";
  return (
    <span className="relative block aspect-square w-full">
      <svg viewBox="0 0 64 64" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
        <defs>
          <linearGradient id={`${u}o`} x1="0" y1="0" x2="0" y2="1">
            {set === "classic" && (
              <>
                <stop offset="0" stopColor="#8a97a8" />
                <stop offset=".5" stopColor="#4b5666" />
                <stop offset="1" stopColor="#232a33" />
              </>
            )}
            {set === "gold" && (
              <>
                <stop offset="0" stopColor="#fff2a8" />
                <stop offset=".5" stopColor="#d99a1e" />
                <stop offset="1" stopColor="#6b3a05" />
              </>
            )}
            {set === "neon" && (
              <>
                <stop offset="0" stopColor="#1b1f2e" />
                <stop offset="1" stopColor="#0a0c14" />
              </>
            )}
          </linearGradient>
          <linearGradient id={`${u}i`} x1="0" y1="0" x2="0" y2="1">
            {set === "classic" && (
              <>
                <stop offset="0" stopColor="#3b4656" />
                <stop offset="1" stopColor="#151a21" />
              </>
            )}
            {set === "gold" && (
              <>
                <stop offset="0" stopColor="#2a2350" />
                <stop offset="1" stopColor="#0f0b24" />
              </>
            )}
            {set === "neon" && (
              <>
                <stop offset="0" stopColor={`${p.neon}26`} />
                <stop offset="1" stopColor="#00000000" />
              </>
            )}
          </linearGradient>
          <radialGradient id={`${u}r`} cx=".5" cy=".42" r=".55">
            <stop offset="0" stopColor={set === "neon" ? p.neon : "#ffffff"} stopOpacity={set === "neon" ? 0.35 : 0.22} />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* drop shadow */}
        <path d={d} transform="translate(0 3.5)" fill="#000" opacity=".45" />
        {/* outer plate / rim */}
        <path d={d} fill={`url(#${u}o)`} stroke={set === "neon" ? p.neon : "#0b0d12"} strokeWidth={set === "neon" ? 2.2 : 2} style={set === "neon" ? { filter: `drop-shadow(0 0 4px ${p.neon})` } : undefined} />
        {/* inner panel */}
        <path d={d} transform="translate(32 32) scale(.8) translate(-32 -32)" fill={`url(#${u}i)`} stroke={set === "neon" ? `${p.neon}88` : "#00000088"} strokeWidth="1.6" />
        <path d={d} transform="translate(32 32) scale(.8) translate(-32 -32)" fill={`url(#${u}r)`} />
        {/* bevel highlight */}
        {set !== "neon" && <path d={d} transform="translate(32 32) scale(.93) translate(-32 -32)" fill="none" stroke="#ffffff" strokeOpacity=".35" strokeWidth="1.2" />}
        {/* corner rivets */}
        {set === "classic" &&
          [
            [32, 7.5],
            [53, 19.5],
            [53, 44.5],
            [32, 56.5],
            [11, 44.5],
            [11, 19.5],
          ].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="1.5" fill="#dfe6ee" stroke="#1d232b" strokeWidth=".8" />)}
        {set === "gold" && <path d="M32 5 L34 9 L32 13 L30 9 Z" fill="#fff6c2" stroke="#6b3a05" strokeWidth=".8" />}
        {active && <path d={d} fill="none" stroke={rim} strokeWidth="3" style={{ filter: `drop-shadow(0 0 6px ${rim})` }} />}
      </svg>
      <span className="absolute inset-[19%] grid place-items-center">{children}</span>
    </span>
  );
}

/** round chip used for the small top-left tool buttons */
export function ToolChip({ set, name, tone = "dark" }: { set: IconSet; name: IconName; tone?: "dark" | "gold" }) {
  const p = PAL[name];
  if (set === "flat")
    return (
      <span className="grid h-10 w-10 place-items-center">
        <GameIcon name={name} set="flat" color={tone === "gold" ? FLAT_WARM : FLAT_COLOR} className="h-[28px] w-[28px] drop-shadow-[0_2px_2px_rgba(0,0,0,.45)]" />
      </span>
    );
  const ring = set === "neon" ? p.neon : set === "gold" || tone === "gold" ? "#f5c33b" : "rgba(255,255,255,.28)";
  return (
    <span
      className="relative grid h-10 w-10 place-items-center rounded-full"
      style={{
        background:
          tone === "gold" && set !== "neon"
            ? "radial-gradient(circle at 50% 30%, #ffe27a, #f59e0b 60%, #9a5b00)"
            : set === "neon"
              ? "radial-gradient(circle at 50% 30%, #1d2233, #0a0c14)"
              : "radial-gradient(circle at 50% 30%, #4b5666, #1a2028)",
        boxShadow: `0 3px 0 rgba(0,0,0,.45), inset 0 1.5px 0 rgba(255,255,255,.25), 0 0 0 2px ${ring}${set === "neon" ? `, 0 0 10px ${p.neon}88` : ""}`,
      }}
    >
      <GameIcon name={name} set={set} className="h-[24px] w-[24px]" />
    </span>
  );
}

export const ICON_SETS: { id: IconSet; name: string; desc: string }[] = [
  { id: "flat", name: "FLAT", desc: "Single-colour symbols, clean & minimal" },
  { id: "classic", name: "STEEL 3D", desc: "Colour icons on hexagonal steel plates" },
  { id: "gold", name: "ROYAL GOLD", desc: "Gold icons on a shield badge" },
  { id: "neon", name: "TACTICAL NEON", desc: "Glowing line icons on octagon panels" },
];
