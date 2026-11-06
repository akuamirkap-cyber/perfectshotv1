import { useLayoutEffect, useRef, type CSSProperties } from "react";
import { Confetti } from "./Bits";
import { Bow } from "../gift/GiftArt";
import { PodiumMedal } from "../rank/Medal";

export type OverlayPhase = "idle" | "cover" | "reveal";
export type OverlayVariant = "iris" | "shutter" | "ribbon" | "cloud" | "scope" | "wrap" | "fade" | "none" | "podium";

type Props = {
  phase: OverlayPhase;
  origin: { x: number; y: number };
  label: string;
  variant?: OverlayVariant;
  rate?: number;
  /** radius (px) the scope lens frames when it closes — lets a host game aim at its own target size */
  lens?: number;
};

const HAZARD = "repeating-linear-gradient(-45deg, #ffd23f 0 14px, #17131f 14px 28px)";
const STEEL =
  "repeating-linear-gradient(0deg, rgba(255,255,255,.035) 0 2px, transparent 2px 26px), linear-gradient(180deg, #3d3160 0%, #2a2046 55%, #1d1533 100%)";

function Rivets({ y }: { y: string }) {
  return (
    <div className="absolute inset-x-5 flex justify-between" style={{ top: y }}>
      {Array.from({ length: 9 }).map((_, i) => (
        <span
          key={i}
          className="h-2.5 w-2.5 rounded-full"
          style={{ background: "radial-gradient(circle at 35% 30%, #cfc6e8, #5d4f86 60%, #241a3d)", boxShadow: "0 1px 1px rgba(0,0,0,.6)" }}
        />
      ))}
    </div>
  );
}

function Shutter({ phase, label }: { phase: OverlayPhase; label: string }) {
  const cover = phase === "cover";
  return (
    <div className={`absolute inset-0 z-50 overflow-hidden ${cover ? "shut-shake" : ""}`}>
      {/* top door */}
      <div
        className={`absolute inset-x-0 top-0 h-[calc(50%+2px)] ${cover ? "shut-top-in" : "shut-top-out"}`}
        style={{ background: STEEL, boxShadow: "0 10px 30px rgba(0,0,0,.6)" }}
      >
        <Rivets y="18px" />
        <div className="absolute inset-x-0 top-[38%] h-[3px] bg-black/30" />
        <div className="absolute inset-x-0 top-[62%] h-[3px] bg-black/30" />
        <div className="absolute inset-x-0 bottom-[22px] h-[3px] bg-white/10" />
        <div className="absolute inset-x-0 bottom-0 h-[22px] border-t-2 border-black/50" style={{ background: HAZARD }} />
      </div>
      {/* bottom door */}
      <div
        className={`absolute inset-x-0 bottom-0 h-[calc(50%+2px)] ${cover ? "shut-bot-in" : "shut-bot-out"}`}
        style={{ background: STEEL, boxShadow: "0 -10px 30px rgba(0,0,0,.6)" }}
      >
        <div className="absolute inset-x-0 top-0 h-[22px] border-b-2 border-black/50" style={{ background: HAZARD }} />
        <div className="absolute inset-x-0 top-[38%] h-[3px] bg-black/30" />
        <div className="absolute inset-x-0 top-[62%] h-[3px] bg-black/30" />
        <Rivets y="calc(100% - 30px)" />
        <div className="font-title absolute inset-x-0 top-[96px] text-center text-xl tracking-[0.45em] text-white/70">{label}</div>
      </div>

      {/* slam spark line */}
      {cover && (
        <div
          className="shut-spark absolute inset-x-0 top-1/2 h-[6px] -translate-y-1/2"
          style={{ background: "linear-gradient(90deg, transparent, #fff7c2, #ffd23f, #fff7c2, transparent)", boxShadow: "0 0 24px 6px rgba(255,210,63,.7)" }}
        />
      )}

      {/* emblem lock */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className={cover ? "shut-emblem-in" : "shut-emblem-out"}>
          <div
            className="relative grid h-28 w-28 place-items-center rounded-full"
            style={{
              background: "radial-gradient(circle at 35% 30%, #6b5a9c, #2a2046 70%)",
              boxShadow: "0 0 0 6px #17131f, 0 0 0 9px #ffd23f, 0 0 30px 8px rgba(255,210,63,.35), inset 0 4px 10px rgba(255,255,255,.2)",
            }}
          >
            <svg viewBox="0 0 100 100" className="h-20 w-20">
              <circle cx="50" cy="50" r="36" fill="none" stroke="#3fdc72" strokeWidth="4" />
              <path d="M50 6 V28 M50 72 V94 M6 50 H28 M72 50 H94" stroke="#ffd23f" strokeWidth="5" strokeLinecap="round" />
              <circle cx="50" cy="50" r="5" fill="#ff5a3d" />
            </svg>
            {[
              { x: "0px", y: "-58px", bx: "0px", by: "-30px" },
              { x: "58px", y: "0px", bx: "30px", by: "0px" },
              { x: "0px", y: "58px", bx: "0px", by: "30px" },
              { x: "-58px", y: "0px", bx: "-30px", by: "0px" },
            ].map((b, i) => (
              <span
                key={i}
                className={`absolute h-4 w-4 rounded-sm ${cover ? "shut-bolt-in" : ""}`}
                style={
                  {
                    transform: "none",
                    left: `calc(50% - 8px + ${b.x})`,
                    top: `calc(50% - 8px + ${b.y})`,
                    background: "linear-gradient(#f5f8fb, #7d8994)",
                    boxShadow: "0 0 0 2px #17131f",
                    "--bx": b.bx,
                    "--by": b.by,
                    "--bd": `${560 + i * 40}ms`,
                  } as CSSProperties
                }
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- ROYAL BANNER (achievement) ---------------- */
const BANNER_COLORS = [
  ["#3b82f6", "#1e3a8a"],
  ["#fbbf24", "#c2410c"],
];

function Ribbon({ phase, label }: { phase: OverlayPhase; label: string }) {
  const cover = phase === "cover";
  const N = 6;
  return (
    <div className={`absolute inset-0 z-50 overflow-hidden ${cover ? "rb-shake" : ""}`}>
      {cover && <div className="absolute inset-0 studio-fade-in bg-black/40" />}
      {Array.from({ length: N }).map((_, i) => {
        const [a, b] = BANNER_COLORS[i % 2];
        const fromCenter = Math.abs(i - (N - 1) / 2);
        return (
          <div
            key={i}
            className={`absolute top-0 ${cover ? "rb-in" : "rb-out"}`}
            style={
              {
                left: `calc(${(i * 100) / N}% - 1px)`,
                width: `calc(${100 / N}% + 2px)`,
                height: "calc(100% + 48px)",
                "--rd": `${cover ? i * 34 : fromCenter * 60}ms`,
              } as CSSProperties
            }
          >
            <div
              className="relative h-full w-full"
              style={{
                background: `linear-gradient(90deg, rgba(0,0,0,.25), transparent 18%, rgba(255,255,255,.12) 50%, transparent 82%, rgba(0,0,0,.3)), linear-gradient(180deg, ${a}, ${b})`,
                clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% calc(100% - 38px), 0 100%)",
                boxShadow: "inset 3px 0 0 #fde68a, inset -3px 0 0 #fde68a",
              }}
            >
              <div className="absolute inset-x-0 top-0 h-3 bg-gradient-to-b from-[#7c2d12] to-[#b45309]" />
              <div className="absolute bottom-[96px] left-1/2 -translate-x-1/2 text-xl text-[#fde68a] drop-shadow-[0_2px_0_rgba(0,0,0,.4)]">{i % 2 ? "★" : "✦"}</div>
            </div>
          </div>
        );
      })}

      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        {cover && (
          <div className="rb-wave absolute left-1/2 top-1/2 -ml-24 -mt-24 h-48 w-48 rounded-full border-[6px] border-[#fde68a] shadow-[0_0_30px_rgba(253,230,138,.8)]" />
        )}
        <div className={cover ? "rb-medal-in" : "rb-medal-out"}>
          <div className="rb-swing flex flex-col items-center">
            <div className="relative">
              {/* ribbon tails */}
              <div className="absolute left-1/2 top-[70%] flex -translate-x-1/2 gap-3">
                <span className="h-16 w-7 bg-gradient-to-b from-[#ef4444] to-[#991b1b]" style={{ clipPath: "polygon(0 0,100% 0,100% 100%,50% 78%,0 100%)", transform: "rotate(14deg)" }} />
                <span className="h-16 w-7 bg-gradient-to-b from-[#3b82f6] to-[#1e3a8a]" style={{ clipPath: "polygon(0 0,100% 0,100% 100%,50% 78%,0 100%)", transform: "rotate(-14deg)" }} />
              </div>
              <div
                className="relative grid h-32 w-32 place-items-center rounded-full"
                style={{
                  background: "radial-gradient(circle at 35% 28%, #fff7c2, #ffd23f 40%, #d97706 80%, #92400e)",
                  boxShadow: "0 0 0 5px #7c2d12, 0 0 0 10px #fde68a, 0 0 0 13px #7c2d12, 0 12px 30px rgba(0,0,0,.5), 0 0 50px rgba(255,210,63,.55)",
                }}
              >
                <div className="absolute inset-3 rounded-full border-2 border-dashed border-[#92400e]/50" />
                <span className="text-6xl drop-shadow-[0_4px_0_rgba(124,45,18,.6)]">🏆</span>
              </div>
            </div>
            <div
              className="font-title relative mt-12 rounded-xl border-[3px] border-[#7c2d12] bg-gradient-to-b from-[#ffcf4a] to-[#f97316] px-5 py-1.5 text-xl tracking-wider text-white"
              style={{ textShadow: "0 2px 0 #7c2d12, -1.5px 0 0 #7c2d12, 1.5px 0 0 #7c2d12, 0 -1.5px 0 #7c2d12" }}
            >
              {label}
            </div>
          </div>
        </div>
        {cover && <Confetti n={30} delay={840} spread={1.3} />}
      </div>
    </div>
  );
}

/* ---------------- CLOUD DIVE (quest) ---------------- */
type BankCfg = { tint: string; shade: string; w: number; inDl: number; outDl: number; outDu: number; ts: number; seed: number };
const BANKS: BankCfg[] = [
  { tint: "#d6ecfa", shade: "#9ccbea", w: 64, inDl: 0, outDl: 150, outDu: 780, ts: 1.12, seed: 3 }, // back
  { tint: "#eef8fe", shade: "#bcdcf2", w: 58, inDl: 60, outDl: 70, outDu: 700, ts: 1.3, seed: 7 }, // mid
  { tint: "#ffffff", shade: "#d3e8f7", w: 54, inDl: 120, outDl: 0, outDu: 600, ts: 1.6, seed: 11 }, // front (closest)
];

function rng(seed: number) {
  let x = seed * 9973;
  return () => {
    x = (x * 9301 + 49297) % 233280;
    return x / 233280;
  };
}

function CloudBank2({ side, layer, phase }: { side: "l" | "r"; layer: number; phase: OverlayPhase }) {
  const cover = phase === "cover";
  const c = BANKS[layer];
  const isL = side === "l";
  const sgn = isL ? -1 : 1;
  const r = rng(c.seed + (isL ? 0 : 50));
  const puffs = Array.from({ length: 12 }, (_, i) => ({ top: -6 + i * 9.5 + r() * 3, size: 96 + r() * 70, jx: r() * 0.18 }));
  const inner = Array.from({ length: 5 }, (_, i) => ({ top: 8 + i * 19 + r() * 6, left: 12 + r() * 50, size: 70 + r() * 50 }));
  // cartoon cloud: same flat colour for every puff → they merge into ONE silhouette.
  // a shade copy sits underneath (offset down) and a highlight copy on top (offset up).
  const edge = (p: { top: number; size: number; jx: number }) => ({ top: `${p.top}%`, [isL ? "right" : "left"]: -p.size * (0.4 + p.jx), width: p.size, height: p.size, marginTop: -p.size / 2 });
  const Silhouette = ({ color, dy, dx = 0, shrink = 1, rect = true }: { color: string; dy: number; dx?: number; shrink?: number; rect?: boolean }) => (
    <div className="absolute inset-0" style={{ transform: `translate(${dx}px, ${dy}px)` }}>
      {rect && <div className="absolute inset-y-0" style={{ [isL ? "left" : "right"]: 0, width: "100%", background: color }} />}
      {puffs.map((p, i) => (
        <span key={i} className="absolute rounded-full" style={{ ...edge(p), background: color, transform: `scale(${shrink})` }} />
      ))}
    </div>
  );
  return (
    <div
      className={`absolute -top-[6%] h-[112%] ${isL ? "left-0" : "right-0"} ${cover ? "cl2-in" : "cl2-out"}`}
      style={
        {
          width: `${c.w}%`,
          zIndex: 1 + layer,
          // scale from the INNER edge so parting clouds grow outward (never cross the centre)
          transformOrigin: isL ? "100% 50%" : "0% 50%",
          "--fx": `${sgn * 112}%`,
          "--tx": `${sgn * (120 + layer * 18)}%`,
          "--ts": c.ts,
          "--du": cover ? "520ms" : `${c.outDu}ms`,
          "--dl": `${cover ? c.inDl : c.outDl}ms`,
        } as CSSProperties
      }
    >
      <Silhouette color={c.shade} dy={12} dx={sgn * -4} />
      <Silhouette color={c.tint} dy={0} />
      {inner.map((p, i) => (
        <span key={`i${i}`} className="absolute rounded-full" style={{ top: `${p.top}%`, [isL ? "left" : "right"]: `${p.left}%`, width: p.size * 1.7, height: p.size * 0.55, background: "radial-gradient(ellipse, rgba(255,255,255,.85), rgba(255,255,255,0) 70%)" }} />
      ))}
    </div>
  );
}

function Birds({ phase }: { phase: OverlayPhase }) {
  if (phase !== "reveal") return null;
  return (
    <div className="pointer-events-none absolute inset-0 z-[6]">
      {[
        { top: 30, left: 18, s: 1, dl: 180 },
        { top: 34, left: 26, s: 0.75, dl: 260 },
        { top: 27, left: 30, s: 0.6, dl: 320 },
      ].map((b, i) => (
        <div key={i} className="cl2-bird absolute" style={{ top: `${b.top}%`, left: `${b.left}%`, ["--dl" as string]: `${b.dl}ms`, ["--bx" as string]: "260px" } as CSSProperties}>
          <svg viewBox="0 0 40 16" style={{ width: 34 * b.s, height: 14 * b.s }} className="cl2-flap overflow-visible">
            <path d="M2 4 Q11 -1 20 9 Q29 -1 38 4 Q29 3 20 14 Q11 3 2 4 Z" fill="#2b4a63" />
          </svg>
        </div>
      ))}
    </div>
  );
}

function Cloud({ phase, label }: { phase: OverlayPhase; label: string }) {
  const cover = phase === "cover";
  return (
    <div className="absolute inset-0 z-50 overflow-hidden">
      {/* sky behind the clouds */}
      <div className={`absolute inset-0 ${cover ? "cl2-sky-in" : "cl2-sky-out"}`} style={{ background: "linear-gradient(180deg, #4fbdf0 0%, #9fdcfa 50%, #e9f8ff 100%)" }}>
        <div className="absolute -right-[20%] -top-[12%] h-[60%] w-[80%] rounded-full" style={{ background: "radial-gradient(circle, rgba(255,250,220,.95), rgba(255,240,180,.35) 40%, transparent 70%)" }} />
        <div className="absolute left-1/2 top-1/2 h-[140%] w-[140%] -translate-x-1/2 -translate-y-1/2 opacity-60">
          <div className="spin-slow h-full w-full rounded-full" style={{ background: "repeating-conic-gradient(from 0deg, rgba(255,255,255,.4) 0deg 7deg, transparent 7deg 20deg)", WebkitMask: "radial-gradient(circle, #000 0%, transparent 55%)", mask: "radial-gradient(circle, #000 0%, transparent 55%)" }} />
        </div>
      </div>
      {[0, 1, 2].map((ly) => (
        <CloudBank2 key={`l${ly}`} side="l" layer={ly} phase={phase} />
      ))}
      {[0, 1, 2].map((ly) => (
        <CloudBank2 key={`r${ly}`} side="r" layer={ly} phase={phase} />
      ))}
      {/* wind streaks */}
      <div className="pointer-events-none absolute inset-0 z-[5]">
        {[18, 31, 62, 76].map((top, i) => (
          <span
            key={i}
            className="cl2-wind absolute h-[3px] w-[38%] rounded-full bg-white/80"
            style={{ top: `${top}%`, left: i % 2 ? "auto" : "-10%", right: i % 2 ? "-10%" : "auto", ["--fx" as string]: i % 2 ? "60%" : "-60%", ["--tx" as string]: i % 2 ? "-120%" : "120%", ["--dl" as string]: `${(cover ? 40 : 0) + i * 70}ms` } as CSSProperties}
          />
        ))}
      </div>
      <Birds phase={phase} />
      <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
        <div className={cover ? "cl-emblem-in" : "cl-emblem-out"}>
          <div className="flex flex-col items-center">
            <div className="relative grid h-36 w-36 place-items-center">
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: "radial-gradient(circle at 40% 35%, #fef3c7, #fcd34d 55%, #b45309)",
                  boxShadow: "0 0 0 5px #78350f, 0 0 0 9px #fde68a, 0 0 0 12px #78350f, 0 14px 30px rgba(14,90,130,.45)",
                }}
              />
              <svg viewBox="0 0 100 100" className="relative h-28 w-28">
                <circle cx="50" cy="50" r="40" fill="#fff8e6" stroke="#78350f" strokeWidth="2.5" />
                {Array.from({ length: 16 }).map((_, i) => (
                  <line
                    key={i}
                    x1="50"
                    y1="13"
                    x2="50"
                    y2={i % 4 === 0 ? 21 : 17}
                    stroke="#78350f"
                    strokeWidth={i % 4 === 0 ? 2.4 : 1.2}
                    transform={`rotate(${i * 22.5} 50 50)`}
                  />
                ))}
                {["N", "E", "S", "W"].map((d, i) => (
                  <text
                    key={d}
                    x="50"
                    y="31"
                    textAnchor="middle"
                    fontSize="9"
                    fontWeight="900"
                    fill={d === "N" ? "#dc2626" : "#78350f"}
                    transform={`rotate(${i * 90} 50 50)`}
                  >
                    {d}
                  </text>
                ))}
                <g className="cl-needle" style={{ transformOrigin: "50px 50px" }}>
                  <path d="M50 22 L57 50 L50 50 Z" fill="#ef4444" />
                  <path d="M50 22 L43 50 L50 50 Z" fill="#b91c1c" />
                  <path d="M50 78 L57 50 L50 50 Z" fill="#94a3b8" />
                  <path d="M50 78 L43 50 L50 50 Z" fill="#64748b" />
                  <circle cx="50" cy="50" r="4" fill="#78350f" />
                </g>
              </svg>
              {cover && (
                <div className="cl-pin-in absolute -top-10 left-1/2 -ml-5">
                  <svg viewBox="0 0 40 52" className="h-14 w-10 drop-shadow-[0_6px_6px_rgba(0,0,0,.35)]">
                    <path d="M20 50 C20 50 4 30 4 18 A16 16 0 0 1 36 18 C36 30 20 50 20 50 Z" fill="#ef4444" stroke="#7f1d1d" strokeWidth="2.5" />
                    <circle cx="20" cy="18" r="7" fill="#fff" />
                  </svg>
                </div>
              )}
            </div>
            <div
              className="font-title mt-5 rounded-xl border-[3px] border-[#0e5a70] bg-gradient-to-b from-[#5eead4] to-[#0891b2] px-6 py-1.5 text-xl tracking-[0.25em] text-white"
              style={{ textShadow: "0 2px 0 #0e5a70" }}
            >
              {label}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- PODIUM "GRAND STAGE" (leaderboard) ----------------
   stage lights sweep in → podium 2·1·3 rises → gold medal drops on the champion step
   → everything zooms past the camera to reveal the leaderboard. */
const STEPS = [
  { n: 2, left: "6%", h: "62%", c: ["#f8fafc", "#a9b8c8", "#5e7086"], top: "#e2e8f0", dl: 150 },
  { n: 1, left: "35%", h: "100%", c: ["#fff3b0", "#f5b82e", "#a86b00"], top: "#ffe27a", dl: 60 },
  { n: 3, left: "64%", h: "48%", c: ["#ffd9b8", "#e2793a", "#8a3a12"], top: "#f6b083", dl: 220 },
];

function Podium({ phase, label }: { phase: OverlayPhase; label: string }) {
  const cover = phase === "cover";
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* stage */}
      <div className={`absolute inset-0 ${cover ? "pd2-bg-in" : "pd2-bg-out"}`} style={{ background: "radial-gradient(ellipse at 50% 42%, #4a2fa8 0%, #24166b 45%, #0d0a2b 100%)" }}>
        <div className="absolute left-1/2 top-[44%] h-[900px] w-[900px] -translate-x-1/2 -translate-y-1/2 opacity-70">
          <div className="spin-slow h-full w-full rounded-full" style={{ background: "repeating-conic-gradient(from 0deg, rgba(255,214,90,.28) 0deg 7deg, transparent 7deg 18deg)", WebkitMask: "radial-gradient(circle, #000 0%, rgba(0,0,0,.5) 30%, transparent 62%)", mask: "radial-gradient(circle, #000 0%, rgba(0,0,0,.5) 30%, transparent 62%)" }} />
        </div>
        {/* spotlights */}
        <div className="pd2-beam-l absolute -left-[10%] -top-[8%] h-[95%] w-[46%] origin-top-left" style={{ background: "linear-gradient(180deg, rgba(255,250,220,.55), rgba(255,250,220,0))", clipPath: "polygon(0 0, 18% 0, 100% 100%, 46% 100%)" }} />
        <div className="pd2-beam-r absolute -right-[10%] -top-[8%] h-[95%] w-[46%] origin-top-right" style={{ background: "linear-gradient(180deg, rgba(255,250,220,.55), rgba(255,250,220,0))", clipPath: "polygon(82% 0, 100% 0, 54% 100%, 0 100%)" }} />
        {/* floor glow */}
        <div className="absolute inset-x-0 bottom-0 h-[40%]" style={{ background: "radial-gradient(ellipse 70% 60% at 50% 100%, rgba(255,214,90,.35), transparent 70%)" }} />
      </div>

      {/* label banner */}
      <div className="absolute inset-x-0 top-[12%] flex justify-center">
        <div className={cover ? "pd2-label-in" : "pd2-medal-out"}>
          <div className="relative">
            <span className="absolute -left-5 top-2 h-10 w-12 bg-[#7c3aed]" style={{ clipPath: "polygon(0 0,100% 0,100% 100%,0 100%,30% 50%)", filter: "brightness(.7)" }} />
            <span className="absolute -right-5 top-2 h-10 w-12 bg-[#7c3aed]" style={{ clipPath: "polygon(0 0,100% 0,70% 50%,100% 100%,0 100%)", filter: "brightness(.7)" }} />
            <div className="font-title relative rounded-2xl bg-gradient-to-b from-[#c4b5fd] via-[#8b5cf6] to-[#6d28d9] px-7 py-2.5 text-[26px] leading-none tracking-wider text-white shadow-[0_6px_0_#3b0764,0_0_30px_rgba(167,139,250,.6)]" style={{ textShadow: "0 2px 0 #3b0764" }}>
              {label}
            </div>
          </div>
        </div>
      </div>

      {/* podium steps */}
      <div className="absolute inset-x-0 bottom-0 h-[44%]">
        {STEPS.map((st) => (
          <div key={st.n} className={`absolute bottom-0 w-[30%] ${cover ? "pd2-step-in" : "pd2-step-out"}`} style={{ left: st.left, height: st.h, ["--dl" as string]: `${cover ? st.dl : 240 - st.dl}ms` } as CSSProperties}>
            <div className="absolute inset-x-0 -top-[14px] h-[28px] rounded-[50%]" style={{ background: st.top, boxShadow: `0 0 18px ${st.c[1]}` }} />
            <div className="absolute inset-0 overflow-hidden rounded-b-md" style={{ background: `linear-gradient(90deg, ${st.c[2]} 0%, ${st.c[1]} 30%, ${st.c[0]} 50%, ${st.c[1]} 70%, ${st.c[2]} 100%)` }}>
              <div className="absolute inset-x-0 top-0 h-[14px]" style={{ background: "linear-gradient(180deg, rgba(0,0,0,.25), transparent)" }} />
              <div className="font-title absolute inset-x-0 top-[16%] text-center text-[52px] leading-none text-white" style={{ textShadow: `0 4px 0 ${st.c[2]}, 0 0 18px rgba(255,255,255,.4)` }}>
                {st.n}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* medal lands on the champion step */}
      <div className="absolute inset-x-0 bottom-[44%] flex justify-center">
        <div className="relative">
          {cover && <span className="pd2-shock absolute bottom-0 left-1/2 h-10 w-56 rounded-[50%] border-[5px] border-[#fde68a]" />}
          <div className={cover ? "pd2-medal-in" : "pd2-medal-out"}>
            <PodiumMedal n={1} className="h-[180px] w-[160px] drop-shadow-[0_14px_16px_rgba(0,0,0,.5)]" />
          </div>
          {cover && (
            <div className="absolute left-1/2 top-1/2">
              <Confetti n={34} delay={620} spread={1.4} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------- SNIPER SCOPE (gameplay) ---------------- */
function Scope({ phase, origin, lens }: { phase: OverlayPhase; origin: { x: number; y: number }; lens?: number }) {
  const cover = phase === "cover";
  const pos = {
    "--sx": `${origin.x}%`,
    "--sy": `${origin.y}%`,
    ...(lens ? { "--scl": `${Math.round(lens)}px` } : {}),
  } as CSSProperties;
  return (
    <div className={`absolute inset-0 overflow-hidden ${cover ? "sc2-cover" : "sc2-reveal"}`} style={pos}>
      {/* darkness outside the lens */}
      <div className="absolute inset-0" style={{ background: "radial-gradient(circle at var(--sx) var(--sy), transparent calc(var(--sr) - 1px), rgba(2,6,8,.55) calc(var(--sr) + 2px), #020506 calc(var(--sr) + 34px))" }} />
      {/* lens */}
      <div className="absolute" style={{ left: "var(--sx)", top: "var(--sy)", width: "calc(var(--sr) * 2)", height: "calc(var(--sr) * 2)", transform: "translate(-50%,-50%)" }}>
        <div className="absolute inset-0 rounded-full" style={{ boxShadow: "0 0 0 5px #0a0e11, 0 0 0 9px #3a444e, 0 0 0 12px #12171b, inset 0 0 36px 12px rgba(0,0,0,.7)", background: "radial-gradient(circle at 38% 32%, rgba(190,255,220,.10), rgba(60,255,150,.04) 45%, rgba(0,0,0,.22) 78%)" }} />
        {/* rotating zoom ring */}
        <svg viewBox="-100 -100 200 200" className={`absolute -inset-[9%] h-[118%] w-[118%] ${cover ? "sc2-knob-in" : "sc2-knob-out"}`}>
          {Array.from({ length: 48 }).map((_, i) => (
            <line key={i} x1="0" y1="-99" x2="0" y2={i % 4 === 0 ? -92 : -95} stroke="#9aa5b0" strokeWidth={i % 4 === 0 ? 1.6 : 0.9} transform={`rotate(${i * 7.5})`} />
          ))}
        </svg>
        {/* reticle */}
        <svg viewBox="-100 -100 200 200" className={`absolute inset-0 h-full w-full ${cover ? "sc2-ret-in" : "sc2-ret-out"}`}>
          <g stroke="#0b0f12" strokeWidth="1.6" strokeLinecap="round">
            <line x1="-100" y1="0" x2="-12" y2="0" />
            <line x1="12" y1="0" x2="100" y2="0" />
            <line x1="0" y1="-100" x2="0" y2="-12" />
            <line x1="0" y1="12" x2="0" y2="100" />
            <line x1="-100" y1="0" x2="-62" y2="0" strokeWidth="4.5" />
            <line x1="62" y1="0" x2="100" y2="0" strokeWidth="4.5" />
            <line x1="0" y1="62" x2="0" y2="100" strokeWidth="4.5" />
          </g>
          {[-48, -36, -24, 24, 36, 48].map((x) => (
            <g key={x} fill="#0b0f12">
              <circle cx={x} cy="0" r="1.6" />
              <circle cx="0" cy={x} r="1.6" />
            </g>
          ))}
          <circle r="7" fill="none" stroke="#ff3b3b" strokeWidth="1.1" opacity=".85" />
          <circle r="1.9" fill="#ff3b3b" />
        </svg>
        {/* focus pulse when the lens locks */}
        {cover && <span className="sc2-lock absolute inset-0 rounded-full border-2 border-[#9dffc8]" />}
        {/* glass glint */}
        <span className="sc2-glint pointer-events-none absolute inset-0 overflow-hidden rounded-full">
          <span className="absolute -left-1/2 top-0 h-full w-1/3 rotate-12 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </span>
      </div>
    </div>
  );
}

/* ---------------- GIFT WRAP (gift page) ---------------- */
const PAPER: CSSProperties = {
  backgroundColor: "#e11d48",
  backgroundImage:
    "radial-gradient(circle at 25% 25%, #fde047 0 6px, transparent 7px), radial-gradient(circle at 75% 75%, #ffffff 0 4px, transparent 5px), repeating-linear-gradient(45deg, rgba(255,255,255,.07) 0 12px, transparent 12px 24px), linear-gradient(180deg, #f43f5e, #be123c)",
  backgroundSize: "56px 56px, 56px 56px, auto, auto",
};
const GOLD_V = "linear-gradient(90deg, #92400e, #fde68a 22%, #fbbf24 50%, #fde68a 78%, #92400e)";
const GOLD_H = "linear-gradient(180deg, #92400e, #fde68a 22%, #fbbf24 50%, #fde68a 78%, #92400e)";

function zig(side: "l" | "r") {
  const n = 22;
  const pts: string[] = [];
  if (side === "l") {
    pts.push("0 0");
    for (let i = 0; i <= n; i++) pts.push(`${i % 2 ? 94 : 100}% ${(i / n) * 100}%`);
    pts.push("0 100%");
  } else {
    pts.push("100% 0", "100% 100%");
    for (let i = n; i >= 0; i--) pts.push(`${i % 2 ? 6 : 0}% ${(i / n) * 100}%`);
  }
  return `polygon(${pts.join(",")})`;
}

function Wrap({ phase, label }: { phase: OverlayPhase; label: string }) {
  const cover = phase === "cover";
  return (
    <div className={`absolute inset-0 z-50 overflow-hidden ${cover ? "wr-shake" : ""}`}>
      {(["l", "r"] as const).map((side) => (
        <div
          key={side}
          className={`absolute top-0 h-full w-[54%] ${side === "l" ? "left-0" : "right-0"} ${cover ? `wr-${side}-in` : `wr-${side}-out`}`}
          style={{ filter: "drop-shadow(0 0 14px rgba(0,0,0,.45))" }}
        >
          <div className="absolute inset-0 bg-[#fff1f2]" style={{ clipPath: zig(side) }} />
          <div className="absolute inset-y-0" style={{ ...PAPER, clipPath: zig(side), left: side === "l" ? 0 : 5, right: side === "l" ? 5 : 0 }}>
            <div className="absolute inset-0" style={{ background: side === "l" ? "linear-gradient(90deg, transparent 70%, rgba(0,0,0,.28))" : "linear-gradient(270deg, transparent 70%, rgba(0,0,0,.28))" }} />
          </div>
        </div>
      ))}
      {/* ribbons */}
      <div className={`absolute left-1/2 top-0 h-full w-[46px] ${cover ? "wr-v-in" : "wr-v-out"}`} style={{ background: GOLD_V, boxShadow: "0 0 0 3px #7c2d12, 0 0 18px rgba(0,0,0,.4)" }} />
      <div className={`absolute left-0 top-1/2 h-[46px] w-full ${cover ? "wr-h-in" : "wr-h-out"}`} style={{ background: GOLD_H, boxShadow: "0 0 0 3px #7c2d12, 0 0 18px rgba(0,0,0,.4)" }} />
      {/* tag */}
      {cover && (
        <div className="absolute left-1/2 top-[calc(50%+30px)] -ml-[8px]">
          <div className="wr-tag flex flex-col items-start">
            <span className="ml-[7px] h-10 w-[2px] bg-[#7c2d12]" />
            <div className="-mt-1 -ml-2 flex items-center gap-2 rounded-xl border-[3px] border-[#7c2d12] bg-gradient-to-b from-[#fffaf0] to-[#fde9c8] px-4 py-2 shadow-[0_6px_14px_rgba(0,0,0,.35)]">
              <span className="h-3 w-3 rounded-full border-2 border-[#7c2d12] bg-[#e11d48]" />
              <span className="font-title text-2xl tracking-wider text-[#be123c]" style={{ textShadow: "0 2px 0 #fecdd3" }}>
                {label}
              </span>
              <span className="text-xl">🎁</span>
            </div>
          </div>
        </div>
      )}
      {/* bow */}
      <div className={`absolute left-1/2 top-1/2 w-[200px] ${cover ? "wr-bow-in" : "wr-bow-out"}`}>
        <Bow className="w-full drop-shadow-[0_8px_10px_rgba(0,0,0,.4)]" />
      </div>
      {cover && <Confetti n={18} delay={560} spread={1.1} />}
    </div>
  );
}

export function TransitionOverlay({ phase, origin, label, variant = "iris", rate = 1, lens }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  // speed up every CSS animation inside the overlay (delays included) in one go
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || rate === 1) return;
    el.getAnimations({ subtree: true }).forEach((a) => (a.playbackRate = rate));
  }, [phase, variant, rate]);
  if (phase === "idle" || variant === "none") return null;
  return (
    <div ref={ref} className="absolute inset-0 z-50">
      <OverlayBody phase={phase} origin={origin} label={label} variant={variant} lens={lens} />
    </div>
  );
}

function OverlayBody({ phase, origin, label, variant, lens }: { phase: OverlayPhase; origin: { x: number; y: number }; label: string; variant: OverlayVariant; lens?: number }) {
  if (variant === "fade") return <div className={`absolute inset-0 bg-[#05090b] ${phase === "cover" ? "fd-in" : "fd-out"}`} />;
  if (variant === "shutter") return <Shutter phase={phase} label={label} />;
  if (variant === "ribbon") return <Ribbon phase={phase} label={label} />;
  if (variant === "podium") return <Podium phase={phase} label={label} />;
  if (variant === "cloud") return <Cloud phase={phase} label={label} />;
  if (variant === "scope") return <Scope phase={phase} origin={origin} lens={lens} />;
  if (variant === "wrap") return <Wrap phase={phase} label={label} />;
  return (
    <div
      className={`absolute inset-0 z-50 ${phase === "cover" ? "ov-cover" : "ov-reveal"}`}
      style={
        {
          "--ox": `${origin.x}%`,
          "--oy": `${origin.y}%`,
          background: "radial-gradient(circle at 50% 50%, #12242a 0%, #05090b 70%)",
        } as CSSProperties
      }
    >
      {phase === "cover" && (
        <div className="absolute inset-0 grid place-items-center">
          <div className="ov-ring flex flex-col items-center gap-4">
            <svg viewBox="0 0 100 100" className="h-24 w-24">
              <circle cx="50" cy="50" r="38" fill="none" stroke="#3fdc72" strokeWidth="4" />
              <circle cx="50" cy="50" r="22" fill="none" stroke="#3fdc72" strokeWidth="2" opacity="0.6" />
              <path d="M50 4 V30 M50 70 V96 M4 50 H30 M70 50 H96" stroke="#ffd23f" strokeWidth="4" strokeLinecap="round" />
              <circle cx="50" cy="50" r="4" fill="#ff5a3d" />
            </svg>
            <span className="font-title text-xl tracking-[0.3em] text-white/80">{label}</span>
          </div>
        </div>
      )}
    </div>
  );
}
