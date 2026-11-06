import { useId } from "react";

export function Knife({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 20 80" className={className} style={style}>
      <defs>
        <linearGradient id="kblade" x1="0" x2="1"><stop offset="0" stopColor="#ffffff" /><stop offset=".5" stopColor="#dfe8ee" /><stop offset="1" stopColor="#9fb0bb" /></linearGradient>
        <linearGradient id="khandle" x1="0" x2="1"><stop offset="0" stopColor="#c47a3c" /><stop offset="1" stopColor="#7a4319" /></linearGradient>
      </defs>
      <path d="M10 0 L17 12 L17 44 L3 44 L3 12 Z" fill="url(#kblade)" stroke="#6b7c86" strokeWidth="1.2" />
      <path d="M10 3 L10 43" stroke="#ffffff" strokeWidth="1.5" opacity=".8" />
      <rect x="0" y="44" width="20" height="5" rx="2" fill="#4a2a12" />
      <rect x="5" y="49" width="10" height="28" rx="4" fill="url(#khandle)" stroke="#4a2a12" strokeWidth="1.2" />
      <path d="M5 57 H15 M5 65 H15" stroke="#4a2a12" strokeWidth="1.5" />
    </svg>
  );
}

/** Premium gift box body — deep violet + gold premium trim + gems */
export function GiftBoxBody() {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 180 132" className="h-full w-full overflow-visible">
      <defs>
        <linearGradient id={`bg${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a86bff" /><stop offset=".35" stopColor="#7430e8" /><stop offset="1" stopColor="#3d0d9e" />
        </linearGradient>
        <linearGradient id={`rb${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff3b0" /><stop offset=".45" stopColor="#ffcf3d" /><stop offset="1" stopColor="#c07c00" />
        </linearGradient>
        <linearGradient id={`edge${id}`} x1="0" x2="1">
          <stop offset="0" stopColor="#ffe9a8" /><stop offset=".5" stopColor="#c99600" /><stop offset="1" stopColor="#ffe9a8" />
        </linearGradient>
      </defs>
      {/* main box */}
      <rect x="10" y="4" width="160" height="122" rx="14" fill={`url(#bg${id})`} stroke="#20045e" strokeWidth="4" />
      {/* side shading */}
      <rect x="10" y="4" width="34" height="122" rx="14" fill="#fff" opacity=".12" />
      <rect x="136" y="4" width="34" height="122" rx="12" fill="#000" opacity=".22" />
      {/* top gold trim */}
      <rect x="10" y="4" width="160" height="16" rx="8" fill="#1e0550" opacity=".5" />
      <rect x="10" y="16" width="160" height="4" fill={`url(#edge${id})`} opacity=".9" />
      {/* bottom gold trim */}
      <rect x="10" y="112" width="160" height="5" fill={`url(#edge${id})`} opacity=".85" />
      {/* ribbon vertical */}
      <rect x="73" y="4" width="34" height="122" fill={`url(#rb${id})`} stroke="#8a5a00" strokeWidth="2.5" />
      <rect x="81" y="6" width="7" height="118" rx="3.5" fill="#fffbe0" opacity=".8" />
      {/* ribbon horizontal */}
      <rect x="10" y="56" width="160" height="20" fill={`url(#rb${id})`} stroke="#8a5a00" strokeWidth="2.5" />
      {/* center lock / gem */}
      <rect x="68" y="51" width="44" height="30" rx="9" fill="#2a0866" stroke={`url(#edge${id})`} strokeWidth="3" />
      <path d="M90 57 L98 66 L90 75 L82 66 Z" fill="#7cf8ff" stroke="#fff" strokeWidth="2" />
      <circle cx="90" cy="66" r="2.5" fill="#fff" />
      {/* studs */}
      {[30, 145].map((x) => (
        <g key={x}>
          <circle cx={x} cy="36" r="5" fill={`url(#rb${id})`} stroke="#8a5a00" strokeWidth="2" />
          <circle cx={x} cy="96" r="5" fill={`url(#rb${id})`} stroke="#8a5a00" strokeWidth="2" />
        </g>
      ))}
      {/* sparkle dots */}
      <circle cx="48" cy="88" r="2.5" fill="#fff" opacity=".5" />
      <circle cx="132" cy="34" r="2" fill="#fff" opacity=".5" />
    </svg>
  );
}

export function GiftBoxLid() {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 200 96" className="h-full w-full overflow-visible">
      <defs>
        <linearGradient id={`lg${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c9a2ff" /><stop offset=".45" stopColor="#8f45ff" /><stop offset="1" stopColor="#5a18c8" />
        </linearGradient>
        <linearGradient id={`bw${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff6bf" /><stop offset=".55" stopColor="#ffcc33" /><stop offset="1" stopColor="#c07c00" />
        </linearGradient>
      </defs>
      {/* bow loops */}
      <path d="M100 44 C64 -6, 26 6, 44 34 C54 50, 88 48, 100 44 Z" fill={`url(#bw${id})`} stroke="#8a5a00" strokeWidth="3.5" />
      <path d="M100 44 C136 -6, 174 6, 156 34 C146 50, 112 48, 100 44 Z" fill={`url(#bw${id})`} stroke="#8a5a00" strokeWidth="3.5" />
      <path d="M58 22 C66 14, 78 15, 86 26" stroke="#fffbe0" strokeWidth="4" fill="none" strokeLinecap="round" opacity=".9" />
      <path d="M114 26 C122 15, 134 14, 142 22" stroke="#fffbe0" strokeWidth="4" fill="none" strokeLinecap="round" opacity=".9" />
      {/* tails */}
      <path d="M88 48 L78 68 L90 64 L96 72 L100 50 Z" fill={`url(#bw${id})`} stroke="#8a5a00" strokeWidth="2.5" />
      <path d="M112 48 L122 68 L110 64 L104 72 L100 50 Z" fill={`url(#bw${id})`} stroke="#8a5a00" strokeWidth="2.5" />
      {/* knot */}
      <rect x="88" y="34" width="24" height="20" rx="7" fill={`url(#bw${id})`} stroke="#8a5a00" strokeWidth="3" />
      <circle cx="100" cy="44" r="4" fill="#fffbe0" opacity=".9" />
      {/* lid */}
      <rect x="0" y="50" width="200" height="42" rx="12" fill={`url(#lg${id})`} stroke="#20045e" strokeWidth="4" />
      <rect x="10" y="55" width="180" height="7" rx="3.5" fill="#fff" opacity=".35" />
      <rect x="84" y="50" width="32" height="42" fill={`url(#bw${id})`} stroke="#8a5a00" strokeWidth="2.5" />
      <rect x="0" y="84" width="200" height="5" fill="#1e0550" opacity=".45" />
    </svg>
  );
}

/** Cheese boss face (rotates with log) */
export function CheeseBoss() {
  return (
    <div className="absolute inset-0 rounded-full border-[6px] border-[#c98a1c] bg-[radial-gradient(circle_at_35%_30%,#fff0a0_0%,#ffd04d_35%,#f2a92e_75%,#d48a1e_100%)] shadow-[0_0_50px_rgba(255,200,60,.35),inset_0_-10px_20px_rgba(160,90,0,.35)]">
      <span className="absolute left-[16%] top-[18%] h-7 w-7 rounded-full bg-[#d8902a]/70 shadow-[inset_2px_3px_4px_rgba(120,60,0,.5)]" />
      <span className="absolute left-[70%] top-[24%] h-4 w-4 rounded-full bg-[#d8902a]/70 shadow-[inset_2px_3px_4px_rgba(120,60,0,.5)]" />
      <span className="absolute left-[20%] top-[66%] h-5 w-5 rounded-full bg-[#d8902a]/70 shadow-[inset_2px_3px_4px_rgba(120,60,0,.5)]" />
      <span className="absolute left-[72%] top-[64%] h-6 w-6 rounded-full bg-[#d8902a]/70 shadow-[inset_2px_3px_4px_rgba(120,60,0,.5)]" />
      <svg viewBox="0 0 100 100" className="absolute inset-[22%]">
        <path d="M18 30 L42 40" stroke="#5a2e00" strokeWidth="6" strokeLinecap="round" />
        <path d="M82 30 L58 40" stroke="#5a2e00" strokeWidth="6" strokeLinecap="round" />
        <circle cx="32" cy="50" r="8" fill="#5a2e00" /><circle cx="68" cy="50" r="8" fill="#5a2e00" />
        <circle cx="34" cy="48" r="2.5" fill="#fff" /><circle cx="70" cy="48" r="2.5" fill="#fff" />
        <path d="M34 78 Q50 66 66 78" stroke="#5a2e00" strokeWidth="6" fill="none" strokeLinecap="round" />
      </svg>
    </div>
  );
}
