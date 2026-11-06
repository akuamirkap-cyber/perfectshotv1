import { Component, lazy, Suspense, useCallback, useEffect, useState, type ReactNode } from 'react';
import ScaledFrame from './components/ScaledFrame';
import { displaySize } from './games/gunhit/game/layout';
import {
  getSavedSgaOrientation,
  subscribeSgaOrientation,
  type SgaOrientation,
} from './games/gunhit/game/orientation';
import { SlideActivityProvider } from './games/shared/SlideActivity';
import { juicyAudio } from './utils/juicyAudio';
import { useAndroidBack, installAndroidBack, exitAndroidApp } from './utils/androidBack';
import { sfx as studioSfx } from './games/perfect-shot/audio/sfx';
import { installErrorHooks, reportError } from './telemetry/errorHooks';
import { trackSessionStart } from './telemetry/gameAnalytics';
import { installDebugSinkFromUrl } from './telemetry/debugSink';
// Keep the entry bundle small; preload the game behind the intro so parsing does
// not stall the first menu entrance as the logo disappears.
const loadGunHitGame = () => import('./games/gunhit/App');
const GunHitGame = lazy(loadGunHitGame);
const SansStudioLoading = lazy(() => import('./components/SansStudioLoading'));

function GameBootFallback({ message = 'MEMUAT GAME' }: { message?: string }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-[#0b1418] text-slate-200" role="status" aria-live="polite">
      <span className="h-7 w-7 animate-spin rounded-full border-2 border-slate-700 border-t-sky-400" />
      <span className="text-xs font-semibold tracking-[0.16em]">{message}</span>
    </div>
  );
}

class GameLoadBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }

  componentDidCatch(error: unknown, info: { componentStack?: string | null }) {
    // A crash here used to leave only a blank screen and no trace anywhere.
    reportError('react-boundary', error, { where: 'game-boundary', component: (info.componentStack ?? '').trim().split('\n')[0] ?? '' });
  }

  render() {
    if (this.state.failed) {
      return (
        <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-[#0b1418] px-6 text-center text-slate-200" role="alert">
          <span className="text-sm font-semibold">Game belum berhasil dimuat.</span>
          <button className="rounded-md bg-sky-700 px-4 py-2 text-sm font-semibold text-white" onClick={() => window.location.reload()}>
            Coba muat ulang
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export type SlideId = 'gunhit';

/**
 * Shell aplikasi: intro SANS STUDIO, lalu satu game — GUN HIT (SGA).
 *
 * Sebelumnya shell ini menampung dua game yang bisa digeser (Game A dan Game B).
 * Game B sudah dihapus, jadi tidak ada lagi navigasi antar game maupun status
 * "pane aktif": begitu intro selesai, game langsung tampil penuh.
 */
export default function App() {
  const [pageVisible, setPageVisible] = useState(() => !document.hidden);
  // Game A's canvas can be laid out landscape (gun on the left firing right,
  // target on the right). The frame has to know so it can hand ScaledFrame the
  // swapped base size; the game itself re-reads this from storage.
  const [gunHitOrientation, setGunHitOrientation] = useState<SgaOrientation>(() => getSavedSgaOrientation());
  // Play the SANS STUDIO opening once on startup; Settings can replay it later.
  const [loading, setLoading] = useState(true);
  const [hasBooted, setHasBooted] = useState(false);
  const [introRunKey, setIntroRunKey] = useState(0);
  useEffect(() => subscribeSgaOrientation(setGunHitOrientation), []);

  useEffect(() => {
    // Telemetry boot: counts this launch (local only) and starts listening for
    // uncaught errors. With no analytics sink configured — the shipped default —
    // both are inert and nothing leaves the device.
    const env = (import.meta as unknown as { env?: { DEV?: boolean } }).env;
    installDebugSinkFromUrl(window.location.search, Boolean(env?.DEV));
    trackSessionStart();
    installErrorHooks();
  }, []);

  useEffect(() => {
    // Give the small intro bundle a head start before downloading/parsing the
    // much larger game. Still preload during the animation, not after it.
    const timer = window.setTimeout(() => {
      void loadGunHitGame().catch(() => undefined);
    }, 350);
    return () => window.clearTimeout(timer);
  }, []);

  // Freeze RAF simulation when browser tab / mobile app goes to background
  useEffect(() => {
    const updateVisibility = () => setPageVisible(!document.hidden);
    document.addEventListener('visibilitychange', updateVisibility);
    return () => document.removeEventListener('visibilitychange', updateVisibility);
  }, []);

  // Android back: the press belongs to whatever is on top. Anything a screen
  // did not consume lands here and leaves the app, exactly like a native game.
  useEffect(() => {
    let disposed = false;
    let remove: (() => void) | undefined;
    void installAndroidBack(() => {
      void exitAndroidApp();
    }).then((off) => {
      if (disposed) off();
      else remove = off;
    });
    return () => {
      disposed = true;
      remove?.();
    };
  }, []);

  useAndroidBack(() => false, !loading);

  // Allow replaying the SANS STUDIO 2D Game Intro anytime from SGA Settings
  useEffect(() => {
    const onReplay = () => {
      juicyAudio.unlock();
      setIntroRunKey((k) => k + 1);
      setLoading(true);
    };
    window.addEventListener('sans-replay-intro', onReplay);
    return () => window.removeEventListener('sans-replay-intro', onReplay);
  }, []);

  useEffect(() => {
    if (loading || !hasBooted) return;
    const timer = window.setTimeout(() => {
      window.dispatchEvent(new CustomEvent('sans-intro-complete', {
        detail: { replay: introRunKey > 0 },
      }));
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loading, hasBooted, introRunKey]);

  const handleLoadingComplete = useCallback(() => {
    setLoading(false);
    setHasBooted(true);
    juicyAudio.suspendAfterIntro(550);
  }, []);

  // The frame's base rectangle follows the chosen orientation so ScaledFrame
  // scales the right shape into the viewport (portrait 420x760, landscape
  // 760x420). The canvas inside sizes itself from the same source of truth.
  const frame = displaySize(gunHitOrientation);

  return (
    <div
      className="fixed inset-0 flex h-dvh w-full flex-col overflow-hidden bg-[#05060a] select-none touch-manipulation"
      onPointerDownCapture={(event) => {
        const target = event.target as Element | null;
        if (!target?.closest('button, [role="button"]')) return;
        studioSfx.init();
        if (studioSfx.getState().music) studioSfx.startMusic();
      }}
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)',
      }}
    >
      <main
        className="relative flex min-h-0 w-full flex-1 items-center justify-center"
        data-game-id="A"
        data-game-name="GUNHIT"
        aria-label="Gun Hit SGA"
      >
        <SlideActivityProvider active={pageVisible && !loading}>
          <GameLoadBoundary>
            <ScaledFrame baseWidth={frame.w} baseHeight={frame.h}>
              <div className="relative overflow-hidden" style={{ width: frame.w, height: frame.h }}>
                {hasBooted ? (
                  <Suspense fallback={<GameBootFallback />}>
                    <GunHitGame introReady={hasBooted && !loading} />
                  </Suspense>
                ) : (
                  <GameBootFallback message="MENYIAPKAN SGA" />
                )}
              </div>
            </ScaledFrame>
          </GameLoadBoundary>
        </SlideActivityProvider>
      </main>

      {loading && (
        <Suspense fallback={<GameBootFallback message="MEMUAT INTRO" />}>
          <SansStudioLoading
            key={introRunKey}
            active={pageVisible}
            onComplete={handleLoadingComplete}
          />
        </Suspense>
      )}
    </div>
  );
}
