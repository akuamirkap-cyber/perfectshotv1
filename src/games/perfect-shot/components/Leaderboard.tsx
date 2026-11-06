import { useEffect, useMemo, useState, type CSSProperties, type MouseEvent } from "react";
import { sfx } from "../audio/sfx";
import { hoverSfx } from "../audio/useSound";
import { useGame } from "../game/store";
import { Avatar, COUNTRY_CODE, Crown, Flag, ProfileCircle } from "../rank/Avatar";
import { LevelBadge, PodiumMedal, RankNum } from "../rank/Medal";
import { buildBoard, fmt, LB_IN, type Player } from "../rank/data";
import { Ico } from "../ui/FlatIcons";
import { Confetti } from "./Bits";

type Props = {
  leaving: boolean;
  onBack: (e: MouseEvent<HTMLElement>) => void;
  stats?: { stage: number; score: number; coins?: number };
  /**
   * Rival rows to show instead of the simulated ones.
   *
   * Game A's board is local: it owns real saved runs (`src/storage/leaderboard`),
   * so it passes them here and the page shows the player their own best runs
   * rather than a list of invented names. Game B keeps the simulated rivals so
   * the page never looks empty on a fresh install.
   */
  rivals?: Player[];
  /** Small line under the title, e.g. "TOP RUNS · OFFLINE". */
  subtitle?: string;
  /**
   * Landscape frame (760x420). The page is a tall column by default — podium
   * above the list — which leaves the list with no height at all in a 420px
   * frame. Landscape instead puts the podium/tabs on the LEFT and the scrollable
   * list on the RIGHT, so no rank is ever cropped.
   */
  landscape?: boolean;
};
const v = (o: Record<string, string | number>) => o as CSSProperties;
const STROKE = (c: string, w = 2) => ({ textShadow: `0 ${w + 1}px 0 ${c}, -${w}px 0 0 ${c}, ${w}px 0 0 ${c}, 0 -${w}px 0 ${c}, 0 6px 14px rgba(0,0,0,.4)` });
const PLACE = {
  1: { ring: "#ffcc33", glow: "rgba(255,204,51,.55)", card: ["#5a3d0a", "#2a1a05"] },
  2: { ring: "#cbd5e1", glow: "rgba(203,213,225,.45)", card: ["#33415a", "#151b2a"] },
  3: { ring: "#e2793a", glow: "rgba(226,121,58,.45)", card: ["#5a2a12", "#2a1206"] },
} as const;

function Sunburst({ color = "rgba(255,214,90,.35)", className = "" }: { color?: string; className?: string }) {
  return (
    <div className={`pointer-events-none absolute ${className}`}>
      <div
        className="spin-slow h-full w-full rounded-full"
        style={{ background: `repeating-conic-gradient(from 0deg, ${color} 0deg 9deg, transparent 9deg 22deg)`, WebkitMask: "radial-gradient(circle, #000 0%, rgba(0,0,0,.6) 30%, transparent 66%)", mask: "radial-gradient(circle, #000 0%, rgba(0,0,0,.6) 30%, transparent 66%)" }}
      />
    </div>
  );
}

function Score({ n, size = 14, color = "#67e8f9" }: { n: number; size?: number; color?: string }) {
  return (
    <span className="font-title flex items-center gap-1 leading-none" style={{ fontSize: size, color }}>
      <Ico name="gem" style={{ width: size * 0.95, height: size * 0.95 }} color={color} />
      {fmt(n)}
    </span>
  );
}

function StripeBtn({ label, icon, onClick, c, edge, compact = false }: { label: string; icon: "trophy" | "right"; onClick: () => void; c: [string, string]; edge: string; compact?: boolean }) {
  return (
    <button
      onPointerEnter={hoverSfx}
      onClick={onClick}
      className={`press relative w-full overflow-hidden rounded-2xl border-2 text-white ${compact ? "h-[44px]" : "h-[52px]"}`}
      style={{ borderColor: edge, background: `linear-gradient(180deg, ${c[0]}, ${c[1]})`, boxShadow: `0 5px 0 ${edge}, 0 10px 18px rgba(0,0,0,.35)` }}
    >
      <span className="absolute inset-0 opacity-25" style={{ background: "repeating-linear-gradient(120deg, #fff 0 10px, transparent 10px 22px)" }} />
      <span className="absolute inset-x-3 top-1 h-[36%] rounded-xl bg-white/25" />
      <span className={`font-title relative flex items-center justify-center gap-2 ${compact ? "text-[15px]" : "text-[20px]"}`} style={{ textShadow: `0 2px 0 ${edge}` }}>
        <Ico name={icon} className={compact ? "h-5 w-5" : "h-6 w-6"} color="#ffffff" />
        {label}
      </span>
    </button>
  );
}

export function Leaderboard({ leaving, onBack, stats, rivals, subtitle, landscape = false }: Props) {
  const g = useGame();
  const [view, setView] = useState<"congrats" | "board">("congrats");
  const [scope, setScope] = useState<"global" | "week">("global");
  const [vk, setVk] = useState(0);
  const [toast, setToast] = useState<{ t: string; n: number } | null>(null);
  const [entered, setEntered] = useState(false);
  const board = useMemo(() => {
    const rows = buildBoard(stats ? { ...g, stage: stats.stage, coins: stats.coins ?? g.coins } : g, scope);
    const me = rows.find((p) => p.me);
    const withStats = stats && me
      ? rows.map((p) => p.me ? { ...p, score: stats.score, stage: stats.stage } : p).sort((a, b) => b.score - a.score)
      : rows;
    if (!rivals?.length || !me) return withStats;
    // Real saved runs replace the simulated rivals; the player's own row stays.
    const mine = { ...me, score: stats?.score ?? me.score, stage: stats?.stage ?? me.stage };
    return [...rivals, mine].sort((a, b) => b.score - a.score);
  }, [g, scope, stats, rivals]);
  const myRank = board.findIndex((p) => p.me) + 1;
  const me = board[myRank - 1];
  const ahead = myRank > 1 ? board[myRank - 2] : null;
  const out = leaving;

  /* ---------------- landscape placement ----------------
   * Portrait stacks every block in one column; landscape turns the two views
   * into two columns by pinning the same blocks to named grid areas. Keys,
   * DOM order and every entrance class stay untouched. */
  type AreaName = "title" | "stage" | "avatar" | "badge" | "score" | "progress" | "stats" | "btns" | "tabs" | "podium" | "list";
  const area = (name: AreaName): CSSProperties => (landscape ? { gridArea: name } : {});
  const boardGrid: CSSProperties = landscape
    ? {
        display: "grid",
        gridTemplateColumns: "minmax(0,42fr) minmax(0,58fr)",
        gridTemplateRows: "auto minmax(0,1fr)",
        gridTemplateAreas: '"tabs list" "podium list"',
        columnGap: "10px",
        rowGap: "6px",
      }
    : {};
  const congratsGrid: CSSProperties = landscape
    ? {
        display: "grid",
        gridTemplateColumns: "minmax(0,44fr) minmax(0,56fr)",
        gridTemplateRows: "auto auto auto auto",
        gridTemplateAreas: '"avatar title" "badge stage" "score progress" "stats btns"',
        justifyItems: "center",
        columnGap: "10px",
        rowGap: "4px",
      }
    : {};
  /** A(...) + the grid area for this block, so both layouts share one markup. */
  const anim = (cls: string, t: { d: number; dur: number }, outCls: string, extra: string, name?: AreaName) => {
    const m = A(cls, t, outCls, extra);
    return { className: m.className, style: { ...m.style, ...(name ? area(name) : {}) } as CSSProperties };
  };

  useEffect(() => {
    const id = window.setTimeout(() => setEntered(true), LB_IN.ready);
    return () => clearTimeout(id);
  }, []);

  const A = (cls: string, t: { d: number; dur: number }, outCls = "out-fade", extra = "") => ({
    className: `a ${out ? outCls : cls} ${extra}`,
    style: v({ "--d": `${out ? 0 : vk === 0 ? t.d : Math.round(t.d * 0.5)}ms`, "--dur": `${out ? 320 : t.dur}ms` }),
  });

  const goBoard = () => {
    sfx.confirm();
    sfx.pageFlip(1);
    setView("board");
    setVk((k) => k + 1);
    [0, 1, 2].forEach((i) => sfx.thud(0.1 + i * 0.07, 0.5, [-0.5, 0, 0.5][i]));
    for (let i = 0; i < 6; i++) sfx.fwip(0.28 + i * 0.05, 0.4, 0.08);
  };
  const goCongrats = () => {
    sfx.tap(0, 1100);
    setView("congrats");
    setVk((k) => k + 1);
    sfx.fanfare(0.1, 0.6);
  };
  const share = async () => {
    sfx.confirm();
    const text = `I am #${myRank} on ${stats ? "Gun Hit SGA" : "Perfect Shot"} — already at Stage ${stats?.stage ?? g.stage} with ${fmt(me.score)} points! 🎯`;
    try {
      if (navigator.share) await navigator.share({ title: "Perfect Shot", text });
      else {
        await navigator.clipboard.writeText(text);
        setToast({ t: "Achievement text copied!", n: Date.now() });
      }
    } catch {
      setToast({ t: "Achievement text copied!", n: Date.now() });
    }
  };

  const top3: { p: Player; place: 1 | 2 | 3 }[] = [
    { p: board[1], place: 2 },
    { p: board[0], place: 1 },
    { p: board[2], place: 3 },
  ];
  const prog = ahead ? Math.max(0.06, Math.min(0.98, me.score / ahead.score)) : 1;

  return (
    <div className={`absolute inset-0 overflow-hidden ${entered && !out ? "" : "pointer-events-none"}`}>
      {/* background */}
      <div {...A("sh-bg-in", LB_IN.bg, "out-bg", "absolute inset-0")}>
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 18%, #3b2a8f 0%, #1e1556 45%, #0d0a2b 100%)" }} />
        <div className="absolute inset-0 opacity-[.06]" style={{ backgroundImage: "radial-gradient(#fff 1px, transparent 1.5px)", backgroundSize: "20px 20px" }} />
      </div>

      <div className={`relative flex h-full flex-col ${landscape ? "px-3 pb-2 pt-2" : "px-3.5 pb-3 pt-3"}`}>
        {/* top bar */}
        <div className="relative z-10 flex items-center gap-2">
          <div {...A("in-down", LB_IN.top(0), "out-up")}>
            <button onClick={onBack} onPointerEnter={hoverSfx} aria-label="Back" className="press grid h-12 w-12 place-items-center rounded-2xl border-2 border-[#7a4b00] bg-gradient-to-b from-[#ffe27a] to-[#f59e0b] shadow-[0_4px_0_#7a4b00,inset_0_2px_0_rgba(255,255,255,.5)]">
              <Ico name="right" className="h-7 w-7 rotate-180" color="#ffffff" />
            </button>
          </div>
          <div {...A("in-down", LB_IN.top(1), "out-up", "flex-1 text-center")}>
            <div className={`font-title leading-none text-white ${landscape ? "text-[20px]" : "text-[26px]"}`} style={STROKE("#140d3a", 2)}>
              {view === "congrats" ? "RANKING" : "LEADERBOARD"}
            </div>
            {subtitle && (
              <div className={`font-title leading-none tracking-[0.18em] text-white/55 ${landscape ? "mt-0.5 text-[9px]" : "mt-1 text-[11px]"}`}>{subtitle}</div>
            )}
          </div>
          <div {...A("in-down", LB_IN.top(2), "out-up")}>
            <button
              onPointerEnter={hoverSfx}
              onClick={view === "congrats" ? goBoard : goCongrats}
              aria-label="Switch view"
              className={`press grid place-items-center rounded-2xl border-2 border-white/20 bg-white/10 shadow-[0_4px_0_rgba(0,0,0,.35)] ${landscape ? "h-10 w-10" : "h-12 w-12"}`}
            >
              <Ico name={view === "congrats" ? "trophy" : "star"} className="h-7 w-7" color="#fde68a" />
            </button>
          </div>
        </div>

        {view === "congrats" ? (
          /* ======================= CONGRATULATION ======================= */
          <div key={`c${vk}`} className={`relative mt-3 flex min-h-0 flex-1 flex-col items-center overflow-hidden rounded-[30px] border-2 border-white/10 shadow-[0_16px_34px_rgba(0,0,0,.5)] ${landscape ? "px-3 pb-3 pt-3" : "px-4 pb-4 pt-4"}`} style={{ ...congratsGrid, background: "linear-gradient(180deg, #2c2170 0%, #1a134a 55%, #120d36 100%)" }}>
            <Sunburst className="left-1/2 top-[34%] h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2" color="rgba(255,214,90,.28)" />
            <div className="pointer-events-none absolute left-1/2 top-[34%] h-[240px] w-[240px] -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ background: "radial-gradient(circle, rgba(255,214,90,.45), transparent 65%)" }} />

            <div {...anim("gf-title-pop", LB_IN.title, "out-fade", landscape ? "relative self-center" : "relative", "title")}>
              <div className={`font-title leading-none text-[#ffd23f] ${landscape ? "text-[24px]" : "text-[34px]"}`} style={STROKE("#7c2d12", 3)}>
                CONGRATULATIONS!
              </div>
            </div>
            <div {...anim("in-pop", LB_IN.title, "out-fade", landscape ? "relative flex items-center gap-2 self-center rounded-full border-2 border-[#22c55e] bg-[#0f3b1f]/90 px-3 py-1" : "relative mt-2 flex items-center gap-2 rounded-full border-2 border-[#22c55e] bg-[#0f3b1f]/90 px-4 py-1.5", "stage")}>
              <Ico name="map" className={landscape ? "h-4 w-4" : "h-5 w-5"} color="#86efac" />
              <span className={`font-title leading-none text-[#bbf7d0] ${landscape ? "text-[13px]" : "text-[18px]"}`}>REACHED STAGE {g.stage}</span>
            </div>

            <div style={area("avatar")} className={`relative grid place-items-center ${landscape ? "mt-0" : "mt-6"}`}>
              <div {...A("in-pop", LB_IN.avatar, "out-spin", `relative rounded-full p-[5px] ${landscape ? "h-[86px] w-[86px]" : "h-[116px] w-[116px]"}`)} style={{ ...A("in-pop", LB_IN.avatar).style, background: "linear-gradient(180deg, #fff3b0, #f5b82e 50%, #a35c06)", boxShadow: "0 0 0 4px #2c2170, 0 0 34px rgba(255,204,51,.7)" }}>
                <Avatar seed={me.seed} me className="h-full w-full" />
                <span className={`absolute -bottom-1 -right-1 rounded-full bg-white p-[3px] shadow-[0_3px_6px_rgba(0,0,0,.4)] ${landscape ? "h-[30px] w-[30px]" : "h-[42px] w-[42px]"}`}>
                  <Flag c={me.country} round className="h-full w-full" />
                </span>
              </div>
              <div {...A("ac-chest-in", LB_IN.crown, "out-up", `absolute left-1/2 -translate-x-1/2 origin-bottom ${landscape ? "-top-7 w-[56px]" : "-top-10 w-[84px]"}`)} style={{ ...A("ac-chest-in", LB_IN.crown).style, rotate: "-10deg" }}>
                <Crown className="w-full drop-shadow-[0_5px_5px_rgba(0,0,0,.45)]" />
              </div>
              {!out && vk === 0 && <Confetti n={34} delay={LB_IN.crown.d + LB_IN.crown.dur * 0.5} spread={1.4} />}
            </div>

            {/* rank badge on a ribbon line */}
            <div style={area("badge")} className={`relative flex w-full items-center justify-center ${landscape ? "mt-0" : "-mt-8"}`}>
              <span className="absolute inset-x-2 top-1/2 h-[3px] -translate-y-1/2 bg-gradient-to-r from-transparent via-[#ffd23f] to-transparent" />
              <div {...A("in-pop", LB_IN.badge, "out-spin", `relative grid place-items-center ${landscape ? "h-[58px] w-[58px]" : "h-[84px] w-[84px]"}`)}>
                <svg viewBox="0 0 84 84" className="absolute inset-0 h-full w-full drop-shadow-[0_6px_8px_rgba(0,0,0,.5)]">
                  <defs>
                    <linearGradient id="lbBadge" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor="#fff3b0" />
                      <stop offset=".5" stopColor="#f5b82e" />
                      <stop offset="1" stopColor="#a35c06" />
                    </linearGradient>
                  </defs>
                  <path d="M42 3 L52 10 L64 8 L69 19 L80 25 L77 37 L83 48 L74 57 L73 70 L61 72 L52 81 L42 76 L32 81 L23 72 L11 70 L10 57 L1 48 L7 37 L4 25 L15 19 L20 8 L32 10 Z" fill="url(#lbBadge)" stroke="#5a3200" strokeWidth="2.4" strokeLinejoin="round" />
                  <circle cx="42" cy="42" r="27" fill="#3b2a8f" stroke="#5a3200" strokeWidth="2" />
                  <circle cx="42" cy="42" r="22.5" fill="none" stroke="#ffd23f" strokeWidth="1.6" strokeDasharray="3 3" />
                </svg>
                <span className={`font-title relative leading-none text-[#fde68a] ${landscape ? "text-[10px]" : "text-[13px]"}`}>#</span>
                <span className={`font-title relative -mt-1 leading-none text-white ${landscape ? "text-[20px]" : "text-[28px]"}`} style={{ textShadow: "0 2px 0 #140d3a" }}>
                  {myRank}
                </span>
              </div>
            </div>

            <div {...anim("in-up", LB_IN.score, "out-fade", landscape ? "relative flex flex-col justify-center text-center" : "relative mt-1 text-center", "score")}>
              <div className={`font-title leading-none text-white ${landscape ? "text-[16px]" : "text-[24px]"}`} style={STROKE("#140d3a", 1.5)}>
                RANK #{myRank}
              </div>
              <div className={landscape ? "mt-1 flex justify-center" : "mt-2 flex justify-center"}>
                <Score n={me.score} size={landscape ? 18 : 26} />
              </div>
            </div>

            {/* progress to the next rank */}
            <div {...anim("in-up", LB_IN.score, "out-fade", landscape ? "relative w-full rounded-2xl border border-white/10 bg-black/30 px-3 py-1.5" : "relative mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-3 py-2", "progress")}>
              {ahead ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="font-title text-[16px] text-white">#{myRank}</span>
                    <span className="font-ui text-[15px] text-white/80">
                      <b className="font-title text-[#fde68a]">{fmt(ahead.score - me.score)}</b> points to go
                    </span>
                    <span className="font-title text-[16px] text-[#fde68a]">#{myRank - 1}</span>
                  </div>
                  <div className="mt-1.5 h-3.5 overflow-hidden rounded-full border border-black/40 bg-black/50">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#22c55e] via-[#a3e635] to-[#fde047] transition-[width] duration-1000" style={{ width: `${prog * 100}%` }} />
                  </div>
                  <div className="font-ui mt-1.5 text-center text-[14px] text-white/70">to overtake <b className="text-white">{ahead.name}</b></div>
                </>
              ) : (
                <div className="font-title text-center text-[16px] text-[#fde68a]">YOU'RE THE CHAMPION! KEEP IT UP!</div>
              )}
            </div>

            {/* stats */}
            <div {...anim("in-up", LB_IN.btn(0), "out-fade", landscape ? "relative grid w-full grid-cols-3 gap-2" : "relative mt-2 grid w-full grid-cols-3 gap-2", "stats")}>
              {[
                { ic: "map" as const, l: "STAGE", v: String(g.stage), c: "#86efac" },
                { ic: "star" as const, l: "STARS", v: String(Object.values(g.stars).reduce((a, b) => a + b, 0)), c: "#fde047" },
                { ic: "coinbag" as const, l: "COINS", v: fmt(g.coins), c: "#fbbf24" },
              ].map((x) => (
                <div key={x.l} className={`flex flex-col items-center rounded-2xl border border-white/10 bg-white/[.06] ${landscape ? "py-1" : "py-1.5"}`}>
                  <Ico name={x.ic} className={landscape ? "h-5 w-5" : "h-6 w-6"} color={x.c} />
                  <span className={`font-title mt-1 leading-none text-white ${landscape ? "text-[15px]" : "text-[20px]"}`}>{x.v}</span>
                  <span className={`font-title mt-1 leading-none tracking-wider text-white/55 ${landscape ? "text-[9px]" : "text-[11px]"}`}>{x.l}</span>
                </div>
              ))}
            </div>

            <div style={area("btns")} className={landscape ? "relative grid w-full grid-cols-2 content-center gap-2" : "relative mt-auto grid w-full gap-2 pt-2"}>
              <div {...A("go-btn-in", LB_IN.btn(0))}>
                <StripeBtn compact={landscape} label="LEADERBOARD" icon="trophy" onClick={goBoard} c={["#c084fc", "#7e22ce"]} edge="#3b0764" />
              </div>
              <div {...A("go-btn-in", LB_IN.btn(1))}>
                <StripeBtn compact={landscape} label="SHARE" icon="right" onClick={share} c={["#67e8f9", "#0891b2"]} edge="#0e5a70" />
              </div>
            </div>
          </div>
        ) : (
          /* ======================= LEADERBOARD ======================= */
          <div key={`b${vk}`} style={boardGrid} className={`relative flex min-h-0 flex-1 flex-col ${landscape ? "mt-2" : "mt-3"}`}>
            <div style={area("tabs")} className="grid grid-cols-2 gap-1 rounded-2xl bg-black/35 p-1">
              {(["global", "week"] as const).map((s) => (
                <button
                  key={s}
                  onPointerEnter={hoverSfx}
                  onClick={() => {
                    if (s === scope) return;
                    sfx.tabSwitch(s === "global" ? 0 : 3);
                    setScope(s);
                    setVk((k) => k + 1);
                  }}
                  className={`font-title h-10 rounded-xl text-[15px] transition-all ${scope === s ? "bg-gradient-to-b from-[#ffe27a] to-[#f59e0b] text-[#4a2a00] shadow-[0_3px_0_#9a5b00]" : "text-white/70"}`}
                >
                  {s === "global" ? "GLOBAL" : "THIS WEEK"}
                </button>
              ))}
            </div>

            {/* top 3 */}
            <div style={area("podium")} className={`relative ${landscape ? "flex min-h-0 items-center justify-center" : "mt-2 h-[276px] shrink-0"}`}>
              <Sunburst className={landscape ? "left-1/2 top-1/2 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2" : "left-1/2 top-[44%] h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2"} color="rgba(255,214,90,.22)" />
              <div className={`relative grid w-full grid-cols-3 items-end gap-2 ${landscape ? "" : "h-full"}`}>
                {top3.map(({ p, place }, i) => {
                  const c = PLACE[place];
                  const big = place === 1;
                  return (
                    <div key={p.id} {...A("q3-rise", LB_IN.podium(place - 1), "out-down", `relative flex flex-col items-center origin-bottom ${big ? (landscape ? "pb-1" : "pb-3") : ""}`)}>
                      <div className={`relative z-10 ${landscape ? (big ? "-mb-6 h-[68px] w-[68px]" : "-mb-5 h-[58px] w-[58px]") : (big ? "-mb-7 h-[96px] w-[96px]" : "-mb-6 h-[80px] w-[80px]")}`}>
                        <PodiumMedal n={place} className="h-full w-full drop-shadow-[0_5px_6px_rgba(0,0,0,.5)]" />
                      </div>
                      <div
                        className={`relative flex w-full flex-col items-center rounded-[22px] border-[3px] ${landscape ? "px-1 pb-2 pt-6" : "px-1.5 pb-3 pt-7"}`}
                        style={{ borderColor: c.ring, background: `linear-gradient(180deg, ${c.card[0]}, ${c.card[1]})`, boxShadow: `0 0 22px ${c.glow}, 0 10px 18px rgba(0,0,0,.45)` }}
                      >
                        <ProfileCircle seed={p.seed} me={p.me} country={p.country} size={landscape ? (big ? 64 : 54) : (big ? 84 : 66)} ring={`linear-gradient(180deg, #ffffff, ${c.ring})`} />
                        <div className={`font-title w-full truncate text-center leading-none text-white ${landscape ? "mt-1" : "mt-2"} ${landscape ? (big ? "text-[13px]" : "text-[12px]") : (big ? "text-[16px]" : "text-[14px]")}`}>{p.me ? "YOU" : p.name.split(" ")[0].toUpperCase()}</div>
                        <div className="mt-1 flex items-center gap-1">
                          <Flag c={p.country} className="h-[10px] w-[15px]" />
                          <span className={`font-title leading-none text-white/70 ${landscape ? "text-[9px]" : "text-[10px]"}`}>{COUNTRY_CODE[p.country]}</span>
                        </div>
                        <div className={landscape ? "mt-1" : "mt-1.5"}>
                          <Score n={p.score} size={landscape ? (big ? 12 : 11) : (big ? 15 : 13)} />
                        </div>
                      </div>
                      {i === 1 && <span className="pointer-events-none absolute -top-3 left-1/2 h-4 w-4 -translate-x-1/2 animate-ping rounded-full bg-[#fde68a]/40" />}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* list */}
            <div style={area("list")} className={`relative flex min-h-0 flex-1 flex-col rounded-[24px] border-2 border-white/10 bg-gradient-to-b from-[#241a63]/95 to-[#120d36]/95 shadow-[0_10px_24px_rgba(0,0,0,.45)] ${landscape ? "mt-0 p-1.5" : "mt-2 p-2"}`}>
              <div className={`no-scrollbar smooth-scroll min-h-0 flex-1 overflow-y-auto pb-1 ${landscape ? "space-y-1" : "space-y-2"}`}>
                {board.slice(3).map((p, i) => (
                  <div key={`${scope}${p.id}`} {...A("ac-row-in", LB_IN.row(Math.min(i, 10)), "out-fade")}>
                    <Row p={p} rank={i + 4} compact={landscape} />
                  </div>
                ))}
              </div>
              <div {...A("in-up", LB_IN.row(6), "out-down", landscape ? "mt-1.5" : "mt-2")}>
                <Row p={me} rank={myRank} sticky compact={landscape} />
              </div>
            </div>
          </div>
        )}
      </div>

      {toast && (
        <div key={toast.n} className="pointer-events-none absolute inset-x-0 top-[84px] z-40 flex justify-center px-4">
          <div className="sh-toast font-ui rounded-full border border-[#67e8f9]/50 bg-[#0c2f45]/90 px-4 py-2 text-[15px] text-white shadow-xl backdrop-blur">{toast.t}</div>
        </div>
      )}
    </div>
  );
}

function Row({ p, rank, sticky = false, compact = false }: { p: Player; rank: number; sticky?: boolean; compact?: boolean }) {
  return (
    <div
      className={`flex items-center ${compact ? "gap-1.5 rounded-[12px] px-2 py-[3px]" : "gap-2.5 rounded-[20px] px-2.5 py-2"} ${p.me ? "bg-gradient-to-r from-[#8a5a0c] via-[#6b4508] to-[#3b2a0a] ring-2 ring-[#fde68a]" : "bg-gradient-to-r from-[#2f2580]/80 to-[#211a5c]/80 ring-1 ring-white/[.08]"} ${sticky ? "shadow-[0_-6px_16px_rgba(0,0,0,.35)]" : ""}`}
    >
      <RankNum n={rank} me={p.me} size={compact ? 24 : 38} />
      <ProfileCircle seed={p.seed} me={p.me} country={p.country} size={compact ? 26 : 48} ring={p.me ? "linear-gradient(180deg,#fff3b0,#f5b82e)" : "linear-gradient(180deg,#ffffff,#8b7cf6)"} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className={`font-title truncate leading-tight ${compact ? "text-[11.5px]" : "text-[16px]"} ${p.me ? "text-[#fde68a]" : "text-white"}`}>{p.me ? "YOU" : p.name}</span>
        </div>
        <div className={`flex items-center ${compact ? "mt-0.5 gap-1.5" : "mt-1 gap-2"}`}>
          <span className={`font-title shrink-0 rounded bg-black/30 leading-none text-white/80 ${compact ? "px-1 py-px text-[7.5px]" : "rounded-md px-1.5 py-[2px] text-[10px]"}`}>{COUNTRY_CODE[p.country]}</span>
          <Score n={p.score} size={compact ? 10 : 14} />
          <span className={`font-title flex items-center gap-0.5 leading-none text-[#4ade80] ${compact ? "text-[8.5px]" : "text-[12px]"}`}>
            <Ico name="up" className={compact ? "h-2 w-2" : "h-3 w-3"} color="#4ade80" />
            {fmt(p.trend)}
          </span>
        </div>
      </div>
      <LevelBadge lv={p.stage} me={p.me} size={compact ? 26 : 48} />
    </div>
  );
}
