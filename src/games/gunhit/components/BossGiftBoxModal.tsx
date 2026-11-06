import { rarityLabel, tr } from '../../../i18n/strings';
import { useLanguage } from '../../../i18n/useLanguage';
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { GiftBoxBody, GiftBoxLid } from './GiftBoxArt';
import {
  Burst,
  Confetti,
  Dust,
  Flare,
  GodRays,
  GreenButton,
  LetterPop,
  Shockwave,
  SparkleField,
} from './Effects';
import { sfx as boxSfx, vibrate } from '../game/giftBoxSfx';
import { useSlideActive } from '../../shared/SlideActivity';
import {
  RARITY_COLOR,
  rollGiftWeapon,
  type Rarity,
  type Weapon,
  type WeaponId,
} from '../game/weapons';
import { drawGunCentered } from '../game/art/drawCentered';
import { getGunMetrics } from '../game/art/metrics';
import { getSavedSgaSpeed } from '../game/gameSpeed';
import { isLandscape } from '../game/orientation';
import { useSgaOrientation } from '../utils/useSgaOrientation';
import CoinSprite from '../../shared/CoinSprite';

type BoxState = 'drop' | 'ready' | 'charging' | 'open';
const TAPS = 3;

/** Warna sinar/efek per rarity (rgb "r,g,b" — format efek Knife). */
const RARITY_RGB: Record<Rarity, string> = {
  UMUM: '200,205,215',
  LANGKA: '56,189,248',
  EPIC: '192,132,252',
  LEGENDARIS: '251,191,36',
};

const RARITY_STARS: Record<Rarity, number> = {
  UMUM: 1,
  LANGKA: 2,
  EPIC: 3,
  LEGENDARIS: 3,
};

/** Warna emas untuk kado yang isinya koin saja. */
const COIN_RGB = '251,191,36';

/** Koin bonus buka kotak: naik per stage + bonus rarity senjata. */
export function giftBoxCoins(stage: number, rarity: Rarity): number {
  const bonus: Record<Rarity, number> = { UMUM: 0, LANGKA: 30, EPIC: 80, LEGENDARIS: 150 };
  return 50 + stage * 6 + bonus[rarity];
}

function shakeEl(el: HTMLElement | null, power = 3, duration = 200) {
  if (!el) return;
  const p = power;
  el.animate(
    [
      { transform: 'translate(0,0)' },
      { transform: `translate(${-p}px,${p * 0.5}px)` },
      { transform: `translate(${p}px,${-p * 0.5}px)` },
      { transform: 'translate(0,0)' },
    ],
    { duration, easing: 'ease-out' },
  );
}

/** Kanvas senjata Gun Hit untuk reveal kotak hadiah (silhouette → senjata asli). */
function GunRevealCanvas({ id, silhouette }: { id: WeaponId; silhouette: boolean }) {
  const active = useSlideActive();
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const W = 210 * 1.6;
    const H = 150 * 1.6;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = W * dpr;
    cv.height = H * dpr;
    const ctx = cv.getContext('2d');
    if (!ctx) return;

    const start = performance.now();
    const paint = (now: number) => {
      const t = ((now - start) / 1000) * getSavedSgaSpeed();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      const span = Math.max(getGunMetrics(id).span, 130);
      const scale = (H * 0.86) / span;
      ctx.save();
      ctx.translate(W / 2, H / 2 + Math.sin(t * 2.2) * 3);
      ctx.rotate(Math.PI / 4 + Math.sin(t * 2.8) * 0.045);
      ctx.scale(scale, scale);
      drawGunCentered(ctx, id, t, 0, true, undefined, true);
      ctx.restore();
    };

    // Kado selalu ada di layar saat komponen ini tampil, jadi hadiahnya tetap
    // digambar walau slide sedang ditandai tidak aktif: satu frame statis lebih
    // baik daripada kanvas kosong di balik kotak yang baru terbuka.
    if (!active) {
      paint(start);
      return;
    }

    let raf = 0;
    const loop = (now: number) => {
      paint(now);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [id, active]);

  return (
    <canvas
      ref={ref}
      style={{
        width: 336,
        height: 240,
        filter: silhouette ? 'brightness(0)' : 'drop-shadow(0 10px 18px rgba(0,0,0,.55))',
        transition: 'filter .25s',
      }}
    />
  );
}

export interface GiftBoxSceneProps {
  /** Banner kecil di paling atas (mis. BONUS REWARD STAGE / REWARD MILESTONE). */
  badge: string;
  /** Judul besar yang dipecah per huruf. */
  headline: string;
  hint: string;
  /** Senjata yang keluar dari kado. Kosongkan untuk kado berisi koin saja. */
  weapon?: Weapon;
  /** Koin bonus yang ikut diberikan. */
  coins: number;
  claimLabel: string;
  declineLabel?: string;
  onClaim: (equip: boolean) => void;
}

/**
 * Adegan buka kado yang sama dengan slide Knife Boss 100 Lv:
 * kotak jatuh → tap 3× → buka (lid terbang + sinar + konfeti) → reveal hadiah.
 * Dipakai stage bonus boss dan peti hadiah di halaman reward.
 */
export function GiftBoxScene({
  badge,
  headline,
  hint,
  weapon,
  coins,
  claimLabel,
  declineLabel,
  onClaim,
}: GiftBoxSceneProps) {
  const [language] = useLanguage();
  const active = useSlideActive();
  // Landscape has the width for two columns — the box on the left, the reward on
  // the right — instead of a portrait stack that runs off the bottom edge.
  const [orientation] = useSgaOrientation();
  const landscape = isLandscape(orientation);
  const wrapRef = useRef<HTMLDivElement>(null);
  const punchRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<BoxState>('drop');
  const [taps, setTaps] = useState(0);
  const [showInfo, setShowInfo] = useState(false);

  /**
   * Landscape reads as two beats, not two columns from the first frame.
   *
   * While the kado is still closed it owns the middle of the screen — that is
   * what the player is being asked to tap — with the headline and the tap hint
   * stacked around it. The moment the reward is revealed the whole picture
   * glides one column to the left (`REVEAL_SLIDE`), so the new weapon sits where
   * the box was and the loot card gets the right half to itself. Every anchor
   * below shares the same transition, so the burst, the rays, the box and the
   * rising weapon travel together instead of snapping.
   */
  const REVEAL_SLIDE = 'left .7s cubic-bezier(.22,.9,.28,1), top .7s cubic-bezier(.22,.9,.28,1), width .7s cubic-bezier(.22,.9,.28,1), right .7s cubic-bezier(.22,.9,.28,1)';
  const stageColumn: CSSProperties = landscape
    ? { left: showInfo ? 0 : '27%', width: '46%', transition: REVEAL_SLIDE }
    : { left: 0, right: 0 };
  const boxSpot: CSSProperties = landscape
    ? {
      left: showInfo ? '23%' : '50%',
      top: showInfo ? '58%' : '52%',
      transform: `translate(-50%, -50%) scale(${showInfo ? 1.18 : 1.12})`,
      transition: REVEAL_SLIDE,
    }
    : { left: '50%', top: 300, transform: 'translateX(-50%)' };
  /**
   * The tap hint waits under the centred kado; the loot card takes the right
   * column once the weapon is out. Same transition, so it slides across.
   */
  const infoPanelStyle: CSSProperties | undefined = landscape
    ? {
      left: showInfo ? '48%' : '6%',
      right: showInfo ? '4%' : '6%',
      top: showInfo ? '50%' : '88%',
      transform: 'translateY(-50%)',
      transition: REVEAL_SLIDE,
    }
    : undefined;

  const rayColor = weapon ? RARITY_RGB[weapon.rarity] : COIN_RGB;

  useEffect(() => {
    // Tanpa gerbang `active`: kado yang sedang tampil harus selalu bisa dibuka.
    if (state !== 'drop') return;
    const spd = getSavedSgaSpeed();
    boxSfx.whoosh();
    const a = setTimeout(() => {
      boxSfx.thud();
      vibrate(12);
      shakeEl(wrapRef.current, 3, Math.round(220 / spd));
    }, Math.round(560 / spd));
    const b = setTimeout(() => setState('ready'), Math.round(1000 / spd));
    return () => {
      clearTimeout(a);
      clearTimeout(b);
    };
  }, [state]);

  const tap = useCallback(() => {
    if (state !== 'ready') return;
    const spd = getSavedSgaSpeed();
    const n = taps + 1;
    setTaps(n);
    boxSfx.tap(n);
    vibrate(8);
    shakeEl(wrapRef.current, 2 + n, Math.round(160 / spd));
    punchRef.current?.animate(
      [
        { transform: 'scale(1)' },
        { transform: `scale(${1.1 + n * 0.03}, ${0.88 - n * 0.02})` },
        { transform: 'scale(.96,1.05)' },
        { transform: 'scale(1)' },
      ],
      { duration: Math.round(280 / spd), easing: 'cubic-bezier(.3,.8,.4,1.3)' },
    );
    if (n >= TAPS) {
      setState('charging');
      boxSfx.charge();
      setTimeout(() => {
        setState('open');
        boxSfx.open();
        vibrate(20);
        shakeEl(wrapRef.current, 5, Math.round(350 / spd));
      }, Math.round(900 / spd));
      setTimeout(() => {
        setShowInfo(true);
        boxSfx.reveal();
      }, Math.round(2400 / spd));
    }
  }, [state, taps]);

  const claim = (equip: boolean) => {
    boxSfx.click();
    onClaim(equip);
  };

  const isOpen = state === 'open';
  const charging = state === 'charging';
  const seam = charging ? 1 : [0, 0.35, 0.7, 1][taps];
  const anim = state === 'drop' ? 'drop-in' : charging ? 'violent' : taps === 0 ? 'idle-bob' : 'wobble';

  return (
    <div ref={wrapRef} className="absolute inset-0 z-50 overflow-hidden bg-[#0b1420] font-game text-white select-none" onPointerDown={tap}>
      <Dust />
      <div className={`absolute inset-0 transition-colors duration-700 ${isOpen ? 'bg-black/20' : 'bg-black/45'}`} />

      {/* Judul */}
      <div className="absolute top-4 text-center" style={stageColumn}>
        <span className="inline-block rounded-full bg-amber-400 px-3 py-0.5 text-[10px] font-black tracking-widest text-black shadow-md">
          {badge}
        </span>
      </div>
      <div className="absolute text-center" style={{ ...stageColumn, top: landscape ? 44 : 72 }}>
        {!showInfo ? (
          <div className={`transition-all duration-300 ${isOpen ? 'scale-75 opacity-0' : ''}`}>
            <h2 className={`${landscape ? 'text-[22px]' : 'text-[30px]'} font-black leading-none text-amber-300 drop-shadow-[0_3px_0_#9a5b00]`}>
              <LetterPop text={headline} delay={0.2} />
            </h2>
            <p className={`fade-up mt-2 ${landscape ? 'text-sm' : 'text-base'} text-white/80`} style={{ animationDelay: '.8s' }}>
              {hint}
            </p>
          </div>
        ) : weapon ? (
          <>
            <div className="pop-in flex justify-center">
              <span
                className="inline-flex items-center gap-1.5 rounded-full border-2 px-4 py-1 text-[13px] font-black tracking-[0.14em]"
                style={{
                  color: RARITY_COLOR[weapon.rarity],
                  borderColor: RARITY_COLOR[weapon.rarity],
                  background: 'rgba(0,0,0,.45)',
                  boxShadow: `0 0 16px ${RARITY_COLOR[weapon.rarity]}66`,
                }}
              >
                <span className="inline-block h-2 w-2 rounded-full" style={{ background: RARITY_COLOR[weapon.rarity] }} />
                {rarityLabel(weapon.rarity, language)}
              </span>
            </div>
            <h2 className="mt-1 text-[30px] font-black leading-none text-emerald-300 drop-shadow-[0_3px_0_#0d5c33]">
              <LetterPop text={tr(language, 'SENJATA BARU!')} />
            </h2>
            <div className="fade-up mt-1 flex justify-center gap-1" style={{ animationDelay: '.4s' }}>
              {Array.from({ length: RARITY_STARS[weapon.rarity] }).map((_, i) => (
                <span key={i} className="pop-in text-2xl text-yellow-300 drop-shadow-[0_0_8px_#fde047]" style={{ animationDelay: `${0.5 + i * 0.12}s` }}>
                  ★
                </span>
              ))}
            </div>
          </>
        ) : (
          <>
            <h2 className="text-[30px] font-black leading-none text-amber-300 drop-shadow-[0_3px_0_#9a5b00]">
              <LetterPop text={tr(language, 'KOIN BONUS!')} />
            </h2>
            <div className="fade-up mt-2 flex justify-center gap-1.5" style={{ animationDelay: '.3s' }}>
              {[0, 1, 2].map((i) => (
                <span key={i} className="pop-in" style={{ animationDelay: `${0.35 + i * 0.12}s` }}>
                  <CoinSprite size={40} />
                </span>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Ledakan efek saat kotak terbuka — sama dengan slide Knife */}
      {isOpen && (
        <div className="absolute h-0 w-0" style={boxSpot}>
          <GodRays size={620} intensity={1.1} color={rayColor} />
          <Shockwave size={500} color={`rgba(${rayColor},.9)`} />
          <Shockwave size={360} delay={0.15} />
          <Flare width={500} color={rayColor} />
          <Burst count={18} distance={230} />
          <Burst count={12} distance={140} shape="dot" size={8} colors={['#a970ff', '#fff', '#7cf8ff']} delay={0.05} />
          <Confetti count={40} />
        </div>
      )}

      {(taps >= 2 || charging) && !isOpen && (
        <div className="absolute h-0 w-0 transition-opacity" style={{ ...boxSpot, top: landscape ? boxSpot.top : 345, opacity: charging ? 0.9 : 0.45 }}>
          <GodRays size={charging ? 420 : 280} intensity={charging ? 1 : 0.6} color={rayColor} core={false} />
        </div>
      )}

      {/* Kotak hadiah */}
      <div className="absolute w-[200px]" style={boxSpot}>
        {isOpen && <div className="beam-up pointer-events-none absolute bottom-[110px] left-1/2 h-[520px] w-[150px] bg-gradient-to-t from-white via-amber-100/60 to-transparent blur-md" />}

        {isOpen && (
          <div
            className="absolute left-1/2 z-20 h-[240px] w-[336px] -translate-x-1/2"
            // Landscape stacks the reward title above this art, so the weapon
            // rises from the box top instead of climbing into the headline.
            style={{ top: landscape ? 104 : -62 }}
          >
            <div className="weapon-rise h-full w-full">
              <div className={`float relative flex h-full w-full items-center justify-center ${showInfo ? 'reveal-pop' : ''}`}>
                {weapon ? (
                  <>
                    <GunRevealCanvas id={weapon.id} silhouette={!showInfo} />
                    {!showInfo && (
                      <span
                        className="absolute inset-0 flex items-center justify-center pl-4 text-4xl font-bold text-white/90 drop-shadow-[0_0_10px_#7cf8ff]"
                        style={{ transform: 'rotate(35deg)' }}
                      >
                        ?
                      </span>
                    )}
                  </>
                ) : (
                  <div className="relative grid place-items-center gap-1">
                    <CoinSprite size={132} />
                    <span className="text-[22px] font-black text-amber-300 drop-shadow-[0_2px_0_#7a4a00]">+{coins}</span>
                  </div>
                )}
              </div>
            </div>
            <SparkleField count={8} spread={1.6} delay={0.8} />
          </div>
        )}

        <div
          className={`relative z-10 ${anim}`}
          style={{
            transformOrigin: '50% 100%',
            animationDuration: anim === 'wobble' ? `${0.6 - taps * 0.1}s` : anim === 'violent' ? '.3s' : undefined,
          }}
        >
          <div ref={punchRef} style={{ transformOrigin: '50% 100%' }}>
            <div className={isOpen ? 'box-sink' : ''} style={{ animationDelay: isOpen ? '.2s' : undefined }}>
              <div className={`relative z-20 h-[96px] w-[200px] ${isOpen ? 'lid-fly' : ''}`}>
                <GiftBoxLid />
              </div>
              {!isOpen && (
                <div
                  className={`pointer-events-none absolute left-1/2 top-[84px] z-30 h-[14px] w-[176px] -translate-x-1/2 rounded-full ${seam > 0 ? 'seam-pulse' : ''}`}
                  style={{
                    opacity: seam,
                    background: 'linear-gradient(90deg, transparent, #fff8d0 15%, #ffffff 50%, #fff8d0 85%, transparent)',
                    boxShadow: `0 0 ${16 + seam * 22}px ${6 + seam * 8}px rgba(${rayColor},${0.55 * seam})`,
                    transition: 'opacity .25s',
                  }}
                />
              )}
              <div className="relative z-10 mx-auto -mt-2 h-[132px] w-[180px]">
                <GiftBoxBody />
                {seam > 0 && !isOpen && (
                  <div
                    className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-b from-amber-100/40 to-transparent mix-blend-screen"
                    style={{ opacity: seam * 0.5 }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
        <div className={`mx-auto mt-2 h-4 w-40 rounded-full bg-black/45 blur-sm ${isOpen ? 'box-sink' : ''}`} />
      </div>

      {taps > 0 && !isOpen && (
        <div key={`t${taps}`} className="pointer-events-none absolute h-0 w-0" style={{ ...boxSpot, top: landscape ? boxSpot.top : 380 }}>
          <Burst count={7 + taps * 3} distance={100 + taps * 25} shape="star" size={11} />
        </div>
      )}

      {isOpen && <div className="flash pointer-events-none absolute inset-0 bg-white" />}

      {/* Info hadiah + aksi */}
      <div
        className={`absolute flex flex-col items-center gap-2 px-6 ${landscape ? '' : showInfo ? 'inset-x-0 top-[390px]' : 'inset-x-0 bottom-[36px]'}`}
        style={infoPanelStyle}
      >
        {state === 'ready' && (
          <>
            <div className="flex gap-2.5">
              {Array.from({ length: TAPS }).map((_, i) => (
                <span
                  key={i}
                  className={`h-3.5 w-3.5 rounded-full border-2 border-amber-300 transition-all duration-200 ${i < taps ? 'scale-125 bg-amber-300 shadow-[0_0_10px_#fcd34d]' : 'bg-transparent'}`}
                />
              ))}
            </div>
            <p key={taps} className="pop-in tap-hint text-2xl font-black text-white drop-shadow-[0_3px_0_rgba(0,0,0,.35)]">
              {taps === 0 ? tr(language, 'TAP UNTUK MEMBUKA!') : taps === 1 ? tr(language, 'TAP LAGI!') : tr(language, 'SATU LAGI!!')}
            </p>
          </>
        )}
        {showInfo && (
          <div className="pop-in flex w-full max-w-[340px] flex-col items-center gap-1.5">
            {weapon && (
              <>
                <div className="flex flex-wrap items-center justify-center gap-1.5">
                  <span className="rounded-full border border-white/20 bg-black/45 px-2.5 py-1 text-[11px] font-black tracking-wide text-amber-200">
                    {weapon.emoji} {weapon.name}
                  </span>
                  <span
                    className="rounded-full px-2 py-1 text-[10px] font-black text-white"
                    style={{ background: RARITY_COLOR[weapon.rarity] }}
                  >
                    ⚡ {tr(language, weapon.perk)}
                  </span>
                </div>
                <p className="max-w-[340px] text-center text-[12px] leading-snug font-medium text-white/80">{tr(language, weapon.desc)}</p>
              </>
            )}
            <p className="text-[16px] font-black text-amber-300 drop-shadow-[0_2px_0_#7a4a00]">+{coins}{tr(language, ' KOIN 💰')}</p>
            <GreenButton onClick={() => claim(true)} className="w-full max-w-[300px] px-4 py-2 text-[18px]">
              {claimLabel}
            </GreenButton>
            {declineLabel && (
              <button onClick={() => claim(false)} className="text-[12px] font-bold text-white/75 underline underline-offset-2">
                {declineLabel}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface BossGiftBoxModalProps {
  bossName: string;
  stage: number;
  /** Senjata yang sedang dipakai — tidak ikut di-roll supaya hadiah terasa baru. */
  currentWeaponId?: WeaponId;
  /** Klaim hadiah: koin bonus, id senjata baru, dan apakah langsung dipakai. */
  onClaim: (coins: number, weaponId: WeaponId, equip: boolean) => void;
}

/**
 * Bonus stage kotak hadiah ala Knife Boss 100 Lv untuk Gun Hit Arcade:
 * kotak jatuh → tap 3× → buka (lid terbang + sinar + konfeti) → reveal senjata
 * baru dari katalog senjata Gun Hit.
 */
export const BossGiftBoxModal = ({ bossName, stage, currentWeaponId, onClaim }: BossGiftBoxModalProps) => {
  const weapon: Weapon = useMemo(() => rollGiftWeapon(currentWeaponId), [currentWeaponId]);
  const coins = giftBoxCoins(stage, weapon.rarity);
  return (
    <GiftBoxScene
      badge="★ BONUS REWARD STAGE ★"
      headline={`${bossName} DEFEATED!`}
      hint="🎁 Kotak hadiah boss didapat!"
      weapon={weapon}
      coins={coins}
      claimLabel="PAKAI & LANJUT ➜"
      declineLabel="Lanjut tanpa ganti senjata"
      onClaim={(equip) => onClaim(coins, weapon.id, equip)}
    />
  );
};
