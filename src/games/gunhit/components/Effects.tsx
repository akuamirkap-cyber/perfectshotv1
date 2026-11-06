import { Fragment, useMemo } from "react";
import { useSunburstMode, type SunburstMode } from "./sunburstState";

type CSSVars = React.CSSProperties & Record<string, string | number>;

function parseColorToRgb(color: string): [number, number, number] {
  if (color.startsWith("#")) {
    const h = color.replace("#", "");
    if (h.length === 3) {
      return [
        parseInt(h[0] + h[0], 16),
        parseInt(h[1] + h[1], 16),
        parseInt(h[2] + h[2], 16),
      ];
    }
    return [
      parseInt(h.slice(0, 2), 16),
      parseInt(h.slice(2, 4), 16),
      parseInt(h.slice(4, 6), 16),
    ];
  }
  const parts = color.split(",").map((s) => Number(s.trim()));
  return [parts[0] ?? 255, parts[1] ?? 220, parts[2] ?? 120];
}

/**
 * SUNBURST FX LAB (Replika akurat dari Sunburst FX Lab / Stage 1 Gacha)
 * Multi-layer: Halo (blur 24px) + Conic Rays (masking fade pangkal & ekor) +
 * Glow (blur 10px, screen) + Hot-Core (glarePulse) + Bintang latar twinkle
 */
export function SunburstFX({
  size = 520,
  color = "210,192,255",
  intensity = 1,
  className = "",
  style,
  rays = 10,
  speed = 32,
  core = true,
  stars = true,
}: {
  size?: number;
  color?: string;
  intensity?: number;
  className?: string;
  style?: React.CSSProperties;
  rays?: number;
  speed?: number;
  core?: boolean;
  stars?: boolean;
}) {
  const [r, g, b] = useMemo(() => parseColorToRgb(color), [color]);

  // Generate stable ambient stars inside central burst area
  const starDots = useMemo(() => {
    if (!stars) return [];
    return Array.from({ length: 18 }).map((_, i) => {
      const angle = (i / 18) * Math.PI * 2 + (Math.sin(i * 3.7) * 0.4);
      const rad = 15 + ((i * 7) % 35); // 15% to 50% radius
      const x = 50 + Math.cos(angle) * rad;
      const y = 50 + Math.sin(angle) * rad;
      const sz = 1.2 + (i % 3) * 0.7;
      const tw = 2 + (i % 4) * 0.8;
      const dl = (i * 0.35) % 2.5;
      return { x, y, sz, tw, dl };
    });
  }, [stars]);

  const slice = 360 / rays;
  const solid = (slice * 0.5).toFixed(1);
  const rayAlpha = Math.min(0.75, 0.44 * intensity).toFixed(2);
  const conicBg = `repeating-conic-gradient(from 0deg at 50% 50%, rgba(${r},${g},${b},${rayAlpha}) 0deg ${solid}deg, transparent ${solid}deg ${slice.toFixed(1)}deg)`;
  const maskImg = "radial-gradient(circle, transparent 0%, #000 2%, #000 7.5%, transparent 18%)";

  return (
    <div
      className={`pointer-events-none absolute select-none ${className}`}
      style={{
        width: size,
        height: size,
        left: "50%",
        top: "50%",
        marginLeft: -size / 2,
        marginTop: -size / 2,
        ...style,
      }}
    >
      {/* 1. Outer Halo Diffuse (blur 24px) */}
      <div
        className="sunburst-halo"
        style={{
          width: size * 1.35,
          height: size * 1.35,
          background: `radial-gradient(circle, rgba(${r},${g},${b},${Math.min(0.5, 0.32 * intensity)}) 0%, rgba(${r},${g},${b},${Math.min(0.25, 0.14 * intensity)}) 34%, transparent 68%)`,
        }}
      />

      {/* 2. Rotating Conic Rays with Mask (screen blend mode) */}
      <div
        className="sunburst-rays"
        style={{
          width: size * 2.2,
          height: size * 2.2,
          background: conicBg,
          WebkitMaskImage: maskImg,
          maskImage: maskImg,
          animationDuration: `${speed}s`,
        }}
      />

      {/* 3. Mid Glow (screen blend, blur 10px) */}
      {core && (
        <div
          className="sunburst-glow"
          style={{
            width: size * 0.74,
            height: size * 0.74,
            background: `radial-gradient(circle, rgba(${r},${g},${b},${Math.min(1, 0.95 * intensity)}) 0%, rgba(${r},${g},${b},${Math.min(0.7, 0.55 * intensity)}) 26%, rgba(${r},${g},${b},${Math.min(0.3, 0.18 * intensity)}) 48%, transparent 70%)`,
          }}
        />
      )}

      {/* 4. Hot Glare Core (screen blend, blur 5px, glarePulse) */}
      {core && (
        <div
          className="sunburst-hot"
          style={{
            width: size * 0.42,
            height: size * 0.42,
            background: `radial-gradient(circle, rgba(${r},${g},${b},${Math.min(1, 1 * intensity)}) 0%, rgba(${r},${g},${b},${Math.min(0.95, 0.9 * intensity)}) 22%, rgba(${r},${g},${b},${Math.min(0.5, 0.38 * intensity)}) 48%, transparent 72%)`,
          }}
        />
      )}

      {/* 5. Ambient Twinkling Stars */}
      {stars && (
        <div className="absolute inset-0 pointer-events-none">
          {starDots.map((dot, idx) => (
            <div
              key={idx}
              className="star-dot-fx"
              style={{
                left: `${dot.x}%`,
                top: `${dot.y}%`,
                width: `${dot.sz}px`,
                height: `${dot.sz}px`,
                backgroundColor: `rgb(${Math.min(255, r + 40)}, ${Math.min(255, g + 40)}, ${Math.min(255, b + 40)})`,
                boxShadow: `0 0 6px rgba(${r},${g},${b},0.9)`,
                animationDuration: `${dot.tw}s`,
                animationDelay: `${dot.dl}s`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * SUNBURST LAMA / CLASSIC (12 sinar tipis, pendek, terpusat di tengah)
 */
export function ClassicGodRays({
  size = 520,
  color = "215,220,255",
  intensity = 1,
  className = "",
  style,
  core = true,
}: {
  size?: number;
  color?: string;
  intensity?: number;
  className?: string;
  style?: React.CSSProperties;
  core?: boolean;
}) {
  const a1 = Math.min(0.3, 0.21 * intensity);
  const a2 = Math.min(0.22, 0.15 * intensity);
  const mask = "radial-gradient(circle, #000 0%, #000 38%, rgba(0,0,0,.6) 55%, transparent 68%)";
  return (
    <div
      className={`pointer-events-none absolute ${className}`}
      style={{
        width: size,
        height: size,
        left: "50%",
        top: "50%",
        marginLeft: -size / 2,
        marginTop: -size / 2,
        ...style,
      }}
    >
      <div className="rays-in absolute inset-0">
        {/* lapisan utama: 12 sinar tipis */}
        <div
          className="spin-khas absolute inset-0 rounded-full"
          style={{
            background: `repeating-conic-gradient(from -6deg, rgba(${color},${a1}) 0deg 8deg, rgba(${color},0) 8deg 30deg)`,
            WebkitMaskImage: mask,
            maskImage: mask,
          }}
        />
        {/* lapisan offset: kilau halus di celah */}
        <div
          className="spin-khas-rev absolute inset-0 rounded-full"
          style={{
            background: `repeating-conic-gradient(from 9deg, rgba(255,255,255,${a2}) 0deg 5deg, rgba(255,255,255,0) 5deg 30deg)`,
            WebkitMaskImage: mask,
            maskImage: mask,
          }}
        />
        {core && (
          <div
            className="absolute inset-[38%] rounded-full"
            style={{
              background: `radial-gradient(circle, rgba(255,255,255,${Math.min(
                0.7,
                0.5 * intensity
              )}) 0%, rgba(${color},${Math.min(0.35, 0.28 * intensity)}) 45%, rgba(${color},0) 70%)`,
            }}
          />
        )}
      </div>
    </div>
  );
}

/**
 * GOD RAYS / ADAPTIVE SUNBURST
 * Secara otomatis menggunakan mode 'new' (FX Lab) atau 'classic' (Lama),
 * atau dapat diatur via prop 'mode'.
 */
export function GodRays({
  size = 520,
  color = "215,220,255",
  intensity = 1,
  className = "",
  style,
  core = true,
  mode: propMode,
}: {
  size?: number;
  color?: string;
  intensity?: number;
  className?: string;
  style?: React.CSSProperties;
  core?: boolean;
  mode?: SunburstMode;
}) {
  const [globalMode] = useSunburstMode();
  const activeMode = propMode ?? globalMode;

  if (activeMode === "new") {
    return (
      <SunburstFX
        size={size}
        color={color}
        intensity={intensity}
        className={className}
        style={style}
        core={core}
      />
    );
  }

  return (
    <ClassicGodRays
      size={size}
      color={color}
      intensity={intensity}
      className={className}
      style={style}
      core={core}
    />
  );
}


export function Shockwave({ size = 420, color = "rgba(255,255,255,.9)", delay = 0, duration = 0.8 }: { size?: number; color?: string; delay?: number; duration?: number }) {
  return (
    <div
      className="shockwave pointer-events-none absolute left-1/2 top-1/2 rounded-full border-solid"
      style={{ width: size, height: size, borderColor: color, animationDelay: `${delay}s`, animationDuration: `${duration}s`, boxShadow: `0 0 30px ${color}, inset 0 0 30px ${color}` }}
    />
  );
}

export function Flare({ width = 420, delay = 0, color = "255,240,190" }: { width?: number; delay?: number; color?: string }) {
  return (
    <div
      className="flare pointer-events-none absolute left-1/2 top-1/2"
      style={{ width, height: 10, animationDelay: `${delay}s`, borderRadius: 99, background: `radial-gradient(ellipse at center, rgba(255,255,255,1) 0%, rgba(${color},.7) 30%, rgba(${color},0) 70%)`, filter: "blur(1px)" }}
    />
  );
}

const STAR = "M0 -10 L2.6 -3.2 L9.5 -3.1 L4 1.2 L5.9 8.1 L0 4 L-5.9 8.1 L-4 1.2 L-9.5 -3.1 L-2.6 -3.2 Z";

export function Burst({
  count = 16, distance = 170, colors = ["#fff6b0", "#ffd54a", "#ffffff", "#7cf8ff"], delay = 0, size = 14, shape = "star", duration = 0.9,
}: { count?: number; distance?: number; colors?: string[]; delay?: number; size?: number; shape?: "star" | "dot" | "chip"; duration?: number }) {
  const parts = useMemo(
    () => Array.from({ length: count }).map((_, i) => {
      const a = (i / count) * Math.PI * 2 + Math.random() * 0.4;
      const d = distance * (0.55 + Math.random() * 0.6);
      return { dx: Math.cos(a) * d, dy: Math.sin(a) * d, c: colors[i % colors.length], s: size * (0.5 + Math.random() * 0.8), dl: Math.random() * 0.08 };
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [count, distance, size]
  );
  return (
    <div className="pointer-events-none absolute left-1/2 top-1/2 h-0 w-0">
      {parts.map((p, i) => {
        const st: CSSVars = { width: p.s, height: p.s, "--dx": `${p.dx}px`, "--dy": `${p.dy}px`, animationDelay: `${delay + p.dl}s`, animationDuration: `${duration}s` };
        if (shape === "star")
          return (
            <svg key={i} viewBox="-10 -10 20 20" className="burst absolute left-0 top-0" style={{ ...st, filter: `drop-shadow(0 0 4px ${p.c})` }}>
              <path d={STAR} fill={p.c} />
            </svg>
          );
        return (
          <span
            key={i}
            className={`burst absolute left-0 top-0 block ${shape === "dot" ? "rounded-full" : "rounded-[2px]"}`}
            style={{ ...st, background: p.c, boxShadow: shape === "dot" ? `0 0 8px ${p.c}` : undefined, height: shape === "chip" ? p.s * 0.6 : p.s }}
          />
        );
      })}
    </div>
  );
}

export function Confetti({ count = 36, delay = 0 }: { count?: number; delay?: number }) {
  const pieces = useMemo(
    () => Array.from({ length: count }).map((_, i) => ({
      dx: (Math.random() - 0.5) * 420,
      dy: -120 - Math.random() * 280,
      rot: Math.random() * 900 - 450,
      color: ["#ffc83d", "#7cf8ff", "#ff5d8f", "#a970ff", "#4ade80", "#ffffff"][i % 6],
      dl: Math.random() * 0.15,
      w: 7 + Math.random() * 7,
      round: Math.random() > 0.7,
    })),
    [count]
  );
  return (
    <div className="pointer-events-none absolute left-1/2 top-1/2 h-0 w-0">
      {pieces.map((p, i) => (
        <span
          key={i}
          className={`confetti absolute block ${p.round ? "rounded-full" : "rounded-[2px]"}`}
          style={{ width: p.w, height: p.round ? p.w : p.w * 0.45, background: p.color, animationDelay: `${delay + p.dl}s`, "--dx": `${p.dx}px`, "--dy": `${p.dy}px`, "--rot": `${p.rot}deg` } as CSSVars}
        />
      ))}
    </div>
  );
}

export function Sparkle({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="-10 -10 20 20" className={className} style={{ filter: "drop-shadow(0 0 4px #fff)", ...style }}>
      <path d="M0 -10 Q1.2 -1.2 10 0 Q1.2 1.2 0 10 Q-1.2 1.2 -10 0 Q-1.2 -1.2 0 -10 Z" fill="#fff" />
    </svg>
  );
}

export function SparkleField({ count = 8, spread = 1, delay = 0 }: { count?: number; spread?: number; delay?: number }) {
  const s = useMemo(
    () => Array.from({ length: count }).map(() => ({
      l: 50 + (Math.random() - 0.5) * 90 * spread, t: 50 + (Math.random() - 0.5) * 80 * spread,
      d: Math.random() * 1.8, z: 10 + Math.random() * 14,
    })),
    [count, spread]
  );
  return (
    <>
      {s.map((p, i) => (
        <Sparkle key={i} className="twinkle pointer-events-none absolute" style={{ left: `${p.l}%`, top: `${p.t}%`, width: p.z, height: p.z, animationDelay: `${delay + p.d}s` }} />
      ))}
    </>
  );
}

export function Dust({ count = 22 }: { count?: number }) {
  const d = useMemo(
    () => Array.from({ length: count }).map(() => ({
      l: Math.random() * 100, s: 2 + Math.random() * 3, dur: 8 + Math.random() * 10, dl: -Math.random() * 18,
      o: 0.15 + Math.random() * 0.35, sx: (Math.random() - 0.5) * 80,
    })),
    [count]
  );
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {d.map((p, i) => (
        <span
          key={i}
          className="dust absolute block rounded-full bg-cyan-100"
          style={{ left: `${p.l}%`, bottom: -10, width: p.s, height: p.s, animationDuration: `${p.dur}s`, animationDelay: `${p.dl}s`, "--o": p.o, "--sx": `${p.sx}px`, boxShadow: "0 0 6px rgba(200,255,255,.8)" } as CSSVars}
        />
      ))}
    </div>
  );
}

export function LetterPop({ text, delay = 0, step = 0.04, className = "" }: { text: string; delay?: number; step?: number; className?: string }) {
  // Huruf dibungkus per kata (nowrap) dan spasi antar kata dibiarkan di luar grup —
  // baris hanya boleh patah di spasi, tidak di tengah kata
  // (tanpa ini "SPROUTY DEFEATED!" bisa jadi "…DEFEATED / !").
  const words = text.split(" ");
  let k = 0;
  return (
    <span className={className}>
      {words.map((word, w) => (
        <Fragment key={w}>
          {w > 0 ? " " : null}
          <span style={{ whiteSpace: "nowrap" }}>
            {word.split("").map((ch, i) => {
              const idx = k++;
              return (
                <span key={i} className="letter-pop" style={{ animationDelay: `${delay + idx * step}s` }}>{ch}</span>
              );
            })}
          </span>
        </Fragment>
      ))}
    </span>
  );
}

export function GreenButton({
  children, onClick, className = "", style, breathe = true, color = "green",
}: { children: React.ReactNode; onClick?: (e: React.PointerEvent) => void; className?: string; style?: React.CSSProperties; breathe?: boolean; color?: "green" | "gold" }) {
  const pal = color === "green"
    ? "from-[#6ef59a] via-[#2fd06a] to-[#17a34a] border-[#0d6b30] shadow-[0_10px_28px_rgba(34,197,94,.45)]"
    : "from-[#ffe27a] via-[#ffbf2e] to-[#e88c00] border-[#9a5b00] shadow-[0_10px_28px_rgba(255,180,40,.45)]";
  return (
    <div className={breathe ? "btn-breathe" : ""}>
      <button
        onPointerDown={(e) => { e.stopPropagation(); onClick?.(e); }}
        className={`relative overflow-hidden rounded-2xl border-b-[5px] bg-gradient-to-b px-9 py-3 text-2xl font-bold text-white transition-transform active:translate-y-1 active:border-b-[2px] ${pal} ${className}`}
        style={{ textShadow: "0 2px 0 rgba(0,0,0,.25)", ...style }}
      >
        <span className="pointer-events-none absolute inset-x-2 top-1 h-[40%] rounded-xl bg-white/30" />
        <span className="shine-sweep pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-transparent via-white/70 to-transparent" />
        <span className="relative flex items-center justify-center gap-3">{children}</span>
      </button>
    </div>
  );
}
