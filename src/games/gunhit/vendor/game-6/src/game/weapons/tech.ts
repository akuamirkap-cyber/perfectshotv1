import { P, TAU, audio, clamp, lerp, pick, rnd, withAlpha } from '../core';
import { T, emissive, metal, outline, polyShape, roundRect, screw } from '../art';
import {
  dust,
  energyMuzzle,
  heatGlow,
  impactFlash,
  makeBullet,
  radialStreaks,
  rimArcs,
  shockRing,
  sparkFan,
  splinters,
  trailPath,
} from '../fx';
import type { GameAPI, Weapon, WeaponDrawState } from '../types';

type Ctx = CanvasRenderingContext2D;

/* ============================== IDENTITY DISC ============================== */

function drawDiscShape(ctx: Ctx, r: number, pulse: number, t = 0) {
  const g = ctx.createRadialGradient(0, 0, r * 0.2, 0, 0, r);
  g.addColorStop(0, 'rgba(8,16,24,0.55)');
  g.addColorStop(0.75, '#0d1620');
  g.addColorStop(1, '#05080c');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, TAU);
  ctx.fill();
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineCap = 'round';
  // outer ring with the signature notch
  const gap = 0.5;
  ctx.strokeStyle = `rgba(34,211,238,${0.78 + pulse * 0.22})`;
  ctx.lineWidth = r * 0.15;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.9, gap / 2, TAU - gap / 2);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(224,255,255,0.95)';
  ctx.lineWidth = r * 0.05;
  ctx.stroke();
  // counter-rotating inner arcs
  for (let i = 0; i < 3; i++) {
    const a0 = -t * 1.6 + (i * TAU) / 3;
    ctx.strokeStyle = `rgba(103,232,249,${0.55 + pulse * 0.3})`;
    ctx.lineWidth = Math.max(1, r * 0.07);
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.62, a0, a0 + 1.45);
    ctx.stroke();
  }
  // spokes
  ctx.strokeStyle = `rgba(103,232,249,${0.4 + pulse * 0.25})`;
  ctx.lineWidth = Math.max(0.8, r * 0.04);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * TAU;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * r * 0.3, Math.sin(a) * r * 0.3);
    ctx.lineTo(Math.cos(a) * r * 0.78, Math.sin(a) * r * 0.78);
    ctx.stroke();
  }
  // hub
  const hg = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 0.3);
  hg.addColorStop(0, 'rgba(255,255,255,0.95)');
  hg.addColorStop(0.5, 'rgba(34,211,238,0.6)');
  hg.addColorStop(1, 'rgba(34,211,238,0)');
  ctx.fillStyle = hg;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.3, 0, TAU);
  ctx.fill();
  ctx.restore();
}

/* ====================== DISC FLIGHT MODEL (state machine) ======================
   One throw = one living disc:  OUTBOUND -> hit / bounce -> RETURNING -> caught.
   A single countdown `returning` encodes the state:
     returning > 0   : flying free (outbound, or just bounced)  -> full damage
     returning <= 0  : homing to the hand with an exponential lerp -> 0.7x damage
   DEAD = caught by the hand (< catchRadius) or life ran out.                      */
const DISC = {
  speed: 1150,
  returnSpeed: 0.85, // homing speed = 85 % of the throw speed
  returnDelay: 0.55, // free flight before the first pull-back
  homingK: 3, // 1 - exp(-dt*3): frame-rate independent steering
  life: 3.4,
  hitCd: 0.25, // wheel immunity after a hit -> one disc can't shred the wheel
  catchRadius: 40,
  wallMargin: 22,
  wallGrace: 0.28, // free flight after a wall bounce
  hitGrace: 0.3, // free flight after bouncing off the wheel
  wheelBounce: 0.86, // the wheel absorbs a bit of energy, walls do not
  returnPower: 0.7,
  maxHits: 4, // marks one disc can leave per throw
  handX: 46,
};

function derez(api: GameAPI, x: number, y: number, n: number, spread = 1) {
  for (let i = 0; i < n; i++)
    api.particles.push(
      P({
        type: 'pixel',
        x: x + rnd(-16, 16),
        y: y + rnd(-16, 16),
        vx: rnd(-220, 220) * spread,
        vy: rnd(-220, 220) * spread - 30,
        size: rnd(2, 5),
        rot: rnd(TAU),
        color: pick(['#22d3ee', '#a5f3fc', '#ffffff', '#0891b2']),
        life: rnd(0.3, 0.8),
        drag: 0.93,
      })
    );
}

function wallSpark(api: GameAPI, x: number, y: number, nx: number, ny: number) {
  audio.play('discBounce');
  const base = Math.atan2(ny, nx);
  sparkFan(api, x, y, base, 8, { spread: 1.0, colors: ['#a5f3fc', '#22d3ee', '#ffffff'], max: 560, grav: 200, width: 1.6 });
  shockRing(api, x, y, 36, '#67e8f9', 2, 0.2);
  api.particles.push(P({ type: 'flare', x, y, rot: base, size: 58, size2: 5, width: 1.1, color: '#a5f3fc', life: 0.11 }));
  api.shake(1);
}

function catchFx(api: GameAPI, x: number, y: number) {
  audio.play('discCatch');
  api.handPulse();
  shockRing(api, x, y, 62, '#a5f3fc', 3, 0.28);
  shockRing(api, x, y, 34, '#ffffff', 2, 0.2);
  impactFlash(api, x, y, 56, '#e0ffff', '#22d3ee', 0.1);
  derez(api, x, y, 12);
  api.shake(1.5);
}

/** a = direction the disc was travelling when it struck; `pw` scales the whole effect (0.7 on the way back) */
function discImpact(api: GameAPI, x: number, y: number, a: number, pw: number) {
  audio.play('hitZap');
  impactFlash(api, x, y, 96 * pw, '#e0ffff', '#0891b2', 0.14);
  shockRing(api, x, y, 74 * pw, '#67e8f9', 3, 0.28);
  shockRing(api, x, y, 40 * pw, '#ffffff', 2, 0.2);
  // voxel burst
  for (let i = 0; i < Math.round(26 * pw); i++) {
    const an = a + Math.PI + rnd(-1.5, 1.5);
    api.particles.push(
      P({
        type: 'pixel',
        x,
        y,
        vx: Math.cos(an) * rnd(100, 600) * pw,
        vy: Math.sin(an) * rnd(100, 600) * pw,
        size: rnd(2.5, 6),
        rot: rnd(TAU),
        color: pick(['#22d3ee', '#a5f3fc', '#ffffff', '#0891b2']),
        life: rnd(0.3, 0.8),
        grav: 500,
        drag: 0.95,
      })
    );
  }
  radialStreaks(api, x, y, Math.round(10 * pw), '#67e8f9', 40, 140 * pw);
  rimArcs(api, x, y, '#67e8f9', 1, 0.8 * pw);
  sparkFan(api, x, y, a + Math.PI, Math.round(18 * pw), { spread: 1.4, colors: ['#a5f3fc', '#ffffff'], max: 800 * pw });
  splinters(api, x, y, a, Math.round(9 * pw), pw);
  dust(api, x, y, a, 3, 0.9 * pw);
  api.shake(7 * pw);
  api.hitstop(0.04 * pw);
}

function neonTrail(ctx: Ctx, pts: { x: number; y: number }[], color: string, core: string) {
  const n = pts.length;
  if (n < 2) return;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  // wide additive glow in three chunks so the tail fades out
  const alphas = [0.1, 0.2, 0.34];
  for (let c = 0; c < 3; c++) {
    const i0 = Math.floor((c * (n - 1)) / 3);
    const i1 = Math.floor(((c + 1) * (n - 1)) / 3);
    ctx.beginPath();
    for (let i = i0; i <= i1; i++) (i === i0 ? ctx.moveTo(pts[i].x, pts[i].y) : ctx.lineTo(pts[i].x, pts[i].y));
    ctx.strokeStyle = withAlpha(color, alphas[c]);
    ctx.lineWidth = 8;
    ctx.stroke();
  }
  // bright core that thickens toward the disc
  for (let i = 1; i < n; i++) {
    const u = i / (n - 1);
    ctx.beginPath();
    ctx.moveTo(pts[i - 1].x, pts[i - 1].y);
    ctx.lineTo(pts[i].x, pts[i].y);
    ctx.strokeStyle = withAlpha(core, 0.12 + 0.7 * u);
    ctx.lineWidth = 1 + 2.4 * u;
    ctx.stroke();
  }
  ctx.restore();
}

export const identityDisc: Weapon = {
  id: 'identityDisc',
  name: 'Identity Disc',
  tag: 'TRON · LIGHT DISC',
  accent: '#22d3ee',
  accent2: '#e0ffff',
  mode: 'projectile',
  cooldown: 0.67, // 1.5 throws / second
  recoilAmt: 3,
  muzzle: [92, -2],
  markSize: 30,
  note: 'Satu lemparan = satu cakram yang tetap hidup: terbang → menghantam → memantul → pulang ke tangan. Bisa kena 2–4× per lemparan. Setiap titik kena meninggalkan cincin neon bercoret di roda: jangan serang titik itu lagi!',
  hint: 'KLIK untuk melempar — cakram memantul & pulang ke tangan. Hindari cincin neon bercoret di roda',
  draw(ctx, s) {
    const pulse = 0.5 + 0.5 * Math.sin(s.t * 4);
    const discAway = (s.out ?? 0) > 0;
    const catchPop = 1 - clamp((s.catchT ?? 99) / 0.42, 0, 1);
    const th = -s.recoil * 0.62 + catchPop * 0.08;
    ctx.save();
    ctx.rotate(th);

    /* ---------------- armored forearm ---------------- */
    ctx.beginPath();
    ctx.moveTo(-82, -20);
    ctx.quadraticCurveTo(-40, -28, -4, -26);
    ctx.lineTo(10, -20);
    ctx.lineTo(10, 20);
    ctx.lineTo(-4, 26);
    ctx.quadraticCurveTo(-40, 28, -82, 20);
    ctx.closePath();
    const ag = ctx.createLinearGradient(0, -28, 0, 28);
    ag.addColorStop(0, '#5b6472');
    ag.addColorStop(0.3, '#2b3340');
    ag.addColorStop(0.7, '#161b23');
    ag.addColorStop(1, '#05070b');
    ctx.fillStyle = ag;
    ctx.fill();
    outline(ctx, 0.75, 1.6);

    // plate seams
    ctx.strokeStyle = 'rgba(0,0,0,0.6)';
    ctx.lineWidth = 1.6;
    for (const x of [-56, -30]) {
      ctx.beginPath();
      ctx.moveTo(x, -26);
      ctx.lineTo(x + 4, 26);
      ctx.stroke();
    }

    // glowing circuit lines
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = `rgba(34,211,238,${0.55 + pulse * 0.35})`;
    ctx.lineWidth = 2.6;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(-76, -12);
    ctx.lineTo(-20, -12);
    ctx.lineTo(-8, -2);
    ctx.lineTo(-20, 10);
    ctx.lineTo(-76, 10);
    ctx.stroke();
    ctx.strokeStyle = `rgba(165,243,252,${0.3 + pulse * 0.3})`;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-68, -20);
    ctx.lineTo(-44, -20);
    ctx.moveTo(-68, 19);
    ctx.lineTo(-44, 19);
    ctx.stroke();
    ctx.restore();

    /* ---------------- hand gripping the disc ---------------- */
    // palm behind the disc
    ctx.beginPath();
    roundRect(ctx, 2, -22, 34, 44, 12);
    ctx.fillStyle = metal(ctx, -22, 22, '#4b5563', '#232a34', '#0b0f14');
    ctx.fill();
    outline(ctx, 0.7, 1.4);

    // disc: solid while it is in the hand, a faint hologram outline while the real one is flying
    {
      const away = discAway;
      const pop = 1 - clamp((s.catchT ?? 99) / 0.5, 0, 1); // 1 right after a catch -> 0
      if (!away) {
        ctx.save();
        ctx.translate(44, -2);
        ctx.rotate(s.t * 1.2);
        const sc2 = 1 + 0.16 * pop * pop;
        ctx.scale(sc2, sc2);
        drawDiscShape(ctx, 42, Math.max(pulse, pop), s.t);
        ctx.restore();
        if (pop > 0.01) {
          emissive(ctx, 44, -2, 62 + pop * 30, '#a5f3fc', pop * 0.9);
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          ctx.strokeStyle = `rgba(224,255,255,${pop})`;
          ctx.lineWidth = 2.4;
          ctx.beginPath();
          ctx.arc(44, -2, 44 + (1 - pop) * 44, 0, TAU);
          ctx.stroke();
          ctx.restore();
        }
      } else {
        ctx.save();
        ctx.translate(44, -2);
        ctx.globalCompositeOperation = 'lighter';
        ctx.setLineDash([6, 7]);
        ctx.lineDashOffset = -s.t * 22;
        ctx.strokeStyle = `rgba(103,232,249,${0.3 + pulse * 0.25})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 42, 0, TAU);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.strokeStyle = `rgba(103,232,249,${0.14 + pulse * 0.14})`;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(0, 0, 26, 0, TAU);
        ctx.stroke();
        ctx.restore();
      }
    }

    // fingers curling over the disc rim
    for (const d of [-1, 1]) {
      const release = discAway ? 1 : s.recoil * 0.7;
      ctx.save();
      ctx.translate(30 + release * 7, d * (17 + release * 2.5));
      ctx.rotate(d * (0.5 + release * 0.22));
      ctx.beginPath();
      roundRect(ctx, 0, -7, 26, 14, 6);
      ctx.fillStyle = metal(ctx, -7, 7, '#64748b', '#2b3340', '#0d1218');
      ctx.fill();
      outline(ctx, 0.7, 1.3);
      ctx.beginPath();
      roundRect(ctx, 20, -6.5, 14, 13, 6);
      ctx.fillStyle = metal(ctx, -7, 7, '#7c8798', '#39414e', '#11161d');
      ctx.fill();
      outline(ctx, 0.7, 1.2);
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = `rgba(34,211,238,${0.35 + pulse * 0.3})`;
      roundRect(ctx, 4, -1.4, 18, 2.8, 1.4);
      ctx.fill();
      ctx.restore();
      ctx.restore();
    }
    ctx.restore();
  },
  fire(api, x, y, a) {
    audio.play('disc');
    energyMuzzle(api, x, y, a, '#22d3ee', '#a5f3fc', 56);
    api.flash('#a5f3fc', 0.2);
    api.shake(3); // throwing is smooth, but the hand gives a readable release snap
    api.hitstop(0.018);
    api.particles.push(P({ type: 'streak', x, y, rot: a, size: 122, width: 4.2, color: '#dfffff', life: 0.13 }));
    shockRing(api, x, y, 56, '#67e8f9', 2.5, 0.2);
    const hand = api.toWorld(DISC.handX, -2);
    derez(api, hand.x, hand.y, 10, 0.8);
    for (let i = 0; i < 12; i++)
      api.particles.push(
        P({
          type: 'pixel',
          x: x + rnd(-14, 14),
          y: y + rnd(-14, 14),
          vx: Math.cos(a) * rnd(-60, 260) + rnd(-80, 80),
          vy: Math.sin(a) * rnd(-60, 260) + rnd(-80, 80),
          size: rnd(2, 5),
          rot: rnd(TAU),
          color: pick(['#22d3ee', '#a5f3fc', '#ffffff']),
          life: rnd(0.3, 0.7),
          drag: 0.94,
        })
      );
    api.bullets.push(
      makeBullet({
        x,
        y,
        a,
        speed: DISC.speed,
        weapon: identityDisc,
        kind: 'disc',
        size: 70, // wheel-contact threshold (0.4 * size) ~ the disc's leading edge
        trailMax: 22,
        life: DISC.life + 0.2,
        data: { returning: DISC.returnDelay, hitCd: 0, spinA: rnd(TAU), hits: 0, bounces: 0, hx: x, hy: y, side: 1 },
        update(b, dt, g) {
          const d = b.data;
          d.spinA += dt * 26; // ~4 turns per second
          d.hitCd = Math.max(0, d.hitCd - dt);
          d.returning -= dt;

          // hard life limit: the disc de-rezzes instead of living forever
          if (b.age >= DISC.life) {
            derez(g, b.x, b.y, 18);
            audio.play('discBounce');
            b.dead = true;
            return;
          }

          // wall bounces – no energy loss, and the free-flight timer is re-armed
          const m = DISC.wallMargin;
          let nx = 0,
            ny = 0;
          if (b.x < m) {
            b.x = m;
            if (b.vx < 0) {
              b.vx = -b.vx;
              nx = 1;
            }
          } else if (b.x > g.W - m) {
            b.x = g.W - m;
            if (b.vx > 0) {
              b.vx = -b.vx;
              nx = -1;
            }
          }
          if (b.y < m) {
            b.y = m;
            if (b.vy < 0) {
              b.vy = -b.vy;
              ny = 1;
            }
          } else if (b.y > g.H - m) {
            b.y = g.H - m;
            if (b.vy > 0) {
              b.vy = -b.vy;
              ny = -1;
            }
          }
          if (nx || ny) {
            d.returning = Math.max(d.returning, DISC.wallGrace);
            d.bounces++;
            wallSpark(g, b.x, b.y, nx, ny);
          }

          // homing: the velocity VECTOR is lerped, never the position -> a wide magnetic arc
          const hand = g.toWorld(DISC.handX, -2);
          d.hx = hand.x;
          d.hy = hand.y;
          const ax = hand.x - b.x,
            ay = hand.y - b.y;
          // once the disc has bounced off anything, the hand also catches it as it flies past
          if ((d.returning <= 0 || d.bounces > 0) && Math.hypot(ax, ay) < DISC.catchRadius) {
            catchFx(g, hand.x, hand.y);
            b.dead = true;
            return;
          }
          if (d.returning <= 0) {
            const ang = Math.atan2(ay, ax);
            const sp = DISC.speed * DISC.returnSpeed;
            const k = 1 - Math.exp(-dt * DISC.homingK);
            b.vx = lerp(b.vx, Math.cos(ang) * sp, k);
            b.vy = lerp(b.vy, Math.sin(ang) * sp, k);
          }

          // sparkle
          if (Math.random() < 0.8)
            g.particles.push(
              P({ type: 'glow', x: b.x + rnd(-10, 10), y: b.y + rnd(-10, 10), size: 16, size2: 1, color: '#22d3ee', color2: '#0e7490', life: 0.25 })
            );
          if (Math.random() < 0.5)
            g.particles.push(
              P({ type: 'pixel', x: b.x + rnd(-28, 28), y: b.y + rnd(-14, 14), size: rnd(1.6, 3.6), rot: rnd(TAU), color: pick(['#22d3ee', '#ffffff']), life: rnd(0.2, 0.5), vx: rnd(-40, 40), vy: rnd(-40, 40) })
            );
        },
        /** the disc does NOT die on the wheel: it reflects (0.86), leaves a marker and keeps flying */
        collide(b, g, h) {
          const d = b.data;
          const returning = d.returning <= 0;
          d.bounces++;
          const dot = b.vx * h.nx + b.vy * h.ny;
          if (dot < 0) {
            b.vx = (b.vx - 2 * dot * h.nx) * DISC.wheelBounce;
            b.vy = (b.vy - 2 * dot * h.ny) * DISC.wheelBounce;
          }
          b.x = g.cx + h.nx * (g.wheelR + 30);
          b.y = g.cy + h.ny * (g.wheelR + 30);
          if (b.trail.length) b.trail[b.trail.length - 1] = { x: h.x, y: h.y };
          if (d.hitCd > 0) return false; // still immune: just bounce, no hit
          d.hitCd = DISC.hitCd;
          d.returning = Math.max(d.returning, DISC.hitGrace);
          const travel = Math.atan2(-h.ny, -h.nx);
          if (d.hits >= DISC.maxHits) {
            // spent: harmless ricochet
            sparkFan(g, h.x, h.y, Math.atan2(h.ny, h.nx), 8, { spread: 1.0, colors: ['#a5f3fc', '#ffffff'], max: 500 });
            audio.play('discBounce');
            return false;
          }
          d.hits++;
          const pw = returning ? DISC.returnPower : 1;
          discImpact(g, h.x, h.y, travel, pw);
          g.registerHit(h.x, h.y, identityDisc, 0, returning ? 0.82 : 1);
          return false;
        },
        draw(ctx, b, t) {
          const d = b.data;
          const returning = d.returning <= 0;
          const col = returning ? '#a5f3fc' : '#22d3ee';

          // catch-zone beacon over the hand while the disc is coming home
          if (returning) {
            const near = clamp(1 - Math.hypot(b.x - d.hx, b.y - d.hy) / 520, 0, 1);
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            ctx.strokeStyle = `rgba(165,243,252,${0.12 + near * 0.5})`;
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 6]);
            ctx.lineDashOffset = -t * 40;
            ctx.beginPath();
            ctx.arc(d.hx, d.hy, DISC.catchRadius * (1.1 + 0.08 * Math.sin(t * 14)), 0, TAU);
            ctx.stroke();
            ctx.restore();
          }

          neonTrail(ctx, b.trail, col, returning ? '#ffffff' : '#c8fbff');

          const pulse = 0.5 + 0.5 * Math.sin(t * 8);
          emissive(ctx, b.x, b.y, 48 * (0.92 + 0.12 * pulse), col, 0.5);

          // tilt trick: face the travel direction, squash the perpendicular axis, spin inside the squash
          const ang = Math.atan2(b.vy, b.vx);
          ctx.save();
          ctx.translate(b.x, b.y);
          ctx.rotate(ang);
          ctx.scale(1, 0.42);
          // rim thickness seen from the tilt
          ctx.beginPath();
          ctx.arc(0, 11, 36, 0, TAU);
          ctx.fillStyle = '#031017';
          ctx.fill();
          ctx.strokeStyle = 'rgba(34,211,238,0.7)';
          ctx.lineWidth = 3;
          ctx.stroke();
          ctx.rotate(-ang + d.spinA);
          drawDiscShape(ctx, 36, pulse, d.spinA * 0.22);
          ctx.restore();
        },
      })
    );
  },
  onImpact(api, x, y, a) {
    discImpact(api, x, y, a, 1);
  },
  /** the marker left on the wheel: a neon "no-go" ring – hitting inside it ends the run */
  drawMark(ctx, m, t) {
    const k = clamp(m.size / 30, 0.7, 1.1);
    const fresh = Math.max(0, 1 - m.age * 2.4);
    const pulse = 0.5 + 0.5 * Math.sin(t * 3.4 + m.seed);
    const Z = 25; // forbidden radius
    ctx.save();
    ctx.translate(-4, 0);
    ctx.scale(k, k);

    // scorched circuit pad burnt into the wood
    const g = ctx.createRadialGradient(0, 0, 2, 0, 0, Z);
    g.addColorStop(0, 'rgba(3,9,14,0.9)');
    g.addColorStop(0.65, 'rgba(6,16,24,0.58)');
    g.addColorStop(1, 'rgba(6,16,24,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, Z, 0, TAU);
    ctx.fill();

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';

    // zone tint: the whole forbidden area glows softly
    const zt = ctx.createRadialGradient(0, 0, Z * 0.35, 0, 0, Z);
    zt.addColorStop(0, 'rgba(34,211,238,0)');
    zt.addColorStop(1, `rgba(34,211,238,${0.14 + 0.1 * pulse + 0.35 * fresh})`);
    ctx.fillStyle = zt;
    ctx.beginPath();
    ctx.arc(0, 0, Z, 0, TAU);
    ctx.fill();

    // imprint of the disc: spokes + slowly counter-rotating arcs
    ctx.strokeStyle = `rgba(103,232,249,${0.22 + 0.12 * pulse})`;
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 6; i++) {
      const an = (i / 6) * TAU + m.seed;
      ctx.beginPath();
      ctx.moveTo(Math.cos(an) * 6, Math.sin(an) * 6);
      ctx.lineTo(Math.cos(an) * Z * 0.78, Math.sin(an) * Z * 0.78);
      ctx.stroke();
    }
    for (let i = 0; i < 3; i++) {
      const a0 = -t * 0.9 + m.seed + (i * TAU) / 3;
      ctx.strokeStyle = `rgba(165,243,252,${0.4 + 0.2 * pulse})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, Z * 0.55, a0, a0 + 1.4);
      ctx.stroke();
    }

    // main forbidden ring (never fades: it is an obstacle for the whole level)
    ctx.strokeStyle = 'rgba(34,211,238,0.14)';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(0, 0, Z, 0, TAU);
    ctx.stroke();
    ctx.strokeStyle = `rgba(34,211,238,${0.7 + 0.25 * pulse})`;
    ctx.lineWidth = 2.4;
    ctx.stroke();
    ctx.strokeStyle = 'rgba(235,255,255,0.7)';
    ctx.lineWidth = 0.9;
    ctx.stroke();

    // rotating dashed outer ring + four reticle ticks
    ctx.save();
    ctx.rotate(t * 0.8);
    ctx.setLineDash([5, 6]);
    ctx.strokeStyle = 'rgba(165,243,252,0.6)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(0, 0, Z + 5.5, 0, TAU);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
    ctx.strokeStyle = 'rgba(224,255,255,0.8)';
    ctx.lineWidth = 1.6;
    for (let i = 0; i < 4; i++) {
      const an = (i / 4) * TAU + Math.PI / 4;
      ctx.beginPath();
      ctx.moveTo(Math.cos(an) * (Z - 3), Math.sin(an) * (Z - 3));
      ctx.lineTo(Math.cos(an) * (Z + 3), Math.sin(an) * (Z + 3));
      ctx.stroke();
    }

    // "no-go" slash
    const sx = Z * 0.7 * Math.SQRT1_2;
    ctx.strokeStyle = 'rgba(255,77,109,0.2)';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(-sx, -sx);
    ctx.lineTo(sx, sx);
    ctx.stroke();
    ctx.strokeStyle = `rgba(255,86,118,${0.8 + 0.2 * pulse})`;
    ctx.lineWidth = 2.6;
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255,230,236,0.75)';
    ctx.lineWidth = 0.9;
    ctx.stroke();

    // landing flash: a shock ring contracts onto the marker
    if (fresh > 0.01) {
      ctx.strokeStyle = `rgba(224,255,255,${fresh})`;
      ctx.lineWidth = 2.6 * fresh + 0.6;
      ctx.beginPath();
      ctx.arc(0, 0, Z * (1 + 0.5 * fresh), 0, TAU);
      ctx.stroke();
    }
    ctx.restore();

    emissive(ctx, 0, 0, 7 + 3 * pulse + 10 * fresh, '#e0ffff', 0.3 + 0.5 * fresh);
    ctx.restore();
  },
  ambient(api, x, y, _o, m, dt) {
    if (Math.random() < dt * 2.6) {
      const an = rnd(TAU);
      api.particles.push(
        P({
          type: 'pixel',
          x: x + Math.cos(an) * rnd(14, 28),
          y: y + Math.sin(an) * rnd(14, 28),
          vx: rnd(-10, 10),
          vy: -rnd(12, 44),
          size: rnd(1.4, 2.8),
          rot: rnd(TAU),
          color: pick(['#67e8f9', '#a5f3fc']),
          life: rnd(0.5, 1),
        })
      );
    }
    void m;
  },
};

/* ============================ IRON MAN REPULSOR ============================ */

function drawRepulsorArt(ctx: Ctx, s: WeaponDrawState) {
  const kk = s.recoil * s.recoil;
  const pulse = 0.5 + 0.5 * Math.sin(s.t * 5);
  const charge = clamp(0.2 + s.cycle * 0.58 + pulse * 0.08 + kk * 0.82, 0, 1);
  const armor = (y0: number, y1: number) => {
    const g = ctx.createLinearGradient(0, y0, 0, y1);
    g.addColorStop(0, '#ffd7c7');
    g.addColorStop(0.18, '#ef4942');
    g.addColorStop(0.55, '#b51d23');
    g.addColorStop(0.84, '#70141d');
    g.addColorStop(1, '#250b12');
    return g;
  };
  const gold = (y0: number, y1: number) => {
    const g = ctx.createLinearGradient(0, y0, 0, y1);
    g.addColorStop(0, '#fff2ae');
    g.addColorStop(0.28, '#f6c84c');
    g.addColorStop(0.7, '#ad7614');
    g.addColorStop(1, '#4c2e07');
    return g;
  };

  ctx.save();
  ctx.translate(-kk * 10, -kk * 1.5);
  ctx.rotate(-kk * 0.018);

  // forearm shell, clearly connected to the palm at the wrist
  polyShape(ctx, [[-122, -19], [-103, -28], [-40, -27], [-25, -17], [-25, 17], [-42, 27], [-103, 27], [-122, 18]], T.red, { brush: true, hi: 0.42, lw: 1.6 });
  polyShape(ctx, [[-117, -18], [-101, -23], [-94, -21], [-96, 21], [-104, 23], [-117, 17]], T.gold, { lw: 1.1 });
  polyShape(ctx, [[-81, -26], [-68, -26], [-66, 26], [-81, 27]], T.gold, { lw: 1.1 });
  // red flank plate and a warm metallic seam
  polyShape(ctx, [[-59, -24], [-42, -23], [-38, -17], [-38, 17], [-45, 23], [-61, 23]], T.red, { lw: 1.1 });
  ctx.strokeStyle = 'rgba(255,231,176,0.6)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(-90, -22);
  ctx.lineTo(-88, 22);
  ctx.stroke();
  for (let i = 0; i < 4; i++) {
    roundRect(ctx, -54 + i * 4, -15, 2, 9, 1);
    ctx.fillStyle = '#1c2229';
    ctx.fill();
    roundRect(ctx, -54 + i * 4, 7, 2, 9, 1);
    ctx.fill();
  }
  for (const [x, y] of [[-110, -13], [-110, 13], [-72, -19], [-72, 19]]) screw(ctx, x, y, 2.2);

  // wrist articulation joint / bracer collar
  ctx.beginPath();
  ctx.ellipse(-29, 0, 13, 29, 0, 0, TAU);
  ctx.fillStyle = '#131820';
  ctx.fill();
  ctx.strokeStyle = '#c69a3e';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,237,188,0.58)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(-29, 0, 8.5, 23, 0, 0, TAU);
  ctx.stroke();

  // articulated fingers extend beyond the palm; layered red knuckles and gold plates
  for (let i = 0; i < 4; i++) {
    const y = -24 + i * 15;
    ctx.save();
    ctx.translate(6, y);
    ctx.rotate((i - 1.5) * 0.035 + (i - 1.5) * kk * 0.055);
    roundRect(ctx, 0, -5.8, 39, 11.6, 5.5);
    ctx.fillStyle = armor(-6, 6);
    ctx.fill();
    ctx.strokeStyle = 'rgba(30,5,8,0.82)';
    ctx.lineWidth = 1.3;
    ctx.stroke();
    // gold dorsal finger plate
    polyShape(ctx, [[4, -5], [24, -5], [30, -2.8], [24, -0.7], [4, -1.2]], T.gold, { lw: 0.8 });
    // two exposed knuckle joints
    for (const jx of [11, 27]) {
      ctx.fillStyle = '#4b3320';
      ctx.beginPath();
      ctx.arc(jx, 2, 2.2, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#f4d777';
      ctx.beginPath();
      ctx.arc(jx, 1.5, 1.2, 0, TAU);
      ctx.fill();
    }
    // polished fingertip
    roundRect(ctx, 34, -4.6, 15, 9.2, 4.5);
    ctx.fillStyle = gold(-5, 5);
    ctx.fill();
    ctx.strokeStyle = 'rgba(36,19,5,0.75)';
    ctx.lineWidth = 0.9;
    ctx.stroke();
    ctx.restore();
  }

  // palm shield and red knuckle bridge
  polyShape(ctx, [[-20, -26], [18, -31], [42, -22], [48, -9], [48, 9], [42, 23], [18, 30], [-20, 25], [-33, 14], [-33, -13]], T.red, { brush: true, hi: 0.42, lw: 1.7 });
  polyShape(ctx, [[-6, -25], [21, -28], [42, -20], [31, -13], [-4, -14]], T.gold, { lw: 1.1 });
  polyShape(ctx, [[-4, 15], [31, 14], [43, 21], [22, 28], [-8, 24]], T.gold, { lw: 1.1 });
  // thumb folds under the palm
  ctx.beginPath();
  ctx.moveTo(-17, 17);
  ctx.quadraticCurveTo(-2, 29, 14, 34);
  ctx.lineTo(35, 27);
  ctx.quadraticCurveTo(41, 24, 35, 18);
  ctx.lineTo(26, 14);
  ctx.lineTo(6, 23);
  ctx.lineTo(-15, 9);
  ctx.closePath();
  ctx.fillStyle = armor(14, 34);
  ctx.fill();
  ctx.strokeStyle = 'rgba(25,5,8,0.85)';
  ctx.lineWidth = 1.4;
  ctx.stroke();
  polyShape(ctx, [[3, 24], [17, 29], [32, 23], [26, 19], [12, 23]], T.gold, { lw: 0.9 });

  // palm reactor: metal bezel, ceramic ring, rotating triangular emitter
  ctx.beginPath();
  ctx.arc(31, -1, 21, 0, TAU);
  ctx.fillStyle = '#121923';
  ctx.fill();
  ctx.strokeStyle = '#f6cc55';
  ctx.lineWidth = 4.5;
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,245,209,0.78)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(31, -1, 17.2, 0, TAU);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(31, -1, 13.5, 0, TAU);
  ctx.fillStyle = '#071322';
  ctx.fill();
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const core = ctx.createRadialGradient(31, -1, 0, 31, -1, 34 + charge * 10);
  core.addColorStop(0, '#ffffff');
  core.addColorStop(0.22, 'rgba(228,248,255,0.98)');
  core.addColorStop(0.5, `rgba(56,189,248,${0.5 + charge * 0.35})`);
  core.addColorStop(1, 'rgba(14,100,200,0)');
  ctx.fillStyle = core;
  ctx.beginPath();
  ctx.arc(31, -1, 34 + charge * 10, 0, TAU);
  ctx.fill();
  // rotating arc segments and the triangular Stark signature
  ctx.lineWidth = 2.1;
  for (let i = 0; i < 3; i++) {
    const a = s.t * (1.3 + charge * 2.3) + i * (TAU / 3);
    ctx.strokeStyle = withAlpha('#b9eaff', 0.55 + charge * 0.35);
    ctx.beginPath();
    ctx.arc(31, -1, 18.5, a, a + 0.65);
    ctx.stroke();
  }
  ctx.strokeStyle = `rgba(255,255,255,${0.6 + charge * 0.38})`;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  for (let i = 0; i <= 3; i++) {
    const a = s.t * 1.5 + i * (TAU / 3) - Math.PI / 2;
    const px = 31 + Math.cos(a) * 9.2,
      py = -1 + Math.sin(a) * 9.2;
    i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
  }
  ctx.stroke();
  ctx.restore();

  // short repulsor vanes flare on discharge
  const flare = kk * 8;
  for (const d of [-1, 1]) {
    ctx.strokeStyle = withAlpha('#c7efff', 0.22 + charge * 0.42 + kk * 0.3);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(48, d * 13);
    ctx.quadraticCurveTo(64 + flare, d * (18 + flare), 74 + flare, d * (14 + flare));
    ctx.stroke();
  }
  // catchlight on the palm rim
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.strokeStyle = `rgba(224,248,255,${0.4 + pulse * 0.35})`;
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.arc(31, -1, 22.5, -1.8, -0.5);
  ctx.stroke();
  ctx.restore();
  ctx.restore();
}

function drawRepulsorIcon(ctx: Ctx, s: WeaponDrawState) {
  ctx.save();
  ctx.scale(0.92, 0.9);
  drawRepulsorArt(ctx, { ...s, recoil: 0, cycle: 1 });
  ctx.restore();
}
export const repulsor: Weapon = {
  id: 'repulsor',
  name: 'Repulsor Gauntlet',
  tag: 'IRON MAN · PALM BLAST',
  accent: '#bae6fd',
  accent2: '#60a5fa',
  mode: 'projectile',
  cooldown: 0.6,
  recoilAmt: 12,
  muzzle: [31, -1],
  markSize: 32,
  draw: drawRepulsorArt,
  drawIcon: drawRepulsorIcon,
  fire(api, x, y, a) {
    audio.play('repulsor');
    energyMuzzle(api, x, y, a, '#bae6fd', '#38bdf8', 66);
    api.flash('#e5f5ff', 0.34);
    api.shake(16);
    api.hitstop(0.03);
    api.particles.push(P({ type: 'streak', x, y, rot: a, size: 240, width: 7, color: '#e0f2fe', life: 0.16 }));
    api.particles.push(P({ type: 'streak', x, y, rot: a + Math.PI / 2, size: 110, width: 4.5, color: '#bae6fd', life: 0.14 }));
    for (let i = 0; i < 5; i++) {
      const off = (i - 2) * 6;
      api.particles.push(
        P({ type: 'streak', x: x - Math.sin(a) * off, y: y + Math.cos(a) * off, rot: a, size: 82 + (2 - Math.abs(i - 2)) * 13, width: i === 2 ? 3.4 : 1.5, color: i === 2 ? '#ffffff' : '#bae6fd', life: 0.13 })
      );
    }
    for (let i = 0; i < 4; i++)
      api.particles.push(P({ type: 'shock', x, y, rot: a + Math.PI / 2, size: 74 + i * 34, size2: 8, color: '#e0f2fe', width: 3, life: 0.26 + i * 0.08 }));
    api.bullets.push(
      makeBullet({
        x,
        y,
        a,
        speed: 1550,
        weapon: repulsor,
        kind: 'repulsor',
        size: 18,
        trailMax: 14,
        update(b, _dt, g) {
          g.particles.push(
            P({ type: 'ring', x: b.x, y: b.y, size: 28, size2: 8, color: '#7dd3fc', width: 2.2, life: 0.22 })
          );
          g.particles.push(
            P({ type: 'glow', x: b.x - Math.cos(b.angle) * 10, y: b.y - Math.sin(b.angle) * 10, size: 28, size2: 2, color: '#bae6fd', color2: '#1d4ed8', life: 0.3 })
          );
        },
        draw(ctx, b, t) {
          trailPath(ctx, b, '#7dd3fc', 9, 0.8);
          ctx.save();
          ctx.translate(b.x, b.y);
          ctx.rotate(b.angle);
          ctx.globalCompositeOperation = 'lighter';
          const p = 1 + Math.sin(t * 30) * 0.1;
          const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 34 * p);
          g.addColorStop(0, '#ffffff');
          g.addColorStop(0.3, 'rgba(224,242,254,0.92)');
          g.addColorStop(0.6, 'rgba(56,189,248,0.5)');
          g.addColorStop(1, 'rgba(37,99,235,0)');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.ellipse(0, 0, 36 * p, 24 * p, 0, 0, TAU);
          ctx.fill();
          // lens cross
          const cg = ctx.createLinearGradient(-60, 0, 60, 0);
          cg.addColorStop(0, 'rgba(255,255,255,0)');
          cg.addColorStop(0.5, 'rgba(255,255,255,0.8)');
          cg.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.fillStyle = cg;
          ctx.fillRect(-60, -1.4, 120, 2.8);
          // force-field hexagon
          ctx.strokeStyle = 'rgba(186,230,253,0.65)';
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          for (let i = 0; i <= 6; i++) {
            const an = (i / 6) * TAU + t * 3;
            const hx = Math.cos(an) * 24,
              hy = Math.sin(an) * 24;
            i ? ctx.lineTo(hx, hy) : ctx.moveTo(hx, hy);
          }
          ctx.stroke();
          ctx.strokeStyle = 'rgba(255,255,255,0.85)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.ellipse(-16, 0, 6, 17, 0, 0, TAU);
          ctx.stroke();
          ctx.restore();
        },
      })
    );
  },
  onImpact(api, x, y, a) {
    audio.play('hitBoom');
    impactFlash(api, x, y, 146, '#ffffff', '#38bdf8', 0.22);
    api.flash('#e0f2fe', 0.36);
    for (let i = 0; i < 5; i++) shockRing(api, x, y, 62 + i * 34, '#e0f2fe', 3.6, 0.24 + i * 0.09);
    radialStreaks(api, x, y, 20, '#bae6fd', 72, 260);
    api.particles.push(P({ type: 'flare', x, y, rot: 0, size: 176, size2: 8, width: 3.8, color: '#e0f2fe', life: 0.18 }));
    sparkFan(api, x, y, a + Math.PI, 32, { spread: 1.6, colors: ['#ffffff', '#bae6fd', '#38bdf8'], max: 1120 });
    splinters(api, x, y, a, 15, 1.4);
    dust(api, x, y, a, 6, 1.3, '#c8d3e0');
    rimArcs(api, x, y, '#bae6fd', 1, 0.9);
    api.shake(21);
    api.hitstop(0.07);
  },
  drawMark(ctx, m, t) {
    const hot = Math.max(0, 1 - m.age * 0.4);
    // smooth, palm-sized pressure bowl with a restrained hex fracture edge
    const pit = ctx.createRadialGradient(-3, -2, 0, 0, 0, 20);
    pit.addColorStop(0, 'rgba(5,13,20,0.96)');
    pit.addColorStop(0.52, 'rgba(20,40,54,0.88)');
    pit.addColorStop(0.82, 'rgba(49,101,128,0.4)');
    pit.addColorStop(1, 'rgba(49,101,128,0)');
    ctx.fillStyle = pit;
    ctx.beginPath();
    ctx.ellipse(0, 0, 19, 13, -0.08, 0, TAU);
    ctx.fill();
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const rr = 13 + Math.sin(t * 3 + m.seed) * 0.6;
    ctx.strokeStyle = `rgba(186,230,253,${0.22 + hot * 0.45})`;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    for (let i = 0; i <= 6; i++) {
      const an = (i / 6) * TAU + m.seed * 0.2;
      const hx = Math.cos(an) * rr - 1.5,
        hy = Math.sin(an) * rr * 0.76;
      i ? ctx.lineTo(hx, hy) : ctx.moveTo(hx, hy);
    }
    ctx.stroke();
    // three short branching score lines stay inside the impact bowl
    ctx.strokeStyle = `rgba(186,230,253,${0.22 + hot * 0.42})`;
    ctx.lineWidth = 1.05;
    for (const [x0, y0, x1, y1] of [[-7, -3, -11, -6], [1, -2, 5, -5], [4, 4, 9, 7]] as number[][]) {
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo((x0 + x1) * 0.55, (y0 + y1) * 0.55);
      ctx.lineTo(x1, y1);
      ctx.stroke();
    }
    ctx.restore();
    heatGlow(ctx, 14, '#38bdf8', hot * 0.45);
    emissive(ctx, -2, 0, 8, '#e0f2fe', 0.18 + hot * 0.36);
  },
  ambient(api, x, y, out, m, dt) {
    if (m.age < 3 && Math.random() < dt * 5)
      api.particles.push(
        P({ type: 'smoke', x, y, vx: Math.cos(out) * rnd(8, 24), vy: Math.sin(out) * rnd(8, 24) - rnd(8, 20), size: rnd(12, 22), size2: 2, color: '#b6c4d6', life: rnd(0.7, 1.2), drag: 0.97 })
      );
  },
};

