import type { ReactNode } from "react";

/* =====================================================================
   10 NEW WHEELS — viewBox -100 -100 200 200, radius ≈ 98
   Fruit: durian (split), kiwi, dragon fruit, pineapple, apple
   Balls: soccer, basketball, tennis, baseball, bowling
   ===================================================================== */
export type NewKind = "durian" | "kiwi" | "dragonfruit" | "pineapple" | "apple" | "soccer" | "basketball" | "tennis" | "baseball" | "bowling" | "carrom" | "carrom2" | "casino" | "volleyball" | "umbrella" | "starfish" | "coconut" | "eightball" | "moon" | "mars" | "jupiter" | "pluto" | "eyeball" | "ufo" | "dartboard" | "disco" | "icecream" | "spiral" | "ornament" | "peppermint" | "friedegg" | "pearl" | "quailegg" | "grapesoda" | "cannon";
export const NEW_KINDS: NewKind[] = ["durian", "kiwi", "dragonfruit", "pineapple", "apple", "soccer", "basketball", "tennis", "baseball", "bowling", "carrom", "carrom2", "casino", "volleyball", "umbrella", "starfish", "coconut", "eightball", "moon", "mars", "jupiter", "pluto", "eyeball", "ufo", "dartboard", "disco", "icecream", "spiral", "ornament", "peppermint", "friedegg", "pearl", "quailegg", "grapesoda", "cannon"];

const rad = (d: number) => (d * Math.PI) / 180;
const P = (r: number, deg: number) => [Math.cos(rad(deg)) * r, Math.sin(rad(deg)) * r] as const;
const f = (n: number) => n.toFixed(2);
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}
/** glossy highlight arc used by every wheel */
const Shine = ({ r = 82, o = 0.5 }: { r?: number; o?: number }) => (
  <path d={`M${f(-r * 0.78)} ${f(-r * 0.55)} A${r} ${r} 0 0 1 ${f(-r * 0.22)} ${f(-r * 0.94)}`} stroke="#fff" strokeWidth="6" strokeLinecap="round" fill="none" opacity={o} />
);

/* ---------------- DURIAN (split — clean front view) ---------------- */
function Durian({ u }: { u: string }) {
  const N = 32;
  const spikes = Array.from({ length: N }, (_, i) => {
    const a = (i / N) * 360;
    const w = (360 / N) * 0.5;
    const [x1, y1] = P(84, a - w);
    const [x2, y2] = P(98.5, a);
    const [x3, y3] = P(84, a + w);
    const [hx, hy] = P(90, a - w * 0.35);
    return (
      <g key={i}>
        <path d={`M${f(x1)} ${f(y1)} L${f(x2)} ${f(y2)} L${f(x3)} ${f(y3)} Z`} fill="#6f9a24" stroke="#2f4a0c" strokeWidth="1.8" strokeLinejoin="round" />
        <path d={`M${f(x1)} ${f(y1)} L${f(x2)} ${f(y2)} L${f(hx)} ${f(hy)} Z`} fill="#9cc94a" opacity=".55" />
      </g>
    );
  });
  // one smooth pod per chamber (pointing outward)
  const pod = "M0 -30 C15 -31 21 -16 20 -2 C19 13 12 24 0 25 C-12 24 -19 13 -20 -2 C-21 -16 -15 -31 0 -30 Z";
  return (
    <>
      <defs>
        <radialGradient id={`${u}husk`}>
          <stop offset=".86" stopColor="#7fa82e" />
          <stop offset="1" stopColor="#4d7316" />
        </radialGradient>
        <radialGradient id={`${u}flesh`} cx=".5" cy=".5">
          <stop offset="0" stopColor="#fbf6e4" />
          <stop offset="1" stopColor="#efe4c2" />
        </radialGradient>
        <radialGradient id={`${u}pod`} cx=".38" cy=".3">
          <stop offset="0" stopColor="#fff6c0" />
          <stop offset=".45" stopColor="#ffd84a" />
          <stop offset="1" stopColor="#e6a512" />
        </radialGradient>
      </defs>
      {spikes}
      <circle r="86" fill={`url(#${u}husk)`} stroke="#2f4a0c" strokeWidth="3" />
      <circle r="78" fill="#d9e8a8" stroke="#a9c25e" strokeWidth="1.5" />
      <circle r="74" fill={`url(#${u}flesh)`} />
      {[0, 1, 2, 3, 4].map((k) => {
        const [x, y] = P(74, -90 + k * 72);
        return <line key={k} x1="0" y1="0" x2={f(x)} y2={f(y)} stroke="#fffdf5" strokeWidth="6" strokeLinecap="round" />;
      })}
      {[0, 1, 2, 3, 4].map((k) => {
        const ang = -54 + k * 72;
        const [cx, cy] = P(41, ang);
        return (
          <g key={`p${k}`} transform={`translate(${f(cx)} ${f(cy)}) rotate(${ang + 90})`}>
            <path d={pod} transform="translate(0 2)" fill="#b8820b" opacity=".35" />
            <path d={pod} fill={`url(#${u}pod)`} stroke="#b07a08" strokeWidth="2" />
            <path d="M-12 -8 Q0 -3 12 -8 M-14 8 Q0 13 14 8" stroke="#e0a514" strokeWidth="1.6" fill="none" strokeLinecap="round" opacity=".8" />
            <ellipse cx="-7" cy="-17" rx="6" ry="3.6" fill="#fff" opacity=".7" transform="rotate(-20 -7 -17)" />
          </g>
        );
      })}
      <circle r="8" fill="#f3ead0" stroke="#d8cba0" strokeWidth="1.5" />
      <Shine r={92} o={0.3} />
    </>
  );
}

/* ---------------- KIWI ---------------- */
function Kiwi({ u }: { u: string }) {
  const hairs: ReactNode[] = [];
  for (let i = 0; i < 72; i++) {
    const a = (i / 72) * 360;
    const [x1, y1] = P(91, a);
    const [x2, y2] = P(98.5, a + 3);
    hairs.push(<line key={i} x1={f(x1)} y1={f(y1)} x2={f(x2)} y2={f(y2)} stroke="#b07a45" strokeWidth="1.4" opacity=".8" />);
  }
  const seeds: ReactNode[] = [];
  [
    [33, 0],
    [43, 8],
  ].forEach(([r, off], ring) => {
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * 360 + off;
      const [x, y] = P(r, a);
      seeds.push(<ellipse key={`${ring}-${i}`} cx={f(x)} cy={f(y)} rx="2.6" ry="5.6" fill="#1c1309" transform={`rotate(${a + 90} ${f(x)} ${f(y)})`} />);
    }
  });
  const rays: ReactNode[] = [];
  for (let i = 0; i < 28; i++) {
    const a = (i / 28) * 360 + 4;
    const [x1, y1] = P(24, a);
    const [x2, y2] = P(82, a);
    rays.push(<line key={i} x1={f(x1)} y1={f(y1)} x2={f(x2)} y2={f(y2)} stroke="#e4f3a6" strokeWidth="2.2" opacity=".5" />);
  }
  return (
    <>
      <defs>
        <radialGradient id={`${u}fl`}>
          <stop offset="0" stopColor="#eef7b8" />
          <stop offset=".3" stopColor="#bcdc4e" />
          <stop offset=".85" stopColor="#7fac24" />
          <stop offset="1" stopColor="#5f8a17" />
        </radialGradient>
      </defs>
      <circle r="98" fill="#7a4b24" stroke="#45280f" strokeWidth="4" />
      {hairs}
      <circle r="89" fill={`url(#${u}fl)`} stroke="#5a7f14" strokeWidth="1.5" />
      {rays}
      {seeds}
      <ellipse rx="21" ry="17" fill="#f8f6dc" stroke="#e4e2b4" strokeWidth="1.5" />
      {Array.from({ length: 12 }).map((_, i) => {
        const [x, y] = P(15, i * 30);
        return <line key={i} x1="0" y1="0" x2={f(x * 1.2)} y2={f(y)} stroke="#e7e4b8" strokeWidth="1.2" />;
      })}
      <Shine />
    </>
  );
}

/* ---------------- DRAGON FRUIT ---------------- */
function Dragon({ u }: { u: string }) {
  const r = rng(77);
  const seeds: ReactNode[] = [];
  for (let i = 0; i < 150; i++) {
    const rr = Math.sqrt(r()) * 72;
    const a = r() * 360;
    const [x, y] = P(rr, a);
    seeds.push(<ellipse key={i} cx={f(x)} cy={f(y)} rx="1.5" ry="2.3" fill="#141014" transform={`rotate(${f(r() * 180)} ${f(x)} ${f(y)})`} />);
  }
  const scales: ReactNode[] = [];
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * 360 + 6;
    const [b1x, b1y] = P(84, a - 9);
    const [b2x, b2y] = P(84, a + 9);
    const [tx, ty] = P(99, a + 4);
    const [cx, cy] = P(95, a - 6);
    scales.push(
      <path key={i} d={`M${f(b1x)} ${f(b1y)} Q${f(cx)} ${f(cy)} ${f(tx)} ${f(ty)} Q${f(P(90, a + 9)[0])} ${f(P(90, a + 9)[1])} ${f(b2x)} ${f(b2y)} Z`} fill={`url(#${u}sc)`} stroke="#8a0f45" strokeWidth="1.6" strokeLinejoin="round" />,
    );
  }
  return (
    <>
      <defs>
        <radialGradient id={`${u}fl`}>
          <stop offset="0" stopColor="#ffffff" />
          <stop offset=".75" stopColor="#fbf3f1" />
          <stop offset="1" stopColor="#f3dbe2" />
        </radialGradient>
        <linearGradient id={`${u}sc`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ef4c95" />
          <stop offset=".65" stopColor="#e63a88" />
          <stop offset="1" stopColor="#8bc34a" />
        </linearGradient>
      </defs>
      <circle r="94" fill="#df2f7f" stroke="#8a0f45" strokeWidth="4" />
      {scales}
      <circle r="83" fill="#f7a6c8" />
      <circle r="80" fill={`url(#${u}fl)`} />
      {seeds}
      <Shine r={76} o={0.55} />
    </>
  );
}

/* ---------------- PINEAPPLE ---------------- */
function Pineapple({ u }: { u: string }) {
  const tiles: ReactNode[] = [];
  for (let i = 0; i < 30; i++) {
    const a = (i / 30) * 360;
    const pts = [P(89, a - 6), P(94, a), P(89, a + 6), P(84, a)].map(([x, y]) => `${f(x)} ${f(y)}`);
    tiles.push(<path key={i} d={`M${pts.join(" L")} Z`} fill={i % 2 ? "#c58820" : "#a86d13"} stroke="#6b4209" strokeWidth="1.2" />);
  }
  const fibers: ReactNode[] = [];
  for (let i = 0; i < 56; i++) {
    const a = (i / 56) * 360;
    const [x1, y1] = P(22, a);
    const [x2, y2] = P(80, a);
    fibers.push(<line key={i} x1={f(x1)} y1={f(y1)} x2={f(x2)} y2={f(y2)} stroke={i % 2 ? "#fff1a3" : "#f0b81c"} strokeWidth={i % 2 ? 1.8 : 1} opacity=".6" />);
  }
  return (
    <>
      <defs>
        <radialGradient id={`${u}fl`}>
          <stop offset="0" stopColor="#fff8cf" />
          <stop offset=".3" stopColor="#ffde52" />
          <stop offset="1" stopColor="#f1a800" />
        </radialGradient>
      </defs>
      <circle r="98" fill="#b8781a" stroke="#6b4209" strokeWidth="4" />
      {tiles}
      <circle r="83" fill={`url(#${u}fl)`} stroke="#d48e00" strokeWidth="1.5" />
      {fibers}
      {Array.from({ length: 16 }).map((_, i) => {
        const [x, y] = P(76, (i / 16) * 360 + 11);
        return <circle key={i} cx={f(x)} cy={f(y)} r="2.6" fill="#a8740f" opacity=".8" />;
      })}
      <circle r="20" fill="#fff4c8" stroke="#e5be4e" strokeWidth="2" />
      <circle r="13" fill="none" stroke="#f3d77a" strokeWidth="1.2" />
      <Shine />
    </>
  );
}

/* ---------------- APPLE (cross-section star) ---------------- */
function Apple({ u }: { u: string }) {
  return (
    <>
      <defs>
        <radialGradient id={`${u}sk`} cx=".4" cy=".35">
          <stop offset=".85" stopColor="#e63946" />
          <stop offset="1" stopColor="#9d0208" />
        </radialGradient>
        <radialGradient id={`${u}fl`}>
          <stop offset="0" stopColor="#fffcf0" />
          <stop offset=".7" stopColor="#fbefd2" />
          <stop offset="1" stopColor="#f1dcac" />
        </radialGradient>
      </defs>
      <circle r="98" fill={`url(#${u}sk)`} stroke="#5c0010" strokeWidth="4" />
      <circle r="91" fill={`url(#${u}fl)`} />
      <circle r="91" fill="none" stroke="#f6c9a0" strokeWidth="2" opacity=".7" />
      {Array.from({ length: 10 }).map((_, i) => {
        const [x, y] = P(56, i * 36 + 18);
        return <circle key={i} cx={f(x)} cy={f(y)} r="2.4" fill="#e3cb92" />;
      })}
      <circle r="56" fill="none" stroke="#efdcae" strokeWidth="1.4" strokeDasharray="3 5" />
      {[0, 1, 2, 3, 4].map((k) => (
        <g key={k} transform={`rotate(${k * 72})`}>
          <path d="M0 -6 C10 -16 10 -36 0 -46 C-10 -36 -10 -16 0 -6 Z" fill="#f2e3b5" stroke="#d6bd7c" strokeWidth="2" />
          <path d="M0 -14 C5 -20 5 -30 0 -36 C-5 -30 -5 -20 0 -14 Z" fill="#5b3410" />
          <ellipse cx="-1.6" cy="-28" rx="1.4" ry="3.6" fill="#a9733a" opacity=".8" />
        </g>
      ))}
      <circle r="5" fill="#ead6a0" />
      <Shine />
    </>
  );
}

/* ---------------- SOCCER BALL ---------------- */
function Soccer({ u }: { u: string }) {
  const R0 = 24;
  const D = 74;
  const RO = 23;
  const SQ = 0.66;
  const pent = (cx: number, cy: number, r: number, rot: number) =>
    Array.from({ length: 5 }, (_, j) => P(r, rot + j * 72)).map(([x, y]) => [x + cx, y + cy] as const);
  const center = pent(0, 0, R0, -90);
  // outer pentagons in the direction of each central vertex, foreshortened
  const outer = Array.from({ length: 5 }, (_, k) => {
    const th = -90 + k * 72;
    const ux = Math.cos(rad(th));
    const uy = Math.sin(rad(th));
    const tx = -uy;
    const ty = ux;
    const cx = ux * D;
    const cy = uy * D;
    return Array.from({ length: 5 }, (_, j) => {
      const a = rad(j * 72);
      const lx = RO * Math.sin(a);
      const ly = RO * Math.cos(a) * SQ;
      return [cx + lx * tx - ly * ux, cy + lx * ty - ly * uy] as const;
    });
  });
  const poly = (pts: readonly (readonly [number, number])[]) => `M${pts.map(([x, y]) => `${f(x)} ${f(y)}`).join(" L")} Z`;
  const seams: string[] = [];
  outer.forEach((o, k) => {
    seams.push(`M${f(center[k][0])} ${f(center[k][1])} L${f(o[0][0])} ${f(o[0][1])}`);
    const n = outer[(k + 1) % 5];
    seams.push(`M${f(o[1][0])} ${f(o[1][1])} L${f(n[4][0])} ${f(n[4][1])}`);
    [2, 3].forEach((j) => {
      const [x, y] = o[j];
      const len = Math.hypot(x, y);
      seams.push(`M${f(x)} ${f(y)} L${f((x / len) * 104)} ${f((y / len) * 104)}`);
    });
  });
  return (
    <>
      <defs>
        <radialGradient id={`${u}b`} cx=".38" cy=".32">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset=".7" stopColor="#eef1f4" />
          <stop offset="1" stopColor="#b9c2cc" />
        </radialGradient>
        <radialGradient id={`${u}sh`}>
          <stop offset=".6" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity=".28" />
        </radialGradient>
        <clipPath id={`${u}c`}>
          <circle r="96" />
        </clipPath>
      </defs>
      <circle r="98" fill={`url(#${u}b)`} stroke="#1f2937" strokeWidth="4" />
      <g clipPath={`url(#${u}c)`}>
        <path d={seams.join(" ")} stroke="#4b5563" strokeWidth="2.2" fill="none" />
        <path d={poly(center)} fill="#111827" stroke="#111827" strokeWidth="3" strokeLinejoin="round" />
        {outer.map((o, k) => (
          <path key={k} d={poly(o)} fill="#111827" stroke="#111827" strokeWidth="3" strokeLinejoin="round" />
        ))}
        <circle r="96" fill={`url(#${u}sh)`} />
      </g>
      <ellipse cx="-34" cy="-46" rx="20" ry="11" fill="#fff" opacity=".55" transform="rotate(-35 -34 -46)" />
    </>
  );
}

/* ---------------- BASKETBALL ---------------- */
function Basketball({ u }: { u: string }) {
  const r = rng(13);
  const dots: ReactNode[] = [];
  for (let i = 0; i < 110; i++) {
    const rr = Math.sqrt(r()) * 92;
    const [x, y] = P(rr, r() * 360);
    dots.push(<circle key={i} cx={f(x)} cy={f(y)} r="1.3" fill="#7a2e05" opacity=".22" />);
  }
  return (
    <>
      <defs>
        <radialGradient id={`${u}b`} cx=".38" cy=".32">
          <stop offset="0" stopColor="#ffb469" />
          <stop offset=".55" stopColor="#f07a1e" />
          <stop offset="1" stopColor="#b34a0b" />
        </radialGradient>
        <clipPath id={`${u}c`}>
          <circle r="96" />
        </clipPath>
      </defs>
      <circle r="98" fill={`url(#${u}b)`} stroke="#3b1a05" strokeWidth="4" />
      <g clipPath={`url(#${u}c)`}>
        {dots}
        <path d="M0 -100 V100 M-100 0 H100 M-70 -72 C-28 -34 -28 34 -70 72 M70 -72 C28 -34 28 34 70 72" stroke="#1f1308" strokeWidth="5" fill="none" strokeLinecap="round" />
      </g>
      <ellipse cx="-36" cy="-46" rx="18" ry="10" fill="#fff" opacity=".4" transform="rotate(-35 -36 -46)" />
    </>
  );
}

/* ---------------- TENNIS BALL ---------------- */
function Tennis({ u }: { u: string }) {
  const r = rng(29);
  const fuzz: ReactNode[] = [];
  for (let i = 0; i < 160; i++) {
    const rr = Math.sqrt(r()) * 94;
    const [x, y] = P(rr, r() * 360);
    const a = r() * 360;
    const [dx, dy] = P(2.6, a);
    fuzz.push(<line key={i} x1={f(x)} y1={f(y)} x2={f(x + dx)} y2={f(y + dy)} stroke={i % 3 ? "#f6ff9e" : "#a5c21a"} strokeWidth="1.2" opacity=".55" />);
  }
  const seam = "M-58 -80 C-10 -40 -10 40 -58 80 M58 -80 C10 -40 10 40 58 80";
  return (
    <>
      <defs>
        <radialGradient id={`${u}b`} cx=".38" cy=".32">
          <stop offset="0" stopColor="#f6ff8a" />
          <stop offset=".55" stopColor="#d5ec34" />
          <stop offset="1" stopColor="#9bb914" />
        </radialGradient>
        <clipPath id={`${u}c`}>
          <circle r="96" />
        </clipPath>
      </defs>
      <circle r="98" fill={`url(#${u}b)`} stroke="#5f7a0a" strokeWidth="4" />
      <g clipPath={`url(#${u}c)`}>
        {fuzz}
        <path d={seam} stroke="#bcc79e" strokeWidth="12" fill="none" strokeLinecap="round" />
        <path d={seam} stroke="#ffffff" strokeWidth="7" fill="none" strokeLinecap="round" />
      </g>
      <ellipse cx="-34" cy="-46" rx="18" ry="10" fill="#fff" opacity=".35" transform="rotate(-35 -34 -46)" />
    </>
  );
}

/* ---------------- BASEBALL ---------------- */
function Baseball({ u }: { u: string }) {
  const curves: [number, number][][] = [
    [
      [-60, -78],
      [-18, -38],
      [-18, 38],
      [-60, 78],
    ],
    [
      [60, -78],
      [18, -38],
      [18, 38],
      [60, 78],
    ],
  ];
  const stitches: ReactNode[] = [];
  curves.forEach((c, ci) => {
    for (let i = 1; i < 14; i++) {
      const t = i / 14;
      const m = 1 - t;
      const x = m * m * m * c[0][0] + 3 * m * m * t * c[1][0] + 3 * m * t * t * c[2][0] + t * t * t * c[3][0];
      const y = m * m * m * c[0][1] + 3 * m * m * t * c[1][1] + 3 * m * t * t * c[2][1] + t * t * t * c[3][1];
      const dx = 3 * m * m * (c[1][0] - c[0][0]) + 6 * m * t * (c[2][0] - c[1][0]) + 3 * t * t * (c[3][0] - c[2][0]);
      const dy = 3 * m * m * (c[1][1] - c[0][1]) + 6 * m * t * (c[2][1] - c[1][1]) + 3 * t * t * (c[3][1] - c[2][1]);
      const L = Math.hypot(dx, dy);
      const tx = dx / L;
      const ty = dy / L;
      const nx = -ty;
      const ny = tx;
      const s = 7;
      const back = 3.5;
      stitches.push(
        <path
          key={`${ci}-${i}`}
          d={`M${f(x + nx * s - tx * back)} ${f(y + ny * s - ty * back)} L${f(x)} ${f(y)} L${f(x - nx * s - tx * back)} ${f(y - ny * s - ty * back)}`}
          stroke="#d62828"
          strokeWidth="2.6"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />,
      );
    }
  });
  return (
    <>
      <defs>
        <radialGradient id={`${u}b`} cx=".38" cy=".32">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset=".65" stopColor="#f3eee2" />
          <stop offset="1" stopColor="#cfc6b0" />
        </radialGradient>
      </defs>
      <circle r="98" fill={`url(#${u}b)`} stroke="#857b66" strokeWidth="4" />
      <path d="M-60 -78 C-18 -38 -18 38 -60 78 M60 -78 C18 -38 18 38 60 78" stroke="#e2dac5" strokeWidth="4" fill="none" />
      {stitches}
      <ellipse cx="-34" cy="-48" rx="18" ry="10" fill="#fff" opacity=".6" transform="rotate(-35 -34 -48)" />
    </>
  );
}

/* ---------------- BOWLING BALL ---------------- */
function Bowling({ u }: { u: string }) {
  const hole = (x: number, y: number, r: number, k: number) => (
    <g key={k}>
      <circle cx={x} cy={y + 1.5} r={r + 2.5} fill="#000" opacity=".35" />
      <circle cx={x} cy={y} r={r + 2} fill="#8f7bd9" opacity=".55" />
      <circle cx={x} cy={y} r={r} fill={`url(#${u}hole)`} />
      <path d={`M${x - r * 0.7} ${y - r * 0.4} A${r} ${r} 0 0 1 ${x + r * 0.6} ${y - r * 0.6}`} stroke="#c9bdf5" strokeWidth="1.4" fill="none" opacity=".7" />
    </g>
  );
  return (
    <>
      <defs>
        <radialGradient id={`${u}b`} cx=".36" cy=".3">
          <stop offset="0" stopColor="#7b52e0" />
          <stop offset=".45" stopColor="#3f1f99" />
          <stop offset="1" stopColor="#130833" />
        </radialGradient>
        <radialGradient id={`${u}hole`} cx=".5" cy=".65">
          <stop offset="0" stopColor="#020007" />
          <stop offset="1" stopColor="#1a0f3d" />
        </radialGradient>
        <clipPath id={`${u}c`}>
          <circle r="96" />
        </clipPath>
      </defs>
      <circle r="98" fill={`url(#${u}b)`} stroke="#080317" strokeWidth="4" />
      <g clipPath={`url(#${u}c)`} opacity=".9">
        <path d="M-110 20 C-60 -10 -40 60 10 40 C50 25 60 -30 110 -20 L110 0 C60 -10 55 45 10 60 C-40 78 -60 12 -110 40 Z" fill="#a78bfa" opacity=".28" />
        <path d="M-100 -60 C-50 -80 -10 -30 30 -50 C60 -65 80 -90 110 -80 L110 -68 C80 -78 62 -52 30 -38 C-12 -20 -50 -66 -100 -48 Z" fill="#22d3ee" opacity=".22" />
        <path d="M-90 70 C-40 50 0 100 60 80 L60 92 C0 112 -40 64 -90 82 Z" fill="#f0abfc" opacity=".2" />
      </g>
      {hole(-16, -34, 9, 0)}
      {hole(16, -34, 9, 1)}
      {hole(0, 2, 11, 2)}
      <ellipse cx="-42" cy="-52" rx="24" ry="13" fill="#fff" opacity=".5" transform="rotate(-35 -42 -52)" />
      <circle cx="-56" cy="-34" r="4" fill="#fff" opacity=".7" />
    </>
  );
}


/* ---------------- CARROM STRIKER (mandala / lotus) ---------------- */
function Striker({ u, lotus = false }: { u: string; lotus?: boolean }) {
  const pal = lotus
    ? { b0: "#24439c", b1: "#0b1640", a: "#f472b6", b: "#fbcfe8", c: "#22d3ee", d: "#fbbf24", line: "#081133" }
    : { b0: "#fffaf0", b1: "#ecd7ad", a: "#b91c1c", b: "#0f766e", c: "#f59e0b", d: "#1e3a8a", line: "#5a2a0a" };
  const ring = (n: number, off: number, el: (i: number) => ReactNode) =>
    Array.from({ length: n }, (_, i) => (
      <g key={`${n}-${off}-${i}`} transform={`rotate(${off + (i * 360) / n})`}>
        {el(i)}
      </g>
    ));
  return (
    <>
      <defs>
        <radialGradient id={`${u}b`} cx=".45" cy=".4">
          <stop offset="0" stopColor={pal.b0} />
          <stop offset="1" stopColor={pal.b1} />
        </radialGradient>
        <linearGradient id={`${u}rim`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff3b0" />
          <stop offset=".45" stopColor="#d99a1e" />
          <stop offset="1" stopColor="#6b3a05" />
        </linearGradient>
        <linearGradient id={`${u}pet`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#be185d" />
          <stop offset=".6" stopColor="#f472b6" />
          <stop offset="1" stopColor="#fdf2f8" />
        </linearGradient>
      </defs>
      <circle r="98" fill={`url(#${u}rim)`} stroke="#1a1020" strokeWidth="3" />
      <circle r="93" fill="none" stroke="#fff" strokeOpacity=".45" strokeWidth="1.5" />
      <circle r="90" fill={`url(#${u}b)`} stroke={pal.line} strokeWidth="2" />
      {/* outer scallops */}
      {ring(24, 0, (i) => (
        <path d="M0 -75 C7 -79 9 -86 0 -89.5 C-9 -86 -7 -79 0 -75 Z" fill={i % 2 ? pal.c : pal.a} stroke={pal.line} strokeWidth="1" />
      ))}
      {ring(48, 3.75, () => <circle cx="0" cy="-72" r="1.5" fill={pal.d} />)}
      <circle r="68" fill="none" stroke={pal.line} strokeWidth="1.3" />
      <circle r="65" fill={pal.b} opacity=".1" />
      {lotus ? (
        <>
          {ring(8, 22.5, () => <path d="M0 -10 C22 -30 18 -56 0 -66 C-18 -56 -22 -30 0 -10 Z" fill="#9d174d" stroke={pal.line} strokeWidth="1.3" />)}
          {ring(8, 0, () => (
            <g>
              <path d="M0 -8 C20 -28 16 -54 0 -64 C-16 -54 -20 -28 0 -8 Z" fill={`url(#${u}pet)`} stroke={pal.line} strokeWidth="1.3" />
              <path d="M0 -16 V-56" stroke="#fdf2f8" strokeOpacity=".7" strokeWidth="1.2" />
            </g>
          ))}
          {ring(16, 11.25, () => <path d="M0 -30 C4 -35 4 -40 0 -44 C-4 -40 -4 -35 0 -30 Z" fill={pal.c} opacity=".9" />)}
          <circle r="16" fill={pal.d} stroke={pal.line} strokeWidth="1.5" />
          {ring(10, 0, () => <circle cx="0" cy="-10" r="2" fill="#7c2d12" />)}
          <circle r="5" fill="#fff7d6" stroke={pal.line} strokeWidth="1" />
        </>
      ) : (
        <>
          {ring(12, 0, () => (
            <g>
              <path d="M0 -30 C10 -42 10 -54 0 -64 C-10 -54 -10 -42 0 -30 Z" fill={pal.b} stroke={pal.line} strokeWidth="1.3" />
              <path d="M0 -36 V-58" stroke={pal.c} strokeWidth="1.4" />
            </g>
          ))}
          {ring(12, 15, () => <path d="M0 -40 C5 -46 5 -52 0 -58 C-5 -52 -5 -46 0 -40 Z" fill={pal.c} stroke={pal.line} strokeWidth="1" />)}
          {ring(24, 7.5, () => <circle cx="0" cy="-34" r="1.6" fill={pal.a} />)}
          <circle r="28" fill={pal.a} stroke={pal.line} strokeWidth="1.5" />
          {ring(8, 0, () => <path d="M0 -8 C6 -14 6 -21 0 -26 C-6 -21 -6 -14 0 -8 Z" fill={pal.d} stroke={pal.line} strokeWidth="1.1" />)}
          {ring(8, 22.5, () => <circle cx="0" cy="-20" r="1.8" fill="#fde68a" />)}
          <circle r="7" fill={pal.c} stroke={pal.line} strokeWidth="1.2" />
          <circle r="2.6" fill="#fff" />
        </>
      )}
      <Shine r={88} o={0.45} />
    </>
  );
}
function Carrom({ u }: { u: string }) {
  return <Striker u={u} />;
}
function Carrom2({ u }: { u: string }) {
  return <Striker u={u} lotus />;
}

/* ---------------- CASINO CHIP ---------------- */
function Casino({ u }: { u: string }) {
  const suit = (k: number, x: number, y: number) => {
    if (k === 3)
      return (
        <g key={k} transform={`translate(${x} ${y})`} fill="#111827">
          <circle cx="0" cy="-4.6" r="4.2" />
          <circle cx="-4.8" cy="1.4" r="4.2" />
          <circle cx="4.8" cy="1.4" r="4.2" />
          <path d="M-1.3 1 L-3.2 9.5 H3.2 L1.3 1 Z" />
        </g>
      );
    const d = [
      "M0 -9 C6 -3 10 1 6 5 C3 7 1 5 0 3 L2 9 H-2 L0 3 C-1 5 -3 7 -6 5 C-10 1 -6 -3 0 -9 Z", // spade
      "M0 8 C-6 2 -10 -2 -6 -6 C-3 -8 0 -6 0 -3 C0 -6 3 -8 6 -6 C10 -2 6 2 0 8 Z", // heart
      "M0 -9 L6.5 0 L0 9 L-6.5 0 Z", // diamond
    ][k];
    return <path key={k} d={d} transform={`translate(${x} ${y})`} fill={k === 1 || k === 2 ? "#dc2626" : "#111827"} />;
  };
  return (
    <>
      <defs>
        <radialGradient id={`${u}ch`} cx=".42" cy=".35">
          <stop offset="0" stopColor="#ff5a5a" />
          <stop offset=".7" stopColor="#d4142a" />
          <stop offset="1" stopColor="#8a0a18" />
        </radialGradient>
        <linearGradient id={`${u}au`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff3b0" />
          <stop offset=".45" stopColor="#f5b82e" />
          <stop offset="1" stopColor="#a86400" />
        </linearGradient>
        <radialGradient id={`${u}in`} cx=".45" cy=".4">
          <stop offset="0" stopColor="#fffdf4" />
          <stop offset="1" stopColor="#efe2c4" />
        </radialGradient>
        <clipPath id={`${u}c`}>
          <circle r="96" />
        </clipPath>
        <path id={`${u}tp`} d="M-69 0 A69 69 0 1 1 69 0 A69 69 0 1 1 -69 0" />
      </defs>
      <circle r="98" fill={`url(#${u}ch)`} stroke="#4a0410" strokeWidth="4" />
      <g clipPath={`url(#${u}c)`}>
        {Array.from({ length: 8 }).map((_, i) => (
          <g key={i} transform={`rotate(${i * 45 + 22.5})`}>
            <rect x="-11" y="-100" width="22" height="19" rx="2.5" fill="#ffffff" />
            <rect x="-7" y="-96" width="14" height="11" rx="1.5" fill="none" stroke="#d4142a" strokeWidth="1.4" />
          </g>
        ))}
      </g>
      <circle r="79" fill="none" stroke="#ffffff" strokeWidth="2.6" strokeDasharray="7 6" />
      <circle r="62" fill={`url(#${u}au)`} stroke="#5a3200" strokeWidth="2" />
      <text fontSize="9" fill="#ffffff" style={{ fontFamily: "'Russo One', sans-serif" }}>
        <textPath href={`#${u}tp`} startOffset="0" textLength="424" lengthAdjust="spacing">
          ★ PERFECT SHOT ★ CASINO ★ HIGH ROLLER ★ JACKPOT
        </textPath>
      </text>
      <circle r="55" fill={`url(#${u}in)`} stroke="#a86400" strokeWidth="2" />
      <circle r="49" fill="none" stroke="#d4142a" strokeWidth="1.4" strokeDasharray="2 3" />
      {suit(0, 0, -34)}
      {suit(1, 34, 0)}
      {suit(2, 0, 34)}
      {suit(3, -34, 0)}
      <text x="0" y="10" textAnchor="middle" fontSize="30" fill="#d4142a" stroke="#5f0f0f" strokeWidth="1.2" style={{ fontFamily: "'Russo One', sans-serif" }}>
        100
      </text>
      <Shine r={88} o={0.4} />
    </>
  );
}


/* ---------------- shared sphere shading ---------------- */
function SphereDefs({ u, c0, c1 }: { u: string; c0: string; c1: string }) {
  return (
    <>
      <radialGradient id={`${u}base`} cx=".4" cy=".35">
        <stop offset="0" stopColor={c0} />
        <stop offset="1" stopColor={c1} />
      </radialGradient>
      <radialGradient id={`${u}shd`} cx=".4" cy=".36" r=".72">
        <stop offset=".55" stopColor="#000" stopOpacity="0" />
        <stop offset="1" stopColor="#000" stopOpacity=".5" />
      </radialGradient>
      <clipPath id={`${u}clip`}>
        <circle r="96" />
      </clipPath>
    </>
  );
}
const Gloss = () => <ellipse cx="-36" cy="-46" rx="20" ry="11" fill="#fff" opacity=".45" transform="rotate(-35 -36 -46)" />;

/* ---------------- VOLLEYBALL ---------------- */
function Volleyball({ u }: { u: string }) {
  const cols = ["#1d4ed8", "#facc15", "#f8fafc"];
  const ctrl = (a: number) => P(60, a - 40);
  const qp = (c: readonly [number, number], e: readonly [number, number], t: number) => [2 * (1 - t) * t * c[0] + t * t * e[0], 2 * (1 - t) * t * c[1] + t * t * e[1]] as const;
  const seams: string[] = [];
  const sectors = [0, 1, 2].map((k) => {
    const a = k * 120 - 90;
    const e1 = P(98, a);
    const c1 = ctrl(a);
    const e2 = P(98, a + 120);
    const c2 = ctrl(a + 120);
    seams.push(`M0 0 Q${f(c1[0])} ${f(c1[1])} ${f(e1[0])} ${f(e1[1])}`);
    [0.36, 0.66].forEach((t) => {
      const st = qp(c2, e2, t);
      const end = P(98, a + 120 * t);
      const cc = [st[0] + c1[0] * (1 - t), st[1] + c1[1] * (1 - t)];
      seams.push(`M${f(st[0])} ${f(st[1])} Q${f(cc[0])} ${f(cc[1])} ${f(end[0])} ${f(end[1])}`);
    });
    return <path key={k} d={`M0 0 Q${f(c1[0])} ${f(c1[1])} ${f(e1[0])} ${f(e1[1])} A98 98 0 0 1 ${f(e2[0])} ${f(e2[1])} Q${f(c2[0])} ${f(c2[1])} 0 0 Z`} fill={cols[k]} />;
  });
  return (
    <>
      <defs>
        <SphereDefs u={u} c0="#fff" c1="#fff" />
      </defs>
      <circle r="98" fill="#f8fafc" stroke="#1e293b" strokeWidth="4" />
      <g clipPath={`url(#${u}clip)`}>
        {sectors}
        <path d={seams.join(" ")} stroke="#1e293b" strokeWidth="2.6" fill="none" strokeLinecap="round" />
        <circle r="96" fill={`url(#${u}shd)`} />
      </g>
      <Gloss />
    </>
  );
}

/* ---------------- BEACH UMBRELLA (top view) ---------------- */
function Umbrella({ u }: { u: string }) {
  const C = ["#ef4444", "#f97316", "#facc15", "#22c55e", "#06b6d4", "#3b82f6", "#a855f7", "#ec4899"];
  return (
    <>
      <defs>
        <radialGradient id={`${u}sh`}>
          <stop offset="0" stopColor="#fff" stopOpacity=".35" />
          <stop offset=".5" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity=".25" />
        </radialGradient>
      </defs>
      {C.map((c, i) => {
        const a0 = i * 45 - 112.5;
        const a1 = a0 + 45;
        const p0 = P(93, a0);
        const p1 = P(93, a1);
        const bl = P(104, (a0 + a1) / 2);
        const md = P(96, (a0 + a1) / 2);
        return (
          <g key={i}>
            <path d={`M0 0 L${f(p0[0])} ${f(p0[1])} Q${f(bl[0])} ${f(bl[1])} ${f(p1[0])} ${f(p1[1])} Z`} fill={c} stroke="#1a1020" strokeWidth="2.6" strokeLinejoin="round" />
            <path d={`M0 0 L${f(p0[0])} ${f(p0[1])} L${f(md[0])} ${f(md[1])} Z`} fill="#fff" opacity=".18" />
          </g>
        );
      })}
      <circle r="93" fill={`url(#${u}sh)`} />
      {C.map((_, i) => {
        const [x, y] = P(93, i * 45 - 112.5);
        return (
          <g key={`r${i}`}>
            <line x1="0" y1="0" x2={f(x)} y2={f(y)} stroke="#1a1020" strokeOpacity=".45" strokeWidth="1.4" />
            <circle cx={f(x)} cy={f(y)} r="3.4" fill="#fef3c7" stroke="#1a1020" strokeWidth="1.4" />
          </g>
        );
      })}
      <circle r="11" fill="#fef3c7" stroke="#1a1020" strokeWidth="2.4" />
      <circle r="4.5" fill="#d97706" />
      <path d="M-62 -40 A72 72 0 0 1 -12 -72" stroke="#fff" strokeWidth="5" fill="none" opacity=".45" strokeLinecap="round" />
    </>
  );
}

/* ---------------- STARFISH ---------------- */
function Starfish({ u }: { u: string }) {
  let d = "";
  for (let i = 0; i < 5; i++) {
    const ang = i * 72 - 90;
    const v0 = P(34, ang - 36);
    const v1 = P(34, ang + 36);
    if (i === 0) d += `M${f(v0[0])} ${f(v0[1])}`;
    const c1 = P(58, ang - 15);
    const t1 = P(84, ang - 6);
    const tp = P(95, ang);
    const t2 = P(84, ang + 6);
    const c2 = P(58, ang + 15);
    d += ` Q${f(c1[0])} ${f(c1[1])} ${f(t1[0])} ${f(t1[1])} Q${f(tp[0])} ${f(tp[1])} ${f(t2[0])} ${f(t2[1])} Q${f(c2[0])} ${f(c2[1])} ${f(v1[0])} ${f(v1[1])}`;
  }
  d += " Z";
  const r = rng(19);
  const bubbles = Array.from({ length: 14 }, (_, i) => {
    const [x, y] = P(70 + r() * 22, r() * 360);
    return <circle key={i} cx={f(x)} cy={f(y)} r={f(1.5 + r() * 3)} fill="none" stroke="#fff" strokeOpacity=".7" strokeWidth="1.2" />;
  });
  return (
    <>
      <defs>
        <radialGradient id={`${u}w`} cx=".5" cy=".45">
          <stop offset="0" stopColor="#99f6e4" />
          <stop offset=".75" stopColor="#2dd4bf" />
          <stop offset="1" stopColor="#0f766e" />
        </radialGradient>
        <radialGradient id={`${u}s`} cx=".45" cy=".4">
          <stop offset="0" stopColor="#ffd2a8" />
          <stop offset=".55" stopColor="#fb923c" />
          <stop offset="1" stopColor="#c2410c" />
        </radialGradient>
      </defs>
      <circle r="98" fill={`url(#${u}w)`} stroke="#115e59" strokeWidth="4" />
      {[0, 1, 2].map((i) => (
        <path key={i} d={`M-90 ${-30 + i * 34} q12 -6 24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0`} stroke="#ccfbf1" strokeOpacity=".35" strokeWidth="2" fill="none" />
      ))}
      {bubbles}
      <path d={d} transform="translate(3 5)" fill="#0f766e" opacity=".45" />
      <path d={d} fill={`url(#${u}s)`} stroke="#7c2d12" strokeWidth="3" strokeLinejoin="round" />
      {[0, 1, 2, 3, 4].map((i) => {
        const ang = i * 72 - 90;
        return (
          <g key={i}>
            {[18, 28, 38, 48, 58, 68, 77].map((rr, j) => {
              const [x, y] = P(rr, ang);
              return <circle key={j} cx={f(x)} cy={f(y)} r={f(3.4 - j * 0.3)} fill="#ffedd5" stroke="#c2410c" strokeWidth=".8" />;
            })}
            {[30, 46, 62].map((rr, j) => {
              const [x1, y1] = P(rr, ang - 12 + j * 2.5);
              const [x2, y2] = P(rr, ang + 12 - j * 2.5);
              return (
                <g key={`s${j}`}>
                  <circle cx={f(x1)} cy={f(y1)} r="1.6" fill="#fdba74" />
                  <circle cx={f(x2)} cy={f(y2)} r="1.6" fill="#fdba74" />
                </g>
              );
            })}
          </g>
        );
      })}
      <circle r="10" fill="#fed7aa" stroke="#c2410c" strokeWidth="1.5" />
      <Shine r={92} o={0.35} />
    </>
  );
}

/* ---------------- COCONUT (halved) ---------------- */
function Coconut({ u }: { u: string }) {
  const r = rng(53);
  const fibers = Array.from({ length: 110 }, (_, i) => {
    const a = r() * 360;
    const rr = 82 + r() * 14;
    const [x1, y1] = P(rr, a);
    const [x2, y2] = P(rr + 2 + r() * 4, a + (r() - 0.5) * 16);
    return <line key={i} x1={f(x1)} y1={f(y1)} x2={f(x2)} y2={f(y2)} stroke={i % 3 ? "#5a3212" : "#a8743f"} strokeWidth="1.3" strokeLinecap="round" />;
  });
  return (
    <>
      <defs>
        <radialGradient id={`${u}m`} cx=".45" cy=".4">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#ece2cb" />
        </radialGradient>
        <radialGradient id={`${u}wt`} cx=".4" cy=".35">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset=".6" stopColor="#eef5f2" />
          <stop offset="1" stopColor="#cfe0dc" />
        </radialGradient>
      </defs>
      <circle r="98" fill="#7a4a22" stroke="#3b2210" strokeWidth="4" />
      {fibers}
      <circle r="80" fill="#3b2412" stroke="#24150a" strokeWidth="2" />
      <circle r="75" fill={`url(#${u}m)`} />
      <circle r="58" fill="none" stroke="#e3d8c0" strokeWidth="1.5" />
      <circle r="54" fill={`url(#${u}wt)`} stroke="#d9cfb6" strokeWidth="1.5" />
      <ellipse cx="-12" cy="-16" rx="26" ry="14" fill="#fff" opacity=".7" transform="rotate(-25 -12 -16)" />
      <circle cx="20" cy="18" r="4" fill="#fff" opacity=".8" />
      <Shine r={88} o={0.3} />
    </>
  );
}

/* ---------------- 8-BALL ---------------- */
function EightBall({ u }: { u: string }) {
  return (
    <>
      <defs>
        <SphereDefs u={u} c0="#4b5563" c1="#050505" />
      </defs>
      <circle r="98" fill={`url(#${u}base)`} stroke="#000" strokeWidth="4" />
      <ellipse cx="-4" cy="-6" rx="40" ry="38" fill="#f8fafc" stroke="#d4d4d8" strokeWidth="2" />
      <text x="-4" y="13" textAnchor="middle" fontSize="54" fill="#0a0a0a" style={{ fontFamily: "'Russo One', sans-serif" }}>
        8
      </text>
      <ellipse cx="-40" cy="-50" rx="24" ry="12" fill="#fff" opacity=".35" transform="rotate(-35 -40 -50)" />
      <circle cx="-56" cy="-34" r="4.5" fill="#fff" opacity=".7" />
    </>
  );
}

/* ---------------- MOON ---------------- */
function Moon({ u }: { u: string }) {
  const r = rng(5);
  const craters = Array.from({ length: 16 }, (_, i) => {
    const rr = Math.sqrt(r()) * 78;
    const [x, y] = P(rr, r() * 360);
    const s = i < 4 ? 10 + r() * 8 : 3.5 + r() * 6;
    return (
      <g key={i}>
        <circle cx={f(x)} cy={f(y)} r={f(s)} fill="#8d97a6" />
        <circle cx={f(x + s * 0.2)} cy={f(y + s * 0.2)} r={f(s * 0.78)} fill="#b6bfcb" />
        <path d={`M${f(x - s * 0.9)} ${f(y + s * 0.3)} A${f(s)} ${f(s)} 0 0 0 ${f(x + s * 0.3)} ${f(y + s * 0.95)}`} stroke="#dde3ea" strokeWidth="1.4" fill="none" />
      </g>
    );
  });
  return (
    <>
      <defs>
        <SphereDefs u={u} c0="#eef1f5" c1="#a3acb9" />
      </defs>
      <circle r="98" fill={`url(#${u}base)`} stroke="#475569" strokeWidth="4" />
      <g clipPath={`url(#${u}clip)`}>
        <ellipse cx="-24" cy="-18" rx="34" ry="24" fill="#8d97a6" opacity=".45" />
        <ellipse cx="26" cy="22" rx="28" ry="20" fill="#8d97a6" opacity=".4" transform="rotate(25 26 22)" />
        <ellipse cx="-18" cy="44" rx="20" ry="13" fill="#8d97a6" opacity=".35" />
        {craters}
        <circle r="96" fill={`url(#${u}shd)`} />
      </g>
      <Gloss />
    </>
  );
}

/* ---------------- MARS ---------------- */
function Mars({ u }: { u: string }) {
  const r = rng(71);
  return (
    <>
      <defs>
        <SphereDefs u={u} c0="#ffad7a" c1="#a8401b" />
      </defs>
      <circle r="98" fill={`url(#${u}base)`} stroke="#5f1d08" strokeWidth="4" />
      <g clipPath={`url(#${u}clip)`}>
        <path d="M-90 -6 C-60 -30 -30 4 0 -14 C30 -32 60 -2 92 -18 L92 10 C60 24 30 -2 0 18 C-30 36 -60 8 -90 22 Z" fill="#7c2d12" opacity=".45" />
        <path d="M-60 40 C-30 30 -10 58 20 46 C40 38 60 54 80 46 L80 60 C60 70 40 54 20 62 C-10 74 -30 46 -60 56 Z" fill="#7c2d12" opacity=".35" />
        <path d="M-56 8 Q-20 -2 14 12 T72 4" stroke="#5f1d08" strokeWidth="3" fill="none" opacity=".55" strokeLinecap="round" />
        <ellipse cx="4" cy="-90" rx="42" ry="18" fill="#fff8f0" />
        <ellipse cx="-10" cy="92" rx="30" ry="12" fill="#fde7d9" opacity=".85" />
        {Array.from({ length: 10 }).map((_, i) => {
          const [x, y] = P(Math.sqrt(r()) * 70, r() * 360);
          const s = 3 + r() * 5;
          return (
            <g key={i}>
              <circle cx={f(x)} cy={f(y)} r={f(s)} fill="#8a3414" opacity=".7" />
              <circle cx={f(x + s * 0.25)} cy={f(y + s * 0.25)} r={f(s * 0.7)} fill="#d4683a" opacity=".8" />
            </g>
          );
        })}
        <circle r="96" fill={`url(#${u}shd)`} />
      </g>
      <Gloss />
    </>
  );
}

/* ---------------- JUPITER ---------------- */
function Jupiter({ u }: { u: string }) {
  const bands: [number, number, string][] = [
    [-100, 22, "#e9d6b4"], [-78, 12, "#c58b55"], [-66, 10, "#f2e3c6"], [-56, 16, "#b06b36"],
    [-40, 12, "#ecd3a8"], [-28, 20, "#d49a62"], [-8, 10, "#f6ead2"], [2, 18, "#a95c2b"],
    [20, 10, "#efdcb8"], [30, 16, "#c9844d"], [46, 14, "#f2e2c4"], [60, 12, "#b8763f"], [72, 30, "#e5cfa8"],
  ];
  const wave = (y: number, amp: number, ph: number) => {
    let d = `M-100 ${y}`;
    for (let x = -100; x <= 100; x += 10) d += ` L${x} ${f(y + Math.sin(x * 0.07 + ph) * amp)}`;
    return d;
  };
  return (
    <>
      <defs>
        <SphereDefs u={u} c0="#fff" c1="#fff" />
        <radialGradient id={`${u}grs`} cx=".45" cy=".4">
          <stop offset="0" stopColor="#f59e6b" />
          <stop offset=".6" stopColor="#c2410c" />
          <stop offset="1" stopColor="#7c2d12" />
        </radialGradient>
      </defs>
      <circle r="98" fill="#e5cfa8" stroke="#6b3d1a" strokeWidth="4" />
      <g clipPath={`url(#${u}clip)`}>
        {bands.map(([y, h, c], i) => (
          <rect key={i} x="-100" y={y} width="200" height={h + 1} fill={c} />
        ))}
        {bands.map(([y], i) => (
          <path key={`w${i}`} d={wave(y, 2.4, i)} stroke="#fff" strokeOpacity=".22" strokeWidth="2" fill="none" />
        ))}
        <ellipse cx="30" cy="30" rx="21" ry="12" fill="#f2e2c4" />
        <ellipse cx="30" cy="30" rx="17" ry="9.5" fill={`url(#${u}grs)`} />
        <ellipse cx="26" cy="27.5" rx="6" ry="2.6" fill="#fff" opacity=".35" />
        <ellipse cx="-40" cy="-46" rx="8" ry="4" fill="#fff7e6" opacity=".8" />
        <circle r="96" fill={`url(#${u}shd)`} />
      </g>
      <Gloss />
    </>
  );
}

/* ---------------- PLUTO ---------------- */
function Pluto({ u }: { u: string }) {
  const r = rng(91);
  return (
    <>
      <defs>
        <SphereDefs u={u} c0="#f5e6cb" c1="#a8845a" />
      </defs>
      <circle r="98" fill={`url(#${u}base)`} stroke="#5a3d22" strokeWidth="4" />
      <g clipPath={`url(#${u}clip)`}>
        <path d="M-96 10 C-80 -20 -50 -6 -40 20 C-32 40 -50 62 -80 66 C-100 68 -104 40 -96 10 Z" fill="#5b3b2a" opacity=".75" />
        <path d="M-60 -70 C-40 -84 -10 -80 0 -66 C-20 -60 -40 -58 -60 -70 Z" fill="#7a5638" opacity=".5" />
        <path d="M0 10 C-14 0 -20 -10 -12 -18 C-6 -24 0 -18 0 -12 C0 -18 6 -24 12 -18 C20 -10 14 0 0 10 Z" transform="translate(24 4) scale(2.6)" fill="#fff7ea" />
        <path d="M0 10 C-14 0 -20 -10 -12 -18 C-6 -24 0 -18 0 -12" transform="translate(24 4) scale(2.6)" fill="none" stroke="#e7d3b4" strokeWidth=".8" />
        {Array.from({ length: 9 }).map((_, i) => {
          const [x, y] = P(Math.sqrt(r()) * 72, r() * 360);
          const s = 2.5 + r() * 4;
          return <circle key={i} cx={f(x)} cy={f(y)} r={f(s)} fill="#8a6a48" opacity=".55" />;
        })}
        <circle r="96" fill={`url(#${u}shd)`} />
      </g>
      <Gloss />
    </>
  );
}

/* ---------------- EYEBALL ---------------- */
function Eyeball({ u }: { u: string }) {
  const r = rng(61);
  const veins = Array.from({ length: 16 }, (_, i) => {
    const a0 = i * 22.5 + r() * 10;
    let rr = 97;
    let a = a0;
    let d = `M${f(P(97, a0)[0])} ${f(P(97, a0)[1])}`;
    let branch = "";
    let step = 0;
    while (rr > 48) {
      rr -= 7 + r() * 6;
      a += (r() - 0.5) * 16;
      const [x, y] = P(rr, a);
      d += ` L${f(x)} ${f(y)}`;
      if (step === 1) {
        const [bx, by] = P(rr - 12, a + (r() > 0.5 ? 14 : -14));
        branch = `M${f(x)} ${f(y)} L${f(bx)} ${f(by)}`;
      }
      step++;
    }
    return (
      <g key={i}>
        <path d={d} stroke="#dc2626" strokeWidth="1.7" fill="none" strokeLinejoin="round" strokeLinecap="round" opacity=".65" />
        <path d={branch} stroke="#ef4444" strokeWidth="1" fill="none" strokeLinecap="round" opacity=".55" />
      </g>
    );
  });
  return (
    <>
      <defs>
        <radialGradient id={`${u}sc`} cx=".45" cy=".42">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset=".7" stopColor="#fbf3f0" />
          <stop offset="1" stopColor="#e9c9c4" />
        </radialGradient>
        <radialGradient id={`${u}ir`}>
          <stop offset="0" stopColor="#d9f99d" />
          <stop offset=".35" stopColor="#65a30d" />
          <stop offset=".8" stopColor="#166534" />
          <stop offset="1" stopColor="#052e16" />
        </radialGradient>
      </defs>
      <circle r="98" fill={`url(#${u}sc)`} stroke="#7f1d1d" strokeWidth="3" />
      {veins}
      <circle r="42" fill="#052e16" opacity=".25" />
      <circle r="40" fill={`url(#${u}ir)`} />
      {Array.from({ length: 56 }).map((_, i) => {
        const [x1, y1] = P(18, i * 6.43);
        const [x2, y2] = P(38, i * 6.43 + 4);
        return <line key={i} x1={f(x1)} y1={f(y1)} x2={f(x2)} y2={f(y2)} stroke={i % 2 ? "#bef264" : "#14532d"} strokeWidth="1" opacity=".5" />;
      })}
      <circle r="40" fill="none" stroke="#022c22" strokeWidth="3.5" />
      <circle r="17" fill="#050505" />
      <circle cx="-13" cy="-14" r="7.5" fill="#fff" opacity=".95" />
      <circle cx="9" cy="10" r="3" fill="#fff" opacity=".7" />
      <Shine r={90} o={0.4} />
    </>
  );
}


const wavyPath = (r0: number, amp: number, k: number, ph = 0, n = 140) => {
  const pts: string[] = [];
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2;
    const r = r0 + amp * Math.sin(a * k + ph) + amp * 0.45 * Math.sin(a * (k * 2 + 1) + ph * 2);
    pts.push(`${f(Math.cos(a) * r)} ${f(Math.sin(a) * r)}`);
  }
  return `M${pts.join(" L")} Z`;
};

/* ---------------- UFO (top view saucer) ---------------- */
function Ufo({ u }: { u: string }) {
  return (
    <>
      <defs>
        <radialGradient id={`${u}m`} cx=".42" cy=".36">
          <stop offset="0" stopColor="#f1f5f9" />
          <stop offset=".55" stopColor="#94a3b8" />
          <stop offset="1" stopColor="#334155" />
        </radialGradient>
        <radialGradient id={`${u}dome`} cx=".4" cy=".35">
          <stop offset="0" stopColor="#e0fbff" stopOpacity=".95" />
          <stop offset=".6" stopColor="#67e8f9" stopOpacity=".55" />
          <stop offset="1" stopColor="#0e7490" stopOpacity=".8" />
        </radialGradient>
        <filter id={`${u}gl`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.4" />
        </filter>
      </defs>
      <circle r="98" fill={`url(#${u}m)`} stroke="#0f172a" strokeWidth="4" />
      {[88, 76, 60].map((r) => (
        <circle key={r} r={r} fill="none" stroke="#1e293b" strokeWidth="2" opacity=".55" />
      ))}
      <circle r="74" fill="none" stroke="#fff" strokeOpacity=".35" strokeWidth="1.5" />
      {Array.from({ length: 12 }).map((_, i) => {
        const [x, y] = P(68, i * 30);
        const [x2, y2] = P(88, i * 30);
        return <line key={`p${i}`} x1={f(x)} y1={f(y)} x2={f(x2)} y2={f(y2)} stroke="#1e293b" strokeWidth="1.5" opacity=".45" />;
      })}
      {Array.from({ length: 12 }).map((_, i) => {
        const [x, y] = P(82, i * 30 + 15);
        const c = ["#facc15", "#22d3ee", "#f472b6"][i % 3];
        return (
          <g key={i}>
            <circle cx={f(x)} cy={f(y)} r="8" fill={c} opacity=".7" filter={`url(#${u}gl)`} />
            <circle cx={f(x)} cy={f(y)} r="4.6" fill={c} stroke="#0f172a" strokeWidth="1.4" />
            <circle cx={f(x - 1.4)} cy={f(y - 1.4)} r="1.4" fill="#fff" />
          </g>
        );
      })}
      <circle r="54" fill="#1e293b" stroke="#0f172a" strokeWidth="2.5" />
      {/* alien seen through the dome */}
      <g transform="translate(0 2)">
        <path d="M0 -30 C20 -30 28 -14 26 2 C24 18 12 32 0 34 C-12 32 -24 18 -26 2 C-28 -14 -20 -30 0 -30 Z" fill="#84cc16" stroke="#365314" strokeWidth="2.2" />
        <path d="M-4 0 C-6 -10 -20 -12 -22 -3 C-23 4 -10 8 -4 0 Z" fill="#0a0a0a" />
        <path d="M4 0 C6 -10 20 -12 22 -3 C23 4 10 8 4 0 Z" fill="#0a0a0a" />
        <ellipse cx="-14" cy="-5" rx="3" ry="1.8" fill="#fff" opacity=".85" />
        <ellipse cx="13" cy="-5" rx="3" ry="1.8" fill="#fff" opacity=".85" />
        <path d="M-4 20 Q0 23 4 20" stroke="#365314" strokeWidth="2" fill="none" strokeLinecap="round" />
      </g>
      <circle r="50" fill={`url(#${u}dome)`} stroke="#a5f3fc" strokeWidth="2" />
      <path d="M-34 -24 A40 40 0 0 1 -6 -42" stroke="#fff" strokeWidth="5" fill="none" opacity=".8" strokeLinecap="round" />
      <Shine r={92} o={0.35} />
    </>
  );
}

/* ---------------- DARTBOARD ---------------- */
function Dartboard(_: { u: string }) {
  const nums = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];
  const seg = (r0: number, r1: number, a0: number, a1: number) => {
    const [x0, y0] = P(r0, a0);
    const [x1, y1] = P(r1, a0);
    const [x2, y2] = P(r1, a1);
    const [x3, y3] = P(r0, a1);
    return `M${f(x0)} ${f(y0)} L${f(x1)} ${f(y1)} A${r1} ${r1} 0 0 1 ${f(x2)} ${f(y2)} L${f(x3)} ${f(y3)} A${r0} ${r0} 0 0 0 ${f(x0)} ${f(y0)} Z`;
  };
  return (
    <>
      <circle r="98" fill="#141414" stroke="#000" strokeWidth="4" />
      {nums.map((n, i) => {
        const a0 = -99 + i * 18;
        const a1 = a0 + 18;
        const dark = i % 2 === 0;
        const ring = dark ? "#dc2626" : "#16a34a";
        const [tx, ty] = P(87, (a0 + a1) / 2);
        return (
          <g key={i}>
            <path d={seg(8, 72, a0, a1)} fill={dark ? "#1c1917" : "#f3e7c9"} />
            <path d={seg(72, 78, a0, a1)} fill={ring} />
            <path d={seg(40, 46, a0, a1)} fill={ring} />
            <text x={f(tx)} y={f(ty + 3.6)} textAnchor="middle" fontSize="10" fill="#f8fafc" style={{ fontFamily: "'Russo One', sans-serif" }}>
              {n}
            </text>
          </g>
        );
      })}
      {nums.map((_, i) => {
        const [x0, y0] = P(8, -99 + i * 18);
        const [x1, y1] = P(78, -99 + i * 18);
        return <line key={`w${i}`} x1={f(x0)} y1={f(y0)} x2={f(x1)} y2={f(y1)} stroke="#c0c6cc" strokeWidth=".9" />;
      })}
      {[8, 40, 46, 72, 78].map((r) => (
        <circle key={r} r={r} fill="none" stroke="#c0c6cc" strokeWidth=".9" />
      ))}
      <circle r="8" fill="#16a34a" stroke="#c0c6cc" strokeWidth=".9" />
      <circle r="3.8" fill="#dc2626" stroke="#c0c6cc" strokeWidth=".9" />
      <Shine r={92} o={0.25} />
    </>
  );
}

/* ---------------- DISCO BALL ---------------- */
function Disco({ u }: { u: string }) {
  const r = rng(101);
  const tiles: ReactNode[] = [];
  const H = 8.2;
  for (let y = -96; y < 96; y += H) {
    const yc = y + H / 2;
    const w = Math.sqrt(Math.max(0, 96 * 96 - yc * yc));
    const n = Math.max(2, Math.round((2 * w) / H));
    const tw = (2 * w) / n;
    const shift = ((y / H) % 2) * (tw / 2);
    for (let i = 0; i < n; i++) {
      const x = -w + i * tw + shift * 0.3;
      const lx = (x + tw / 2) / 96;
      const ly = yc / 96;
      const light = Math.max(0, 1 - Math.hypot(lx + 0.35, ly + 0.4) * 1.1);
      const v = 70 + Math.round(r() * 60 + light * 110);
      const tint = r() < 0.1 ? ["#a5f3fc", "#f0abfc", "#fde68a"][Math.floor(r() * 3)] : `rgb(${Math.min(255, v)},${Math.min(255, v + 6)},${Math.min(255, v + 22)})`;
      tiles.push(<rect key={`${y}-${i}`} x={f(x + 0.6)} y={f(y + 0.6)} width={f(tw - 1.2)} height={f(H - 1.2)} rx=".8" fill={tint} />);
    }
  }
  const star = (x: number, y: number, s: number) => <path key={`${x}${y}`} d={`M${x} ${y - s} L${x + s * 0.22} ${y - s * 0.22} L${x + s} ${y} L${x + s * 0.22} ${y + s * 0.22} L${x} ${y + s} L${x - s * 0.22} ${y + s * 0.22} L${x - s} ${y} L${x - s * 0.22} ${y - s * 0.22} Z`} fill="#fff" />;
  return (
    <>
      <defs>
        <SphereDefs u={u} c0="#fff" c1="#fff" />
      </defs>
      <circle r="98" fill="#1e293b" stroke="#0f172a" strokeWidth="4" />
      <g clipPath={`url(#${u}clip)`}>
        {tiles}
        <circle r="96" fill={`url(#${u}shd)`} />
      </g>
      {star(-38, -44, 14)}
      {star(30, -58, 7)}
      {star(46, 30, 9)}
      {star(-56, 22, 6)}
      <circle cx="-38" cy="-44" r="18" fill="#fff" opacity=".2" />
    </>
  );
}

/* ---------------- ICE CREAM SCOOP (strawberry) ---------------- */
function IceCream({ u }: { u: string }) {
  const r = rng(23);
  // wrinkled folds: short curved light/dark strokes spread over the scoop
  const folds = Array.from({ length: 70 }, (_, i) => {
    const rr = Math.sqrt(r()) * 80;
    const a = r() * 360;
    const [x, y] = P(rr, a);
    const len = 6 + r() * 10;
    const rot = a + 90 + (r() - 0.5) * 50;
    const light = i % 2 === 0;
    return (
      <path
        key={i}
        d={`M${f(-len)} 0 q${f(len)} ${f(-3 - r() * 3)} ${f(len * 2)} 0`}
        transform={`translate(${f(x)} ${f(y)}) rotate(${f(rot)})`}
        stroke={light ? "#ffd0de" : "#d9668a"}
        strokeWidth={light ? 2.6 : 1.8}
        fill="none"
        strokeLinecap="round"
        opacity={light ? 0.8 : 0.55}
      />
    );
  });
  return (
    <>
      <defs>
        <radialGradient id={`${u}ic`} cx=".42" cy=".36">
          <stop offset="0" stopColor="#ffc2d3" />
          <stop offset=".6" stopColor="#f48fb1" />
          <stop offset="1" stopColor="#d9668a" />
        </radialGradient>
        <clipPath id={`${u}c`}>
          <path d={wavyPath(90, 2.2, 6, 0.4)} />
        </clipPath>
      </defs>
      <path d={wavyPath(93, 2.4, 6, 0.4)} fill="#b9466b" />
      <path d={wavyPath(90, 2.2, 6, 0.4)} fill={`url(#${u}ic)`} />
      <g clipPath={`url(#${u}c)`}>
        {folds}
        <path d={wavyPath(82, 2, 9, 1.3)} fill="none" stroke="#e57a9e" strokeWidth="3" opacity=".6" />
      </g>
      <ellipse cx="-30" cy="-36" rx="28" ry="15" fill="#fff" opacity=".35" transform="rotate(-35 -30 -36)" />
    </>
  );
}

/* ---------------- HYPNO SPIRAL ---------------- */
function Spiral({ u }: { u: string }) {
  let d = "";
  const turns = 5.2;
  for (let i = 0; i <= 520; i++) {
    const th = (i / 520) * turns * Math.PI * 2;
    const rr = 2 + (th / (turns * Math.PI * 2)) * 84;
    d += `${i ? "L" : "M"}${f(Math.cos(th) * rr)} ${f(Math.sin(th) * rr)} `;
  }
  return (
    <>
      <defs>
        <linearGradient id={`${u}rim`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f8fafc" />
          <stop offset=".5" stopColor="#94a3b8" />
          <stop offset="1" stopColor="#1e293b" />
        </linearGradient>
        <radialGradient id={`${u}sh`} cx=".4" cy=".36" r=".72">
          <stop offset=".6" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity=".35" />
        </radialGradient>
      </defs>
      <circle r="98" fill={`url(#${u}rim)`} stroke="#0f172a" strokeWidth="3" />
      <circle r="90" fill="#f8fafc" stroke="#0f172a" strokeWidth="2" />
      <path d={d} stroke="#0a0a0a" strokeWidth="9" fill="none" strokeLinecap="round" />
      <circle r="90" fill={`url(#${u}sh)`} />
      <ellipse cx="-34" cy="-44" rx="22" ry="11" fill="#fff" opacity=".5" transform="rotate(-35 -34 -44)" />
    </>
  );
}

/* ---------------- CHRISTMAS ORNAMENT ---------------- */
function Ornament({ u }: { u: string }) {
  return (
    <>
      <defs>
        <SphereDefs u={u} c0="#ff6b6b" c1="#7f0a12" />
        <linearGradient id={`${u}au`} x1="0" x2="1">
          <stop offset="0" stopColor="#8a5a00" />
          <stop offset=".45" stopColor="#ffe28a" />
          <stop offset="1" stopColor="#8a5a00" />
        </linearGradient>
      </defs>
      <circle r="98" fill={`url(#${u}base)`} stroke="#3f0306" strokeWidth="4" />
      <g clipPath={`url(#${u}clip)`}>
        <path d="M-100 8 Q0 34 100 8 L100 26 Q0 52 -100 26 Z" fill={`url(#${u}au)`} opacity=".95" />
        {Array.from({ length: 9 }).map((_, i) => {
          const x = -80 + i * 20;
          const y = 17 + Math.sin(((x + 100) / 200) * Math.PI) * 13;
          return <path key={i} d={`M${x} ${y - 4} L${x + 4} ${y} L${x} ${y + 4} L${x - 4} ${y} Z`} fill="#fff" opacity=".9" />;
        })}
        {[
          [-30, -38],
          [34, -30],
          [-50, 50],
          [40, 60],
        ].map(([x, y], i) => (
          <g key={i} stroke="#fecaca" strokeWidth="2" strokeLinecap="round" opacity=".55">
            <path d={`M${x - 7} ${y} H${x + 7} M${x} ${y - 7} V${y + 7} M${x - 5} ${y - 5} L${x + 5} ${y + 5} M${x + 5} ${y - 5} L${x - 5} ${y + 5}`} />
          </g>
        ))}
        <circle r="96" fill={`url(#${u}shd)`} />
      </g>
      <rect x="-16" y="-104" width="32" height="16" rx="3" fill={`url(#${u}au)`} stroke="#5a3a00" strokeWidth="2" />
      {[-10, -4, 2, 8].map((x) => (
        <line key={x} x1={x} y1="-102" x2={x} y2="-90" stroke="#8a5a00" strokeWidth="1.4" />
      ))}
      <ellipse cx="-36" cy="-42" rx="22" ry="12" fill="#fff" opacity=".55" transform="rotate(-35 -36 -42)" />
      <circle cx="-52" cy="-24" r="5" fill="#fff" opacity=".7" />
    </>
  );
}

/* ---------------- PEPPERMINT ---------------- */
function Peppermint({ u }: { u: string }) {
  const N = 8;
  const swirl = Array.from({ length: N }, (_, i) => {
    const a0 = i * (360 / N);
    const a1 = a0 + 360 / N;
    const [x0, y0] = P(90, a0);
    const [x1, y1] = P(90, a1);
    const [c0x, c0y] = P(52, a0 - 40);
    const [c1x, c1y] = P(52, a1 - 40);
    return <path key={i} d={`M0 0 Q${f(c0x)} ${f(c0y)} ${f(x0)} ${f(y0)} A90 90 0 0 1 ${f(x1)} ${f(y1)} Q${f(c1x)} ${f(c1y)} 0 0 Z`} fill={i % 2 ? "#ffffff" : "#e11d2f"} />;
  });
  return (
    <>
      <defs>
        <radialGradient id={`${u}gl`} cx=".4" cy=".35">
          <stop offset="0" stopColor="#fff" stopOpacity=".4" />
          <stop offset=".6" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity=".18" />
        </radialGradient>
      </defs>
      <circle r="98" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="3" opacity=".9" />
      <circle r="93" fill="#fff" stroke="#be123c" strokeWidth="2" />
      {swirl}
      <circle r="90" fill="none" stroke="#be123c" strokeWidth="2" />
      <circle r="9" fill="#fff" />
      <circle r="93" fill={`url(#${u}gl)`} />
      <ellipse cx="-34" cy="-46" rx="24" ry="11" fill="#fff" opacity=".6" transform="rotate(-35 -34 -46)" />
    </>
  );
}

/* ---------------- FRIED EGG (round, big yolk) ---------------- */
function FriedEgg({ u }: { u: string }) {
  return (
    <>
      <defs>
        <radialGradient id={`${u}w`} cx=".45" cy=".42">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset=".72" stopColor="#fbfaf7" />
          <stop offset="1" stopColor="#e5e1d8" />
        </radialGradient>
        <radialGradient id={`${u}y`} cx=".38" cy=".33">
          <stop offset="0" stopColor="#ffd27a" />
          <stop offset=".45" stopColor="#ff9a1f" />
          <stop offset="1" stopColor="#e66400" />
        </radialGradient>
        <radialGradient id={`${u}ys`}>
          <stop offset=".7" stopColor="#d9cdb4" stopOpacity=".55" />
          <stop offset="1" stopColor="#d9cdb4" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle r="98" fill="#d6d1c6" />
      <circle r="95" fill={`url(#${u}w)`} />
      <circle r="88" fill="none" stroke="#ffffff" strokeWidth="3" opacity=".8" />
      <circle cx="3" cy="4" r="56" fill={`url(#${u}ys)`} />
      <circle r="47" fill={`url(#${u}y)`} />
      <circle r="47" fill="none" stroke="#d65a00" strokeWidth="1.2" opacity=".6" />
      <ellipse cx="-15" cy="-17" rx="15" ry="9" fill="#fff" opacity=".55" transform="rotate(-35 -15 -17)" />
      <circle cx="16" cy="18" r="3.4" fill="#fff" opacity=".45" />
    </>
  );
}

/* ---------------- PEARL ---------------- */
function Pearl({ u }: { u: string }) {
  return (
    <>
      <defs>
        <radialGradient id={`${u}p`} cx=".38" cy=".32">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset=".35" stopColor="#f5f0f7" />
          <stop offset=".7" stopColor="#d8cfe0" />
          <stop offset="1" stopColor="#9e93ac" />
        </radialGradient>
        <linearGradient id={`${u}ir`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f9a8d4" stopOpacity=".35" />
          <stop offset=".35" stopColor="#a5f3fc" stopOpacity=".25" />
          <stop offset=".65" stopColor="#fde68a" stopOpacity=".25" />
          <stop offset="1" stopColor="#c4b5fd" stopOpacity=".35" />
        </linearGradient>
        <clipPath id={`${u}c`}>
          <circle r="96" />
        </clipPath>
      </defs>
      <circle r="98" fill={`url(#${u}p)`} stroke="#6b6278" strokeWidth="3" />
      <g clipPath={`url(#${u}c)`}>
        <circle r="96" fill={`url(#${u}ir)`} style={{ mixBlendMode: "overlay" }} />
        <path d="M-96 30 Q0 70 96 20" stroke="#fbcfe8" strokeWidth="14" fill="none" opacity=".25" />
        <path d="M-96 -10 Q0 30 96 -20" stroke="#bae6fd" strokeWidth="10" fill="none" opacity=".2" />
      </g>
      <ellipse cx="-34" cy="-40" rx="26" ry="16" fill="#fff" opacity=".8" transform="rotate(-35 -34 -40)" />
      <circle cx="-56" cy="-14" r="5" fill="#fff" opacity=".9" />
      <path d="M40 66 A70 70 0 0 0 70 34" stroke="#fff" strokeWidth="4" fill="none" opacity=".5" strokeLinecap="round" />
    </>
  );
}

/* ---------------- QUAIL EGG ---------------- */
function QuailEgg({ u }: { u: string }) {
  const r = rng(37);
  const spots = Array.from({ length: 34 }, (_, i) => {
    const [x, y] = P(Math.sqrt(r()) * 86, r() * 360);
    const big = i < 9;
    const rx = big ? 6 + r() * 7 : 1.6 + r() * 3;
    return <ellipse key={i} cx={f(x)} cy={f(y)} rx={f(rx)} ry={f(rx * (0.6 + r() * 0.4))} fill={big ? (i % 2 ? "#1c1917" : "#57534e") : "#292524"} opacity={big ? 0.85 : 0.9} transform={`rotate(${f(r() * 180)} ${f(x)} ${f(y)})`} />;
  });
  return (
    <>
      <defs>
        <SphereDefs u={u} c0="#fbf8f1" c1="#c9bfa9" />
      </defs>
      <circle r="98" fill={`url(#${u}base)`} stroke="#57534e" strokeWidth="3" />
      <g clipPath={`url(#${u}clip)`}>
        {spots}
        <circle r="96" fill={`url(#${u}shd)`} />
      </g>
      <Gloss />
    </>
  );
}

/* ---------------- GRAPE SODA BOTTLE CAP ---------------- */
function GrapeSoda({ u }: { u: string }) {
  const T = 21;
  let crimp = "";
  for (let i = 0; i < T * 2; i++) {
    const a = (i / (T * 2)) * 360 - 90;
    const [x, y] = P(i % 2 ? 89 : 98, a);
    crimp += `${i ? "L" : "M"}${f(x)} ${f(y)} `;
  }
  const word = { fontFamily: "'Russo One', sans-serif" } as const;
  return (
    <>
      <defs>
        <linearGradient id={`${u}cap`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#c7b0ef" />
          <stop offset=".5" stopColor="#8b63cf" />
          <stop offset="1" stopColor="#4c2a8f" />
        </linearGradient>
        <radialGradient id={`${u}in`} cx=".45" cy=".38">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset=".75" stopColor="#f1ecfa" />
          <stop offset="1" stopColor="#d9cdef" />
        </radialGradient>
        <linearGradient id={`${u}band`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8f68d6" />
          <stop offset="1" stopColor="#5b34a8" />
        </linearGradient>
        <clipPath id={`${u}c`}>
          <circle r="73" />
        </clipPath>
      </defs>
      <path d={crimp + "Z"} fill={`url(#${u}cap)`} stroke="#2e1365" strokeWidth="2.6" strokeLinejoin="round" />
      {Array.from({ length: T }).map((_, i) => {
        const a = (i / T) * 360 - 90;
        const [x1, y1] = P(80, a);
        const [x2, y2] = P(96, a);
        return <line key={i} x1={f(x1)} y1={f(y1)} x2={f(x2)} y2={f(y2)} stroke="#ffffff" strokeOpacity=".35" strokeWidth="2" />;
      })}
      <circle r="79" fill="#6d46b8" stroke="#2e1365" strokeWidth="2" />
      <circle r="73" fill={`url(#${u}in)`} stroke="#7b55c4" strokeWidth="2" />
      {/* grape cluster + leaf above GRAPE */}
      <g transform="translate(0 -40)">
        <path d="M2 -16 C10 -24 22 -22 26 -14 C18 -12 10 -12 2 -16 Z" fill="#4ade80" stroke="#14532d" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M6 -16 Q14 -17 22 -15" stroke="#14532d" strokeWidth="1" fill="none" />
        <path d="M0 -18 Q-1 -12 0 -8" stroke="#5b3a1a" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        {[
          [-12, -6], [-4, -6], [4, -6], [12, -6],
          [-8, 1.5], [0, 1.5], [8, 1.5],
          [-4, 9], [4, 9],
          [0, 16],
        ].map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r="5" fill="#8b5cf6" stroke="#3b1a7a" strokeWidth="1.5" />
            <circle cx={x - 1.6} cy={y - 1.6} r="1.4" fill="#ffffff" opacity=".75" />
          </g>
        ))}
      </g>
      {/* purple band with GRAPE */}
      <g clipPath={`url(#${u}c)`}>
        <rect x="-80" y="-21" width="160" height="40" fill={`url(#${u}band)`} />
        <rect x="-80" y="-21" width="160" height="3" fill="#b89ae8" />
        <rect x="-80" y="16" width="160" height="3" fill="#3f1d7a" />
      </g>
      <text x="0" y="12" textAnchor="middle" fontSize="33" fill="#ffffff" stroke="#3f1d7a" strokeWidth="3" paintOrder="stroke" style={word}>
        GRAPE
      </text>
      <text x="0" y="48" textAnchor="middle" fontSize="20" fill="#6d46b8" style={word}>
        SODA
      </text>
      <ellipse cx="-32" cy="-46" rx="22" ry="10" fill="#fff" opacity=".45" transform="rotate(-30 -32 -46)" />
    </>
  );
}


/* ---------------- CANNON BOMB ---------------- */
function Cannon({ u }: { u: string }) {
  return (
    <>
      <defs>
        <radialGradient id={`${u}b`} cx=".36" cy=".3">
          <stop offset="0" stopColor="#6b7280" />
          <stop offset=".35" stopColor="#2b2f36" />
          <stop offset="1" stopColor="#050608" />
        </radialGradient>
        <linearGradient id={`${u}m`} x1="0" x2="1">
          <stop offset="0" stopColor="#3f4650" />
          <stop offset=".5" stopColor="#c7ced6" />
          <stop offset="1" stopColor="#3f4650" />
        </linearGradient>
        <radialGradient id={`${u}sp`}>
          <stop offset="0" stopColor="#ffffff" />
          <stop offset=".35" stopColor="#fff176" />
          <stop offset=".7" stopColor="#ff9800" />
          <stop offset="1" stopColor="#ff5722" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* fuse + spark (sits on the rim) */}
      <path d="M44 -74 C56 -96 76 -94 82 -108" stroke="#5b3a1a" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M44 -74 C56 -96 76 -94 82 -108" stroke="#c49a6c" strokeWidth="2" fill="none" strokeDasharray="3 4" strokeLinecap="round" />
      <circle cx="82" cy="-108" r="16" fill={`url(#${u}sp)`} />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
        const [x, y] = P(14, a);
        return <line key={a} x1="82" y1="-108" x2={f(82 + x)} y2={f(-108 + y)} stroke="#fff59d" strokeWidth="2" strokeLinecap="round" />;
      })}
      <circle r="98" fill={`url(#${u}b)`} stroke="#000" strokeWidth="4" />
      {/* metal band + rivets */}
      <path d="M-98 -6 Q0 22 98 -6 L98 12 Q0 40 -98 12 Z" fill={`url(#${u}m)`} stroke="#111" strokeWidth="2" />
      {Array.from({ length: 9 }).map((_, i) => {
        const x = -76 + i * 19;
        const y = 3 + Math.sin(((x + 98) / 196) * Math.PI) * 14;
        return <circle key={i} cx={x} cy={y} r="3" fill="#e5e7eb" stroke="#111" strokeWidth="1" />;
      })}
      {/* fuse cap */}
      <g transform="rotate(32) translate(0 -88)">
        <rect x="-16" y="-10" width="32" height="18" rx="3" fill={`url(#${u}m)`} stroke="#111" strokeWidth="2.4" />
        <rect x="-16" y="-10" width="32" height="5" rx="2" fill="#fff" opacity=".35" />
      </g>
      {/* skull emblem */}
      <g transform="translate(0 -38)" opacity=".92">
        <path d="M-15 0 C-15 -16 15 -16 15 0 C15 7 10 10 8 12 V17 H-8 V12 C-10 10 -15 7 -15 0 Z" fill="#f1f5f9" />
        <circle cx="-6" cy="-1" r="4" fill="#0b0d10" />
        <circle cx="6" cy="-1" r="4" fill="#0b0d10" />
        <path d="M0 4 L-2 8 H2 Z" fill="#0b0d10" />
        <path d="M-4 13 V17 M0 13 V17 M4 13 V17" stroke="#0b0d10" strokeWidth="1.3" />
        <path d="M-22 22 L22 32 M22 22 L-22 32" stroke="#f1f5f9" strokeWidth="5" strokeLinecap="round" />
      </g>
      <ellipse cx="-42" cy="-48" rx="24" ry="13" fill="#fff" opacity=".28" transform="rotate(-35 -42 -48)" />
      <circle cx="-58" cy="-30" r="4.5" fill="#fff" opacity=".5" />
    </>
  );
}

const MAP: Record<NewKind, (p: { u: string }) => ReactNode> = {
  durian: Durian,
  kiwi: Kiwi,
  dragonfruit: Dragon,
  pineapple: Pineapple,
  apple: Apple,
  soccer: Soccer,
  basketball: Basketball,
  tennis: Tennis,
  baseball: Baseball,
  bowling: Bowling,
  carrom: Carrom,
  carrom2: Carrom2,
  casino: Casino,
  volleyball: Volleyball,
  umbrella: Umbrella,
  starfish: Starfish,
  coconut: Coconut,
  eightball: EightBall,
  moon: Moon,
  mars: Mars,
  jupiter: Jupiter,
  pluto: Pluto,
  eyeball: Eyeball,
  ufo: Ufo,
  dartboard: Dartboard,
  disco: Disco,
  icecream: IceCream,
  spiral: Spiral,
  ornament: Ornament,
  peppermint: Peppermint,
  friedegg: FriedEgg,
  pearl: Pearl,
  quailegg: QuailEgg,
  grapesoda: GrapeSoda,
  cannon: Cannon,
};

export function NewTarget({ kind, u, className }: { kind: NewKind; u: string; className?: string }) {
  const Body = MAP[kind];
  return (
    <svg viewBox="-100 -100 200 200" className={className} overflow="visible">
      <Body u={u} />
    </svg>
  );
}

export const NEW_NAMES: Record<NewKind, string> = {
  durian: "Durian Halves",
  kiwi: "Kiwi",
  dragonfruit: "Dragon Fruit",
  pineapple: "Pineapple",
  apple: "Apple",
  soccer: "Soccer Ball",
  basketball: "Basketball",
  tennis: "Tennis Ball",
  baseball: "Baseball",
  bowling: "Bowling Ball",
  carrom: "Mandala Striker",
  carrom2: "Lotus Striker",
  casino: "Casino Coin",
  volleyball: "Volleyball",
  umbrella: "Beach Umbrella",
  starfish: "Starfish",
  coconut: "Coconut",
  eightball: "8-Ball",
  moon: "Moon",
  mars: "Mars",
  jupiter: "Jupiter",
  pluto: "Pluto",
  eyeball: "Eyeball",
  ufo: "UFO",
  dartboard: "Dartboard",
  disco: "Disco Ball",
  icecream: "Strawberry Ice Cream",
  spiral: "Hypno Spiral",
  ornament: "Christmas Bauble",
  peppermint: "Peppermint",
  friedegg: "Fried Egg",
  pearl: "Pearl",
  quailegg: "Quail Egg",
  grapesoda: "Grape Soda Cap",
  cannon: "Cannon Bomb",
};
