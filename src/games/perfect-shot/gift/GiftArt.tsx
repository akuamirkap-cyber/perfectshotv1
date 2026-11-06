import { useId } from "react";

function BowShapes({ gold, stroke = "#7c2d12" }: { gold: string; stroke?: string }) {
  return (
    <>
      <path d="M98 76 L80 104 L88 101 L92 110 L102 78 Z" fill={gold} stroke={stroke} strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M102 76 L120 104 L112 101 L108 110 L98 78 Z" fill={gold} stroke={stroke} strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M100 74 C78 36 46 44 58 66 C66 80 88 80 100 74 Z" fill={gold} stroke={stroke} strokeWidth="3" strokeLinejoin="round" />
      <path d="M100 74 C122 36 154 44 142 66 C134 80 112 80 100 74 Z" fill={gold} stroke={stroke} strokeWidth="3" strokeLinejoin="round" />
      <path d="M96 72 C82 54 66 54 70 64 C74 72 88 74 96 72 Z" fill="#b45309" opacity=".5" />
      <path d="M104 72 C118 54 134 54 130 64 C126 72 112 74 104 72 Z" fill="#b45309" opacity=".5" />
      <path d="M64 58 C70 50 80 50 86 58" stroke="#fff" strokeWidth="3" strokeLinecap="round" fill="none" opacity=".55" />
      <ellipse cx="100" cy="73" rx="12" ry="10" fill={gold} stroke={stroke} strokeWidth="3" />
      <ellipse cx="96.5" cy="69" rx="4" ry="2.5" fill="#fff" opacity=".65" />
    </>
  );
}

function GoldGrad({ id }: { id: string }) {
  return (
    <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#fff6c2" />
      <stop offset=".35" stopColor="#ffd23f" />
      <stop offset=".75" stopColor="#f59e0b" />
      <stop offset="1" stopColor="#b45309" />
    </linearGradient>
  );
}

/** stand-alone bow (used by the gift-wrap transition) */
export function Bow({ className = "" }: { className?: string }) {
  const u = useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <svg viewBox="40 30 120 84" className={className} overflow="visible">
      <defs>
        <GoldGrad id={`${u}g`} />
      </defs>
      <BowShapes gold={`url(#${u}g)`} />
    </svg>
  );
}

type BoxProps = { lidOff?: boolean; glow?: string | null; level?: number; wiggle?: boolean; className?: string };

export function GiftBox({ lidOff = false, glow = null, level = 0, wiggle = false, className = "" }: BoxProps) {
  const u = useId().replace(/[^a-zA-Z0-9]/g, "");
  const rays = [
    [-44, 70, -44, 84],
    [-56, 95, -56, 107],
    [-44, 120, -44, 134],
  ];
  return (
    <svg viewBox="0 0 200 210" className={className} overflow="visible">
      <defs>
        <linearGradient id={`${u}body`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ff6b8a" />
          <stop offset=".5" stopColor="#e11d48" />
          <stop offset="1" stopColor="#9f1239" />
        </linearGradient>
        <linearGradient id={`${u}lid`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ff8fa6" />
          <stop offset="1" stopColor="#e11d48" />
        </linearGradient>
        <GoldGrad id={`${u}gold`} />
        <pattern id={`${u}dots`} width="22" height="22" patternUnits="userSpaceOnUse">
          <circle cx="5" cy="5" r="3" fill="#fff" opacity=".22" />
          <circle cx="16" cy="16" r="2.2" fill="#ffd23f" opacity=".4" />
        </pattern>
        <filter id={`${u}blur`} x="-60%" y="-200%" width="220%" height="500%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>

      {/* body */}
      <rect x="34" y="100" width="132" height="94" rx="10" fill={`url(#${u}body)`} stroke="#4c0519" strokeWidth="4" />
      <rect x="36" y="102" width="128" height="90" rx="8" fill={`url(#${u}dots)`} />
      <rect x="132" y="102" width="32" height="90" rx="8" fill="#000" opacity=".14" />
      <rect x="88" y="100" width="24" height="94" fill={`url(#${u}gold)`} stroke="#7c2d12" strokeWidth="3" />
      <rect x="93" y="104" width="5" height="86" rx="2.5" fill="#fff" opacity=".45" />
      <rect x="44" y="110" width="7" height="64" rx="3.5" fill="#fff" opacity=".3" />

      {/* open interior */}
      {lidOff && (
        <>
          <rect x="36" y="94" width="128" height="14" rx="6" fill="#3b0716" stroke="#4c0519" strokeWidth="3" />
          <ellipse cx="100" cy="100" rx="60" ry="8" fill={glow ?? "#fff"} opacity=".95" filter={`url(#${u}blur)`} />
          <ellipse cx="100" cy="100" rx="40" ry="4" fill="#fff" opacity=".9" />
        </>
      )}

      {/* light leaking from the seam */}
      {glow && level > 0 && !lidOff && (
        <g className="gf-seam" style={{ opacity: Math.min(1, 0.35 + level * 0.3) }}>
          <rect x="18" y="95" width="164" height="12" rx="6" fill={glow} filter={`url(#${u}blur)`} />
          {rays.map(([x1, y1, x2, y2], i) => (
            <g key={i}>
              <polygon points={`26,100 ${x1},${y1} ${x2},${y2}`} fill={glow} opacity={0.35 + level * 0.15} />
              <polygon points={`174,100 ${200 - x1},${y1} ${200 - x2},${y2}`} fill={glow} opacity={0.35 + level * 0.15} />
            </g>
          ))}
          <rect x="30" y="99" width="140" height="3" rx="1.5" fill="#fff" opacity=".95" />
        </g>
      )}

      {/* lid */}
      <g className={lidOff ? "gf-lid-off" : ""}>
        <rect x="24" y="74" width="152" height="32" rx="9" fill={`url(#${u}lid)`} stroke="#4c0519" strokeWidth="4" />
        <rect x="26" y="76" width="148" height="28" rx="7" fill={`url(#${u}dots)`} />
        <rect x="26" y="96" width="148" height="8" rx="4" fill="#000" opacity=".15" />
        <rect x="86" y="74" width="28" height="32" fill={`url(#${u}gold)`} stroke="#7c2d12" strokeWidth="3" />
        <rect x="34" y="79" width="44" height="5" rx="2.5" fill="#fff" opacity=".45" />
        <rect x="122" y="79" width="40" height="5" rx="2.5" fill="#fff" opacity=".3" />
        <g className={wiggle ? "gf-bow" : ""}>
          <BowShapes gold={`url(#${u}gold)`} />
        </g>
      </g>
    </svg>
  );
}

export function Gem({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 92" className={className} overflow="visible">
      <g stroke="#0c4a6e" strokeWidth="2.5" strokeLinejoin="round">
        <polygon points="22,10 34,32 4,32" fill="#a5f3fc" />
        <polygon points="22,10 50,10 34,32" fill="#e0fbff" />
        <polygon points="50,10 66,32 34,32" fill="#7dd3fc" />
        <polygon points="50,10 78,10 66,32" fill="#bae6fd" />
        <polygon points="78,10 96,32 66,32" fill="#38bdf8" />
        <polygon points="4,32 34,32 50,86" fill="#38bdf8" />
        <polygon points="34,32 66,32 50,86" fill="#7dd3fc" />
        <polygon points="66,32 96,32 50,86" fill="#0284c7" />
      </g>
      <path d="M26 16 L30 24" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
      <path d="M80 4 l2 6 l6 2 l-6 2 l-2 6 l-2 -6 l-6 -2 l6 -2 z" fill="#fff" />
    </svg>
  );
}
