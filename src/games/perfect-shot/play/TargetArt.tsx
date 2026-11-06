import { useId } from "react";
import { Ico, type FlatName } from "../ui/FlatIcons";
import { NEW_KINDS, NewTarget, type NewKind } from "./TargetArt2";
import { HeadArt, type HeadKind } from "./HeadArt";
import type { TargetKind } from "./levels";

const CITRUS: Record<string, { rind: string; rindD: string; pith: string; flesh: string; fleshD: string }> = {
  orange: { rind: "#f59e0b", rindD: "#b45309", pith: "#fff4dc", flesh: "#fb923c", fleshD: "#ea7a1c" },
  lemon: { rind: "#facc15", rindD: "#a16207", pith: "#fffbe6", flesh: "#fde047", fleshD: "#eab308" },
  lime: { rind: "#65a30d", rindD: "#365314", pith: "#f7fee7", flesh: "#a3e635", fleshD: "#65a30d" },
};

export function TargetArt({ kind, icon = "demon", head, className = "" }: { kind: TargetKind; icon?: FlatName; head?: HeadKind; className?: string }) {
  const u = useId().replace(/[^a-zA-Z0-9]/g, "");
  if (kind === "boss" && head) return <HeadArt kind={head} className={className} />;
  if ((NEW_KINDS as string[]).includes(kind)) return <NewTarget kind={kind as NewKind} u={u} className={className} />;
  if (kind === "orange" || kind === "lemon" || kind === "lime") {
    const c = CITRUS[kind];
    return (
      <svg viewBox="-100 -100 200 200" className={className}>
        <defs>
          <radialGradient id={`${u}f`}>
            <stop offset="0" stopColor="#fff" stopOpacity=".5" />
            <stop offset=".25" stopColor={c.flesh} />
            <stop offset="1" stopColor={c.fleshD} />
          </radialGradient>
        </defs>
        <circle r="98" fill={c.rind} stroke={c.rindD} strokeWidth="4" />
        <circle r="90" fill={c.pith} />
        <circle r="83" fill={`url(#${u}f)`} />
        {Array.from({ length: 10 }).map((_, i) => {
          const a = (i / 10) * Math.PI * 2;
          return <line key={i} x1="0" y1="0" x2={Math.cos(a) * 84} y2={Math.sin(a) * 84} stroke={c.pith} strokeWidth="4" strokeLinecap="round" />;
        })}
        {Array.from({ length: 30 }).map((_, i) => {
          const a = (i / 30) * Math.PI * 2 + 0.18;
          const r = 34 + (i % 3) * 16;
          return <ellipse key={`j${i}`} cx={Math.cos(a) * r} cy={Math.sin(a) * r} rx="7" ry="2.2" fill="#fff" opacity=".45" transform={`rotate(${(a * 180) / Math.PI} ${Math.cos(a) * r} ${Math.sin(a) * r})`} />;
        })}
        <circle r="9" fill={c.pith} />
        <path d="M-70 -50 A85 85 0 0 1 -20 -82" stroke="#fff" strokeWidth="6" strokeLinecap="round" fill="none" opacity=".55" />
      </svg>
    );
  }
  if (kind === "watermelon") {
    return (
      <svg viewBox="-100 -100 200 200" className={className}>
        <circle r="98" fill="#15803d" stroke="#14532d" strokeWidth="4" />
        {Array.from({ length: 14 }).map((_, i) => {
          const a = (i / 14) * Math.PI * 2;
          return <path key={i} d={`M${Math.cos(a) * 92} ${Math.sin(a) * 92} L${Math.cos(a + 0.12) * 98} ${Math.sin(a + 0.12) * 98}`} stroke="#14532d" strokeWidth="8" />;
        })}
        <circle r="88" fill="#ecfccb" />
        <circle r="82" fill="#f43f5e" />
        <circle r="60" fill="#fb7185" opacity=".5" />
        {Array.from({ length: 16 }).map((_, i) => {
          const a = (i / 16) * Math.PI * 2;
          const r = i % 2 ? 40 : 62;
          const x = Math.cos(a) * r;
          const y = Math.sin(a) * r;
          return <ellipse key={i} cx={x} cy={y} rx="3.5" ry="6.5" fill="#1c1917" transform={`rotate(${(a * 180) / Math.PI + 90} ${x} ${y})`} />;
        })}
        <path d="M-66 -46 A80 80 0 0 1 -18 -78" stroke="#fff" strokeWidth="6" strokeLinecap="round" fill="none" opacity=".4" />
      </svg>
    );
  }
  if (kind === "wood") {
    return (
      <svg viewBox="-100 -100 200 200" className={className}>
        <path
          d={Array.from({ length: 40 })
            .map((_, i) => {
              const a = (i / 40) * Math.PI * 2;
              const r = 96 + (i % 2 ? 3 : -1);
              return `${i ? "L" : "M"}${Math.cos(a) * r} ${Math.sin(a) * r}`;
            })
            .join(" ") + "Z"}
          fill="#5b3412"
          stroke="#2e1a08"
          strokeWidth="4"
        />
        <circle r="84" fill="#e0a868" />
        {[72, 58, 44, 30, 17].map((r, i) => (
          <circle key={r} r={r} fill="none" stroke="#b97a3a" strokeWidth={i % 2 ? 2.5 : 4} opacity=".75" />
        ))}
        <path d="M0 0 L22 -60 M0 0 L-58 28" stroke="#8a5523" strokeWidth="3" strokeLinecap="round" />
        <circle r="6" fill="#8a5523" />
        <path d="M-64 -44 A78 78 0 0 1 -16 -76" stroke="#fff" strokeWidth="6" strokeLinecap="round" fill="none" opacity=".3" />
      </svg>
    );
  }
  // boss
  return (
    <svg viewBox="-100 -100 200 200" className={className}>
      <defs>
        <radialGradient id={`${u}b`} cx=".4" cy=".35">
          <stop offset="0" stopColor="#ff7a6b" />
          <stop offset=".6" stopColor="#b91c1c" />
          <stop offset="1" stopColor="#450a0a" />
        </radialGradient>
      </defs>
      <circle r="98" fill="#3f3f46" stroke="#18181b" strokeWidth="4" />
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return <circle key={i} cx={Math.cos(a) * 90} cy={Math.sin(a) * 90} r="4.5" fill="#a1a1aa" stroke="#18181b" strokeWidth="1.5" />;
      })}
      <circle r="82" fill={`url(#${u}b)`} />
      <circle r="82" fill="none" stroke="#fbbf24" strokeWidth="3" strokeDasharray="10 8" opacity=".6" />
      <Ico name={icon} color="#ffffff" at={{ x: -46, y: -46, size: 92 }} style={{ filter: "drop-shadow(0 4px 0 rgba(0,0,0,.35))" }} />
    </svg>
  );
}

export function Bullet({ steel = false, className = "", style }: { steel?: boolean; className?: string; style?: React.CSSProperties }) {
  const u = useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <svg viewBox="0 0 14 44" className={className} style={style} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`${u}t`} x1="0" x2="1">
          <stop offset="0" stopColor={steel ? "#64748b" : "#b45309"} />
          <stop offset=".45" stopColor={steel ? "#e2e8f0" : "#fdba74"} />
          <stop offset="1" stopColor={steel ? "#475569" : "#9a3412"} />
        </linearGradient>
        <linearGradient id={`${u}c`} x1="0" x2="1">
          <stop offset="0" stopColor={steel ? "#334155" : "#a16207"} />
          <stop offset=".4" stopColor={steel ? "#94a3b8" : "#fde68a"} />
          <stop offset="1" stopColor={steel ? "#1e293b" : "#854d0e"} />
        </linearGradient>
      </defs>
      <path d="M7 0 C11.5 5 12.6 11 12.6 16 L1.4 16 C1.4 11 2.5 5 7 0 Z" fill={`url(#${u}t)`} stroke="#3b1d06" strokeWidth=".8" />
      <rect x="1.2" y="16" width="11.6" height="24" rx="1" fill={`url(#${u}c)`} stroke="#3b2a06" strokeWidth=".8" />
      <rect x="0.4" y="39.5" width="13.2" height="4" rx="1" fill={steel ? "#334155" : "#92400e"} stroke="#3b2a06" strokeWidth=".8" />
      <rect x="4" y="18" width="1.6" height="20" fill="#fff" opacity=".45" />
    </svg>
  );
}
