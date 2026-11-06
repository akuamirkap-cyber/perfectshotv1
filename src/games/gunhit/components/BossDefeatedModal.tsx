import { tr } from '../../../i18n/strings';
import { useLanguage } from '../../../i18n/useLanguage';
import { useEffect, useRef, useState } from 'react';
import { sfx } from '../game/audio';
import { sfx4 } from '../game/sfx4';
import { HeadArt } from '../../perfect-shot/play/HeadArt';
import { bossHeadFor } from '../game/bossIdentity';
import { bossDef, type BossHead } from '../game/bossCatalog';
import { useSlideActive } from '../../shared/SlideActivity';
import { Burst } from './Effects';
import { getSavedSgaSpeed } from '../game/gameSpeed';

interface BossDefeatedModalProps {
  bossName: string;
  /** The Game B head this boss wears — the only boss identity Game A has. */
  bossHead: BossHead;
  stage: number;
  rewardCoins: number;
  playerLevel: number;
  xpBefore: number;
  xpProgress: number;
  xpGained: number;
  leveledUp: boolean;
  onContinue: () => void;
}

function BossPortrait({ stage, name }: { stage: number; name: string }) {
  const head = bossHeadFor(stage);
  return head ? <div className="relative z-10 h-40 w-40 boss-defeat-portrait" role="img" aria-label={`${name} defeated`}><HeadArt kind={head} className="h-full w-full" /></div> : null;
}

export const BossDefeatedModal = ({
  bossName,
  bossHead,
  stage,
  rewardCoins,
  playerLevel,
  xpBefore,
  xpProgress,
  xpGained,
  leveledUp,
  onContinue,
}: BossDefeatedModalProps) => {
  const [language] = useLanguage();
  const active = useSlideActive();
  const [visibleXp, setVisibleXp] = useState(xpBefore);
  const continueRef = useRef(onContinue);
  continueRef.current = onContinue;
  const boss = bossDef(bossHead);

  useEffect(() => {
    if (!active) return;
    setVisibleXp(xpBefore);
    const reveal = window.setTimeout(() => {
      setVisibleXp(xpProgress);
      sfx.coin();
    }, Math.round(180 / getSavedSgaSpeed()));
    return () => window.clearTimeout(reveal);
  }, [active, xpBefore, xpProgress]);

  useEffect(() => {
    if (!active) return;
    sfx.boss();
    sfx4.match();
    const timer = window.setTimeout(() => continueRef.current(), Math.round(3400 / getSavedSgaSpeed()));
    return () => window.clearTimeout(timer);
  }, [active, stage]);

  return (
    <div className="absolute inset-0 z-40 flex flex-col items-center justify-center overflow-hidden px-6 text-white">
      {/* Keep the live game canvas visible; only a subtle vignette supports contrast. */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_43%,rgba(255,255,255,.035),transparent_52%,rgba(0,0,0,.24)_100%)]" />

      <div className="absolute left-6 right-6 top-6 z-10 flex items-center justify-between font-game text-xl text-amber-300">
        <span className="text-white/80">STAGE {stage}</span>
        <span className="flex items-center gap-1"><span>+{rewardCoins}</span><span className="text-xl">🍎</span></span>
      </div>

      <div className="relative z-10 flex w-full max-w-[360px] flex-col items-center">
        <div className="relative mb-1 flex h-40 w-40 items-center justify-center">
          <div className="absolute inset-0 rounded-full blur-2xl" style={{ background: `radial-gradient(circle, ${boss.glow} 0%, transparent 72%)` }} />
          <BossPortrait stage={stage} name={bossName} />
          <svg className="pointer-events-none absolute inset-3 z-20 h-[136px] w-[136px] boss-crack-overlay" viewBox="0 0 136 136" aria-hidden="true">
            <path d="M72 9 63 30 74 42 57 57 69 68 50 83 60 96 53 124M64 30 46 25M74 42 91 34M57 57 37 52M69 68 91 73M50 83 31 94M60 96 79 110" fill="none" stroke="rgba(235,250,255,.82)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div className="absolute left-1/2 top-1/2 h-0 w-0">
            <Burst count={18} distance={96} size={10} shape="chip" duration={1.25} colors={[boss.accent, '#e5f7ff', '#ffffff', '#94a3b8']} />
          </div>
        </div>

        <div className="text-center font-game">
          <div className="text-4xl font-black tracking-wide text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]">BOSS DEFEATED!</div>
          <div className="mt-1 text-xs font-bold tracking-widest" style={{ color: boss.accent }}>{bossName}{tr(language, ' DITAKLUKKAN!')}</div>
        </div>

        <div className="mt-6 w-full max-w-xs">
          <div className="mb-1 flex items-center justify-between font-game text-[11px] font-black tracking-wider">
            <span className="text-emerald-200">{tr(language, 'LEVEL')} {playerLevel}{leveledUp ? tr(language, ' · LEVEL UP!') : ''}</span>
            <span className="text-lime-200">+{xpGained} XP</span>
          </div>
          <div className="relative flex h-7 items-center overflow-hidden rounded-full border-2 border-white/60 bg-black/45 px-1 shadow-[0_0_12px_rgba(74,222,128,.28)]" role="progressbar" aria-label={`${tr(language, 'Player level ')}${playerLevel} XP`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={visibleXp}>
            <span className="absolute left-2.5 z-10 font-game text-[10px] font-black text-white/90">XP</span>
            <div className="h-4 rounded-full bg-gradient-to-r from-emerald-500 via-green-400 to-lime-300 shadow-[0_0_12px_#4ade80] transition-[width] duration-1000 ease-out" style={{ width: `${visibleXp}%` }} />
            <span className="absolute right-2 z-10 font-mono text-[9px] font-bold text-white drop-shadow">{visibleXp}/100</span>
          </div>
        </div>

        <div className="mt-7 w-full max-w-[230px] text-center">
          <div className="mb-1.5 font-game text-[10px] font-black tracking-[.18em] text-white/70">{tr(language, 'LANJUT OTOMATIS…')}</div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/20">
            <div className="boss-auto-continue h-full rounded-full bg-gradient-to-r from-emerald-300 to-cyan-300" />
          </div>
        </div>
      </div>
    </div>
  );
};
