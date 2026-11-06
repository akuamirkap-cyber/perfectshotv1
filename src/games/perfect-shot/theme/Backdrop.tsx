import { memo, useEffect, useMemo, useState, type CSSProperties } from "react";
import type { Particle, SkyKind, Theme } from "./themes";

const VW = 476;
const VH = 847;

function rng(seed: number) {
  let s = seed % 233280;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

type Sky = { d: string; caps?: string; lights?: [number, number, number, number][] };

/** procedural silhouette strip. base = ground y, h = max height */
export function skyline(kind: SkyKind, seed: number, base: number, h: number): Sky {
  const r = rng(seed);
  let d = `M-10 ${VH} L-10 ${base}`;
  let caps = "";
  const lights: [number, number, number, number][] = [];
  let x = -10;
  const end = VW + 10;
  switch (kind) {
    case "hills": {
      for (x = -10; x <= end; x += 12) {
        const y = base - h * (0.45 + 0.3 * Math.sin(x * 0.011 + seed) + 0.2 * Math.sin(x * 0.033 + seed * 2));
        d += ` L${x} ${y.toFixed(1)}`;
      }
      break;
    }
    case "trees": {
      while (x < end) {
        const w = 26 + r() * 30;
        const hh = h * (0.5 + r() * 0.5);
        d += ` L${x} ${base - hh * 0.5} Q${x} ${base - hh} ${x + w / 2} ${base - hh} Q${x + w} ${base - hh} ${x + w} ${base - hh * 0.5}`;
        x += w * (0.55 + r() * 0.3);
      }
      break;
    }
    case "pines": {
      while (x < end) {
        const w = 22 + r() * 22;
        const hh = h * (0.5 + r() * 0.5);
        d += ` L${x} ${base - hh * 0.15} L${x + w / 2} ${base - hh} L${x + w} ${base - hh * 0.15}`;
        caps += `M${x + w / 2} ${base - hh} L${x + w * 0.36} ${base - hh * 0.72} L${x + w * 0.5} ${base - hh * 0.78} L${x + w * 0.64} ${base - hh * 0.72} Z `;
        x += w * (0.6 + r() * 0.25);
      }
      break;
    }
    case "mountains": {
      while (x < end) {
        const w = 90 + r() * 90;
        const hh = h * (0.55 + r() * 0.45);
        const px = x + w / 2;
        d += ` L${px} ${base - hh} L${x + w} ${base - h * 0.2}`;
        caps += `M${px} ${base - hh} L${px - w * 0.14} ${base - hh * 0.74} L${px - w * 0.04} ${base - hh * 0.8} L${px + w * 0.05} ${base - hh * 0.7} L${px + w * 0.14} ${base - hh * 0.76} Z `;
        x += w * 0.7;
      }
      break;
    }
    case "neonMtn": {
      while (x < end) {
        const w = 70 + r() * 70;
        const hh = h * (0.4 + r() * 0.6);
        d += ` L${x + w / 2} ${base - hh} L${x + w} ${base}`;
        caps += `M${x} ${base} L${x + w / 2} ${base - hh} L${x + w} ${base} M${x + w / 2} ${base - hh} L${x + w / 2} ${base} `;
        x += w * 0.75;
      }
      break;
    }
    case "houses": {
      while (x < end) {
        const w = 34 + r() * 30;
        const wh = h * (0.35 + r() * 0.4);
        const roof = 12 + r() * 16;
        d += ` L${x} ${base - wh} L${x + w / 2} ${base - wh - roof} L${x + w} ${base - wh}`;
        if (r() > 0.5) d += ` L${x + w * 0.78} ${base - wh} L${x + w * 0.78} ${base - wh - roof - 6} L${x + w * 0.9} ${base - wh - roof - 6} L${x + w * 0.9} ${base - wh}`;
        for (let k = 0; k < 2; k++) if (r() > 0.35) lights.push([x + 6 + k * (w * 0.45), base - wh + 8 + r() * (wh * 0.3), 7, 9]);
        x += w + 2;
      }
      break;
    }
    case "city": {
      while (x < end) {
        const w = 24 + r() * 30;
        const hh = h * (0.35 + r() * 0.65);
        d += ` L${x} ${base - hh} L${x + w} ${base - hh}`;
        if (r() > 0.6) d += ` L${x + w * 0.55} ${base - hh} L${x + w * 0.55} ${base - hh - 18} L${x + w * 0.6} ${base - hh - 18} L${x + w * 0.6} ${base - hh}`;
        for (let yy = base - hh + 8; yy < base - 6; yy += 11)
          for (let xx = x + 4; xx < x + w - 5; xx += 7) if (r() > 0.55) lights.push([xx, yy, 3, 5]);
        d += ` L${x + w} ${base}`;
        x += w + 1;
        d += ` L${x} ${base}`;
      }
      break;
    }
    case "ruins": {
      while (x < end) {
        const w = 30 + r() * 40;
        const hh = h * (0.3 + r() * 0.7);
        d += ` L${x} ${base - hh}`;
        for (let k = 1; k <= 4; k++) d += ` L${x + (w * k) / 4} ${base - hh + (r() - 0.3) * 26}`;
        d += ` L${x + w} ${base - h * 0.15}`;
        x += w + r() * 10;
        d += ` L${x} ${base - h * 0.15}`;
      }
      break;
    }
    case "crystals": {
      while (x < end) {
        const w = 18 + r() * 26;
        const hh = h * (0.35 + r() * 0.65);
        const lean = (r() - 0.5) * 18;
        d += ` L${x} ${base - hh * 0.3} L${x + w / 2 + lean} ${base - hh} L${x + w} ${base - hh * 0.3}`;
        caps += `M${x + w / 2 + lean} ${base - hh} L${x + w * 0.62} ${base - hh * 0.3} L${x + w / 2} ${base - hh * 0.3} Z `;
        x += w * (0.5 + r() * 0.4);
      }
      break;
    }
    case "domes": {
      while (x < end) {
        const w = 44 + r() * 46;
        const bh = h * (0.25 + r() * 0.3);
        d += ` L${x} ${base - bh} A${w / 2} ${w * 0.52} 0 0 1 ${x + w} ${base - bh}`;
        caps += `M${x + w / 2 - 1.5} ${base - bh - w * 0.52 - 16} h3 v16 h-3 Z `;
        if (r() > 0.45) {
          const mx = x + w + 3;
          const mh = bh + h * 0.4;
          d += ` L${mx} ${base - bh} L${mx} ${base - mh} L${mx + 4} ${base - mh - 12} L${mx + 8} ${base - mh} L${mx + 8} ${base - bh}`;
          x += 11;
        }
        x += w + 4;
      }
      break;
    }
    case "rocks": {
      while (x < end) {
        const w = 40 + r() * 60;
        const hh = h * (0.2 + r() * 0.5);
        d += ` L${x + w * 0.3} ${base - hh} L${x + w * 0.7} ${base - hh * 0.8} L${x + w} ${base - hh * 0.1}`;
        x += w * 0.85;
      }
      break;
    }
    case "none":
      return { d: "" };
  }
  d += ` L${end} ${base} L${end} ${VH} Z`;
  return { d, caps, lights };
}

/* ---------------- particles ---------------- */
const PT_CLASS: Record<Particle, string> = {
  firefly: "firefly",
  snow: "pt-fall",
  ember: "pt-rise",
  star: "pt-twinkle",
  rain: "pt-rain",
  pollen: "pt-drift",
  spark: "pt-twinkle",
};

function Particles({ type, color, maxTop = 100, seed = 7 }: { type: Particle; color: string; maxTop?: number; seed?: number }) {
  const list = useMemo(() => {
    const r = rng(seed * 131 + type.length * 17);
    const n = type === "star" ? 34 : type === "rain" ? 30 : type === "snow" ? 34 : 22;
    return Array.from({ length: n }, () => ({
      l: r() * 100,
      t: type === "ember" ? 100 : type === "snow" || type === "rain" ? -5 : r() * maxTop,
      s: type === "star" ? 1.5 + r() * 2.5 : type === "snow" ? 3 + r() * 5 : 2.5 + r() * 4,
      dur: type === "rain" ? 0.7 + r() * 0.5 : type === "snow" ? 6 + r() * 6 : type === "ember" ? 4 + r() * 4 : 3 + r() * 5,
      dl: -r() * 10,
      px: (r() - 0.5) * 80,
    }));
  }, [type, maxTop, seed]);
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {list.map((p, i) => {
        const base: CSSProperties = {
          left: `${p.l}%`,
          top: `${p.t}%`,
          ["--pd" as string]: `${p.dur}s`,
          ["--pdl" as string]: `${p.dl}s`,
          ["--px" as string]: `${p.px}px`,
          ["--fd" as string]: `${p.dur + 2}s`,
          ["--fdl" as string]: `${p.dl}s`,
          ["--fx" as string]: `${p.px * 0.3}px`,
          ["--fy" as string]: "-18px",
        };
        if (type === "rain")
          return <span key={i} className={`${PT_CLASS[type]} absolute`} style={{ ...base, width: 1.5, height: 18, background: `linear-gradient(${color}00, ${color})` }} />;
        if (type === "spark")
          return (
            <span key={i} className={`${PT_CLASS[type]} absolute`} style={{ ...base, width: p.s * 2, height: p.s * 2, background: color, clipPath: "polygon(50% 0,62% 38%,100% 50%,62% 62%,50% 100%,38% 62%,0 50%,38% 38%)", filter: `drop-shadow(0 0 4px ${color})` }} />
          );
        return (
          <span
            key={i}
            className={`${PT_CLASS[type]} absolute rounded-full`}
            style={{ ...base, width: p.s, height: p.s, background: color, boxShadow: type === "snow" ? "none" : `0 0 ${p.s * 2}px ${p.s * 0.6}px ${color}aa` }}
          />
        );
      })}
    </div>
  );
}

/* ---------------- sky features ---------------- */
function Features({ t, horizonY }: { t: Theme; horizonY: number }) {
  const f = t.features;
  return (
    <>
      {f.includes("aurora") && (
        <div className="aurora pointer-events-none absolute inset-x-[-20%] top-[4%] h-[30%] opacity-70" style={{ background: `linear-gradient(100deg, transparent 10%, ${t.pc}55 30%, #a78bfa55 50%, ${t.pc}44 70%, transparent 90%)`, filter: "blur(18px)" }} />
      )}
      <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="xMidYMid slice">
        <defs>
          <radialGradient id={`sun-${t.id}`}>
            <stop offset="0" stopColor="#fffbe6" />
            <stop offset="0.55" stopColor="#ffe08a" />
            <stop offset="1" stopColor="#ffb85c" />
          </radialGradient>
          <linearGradient id={`ns-${t.id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffe14a" />
            <stop offset="0.6" stopColor="#ff5aa8" />
            <stop offset="1" stopColor="#b01fd0" />
          </linearGradient>
          <radialGradient id={`pl-${t.id}`} cx="0.35" cy="0.35">
            <stop offset="0" stopColor="#ffd0f0" />
            <stop offset="0.6" stopColor="#c05ad0" />
            <stop offset="1" stopColor="#3a0f5a" />
          </radialGradient>
          <filter id={`bl-${t.id}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="22" />
          </filter>
        </defs>
        {f.includes("sun") && (
          <g>
            <circle cx="350" cy={horizonY - 120} r="110" fill="#fff3c4" opacity="0.35" filter={`url(#bl-${t.id})`} />
            <circle cx="350" cy={horizonY - 120} r="52" fill={`url(#sun-${t.id})`} />
          </g>
        )}
        {f.includes("moon") && (
          <g>
            <circle cx="360" cy={Math.max(110, horizonY - 230)} r="90" fill={t.glow} opacity="0.35" filter={`url(#bl-${t.id})`} />
            <circle cx="360" cy={Math.max(110, horizonY - 230)} r="40" fill="#fdf6dc" />
            <circle cx="347" cy={Math.max(110, horizonY - 230) - 10} r="8" fill="#e8dcb4" />
            <circle cx="372" cy={Math.max(110, horizonY - 230) + 12} r="6" fill="#e8dcb4" />
            <circle cx="366" cy={Math.max(110, horizonY - 230) - 18} r="4" fill="#e8dcb4" />
          </g>
        )}
        {f.includes("neonSun") && (
          <g>
            <circle cx="238" cy={horizonY - 70} r="150" fill="#ff3ea5" opacity="0.35" filter={`url(#bl-${t.id})`} />
            <circle cx="238" cy={horizonY - 70} r="92" fill={`url(#ns-${t.id})`} />
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <rect key={i} x="130" y={horizonY - 70 + 6 + i * 13} width="216" height={2 + i * 1.4} fill={t.sky[1]} />
            ))}
          </g>
        )}
        {f.includes("planets") && (
          <g>
            <ellipse cx="140" cy="230" rx="160" ry="90" fill="#ff5ad0" opacity="0.28" filter={`url(#bl-${t.id})`} />
            <ellipse cx="330" cy="140" rx="140" ry="80" fill="#5a7cff" opacity="0.25" filter={`url(#bl-${t.id})`} />
            <circle cx="360" cy={Math.max(120, horizonY - 200)} r="48" fill={`url(#pl-${t.id})`} />
            <ellipse cx="360" cy={Math.max(120, horizonY - 200)} rx="82" ry="16" fill="none" stroke="#ffd0f0" strokeWidth="5" opacity="0.8" transform={`rotate(-16 360 ${Math.max(120, horizonY - 200)})`} />
            <circle cx="92" cy={Math.max(80, horizonY - 120)} r="16" fill="#7dd3fc" />
          </g>
        )}
        {f.includes("fire") && <ellipse cx="238" cy={horizonY + 10} rx="320" ry="110" fill="#ff7a2f" opacity="0.4" filter={`url(#bl-${t.id})`} />}
      </svg>
      {f.includes("clouds") && (
        <div className="pointer-events-none absolute inset-x-0 top-[6%] h-[30%]">
          {[
            { l: 6, t: 20, s: 1 },
            { l: 58, t: 6, s: 0.8 },
            { l: 30, t: 55, s: 0.65 },
          ].map((c, i) => (
            <div key={i} className="cloud-drift absolute" style={{ left: `${c.l}%`, top: `${c.t}%`, transform: `scale(${c.s})`, ["--cd" as string]: `${40 + i * 12}s` }}>
              <div className="relative h-10 w-36">
                <span className="absolute bottom-0 left-0 h-7 w-36 rounded-full bg-white/80" />
                <span className="absolute bottom-3 left-6 h-12 w-14 rounded-full bg-white/80" />
                <span className="absolute bottom-2 left-16 h-10 w-12 rounded-full bg-white/80" />
              </div>
            </div>
          ))}
        </div>
      )}
      {f.includes("fog") && (
        <div className="pointer-events-none absolute inset-x-0" style={{ top: horizonY / VH * 100 - 12 + "%", height: "26%" }}>
          <div className="fog-drift absolute inset-y-0 left-[-30%] w-[160%]" style={{ background: `radial-gradient(ellipse 30% 50% at 30% 50%, ${t.glow}44, transparent 70%), radial-gradient(ellipse 25% 40% at 75% 60%, ${t.glow}33, transparent 70%)` }} />
        </div>
      )}
      {f.includes("runes") && (
        <div className="pointer-events-none absolute inset-0">
          {["ᚠ", "ᚱ", "ᛟ", "ᚨ", "ᛉ"].map((ch, i) => (
            <span key={i} className="firefly font-title absolute text-xl" style={{ left: `${12 + i * 19}%`, top: `${18 + ((i * 37) % 30)}%`, color: t.pc, textShadow: `0 0 10px ${t.pc}`, ["--fd" as string]: `${6 + i}s`, ["--fdl" as string]: `${-i}s` } as CSSProperties}>
              {ch}
            </span>
          ))}
        </div>
      )}
    </>
  );
}

/* ---------------- main ---------------- */
type Props = { theme: Theme; horizon?: number; groundFade?: boolean };

export const Backdrop = memo(function Backdrop({ theme: t, horizon, groundFade = true }: Props) {
  const sky = horizon !== undefined;
  const hy = sky ? horizon * VH : VH * 0.66;
  const far = useMemo(() => skyline(t.far.kind, 11, sky ? hy : hy, sky ? 70 : 150), [t.far.kind, sky, hy]);
  const near = useMemo(() => (sky ? null : skyline(t.near.kind, 29, VH * 0.84, 210)), [t.near.kind, sky]);
  const gridFloor = !sky && (t.floor.kind === "grid");

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${t.sky[0]} 0%, ${t.sky[1]} ${sky ? horizon! * 70 : 45}%, ${t.sky[2]} ${sky ? horizon! * 100 + 2 : 100}%)` }} />
      <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse 70% 45% at 50% ${sky ? horizon! * 100 : 52}%, ${t.glow}66, transparent 70%)` }} />
      <Features t={t} horizonY={hy} />

      <svg className="absolute inset-0 h-full w-full" viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="xMidYMid slice">
        {/* far skyline */}
        {far.d && <path d={far.d} fill={t.far.color} opacity={sky ? 0.9 : 0.85} />}
        {far.caps && <path d={far.caps} fill={t.far.kind === "neonMtn" ? "none" : "#ffffff"} stroke={t.far.kind === "neonMtn" ? t.accent : "none"} strokeWidth="1.5" opacity={t.far.kind === "crystals" ? 0.25 : 0.7} />}
        {far.lights?.map((l, i) => <rect key={i} x={l[0]} y={l[1]} width={l[2] * (sky ? 0.6 : 1)} height={l[3] * (sky ? 0.6 : 1)} fill={t.pc} opacity="0.7" />)}

        {!sky && (
          <>
            {t.trunks && (
              <g>
                <g stroke={t.near.color} strokeWidth="9" strokeLinecap="round" fill="none" opacity="0.9">
                  <path d="M60 470 L135 395" />
                  <path d="M40 160 L140 60" />
                  <path d="M410 430 L340 400" />
                  <path d="M400 150 L460 110" />
                </g>
                <path d="M0 0 H52 C46 200 58 420 48 847 H0 Z" fill={t.near.color} />
                <path d="M476 0 H418 C428 260 412 520 430 847 H476 Z" fill={t.near.color} />
              </g>
            )}
            {gridFloor && (
              <g opacity="0.85">
                <rect x="0" y={hy} width={VW} height={VH - hy} fill={t.floor.b} />
                {Array.from({ length: 9 }).map((_, i) => {
                  const y = hy + Math.pow(i / 8, 2) * (VH - hy);
                  return <line key={`h${i}`} x1="0" x2={VW} y1={y} y2={y} stroke={t.floor.line} strokeWidth={1 + i * 0.3} opacity={0.3 + i * 0.08} />;
                })}
                {Array.from({ length: 13 }).map((_, i) => (
                  <line key={`v${i}`} x1={VW / 2} y1={hy} x2={-400 + i * 106} y2={VH} stroke={t.floor.line} strokeWidth="1.2" opacity="0.6" />
                ))}
              </g>
            )}
            {near?.d && !t.trunks && <path d={near.d} fill={t.near.color} />}
            {near?.caps && !t.trunks && <path d={near.caps} fill="#ffffff" opacity={t.near.kind === "crystals" ? 0.18 : 0.85} />}
            {near?.lights?.map((l, i) => <rect key={i} x={l[0]} y={l[1]} width={l[2]} height={l[3]} fill={t.pc} opacity="0.9" />)}
          </>
        )}
      </svg>

      <Particles type={t.particle} color={t.pc} maxTop={sky ? horizon! * 100 : 85} />

      {!sky && groundFade && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[30%]" style={{ background: `linear-gradient(180deg, transparent, ${t.near.kind === "none" ? t.floor.b : t.near.color}cc)` }} />
      )}
      {!sky && <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,.5) 100%)" }} />}
    </div>
  );
});

/** cross-fades between themes when the theme changes */
export function ThemeLayer({ theme, horizon }: { theme: Theme; horizon?: number }) {
  const [layers, setLayers] = useState<Theme[]>([theme]);
  useEffect(() => {
    setLayers((l) => (l[l.length - 1].id === theme.id ? l : [l[l.length - 1], theme]));
  }, [theme]);
  return (
    <>
      {layers.map((t, i) => (
        <div key={t.id} className={`absolute inset-0 ${i === layers.length - 1 && layers.length > 1 ? "th-fade" : ""}`}>
          <Backdrop theme={t} horizon={horizon} />
        </div>
      ))}
    </>
  );
}
