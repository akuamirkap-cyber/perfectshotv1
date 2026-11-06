import { useId, useMemo, type CSSProperties } from "react";

export function Coin({ size = 20 }: { size?: number }) {
  return (
    <span
      className="relative inline-grid shrink-0 place-items-center rounded-full"
      style={{
        width: size,
        height: size,
        background: "radial-gradient(circle at 35% 30%, #fff6b0, #ffd23f 45%, #e09310 100%)",
        boxShadow: "inset 0 -2px 0 rgba(150,80,0,.45), 0 0 0 1.5px #a86400",
      }}
    >
      <span style={{ width: size * 0.22, height: size * 0.5, borderRadius: 999, background: "rgba(168,100,0,.55)" }} />
    </span>
  );
}

const TONES = {
  green: { a: "#6ee7a0", b: "#16a34a", c: "#0f5132", band: ["#fff3b0", "#d97706"], gem: "#38bdf8" },
  purple: { a: "#d8b4fe", b: "#9333ea", c: "#3b0764", band: ["#fff3b0", "#d97706"], gem: "#f0abfc" },
  gold: { a: "#fff1a8", b: "#f59e0b", c: "#7c2d12", band: ["#ffffff", "#fb7185"], gem: "#ef4444" },
};

export function Chest({ tone, open = false, className = "" }: { tone: keyof typeof TONES; open?: boolean; className?: string }) {
  const u = useId().replace(/[^a-zA-Z0-9]/g, "");
  const t = TONES[tone];
  return (
    <svg viewBox="0 0 100 92" className={className} overflow="visible">
      <defs>
        <linearGradient id={`${u}b`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={t.a} />
          <stop offset="0.5" stopColor={t.b} />
          <stop offset="1" stopColor={t.c} />
        </linearGradient>
        <linearGradient id={`${u}m`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={t.band[0]} />
          <stop offset="1" stopColor={t.band[1]} />
        </linearGradient>
        <radialGradient id={`${u}g`}>
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.4" stopColor="#fff3b0" />
          <stop offset="1" stopColor="#fff3b0" stopOpacity="0" />
        </radialGradient>
      </defs>
      {open && <ellipse cx="50" cy="40" rx="48" ry="40" fill={`url(#${u}g)`} />}
      {/* base */}
      <path d="M10 44 H90 V80 Q90 87 83 87 H17 Q10 87 10 80 Z" fill={`url(#${u}b)`} stroke="#1a1020" strokeWidth="3" strokeLinejoin="round" />
      <rect x="14" y="47" width="72" height="5" rx="2.5" fill="#fff" opacity="0.3" />
      <rect x="22" y="44" width="9" height="43" fill={`url(#${u}m)`} stroke="#1a1020" strokeWidth="2" />
      <rect x="69" y="44" width="9" height="43" fill={`url(#${u}m)`} stroke="#1a1020" strokeWidth="2" />
      {open && <rect x="12" y="40" width="76" height="8" rx="3" fill="#2a1630" />}
      {/* lid */}
      <g
        style={{
          transform: open ? "translate(-4px,-30px) rotate(-24deg)" : "none",
          transformOrigin: "10px 44px",
          transformBox: "view-box",
          transition: "transform .45s cubic-bezier(.2,1.7,.4,1)",
        }}
      >
        <path d="M8 46 Q8 16 50 14 Q92 16 92 46 Z" fill={`url(#${u}b)`} stroke="#1a1020" strokeWidth="3" strokeLinejoin="round" />
        <path d="M22 46 L22 21 Q26 18.5 31 18 L31 46 Z" fill={`url(#${u}m)`} stroke="#1a1020" strokeWidth="2" />
        <path d="M69 46 L69 18 Q74 18.5 78 21 L78 46 Z" fill={`url(#${u}m)`} stroke="#1a1020" strokeWidth="2" />
        <path d="M16 30 Q30 20 50 19" stroke="#fff" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.45" />
      </g>
      {/* lock */}
      {!open && (
        <g>
          <rect x="41" y="37" width="18" height="20" rx="4" fill={`url(#${u}m)`} stroke="#1a1020" strokeWidth="2.5" />
          <circle cx="50" cy="45" r="3.6" fill={t.gem} stroke="#1a1020" strokeWidth="1.5" />
          <rect x="48.8" y="47" width="2.4" height="6" rx="1" fill="#1a1020" />
        </g>
      )}
    </svg>
  );
}

const CONF_COLORS = ["#ffd23f", "#3fdc72", "#38bdf8", "#f472b6", "#a78bfa", "#fb923c", "#ffffff"];

export function Confetti({ n = 24, delay = 0, spread = 1, className = "" }: { n?: number; delay?: number; spread?: number; className?: string }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2 + Math.random() * 0.4;
        const r = (90 + Math.random() * 110) * spread;
        return {
          x: Math.cos(a) * r,
          y: Math.sin(a) * r * 0.8 - 40 * spread,
          rot: (Math.random() - 0.5) * 900,
          c: CONF_COLORS[i % CONF_COLORS.length],
          w: 6 + Math.random() * 6,
          round: i % 3 === 0,
          dl: delay + Math.random() * 60,
        };
      }),
    [n, delay, spread],
  );
  return (
    <div className={`pointer-events-none absolute left-1/2 top-1/2 ${className}`}>
      {pieces.map((p, i) => (
        <span
          key={i}
          className="confetti absolute"
          style={
            {
              width: p.w,
              height: p.round ? p.w : p.w * 0.45,
              marginLeft: -p.w / 2,
              background: p.c,
              borderRadius: p.round ? "50%" : 2,
              "--x": `${p.x}px`,
              "--y": `${p.y}px`,
              "--r": `${p.rot}deg`,
              "--cdl": `${p.dl}ms`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
