import { useId } from "react";

/* =====================================================================
   FLAT AVATAR — head only (no neck, no outline), single-tone shapes.
   ===================================================================== */
const SKIN = [
  ["#ffd9b8", "#f4bf98"],
  ["#f2c094", "#e0a678"],
  ["#d9a06f", "#c4895a"],
  ["#b97a4a", "#a1663b"],
  ["#8d5a34", "#774a29"],
  ["#ffe3cf", "#f6cbb0"],
] as const;
const HAIR = ["#2b1a10", "#5a3418", "#121216", "#c48a3a", "#8a2b1a", "#3b2a6b", "#e8d6a8", "#334155"];
const BG = ["#60a5fa", "#f472b6", "#34d399", "#fbbf24", "#a78bfa", "#fb7185", "#22d3ee", "#fb923c"];

export function Avatar({ seed, me = false, className = "", bg = true }: { seed: number; me?: boolean; className?: string; bg?: boolean }) {
  const u = useId().replace(/[^a-zA-Z0-9]/g, "");
  const r = (k: number) => Math.abs(Math.sin(seed * 12.9898 + k * 78.233) * 43758.5453) % 1;
  const [skin, shade] = me ? SKIN[1] : SKIN[Math.floor(r(1) * SKIN.length)];
  const hair = me ? "#2b1a10" : HAIR[Math.floor(r(2) * HAIR.length)];
  const back = me ? "#fbbf24" : BG[Math.floor(r(3) * BG.length)];
  const style = me ? 2 : Math.floor(r(4) * 5); // 0 short, 1 long, 2 spiky, 3 bun, 4 curly
  const glasses = !me && r(5) > 0.7;
  const beard = !me && r(6) > 0.82;
  const cap = !me && r(8) > 0.86;
  const lip = r(7) > 0.5 ? "#c2410c" : "#9f1239";
  return (
    <svg viewBox="0 0 100 100" className={className}>
      <defs>
        <clipPath id={`${u}c`}>
          <circle cx="50" cy="50" r="50" />
        </clipPath>
      </defs>
      <g clipPath={bg ? `url(#${u}c)` : undefined}>
        {bg && (
          <>
            <circle cx="50" cy="50" r="50" fill={back} />
            <circle cx="50" cy="50" r="50" fill="#fff" opacity=".18" transform="translate(-14 -16) scale(.9)" />
          </>
        )}
        {/* hair behind */}
        {style === 1 && <path d="M22 50 Q20 92 36 98 H64 Q80 92 78 50 Z" fill={hair} />}
        {style === 4 && [24, 34, 46, 58, 70, 78].map((x, i) => <circle key={i} cx={x} cy={i % 2 ? 30 : 36} r="13" fill={hair} />)}
        {/* ears */}
        <ellipse cx="24.5" cy="56" rx="6" ry="8" fill={shade} />
        <ellipse cx="75.5" cy="56" rx="6" ry="8" fill={shade} />
        {/* face */}
        <ellipse cx="50" cy="55" rx="26" ry="29" fill={skin} />
        <path d="M50 84 C36 84 26 74 24 60 C30 74 40 78 50 78 C60 78 70 74 76 60 C74 74 64 84 50 84 Z" fill={shade} opacity=".6" />
        {/* hair front */}
        {style === 0 && <path d="M23 52 Q21 22 50 21 Q79 22 77 52 Q70 36 50 37 Q34 36 23 52 Z" fill={hair} />}
        {style === 1 && <path d="M22 56 Q19 18 50 18 Q81 18 78 56 Q72 33 50 33 Q30 33 22 56 Z" fill={hair} />}
        {style === 2 && <path d="M23 49 L27 26 L37 33 L41 15 L50 28 L59 14 L63 32 L73 25 L77 49 Q66 36 50 37 Q36 36 23 49 Z" fill={hair} />}
        {style === 3 && (
          <>
            <circle cx="50" cy="15" r="10" fill={hair} />
            <path d="M23 52 Q22 24 50 24 Q78 24 77 52 Q68 36 50 36 Q34 36 23 52 Z" fill={hair} />
          </>
        )}
        {style === 4 && <path d="M23 50 Q24 30 50 30 Q76 30 77 50 Q66 40 50 40 Q34 40 23 50 Z" fill={hair} />}
        {cap && (
          <>
            <path d="M22 44 Q22 18 50 18 Q78 18 78 44 Z" fill="#dc2626" />
            <path d="M50 44 H86 Q86 49 80 49 H50 Z" fill="#b91c1c" />
            <circle cx="50" cy="19" r="3" fill="#fca5a5" />
          </>
        )}
        {beard && <path d="M26 60 Q28 84 50 86 Q72 84 74 60 Q66 72 50 72 Q34 72 26 60 Z" fill={hair} />}
        {/* brows */}
        <rect x="34" y="45" width="11" height="3" rx="1.5" fill={hair} opacity=".85" />
        <rect x="55" y="45" width="11" height="3" rx="1.5" fill={hair} opacity=".85" />
        {/* eyes */}
        <circle cx="40" cy="55" r="3.6" fill="#1f1530" />
        <circle cx="60" cy="55" r="3.6" fill="#1f1530" />
        <circle cx="41.2" cy="53.8" r="1.2" fill="#fff" />
        <circle cx="61.2" cy="53.8" r="1.2" fill="#fff" />
        {glasses && (
          <>
            <circle cx="40" cy="55" r="8" fill="#93c5fd" opacity=".35" />
            <circle cx="60" cy="55" r="8" fill="#93c5fd" opacity=".35" />
            <rect x="47.5" y="53.8" width="5" height="2.4" rx="1.2" fill="#1f2937" />
          </>
        )}
        {/* cheeks, nose, mouth */}
        <ellipse cx="33" cy="64" rx="5" ry="3" fill="#fb7185" opacity=".35" />
        <ellipse cx="67" cy="64" rx="5" ry="3" fill="#fb7185" opacity=".35" />
        <ellipse cx="50" cy="62" rx="3" ry="2.2" fill={shade} />
        {!beard && <path d="M42 69 Q50 76 58 69 Q50 72 42 69 Z" fill={lip} />}
      </g>
    </svg>
  );
}

/** golden crown used on the champion / player */
export function Crown({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 44" className={className}>
      <defs>
        <linearGradient id="crownG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff3b0" />
          <stop offset=".5" stopColor="#f5b82e" />
          <stop offset="1" stopColor="#c27a00" />
        </linearGradient>
      </defs>
      <path d="M5 14 L18 26 L32 4 L46 26 L59 14 L54 40 H10 Z" fill="url(#crownG)" />
      <rect x="10" y="34" width="44" height="6" fill="#d99a1e" />
      <circle cx="5" cy="13" r="3.4" fill="#fde68a" />
      <circle cx="32" cy="4" r="3.4" fill="#fde68a" />
      <circle cx="59" cy="13" r="3.4" fill="#fde68a" />
      <circle cx="32" cy="27" r="4.2" fill="#ef4444" />
      <circle cx="20" cy="31" r="2.6" fill="#38bdf8" />
      <circle cx="44" cy="31" r="2.6" fill="#22c55e" />
      <path d="M12 30 L18 26 L22 30" stroke="#fff" strokeOpacity=".5" strokeWidth="1.4" fill="none" />
    </svg>
  );
}

/* =====================================================================
   FLAGS (flat) — 3:2 viewBox 0 0 30 20
   ===================================================================== */
export type Country = "ID" | "US" | "JP" | "KR" | "BR" | "GB" | "DE" | "FR" | "MY" | "TH" | "PH" | "VN" | "IN" | "IT" | "ES" | "CA";
export const COUNTRY_CODE: Record<Country, string> = {
  ID: "INA", US: "USA", JP: "JPN", KR: "KOR", BR: "BRA", GB: "GBR", DE: "GER", FR: "FRA",
  MY: "MAS", TH: "THA", PH: "PHI", VN: "VIE", IN: "IND", IT: "ITA", ES: "ESP", CA: "CAN",
};

function FlagBody({ c }: { c: Country }) {
  switch (c) {
    case "ID":
      return (
        <>
          <rect width="30" height="10" fill="#e11d2e" />
          <rect y="10" width="30" height="10" fill="#ffffff" />
        </>
      );
    case "US":
      return (
        <>
          {Array.from({ length: 7 }).map((_, i) => (
            <rect key={i} y={(i * 20) / 6.5} width="30" height={20 / 13} fill="#b91c1c" />
          ))}
          <rect width="30" height="20" fill="#fff" opacity="0" />
          {Array.from({ length: 6 }).map((_, i) => (
            <rect key={`w${i}`} y={(i * 20) / 6.5 + 20 / 13} width="30" height={20 / 13} fill="#ffffff" />
          ))}
          <rect width="13" height="10.8" fill="#1e3a8a" />
          {Array.from({ length: 12 }).map((_, i) => (
            <circle key={`s${i}`} cx={2 + (i % 4) * 3} cy={2 + Math.floor(i / 4) * 3.3} r=".7" fill="#fff" />
          ))}
        </>
      );
    case "JP":
      return (
        <>
          <rect width="30" height="20" fill="#ffffff" />
          <circle cx="15" cy="10" r="6" fill="#dc2626" />
        </>
      );
    case "KR":
      return (
        <>
          <rect width="30" height="20" fill="#ffffff" />
          <path d="M9.5 10 a5.5 5.5 0 0 1 11 0 Z" fill="#dc2626" />
          <path d="M9.5 10 a5.5 5.5 0 0 0 11 0 Z" fill="#1d4ed8" />
          {[
            [4, 4, 35],
            [26, 4, -35],
            [4, 16, -35],
            [26, 16, 35],
          ].map(([x, y, a], i) => (
            <rect key={i} x={x - 2} y={y - 1.5} width="4" height="3" fill="#111" transform={`rotate(${a} ${x} ${y})`} />
          ))}
        </>
      );
    case "BR":
      return (
        <>
          <rect width="30" height="20" fill="#16a34a" />
          <path d="M15 2.5 L27 10 L15 17.5 L3 10 Z" fill="#facc15" />
          <circle cx="15" cy="10" r="4.6" fill="#1e3a8a" />
          <path d="M10.6 9 Q15 7.6 19.4 10.4" stroke="#fff" strokeWidth=".9" fill="none" />
        </>
      );
    case "GB":
      return (
        <>
          <rect width="30" height="20" fill="#1e3a8a" />
          <path d="M0 0 L30 20 M30 0 L0 20" stroke="#fff" strokeWidth="4" />
          <path d="M0 0 L30 20 M30 0 L0 20" stroke="#dc2626" strokeWidth="1.6" />
          <path d="M15 0 V20 M0 10 H30" stroke="#fff" strokeWidth="6" />
          <path d="M15 0 V20 M0 10 H30" stroke="#dc2626" strokeWidth="3.4" />
        </>
      );
    case "DE":
      return (
        <>
          <rect width="30" height="6.7" fill="#111" />
          <rect y="6.6" width="30" height="6.8" fill="#dc2626" />
          <rect y="13.3" width="30" height="6.7" fill="#facc15" />
        </>
      );
    case "FR":
      return (
        <>
          <rect width="10" height="20" fill="#1d4ed8" />
          <rect x="10" width="10" height="20" fill="#fff" />
          <rect x="20" width="10" height="20" fill="#dc2626" />
        </>
      );
    case "IT":
      return (
        <>
          <rect width="10" height="20" fill="#16a34a" />
          <rect x="10" width="10" height="20" fill="#fff" />
          <rect x="20" width="10" height="20" fill="#dc2626" />
        </>
      );
    case "MY":
      return (
        <>
          {Array.from({ length: 7 }).map((_, i) => (
            <rect key={i} y={(i * 20) / 7} width="30" height={10 / 7} fill="#dc2626" />
          ))}
          {Array.from({ length: 7 }).map((_, i) => (
            <rect key={`w${i}`} y={(i * 20) / 7 + 10 / 7} width="30" height={10 / 7} fill="#fff" />
          ))}
          <rect width="15" height="11.4" fill="#1e3a8a" />
          <circle cx="6.2" cy="5.7" r="3.6" fill="#facc15" />
          <circle cx="7.4" cy="5.7" r="3" fill="#1e3a8a" />
          <path d="M11.4 5.7 l.6 1.6 -1.6 -1 h2 l-1.6 1 Z" fill="#facc15" />
        </>
      );
    case "TH":
      return (
        <>
          <rect width="30" height="20" fill="#dc2626" />
          <rect y="3.3" width="30" height="13.4" fill="#fff" />
          <rect y="6.7" width="30" height="6.6" fill="#1e3a8a" />
        </>
      );
    case "PH":
      return (
        <>
          <rect width="30" height="10" fill="#1d4ed8" />
          <rect y="10" width="30" height="10" fill="#dc2626" />
          <path d="M0 0 L14 10 L0 20 Z" fill="#fff" />
          <circle cx="4.6" cy="10" r="2" fill="#facc15" />
        </>
      );
    case "VN":
      return (
        <>
          <rect width="30" height="20" fill="#dc2626" />
          <path d="M15 4.5 L16.6 9.2 H21.4 L17.5 12 L19 16.6 L15 13.8 L11 16.6 L12.5 12 L8.6 9.2 H13.4 Z" fill="#facc15" />
        </>
      );
    case "IN":
      return (
        <>
          <rect width="30" height="6.7" fill="#f97316" />
          <rect y="6.6" width="30" height="6.8" fill="#fff" />
          <rect y="13.3" width="30" height="6.7" fill="#16a34a" />
          <circle cx="15" cy="10" r="2.4" fill="none" stroke="#1e3a8a" strokeWidth=".8" />
        </>
      );
    case "ES":
      return (
        <>
          <rect width="30" height="20" fill="#dc2626" />
          <rect y="5" width="30" height="10" fill="#facc15" />
        </>
      );
    case "CA":
      return (
        <>
          <rect width="30" height="20" fill="#fff" />
          <rect width="7.5" height="20" fill="#dc2626" />
          <rect x="22.5" width="7.5" height="20" fill="#dc2626" />
          <path d="M15 4 L16.4 7.4 L18.6 6.6 L17.8 10.4 L20 10 L18.6 12.2 L19.4 13 L15.6 13.6 L15.6 16 H14.4 V13.6 L10.6 13 L11.4 12.2 L10 10 L12.2 10.4 L11.4 6.6 L13.6 7.4 Z" fill="#dc2626" />
        </>
      );
  }
}

/** rounded flag chip */
export function Flag({ c, className = "", round = false }: { c: Country; className?: string; round?: boolean }) {
  const u = useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <svg viewBox={round ? "5 0 20 20" : "0 0 30 20"} className={className}>
      <defs>
        <clipPath id={`${u}f`}>{round ? <circle cx="15" cy="10" r="10" /> : <rect width="30" height="20" rx="3.5" />}</clipPath>
        <linearGradient id={`${u}g`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".3" />
          <stop offset=".5" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity=".12" />
        </linearGradient>
      </defs>
      <g clipPath={`url(#${u}f)`}>
        <FlagBody c={c} />
        <rect width="30" height="20" fill={`url(#${u}g)`} />
      </g>
    </svg>
  );
}

/** circular avatar with a round flag bubble on its edge */
export function ProfileCircle({ seed, me = false, country, size, ring }: { seed: number; me?: boolean; country: Country; size: number; ring: string }) {
  const fs = Math.round(size * 0.36);
  return (
    <span className="relative inline-block shrink-0" style={{ width: size, height: size }}>
      <span className="absolute inset-0 rounded-full" style={{ background: ring, padding: Math.max(2, size * 0.05) }}>
        <Avatar seed={seed} me={me} className="h-full w-full" />
      </span>
      <span className="absolute -bottom-[2%] -right-[4%] rounded-full bg-white p-[2px] shadow-[0_2px_4px_rgba(0,0,0,.35)]" style={{ width: fs, height: fs }}>
        <Flag c={country} round className="h-full w-full" />
      </span>
    </span>
  );
}
