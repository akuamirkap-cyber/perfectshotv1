import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import { sfx } from "../audio/sfx";
import { hoverSfx } from "../audio/useSound";
import { Ico, type FlatName } from "../ui/FlatIcons";
import { HeadArt } from "../play/HeadArt";
import { Avatar } from "../rank/Avatar";

/** each block of 5 stages is an island ("PULAU") */
const ISLANDS = ["Coconut", "Coral", "Pearl", "Dolphin", "Golden Sand", "Sea Turtle", "Starfish", "Waves", "Seagull", "Lighthouse", "Pirate", "Rainbow", "Shell", "Octopus", "Whale", "Sun", "Lagoon", "Turquoise", "Treasure", "Eclipse"];
import { useGame } from "../game/store";
import { NewTarget } from "../play/TargetArt2";
import { memo } from "react";
import { TargetArt } from "../play/TargetArt";
import { levelConfig, type TargetKind } from "../play/levels";
import { cycleOf, themeFor, useSettings, type Theme } from "../theme/themes";
import {
  pillarH,
  pillarW,
  QUEST_IN,
  QUEST_OUT,
  STAGES,
  stageState,
  TOTAL,
  worldX,
  type StageBase,
  type StageState,
  type StageType,
} from "../quest/data";

type Props = {
  leaving: boolean;
  onBack: (e: MouseEvent<HTMLElement>) => void;
  onPlay: (e: MouseEvent<HTMLElement>, n: number) => void;
  /** Optional host-game progress/data lets another game reuse this exact map presentation. */
  progress?: { stage: number; stars?: Record<number, number>; stages?: readonly StageBase[] };
  /**
   * Host-game override: every stage is playable without touching the saved
   * progress. Locked pillars render as finished (green, tappable, no padlock) so
   * the map still reads normally, and the real current stage keeps its marker.
   */
  unlockAll?: boolean;
  /**
   * Travel axis of the map. `y` is the original portrait corridor (stages climb
   * the screen). `x` lays the very same perspective out sideways, so stages run
   * left → right and the map reads comfortably in a landscape frame.
   */
  axis?: "y" | "x";
};

/* ---------------- camera / projection ---------------- */
const HOR = -2.2; // vanishing line far above → almost top-down
const BOT = 0.92; // floor y at depth 0
const K = 0.08; // far stages shrink gently
const NEAR = -1.2;
const FAR = 8;
/** extra on-screen size of every pillar */
const PIL = 1.38;
const FOCUS_D = 1.1;
const focusCam = (n: number) => n - 1 - FOCUS_D;
const clampCam = (c: number) => Math.max(-1.1, Math.min(TOTAL - 1 - FOCUS_D, c));
const easeOut = (p: number) => 1 - Math.pow(1 - p, 3);
const easeIn = (p: number) => p * p * p;
const easeInOut = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);

const v = (o: Record<string, string | number>) => o as CSSProperties;

const CAP: Record<string, { top: [string, string, string]; rim: [string, string] }> = {
  done: { top: ["#d4ffc2", "#5fe36a", "#22a447"], rim: ["#22a447", "#0f5c24"] },
  current: { top: ["#f0ffe4", "#86f57a", "#2fbf4a"], rim: ["#2fbf4a", "#137a2c"] },
  special: { top: ["#fff7c9", "#ffd23f", "#e09310"], rim: ["#d97706", "#7c2d12"] },
  boss: { top: ["#ffd6d6", "#ff5a5a", "#c81e1e"], rim: ["#b91c1c", "#5f0f0f"] },
  lockN: { top: ["#f2f5f9", "#c9d2dd", "#8d9aab"], rim: ["#8d9aab", "#566377"] },
  lockS: { top: ["#f8f0d4", "#dbc890", "#a8955a"], rim: ["#a8955a", "#6b5a2e"] },
  lockB: { top: ["#f4dada", "#d29e9e", "#9a5f5f"], rim: ["#9a5f5f", "#5f3434"] },
};
const capKey = (t: StageType, s: StageState) =>
  s === "current" ? "current" : s === "locked" ? (t === "boss" ? "lockB" : t === "special" ? "lockS" : "lockN") : t === "normal" ? "done" : t;

/* ================================================================== */
export function QuestMap({ leaving, onBack, onPlay, progress, unlockAll = false, axis = "y" }: Props) {
  const onX = axis === "x";
  const g = useGame();
  const st = useSettings();
  const cur = progress?.stage ?? g.stage;
  const stages = progress?.stages ?? STAGES;
  const starsAt = (n: number) => progress ? progress.stars?.[n] ?? 0 : g.stars[n] ?? 0;
  /** Locked only when the host game asks for the earned progression. */
  const stateFor = (n: number): StageState => {
    const s = stageState(n, cur);
    return unlockAll && s === "locked" ? "done" : s;
  };
  const boxRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 420, h: 820 });
  const [cam, setCamS] = useState(() => clampCam(focusCam(cur) - 4.2));
  const camRef = useRef(cam);
  const raf = useRef(0);
  const [entered, setEntered] = useState(false);
  const [selected, setSelected] = useState(cur);
  const [hl, setHl] = useState<{ n: number; k: number } | null>(null);
  const [shake, setShake] = useState<{ n: number; k: number } | null>(null);
  const [splash, setSplash] = useState<{ n: number; k: number } | null>(null);
  const [toast, setToast] = useState<{ text: string; n: number; icon?: FlatName } | null>(null);
  const drag = useRef<{ y: number; c: number; ly: number; lt: number; v: number } | null>(null);
  const pendingCam = useRef<number | null>(null);
  const moveRaf = useRef(0);
  const wheelTarget = useRef<number | null>(null);
  const wheelRaf = useRef(0);
  const moved = useRef(false);
  const out = leaving;

  const setCam = (c: number) => {
    const x = clampCam(c);
    camRef.current = x;
    setCamS(x);
  };
  const stopAnim = () => cancelAnimationFrame(raf.current);
  const animateCam = (to: number, dur: number, ease = easeOut) => {
    stopAnim();
    const from = camRef.current;
    const t0 = performance.now();
    const step = (now: number) => {
      const p = Math.min(1, (now - t0) / dur);
      setCam(from + (to - from) * ease(p));
      if (p < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
  };

  useLayoutEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const upd = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    upd();
    const ro = new ResizeObserver(upd);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    animateCam(focusCam(cur), QUEST_IN.cam.dur);
    const id = window.setTimeout(() => setEntered(true), QUEST_IN.ready);
    return () => {
      clearTimeout(id);
      stopAnim();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (leaving) animateCam(camRef.current + 1.5, 600, easeIn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leaving]);

  /* ---------------- drag + inertia ---------------- */
  /** Where the pointer sits along the travel axis (negated for x: the row moves
   *  left as the camera advances, so grabbing and pulling follows the content). */
  const grab = (e: { clientX: number; clientY: number }) => (onX ? -e.clientX : e.clientY);
  useEffect(() => {
    const move = (e: PointerEvent) => {
      const d = drag.current;
      if (!d) return;
      const unit = (onX ? size.w : size.h) * 0.17;
      const cur = grab(e);
      const dy = cur - d.y;
      if (Math.abs(dy) > 6) moved.current = true;
      pendingCam.current = d.c + dy / unit;
      if (!moveRaf.current)
        moveRaf.current = requestAnimationFrame(() => {
          moveRaf.current = 0;
          if (pendingCam.current !== null) setCam(pendingCam.current);
        });
      const now = performance.now();
      const dt = Math.max(1, now - d.lt);
      d.v = 0.75 * (((cur - d.ly) / unit / dt) * 1000) + 0.25 * d.v;
      d.ly = cur;
      d.lt = now;
    };
    const up = () => {
      const d = drag.current;
      if (!d) return;
      drag.current = null;
      let vel = performance.now() - d.lt > 110 ? 0 : Math.max(-9, Math.min(9, d.v));
      let last = performance.now();
      const step = (now: number) => {
        const dt = (now - last) / 1000;
        last = now;
        vel *= Math.pow(0.09, dt); // gentler friction → longer, silkier glide
        const before = camRef.current;
        setCam(before + vel * dt);
        if (camRef.current === before) vel = 0; // hit an end
        if (Math.abs(vel) > 0.03) raf.current = requestAnimationFrame(step);
      };
      stopAnim();
      raf.current = requestAnimationFrame(step);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size.h, size.w, onX]);

  const onDown = (e: React.PointerEvent) => {
    if (!entered || out) return;
    stopAnim();
    cancelAnimationFrame(wheelRaf.current);
    wheelRaf.current = 0;
    wheelTarget.current = null;
    const cur = grab(e);
    drag.current = { y: cur, c: camRef.current, ly: cur, lt: performance.now(), v: 0 };
    moved.current = false;
  };

  /** wheel / trackpad: ease toward an accumulated target instead of jumping */
  const onWheel = (e: React.WheelEvent) => {
    if (!entered || out) return;
    const base = wheelTarget.current ?? camRef.current;
    wheelTarget.current = clampCam(base - e.deltaY * 0.004);
    if (wheelRaf.current) return;
    stopAnim();
    const step = () => {
      const tg = wheelTarget.current;
      if (tg === null) {
        wheelRaf.current = 0;
        return;
      }
      const c = camRef.current + (tg - camRef.current) * 0.16;
      if (Math.abs(tg - c) < 0.002) {
        setCam(tg);
        wheelTarget.current = null;
        wheelRaf.current = 0;
        return;
      }
      setCam(c);
      wheelRaf.current = requestAnimationFrame(step);
    };
    wheelRaf.current = requestAnimationFrame(step);
  };

  /* ---------------- projection ----------------
   * One depth curve, two axes. Portrait turns depth into screen y (stages climb
   * away from the camera); landscape turns it into screen x (stages run to the
   * right), and the zig-zag that used to spread them across the width now fans
   * them up and down. Both read the same constants, so the rhythm, the sizes and
   * the fade of every pillar stay identical. */
  const W = size.w;
  const H = size.h;
  const travel = (s: number) => HOR + (BOT - HOR) * s;
  /** depth of the stage the camera settles on, as a fraction of the travel axis */
  const T_FOCUS = travel(1 / (1 + K * FOCUS_D));
  /** on-screen position along the travel axis */
  const along = (s: number) => (onX ? W * 0.42 + (T_FOCUS - travel(s)) * W * 1.15 : H * travel(s));
  /** on-screen position across the path (the gentle zig-zag) */
  const lateral = (xw: number, s: number) => (onX ? H * 0.62 + xw * s * H * 0.30 : W / 2 + xw * s * W * 0.37);
  /** place a (lateral, along) pair on the real screen axes */
  const at = (lat: number, ax: number) => (onX ? { x: ax, y: lat } : { x: lat, y: ax });
  const proj = (d: number) => {
    const s = 1 / (1 + K * d);
    return { s, y: along(s) };
  };
  const px = (xw: number, s: number) => lateral(xw, s);
  /** Landscape draws the same pillars smaller: the frame is only 420px tall. */
  const PILLAR_K = onX ? 0.72 : 1;
  const auto = st.theme === "auto";

  const nStart = Math.max(1, Math.ceil(cam + 1 + NEAR));
  const nEnd = Math.min(TOTAL, Math.floor(cam + 1 + FAR));
  const finalCam = focusCam(cur);
  const firstFinal = Math.max(1, Math.ceil(finalCam + 1 + NEAR));

  /* ---------------- actions ---------------- */
  const sel = stages[selected - 1];
  const selState = stateFor(selected);
  // Open because the host game unlocked the map, not because it was finished:
  // the detail button should offer MAIN, not ULANG.
  const selOpenNotPlayed = unlockAll && stageState(selected, cur) === "locked";

  const tapStage = (b: StageBase) => {
    if (moved.current) return;
    const s = stateFor(b.n);
    const pan = worldX(b.n);
    if (s === "locked") {
      sfx.lockedBuzz();
      setShake({ n: b.n, k: Date.now() });
      setToast({ text: `Clear Stage ${cur} first!`, n: Date.now(), icon: "lock" });
      return;
    }
    sfx.pillarTap(b.n, pan);
    setSelected(b.n);
    setSplash({ n: b.n, k: Date.now() });
  };



  const recenter = () => {
    sfx.tap(0, 1100);
    sfx.mapGlide();
    animateCam(focusCam(cur), 900, easeInOut);
    setSelected(cur);
    setHl({ n: cur, k: Date.now() });
  };

  const A = (inCls: string, i: { d: number; dur: number }, outCls: string, o: { d: number; dur: number }, extra = "") => ({
    className: `a ${out ? outCls : inCls} ${extra}`,
    style: v({ "--d": `${out ? o.d : i.d}ms`, "--dur": `${out ? o.dur : i.dur}ms` }),
  });

  const dots: { x: number; y: number; s: number; done: boolean }[] = [];
  for (let n = Math.max(1, nStart - 1); n < Math.min(TOTAL, nEnd + 1); n++) {
    for (const t of [0.25, 0.5, 0.75]) {
      const d = n - 1 + t - cam;
      if (d < NEAR || d > FAR) continue;
      const p = proj(d);
      const pt = at(px(worldX(n) + (worldX(n + 1) - worldX(n)) * t, p.s), p.y);
      dots.push({ x: pt.x, y: pt.y, s: p.s, done: n < cur });
    }
  }

  return (
    <div ref={boxRef} className={`absolute inset-0 isolate overflow-hidden ${entered && !out ? "" : "pointer-events-none"}`}>
      {/* ================= BEACH WATER ================= */}
      <div {...A("sh-bg-in", QUEST_IN.water, "out-bg", { d: 150, dur: 500 }, "absolute inset-0 overflow-hidden")}>
        {/* deep → shallow tropical gradient */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #4ff3ff 0%, #10d4f2 28%, #00b6ea 62%, #0094dc 100%)" }} />
        {/* bright shallow patches (sand under water) */}
        <div className="qw-patch absolute inset-[-20%]" style={{ background: "radial-gradient(ellipse 34% 20% at 22% 30%, rgba(170,255,240,.55), transparent 70%), radial-gradient(ellipse 30% 22% at 78% 62%, rgba(160,255,235,.45), transparent 70%), radial-gradient(ellipse 26% 16% at 40% 86%, rgba(190,255,245,.5), transparent 70%)" }} />
        {/* two caustic layers drifting in opposite directions */}
        <div className="absolute inset-[-80px]" style={{ transform: `translateY(${((cam * H * 0.13) % 300).toFixed(1)}px)` }}>
          <div className="qw-caus-a absolute inset-0 opacity-[.42] mix-blend-screen" style={{ backgroundImage: `url("${CAUSTIC}")`, backgroundSize: "300px 300px" }} />
          <div className="qw-caus-b absolute inset-0 opacity-[.3] mix-blend-screen" style={{ backgroundImage: `url("${CAUSTIC}")`, backgroundSize: "420px 420px" }} />
        </div>
        {/* moving sun shimmer bands */}
        <div className="qw-shine absolute inset-[-30%] opacity-60" style={{ background: "repeating-linear-gradient(115deg, transparent 0 70px, rgba(255,255,255,.16) 70px 82px, transparent 82px 150px)" }} />
        {/* cartoon wave squiggles */}
        <div className="qb-drift absolute inset-[-40px] opacity-[.65]" style={{ backgroundImage: `url("${WAVES}")`, backgroundSize: "220px 160px", backgroundPosition: `0px ${(cam * H * 0.13).toFixed(1)}px` }} />
        {/* twinkling sparkles */}
        {Array.from({ length: 18 }).map((_, i) => (
          <span key={i} className="qb-glint absolute" style={v({ left: `${(i * 37 + 7) % 100}%`, top: `${(i * 53 + 11) % 100}%`, "--gd": `${(i * 0.41) % 2.6}s` })}>
            <svg viewBox="-10 -10 20 20" style={{ width: 8 + (i % 3) * 5, height: 8 + (i % 3) * 5 }}>
              <path d="M0 -10 L2 -2 L10 0 L2 2 L0 10 L-2 2 L-10 0 L-2 -2 Z" fill="#ffffff" />
            </svg>
          </span>
        ))}
      </div>

      {/* ================= WORLD ================= */}
      <div className="absolute inset-0 touch-none select-none" onPointerDown={onDown} onWheel={onWheel}>
        {/* floor overlays */}
        <svg className="absolute inset-0" width={W} height={H}>
          {/* cycle lines */}
          {Array.from({ length: TOTAL / 5 - 1 }).map((_, c) => {
            const d = 5 * (c + 1) - 0.5 - cam;
            if (d < NEAR || d > FAR) return null;
            const p = proj(d);
            const a = at(0, p.y);
            const b = at(onX ? H : W, p.y);
            return <line key={`c${c}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#ffffff" strokeWidth={2 * p.s + 0.6} strokeDasharray={`${12 * p.s + 4} ${10 * p.s + 4}`} opacity={0.55} />;
          })}
          {/* path dots */}
          {dots.map((d, i) => (
            <ellipse key={`d${i}`} cx={d.x} cy={d.y} rx={7.5 * d.s} ry={4.4 * d.s} fill={d.done ? "#fff7c2" : "rgba(255,255,255,.7)"} style={d.done ? { filter: "drop-shadow(0 0 4px rgba(255,240,150,.9))" } : undefined} />
          ))}
        </svg>

        {/* beach props */}
        {Array.from({ length: nEnd - nStart + 3 }).map((_, i) => {
          const n = nStart - 1 + i;
          if (n < 1 || n > TOTAL || n % 2 !== 0) return null;
          const d = n - 1 + 0.45 - cam;
          if (d < NEAR || d > FAR) return null;
          const p = proj(d);
          const x0 = worldX(n);
          const side = x0 > 0.1 ? -1 : x0 < -0.1 ? 1 : n % 4 === 0 ? 1 : -1;
          const kind = (n / 2) % 5;
          // keep clear of the PULAU signpost on the same side
          const c = Math.round((n - 5.5) / 5);
          const signSide = worldX(5 * c + 5) > 0 ? -1 : 1;
          if (c >= 0 && Math.abs(n - 0.55 - (5 * c + 4.5)) < 1.3 && signSide === side) return null;
          return (
            <div
              key={`p${n}`}
              className="pointer-events-none absolute"
              style={{ ...(() => { const pt = at(px(side * (1.12 + ((n * 7) % 3) * 0.12), p.s), p.y); return { left: pt.x, top: pt.y }; })(), transform: `translate(-50%,-50%) scale(${p.s})`, zIndex: Math.round(3000 - d * 100) - 50, opacity: Math.max(0, Math.min(1, (d - NEAR) / 0.6)) }}
            >
              <BeachProp kind={kind} n={n} />
            </div>
          );
        })}

        {/* cycle signs */}
        {Array.from({ length: TOTAL / 5 - 1 }).map((_, c) => {
          const d = 5 * (c + 1) - 0.5 - cam;
          if (d < NEAR || d > FAR - 2) return null;
          const p = proj(d);
          const xs = worldX(5 * (c + 1)) > 0 ? -1.6 : 1.6;
          const th = themeFor(st.theme, c + 1);
          return (
            <div key={`s${c}`} className="pointer-events-none absolute" style={{ left: Math.max(64, Math.min(W - 64, onX ? p.y : px(xs, p.s))), top: onX ? H * 0.26 : p.y, transform: `translate(-50%,-100%) scale(${Math.max(p.s, 0.72)})`, transformOrigin: "50% 100%", zIndex: Math.round(3000 - d * 100), opacity: Math.max(0, Math.min(1, (d - NEAR) / 0.45)) }}>
              <div className="flex flex-col items-center">
                <div className="font-title rounded-xl border-[3px] border-[#5b3714] bg-gradient-to-b from-[#d39556] to-[#8a5526] px-3.5 py-1.5 text-center text-[17px] leading-tight text-[#fff3dc] shadow-[0_4px_0_#3d230b]" style={{ textShadow: "0 2px 0 #5b3714" }}>
                  PULAU {c + 2}
                  <div className="text-[12px] leading-tight text-[#ffe7b0]">{ISLANDS[(c + 1) % ISLANDS.length]}</div>
                  {auto && <div className="flex items-center justify-center gap-1 text-[13px] text-[#ffe7b0]"><span className="h-2.5 w-2.5 rounded-full ring-2 ring-white/60" style={{ background: th.accent }} />{th.name}</div>}
                </div>
                <span className="h-8 w-2.5 bg-gradient-to-r from-[#5b3714] to-[#8a5526]" />
              </div>
            </div>
          );
        })}

        {/* pillars */}
        {Array.from({ length: Math.max(0, nEnd - nStart + 1) }).map((_, i) => {
          const n = nStart + i;
          const b = stages[n - 1];
          const d = n - 1 - cam;
          const p = proj(d);
          const ps = p.s * PILLAR_K;
          const pos = at(px(worldX(n), p.s), p.y);
          const state = stateFor(n);
          const k = Math.max(0, n - firstFinal);
          const kOut = Math.max(0, n - nStart);
          const anim = out
            ? { cls: "a q3-sink", d: QUEST_OUT.pillar(kOut).d, dur: QUEST_OUT.pillar(kOut).dur }
            : !entered
              ? { cls: "a q3-rise", d: QUEST_IN.pillar(Math.min(k, 12)).d, dur: QUEST_IN.pillar(0).dur }
              : { cls: "", d: 0, dur: 0 };
          return (
            <Pillar
              key={n}
              b={b}
              s={ps}
              x={pos.x}
              y={pos.y}
              z={Math.round(3000 - d * 100)}
              state={state}
              stars={starsAt(n)}
              theme={themeFor(st.theme, cycleOf(n))}
              selected={selected === n && state !== "current"}
              hlKey={hl?.n === n ? hl.k : 0}
              shakeKey={shake?.n === n ? shake.k : 0}
              splashKey={splash?.n === n ? splash.k : 0}
              anim={anim}
              tagSpace={(() => {
                const cx = pos.x;
                const half = (pillarW(b.type) * ps * PIL) / 2;
                return Math.max(W - (cx + half), cx - half);
              })()}
              tagRight={(() => {
                const cx = pos.x;
                const half = (pillarW(b.type) * ps * PIL) / 2;
                const right = W - (cx + half);
                const left = cx - half;
                // a boss head sits on the previous pillar → put this tag on the side away from it

                return right >= 200 || right > left;
              })()}
              fade={Math.max(0, Math.min(1, (p.s - 0.68) / 0.06)) * Math.max(0, Math.min(1, (d - NEAR) / 0.45))}
              avatar={state === "current" ? A("qm-avatar-in", QUEST_IN.avatar, "qm-avatar-out", QUEST_OUT.avatar, "origin-bottom") : null}
              onTap={() => tapStage(b)}
            />
          );
        })}
      </div>

      {/* ================= BACK (header hidden) ================= */}
      <div className="absolute left-3 top-3 z-[4001]">
        <div {...A("in-down", QUEST_IN.header, "out-up", QUEST_OUT.header)}>
          <button
            onClick={onBack}
            onPointerEnter={hoverSfx}
            aria-label="Back"
            data-gloss="off"
            className="press grid h-12 w-12 place-items-center rounded-full border-[3px] border-[#0f5c24] bg-gradient-to-b from-[#6ee76e] to-[#16a34a] shadow-[0_4px_0_#0f5c24,inset_0_2px_0_rgba(255,255,255,.45)]"
          >
            <svg viewBox="0 0 24 24" className="h-7 w-7">
              <path d="M15 4 L7 12 L15 20" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* ================= BOTTOM BAR ================= */}
      <div className="absolute inset-x-0 bottom-0 z-[4001] px-3 pb-3">
        <div {...A("in-up", QUEST_IN.bottom, "out-down", QUEST_OUT.bottom)}>
          <div className="flex items-center gap-2.5 rounded-[22px] border-2 border-white/15 bg-gradient-to-b from-black/55 to-black/75 p-2 shadow-[0_8px_24px_rgba(0,0,0,.45)] backdrop-blur-md">
            <button data-gloss="off" onPointerEnter={hoverSfx} onClick={recenter} title="Jump to the current stage" className="press grid h-12 w-12 shrink-0 place-items-center rounded-2xl border-2 border-white/15 bg-white/10 text-2xl">
              <Ico name="pin" className="h-7 w-7" color="#fb7185" />
            </button>
            <div key={selected} className="a in-left min-w-0 flex-1" style={v({ "--d": "0ms", "--dur": "380ms" })}>
              <div className="flex items-center gap-1.5">
                <Ico name={sel.icon} className="h-6 w-6" color={sel.type === "boss" ? "#fb7185" : sel.type === "special" ? "#fcd34d" : "#5eead4"} />
                <span className="font-title truncate text-[14px] text-white">
                  STAGE {sel.n} · {sel.name.toUpperCase()}
                </span>
              </div>
              <div className="mt-0.5 flex items-center gap-1.5">
                <span className={`font-title rounded-md px-2 py-[2px] text-[11px] leading-none ${sel.type === "boss" ? "bg-[#dc2626] text-white" : sel.type === "special" ? "bg-[#f59e0b] text-[#3a2400]" : "bg-[#14b8a6] text-white"}`}>
                  {sel.type === "boss" ? "BOSS" : sel.type === "special" ? "SPESIAL" : "NORMAL"}
                </span>
                <span className="flex items-center gap-0.5">
                  {[0, 1, 2].map((i) => (
                    <Ico key={i} name="star" className="h-4 w-4" color={i < starsAt(sel.n) ? "#ffd23f" : "rgba(255,255,255,.22)"} />
                  ))}
                </span>
              </div>
            </div>
            <button
              data-gloss="off"
              onPointerEnter={hoverSfx}
              onClick={(e) => {
                sfx.confirm();
                onPlay(e, sel.n);
              }}
              className="press shine font-title relative h-14 w-[118px] shrink-0 rounded-2xl border-2 text-xl text-white"
              style={{
                background: selState === "done" ? "linear-gradient(180deg,#ffd25a 0%,#ffa62b 48%,#f97316 52%,#ea580c 100%)" : "linear-gradient(180deg,#7cf06f 0%,#3fcf4a 48%,#21a83a 52%,#1f9b37 100%)",
                borderColor: selState === "done" ? "#7c2d12" : "#0e5a26",
                boxShadow: `0 5px 0 ${selState === "done" ? "#7c2d12" : "#0e5a26"}`,
              }}
            >
              <span className="absolute inset-x-3 top-1 h-[38%] rounded-xl bg-white/25" />
              <span className="relative" style={{ textShadow: `0 2px 0 ${selState === "done" ? "#7c2d12" : "#0e5a26"}` }}>
                <span className="flex items-center justify-center gap-1.5">
                  {selState === "done" && !selOpenNotPlayed ? <Ico name="replay" className="h-5 w-5" color="#ffffff" /> : null}
                  {selState === "done" && !selOpenNotPlayed ? "REPLAY" : "PLAY"}
                  {selState === "done" && !selOpenNotPlayed ? null : <Ico name="play" className="h-5 w-5" color="#ffffff" />}
                </span>
              </span>
            </button>
          </div>
        </div>
      </div>

      {toast && (
        <div key={toast.n} className="pointer-events-none absolute inset-x-0 top-[72px] z-[4100] flex justify-center px-4">
          <div className="sh-toast font-ui flex items-center gap-2 rounded-full border border-white/20 bg-black/75 px-4 py-2 text-sm text-white shadow-xl backdrop-blur">
            {toast.icon && <Ico name={toast.icon} className="h-4 w-4" color="#ffffff" />}
            {toast.text}
          </div>
        </div>
      )}
    </div>
  );
}

/* ================================================================== */
type PillarProps = {
  b: StageBase;
  s: number;
  x: number;
  y: number;
  z: number;
  state: StageState;
  stars: number;
  theme: Theme;
  selected: boolean;
  hlKey: number;
  shakeKey: number;
  splashKey: number;
  anim: { cls: string; d: number; dur: number };
  tagRight: boolean;
  tagSpace: number;
  fade: number;
  avatar: { className: string; style: CSSProperties } | null;
  onTap: () => void;
};

function Pillar({ b, s, x, y, z, state, stars, theme, selected, hlKey, shakeKey, splashKey, anim, tagRight, tagSpace, fade, avatar, onTap }: PillarProps) {
  const up = Math.min(1.4, 1.05 / (Math.max(0.3, s) * PIL)); // labels keep ≈ the same on-screen size
  const showTag = s > 0.84 || state === "current" || selected;
  const W = pillarW(b.type) + (state === "current" ? 10 : 0);
  const C = pillarH(b.n, b.type);
  const r = 0.64; // near top-down → rounder caps
  const T = W * r;
  const CT = W * 0.14;
  // Narrow supports keep consecutive stages distinct while staying visibly solid white.
  const colW = W * 0.84 * 0.44;
  const total = T / 2 + CT + C;
  const cap = CAP[capKey(b.type, state)];
  const [cl, cm, cd] = theme.column;
  // Opaque pale metal with a white highlight: no alpha/mask, so the supports
  // read as solid 3D pillars instead of translucent shadow boxes.
  const colGrad = "linear-gradient(90deg, #6f9eaa 0%, #b7dce2 24%, #ffffff 47%, #e5f4f6 66%, #628f9b 100%)";
  void cl;
  void cm;
  void cd;
  void theme;
  const locked = state === "locked";

  return (
    <div
      className="absolute"
      style={{ left: x, top: y, width: W, height: total, transform: `translate(-50%,-100%) scale(${s * PIL})`, transformOrigin: "50% 100%", zIndex: z, opacity: fade, pointerEvents: fade < 0.3 ? "none" : undefined }}
    >
      {/* floor shadow */}
      <span className="pointer-events-none absolute rounded-[50%]" style={{ left: W * 0.32, bottom: -T * 0.28, width: W * 1.2, height: T * 0.6, background: "radial-gradient(ellipse, rgba(0,0,0,.34), rgba(0,0,0,0) 70%)" }} />
      {/* soft foam where the column meets the water */}
      <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 rounded-[50%]" style={{ top: total - T * 0.32, width: colW * 1.9, height: T * 0.42, background: "radial-gradient(ellipse, rgba(255,255,255,0) 40%, rgba(255,255,255,.9) 56%, rgba(255,255,255,0) 74%)" }} />
      {splashKey > 0 && <span key={splashKey} className="a qm-splash pointer-events-none absolute left-1/2 rounded-[50%] border-[3px] border-white/85" style={v({ top: total - T * 0.4, width: W * 1.6, height: T * 0.8, "--d": "0ms", "--dur": "650ms" })} />}
      {anim.cls === "a q3-rise" && <span className="a qm-splash pointer-events-none absolute left-1/2 rounded-[50%] border-[3px] border-white/85" style={v({ top: total - T * 0.4, width: W * 1.6, height: T * 0.8, "--d": `${anim.d + 60}ms`, "--dur": "700ms" })} />}

      <div className={anim.cls} style={v({ position: "relative", width: W, height: total, transformOrigin: "50% 100%", "--d": `${anim.d}ms`, "--dur": `${anim.dur}ms` })}>
        <button data-gloss="off" key={shakeKey} onClick={onTap} onPointerEnter={hoverSfx} className={`absolute inset-0 block appearance-none border-0 bg-transparent p-0 text-inherit ${shakeKey ? "sh-shake" : ""}`}>
          {/* column */}
          <span
            className="absolute"
            style={{
              left: (W - colW) / 2,
              top: T / 2 + CT * 0.5,
              width: colW,
              height: C + CT * 0.5 + T * 0.3,
              background: colGrad,
              borderRadius: `0 0 ${colW / 2}px ${colW / 2}px / 0 0 ${T * 0.3}px ${T * 0.3}px`,
              opacity: 1,
              filter: undefined,
            }}
          >
            <span className="absolute inset-y-0 left-[30%] w-[18%] bg-gradient-to-r from-white/0 via-white/45 to-white/0" />
          </span>
          {/* cap rim (thickness) */}
          <span className="absolute left-0 top-0" style={{ width: W, height: T + CT, borderRadius: `${W / 2}px / ${T / 2}px`, background: `linear-gradient(90deg, ${cap.rim[1]}, ${cap.rim[0]} 38%, ${cap.rim[0]} 62%, ${cap.rim[1]})`, boxShadow: "0 4px 8px rgba(0,0,0,.25)" }} />
          {/* cap top */}
          <span
            className="absolute left-0 top-0 grid place-items-center rounded-[50%]"
            style={{
              width: W,
              height: T,
              background: `radial-gradient(ellipse at 45% 35%, ${cap.top[0]}, ${cap.top[1]} 55%, ${cap.top[2]})`,
              boxShadow: `inset 0 -${T * 0.12}px 0 rgba(0,0,0,.12), inset 0 ${T * 0.08}px 0 rgba(255,255,255,.5)${state === "current" ? ", 0 0 26px 8px rgba(150,255,140,.75)" : ""}`,
            }}
          >
            {/* the stage's wheel lies on the cap (foreshortened like the cap) */}
            <span className="absolute left-1/2 top-1/2 overflow-hidden rounded-[50%]" style={{ width: W * 0.86, height: T * 0.86, transform: "translate(-50%,-50%)" }}>
              <span className="absolute left-1/2 top-1/2 block" style={{ width: W * 0.86, height: W * 0.86, transform: `translate(-50%,-50%) scaleY(${r})`, filter: locked ? "grayscale(.5) brightness(.85)" : undefined }}>
                {b.type === "boss" ? (
                  <span className="grid h-full w-full place-items-center rounded-full" style={{ background: "radial-gradient(circle, #ff6b6b, #991b1b)" }}>
                    <Ico name="swords" className="h-[60%] w-[60%]" color="#ffffff" />
                  </span>
                ) : (
                  <WheelBadge kind={wheelOf(b.n)} />
                )}
              </span>
            </span>
            <span className="pointer-events-none absolute inset-x-[18%] top-[6%] h-[26%] rounded-[50%] bg-white/30" />
          </span>
          {/* number badge on the front of the rim */}
          <span
            className="font-title absolute left-1/2 grid -translate-x-1/2 place-items-center rounded-full border-2 border-white leading-none text-white"
            style={{ top: T - 10 + CT / 2, width: 25, height: 25, fontSize: b.n >= 100 ? 9.5 : 12.5, background: badgeBg(b.type, state), boxShadow: "0 3px 0 rgba(0,0,0,.35)", textShadow: "0 2px 0 rgba(0,0,0,.35)", zIndex: 2 }}
          >
            {b.n}
          </span>
          {state === "current" && <span className="qm-ping pointer-events-none absolute left-0 top-0 rounded-[50%] border-[3px] border-[#d4ffc2]" style={{ width: W, height: T }} />}
          {selected && <span className="qm-ping pointer-events-none absolute left-0 top-0 rounded-[50%] border-[3px] border-white" style={{ width: W, height: T }} />}
          {hlKey > 0 && <span key={hlKey} className="qm-hl pointer-events-none absolute left-0 top-0 rounded-[50%]" style={{ width: W, height: T }} />}
        </button>

        {/* decorations */}
        {state === "done" && (
          <div className="pointer-events-none absolute left-1/2 flex -translate-x-1/2 items-end gap-0.5" style={{ top: -15, zIndex: 3 }}>
            {[0, 1, 2].map((i) => (
              <svg key={i} viewBox="0 0 24 24" className={i === 1 ? "mb-1.5 h-[18px] w-[18px]" : "h-[15px] w-[15px]"}>
                <path d="M12 2l2.9 6.3 6.9.7-5.2 4.6 1.5 6.8L12 17l-6.1 3.4 1.5-6.8L2.2 9l6.9-.7z" fill={i < stars ? "#ffd23f" : "#4b5b70"} stroke={i < stars ? "#9a5b00" : "#26313f"} strokeWidth="1.8" strokeLinejoin="round" />
              </svg>
            ))}
          </div>
        )}
        {locked && (
          <span className="pointer-events-none absolute grid h-5 w-5 place-items-center rounded-md border-[1.5px] border-[#1e293b] bg-gradient-to-b from-[#475569] to-[#1e293b] shadow" style={{ left: W - 12, top: T * 0.05 - 3 }}>
            <Ico name="lock" className="h-3 w-3" color="#e2e8f0" />
          </span>
        )}
        {showTag && (
          <span
            className="pointer-events-none absolute flex items-center overflow-hidden whitespace-nowrap rounded-full border-2 border-white/25 bg-black/65 shadow-[0_4px_10px_rgba(0,0,0,.35)] backdrop-blur-sm"
            style={{ top: T * 0.18, maxWidth: Math.max(60, (tagSpace - 14) / (s * PIL * up)), ...(tagRight ? { left: W + 8 * up } : { right: W + 8 * up }), transform: `scale(${up})`, transformOrigin: tagRight ? "0 50%" : "100% 50%" }}
          >
            <span className={`font-title px-2 py-[3px] text-[13px] leading-none ${b.type === "boss" ? "bg-[#dc2626] text-white" : b.type === "special" ? "bg-[#f59e0b] text-[#3a2400]" : locked ? "bg-white/15 text-white/80" : "bg-[#16a34a] text-white"}`}>
              {b.n}
            </span>
            <span className="font-title min-w-0 truncate px-2 py-[3px] text-[13px] leading-none text-white">{b.name.toUpperCase()}</span>
          </span>
        )}
        {/* ---------- characters standing ON the board ---------- */}
        {(() => {
          const battle = b.type === "boss" && state === "current";
          const showBoss = b.type === "boss";
          const showMe = !!avatar;
          const BOSS = battle ? 92 : 100; // 2× the old boss marker
          const ME = 80; // 2× the old player marker
          const bossFoot = battle ? { x: W * 0.68, y: T * 0.4 } : { x: W / 2, y: T * 0.62 };
          const meFoot = battle ? { x: W * 0.3, y: T * 0.8 } : { x: W / 2, y: T * 0.62 };
          const shadow = (x: number, y: number, w: number) => (
            <span className="pointer-events-none absolute rounded-[50%] bg-black/30" style={{ left: x - w / 2, top: y - w * 0.13, width: w, height: w * 0.26, filter: "blur(1.5px)", zIndex: 3 }} />
          );
          return (
            <>
              {showBoss && (
                <>
                  {shadow(bossFoot.x, bossFoot.y, BOSS * 0.62)}
                  <div className="pointer-events-none absolute" style={{ left: bossFoot.x - BOSS / 2, top: bossFoot.y - BOSS * 0.94, width: BOSS, height: BOSS, zIndex: 4 }}>
                    <span className="float block h-full w-full" style={{ filter: locked ? "grayscale(.55) brightness(.85)" : undefined }}>
                      {b.head ? <HeadArt kind={b.head} className="h-full w-full drop-shadow-[0_6px_5px_rgba(0,40,70,.35)]" /> : <Ico name={b.icon} className="h-full w-full" color="#ffffff" />}
                    </span>
                    <span className="font-title absolute -top-1 left-1/2 -translate-x-1/2 rounded-md bg-[#dc2626] px-1.5 py-[1px] text-[9px] leading-none text-white shadow">BOSS</span>
                  </div>
                </>
              )}
              {showMe && (
                <>
                  {shadow(meFoot.x, meFoot.y, ME * 0.62)}
                  <div className="pointer-events-none absolute" style={{ left: meFoot.x - ME / 2, top: meFoot.y - ME * 0.98, width: ME, height: ME, zIndex: 5 }}>
                    <div {...avatar} style={{ ...avatar!.style, width: "100%", height: "100%" }}>
                      <div className="float relative h-full w-full">
                        <Avatar seed={999} me bg={false} className="h-full w-full drop-shadow-[0_6px_5px_rgba(0,40,70,.35)]" />
                        <span className="qm-arrow font-title absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white px-2 py-[1px] text-[10px] leading-tight text-[#0f5c24] shadow">YOU</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
              {battle && <span className="font-title pointer-events-none absolute left-1/2 -translate-x-1/2 rounded-full bg-[#dc2626] px-2 py-[2px] text-[10px] leading-none text-white shadow" style={{ top: T * 0.62, zIndex: 6 }}>VS</span>}
            </>
          );
        })()}
      </div>
    </div>
  );
}

/* =====================================================================
   beach water caustics (seamless tile, generated once)
   ===================================================================== */
const CAUSTIC = (() => {
  const T = 240;
  let x = 1234;
  const r = () => ((x = (x * 9301 + 49297) % 233280) / 233280);
  const blobs: string[] = [];
  for (let gy = 0; gy < 4; gy++)
    for (let gx = 0; gx < 4; gx++) {
      const cx = gx * 60 + 30 + (r() - 0.5) * 22;
      const cy = gy * 60 + 30 + (r() - 0.5) * 22;
      const rad = 20 + r() * 9;
      const pts: string[] = [];
      for (let k = 0; k < 9; k++) {
        const a = (k / 9) * Math.PI * 2;
        const rr = rad * (0.78 + r() * 0.42);
        pts.push(`${(Math.cos(a) * rr).toFixed(1)} ${(Math.sin(a) * rr).toFixed(1)}`);
      }
      const d = `M${pts.join(" L")} Z`;
      for (const ox of [-T, 0, T]) for (const oy of [-T, 0, T]) blobs.push(`<path transform="translate(${(cx + ox).toFixed(1)} ${(cy + oy).toFixed(1)})" d="${d}"/>`);
    }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${T}" height="${T}"><filter id="b"><feGaussianBlur stdDeviation="1.1"/></filter><g fill="none" stroke="#ffffff" stroke-width="3.4" stroke-linejoin="round" opacity=".55" filter="url(#b)">${blobs.join("")}</g></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
})();

/** decorative beach objects floating around the stages (top-down view) */
function BeachProp({ kind, n }: { kind: number; n: number }) {
  if (kind === 0 || kind === 3)
    return (
      <div className="relative h-[96px] w-[150px]">
        <span className="absolute inset-0 rounded-[50%]" style={{ background: "radial-gradient(ellipse, rgba(190,250,255,.85) 40%, rgba(190,250,255,0) 72%)" }} />
        <span className="absolute inset-x-[14%] inset-y-[18%] rounded-[50%]" style={{ background: "radial-gradient(ellipse at 45% 38%, #fff6d6, #f6dc9a 60%, #e1b866)", boxShadow: "inset 0 -6px 0 rgba(160,110,40,.25)" }} />
        <span className="absolute left-[18%] top-[2%]">
          <Ico name="palm" className="h-[64px] w-[64px] drop-shadow-[0_6px_3px_rgba(0,60,80,.35)]" color="#16a34a" />
        </span>
        {kind === 3 && (
          <span className="absolute right-[18%] top-[22%] h-[44px] w-[44px]">
            <NewTarget kind="umbrella" u={`pu${n}`} className="h-full w-full drop-shadow-[0_4px_3px_rgba(0,60,80,.3)]" />
          </span>
        )}
      </div>
    );
  if (kind === 1)
    return (
      <div className="qm-bob relative grid h-[70px] w-[70px] place-items-center" style={v({ "--bd": `${-n * 0.3}s` })}>
        <span className="absolute h-[64px] w-[64px] rounded-full" style={{ background: "repeating-conic-gradient(#ef4444 0deg 45deg, #ffffff 45deg 90deg)", boxShadow: "0 6px 6px rgba(0,60,80,.3), inset 0 -4px 0 rgba(0,0,0,.15)" }} />
        <span className="absolute h-[30px] w-[30px] rounded-full" style={{ background: "#2bbfe0", boxShadow: "inset 0 3px 4px rgba(0,0,0,.25)" }} />
      </div>
    );
  if (kind === 2)
    return (
      <div className="qm-bob relative h-[76px] w-[76px]" style={v({ "--bd": `${-n * 0.4}s` })}>
        <Ico name="boat" className="h-full w-full drop-shadow-[0_6px_4px_rgba(0,60,80,.35)]" color="#ffffff" />
      </div>
    );
  return (
    <div className="qm-bob relative h-[46px] w-[46px]" style={v({ "--bd": `${-n * 0.5}s` })}>
      <NewTarget kind="volleyball" u={`pb${n}`} className="h-full w-full drop-shadow-[0_5px_4px_rgba(0,60,80,.35)]" />
    </div>
  );
}

/** wheel used by stage n */
const wheelOf = (n: number): TargetKind => levelConfig(n).target;

/** memoised so heavy wheel SVGs don't re-render while the camera moves */
const WheelBadge = memo(function WheelBadge({ kind }: { kind: TargetKind }) {
  return <TargetArt kind={kind} className="h-full w-full" />;
});

const badgeBg = (t: StageType, st: StageState) =>
  st === "locked" ? "linear-gradient(180deg,#94a3b8,#475569)" : t === "boss" ? "linear-gradient(180deg,#ff6b6b,#b91c1c)" : t === "special" ? "linear-gradient(180deg,#ffd23f,#d97706)" : "linear-gradient(180deg,#4ade80,#15803d)";

/** cartoon wave squiggles tile */
const WAVES = (() => {
  const W = 220;
  const H = 160;
  let x = 77;
  const r = () => ((x = (x * 9301 + 49297) % 233280) / 233280);
  const paths: string[] = [];
  for (let i = 0; i < 9; i++) {
    const cx = r() * W;
    const cy = r() * H;
    const w = 16 + r() * 18;
    const d = `M${-w} 0 q${w / 2} -6 ${w} 0 t${w} 0`;
    for (const ox of [-W, 0, W]) for (const oy of [-H, 0, H]) paths.push(`<path transform="translate(${(cx + ox).toFixed(1)} ${(cy + oy).toFixed(1)})" d="${d}"/>`);
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><g fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" opacity=".6">${paths.join("")}</g></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
})();
