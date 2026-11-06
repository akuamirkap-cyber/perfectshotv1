import { Suspense, lazy, useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import type { Game } from './game/Game';
import { CX as WORLD_CX, GAMEPLAY_GUN_SCALE, GUN_Y, H, initialGameplayWheelCenterY, LAND_H, LAND_W } from './game/layout';
import { makeLevel } from './game/levels';
import { savedValues, storage } from './game/safeStorage';
import { APP_VERSION } from '../../telemetry/version';
import { setMasterVolume, setMuted, sfx } from './game/audio';
import type { BossHead } from './game/bossCatalog';
import { bossXpReward, getPlayerProgress } from './game/playerProgress';
import { sfx4 } from './game/sfx4';
import { sfx3 } from './game/sfx3';
import { getWeapon, isWeaponUnlocked, RARITY_COLOR, WEAPONS, type WeaponId } from './game/weapons';
import { useSlideActive } from '../shared/SlideActivity';
import { useAndroidBack } from '../../utils/androidBack';
import { Burst, Dust, Flare, Shockwave, SparkleField, SunburstFX } from './components/Effects';
import MenuStageBackdrop from './components/MenuStageBackdrop';
import ZipWeaponArt from './components/ZipWeaponArt';
import ZipWeaponOverlay from './components/ZipWeaponOverlay';
import { hasZipArt } from './zipWeapons/ids';
import { setGunLookChangeListener } from './game/art/lookChange';
import { gunSunburstColor } from './game/sunburstPalette';
/**
 * Weapon artwork for the menu showcase: a dynamic import, so the title screen
 * does not wait for every gun's art to be parsed before it can paint.
 */
type MenuGunArt = typeof import('./game/menuGunArt');
let menuGunArtPromise: Promise<MenuGunArt> | null = null;
/**
 * The art module itself, once the chunk has parsed.
 *
 * The page is mounted again every time the player enters it, and React state
 * starts empty each time. Keeping the resolved module here lets the second and
 * every later entry paint the live weapon on its first frame, instead of
 * replaying a 260 KB snapshot and painting over it a moment later.
 */
let menuGunArtModule: MenuGunArt | null = null;
const loadMenuGunArt = () => (menuGunArtPromise ??= import('./game/menuGunArt'));
void loadMenuGunArt().then((mod) => { menuGunArtModule = mod; });
/**
 * Why the artwork is asked for here, at module scope, and not in an effect.
 *
 * The chain behind `menuGunArt` (the gun modules and the ported slides they
 * import) is the largest thing the menu needs, and it used to be requested only
 * after React had committed — so the hero weapon arrived a beat or two after the
 * title. Requesting it with the shell lets the download overlap everything else
 * the first render does, and the matching `modulepreload` hints in `index.html`
 * (see `preloadMenuGunArt()` in `vite.config.ts`) start it even earlier.
 */

/**
 * The last weapon the menu painted, kept as a bitmap.
 *
 * Even preloaded, the artwork is a lazy chunk, so on a cold start the showcase
 * is empty until it lands. A painted frame is a few dozen KB, so it is kept (per
 * weapon, per app version) and drawn the moment the menu mounts: the weapon is
 * on screen immediately, and the live artwork replaces it as soon as it parses.
 */
/** Backing size of the showcase canvas, in CSS pixels (-10% of the old 374x328). */
const MENU_GUN_CANVAS_W = 337;
const MENU_GUN_CANVAS_H = 295;
const MENU_GUN_BITMAP_KEY = 'sga_menu_gun_frame';
/**
 * Ceiling for the kept frame.
 *
 * It rides in the same store as the progress, and in a frame where the browser
 * refuses web storage that store is mirrored into `window.name`, which the
 * browser truncates at a couple of megabytes. A quarter of a megabyte keeps the
 * whole snapshot comfortably inside that.
 */
const MENU_GUN_BITMAP_MAX = 260_000;
interface MenuGunBitmap { v: string; id: string; png: string }
/** Mirrors the live artwork's readiness so a late bitmap never paints over it. */
const menuGunArtReady = { current: false };

function readMenuGunBitmap(): MenuGunBitmap | null {
  try {
    const raw = storage.getItem(MENU_GUN_BITMAP_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as MenuGunBitmap;
    if (!parsed || parsed.v !== APP_VERSION || typeof parsed.png !== 'string') return null;
    return parsed;
  } catch {
    return null;
  }
}

/** A PNG of the frame, halved when the device-pixel copy is too heavy to keep. */
function frameToPng(cv: HTMLCanvasElement): string | null {
  try {
    if (typeof cv.toDataURL !== 'function') return null;
    const full = cv.toDataURL('image/png');
    if (full && full.length <= MENU_GUN_BITMAP_MAX) return full;
    if (typeof document === 'undefined' || !cv.width || !cv.height) return null;
    const half = document.createElement('canvas');
    half.width = Math.max(1, Math.round(cv.width / 2));
    half.height = Math.max(1, Math.round(cv.height / 2));
    const ctx = half.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(cv, 0, 0, half.width, half.height);
    const small = half.toDataURL('image/png');
    return small && small.length <= MENU_GUN_BITMAP_MAX ? small : null;
  } catch {
    return null;
  }
}

/** Weapon pivot (CSS px from the canvas centre) already measured by a live paint. */
const menuGunPivot = new Map<string, { x: number; y: number }>();
/** The frame already encoded for the cold-start snapshot (`weapon|art|canvas`). */
let keptMenuGunFrame = '';
/** Key of the newest paint, so a deferred snapshot never keeps a stale weapon. */
let latestMenuGunPaint = '';

/**
 * Keep the painted frame for the next cold start — after the menu is up.
 *
 * Encoding a 674x590 canvas to PNG and writing the base64 into web storage is
 * tens of milliseconds of main-thread work. Doing it inside the paint effect put
 * that on the entering frame, exactly when the page has the least budget to
 * spare, which is what made the page feel late. It now runs once per weapon when
 * the browser is idle, and not at all when that frame is already kept.
 */
function keepMenuGunFrameLater(cv: HTMLCanvasElement, id: string, key: string) {
  if (keptMenuGunFrame === key) return;
  const run = () => {
    if (latestMenuGunPaint !== key || keptMenuGunFrame === key) return;
    const png = frameToPng(cv);
    if (!png) return;
    try {
      storage.setItem(MENU_GUN_BITMAP_KEY, JSON.stringify({ v: APP_VERSION, id, png } satisfies MenuGunBitmap));
      keptMenuGunFrame = key;
    } catch {
      // Storage refused: the live artwork is enough.
    }
  };
  const idle = (globalThis as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
  if (idle) idle(run, { timeout: 1500 });
  else window.setTimeout(run, 260);
}

import { juicyAudio } from '../../utils/juicyAudio';
import DiamondSprite from '../shared/DiamondSprite';
import CoinSprite from '../shared/CoinSprite';
import { MILESTONES, QUESTS, type Quest, type QuestState } from './game/quests';
import { GUN_HIT_MAP_MAX_LEVEL, getGunHitMapNodeTheme, getGunHitMapStage } from './game/stageMap';
import { useAllStagesOpen, toggleAllStagesOpen, isUnlockShortcut } from './game/stageUnlock';
import { WEAPON_FLIGHT_MS } from './components/weaponFlightTiming';
import PrivacyPage from '../../components/PrivacyPage';
import HowToPlayPage from './components/HowToPlayPage';
import ResetProgressDialog from './components/ResetProgressDialog';
import { tr } from '../../i18n/strings';
import { useLanguage } from '../../i18n/useLanguage';
import { markHowToPlaySeen, shouldShowHowToPlay } from '../../storage/firstRun';
import { resetProgress } from '../../storage/resetProgress';
import { bootSave } from '../../storage/saveState';
import type { Player } from '../perfect-shot/rank/data';
import { getLanguage } from '../../i18n/language';
import { readRuns, recordRun, type RunRecord } from '../../storage/leaderboard';
import { currentRun, trackRunEnd, trackStageClear, trackStageStart } from '../../telemetry/gameAnalytics';
import type { SgaWeaponFlightData } from './components/SgaWeaponFlight';

/**
 * Everything behind a tap is loaded on demand: the armory, the quest page, the
 * settings sheet, the results overlays. None of it is needed for the title
 * screen to paint, and each one drags its own artwork with it.
 */
const Arsenal = lazy(() => import('./components/Arsenal'));
const QuestModal = lazy(() => import('./components/QuestModal'));
const SgaSettingsPanel = lazy(() => import('./components/SgaSettingsPanel'));
const SgaWeaponFlight = lazy(() => import('./components/SgaWeaponFlight'));
const RankBoardPage = lazy(() =>
  import('../perfect-shot/components/Leaderboard').then((m) => ({ default: m.Leaderboard })));
const BossDefeatedModal = lazy(() =>
  import('./components/BossDefeatedModal').then((m) => ({ default: m.BossDefeatedModal })));
const BossGiftBoxModal = lazy(() =>
  import('./components/BossGiftBoxModal').then((m) => ({ default: m.BossGiftBoxModal })));
const GiftBoxScene = lazy(() =>
  import('./components/BossGiftBoxModal').then((m) => ({ default: m.GiftBoxScene })));
const StarBuffModal = lazy(() => import('./components/StarBuffModal'));
const StageMapPage = lazy(() =>
  import('../perfect-shot/components/QuestMap').then((m) => ({ default: m.QuestMap })));
import type { StageBase } from '../perfect-shot/quest/data';
import { levelConfig, type TargetKind } from '../perfect-shot/play/levels';
import type { FlatName } from '../perfect-shot/ui/FlatIcons';
import type { HeadKind } from '../perfect-shot/play/HeadArt';
import { WheelArtBridge } from './components/WheelArtBridge';
import MenuEnvironment, { type MenuEnvironmentTheme } from './components/MenuEnvironment';
import { SGA_SPEED_OPTIONS, formatSgaSpeed, getSavedSgaSpeed } from './game/gameSpeed';
import { useSgaBulletSpeed } from './utils/useSgaBulletSpeed';
import { useSgaSpotCombo } from './utils/useSgaSpotCombo';
import { useSgaGameSpeed } from './utils/useSgaGameSpeed';
import { SGA_BG_THEMES, getSavedSgaBgTheme } from './game/backgroundThemes';
import { useSgaBgTheme } from './utils/useSgaBgTheme';
import { SGA_ORIENTATION_OPTIONS, getSavedSgaOrientation, isLandscape } from './game/orientation';
import { useSgaOrientation } from './utils/useSgaOrientation';
import { displaySize } from './game/layout';
import { getFast2DContext, getOptimalCanvasDpr } from './utils/mobilePerf';
import { TransitionOverlay, type OverlayPhase, type OverlayVariant } from '../perfect-shot/components/TransitionOverlay';
import { sfx as studioSfx } from '../perfect-shot/audio/sfx';
import { useSound as useStudioSound } from '../perfect-shot/audio/useSound';
import { ARMORY_SHUTTER, SHOP_IN, SHOP_OUT } from '../perfect-shot/shop/timeline';
import { PLAY_IN, PLAY_OUT } from '../perfect-shot/play/levels';
import { QUEST_IN, QUEST_OUT } from '../perfect-shot/quest/data';
import { ACH_IN, ACH_OUT } from '../perfect-shot/ach/data';
import { LB_IN, LB_OUT } from '../perfect-shot/rank/data';
import { GameIcon, NavFrame, type IconName } from '../perfect-shot/ui/GameIcons';
import { useSettings as usePerfectShotSettings } from '../perfect-shot/theme/themes';
import { animClass, animStore, getSharedMenuPlan, gunTiming, publishMenuPlan, resolvePlan, SPEEDS, STYLES, subscribeMenuPlan, TL, WHEEL, useAnimCfg, type Plan, type StyleId } from '../perfect-shot/anim/presets';
import { OVERLAY_RATE } from '../perfect-shot/anim/speed';

type Screen = 'menu' | 'playing' | 'over';

/**
 * The engine — art for every weapon, every ported slide, the boss catalogue and
 * all the FX — is by far the largest module in this app. Pulling it in as its
 * own chunk lets the menu paint (and accept taps) without waiting for it; the
 * chunk is requested on mount, so it is normally warm long before a run starts.
 * Anything that must start a run before it lands is queued in `engineQueue`.
 */
const loadEngine = () => import('./game/Game');

/** An overlay whose chunk is still in flight simply is not on screen yet. */
const Overlay = ({ children }: { children: ReactNode }) => <Suspense fallback={null}>{children}</Suspense>;
type MenuPageTransition = { phase: OverlayPhase; variant: OverlayVariant; label: string; rate: number } | null;
type MenuDeparture = 'gun' | 'quest' | 'ready' | 'ranks' | 'play' | null;
type MenuTransitionTiming = { lead: number; cover: number; hold: number; reveal: number; swapAt: number; finishAt: number; rate: number };
/** Sounds that belong to one phase of a page transition, fired with that phase. */
type PhaseAudio = { cover?: (t: MenuTransitionTiming) => void; swap?: (t: MenuTransitionTiming) => void };

/**
 * Run `fn` on the first frame after the state change that was just queued.
 *
 * Every phase sound used to be scheduled from the tap instant with a
 * pre-computed delay, so React's mount of the incoming page plus its first
 * paint landed *behind* the audio: the cover slam, the page entrance and the
 * hero impact were all heard first and seen a few frames later. Firing them
 * from the frame that actually starts the animations keeps sound and picture
 * on the same beat, no matter how long the page takes to mount on a phone.
 */
const afterPaint = (fn: () => void) => {
  let fired = false;
  const run = () => { if (fired) return; fired = true; fn(); };
  if (typeof requestAnimationFrame === 'function') requestAnimationFrame(run);
  window.setTimeout(run, 120);
};
const PLAY_SCOPE = { menuLead: 180, questLead: 260, otherLead: 460, cover: 620, hold: 600, reveal: 680 };
const MENU_EXIT_K = 0.78;
const PAGE_OVERLAYS: Partial<Record<OverlayVariant, { cover: number; hold: number; reveal: number }>> = {
  shutter: ARMORY_SHUTTER,
  cloud: { cover: 600, hold: 400, reveal: 820 },
  wrap: { cover: 640, hold: 560, reveal: 820 },
  podium: { cover: 600, hold: 520, reveal: 700 },
  fade: { cover: 200, hold: 60, reveal: 260 },
};

const SGA_MENU_NAV: { id: 'gun' | 'ranks' | 'ready' | 'setting'; label: string; icon: IconName; highlight?: boolean }[] = [
  { id: 'gun', label: 'GUN', icon: 'gun' },
  { id: 'ranks', label: 'RANKS', icon: 'ranks' },
  { id: 'ready', label: 'READY!', icon: 'gift', highlight: true },
  { id: 'setting', label: 'SETTING', icon: 'gear' },
];

const SGA_QUEST_STAGES: StageBase[] = Array.from({ length: GUN_HIT_MAP_MAX_LEVEL }, (_, index) => {
  const n = index + 1;
  const type = getGunHitMapStage(n);
  const node = getGunHitMapNodeTheme(n);
  return {
    n,
    type,
    name: node.label,
    icon: (type === 'boss' ? 'swords' : type === 'special' ? 'star' : 'target') as StageBase['icon'],
  };
});

const menuMotion = (animation: string, delay: number, duration: number, extra = '') => ({
  className: `a ${animation} menu-motion ${extra}`,
  style: { '--d': `${delay}ms`, '--dur': `${duration}ms` } as CSSProperties,
});

function MusicAmbientControl({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  const [language] = useLanguage();
  return (
    <button
      type="button"
      aria-pressed={enabled}
      onClick={onToggle}
      className="mt-2.5 flex w-full items-center justify-between rounded-xl border border-white/10 bg-black/15 px-3 py-2 text-left transition hover:bg-white/10 active:scale-[0.99]"
    >
      <span className="flex items-center gap-2">
        <span aria-hidden="true">🎵</span>
        <span>
          <span className="block text-[11px] font-black">{tr(language, 'MUSIK & AMBIENCE')}</span>
          <span className="block text-[9px] text-white/55">{tr(language, 'Suasana lembut ala Perfect Shot')}</span>
        </span>
      </span>
      <span className={`rounded-full px-2.5 py-1 text-[9px] font-black ${enabled ? 'bg-emerald-400/20 text-emerald-200' : 'bg-white/10 text-white/60'}`}>
        {enabled ? tr(language, 'AKTIF') : tr(language, 'MATI')}
      </span>
    </button>
  );
}

function MenuBullet() {
  return (
    <div className="relative h-[18px] w-[58px] drop-shadow-[0_0_8px_rgba(255,220,140,.75)]">
      <div className="b3d-case absolute left-[3px] top-0 h-full w-[58%] overflow-hidden rounded-l-[3px] shadow-[inset_0_0_0_1px_rgba(70,40,0,.55)]" />
      <div className="absolute -left-[1px] -top-[1px] h-[20px] w-[6px] rounded-[2px] bg-gradient-to-b from-[#fff2b0] via-[#d49a2a] to-[#5a3505] shadow-[inset_0_0_0_1px_rgba(60,30,0,.6)]" />
      <div className="b3d-band absolute left-1/2 top-0 h-full w-[7%]" />
      <div className="b3d-tip absolute left-[56%] top-[1px] h-[16px] w-[44%] overflow-hidden shadow-[inset_0_0_0_1px_rgba(70,25,5,.55)]" style={{ borderRadius: '0 75% 75% 0 / 0 50% 50% 0' }}>
        <span className="b3d-glint absolute inset-x-0 h-[3px] bg-white/80 blur-[0.5px]" />
      </div>
      <div className="pointer-events-none absolute left-[5%] right-[12%] top-[20%] h-[2px] rounded-full bg-white/85" />
      <div className="pointer-events-none absolute bottom-[12%] left-[5%] right-[16%] h-[2px] rounded-full bg-black/35" />
    </div>
  );
}

/**
 * Baris papan skor dari run yang benar-benar disimpan di perangkat ini.
 *
 * PERINGKAT dulu menampilkan pesaing karangan (skor bot tetap, nama asing).
 * Sekarang isinya run pemain sendiri: skor, stage dan waktunya nyata, dan
 * semua tetap di HP — tidak ada leaderboard online (lihat docs/SAVE-DATA.md).
 */
function runsToRivals(runs: RunRecord[]): Player[] {
  return runs.map((run, index) => ({
    id: `run-${run.at}-${index}`,
    name: `${tr(getLanguage(), 'RUN #')}${index + 1}`,
    country: 'ID' as const,
    score: run.score,
    stage: run.stage,
    trend: 0,
    seed: 400 + index,
  }));
}

/**
 * Migrasi + verifikasi checksum simpanan sebelum layar pertama membaca progres.
 * Modul ini dievaluasi sebelum komponen mana pun merender, jadi `useState`
 * pertama sudah melihat nilai yang sudah dirapikan.
 */
const saveReport = bootSave(storage);

const LS = {
  best: 'gunhit_best',
  bestLevel: 'gunhit_best_level',
  coins: 'gunhit_coins',
  diamonds: 'gunhit_diamonds',
  weapon: 'gunhit_weapon',
  owned: 'gunhit_owned_weapons',
  rareOwned: 'gunhit_rare_owned',
  quests: 'gunhit_quests_state',
  playerXp: 'gunhit_player_xp',
  playerLevel: 'gunhit_player_level',
  menuTheme: 'gunhit_menu_theme',
  volume: 'gunhit_volume',
};

const initialSoundVolume = (): number => {
  const saved = storage.getItem(LS.volume);
  if (saved === null) return 1;
  const parsed = Number(saved);
  return Number.isFinite(parsed) ? Math.max(0, Math.min(1, parsed)) : 1;
};

const num = (k: string) => Number(storage.getItem(k) || 0);
const coinsInBank = () => {
  const saved = storage.getItem(LS.coins);
  return saved === null ? 120 : Number(saved) || 0;
};
const diamondsInBank = () => Number(storage.getItem(LS.diamonds) || 0) || 0;
const ownedWeaponIds = (): string[] => {
  const normalOwned: string[] = [];
  try {
    const saved = JSON.parse(storage.getItem(LS.owned) || '[]');
    if (Array.isArray(saved)) normalOwned.push(...saved.filter((id): id is string => typeof id === 'string' && WEAPONS.some(w => w.id === id && w.rarity !== 'LANGKA')));
  } catch { /* collection save is optional */ }
  try {
    const boughtRare = JSON.parse(storage.getItem(LS.rareOwned) || '[]');
    if (Array.isArray(boughtRare)) normalOwned.push(...boughtRare.filter((id): id is string => typeof id === 'string' && WEAPONS.some(w => w.id === id && w.rarity === 'LANGKA')));
  } catch { /* collection save is optional */ }
  return [...new Set(normalOwned)];
};
const initialWeapon = (): WeaponId => {
  const saved = getWeapon(storage.getItem(LS.weapon) || 'pistol');
  return isWeaponUnlocked(saved, ownedWeaponIds()) ? saved.id : 'pistol';
};

const getInitialQuests = (): QuestState => {
  const defaults: QuestState = {
    claimed: [], milestonesClaimed: [], maxCombo: 0,
    totalCoinsCollected: num(LS.coins), highestScore: num(LS.best), highestLevel: num(LS.bestLevel) || 1,
    stagesWon: 0, bossesDefeated: 0, boxesOpened: 0, weaponEquips: 0, shotsFired: 0,
    highestPlayerLevel: Math.max(Number(storage.getItem(LS.playerLevel) || 1) || 1, getPlayerProgress(num(LS.playerXp)).level),
  };
  try {
    const saved = JSON.parse(storage.getItem(LS.quests) || 'null');
    if (saved && typeof saved === 'object') {
      const count = (value: unknown, fallback = 0) => {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? Math.max(0, Math.floor(parsed)) : fallback;
      };
      const validQuestIds = new Set(QUESTS.map(q => q.id));
      return {
        ...defaults,
        claimed: Array.isArray(saved.claimed) ? saved.claimed.filter((id: unknown): id is string => typeof id === 'string' && validQuestIds.has(id)) : [],
        milestonesClaimed: Array.isArray(saved.milestonesClaimed) ? saved.milestonesClaimed.filter((value: unknown): value is number => [5, 10, 20].includes(Number(value))).map(Number) : [],
        maxCombo: count(saved.maxCombo),
        totalCoinsCollected: count(saved.totalCoinsCollected, defaults.totalCoinsCollected),
        highestScore: count(saved.highestScore, defaults.highestScore),
        highestLevel: Math.max(1, count(saved.highestLevel, defaults.highestLevel)),
        stagesWon: count(saved.stagesWon),
        bossesDefeated: count(saved.bossesDefeated),
        boxesOpened: count(saved.boxesOpened),
        weaponEquips: count(saved.weaponEquips),
        shotsFired: count(saved.shotsFired),
        highestPlayerLevel: Math.max(defaults.highestPlayerLevel, count(saved.highestPlayerLevel, defaults.highestPlayerLevel)),
      };
    }
  } catch { /* migrate older or malformed quest saves from defaults */ }
  return defaults;
};

/**
 * Slide 1 mounts only once its saved coins/weapon/collection can be read.
 *
 * In a frame that refuses storage the page shim restores them from IndexedDB or
 * `window.name`, which takes a tick; rendering early would freeze the defaults
 * into state and the restored values would never show up. When storage works
 * the tracker answers `true` immediately, so there is no waiting state at all.
 */
function useSavedValuesReady(): boolean {
  const [ready, setReady] = useState(() => savedValues.isReady());
  useEffect(() => {
    if (ready) return;
    const unsubscribe = savedValues.subscribe(() => setReady(true));
    // The restore can land between the render and this effect; without this
    // second look the slide would sit on the waiting shell for good.
    if (savedValues.isReady()) setReady(true);
    return unsubscribe;
  }, [ready]);
  return ready;
}

export default function App({ onExit, introReady = true }: { onExit?: () => void; introReady?: boolean }) {
  const ready = useSavedValuesReady();
  // Same shell the game paints, so the wait never flashes white.
  if (!ready) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-[#0b1418] text-slate-300" aria-busy="true" role="status">
        <span className="h-7 w-7 animate-spin rounded-full border-2 border-slate-700 border-t-sky-400" />
        <span className="text-[10px] font-semibold tracking-[0.14em]">MEMULIHKAN PROGRES</span>
      </div>
    );
  }
  return <GunHitGame onExit={onExit} introReady={introReady} />;
}

function GunHitGame({ onExit, introReady }: { onExit?: () => void; introReady: boolean }) {
  const active = useSlideActive();
  const perfectShotIconSet = usePerfectShotSettings().icons;
  const psAnimationConfig = useAnimCfg();
  const studioSound = useStudioSound();
  const [menuPlan, setMenuPlan] = useState<Plan>(() => getSharedMenuPlan() ?? resolvePlan(psAnimationConfig));
  const menuPlanRef = useRef(menuPlan);
  menuPlanRef.current = menuPlan;
  const studioVolumeRef = useRef<number | null>(null);
  const [menuReady, setMenuReady] = useState(false);

  /** When the weapon last fired, for the zip guns' muzzle round. */
  const zipMuzzleShotAtRef = useRef(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const weaponPivotRef = useRef<HTMLDivElement>(null);
  /** Landscape-only aim rig for the menu weapon (W/S lift + mouse heading). */
  const gunAimRef = useRef<HTMLDivElement>(null);
  const gunTiltRef = useRef<HTMLDivElement>(null);
  const gunAimState = useRef({ lift: 0, up: false, down: false });
  const gameShellRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Game | null>(null);
  // Runs asked for while the engine chunk is still in flight.
  const engineQueue = useRef<((engine: Game) => void)[]>([]);
  /**
   * Starts the engine boot (chunk + constructor).
   *
   * The engine canvas sits *behind* the menu, which paints its own room, so
   * nothing on the title screen needs it. Building it during the entrance used
   * to land ~300 KB of parsing plus the constructor on the very frames the menus
   * animate in — the transition stuttered every single time. It now boots when
   * the menu has settled, and immediately if a run is asked for first.
   */
  const engineBootRef = useRef<(() => void) | null>(null);
  const engineBootingRef = useRef(false);
  // Latest "is the engine allowed to simulate" flag, so a late engine starts
  // in the right state instead of waiting for the next dependency change.
  const activeRef = useRef(false);
  // Gun art for the menu showcase, once its chunk has landed.
  // Seed from the module already parsed by a previous visit to this page.
  const [gunArt, setGunArt] = useState<MenuGunArt | null>(menuGunArtModule);
  /** Bumped when the paint effect found no canvas yet, so it runs again. */
  const [gunPaintTick, setGunPaintTick] = useState(0);
  /**
   * Bumped whenever the player picks a different skin or shot in the arsenal.
   * The menu keeps its painted frame AND its ink pivot keyed on the design, so a
   * stale picture (or a pivot measured on another gun) would otherwise survive
   * the change: with the zip art now one card among several, picking another
   * card has to repaint and re-measure.
   */
  const [gunLookTick, setGunLookTick] = useState(0);
  useEffect(() => {
    setGunLookChangeListener(() => setGunLookTick((n) => n + 1));
    return () => setGunLookChangeListener(null);
  }, []);

  /**
   * The gun whose live zip SVG currently owns the menu showcase (null when the
   * equipped gun is not on its "Skin 3" card), read from the same chooser the
   * engine uses, and re-read on every pick.
   */
  const [zipCardWeapon, setZipCardWeapon] = useState<string | null>(null);
  menuGunArtReady.current = Boolean(gunArt);
  useEffect(() => {
    if (menuGunArtModule) return;
    let alive = true;
    void loadMenuGunArt().then((mod) => {
      if (alive && !menuGunArtModule) setGunArt(mod);
    });
    return () => {
      alive = false;
    };
  }, []);

  /** Start a run now, or the moment the engine chunk lands. */
  const whenEngine = (start: (engine: Game) => void) => {
    const engine = gameRef.current;
    if (engine) {
      start(engine);
      return;
    }
    engineQueue.current.push(start);
    // A run is waiting: stop waiting for idle and boot now.
    engineBootRef.current?.();
  };
  // Game B's wheel artwork, rasterised on demand and handed to the engine so
  // every stage shows exactly the wheel the reference game shows.
  const wheelArtCache = useRef(new Map<string, HTMLImageElement>());
  // The SVG the raster came from: the engine traces it for pixel-free collision.
  const wheelSvgCache = useRef(new Map<string, string>());
  const [wheelArtJobs, setWheelArtJobs] = useState<
    { key: string; kind: TargetKind; icon?: FlatName; head?: HeadKind }[]
  >([]);
  const wheelArtKeyFor = useCallback((level: number) => {
    const c = levelConfig(level);
    return `${c.target}|${c.head ?? ''}`;
  }, []);
  const requestWheelArt = useCallback((level: number) => {
    const c = levelConfig(level);
    const key = `${c.target}|${c.head ?? ''}`;
    if (wheelArtCache.current.has(key)) return;
    setWheelArtJobs((jobs) =>
      jobs.some((job) => job.key === key) ? jobs : [...jobs, { key, kind: c.target, icon: c.icon, head: c.head }],
    );
  }, []);

  const [screen, setScreen] = useState<Screen>('menu');
  const screenRef = useRef<Screen>(screen);
  screenRef.current = screen;
  const [mapOpen, setMapOpen] = useState(false);
  /** All stages open (default) — P on the quest page flips back to normal. */
  const allStagesOpen = useAllStagesOpen();
  const [unlockToast, setUnlockToast] = useState<string | null>(null);
  const [mapLeaving, setMapLeaving] = useState(false);
  const [questLeaving, setQuestLeaving] = useState(false);
  const [leaderboardLeaving, setLeaderboardLeaving] = useState(false);
  const [menuPageTransition, setMenuPageTransition] = useState<MenuPageTransition>(null);
  const [menuDeparture, setMenuDeparture] = useState<MenuDeparture>(null);
  const menuPageTransitionBusyRef = useRef(false);
  /**
   * The entrance choreography of a *replayed* menu.
   *
   * Replaying a preset remounts the whole menu, so its CSS entrance only starts
   * a frame or two after the tap (and later still on a slow phone). The audio
   * used to be scheduled from the tap itself, which left `menuEnter`'s letters,
   * thuds and impact a step ahead of the picture every time a preset changed.
   * The plan waits here instead and is played on the frame the replay paints.
   */
  const menuEntranceAudioRef = useRef<Plan | null>(null);
  const pendingSettingsPlanRef = useRef<Plan | null>(null);
  const menuPageTransitionTimersRef = useRef<number[]>([]);
  const [playTransition, setPlayTransition] = useState<{ phase: OverlayPhase; label: string; origin: { x: number; y: number }; lens: number } | null>(null);
  const [playMenuExiting, setPlayMenuExiting] = useState(false);
  const [weaponFlight, setWeaponFlight] = useState<SgaWeaponFlightData | null>(null);
  const playTransitionBusyRef = useRef(false);
  const pageExitTimersRef = useRef<number[]>([]);
  const startingLevelRef = useRef(1);
  const [transitioning, setTransitioning] = useState(false);
  const [transText, setTransText] = useState('READY?');
  const [transitionStep, setTransitionStep] = useState<0 | 1 | 2>(0);

  useEffect(() => () => pageExitTimersRef.current.forEach((timer) => window.clearTimeout(timer)), []);
  useEffect(() => () => menuPageTransitionTimersRef.current.forEach((timer) => window.clearTimeout(timer)), []);
  useEffect(() => {
    const shared = getSharedMenuPlan();
    if (shared) setMenuPlan(shared);
    return subscribeMenuPlan(setMenuPlan);
  }, []);

  const [result, setResult] = useState({ score: 0, level: 1, coins: 0, newBest: false });
  const [displayScore, setDisplayScore] = useState(0);

  const [best, setBest] = useState(() => num(LS.best));
  const [bestLevel, setBestLevel] = useState(() => Math.max(1, num(LS.bestLevel)));
  const [totalCoins, setTotalCoins] = useState(coinsInBank);
  const [diamonds, setDiamonds] = useState(diamondsInBank);
  const [diamondToast, setDiamondToast] = useState<{ amount: number; large: boolean; id: number } | null>(null);
  const [diamondFlight, setDiamondFlight] = useState<{ amount: number; x: number; y: number; id: number } | null>(null);
  const diamondFlightRef = useRef<HTMLDivElement>(null);
  const [diamondReveal, setDiamondReveal] = useState<{ id: number; amount: number } | null>(null);
  const [diamondHudMode, setDiamondHudMode] = useState(false);
  const [weaponCelebration, setWeaponCelebration] = useState<{ weaponId: WeaponId; id: number } | null>(null);
  // Peti milestone di halaman reward membuka kado sungguhan (tap 3× → tutup
  // terbang → hadiah keluar) sebelum hadiahnya benar-benar masuk.
  const [milestoneGift, setMilestoneGift] = useState<{ count: number; weaponId: WeaponId | null; coins: number } | null>(null);

  const [questState, setQuestState] = useState<QuestState>(getInitialQuests);
  const questStateRef = useRef(questState);
  /**
   * Shots are accumulated purely in memory (`pendingShotsRef`) during active
   * shooting so firing NEVER triggers a React tree re-render or a synchronous
   * `JSON.stringify` / `storage.setItem` write mid-frame. Pending shots merge
   * and persist automatically at stage boundaries, when leaving gameplay, on
   * tab hide, or on unmount.
   */
  const pendingShotsRef = useRef(0);
  const questWriteTimerRef = useRef<number | undefined>(undefined);

  const [muted, setMutedState] = useState(false);
  const [soundVolume, setSoundVolumeState] = useState<number>(initialSoundVolume);
  const [gameSpeed, setGameSpeed] = useSgaGameSpeed();
  const [bulletSpeed, setBulletSpeed] = useSgaBulletSpeed();
  const [spotCombo, setSpotCombo] = useSgaSpotCombo();
  const [menuTheme, setMenuTheme] = useSgaBgTheme();
  const [orientation, setOrientation] = useSgaOrientation();
  // The shell and the canvas are the *display* rectangle: 420x760 portrait, or
  // 760x420 when the world is laid on its side. The engine sizes its own backing
  // store from the same numbers.
  const frame = displaySize(orientation);
  const [settingsOpen, setSettingsOpen] = useState(false);
  // Kebijakan privasi: halaman in-app yang teksnya sama dengan docs/PRIVACY.md.
  const [privacyOpen, setPrivacyOpen] = useState(false);
  // CARA MAIN: tampil sendiri sekali, lalu bisa dibuka lagi dari Pengaturan.
  const [helpOpen, setHelpOpen] = useState(false);
  const [helpIsFirstRun, setHelpIsFirstRun] = useState(false);
  const [resetDone, setResetDone] = useState(false);
  const resetReloadRef = useRef<number | null>(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [language, changeLanguage] = useLanguage();
  const [settingsClosing, setSettingsClosing] = useState(false);
  const [inGameSettingsOpen, setInGameSettingsOpen] = useState(false);
  const [arsenalOpen, setArsenalOpen] = useState(false);
  const [menuReturnKey, setMenuReturnKey] = useState(0);
  const [questOpen, setQuestOpen] = useState(false);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  // Papan skor lokal: diisi ulang setiap kali halaman PERINGKAT dibuka.
  const [leaderboardRivals, setLeaderboardRivals] = useState<Player[]>([]);

  const beginMenuPageTransition = (
    variant: OverlayVariant,
    label: string,
    lead: number,
    onSwap: () => void,
    departure: MenuDeparture = null,
    audio: PhaseAudio = {},
  ): MenuTransitionTiming | null => {
    const base = PAGE_OVERLAYS[variant];
    if (!base || menuPageTransitionBusyRef.current) return null;
    menuPageTransitionBusyRef.current = true;
    menuPageTransitionTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    menuPageTransitionTimersRef.current = [];

    const rate = variant === 'fade' ? 1 : OVERLAY_RATE;
    const cover = Math.round(base.cover / rate);
    const hold = Math.round(base.hold / rate);
    const reveal = Math.round(base.reveal / rate);
    const swapAt = lead + cover + hold;
    const transition = { variant, label, rate };
    const timing: MenuTransitionTiming = { lead, cover, hold, reveal, swapAt, finishAt: swapAt + reveal, rate };
    const schedule = (delay: number, callback: () => void) => {
      menuPageTransitionTimersRef.current.push(window.setTimeout(callback, delay));
    };

    setMenuPageTransition(null);
    setMenuDeparture(departure);
    schedule(lead, () => {
      setMenuPageTransition({ ...transition, phase: 'cover' });
      // The cover animation starts with this commit — its sound starts here too.
      if (audio.cover) afterPaint(() => audio.cover?.(timing));
    });
    schedule(swapAt, () => {
      onSwap();
      setMenuDeparture(null);
      setMenuPageTransition({ ...transition, phase: 'reveal' });
      // Same for the reveal + the incoming page's own entrance.
      if (audio.swap) afterPaint(() => audio.swap?.(timing));
    });
    schedule(swapAt + reveal, () => {
      setMenuPageTransition(null);
      setMenuDeparture(null);
      menuPageTransitionBusyRef.current = false;
      menuPageTransitionTimersRef.current = [];
    });

    return timing;
  };

  const menuPageLead = () => Math.max(300, 380 * menuPlanRef.current.k);
  const freshMenuPlan = () => getSharedMenuPlan() ?? resolvePlan(animStore.get(), menuPlanRef.current);

  const startArsenalTransition = (opening: boolean) => {
    const nextPlan = opening ? null : freshMenuPlan();
    const timing = beginMenuPageTransition(
      'shutter',
      'ARMORY',
      opening ? menuPageLead() : SHOP_OUT.total,
      () => {
        if (opening) setArsenalOpen(true);
        else {
          setArsenalOpen(false);
          if (nextPlan) setMenuPlan(nextPlan);
          setMenuReturnKey((key) => key + 1);
        }
      },
      opening ? 'gun' : null,
      {
        cover: (t) => studioSfx.shutterClose(0, (t.cover * 0.8) / 1000, t.rate),
        swap: (t) => {
          studioSfx.shutterOpen(0, t.rate);
          if (opening) studioSfx.shopEnter(0, SHOP_IN);
          else if (nextPlan) studioSfx.menuEnter(0, nextPlan);
        },
      },
    );
    if (!timing) return;

    if (opening) studioSfx.menuExit('gun', 0, { ...menuPlanRef.current, k: menuPlanRef.current.k * 0.6 });
    else studioSfx.shopExit(0);
  };

  // Boss Defeated celebration modal state (Screenshot 2)
  const [bossDefeatedData, setBossDefeatedData] = useState<{
    name: string;
    bossHead: BossHead;
    level: number;
    coins: number;
    playerLevel: number;
    xpBefore: number;
    xpProgress: number;
    xpGained: number;
    leveledUp: boolean;
  } | null>(null);
  const [bonusStageOpen, setBonusStageOpen] = useState(false);
  const [bonusAfterBoss, setBonusAfterBoss] = useState<{ stage: number; bossName: string }>({ stage: 5, bossName: 'BOSS' });
  const [starBuffOpen, setStarBuffOpen] = useState(false);
  const [starBuffTreasure, setStarBuffTreasure] = useState(false);

  const [weapon, setWeaponState] = useState<WeaponId>(initialWeapon);

  useEffect(() => {
    const progress = getPlayerProgress(num(LS.playerXp));
    storage.setItem(LS.playerXp, String(Math.max(0, num(LS.playerXp))));
    storage.setItem(LS.playerLevel, String(progress.level));
  }, []);

  // ---------- cheat key: C = semua gembok otomatis terbuka ----------
  const [cheatToast, setCheatToast] = useState<string | null>(null);
  const [cheatNonce, setCheatNonce] = useState(0);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key.toLowerCase() !== 'c') return;
      const normal = WEAPONS.filter((w) => w.rarity !== 'LANGKA').map((w) => w.id);
      const rare = WEAPONS.filter((w) => w.rarity === 'LANGKA').map((w) => w.id);
      storage.setItem(LS.owned, JSON.stringify(normal));
      storage.setItem(LS.rareOwned, JSON.stringify(rare));
      storage.setItem(LS.bestLevel, String(GUN_HIT_MAP_MAX_LEVEL));
      setBestLevel(GUN_HIT_MAP_MAX_LEVEL);
      saveQuests({
        ...questStateRef.current,
        claimed: QUESTS.map((q) => q.id),
        milestonesClaimed: MILESTONES.map((m) => m.count),
      });
      setCheatNonce((n) => n + 1);
      sfx.unlock();
      setCheatToast(tr(language, '🔓 SEMUA GEMBOK TERBUKA!'));
      window.setTimeout(() => setCheatToast(null), 2400);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const mergePendingShots = (qs: QuestState): QuestState => {
    const pending = pendingShotsRef.current;
    if (pending <= 0) return qs;
    pendingShotsRef.current = 0;
    return { ...qs, shotsFired: qs.shotsFired + pending };
  };

  // Sync quests to LS without forcing mid-gameplay React re-renders
  const saveQuests = (qs: QuestState, syncReact = screenRef.current !== 'playing') => {
    const merged = mergePendingShots(qs);
    questStateRef.current = merged;
    if (syncReact) {
      if (questWriteTimerRef.current !== undefined) {
        window.clearTimeout(questWriteTimerRef.current);
        questWriteTimerRef.current = undefined;
      }
      setQuestState(merged);
      storage.setItem(LS.quests, JSON.stringify(merged));
      return;
    }
    if (questWriteTimerRef.current === undefined) {
      questWriteTimerRef.current = window.setTimeout(() => {
        questWriteTimerRef.current = undefined;
        storage.setItem(LS.quests, JSON.stringify(questStateRef.current));
      }, 120);
    }
  };

  const depositCoins = (amount: number, syncReact = screenRef.current !== 'playing') => {
    const total = coinsInBank() + amount;
    storage.setItem(LS.coins, String(total));
    if (syncReact) setTotalCoins(total);
    return total;
  };

  const chooseWeapon = (id: WeaponId) => {
    if (getWeapon(id).id !== id || !isWeaponUnlocked(getWeapon(id), ownedWeaponIds())) return;
    const changed = id !== weapon;
    setWeaponState(id);
    storage.setItem(LS.weapon, id);
    gameRef.current?.setWeapon(id);
    if (changed) {
      const current = questStateRef.current;
      saveQuests({ ...current, weaponEquips: current.weaponEquips + 1 });
    }
    sfx.unlock();
  };

  const celebrateNewWeapon = (weaponId: WeaponId) => {
    setWeaponCelebration({ weaponId, id: Date.now() + Math.random() });
  };

  const buyRareWeapon = (id: WeaponId) => {
    const item = getWeapon(id);
    if (item.rarity !== 'LANGKA') return false;
    const owned = ownedWeaponIds();
    if (owned.includes(id)) { chooseWeapon(id); return true; }
    const balance = diamondsInBank();
    if (balance < 500) return false;
    const next = balance - 500;
    storage.setItem(LS.diamonds, String(next));
    let bought: string[] = [];
    try {
      const stored = JSON.parse(storage.getItem(LS.rareOwned) || '[]');
      if (Array.isArray(stored)) bought = stored.filter((weaponId): weaponId is string => typeof weaponId === 'string');
    } catch { /* start a fresh bought-rare list */ }
    storage.setItem(LS.rareOwned, JSON.stringify([...new Set([...bought, id])]));
    setDiamonds(next);
    chooseWeapon(id);
    celebrateNewWeapon(id);
    sfx.unlock();
    return true;
  };

  // Space in the open Arsenal bulk-buys any LANGKA weapons the current balance can cover.
  // Every rare weapon still costs 500 diamonds; insufficient balance leaves the rest locked.
  const unlockAllAffordableWeapons = (): WeaponId[] => {
    const owned = ownedWeaponIds();
    const locked = WEAPONS.filter(w => w.rarity === 'LANGKA' && !owned.includes(w.id));
    const balance = diamondsInBank();
    const count = Math.min(locked.length, Math.floor(balance / 500));
    const purchases = locked.slice(0, count).map(w => w.id);
    if (!purchases.length) return [];

    const newBalance = balance - purchases.length * 500;
    const newOwned = [...new Set([...owned.filter(id => getWeapon(id).rarity === 'LANGKA'), ...purchases])];
    storage.setItem(LS.rareOwned, JSON.stringify(newOwned));
    storage.setItem(LS.diamonds, String(newBalance));
    setDiamonds(newBalance);
    sfx.unlock();
    return purchases;
  };

  const handleClaimQuest = (q: Quest) => {
    const current = questStateRef.current;
    if (!QUESTS.some(item => item.id === q.id) || current.claimed.includes(q.id)) return;
    if (Math.min(q.progress(current, ownedWeaponIds().length), q.target) < q.target) return;
    depositCoins(q.rewardCoins);
    if (q.rewardWeapon) {
      const rewardId = q.rewardWeapon as WeaponId;
      const rewardWeapon = getWeapon(rewardId);
      if (rewardWeapon.rarity !== 'LANGKA') {
        const owned = ownedWeaponIds();
        if (!owned.includes(rewardId)) {
          try {
            const stored: string[] = JSON.parse(storage.getItem(LS.owned) || '[]');
            storage.setItem(LS.owned, JSON.stringify([...new Set([...stored, rewardId])]));
          } catch { storage.setItem(LS.owned, JSON.stringify([rewardId])); }
          celebrateNewWeapon(rewardId);
        }
        chooseWeapon(rewardId);
      }
    }
    const latest = questStateRef.current;
    saveQuests({
      ...latest,
      claimed: [...latest.claimed, q.id],
      totalCoinsCollected: latest.totalCoinsCollected + q.rewardCoins,
    });
  };

  // Peti milestone di halaman reward: buka kadonya dulu, hadiah masuk setelah
  // kado benar-benar terbuka dan pemain menekan tombol ambil.
  const handleClaimMilestone = (count: number) => {
    const current = questStateRef.current;
    const milestone = MILESTONES.find(item => item.count === count);
    const owned = ownedWeaponIds();
    const completed = QUESTS.filter(q => Math.min(q.progress(current, owned.length), q.target) >= q.target).length;
    if (!milestone || completed < count || current.milestonesClaimed.includes(count)) return;

    const available = WEAPONS.filter(w => w.rarity === milestone.rarity && !owned.includes(w.id));
    const reward = available.length ? available[Math.floor(Math.random() * available.length)] : null;
    sfx4.match();
    setMilestoneGift({ count, weaponId: reward ? reward.id : null, coins: reward ? 0 : 1000 });
  };

  const takeMilestoneGift = (equip: boolean) => {
    const gift = milestoneGift;
    if (!gift) return;
    const current = questStateRef.current;
    const owned = ownedWeaponIds();
    const completed = QUESTS.filter(q => Math.min(q.progress(current, owned.length), q.target) >= q.target).length;
    if (completed < gift.count || current.milestonesClaimed.includes(gift.count)) {
      setMilestoneGift(null);
      return;
    }
    const nextState = { ...current, milestonesClaimed: [...current.milestonesClaimed, gift.count] };
    if (gift.weaponId) {
      saveQuests(nextState);
      try {
        const stored: string[] = JSON.parse(storage.getItem(LS.owned) || '[]');
        storage.setItem(LS.owned, JSON.stringify([...new Set([...stored, gift.weaponId])]));
      } catch { storage.setItem(LS.owned, JSON.stringify([gift.weaponId])); }
      celebrateNewWeapon(gift.weaponId);
      if (equip) chooseWeapon(gift.weaponId);
    } else {
      saveQuests(nextState);
      depositCoins(gift.coins);
      saveQuests({ ...nextState, totalCoinsCollected: nextState.totalCoinsCollected + gift.coins });
    }
    setMilestoneGift(null);
  };

  // Create one engine per mounted slide. Quest/coin updates must not destroy a live run.
  useEffect(() => {
    let cancelled = false;
    let g: Game | null = null;
    const boot = async () => {
      const { Game: Engine } = await loadEngine();
      if (cancelled || !canvasRef.current) return;
      g = new Engine(canvasRef.current, {
      onGameOver: (score, level, coins, runCoins) => {
        // Funnel: the run is over, record how far it got and how long it lasted.
        trackRunEnd({ outcome: 'game_over', stage: level, score, coins: runCoins });
        recordRun({ score, stage: level, coins: runCoins });
        const prevBest = num(LS.best);
        const newBest = score > prevBest;
        if (newBest) storage.setItem(LS.best, String(score));
        if (level > num(LS.bestLevel)) storage.setItem(LS.bestLevel, String(level));
        depositCoins(coins, true); // special-stage and boss rewards were banked already
        setBest(num(LS.best));
        setBestLevel(Math.max(1, num(LS.bestLevel)));
        const current = questStateRef.current;
        saveQuests({
          ...current,
          highestScore: Math.max(current.highestScore, score),
          highestLevel: Math.max(current.highestLevel, level),
          totalCoinsCollected: current.totalCoinsCollected + coins,
        }, true);
        setResult({ score, level, coins: runCoins, newBest });
        setDisplayScore(0);
        studioSfx.playExit(0);
        studioSfx.subEnter(0.18);
        setScreen('over');
      },
      onStarHit: (treasure) => {
        setStarBuffTreasure(treasure);
        setStarBuffOpen(true);
      },
      onStageCleared: (level, boss) => {
        trackStageClear({ stage: level, boss });
        const unlocked = Math.max(1, num(LS.bestLevel), level + 1);
        if (unlocked > num(LS.bestLevel)) {
          storage.setItem(LS.bestLevel, String(unlocked));
          setBestLevel(unlocked);
        }
        const current = questStateRef.current;
        saveQuests({
          ...current,
          stagesWon: current.stagesWon + 1,
          highestLevel: Math.max(current.highestLevel, level + 1),
        });
      },
      onShotFired: (count) => {
        pendingShotsRef.current += count;
        // The zip weapons hold their round on the muzzle: this is when it leaves.
        zipMuzzleShotAtRef.current = performance.now();
      },
      onBossDefeated: (bossName, level, coinsEarned, bossHead) => {
        const totalXpBefore = num(LS.playerXp);
        const previous = getPlayerProgress(totalXpBefore);
        const xpGained = bossXpReward(level);
        const totalXp = totalXpBefore + xpGained;
        const nextProgress = getPlayerProgress(totalXp);
        storage.setItem(LS.playerXp, String(totalXp));
        storage.setItem(LS.playerLevel, String(nextProgress.level));
        setBossDefeatedData({
          name: bossName, bossHead, level, coins: coinsEarned,
          playerLevel: nextProgress.level,
          xpBefore: previous.level === nextProgress.level ? previous.xp : 0,
          xpProgress: nextProgress.xp,
          xpGained,
          leveledUp: nextProgress.level > previous.level,
        });
        depositCoins(coinsEarned);
        const current = questStateRef.current;
        saveQuests({
          ...current,
          highestLevel: Math.max(current.highestLevel, level),
          highestPlayerLevel: Math.max(current.highestPlayerLevel, nextProgress.level),
          bossesDefeated: current.bossesDefeated + 1,
          totalCoinsCollected: current.totalCoinsCollected + coinsEarned,
        });
      },
      onDiamondCollected: (amount, large, origin) => {
        const id = Date.now() + Math.random();
        if (large) {
          // The large gem is only credited after the boulder stage is cleared.
          setDiamondToast(null);
          setDiamondHudMode(true);
          setDiamondFlight({ amount, x: origin.x, y: origin.y, id });
        } else {
          const next = diamondsInBank() + amount;
          storage.setItem(LS.diamonds, String(next));
          setDiamonds(next);
          setDiamondToast({ amount, large: false, id });
        }
        sfx3.chime();
      },
      onStageChange: () => {
        setDiamondHudMode(false);
        setDiamondFlight(null);
        setDiamondReveal(null);
        setDiamondToast(null);
      },
      onTreasureCoin: (amount) => {
        depositCoins(amount); // Saved as each bouncing coin reaches the HUD.
        const current = questStateRef.current;
        saveQuests({ ...current, totalCoinsCollected: current.totalCoinsCollected + amount });
      },
      onStageReward: (_mode, level, unbankedCoins, diamondReward) => {
        if (diamondReward > 0) {
          const next = diamondsInBank() + diamondReward;
          storage.setItem(LS.diamonds, String(next));
          setDiamonds(next);
        }
        if (unbankedCoins) depositCoins(unbankedCoins);
        const unlocked = Math.max(1, num(LS.bestLevel), level + 1);
        if (unlocked > num(LS.bestLevel)) {
          storage.setItem(LS.bestLevel, String(unlocked));
          setBestLevel(unlocked);
        }
        const current = questStateRef.current;
        saveQuests({
          ...current,
          highestScore: Math.max(current.highestScore, gameRef.current?.score ?? 0),
          highestLevel: Math.max(current.highestLevel, level),
          totalCoinsCollected: current.totalCoinsCollected + unbankedCoins,
        });
      },
    });
      g.setWeapon(getWeapon(storage.getItem(LS.weapon) || 'pistol').id);
      g.setGameSpeed(getSavedSgaSpeed());
      g.setBackgroundTheme(getSavedSgaBgTheme());
      g.setOrientation(getSavedSgaOrientation());
      gameRef.current = g;
      // The mount effects that ran while the chunk was in flight could not touch
      // the engine; replay their state once it exists.
      g.setActive(activeRef.current);
      g.setWheelArtSource({
        keyFor: wheelArtKeyFor,
        get: (key) => wheelArtCache.current.get(key) ?? null,
        request: requestWheelArt,
        // The markup behind the same raster: the engine rasterises it itself when
        // the runtime refuses to hand back the pixels of an SVG-drawn canvas, so a
        // boss keeps its real silhouette instead of a ring.
        markup: (key) => wheelSvgCache.current.get(key) ?? null,
      });
      // First-use costs (refraction scratch surface, HUD font shaping) are paid
      // here, while the menu is idle, instead of on the frame a run begins.
      const warm = () => { if (!cancelled) g?.prewarm(); };
      const idle = (globalThis as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
      if (typeof idle === 'function') idle(warm, { timeout: 900 });
      else window.setTimeout(warm, 120);
      // A run asked for before the chunk landed starts now.
      for (const start of engineQueue.current.splice(0)) start(g);
    };

    const flushShotsToStorage = () => {
      if (questWriteTimerRef.current !== undefined) {
        window.clearTimeout(questWriteTimerRef.current);
        questWriteTimerRef.current = undefined;
      }
      const merged = mergePendingShots(questStateRef.current);
      questStateRef.current = merged;
      storage.setItem(LS.quests, JSON.stringify(merged));
    };
    const onVisChange = () => {
      if (document.hidden) flushShotsToStorage();
    };
    document.addEventListener('visibilitychange', onVisChange);
    window.addEventListener('pagehide', flushShotsToStorage);
    // See `engineBootRef`: the menu does not need the engine, so it boots after
    // the entrance instead of inside it.
    const startBoot = () => {
      if (engineBootingRef.current) return;
      engineBootingRef.current = true;
      void boot();
    };
    engineBootRef.current = startBoot;
    // The menu's arrival sequence owns the first ~1.7s of this page; the engine
    // boots when that ends (see the `menuReady` effect). This is only the floor
    // in case the menu never reports ready (another slide, a replay, a skip).
    const bootTimer = window.setTimeout(startBoot, 2600);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisChange);
      window.removeEventListener('pagehide', flushShotsToStorage);
      engineQueue.current.length = 0;
      // A later mount re-arms the boot; a pending idle callback is harmless
      // because `cancelled` is checked inside `boot`.
      engineBootRef.current = null;
      engineBootingRef.current = false;
      window.clearTimeout(bootTimer);
      g?.destroy();
      gameRef.current = null;
      flushShotsToStorage();
    };
  }, [requestWheelArt, wheelArtKeyFor]);

  useEffect(() => {
    if (screen !== 'playing' || questOpen) {
      if (questWriteTimerRef.current !== undefined) {
        window.clearTimeout(questWriteTimerRef.current);
        questWriteTimerRef.current = undefined;
      }
      const merged = mergePendingShots(questStateRef.current);
      questStateRef.current = merged;
      storage.setItem(LS.quests, JSON.stringify(merged));
      setQuestState(merged);
      setTotalCoins(coinsInBank());
    }
  }, [screen, questOpen]);

  useEffect(() => {
    gameRef.current?.setGameSpeed(gameSpeed);
  }, [gameSpeed]);

  // Bullet speed (1x–3x) applies to every weapon of every slide.
  useEffect(() => {
    gameRef.current?.setBulletSpeed(bulletSpeed);
  }, [bulletSpeed, screen]);

  // COMBO TITIK scoring mode (SETTING) — same-spot ladder into bonus coins.
  useEffect(() => {
    gameRef.current?.setSpotCombo(spotCombo);
  }, [spotCombo, screen]);

  useEffect(() => {
    gameRef.current?.setBackgroundTheme(menuTheme);
  }, [menuTheme]);

  useEffect(() => {
    gameRef.current?.setOrientation(orientation);
  }, [orientation]);

  useEffect(() => {
    const onSansIntroComplete = (event: Event) => {
      if (screenRef.current !== 'menu') return;
      const replay = Boolean((event as CustomEvent<{ replay?: boolean }>).detail?.replay);
      const nextPlan = getSharedMenuPlan() ?? resolvePlan(animStore.get(), menuPlanRef.current);
      if (replay) {
        setMenuPlan(nextPlan);
        menuEntranceAudioRef.current = nextPlan;
        setMenuReturnKey((key) => key + 1);
      } else if (studioSfx.ctx?.state === 'running') {
        // The menu is already on screen and already animating: its sound is due now.
        afterPaint(() => studioSfx.menuEnter(0, nextPlan));
      }
    };
    window.addEventListener('sans-intro-complete', onSansIntroComplete);
    return () => window.removeEventListener('sans-intro-complete', onSansIntroComplete);
  }, []);

  /**
   * Play a replayed menu's entrance on the frame its remount is painted.
   *
   * `menuReturnKey` is the remount key of the menu subtree, so the layout effect
   * runs once the new DOM exists and the CSS entrance is about to start; the
   * `afterPaint` frame is the same frame that shows the first animation step.
   */
  useLayoutEffect(() => {
    const plan = menuEntranceAudioRef.current;
    if (!plan) return;
    menuEntranceAudioRef.current = null;
    if (studioSfx.ctx?.state !== 'running') return;
    let current = true;
    afterPaint(() => { if (current) studioSfx.menuEnter(0, plan); });
    return () => { current = false; };
  }, [menuReturnKey]);

  // The arrival sequence is over: the page is quiet, which is when the engine
  // chunk and its constructor cost the player nothing (the menu paints its own
  // room, so nothing on this screen needs it).
  useEffect(() => {
    if (!menuReady) return;
    engineBootRef.current?.();
  }, [menuReady]);

  // Match Perfect Shot's input lock during the 1.7s menu arrival sequence.
  useEffect(() => {
    if (screen !== 'menu' || mapOpen || questOpen || leaderboardOpen || arsenalOpen || !introReady) {
      setMenuReady(false);
      return;
    }
    setMenuReady(false);
    const readyTimer = window.setTimeout(() => setMenuReady(true), 1700 * menuPlan.k);
    return () => window.clearTimeout(readyTimer);
  }, [screen, menuReturnKey, mapOpen, questOpen, leaderboardOpen, arsenalOpen, introReady, menuPlan.k, menuPlan.gun]);

  useEffect(() => {
    if (!diamondToast) return;
    const timer = window.setTimeout(() => setDiamondToast(null), Math.round(1800 / gameSpeed));
    return () => window.clearTimeout(timer);
  }, [diamondToast?.id, gameSpeed]);

  useEffect(() => {
    if (!diamondFlight) return;
    const node = diamondFlightRef.current;
    if (!node) return;
    const startX = Math.max(28, Math.min(392, diamondFlight.x));
    const startY = Math.max(76, Math.min(690, diamondFlight.y));
    const flight = node.animate([
      { left: `${startX}px`, top: `${startY}px`, transform: 'translate(-50%, -50%) scale(1.25) rotate(0deg)', opacity: 1 },
      { left: '392px', top: '34px', transform: 'translate(-50%, -50%) scale(.18) rotate(540deg)', opacity: .25, offset: .82 },
      { left: '392px', top: '34px', transform: 'translate(-50%, -50%) scale(.12) rotate(720deg)', opacity: 0 },
    ], { duration: Math.round(900 / gameSpeed), easing: 'cubic-bezier(.2,.7,.18,1)', fill: 'forwards' });
    flight.onfinish = () => {
      setDiamondFlight((current) => current?.id === diamondFlight.id ? null : current);
      setDiamondReveal({ id: diamondFlight.id, amount: diamondFlight.amount });
    };
    return () => flight.cancel();
  }, [diamondFlight?.id, gameSpeed]);

  useEffect(() => {
    if (diamondReveal === null) return;
    const timer = window.setTimeout(() => setDiamondReveal(null), Math.round(2100 / gameSpeed));
    return () => window.clearTimeout(timer);
  }, [diamondReveal?.id, gameSpeed]);

  useEffect(() => {
    if (!weaponCelebration) return;
    const timer = window.setTimeout(() => setWeaponCelebration(null), Math.round(2200 / gameSpeed));
    return () => window.clearTimeout(timer);
  }, [weaponCelebration?.id, gameSpeed]);

  useEffect(() => {
    setMasterVolume(soundVolume);
    juicyAudio.volume = 0.7 * soundVolume;
  }, [soundVolume]);

  // Escape opens/closes in-game settings pause menu while playing.
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (screenRef.current !== 'playing') return;
      if (starBuffOpen || bonusStageOpen || Boolean(bossDefeatedData)) return;
      e.preventDefault();
      setInGameSettingsOpen((open) => !open);
    };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [starBuffOpen, bonusStageOpen, bossDefeatedData]);

  /**
   * Which gun's live zip SVG owns the menu showcase. Read through the same
   * chooser the engine uses, every time the gun or the picked skin changes —
   * the zip art is one card of five designs now, not the artwork of all of them.
   */
  useEffect(() => {
    const mod = gunArt;
    if (!mod || !hasZipArt(weapon)) { setZipCardWeapon(null); return; }
    setZipCardWeapon(mod.getGunVariant(weapon) === 'zip' ? weapon : null);
  }, [gunArt, weapon, gunLookTick]);

  // The menu, results and modal screens use their own lightweight effects;
  // the heavy level canvas has nothing to simulate behind those overlays.
  const gameplayModalOpen = inGameSettingsOpen || arsenalOpen || questOpen || leaderboardOpen || starBuffOpen || bonusStageOpen || Boolean(bossDefeatedData);
  const simulate = active && screen === 'playing' && !gameplayModalOpen;
  activeRef.current = simulate;
  useEffect(() => {
    if (screen !== 'playing' && inGameSettingsOpen) setInGameSettingsOpen(false);
    if (screen === 'menu') gameRef.current?.toIdle();
    gameRef.current?.setActive(simulate);
  }, [simulate, screen, inGameSettingsOpen]);

  // The boss celebration keeps the live stage behind it and prints its own stage
  // and reward rows on the edges: the corner HUD would sit right on top of them.
  useEffect(() => {
    gameRef.current?.setHudHidden(Boolean(bossDefeatedData));
  }, [bossDefeatedData, screen]);

  /**
   * Show the cached frame straight away, then let the live artwork take over.
   *
   * The showcase used to be an empty box until the gun artwork chunk landed. The
   * previous paint is drawn here the moment the menu mounts, so the hero weapon
   * is never missing; `menuGunArtReady` keeps a slow image decode from painting
   * over the real thing once it is there.
   */
  useEffect(() => {
    if (gunArt) return;
    // While the zip art is the live card it is live SVG, never a kept bitmap.
    if (zipCardWeapon === weapon) return;
    if (screen !== 'menu' || arsenalOpen || questOpen || leaderboardOpen || mapOpen || settingsOpen) return;
    const cv = previewCanvasRef.current;
    const cached = readMenuGunBitmap();
    if (!cv || !cached || cached.id !== weapon) return;
    // Size the canvas exactly like the live paint does, so the shortcut frame
    // lands in the same box instead of being stretched from the 300x150 default.
    const dpr = getOptimalCanvasDpr(2);
    cv.width = Math.round(MENU_GUN_CANVAS_W * dpr);
    cv.height = Math.round(MENU_GUN_CANVAS_H * dpr);
    const img = new Image();
    img.onload = () => {
      if (menuGunArtReady.current) return;
      const ctx = getFast2DContext(cv);
      if (!ctx) return;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, cv.width, cv.height);
      ctx.drawImage(img, 0, 0, cv.width, cv.height);
    };
    img.src = cached.png;
  }, [gunArt, screen, weapon, zipCardWeapon, arsenalOpen, questOpen, leaderboardOpen, mapOpen, settingsOpen]);

  // Upright weapon preview on the main menu (-10% from 374x328 -> 337x295, native VSync FPS)
  useEffect(() => {
    if (!gunArt) return;
    if (screen !== 'menu' || arsenalOpen || questOpen || leaderboardOpen || mapOpen || settingsOpen) return;
    const cv = previewCanvasRef.current;
    if (cv && zipCardWeapon === weapon) {
      // The weapon is drawn by `ZipWeaponArt` (live SVG) in this box; keep the
      // canvas empty so the two never stack.
      cv.width = Math.round(MENU_GUN_CANVAS_W * getOptimalCanvasDpr(2));
      cv.height = Math.round(MENU_GUN_CANVAS_H * getOptimalCanvasDpr(2));
      return;
    }
    if (!cv) {
      // A menu re-entrance can mount the canvas a frame after this effect runs.
      // Skipping the paint here used to leave the showcase blank until some
      // other dependency changed, which is what made the weapon look "late".
      const retry = window.setTimeout(() => setGunPaintTick((n) => n + 1), 16);
      return () => window.clearTimeout(retry);
    }
    const dpr = getOptimalCanvasDpr(2);
    const pw = MENU_GUN_CANVAS_W;
    const ph = MENU_GUN_CANVAS_H;
    cv.width = Math.round(pw * dpr);
    cv.height = Math.round(ph * dpr);
    const ctx = getFast2DContext(cv);
    if (!ctx) return;

    const curW = getWeapon(weapon);
    const { drawGunCentered, getGunMetrics, gunState } = gunArt;

    const drawStill = () => {
      // Keep SGA's exact weapon art still in the showcase. The menu's shared
      // entrance and float motion animate the canvas; synthetic firing flashes
      // are reserved for the gameplay/Arsenal previews, not the title screen.
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, pw, ph);

      // The entrance moves the canvas into place; keep its base centered and
      // still afterwards while the weapon's own light/preview details animate.
      ctx.save();
      ctx.translate(pw / 2, ph / 2);

      // Weapon shadow (scaled proportionally with the weapon)
      ctx.beginPath();
      ctx.ellipse(0, 92, 59, 16, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,0,0,0.44)';
      ctx.fill();

      // Scaled -10% from 374x328 while preserving true weapon proportions.
      const m = getGunMetrics(curW.id);
      const span = Math.max(m.span, 130);
      const sc = (ph * 0.78) / span;
      ctx.scale(sc, sc);

      // Render from a clean rested pose, not a stale live-game recoil/glow state.
      // Restore every shared field so this one-frame menu paint cannot perturb gameplay.
      const previousGunState = { ...gunState };
      try {
        Object.assign(gunState, {
          sinceShot: 9, reloadT: 0, charge: 0, spin: 0, spinAngle: 0, shots: 0,
          bigShot: 0, fireworkTube: 0, rocketHue: 340, rocketFlash: 0,
          yoyoHue: 0, yoyoFlash: 0, yoyoSpin: 0, diamondFlash: 0, diamondSeed: 0,
          bazookaHue: 45, bazookaSeed: 1.7, bazookaFlash: 0, bazookaBite: 0.6,
          jaw: 0, glow: 0, servo: 0, heat: 0, tint: '244,63,94',
          inPreview: false, ammoRatio: 1, s7Anim: null, s9State: null, s9Live: false,
          sixState: null, sixLive: false, elevenState: null, elevenLive: false,
          elevenStage: false, nineStage: false, twoState: null, twoLive: false,
          ghostSide: 1, saberSide: 1,
        });
        // drawGunCentered puts the geometric mass center EXACTLY at (0, 0)!
        drawGunCentered(ctx, curW.id, 0, 0, true, undefined, false);
      } finally {
        Object.assign(gunState, previousGunState);
      }
      ctx.restore();
    };

    drawStill();
    // Center the aura on the visible weapon ink, not just on the large preview canvas.
    // This also compensates for weapon-specific renderer offsets in the screenshot the user flagged.
    //
    // Readback and scan are the expensive half of this paint, so both are paid
    // once per weapon and art (every second pixel is plenty — the pivot lands
    // within half a CSS pixel of the exact one) and remembered for the visit.
    const paintKey = `${weapon}|${gunArt.getGunVariant?.(weapon) ?? ''}|${cv.width}x${cv.height}`;
    latestMenuGunPaint = paintKey;
    let pivot = menuGunPivot.get(paintKey);
    if (!pivot) {
      try {
        const pixels = ctx.getImageData(0, 0, cv.width, cv.height).data;
        let weight = 0;
        let pivotX = 0;
        let pivotY = 0;
        for (let y = 0; y < cv.height; y += 2) {
          for (let x = 0; x < cv.width; x += 2) {
            const alpha = pixels[(y * cv.width + x) * 4 + 3];
            if (alpha < 160) continue; // ignore the soft ground shadow and the glow fringe
            weight += alpha;
            pivotX += (x + 0.5) * alpha;
            pivotY += (y + 0.5) * alpha;
          }
        }
        if (weight > 0) pivot = { x: pivotX / weight / dpr, y: pivotY / weight / dpr };
      } catch {
        // Some low-end canvas contexts disable readback; fall back to the shared frame center.
      }
      if (pivot) menuGunPivot.set(paintKey, pivot);
    }
    if (pivot && weaponPivotRef.current) {
      const cssScaleX = (cv.offsetWidth || pw) / pw;
      const cssScaleY = (cv.offsetHeight || ph) / ph;
      const offsetX = `${(pivot.x - pw / 2) * cssScaleX}px`;
      const offsetY = `${(pivot.y - ph / 2) * cssScaleY}px`;
      weaponPivotRef.current.style.setProperty('--weapon-pivot-x', offsetX);
      weaponPivotRef.current.style.setProperty('--weapon-pivot-y', offsetY);
    }
    // Keep this frame for the next cold start, out of this frame's way.
    keepMenuGunFrameLater(cv, weapon, paintKey);
  }, [gunArt, gunPaintTick, screen, weapon, zipCardWeapon, gunLookTick, arsenalOpen, questOpen, leaderboardOpen, mapOpen, settingsOpen]);

  // Roll up score only while the slide is active; pause at the current number.
  useEffect(() => {
    if (screen !== 'over' || !active || displayScore >= result.score) return;
    const from = displayScore;
    const target = result.score;
    const start = performance.now();
    const timer = setInterval(() => {
      const p = Math.min(1, ((performance.now() - start) * getSavedSgaSpeed()) / 800);
      setDisplayScore(Math.round(from + (target - from) * Math.pow(p, 0.7)));
      if (p >= 1) clearInterval(timer);
    }, 25);
    return () => clearInterval(timer);
    // Restart this timer only when focus or a new result changes, not per tick.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, result.score, active]);

  // Pause the Ready / Go transition with the game, instead of starting a
  // level unseen if another slide was selected during its countdown.
  useEffect(() => {
    if (!active || transitionStep === 0) return;
    const timer = setTimeout(() => {
      if (transitionStep === 1) {
        setTransText('GO!! 🎯');
        sfx4.match();
        setTransitionStep(2);
      } else {
        setTransitioning(false);
        whenEngine((engine) => engine.startAtLevel(startingLevelRef.current));
        setScreen('playing');
        setTransitionStep(0);
      }
    }, Math.round((transitionStep === 1 ? 380 : 320) / gameSpeed));
    return () => clearTimeout(timer);
  }, [transitionStep, active, gameSpeed]);

  const captureMenuWeaponFlight = (): boolean => {
    const source = previewCanvasRef.current;
    const shell = gameShellRef.current;
    if (!gunArt || !source || !shell || !shell.clientWidth || !shell.clientHeight) return false;
    try {
      const shellRect = shell.getBoundingClientRect();
      const sourceRect = source.getBoundingClientRect();
      // Crop the actual weapon ink (not the large transparent menu canvas), then
      // scale that same artwork to the live game's renderer scale for a seamless handoff.
      let cropX = 0;
      let cropY = 0;
      let cropW = source.width;
      let cropH = source.height;
      let massX = source.width / 2;
      let massY = source.height / 2;
      let massWeight = 0;
      const sourceContext = source.getContext('2d');
      if (sourceContext && source.width && source.height) {
        const { data } = sourceContext.getImageData(0, 0, source.width, source.height);
        let left = source.width;
        let top = source.height;
        let right = -1;
        let bottom = -1;
        let weightedX = 0;
        let weightedY = 0;
        for (let y = 0; y < source.height; y++) {
          for (let x = 0; x < source.width; x++) {
            const alpha = data[(y * source.width + x) * 4 + 3];
            if (alpha <= 160) continue; // exclude the soft ground shadow and glow fringe
            if (x < left) left = x;
            if (x > right) right = x;
            if (y < top) top = y;
            if (y > bottom) bottom = y;
            massWeight += alpha;
            weightedX += (x + 0.5) * alpha;
            weightedY += (y + 0.5) * alpha;
          }
        }
        if (right >= left && bottom >= top) {
          const pad = Math.max(4, Math.round(Math.min(source.width, source.height) * 0.012));
          cropX = Math.max(0, left - pad);
          cropY = Math.max(0, top - pad);
          cropW = Math.min(source.width, right + pad + 1) - cropX;
          cropH = Math.min(source.height, bottom + pad + 1) - cropY;
          massX = weightedX / massWeight;
          massY = weightedY / massWeight;
        }
      }
      const cropCanvas = document.createElement('canvas');
      cropCanvas.width = cropW;
      cropCanvas.height = cropH;
      const cropContext = cropCanvas.getContext('2d');
      if (!cropContext) return false;
      cropContext.drawImage(source, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
      const image = cropCanvas.toDataURL('image/png');
      const dpr = source.width / 337;
      const sourceScaleX = source.width / sourceRect.width;
      const sourceScaleY = source.height / sourceRect.height;
      const metric = gunArt.getGunMetrics(weapon);
      const previewScale = (295 * 0.78) / Math.max(metric.span, 130);
      const gameScaleX = shell.clientWidth / 420;
      const gameScaleY = shell.clientHeight / 760;
      const toW = (cropW / dpr / previewScale) * GAMEPLAY_GUN_SCALE * gameScaleX;
      const toH = (cropH / dpr / previewScale) * GAMEPLAY_GUN_SCALE * gameScaleY;
      // `drawGun` uses muzzle-space coordinates; use the weapon's measured mass
      // center so the final frame lands exactly over the live canvas artwork.
      const gameCenterX = (210 + metric.centerOffsetX * GAMEPLAY_GUN_SCALE) * gameScaleX;
      const gameCenterY = (GUN_Y + metric.centerOffsetY * GAMEPLAY_GUN_SCALE) * gameScaleY;
      const flightMassX = ((massX - cropX) / dpr / previewScale) * GAMEPLAY_GUN_SCALE * gameScaleX;
      const flightMassY = ((massY - cropY) / dpr / previewScale) * GAMEPLAY_GUN_SCALE * gameScaleY;
      setWeaponFlight({
        id: Date.now(),
        image,
        from: {
          x: sourceRect.left - shellRect.left + cropX / sourceScaleX,
          y: sourceRect.top - shellRect.top + cropY / sourceScaleY,
          w: cropW / sourceScaleX,
          h: cropH / sourceScaleY,
        },
        to: { x: gameCenterX - flightMassX, y: gameCenterY - flightMassY, w: toW, h: toH },
      });
      return true;
    } catch {
      // If canvas capture is restricted, the gameplay gun uses its normal rise-in instead.
      return false;
    }
  };

  const beginStage = (level: number, specialMode?: 'boulder' | 'bonus' | 'treasure', fromSettings = false) => {
    if (playTransitionBusyRef.current || (mapOpen && mapLeaving)) return;
    playTransitionBusyRef.current = true;
    // The wheel is an SVG raster: request it now so the decode happens during
    // the cover/hold beats that follow this tap, not on the frame the wheel is
    // meant to drop in. Without it a boss head arrives a few frames late.
    requestWheelArt(level);
    const fromMap = mapOpen;
    const fromMenu = screenRef.current === 'menu' && !fromMap && !settingsOpen && !fromSettings;
    // Landscape keeps the menu weapon exactly where the gameplay gun lands, so
    // the hand-off there is a straight swap: a flight would have to rotate the
    // upright menu frame onto the lying gun and land it on a second spot.
    const wantsWeaponFlight = fromMenu && orientation !== 'landscape' && captureMenuWeaponFlight();
    if (fromMenu) {
      setPlayMenuExiting(true);
      setMenuDeparture('play');
    }
    const stageConfig = makeLevel(level, specialMode);
    // Funnel: a stage is about to start (this also opens a new run if none is live).
    trackStageStart({ stage: level, mode: stageConfig.mode, weapon, boss: stageConfig.boss });
    const lead = fromMenu || fromSettings ? PLAY_SCOPE.menuLead : fromMap ? PLAY_SCOPE.questLead : PLAY_SCOPE.otherLead;
    const mountAt = lead + PLAY_SCOPE.cover;
    // The rival wheel plays Perfect Shot's own drop -> squash -> pop entrance, but
    // it starts the moment the lens opens (never behind the closed cover), so the
    // hold only covers the shared ready beat.
    const hold = PLAY_SCOPE.hold;
    const wheelEntryDelay = hold / 1000;
    // Keep the filled WAAPI flight visible through reveal, matching Perfect Shot;
    // it is cleared alongside the scope after the in-game gun is fully exposed.
    const revealAt = mountAt + hold;
    const finishAt = revealAt + PLAY_SCOPE.reveal;
    const gunEntryDelay = fromMap || fromSettings ? hold / 1000 : 0;
    // Aim the scope lens exactly at the stage target: same centre as the wheel
    // and a radius that frames it (106 normal / 122 boss / 166 boulder).
    // Landscape lays the world on its side, so the wheel's display position is
    // (H - y, CX) rather than (CX, y): the lens has to close on the wheel the
    // player is about to shoot, not on the empty spot the portrait centre maps to.
    const wheelWorldY = initialGameplayWheelCenterY(stageConfig.boss, Boolean(specialMode));
    const origin = orientation === 'landscape'
      ? { x: ((LAND_W - wheelWorldY) / LAND_W) * 100, y: (WORLD_CX / LAND_H) * 100 }
      : { x: 50, y: (wheelWorldY / H) * 100 };
    // The overlay lives inside the shell the whole stage is scaled with, so the
    // lens can stay in the engine's own stage units.
    const lens = stageConfig.radius + 14;
    const label = `STAGE ${level} · ${stageConfig.name.toUpperCase()}`;

    if (fromMap) {
      setMapLeaving(true);
      studioSfx.questExit(0);
    } else if (fromMenu) {
      studioSfx.menuExit('play', 0, { ...menuPlanRef.current, k: menuPlanRef.current.k * 0.6 });
    } else if (screenRef.current === 'over') {
      studioSfx.playExit(0);
    }

    // The scope closes, the stage mounts and the lens opens on their own beats —
    // their sounds are fired from those beats, not from a clock started at the tap,
    // so a slow mount on a phone can no longer leave the audio ahead of the picture.
    const playEnterAudio = () => studioSfx.playEnter(0, PLAY_IN, stageConfig.boss, stageConfig.ammo, {
      gun: !fromMenu,
      offset: hold,
    });

    deferPageClose(lead, () => {
      setPlayTransition({ phase: 'cover', label, origin, lens });
      afterPaint(() => studioSfx.scopeAim(0));
    });
    deferPageClose(mountAt, () => {
      startingLevelRef.current = level;
      setMapOpen(false);
      setMapLeaving(false);
      setSettingsOpen(false);
      setInGameSettingsOpen(false);
      setPlayMenuExiting(false);
      setMenuDeparture(null);
      setTransitioning(false);
      setTransitionStep(0);
      // The flying menu frame is the only weapon until it lands: the live gun
      // stays hidden for the flight's own duration, then appears in place.
      const gunHiddenFor = wantsWeaponFlight ? WEAPON_FLIGHT_MS / 1000 : 0;
      whenEngine((engine) => {
        if (specialMode) engine.startSpecialStage(specialMode, gunEntryDelay, true, wheelEntryDelay, gunHiddenFor, wantsWeaponFlight);
        else engine.startAtLevel(level, wantsWeaponFlight, gunEntryDelay, true, wheelEntryDelay, gunHiddenFor);
      });
      setScreen('playing');
      afterPaint(playEnterAudio);
    });
    // The instant the captured frame lands, the live canvas gun takes over, so
    // the hand-off never leaves a bitmap copy resting on top of it.
    if (wantsWeaponFlight) {
      deferPageClose(mountAt + WEAPON_FLIGHT_MS + 24, () => setWeaponFlight(null));
    }
    deferPageClose(revealAt, () => {
      setPlayTransition((current) => current ? { ...current, phase: 'reveal' } : current);
      afterPaint(() => studioSfx.scopeOpen(0));
    });
    deferPageClose(finishAt, () => {
      setPlayTransition(null);
      setWeaponFlight(null);
      playTransitionBusyRef.current = false;
      pageExitTimersRef.current = [];
    });
  };

  const play = () => beginStage(1);

  const deferPageClose = (duration: number, close: () => void) => {
    const timer = window.setTimeout(close, duration);
    pageExitTimersRef.current.push(timer);
  };

  useEffect(() => {
    if (!unlockToast) return;
    const timer = window.setTimeout(() => setUnlockToast(null), 1800);
    return () => window.clearTimeout(timer);
  }, [unlockToast]);

  // P on the quest page: every stage open -> the earned progression -> back.
  useEffect(() => {
    if (screen !== 'menu' || (!mapOpen && !questOpen)) return;
    const onKey = (ev: KeyboardEvent) => {
      if (!isUnlockShortcut(ev)) return;
      ev.preventDefault();
      const now = toggleAllStagesOpen();
      studioSfx.tap(0, 900);
      setUnlockToast(now
        ? tr(language, 'SEMUA STAGE TERBUKA')
        : 'PROGRES NORMAL: stage dibuka satu per satu');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [screen, mapOpen, questOpen]);

  const openLevelMap = () => {
    const timing = beginMenuPageTransition('cloud', 'QUEST', menuPageLead(), () => setMapOpen(true), 'quest', {
      cover: (t) => studioSfx.cloudClose(0, t.rate),
      swap: (t) => { studioSfx.cloudOpen(0, t.rate); studioSfx.questEnter(0, QUEST_IN); },
    });
    if (!timing) return;
    setMapLeaving(false);
    studioSfx.menuExit('quest', 0, { ...menuPlanRef.current, k: menuPlanRef.current.k * 0.6 });
  };

  const closeLevelMap = () => {
    if (mapLeaving) return;
    const nextPlan = freshMenuPlan();
    const timing = beginMenuPageTransition('cloud', 'QUEST', QUEST_OUT.total, () => {
      setMapOpen(false);
      setMapLeaving(false);
      setMenuPlan(nextPlan);
      setMenuReturnKey((key) => key + 1);
    }, null, {
      cover: (t) => studioSfx.cloudClose(0, t.rate),
      swap: (t) => { studioSfx.cloudOpen(0, t.rate); studioSfx.menuEnter(0, nextPlan); },
    });
    if (!timing) return;
    setMapLeaving(true);
    studioSfx.questExit(0);
  };

  const openQuestPage = () => {
    const timing = beginMenuPageTransition('wrap', 'ACHIEVEMENT', menuPageLead(), () => setQuestOpen(true), 'ready', {
      cover: (t) => studioSfx.wrapClose(0, t.rate),
      swap: (t) => { studioSfx.wrapOpen(0, t.rate); studioSfx.achEnter(0, ACH_IN, readyQuestRewardCount); },
    });
    if (!timing) return;
    setQuestLeaving(false);
    studioSfx.menuExit('ready', 0, { ...menuPlanRef.current, k: menuPlanRef.current.k * 0.6 });
  };

  const closeQuestPage = () => {
    if (questLeaving) return;
    const nextPlan = freshMenuPlan();
    const timing = beginMenuPageTransition('wrap', 'ACHIEVEMENT', ACH_OUT.total, () => {
      setQuestOpen(false);
      setQuestLeaving(false);
      setMenuPlan(nextPlan);
      setMenuReturnKey((key) => key + 1);
    }, null, {
      cover: (t) => studioSfx.wrapClose(0, t.rate),
      swap: (t) => { studioSfx.wrapOpen(0, t.rate); studioSfx.menuEnter(0, nextPlan); },
    });
    if (!timing) return;
    setQuestLeaving(true);
    studioSfx.achExit(0);
  };

  const openLeaderboardPage = () => {
    setLeaderboardRivals(runsToRivals(readRuns(storage)));
    const timing = beginMenuPageTransition('podium', tr(language, 'PERINGKAT'), menuPageLead(), () => setLeaderboardOpen(true), 'ranks', {
      cover: (t) => studioSfx.podiumClose(0, t.rate),
      swap: (t) => { studioSfx.podiumOpen(0, t.rate); studioSfx.lbEnter(0, LB_IN); },
    });
    if (!timing) return;
    setLeaderboardLeaving(false);
    studioSfx.menuExit('ranks', 0, { ...menuPlanRef.current, k: menuPlanRef.current.k * 0.6 });
  };

  const closeLeaderboardPage = () => {
    if (leaderboardLeaving) return;
    const nextPlan = freshMenuPlan();
    const timing = beginMenuPageTransition('podium', tr(language, 'PERINGKAT'), LB_OUT.total, () => {
      setLeaderboardOpen(false);
      setLeaderboardLeaving(false);
      setMenuPlan(nextPlan);
      setMenuReturnKey((key) => key + 1);
    }, null, {
      cover: (t) => studioSfx.podiumClose(0, t.rate),
      swap: (t) => { studioSfx.podiumOpen(0, t.rate); studioSfx.menuEnter(0, nextPlan); },
    });
    if (!timing) return;
    setLeaderboardLeaving(true);
    studioSfx.lbExit(0);
  };

  const openSettingsPage = () => {
    studioSfx.confirm();
    studioSfx.whoosh(0.02, 0.32, 300, 2400, 0.12);
    setSettingsClosing(false);
    setSettingsOpen(true);
  };

  const closeSettingsPage = () => {
    if (settingsClosing) return;
    setSettingsClosing(true);
    studioSfx.back(0);
    studioSfx.whoosh(0, 0.26, 2400, 400, 0.1);
    deferPageClose(380, () => {
      setSettingsOpen(false);
      setSettingsClosing(false);
      // Preset controls are inside an opaque dialog. Start their replay only
      // after it closes, so its animation and sound are both actually visible.
      const plan = pendingSettingsPlanRef.current;
      if (plan) {
        pendingSettingsPlanRef.current = null;
        setMenuPlan(plan);
        menuEntranceAudioRef.current = plan;
        setMenuReturnKey((key) => key + 1);
      }
    });
  };

  const handleContinueAfterBoss = () => {
    setBonusAfterBoss({ stage: bossDefeatedData?.level ?? 5, bossName: bossDefeatedData?.name ?? 'BOSS' });
    setBossDefeatedData(null);
    // Bonus stage: kotak hadiah ala Knife Boss 100 Lv (senjata baru + koin).
    setBonusStageOpen(true);
  };

  const handleGiftBoxClaim = (bonusCoins: number, weaponId: WeaponId, equip: boolean) => {
    depositCoins(bonusCoins);
    const current = questStateRef.current;
    saveQuests({
      ...current,
      boxesOpened: current.boxesOpened + 1,
      totalCoinsCollected: current.totalCoinsCollected + bonusCoins,
    });
    // Catat senjata hasil kotak hadiah ke koleksi dan selebrasi hanya saat benar-benar baru.
    let isNewWeapon = false;
    try {
      const owned: string[] = JSON.parse(storage.getItem(LS.owned) || '[]');
      if (getWeapon(weaponId).rarity !== 'LANGKA' && !owned.includes(weaponId)) {
        storage.setItem(LS.owned, JSON.stringify([...owned, weaponId]));
        isNewWeapon = true;
      }
    } catch { /* simpan koleksi bersifat opsional */ }
    if (isNewWeapon) celebrateNewWeapon(weaponId);
    if (equip) chooseWeapon(weaponId);
    setBonusStageOpen(false);
    gameRef.current?.continueAfterBoss();
  };

  const startSpecial = (stage: 'boulder' | 'bonus' | 'treasure') => {
    studioSfx.subExit(0);
    setSettingsOpen(false);
    setInGameSettingsOpen(false);
    beginStage(4, stage, true);
  };

  const syncStudioVolume = (volume = soundVolume) => {
    if (studioVolumeRef.current === volume) return;
    studioSfx.setVolume(volume);
    studioVolumeRef.current = volume;
  };

  const unlockStudioAudio = (playTap = false) => {
    studioSfx.init();
    syncStudioVolume();
    if (studioSfx.getState().music) studioSfx.startMusic();
    if (playTap) studioSfx.tap();
  };

  const toggleBackgroundMusic = () => {
    studioSfx.init();
    syncStudioVolume();
    const enabled = !studioSfx.getState().music;
    studioSfx.setMusic(enabled);
    studioSfx.toggle(enabled);
  };

  const toggleMute = () => {
    const m = !muted;
    if (!m && soundVolume <= 0) {
      setSoundVolumeState(1);
      storage.setItem(LS.volume, '1');
      setMasterVolume(1);
      juicyAudio.volume = 0.7;
    }
    setMuted(m);
    setMutedState(m);
    juicyAudio.enabled = !m;
    studioSfx.init();
    syncStudioVolume(!m && soundVolume <= 0 ? 1 : soundVolume);
    if (m) {
      studioSfx.toggle(false);
      studioSfx.setSfx(false);
    } else {
      studioSfx.setSfx(true);
      studioSfx.toggle(true);
    }
  };

  const changeSoundVolume = (nextVol: number) => {
    const clamped = Math.max(0, Math.min(1, Math.round(nextVol * 100) / 100));
    setSoundVolumeState(clamped);
    storage.setItem(LS.volume, String(clamped));
    setMasterVolume(clamped);
    studioSfx.setVolume(clamped);
    studioVolumeRef.current = clamped;
    juicyAudio.volume = 0.7 * clamped;
    if (clamped <= 0) {
      studioSfx.setSfx(false);
      if (!muted) {
        setMuted(true);
        setMutedState(true);
        juicyAudio.enabled = false;
      }
    } else {
      studioSfx.setSfx(true);
      if (muted) {
        setMuted(false);
        setMutedState(false);
        juicyAudio.enabled = true;
      }
    }
  };

  const toggleEffects = () => {
    const enabled = !studioSfx.getState().sfx || muted || soundVolume <= 0;
    studioSfx.init();
    if (enabled) {
      if (soundVolume <= 0) changeSoundVolume(1);
      setMuted(false);
      setMutedState(false);
      juicyAudio.enabled = true;
      studioSfx.setSfx(true);
      studioSfx.toggle(true);
    } else {
      setMuted(true);
      setMutedState(true);
      juicyAudio.enabled = false;
      studioSfx.setSfx(false);
      studioSfx.toggle(false);
    }
  };

  const goToMainMenuFromPlay = () => {
    // Leaving mid-run (pause → menu) ends the funnel with "abandoned" instead of
    // "game_over", so a quit is never counted as a death.
    if (currentRun()) {
      trackRunEnd({ outcome: 'abandoned', stage: currentRun()!.stage, score: gameRef.current?.score ?? 0, coins: 0 });
    }
    const nextPlan = freshMenuPlan();
    const timing = beginMenuPageTransition('fade', 'MENU', PLAY_OUT.total, () => {
      setInGameSettingsOpen(false);
      gameRef.current?.toIdle();
      setMenuPlan(nextPlan);
      setMenuReturnKey((key) => key + 1);
      setScreen('menu');
    }, null, {
      cover: () => studioSfx.whoosh(0, 0.3, 2400, 400, 0.1),
      swap: () => studioSfx.menuEnter(0, nextPlan),
    });
    if (!timing) return;
    studioSfx.playExit(0);
    saveQuests(questStateRef.current, true);
  };

  const chooseMenuTheme = (theme: MenuEnvironmentTheme) => {
    setMenuTheme(theme);
  };

  /**
   * Menu preset controls (speed + weapon style) resolve a fresh plan and replay
   * the entrance immediately — the exact same plan object the right-hand game
   * publishes, so both menus can never drift apart in pacing.
   */
  const replayMenuWithPlan = (next?: Plan) => {
    const plan = next ?? resolvePlan(animStore.get(), menuPlanRef.current);
    publishMenuPlan(plan);
    setMenuPlan(plan);
    // Stop the previous replay's already-scheduled notes immediately; otherwise
    // they keep sounding over the new animation when presets change quickly.
    studioSfx.cancelMenuEnter();
    if (settingsOpen) {
      pendingSettingsPlanRef.current = plan;
      return;
    }
    // The remount below is what starts the entrance — its sound rides it.
    menuEntranceAudioRef.current = plan;
    setMenuReturnKey((key) => key + 1);
  };
  const chooseAnimSpeed = (speed: number) => {
    animStore.setSpeed(speed);
    replayMenuWithPlan();
  };
  const chooseGunPreset = (style: StyleId) => {
    animStore.setGroup('gun', { mode: 'fixed', style });
    replayMenuWithPlan();
  };
  const ownedWeaponCount = ownedWeaponIds().length;
  const readyQuestRewardCount = QUESTS.filter((quest) =>
    !questState.claimed.includes(quest.id) && Math.min(quest.progress(questState, ownedWeaponCount), quest.target) >= quest.target,
  ).length;
  const planMotion = (
    animation: string,
    delay: number,
    duration: number,
    extra = '',
    sx?: number,
    exitAnimation = 'out-fade',
    exitDelay = 0,
    exitDuration = 380,
  ) => {
    const leaving = menuDeparture !== null;
    const motion = menuMotion(
      leaving ? exitAnimation : animation,
      (leaving ? exitDelay * MENU_EXIT_K : delay) * menuPlan.k,
      (leaving ? exitDuration * MENU_EXIT_K : duration) * menuPlan.k,
      extra,
    );
    return sx === undefined ? motion : { ...motion, style: { ...motion.style, '--sx': sx } as CSSProperties };
  };
  const planStyleMotion = (
    style: StyleId,
    timeline: { inD: number; inDur: number; outD: number; outDur: number },
    classic: [string, string],
    extra = '',
    sx?: number,
  ) => {
    const leaving = menuDeparture !== null;
    const motion = menuMotion(
      animClass(style, leaving ? 'out' : 'in', classic),
      (leaving ? timeline.outD * MENU_EXIT_K : timeline.inD) * menuPlan.k,
      (leaving ? timeline.outDur * MENU_EXIT_K : timeline.inDur) * menuPlan.k,
      extra,
    );
    return sx === undefined ? motion : { ...motion, style: { ...motion.style, '--sx': sx } as CSSProperties };
  };

  /**
   * Main menu in landscape.
   *
   * The frame is 760x420 there, so the portrait stack (title above a full-size
   * weapon showcase) no longer fits: the showcase column collapsed to zero
   * height and the weapon painted right on top of the PERFECT SHOT title.
   * Landscape therefore gives the weapon its own column on the LEFT — the same
   * side the gun holds during a landscape run — and stacks the HUD, title,
   * buttons and nav in the right column. Only placement and type sizes change;
   * the markup order, the entrance choreography and every animation class stay
   * exactly as they are, so the intro plan is untouched.
   */
  const menuLandscape = isLandscape(orientation);
  const menuSceneOpen = screen === 'menu' && !mapOpen && !questOpen && !leaderboardOpen && !arsenalOpen && !settingsOpen;

  /**
   * Landscape menu showcase rig.
   *
   * The showcase weapon can be raised/lowered with W and S so the player can
   * pose it before playing. It deliberately does NOT follow the pointer: the
   * aiming angle belongs to the run, where the barrel is what the round leaves
   * from, so a menu preview that swivels would promise a heading the gun never
   * has. Portrait has no cursor and a shorter menu, so it keeps the still
   * showcase. The lift is written straight to the DOM inside one rAF loop — this
   * is a 60fps interaction and must never re-render the whole menu.
   */
  useEffect(() => {
    if (!menuLandscape || !menuSceneOpen) return;
    const aim = gunAimState.current;
    const LIFT_MAX = 92;
    const LIFT_SPEED = 416; // px per second (1.6× the original 260)
    let last = performance.now();
    let raf = 0;

    const onKeyDown = (event: KeyboardEvent) => {
      const tag = (event.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (event.code === 'KeyW') {
        aim.up = true;
        event.preventDefault();
      } else if (event.code === 'KeyS') {
        aim.down = true;
        event.preventDefault();
      }
    };
    const onKeyUp = (event: KeyboardEvent) => {
      if (event.code === 'KeyW') aim.up = false;
      else if (event.code === 'KeyS') aim.down = false;
    };
    const tick = (now: number) => {
      const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
      last = now;
      const dir = (aim.up ? 1 : 0) - (aim.down ? 1 : 0); // W lifts, S lowers
      if (dir !== 0) aim.lift = Math.max(-LIFT_MAX, Math.min(LIFT_MAX, aim.lift + dir * LIFT_SPEED * dt));

      const rig = gunAimRef.current;
      if (rig) rig.style.transform = `translate3d(0, ${(-aim.lift).toFixed(2)}px, 0)`;
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      aim.up = false;
      aim.down = false;
      if (gunAimRef.current) gunAimRef.current.style.transform = '';
    };
  }, [menuLandscape, menuSceneOpen]);
  const menuArea = (name: 'gun' | 'hud' | 'title' | 'btns' | 'line' | 'nav'): CSSProperties =>
    menuLandscape ? { gridArea: name } : {};
  const menuBodyStyle: CSSProperties = menuLandscape
    ? {
        display: 'grid',
        gridTemplateColumns: '46% 54%',
        gridTemplateRows: 'auto auto auto auto auto',
        gridTemplateAreas: '"gun hud" "gun title" "gun btns" "gun line" "gun nav"',
      }
    : {};
  /** The menu weapon box: 337x295 (native art) in portrait, a touch smaller in landscape. */
  const gunBoxClass = menuLandscape
    ? 'h-[289px] w-[330px] max-w-full'
    : 'h-[min(295px,54vh)] w-[min(337px,90vw)] max-w-full';

  /**
   * Android back, top of the pile first: the newest overlay closes, then a live
   * run pauses into the same settings panel as the gear button, and the result
   * screen returns to the menu. Anything this pane does not use is left to the
   * hub (which leaves the app) instead of killing a run by accident.
   */
  // Sekali saja: begitu menu siap, tampilkan CARA MAIN untuk pemain baru.
  useEffect(() => {
    if (!active || !menuReady) return;
    if (!shouldShowHowToPlay(storage)) return;
    setHelpIsFirstRun(true);
    setHelpOpen(true);
  }, [active, menuReady]);

  /** Tutup CARA MAIN dan tandai sudah pernah dilihat. */
  const closeHelp = () => {
    setHelpOpen(false);
    setHelpIsFirstRun(false);
    markHowToPlaySeen(storage);
  };

  /**
   * RESET PROGRES: hapus save, lalu muat ulang aplikasi. Reload adalah satu-satunya
   * cara yang dijamin membuat semua layar (menu, peta, arsenal, quest) membaca
   * save yang sudah kosong, tanpa menyentuh belasan state satu per satu.
   */
  const confirmResetProgress = () => {
    resetProgress(storage);
    // Tampilkan konfirmasi singkat, baru reload: kalau jendela langsung hilang,
    // pemain tidak tahu apakah tombolnya bekerja atau aplikasinya crash.
    setResetDone(true);
    if (resetReloadRef.current !== null) window.clearTimeout(resetReloadRef.current);
    resetReloadRef.current = window.setTimeout(() => window.location.reload(), 800);
  };

  useEffect(
    () => () => {
      if (resetReloadRef.current !== null) window.clearTimeout(resetReloadRef.current);
    },
    [],
  );

  useAndroidBack(() => {
    if (helpOpen) { closeHelp(); return true; }
    if (resetOpen) {
      // Setelah progres dihapus dialognya menunggu reload — jangan ditutup.
      if (!resetDone) setResetOpen(false);
      return true;
    }
    if (privacyOpen) { setPrivacyOpen(false); return true; }
    if (inGameSettingsOpen) { setInGameSettingsOpen(false); return true; }
    if (arsenalOpen) { startArsenalTransition(false); return true; }
    if (questOpen) { closeQuestPage(); return true; }
    if (leaderboardOpen) { closeLeaderboardPage(); return true; }
    if (starBuffOpen) { setStarBuffOpen(false); return true; }
    if (mapOpen) { setMapOpen(false); return true; }
    if (settingsOpen) { setSettingsOpen(false); return true; }
    // A reward is being opened: swallow the press so the app never vanishes
    // from under a modal that still has to be claimed.
    if (bonusStageOpen || bossDefeatedData || milestoneGift || weaponCelebration) return true;
    if (screen === 'playing') { setInGameSettingsOpen(true); return true; }
    if (screen === 'over') { goToMainMenuFromPlay(); return true; }
    return false;
  }, active);

  return (
    <div
      className="gunhit-sga font-game flex h-full w-full select-none items-center justify-center bg-[#071318] relative"
      onPointerOverCapture={(event) => {
        if (event.pointerType !== 'mouse') return;
        const target = event.target as Element | null;
        const control = target?.closest('button, [role="button"], input[type="range"]');
        const previous = (event.relatedTarget as Element | null)?.closest?.('button, [role="button"], input[type="range"]');
        if (control && control !== previous) studioSfx.hover();
      }}
      onClickCapture={(event) => {
        if ((event.target as HTMLElement | null)?.closest('button, [role="button"], input[type="range"]')) {
          unlockStudioAudio(true);
        }
      }}
    >
      {wheelArtJobs.length > 0 && (
        <WheelArtBridge
          key={wheelArtJobs[0].key}
          kind={wheelArtJobs[0].kind}
          icon={wheelArtJobs[0].icon}
          head={wheelArtJobs[0].head}
          onReady={(_kind, image, markup) => {
            const job = wheelArtJobs[0];
            if (!job) return;
            wheelArtCache.current.set(job.key, image);
            wheelSvgCache.current.set(job.key, markup);
            gameRef.current?.setWheelArt(job.key, image, markup);
            setWheelArtJobs((jobs) => (jobs[0]?.key === job.key ? jobs.slice(1) : jobs));
          }}
        />
      )}
      {onExit && (
        <button
          onClick={onExit}
          className="fixed top-3 left-3 z-50 flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-neutral-900/90 hover:bg-neutral-800 text-white text-xs font-semibold backdrop-blur-md border border-white/20 shadow-xl cursor-pointer transition hover:scale-105 active:scale-95"
          title={tr(language, 'Kembali ke Menu Game')}
        >
          <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>{tr(language, 'Pilih Game Lain')}</span>
        </button>
      )}
      <div
        ref={gameShellRef}
        className="relative flex-shrink-0 overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.9)]"
        style={{ width: frame.w, height: frame.h }}
      >
        {/* Canvas Engine (zero permanent translucent DOM overlays during gameplay so desynchronized:true scans out directly) */}
        <canvas ref={canvasRef} className="block touch-none" style={{ width: frame.w, height: frame.h }} />
        {/* Only during a run: on the menu the engine is idle and paints nothing,
            so the showcase above owns the weapon instead. */}
        {screen === 'playing' && hasZipArt(weapon) && zipCardWeapon === weapon && (
          <ZipWeaponOverlay
            id={weapon}
            read={() => gameRef.current?.getZipGunFrame() ?? null}
            readShotAt={() => zipMuzzleShotAtRef.current}
          />
        )}
        {diamondToast && (
          <div key={diamondToast.id} className="pointer-events-none absolute inset-x-0 top-[34%] z-40 flex flex-col items-center diamond-reward-pop" aria-live="polite">
            <div className="relative flex h-36 w-64 items-center justify-center">
              <SunburstFX size={280} color="255,255,255" intensity={1} speed={14} stars />
              <DiamondSprite size={96} className="relative z-10 drop-shadow-[0_0_22px_rgba(103,232,249,0.95)]" />
            </div>
            <div className="-mt-4 rounded-full border border-cyan-200/70 bg-slate-950/90 px-5 py-2 text-lg font-black text-cyan-100 shadow-[0_0_30px_rgba(34,211,238,0.75)]">
              BERLIAN +{diamondToast.amount}
            </div>
          </div>
        )}
        {cheatToast && (
          <div className="pointer-events-none absolute inset-x-0 top-[34%] z-40 flex flex-col items-center diamond-reward-pop" aria-live="polite">
            <div className="rounded-full border border-emerald-200/70 bg-slate-950/90 px-5 py-2 text-lg font-black text-emerald-100 shadow-[0_0_30px_rgba(52,211,153,0.75)]">
              {cheatToast}
            </div>
          </div>
        )}
        {/* Stage-clear & special-stage Sunburst renders inside Canvas2D strictly BEHIND the wheel/rock/chest (never in a front DOM layer) */}
        {weaponCelebration && (() => {
          const unlocked = getWeapon(weaponCelebration.weaponId);
          const color = gunSunburstColor(unlocked.rarity);
          const rarity = RARITY_COLOR[unlocked.rarity];
          const starCount = unlocked.rarity === 'LEGENDARIS' ? 3 : unlocked.rarity === 'EPIC' ? 3 : unlocked.rarity === 'LANGKA' ? 2 : 1;
          return (
            <div key={weaponCelebration.id} className="pointer-events-none absolute inset-0 z-[60] flex items-center justify-center overflow-hidden" aria-live="polite" aria-label={`${tr(language, 'Senjata baru ')}${unlocked.name}`}>
              <Dust count={22} />
              <SparkleField count={18} spread={1.55} delay={0.12} />
              <SunburstFX size={450} color={color} intensity={1.05} speed={12} stars />
              <div className="absolute left-1/2 top-1/2 h-0 w-0">
                <Shockwave size={410} color={`rgba(${color},.9)`} />
                <Shockwave size={300} color="rgba(255,255,255,.8)" delay={0.12} />
                <Flare width={480} color={color} />
                <Burst count={30} distance={250} size={14} colors={['#ffffff', '#fde68a', '#7dd3fc', '#f0abfc']} />
              </div>
              {/* Unlock card: a glossy blue plate in the game's own gold frame
                  instead of the flat black slab, with the rarity colour on the
                  weapon badge and a gold banner across the top. */}
              <div className="relative z-10 w-[268px] drop-shadow-[0_16px_30px_rgba(0,0,0,.6)]">
                <div className="rounded-[26px] border-[3px] border-[#7c2d12] bg-gradient-to-b from-[#ffe27a] via-[#ffa62b] to-[#f97316] p-[3px] shadow-[0_6px_0_#7c2d12]">
                  <div
                    className="relative overflow-hidden rounded-[22px] border-2 border-[#0b1f5c] px-5 pb-4 pt-8 text-center shadow-[inset_0_2px_0_rgba(255,255,255,.35)]"
                    style={{ background: 'linear-gradient(180deg,#1d3d78 0%,#12295a 46%,#0a1730 100%)' }}
                  >
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/25 to-transparent" />
                    <div
                      className="pointer-events-none absolute inset-0 opacity-30"
                      style={{
                        backgroundImage: 'linear-gradient(rgba(255,255,255,.09) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.09) 1px, transparent 1px)',
                        backgroundSize: '18px 18px',
                      }}
                    />
                    <div
                      className="relative mx-auto grid h-[104px] w-[104px] place-items-center rounded-full"
                      style={{
                        background: `radial-gradient(circle at 50% 34%, #fff8d8 0%, ${rarity}77 52%, rgba(6,15,32,.92) 100%)`,
                        boxShadow: `0 0 0 3px #0b1f5c, 0 0 0 6px ${rarity}, inset 0 0 22px ${rarity}aa, 0 8px 18px rgba(0,0,0,.45)`,
                      }}
                    >
                      <span className="text-[52px] leading-none drop-shadow-[0_6px_10px_rgba(0,0,0,.5)]">{unlocked.emoji}</span>
                    </div>
                    <div
                      className="font-arsenal-title relative mt-3 text-[26px] leading-none text-white"
                      style={{ textShadow: '0 3px 0 #0b1f5c, 0 0 18px rgba(125,211,252,.45)' }}
                    >
                      {unlocked.name}
                    </div>
                    <div className="relative mt-2.5 flex items-center justify-center gap-2">
                      <span
                        className="rounded-full border-2 border-[#0b1f5c] px-2.5 py-[2px] text-[10px] font-black tracking-[.12em] text-[#0b1220] shadow-[0_2px_0_#0b1f5c]"
                        style={{ background: rarity }}
                      >
                        {unlocked.rarity === 'LEGENDARIS' ? 'LEGEND' : unlocked.rarity}
                      </span>
                      <span className="text-[15px] leading-none text-yellow-300 drop-shadow-[0_0_10px_#fde047]">{'★'.repeat(starCount)}</span>
                    </div>
                  </div>
                </div>
                <div className="font-arsenal-title absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border-2 border-[#7c2d12] bg-gradient-to-b from-[#fff3a0] to-[#f59e0b] px-4 py-[5px] text-[12px] leading-none tracking-[.18em] text-[#5a2a00] shadow-[0_3px_0_#7c2d12]">
                  ★ SENJATA BARU ★
                </div>
              </div>
            </div>
          );
        })()}
        {diamondFlight && (
          <div ref={diamondFlightRef} className="pointer-events-none absolute z-50 flex h-16 w-16 items-center justify-center drop-shadow-[0_0_20px_rgba(186,239,255,1)]" style={{ left: `${diamondFlight.x}px`, top: `${diamondFlight.y}px`, transform: 'translate(-50%, -50%)' }} aria-hidden="true">
            <DiamondSprite size={64} />
          </div>
        )}
        {diamondHudMode && screen === 'playing' && (
          <div className="pointer-events-none absolute right-1 top-[12px] z-40 flex h-[44px] min-w-[96px] items-center justify-end gap-1 rounded-full border border-cyan-100/80 bg-[#071827]/95 px-2 text-[19px] font-black text-cyan-100 shadow-[0_0_22px_rgba(125,211,252,0.85)]" aria-live="polite">
            <DiamondSprite size={28} className="-mr-1" /><span className="font-mono">{diamonds}</span>
          </div>
        )}
        {screen === 'playing' && !gameplayModalOpen && (
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              studioSfx.subEnter(0.03);
              setInGameSettingsOpen(true);
            }}
            aria-label="Pengaturan permainan"
            title="Pengaturan (Menu, Suara & Kecepatan)"
            className="absolute right-2.5 top-[62px] z-30 flex h-10 w-10 items-center justify-center rounded-2xl border border-white/25 bg-[#0a1d28]/85 text-lg text-white shadow-[0_6px_18px_rgba(0,0,0,0.58)] backdrop-blur-sm transition hover:scale-105 hover:border-cyan-200/70 hover:bg-[#133244] active:scale-95"
          >
            ⚙️
          </button>
        )}
        {diamondReveal !== null && (
          <div
            key={diamondReveal.id}
            className="pointer-events-none absolute z-45"
            style={{ left: 210, top: 184, transform: 'translate(-50%, -50%)' }}
            aria-live="polite"
          >
            <div className="diamond-reveal">
              <div className="relative flex h-[420px] w-[420px] flex-col items-center justify-center">
                <SunburstFX size={510} color="255,255,255" intensity={1.15} speed={12} stars />
                <div className="relative z-10 flex h-44 w-44 items-center justify-center rounded-full border border-white/50 bg-gradient-to-br from-white/30 to-cyan-300/10 drop-shadow-[0_0_34px_rgba(205,241,255,1)]">
                  <DiamondSprite size={156} />
                </div>
                <div className="relative z-10 mt-4 rounded-2xl border-2 border-[#e0f4ff] bg-[#071827]/90 px-6 py-3 text-center shadow-[0_0_40px_rgba(186,230,253,0.9)]">
                  <div className="text-[11px] font-black tracking-[0.32em] text-cyan-100">{tr(language, 'BERLIAN BESAR DIDAPAT')}</div>
                  <div className="mt-1 text-3xl font-black text-white drop-shadow-[0_0_12px_#bae6fd]">+{diamondReveal.amount}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Transition Overlay (Hypercasual READY GO) */}
        {transitioning && (
          <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="pop-in flex flex-col items-center">
              <div className="text-6xl font-black italic tracking-wider text-yellow-300 drop-shadow-[0_6px_0_rgba(0,0,0,0.8)] font-game">
                {transText}
              </div>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------
            MAIN MENU: EXACT MATCHING SCREENSHOT 1 KNIFE HIT LAYOUT!
           ------------------------------------------------------------- */}
        {screen === 'menu' && !mapOpen && !questOpen && !leaderboardOpen && !arsenalOpen && (
          <div key={menuReturnKey} className={`gunhit-menu absolute inset-0 z-20 overflow-hidden text-white isolate ${active && introReady ? '' : 'slide-paused'} ${menuReady && introReady && !menuDeparture && !settingsOpen ? '' : 'pointer-events-none'} ${playMenuExiting && !menuDeparture ? 'sga-play-exit' : ''}`} data-menu-theme={menuTheme}>
            {/* Preserve the existing SGA menu world, stars, particles and theme lighting. */}
            <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
              {/* The menu world exits with the same zoom/blur dip as the reference
                  game, then re-enters when the menu is remounted after a page. */}
              <div
                {...(menuDeparture === 'play'
                  ? { className: 'absolute inset-0', style: {} as CSSProperties }
                  : planMotion('in-bg', 0, 1100, 'absolute inset-0', undefined, 'out-bg', 120, 700))}
              >
                {menuTheme === 'auto' || menuTheme === 'forest' ? (
                  /* Menu dan gameplay satu ruangan: latar yang sama persis.
                     A covering page transition hides the room anyway, so the menu
                     stops repainting it 30 times a second while it plays. A fade
                     leaves the menu visible and keeps it alive. */
                  <MenuStageBackdrop orientation={orientation} animated={!menuPageTransition || menuPageTransition.variant === 'fade'} />
                ) : (
                  <MenuEnvironment theme={menuTheme} vivid={menuLandscape} />
                )}
              </div>
              {(menuTheme !== 'auto' && menuTheme !== 'forest') && (
                <div className={`absolute inset-0 ${menuLandscape ? 'bg-[radial-gradient(ellipse_at_50%_46%,rgba(125,211,252,.16),transparent_66%)]' : 'bg-[radial-gradient(ellipse_at_50%_46%,rgba(125,211,252,.08),transparent_68%)]'}`} />
              )}
              <div className={`absolute inset-0 ${menuLandscape ? 'opacity-95' : 'opacity-60'}`}>
                <Dust count={menuLandscape ? 20 : 14} />
                <SparkleField count={menuLandscape ? 16 : 10} spread={1.45} />
              </div>
              {/* Keep SGA's selectable world art, with a lighter top/bottom framing
                  in landscape so the sky keeps the vivid blue of the reference. */}
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background: menuLandscape
                    ? 'linear-gradient(180deg, rgba(3,7,10,.16) 0%, rgba(3,7,10,.04) 13%, transparent 30%, transparent 80%, rgba(1,5,8,.30) 100%), radial-gradient(ellipse at 50% 46%, transparent 58%, rgba(0,0,0,.16) 100%)'
                    : 'linear-gradient(180deg, rgba(3,7,10,.42) 0%, rgba(3,7,10,.12) 13%, transparent 28%, transparent 76%, rgba(1,5,8,.54) 100%), radial-gradient(ellipse at 50% 46%, transparent 52%, rgba(0,0,0,.24) 100%)',
                }}
              />
            </div>

            <div {...planMotion('in-shake', 800 + 560 * 0.78, 380, 'absolute inset-0', undefined, '', 0, 0)}>
              <div className={`relative flex h-full ${menuLandscape ? '' : 'flex-col'}`} style={menuBodyStyle}>
              {/* SGA coin and diamond artwork stays intact, positioned like Perfect Shot's HUD. */}
              <div className={`relative z-10 flex shrink-0 items-center justify-end gap-3 ${menuLandscape ? 'px-4 pt-2' : 'px-5 pt-4'}`} style={menuArea('hud')}>
                <div {...planMotion('in-down', 150, 700, 'font-title flex items-center gap-1.5 text-xl text-amber-300 drop-shadow', undefined, 'out-up', 0, 480)}>
                  <span className="font-title tabular-nums font-black tracking-tight">{totalCoins}</span>
                  <CoinSprite size={25} className="drop-shadow-[0_0_5px_rgba(255,210,80,.7)]" />
                </div>
                <div {...planMotion('in-fade', 250, 700, 'h-8 w-px bg-white/20', undefined, 'out-fade', 0, 480)} />
                <div {...planMotion('in-down', 250, 700, 'font-title flex items-center gap-1 text-lg text-white drop-shadow', undefined, 'out-up', 60, 480)}>
                  <DiamondSprite size={24} fillRatio={0.92} />
                  {diamonds}
                </div>
              </div>

              {/* Perfect Shot's two-line title, type, bullet slash and staggered impact. */}
              <div className={`relative z-10 mt-1 flex shrink-0 flex-col items-center text-center ${menuLandscape ? 'justify-center' : ''}`} style={menuArea('title')}>
                <div className="relative flex flex-col items-center">
                  {!menuDeparture && <div className="mm-halo pointer-events-none absolute left-1/2 top-[46%] h-[180px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ animationDelay: `${2600 * menuPlan.k}ms` }} />}
                  <h1 className="font-title relative flex text-[min(15vw,72px)] leading-none tracking-wide text-[#3fdc72]" style={menuLandscape ? { fontSize: '44px' } : undefined}>
                    {!menuDeparture && <span aria-hidden className="mm-shine pointer-events-none absolute inset-0 z-10 flex" style={{ animationDelay: `${2800 * menuPlan.k}ms` }}>PERFECT</span>}
                    {'PERFECT'.split('').map((letter, i) => (
                      <span key={`${letter}-${i}`} className={planStyleMotion(menuPlan.title[i], TL.letter(i), ['in-letter', 'out-letter'], 'inline-block', i < 3 ? -1 : 1).className} style={{ ...planStyleMotion(menuPlan.title[i], TL.letter(i), ['in-letter', 'out-letter'], 'inline-block', i < 3 ? -1 : 1).style, textShadow: '0 2px 0 #23a34e, 0 4px 0 #1d8a42, 0 6px 0 #166f35, 0 8px 0 #0f5427, 0 14px 18px rgba(0,0,0,.55)' } as CSSProperties}>{letter}</span>
                    ))}
                  </h1>

                  <div className="relative mt-1 h-3 w-[68%]">
                    <div {...planMotion('in-slash', 800, 560, 'absolute inset-0', undefined, 'out-slash', 120, 380)} style={{ ...planMotion('in-slash', 800, 560, 'absolute inset-0', undefined, 'out-slash', 120, 380).style, filter: 'drop-shadow(0 0 5px rgba(255,255,255,.9)) drop-shadow(0 0 14px rgba(180,255,220,.6))' } as CSSProperties}>
                      <div className="absolute inset-y-[1px] left-0 right-0" style={{ clipPath: 'polygon(0 50%, 100% 0, 100% 100%)', background: 'linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,.18) 25%,rgba(255,255,255,.7) 68%,#fff 100%)' }} />
                      <div className="absolute left-[35%] right-0 top-1/2 h-[3px] -translate-y-1/2" style={{ clipPath: 'polygon(0 50%,100% 0,100% 100%)', background: 'linear-gradient(90deg,rgba(255,255,255,0),#fffbe6 80%)' }} />
                    </div>
                    <div {...planMotion('in-bullet', 800, 560, 'absolute top-1/2 z-10', undefined, 'out-bullet', 110, 460)} style={{ ...planMotion('in-bullet', 800, 560, 'absolute top-1/2 z-10', undefined, 'out-bullet', 110, 460).style, left: '92%' } as CSSProperties}>
                      <MenuBullet />
                    </div>
                  </div>

                  <h2 className="font-title relative -mt-1 flex text-[min(18vw,86px)] leading-none tracking-wider text-[#ffd23f]" style={menuLandscape ? { fontSize: '54px' } : undefined}>
                    {!menuDeparture && <span aria-hidden className="mm-shine pointer-events-none absolute inset-0 z-10 flex" style={{ animationDelay: `${3000 * menuPlan.k}ms` }}>SHOT</span>}
                    {'SHOT'.split('').map((letter, i) => (
                      <span key={`${letter}-${i}`} className={planStyleMotion(menuPlan.title[7 + i], TL.shot(i), ['in-slam', 'out-blast'], 'inline-block', i < 2 ? -1 : 1).className} style={{ ...planStyleMotion(menuPlan.title[7 + i], TL.shot(i), ['in-slam', 'out-blast'], 'inline-block', i < 2 ? -1 : 1).style, textShadow: '0 2px 0 #f0a81c, 0 4px 0 #e0901a, 0 6px 0 #c47414, 0 8px 0 #9c5a10, 0 14px 18px rgba(0,0,0,.55)' } as CSSProperties}>{letter}</span>
                    ))}
                  </h2>
                </div>

                <div {...planMotion('in-up', 1250, 600, 'relative z-10', undefined, 'out-fade', 80, 300)}>
                  <p className="font-title mt-2 flex items-center gap-3 text-base tracking-[0.12em] text-white drop-shadow-[0_2px_0_rgba(0,0,0,.5)]">
                    STAGE {bestLevel} <span className="inline-block h-2.5 w-2.5 rotate-45 bg-amber-400" /> SCORE {best}
                  </p>
                </div>
              </div>

              {/* Weapon showcase. The light behind the weapon is Gun Hit's own
                  sunburst (`SunburstFX`, the amber-ray burst this menu has
                  always used), never the reference menu's conic ray disc. */}
              <div className={`relative flex items-center justify-center ${menuLandscape ? '' : 'min-h-0 flex-1'}`} style={menuArea('gun')}>
                <div {...(menuDeparture === 'play'
                  ? {
                    // Only the captured flight frame replaces the menu weapon; without
                    // one (landscape, or a blocked capture) it stays on screen until
                    // the menu itself unmounts instead of blinking out early.
                    className: `relative z-10 ${gunBoxClass} ${weaponFlight ? 'opacity-0' : ''}`,
                    style: {} as CSSProperties,
                  }
                  : planStyleMotion(menuPlan.gun, gunTiming(menuPlan.gun), ['in-gun', 'out-spin'], `relative z-10 ${gunBoxClass}`, 1))}>
                  {/* No ring or shadow on the floor: the weapon stands on the
                      light of the sunburst alone. */}
                  {!menuDeparture && [18, 42, 64, 82].map((x, i) => <span key={x} className="mm-mote pointer-events-none absolute bottom-[14%] h-1.5 w-1.5 rounded-full bg-[#e0fbff]" style={{ left: `${x}%`, animationDelay: `${(3400 + i * 700) * menuPlan.k}ms` }} />)}
                  <div className="float relative h-full w-full" data-menu-gun>
                    <div ref={gunAimRef} className="relative h-full w-full" style={{ willChange: 'transform' }} data-menu-aim>
                    <div ref={weaponPivotRef} className="pointer-events-none absolute inset-0" aria-hidden="true">
                      <SunburstFX size={430} color="255,255,255" intensity={0.44} speed={32} core={false} stars={false} style={{ left: 'calc(50% + var(--weapon-pivot-x, 0px))', top: 'calc(50% + var(--weapon-pivot-y, 0px))' }} />
                      {!menuDeparture && menuPlan.gun === 'combo' && (
                        <div
                          aria-hidden="true"
                          className="menu-pop-burst -translate-x-1/2 -translate-y-1/2"
                          style={{
                            left: 'calc(50% + var(--weapon-pivot-x, 0px))',
                            top: 'calc(50% + var(--weapon-pivot-y, 0px))',
                            '--pop-delay': `${(gunTiming('combo').inD + gunTiming('combo').inDur * 0.48) * menuPlan.k}ms`,
                            '--pop-dur': `${gunTiming('combo').inDur * 0.26 * menuPlan.k}ms`,
                          } as CSSProperties}
                        >
                          {Array.from({ length: 12 }, (_, i) => (
                            <span key={i} className="menu-pop-ray" style={{ '--ray-angle': `${i * 30}deg` } as CSSProperties} />
                          ))}
                        </div>
                      )}
                    </div>
                    <div ref={gunTiltRef} className="relative" style={{ transformOrigin: '50% 78%', willChange: 'transform' }} data-menu-aim-tilt>
                    {/* The five zip weapons are live SVG: their glow, shimmer and
                        twinkle keep animating here instead of being baked. */}
                    {zipCardWeapon === weapon && <ZipWeaponArt id={weapon} height={300} anchor="center" className="pointer-events-none" />}
                    <canvas ref={previewCanvasRef} style={menuLandscape ? { width: '330px', height: '289px' } : { width: 'min(337px, 90vw)', height: 'min(295px, 54vh)' }} className="block cursor-pointer drop-shadow-[0_10px_20px_rgba(0,0,0,.5)] transition-transform hover:scale-105" role="button" tabIndex={0} aria-label={tr(language, 'Buka koleksi senjata')} onClick={() => startArsenalTransition(true)} onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        unlockStudioAudio(true);
                        startArsenalTransition(true);
                      }
                    }} />
                    </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Perfect Shot's glossy paired controls, wired to SGA actions. */}
              <div className={`relative z-10 flex shrink-0 justify-center gap-3 ${menuLandscape ? 'items-center px-4' : 'px-6'}`} style={menuArea('btns')}>
                <div {...planStyleMotion(menuPlan.buttons[0], TL.buttons(0), ['in-left', 'out-left'], 'w-[42%] max-w-[158px]', -1)}>
                  <button type="button" data-gloss="off" onClick={openLevelMap} className="press shine font-ui relative flex h-[54px] w-full items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-b from-[#ff6a3d] to-[#e0331e] text-[20px] text-white shadow-[0_5px_0_#9c1f12,0_10px_18px_rgba(0,0,0,.4)]" style={{ '--shd': '2.4s' } as CSSProperties}>
                    <span className="absolute inset-x-3 top-1.5 h-5 rounded-xl bg-white/25" />
                    <GameIcon name="quest" set={perfectShotIconSet} mono={{ fill: '#fff', line: '#8f1d10' }} className="relative h-6 w-6" />
                    <span className="relative drop-shadow-[0_2px_0_rgba(0,0,0,.3)]">QUEST</span>
                  </button>
                </div>
                <div {...planStyleMotion(menuPlan.buttons[1], TL.buttons(1), ['in-right', 'out-right'], 'w-[42%] max-w-[158px]', 1)}>
                  <button type="button" data-gloss="off" onClick={play} className="press shine mm-breathe font-ui relative flex h-[54px] w-full items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-b from-[#4cef6a] to-[#18b93a] text-[24px] text-white shadow-[0_5px_0_#0c7a22,0_10px_18px_rgba(0,0,0,.4)]">
                    <span className="absolute inset-x-3 top-1.5 h-5 rounded-xl bg-white/30" />
                    <span className="relative drop-shadow-[0_2px_0_rgba(0,0,0,.3)]">PLAY</span>
                    <GameIcon name="play" set={perfectShotIconSet} mono={{ fill: '#fff', line: '#0c6a22' }} className="relative h-7 w-7" />
                  </button>
                </div>
              </div>

              {(() => {
                const line = planMotion('in-line', 1500, 600, `relative z-10 mx-auto ${menuLandscape ? 'my-2' : 'my-4'} h-px w-[70%] bg-gradient-to-r from-transparent via-white/20 to-transparent`, undefined, 'out-line', 40, 380);
                return <div {...line} style={{ ...line.style, ...menuArea('line') }} />;
              })()}

              {/* Right game's four framed vector icons, retaining SGA menu destinations. */}
              <div className={`relative z-30 grid shrink-0 grid-cols-4 ${menuLandscape ? 'px-4 pb-2' : 'px-6 pb-5'} ${perfectShotIconSet === 'flat' ? 'gap-5' : 'gap-3'}`} style={menuArea('nav')}>
                {SGA_MENU_NAV.map((item, i) => (
                  <div key={item.id} {...planStyleMotion(menuPlan.nav[i], TL.nav(i), ['in-pop', 'out-down'], 'flex justify-center', i < 2 ? -1 : 1)}>
                    <button type="button" data-gloss="off" onClick={() => {
                      if (item.id === 'gun') startArsenalTransition(true);
                      else if (item.id === 'ranks') openLeaderboardPage();
                      else if (item.id === 'ready') openQuestPage();
                      else openSettingsPage();
                    }} className="press flex w-full flex-col items-center gap-1.5">
                      <span className={`relative w-full ${perfectShotIconSet === 'flat' ? 'max-w-[50px]' : 'max-w-[66px]'}`}>
                        <NavFrame set={perfectShotIconSet} name={item.icon} active={!!item.highlight}>
                          <span className={`block h-full w-full ${item.highlight ? 'bounce-soft' : ''}`}>
                            <GameIcon name={item.icon} set={perfectShotIconSet} className="h-full w-full drop-shadow-[0_3px_2px_rgba(0,0,0,.45)]" />
                          </span>
                        </NavFrame>
                        {item.id === 'ready' && readyQuestRewardCount > 0 && (
                          <span className="font-title absolute -right-1.5 -top-1 grid h-6 min-w-6 place-items-center rounded-full bg-[#ef4444] px-1 text-[12px] text-white shadow-[0_2px_0_#7f1d1d] ring-2 ring-white">
                            {readyQuestRewardCount}
                          </span>
                        )}
                      </span>
                      <span className={`font-title tracking-wide drop-shadow-[0_2px_0_rgba(0,0,0,.6)] ${perfectShotIconSet === 'flat' ? 'text-[10.5px]' : 'text-sm'} ${perfectShotIconSet === 'flat' ? 'text-[#8fd0f2]' : item.highlight ? 'text-yellow-300' : 'text-white'}`}>
                        {item.label}
                      </span>
                    </button>
                  </div>
                ))}
              </div>
              </div>
            </div>
          </div>
        )}

        {helpOpen && (
          <Overlay><HowToPlayPage firstRun={helpIsFirstRun} onClose={closeHelp} /></Overlay>
        )}

        {resetOpen && (
          <Overlay><ResetProgressDialog
            done={resetDone}
            onCancel={() => setResetOpen(false)}
            onConfirm={confirmResetProgress}
          /></Overlay>
        )}

        {privacyOpen && (
          <Overlay><PrivacyPage onClose={() => setPrivacyOpen(false)} /></Overlay>
        )}

        {screen === 'menu' && settingsOpen && (
          <Overlay><SgaSettingsPanel
            closing={settingsClosing}
            muted={muted}
            volume={soundVolume}
            sfxEnabled={studioSound.sfx}
            musicEnabled={studioSound.music}
            speed={gameSpeed}
            bulletSpeed={bulletSpeed}
            onBulletSpeed={setBulletSpeed}
            spotCombo={spotCombo}
            onSpotCombo={() => setSpotCombo(!spotCombo)}
            speedOptions={SGA_SPEED_OPTIONS}
            themes={SGA_BG_THEMES}
            theme={menuTheme}
            orientation={orientation}
            onClose={closeSettingsPage}
            onMute={toggleMute}
            onSfx={toggleEffects}
            onMusic={toggleBackgroundMusic}
            onVolume={changeSoundVolume}
            onSpeed={setGameSpeed}
            onTheme={chooseMenuTheme}
            onOrientation={setOrientation}
            animSpeed={psAnimationConfig.speed}
            animGunStyle={psAnimationConfig.groups.gun.style}
            animSpeeds={SPEEDS}
            animStyles={STYLES}
            onAnimSpeed={chooseAnimSpeed}
            onAnimGunStyle={chooseGunPreset}
            onReplayIntro={() => {
              if (!muted) {
                juicyAudio.enabled = true;
                if (juicyAudio.volume === 0) juicyAudio.volume = 0.7;
                void juicyAudio.unlock();
              }
              pendingSettingsPlanRef.current = null;
              closeSettingsPage();
              window.dispatchEvent(new CustomEvent('sans-replay-intro'));
            }}
            onSpecial={startSpecial}
            onPrivacy={() => setPrivacyOpen(true)}
            language={language}
            onLanguage={changeLanguage}
            onHelp={() => setHelpOpen(true)}
            onReset={() => {
              setResetDone(false);
              setResetOpen(true);
            }}
            formatSpeed={formatSgaSpeed}
          /></Overlay>
        )}

        {screen === 'menu' && mapOpen && (
          <Overlay><StageMapPage
            leaving={mapLeaving}
            progress={{ stage: Math.max(1, Math.min(GUN_HIT_MAP_MAX_LEVEL, bestLevel)), stages: SGA_QUEST_STAGES }}
            unlockAll={allStagesOpen}
            // Landscape runs the map left → right; portrait keeps the corridor
            // climbing up the screen.
            axis={menuLandscape ? 'x' : 'y'}
            onBack={closeLevelMap}
            onPlay={(_event, level) => beginStage(level)}
          /></Overlay>
        )}

        {screen === 'menu' && (mapOpen || questOpen) && (
          <>
            <div className="pointer-events-none absolute bottom-2 left-1/2 z-[70] -translate-x-1/2 whitespace-nowrap rounded-full border border-white/25 bg-black/55 px-3 py-1 text-[10px] font-black tracking-wide text-white/80 backdrop-blur-[2px]">
              {allStagesOpen ? tr(language, '🔓 SEMUA STAGE TERBUKA') : tr(language, '🔒 PROGRES NORMAL')} · {tr(language, 'tekan')} <span className="mx-0.5 rounded bg-white/20 px-1">P</span>
              {allStagesOpen ? ' untuk normal' : ' untuk buka semua'}
            </div>
            {unlockToast && (
              <div key={unlockToast} className="pointer-events-none pop-in absolute left-1/2 top-[16%] z-[70] -translate-x-1/2 whitespace-nowrap rounded-xl border border-amber-200/40 bg-[#1a1206]/90 px-4 py-2 text-[12px] font-black text-amber-100 shadow-[0_10px_30px_rgba(0,0,0,.5)]">
                {unlockToast}
              </div>
            )}
          </>
        )}

        {/* Modals */}
        {screen === 'playing' && inGameSettingsOpen && (
          <div
            onPointerDown={(e) => e.stopPropagation()}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-[2px]"
          >
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="gunhit-ingame-settings-title"
              className="pop-in w-full max-w-sm rounded-3xl border border-cyan-200/30 bg-gradient-to-b from-[#132c34] to-[#08151d] p-4 text-white shadow-[0_24px_70px_rgba(0,0,0,.78)]"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <div className="text-[10px] font-black tracking-[0.22em] text-amber-300">⏸ PERMAINAN DIJEDA</div>
                  <h2 id="gunhit-ingame-settings-title" className="mt-0.5 font-title text-[20px] leading-none tracking-wide text-white">
                    PENGATURAN
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    studioSfx.subExit(0);
                    setInGameSettingsOpen(false);
                  }}
                  aria-label={tr(language, 'Tutup pengaturan permainan')}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-xl text-white/85 hover:bg-white/20"
                >
                  ×
                </button>
              </div>

              {/* Sound & Volume Adjustment */}
              <div className="mb-3 rounded-2xl border border-white/15 bg-white/[0.06] p-3">
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={toggleMute}
                    className="flex flex-1 items-center gap-3 text-left transition active:scale-[0.99]"
                  >
                    <span className="text-xl">{muted || soundVolume <= 0 ? '🔇' : '🔊'}</span>
                    <span>
                      <span className="block text-sm font-black">SUARA GAME</span>
                      <span className="block text-[10px] text-white/55">{tr(language, 'Geser untuk atur volume efek')}</span>
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={toggleMute}
                    className={`rounded-full px-2.5 py-1 text-[10px] font-black ${
                      muted || soundVolume <= 0 ? 'bg-white/10 text-white/65' : 'bg-emerald-400/25 text-emerald-200'
                    }`}
                  >
                    {muted || soundVolume <= 0 ? tr(language, 'MATI') : `${Math.round(soundVolume * 100)}%`}
                  </button>
                </div>

                <div className="mt-2.5 flex items-center gap-2">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    aria-label={tr(language, 'Volume suara saat bermain')}
                    value={muted ? 0 : Math.round(soundVolume * 100)}
                    onChange={(e) => changeSoundVolume(Number(e.target.value) / 100)}
                    className="h-2 flex-1 cursor-pointer accent-emerald-400"
                  />
                </div>

                <div className="mt-2 grid grid-cols-5 gap-1">
                  {[0, 0.25, 0.5, 0.75, 1].map((preset) => {
                    const activePreset = (muted ? 0 : Math.round(soundVolume * 100)) === Math.round(preset * 100);
                    return (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => changeSoundVolume(preset)}
                        className={`rounded-lg border py-1 text-[9.5px] font-black transition active:scale-95 ${
                          activePreset
                            ? 'border-emerald-300 bg-emerald-400/25 text-emerald-100'
                            : 'border-white/10 bg-white/[0.04] text-white/70 hover:bg-white/10'
                        }`}
                      >
                        {preset === 0 ? tr(language, 'MATI') : `${Math.round(preset * 100)}%`}
                      </button>
                    );
                  })}
                </div>
                <MusicAmbientControl enabled={studioSound.music} onToggle={toggleBackgroundMusic} />
              </div>

              {/* Game Speed Selector */}
              <div className="mb-4 rounded-2xl border border-white/15 bg-white/[0.04] p-3">
                <div className="text-center text-[11px] font-black tracking-[0.18em] text-amber-200">
                  ⚡ KECEPATAN GAME
                </div>
                <div className="mt-2 grid grid-cols-4 gap-1.5">
                  {SGA_SPEED_OPTIONS.map((spd) => (
                    <button
                      key={spd}
                      type="button"
                      aria-pressed={gameSpeed === spd}
                      onClick={() => {
                        setGameSpeed(spd);
                          }}
                      className={`rounded-xl border px-1 py-2 text-center transition active:scale-95 ${
                        gameSpeed === spd
                          ? 'border-amber-300/90 bg-amber-400/25 text-amber-200 shadow-[0_0_14px_rgba(251,191,36,.3)]'
                          : 'border-white/10 bg-white/[.04] text-white/80 hover:bg-white/10'
                      }`}
                    >
                      <span className="block text-xs font-black tracking-wide">{formatSgaSpeed(spd)}</span>
                      <span className="mt-0.5 block text-[8px] font-bold tracking-wider text-white/60">
                        {spd === 1 ? 'NORMAL' : 'TURBO'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Resume & Back to Menu Actions */}
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    studioSfx.subExit(0);
                    setInGameSettingsOpen(false);
                  }}
                  className="w-full rounded-2xl border border-emerald-200/40 border-b-4 border-b-emerald-800 bg-gradient-to-b from-[#22c55e] via-[#16a34a] to-[#15803d] py-3 text-base font-black tracking-wider text-white shadow-[0_10px_24px_rgba(34,197,94,0.45)] transition hover:brightness-110 active:translate-y-0.5"
                >
                  ▶ LANJUTKAN MAIN
                </button>
                <button
                  type="button"
                  onClick={() => {
                    goToMainMenuFromPlay();
                  }}
                  className="w-full rounded-2xl border border-white/20 bg-white/10 py-2.5 text-sm font-black tracking-wider text-white/95 transition hover:bg-white/20 active:scale-[0.98]"
                >
                  🏠 KE MENU UTAMA
                </button>
              </div>
            </section>
          </div>
        )}
        {screen === 'menu' && arsenalOpen && (
          <Overlay><Arsenal
            current={weapon}
            highestLevel={bestLevel}
            totalCoins={totalCoins}
            diamonds={diamonds}
            refreshKey={cheatNonce}
            onBuyRare={buyRareWeapon}
            onUnlockAll={unlockAllAffordableWeapons}
            onPick={chooseWeapon}
            onClose={() => startArsenalTransition(false)}
          /></Overlay>
        )}

        {screen === 'menu' && questOpen && (
          <Overlay><QuestModal
            state={questState}
            ownedCount={ownedWeaponIds().length}
            coins={totalCoins}
            diamonds={diamonds}
            onClaim={handleClaimQuest}
            onClaimMilestone={handleClaimMilestone}
            onClose={closeQuestPage}
            leaving={questLeaving}
          /></Overlay>
        )}

        {/* Kado peti milestone di halaman reward: adegan buka kado yang sama
            dengan stage bonus boss, bukan peti yang langsung berubah sendiri. */}
        {milestoneGift && (() => {
          const rewardWeapon = milestoneGift.weaponId ? getWeapon(milestoneGift.weaponId) : null;
          return (
            <Overlay><GiftBoxScene
              badge="★ REWARD MILESTONE ★"
              headline={`MILESTONE ${milestoneGift.count}!`}
              hint={tr(language, '🎁 Peti hadiah milestone siap dibuka!')}
              weapon={rewardWeapon ?? undefined}
              coins={milestoneGift.coins}
              claimLabel={tr(language, rewardWeapon ? 'PAKAI & LANJUT ➜' : 'AMBIL HADIAH ➜')}
              declineLabel={rewardWeapon ? tr(language, 'Lanjut tanpa ganti senjata') : undefined}
              onClaim={(equip) => takeMilestoneGift(equip)}
            /></Overlay>
          );
        })()}

        {screen === 'menu' && leaderboardOpen && (
          <Overlay><RankBoardPage
            leaving={leaderboardLeaving}
            stats={{ stage: bestLevel, score: best, coins: totalCoins }}
            rivals={leaderboardRivals}
            subtitle={tr(language, 'TOP RUNS · OFFLINE')}
            // Landscape: podium/tabs kiri, daftar peringkat kanan (tidak terpotong).
            landscape={menuLandscape}
            onBack={closeLeaderboardPage}
          /></Overlay>
        )}

        {/* BOSS DEFEATED Modal Celebration (Exact Screenshot 2!) */}
        {bossDefeatedData && (
          <Overlay><BossDefeatedModal
            bossName={bossDefeatedData.name}
            bossHead={bossDefeatedData.bossHead}
            stage={bossDefeatedData.level}
            rewardCoins={bossDefeatedData.coins}
            playerLevel={bossDefeatedData.playerLevel}
            xpBefore={bossDefeatedData.xpBefore}
            xpProgress={bossDefeatedData.xpProgress}
            xpGained={bossDefeatedData.xpGained}
            leveledUp={bossDefeatedData.leveledUp}
            onContinue={handleContinueAfterBoss}
          /></Overlay>
        )}

        {/* PILIHAN POWER UP DARI BINTANG */}
        {starBuffOpen && (
          <Overlay><StarBuffModal
            treasure={starBuffTreasure}
            onPick={(kind) => {
              gameRef.current?.applyBuff(kind);
              setStarBuffOpen(false);
            }}
          /></Overlay>
        )}

        {/* BONUS STAGE: KOTAK HADIAH ala Knife Boss 100 Lv — efek kotak + senjata baru Gun Hit */}
        {bonusStageOpen && (
          <Overlay><BossGiftBoxModal
            bossName={bonusAfterBoss.bossName}
            stage={bonusAfterBoss.stage}
            currentWeaponId={weapon}
            onClaim={handleGiftBoxClaim}
          /></Overlay>
        )}

        {/* Game Over Screen — portrait memakai kartu besar, landscape versi
            ringkas dua kolom supaya semuanya muat di layar 760x420. */}
        {screen === 'over' && (
          <div className="absolute inset-0 z-30 flex items-center justify-center overflow-hidden bg-black/80 px-6 text-white backdrop-blur-lg">
            {menuLandscape ? (
              <div className="pop-in flex w-full max-w-[640px] items-center gap-4">
                {/* kiri: judul, stage, tombol */}
                <div className="flex w-[45%] shrink-0 flex-col items-center text-center">
                  <div className="font-game text-[38px] font-black italic leading-none tracking-wider text-red-500 drop-shadow-[0_4px_0_#991b1b]">
                    GAME OVER
                  </div>
                  <div className="mt-1 font-game text-[13px] font-bold text-white/80">
                    Bertahan hingga <span className="font-black text-amber-300">STAGE {result.level}</span>
                  </div>
                  <button
                    onClick={play}
                    className="pulse-btn mt-3 w-full rounded-xl border-b-4 border-emerald-800 bg-gradient-to-b from-[#22c55e] via-[#16a34a] to-[#15803d] py-2.5 font-game text-xl font-black text-white shadow-[0_10px_22px_rgba(34,197,94,0.45)] transition active:translate-y-1 active:border-b-0 hover:brightness-110"
                  >
                    ↻ MAIN LAGI
                  </button>
                  <button
                    onClick={goToMainMenuFromPlay}
                    className="mt-2 w-full rounded-xl border-2 border-white/20 bg-white/15 py-2 font-game text-sm font-black text-white shadow-lg transition hover:bg-white/25 active:scale-95"
                  >
                    🏠 MENU UTAMA
                  </button>
                </div>
                {/* kanan: kartu skor kaca */}
                <div className="flex min-w-0 flex-1 flex-col items-center rounded-2xl border-2 border-white/20 bg-white/10 px-4 py-3 text-center shadow-[0_16px_40px_rgba(0,0,0,0.75)] backdrop-blur-xl">
                  <div className="font-game text-[11px] font-black tracking-[0.25em] text-white/60">{tr(language, 'SKOR AKHIR')}</div>
                  <div className="my-1 font-game text-[54px] font-black leading-none text-white drop-shadow-[0_6px_14px_rgba(255,255,255,0.3)]">
                    {displayScore}
                  </div>
                  {result.newBest && (
                    <div className="float-y rounded-full bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-300 px-4 py-0.5 font-game text-[11px] font-black text-black shadow-[0_0_12px_#fde047]">
                      ⭐ REKOR TERBARU! ⭐
                    </div>
                  )}
                  <div className="mt-2 grid w-full grid-cols-2 gap-2 border-t-2 border-white/15 pt-2">
                    <div className="rounded-xl border-2 border-white/15 bg-black/60 px-2 py-1.5 shadow-inner">
                      <div className="font-game text-[10px] font-black tracking-wider text-white/50">{tr(language, 'REKOR TERBAIK')}</div>
                      <div className="mt-0.5 font-mono text-xl font-black text-amber-300 drop-shadow">{best}</div>
                    </div>
                    <div className="rounded-xl border-2 border-white/15 bg-black/60 px-2 py-1.5 shadow-inner">
                      <div className="font-game text-[10px] font-black tracking-wider text-white/50">{tr(language, 'DAPAT KOIN')}</div>
                      <div className="mt-0.5 flex items-center justify-center gap-1 font-mono text-xl font-black text-amber-300 drop-shadow"><span>+{result.coins}</span><CoinSprite size={20} /></div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="pop-in flex max-h-full w-full max-w-sm flex-col items-center overflow-y-auto">
                {/* Header — besar tapi tetap muat satu layar */}
                <div className="text-5xl sm:text-6xl font-black italic tracking-wider text-red-500 drop-shadow-[0_6px_0_#991b1b] font-game leading-none">
                  GAME OVER
                </div>
                <div className="mt-1.5 text-sm sm:text-base font-bold text-white/80 font-game">
                  Bertahan hingga <span className="font-black text-amber-300">STAGE {result.level}</span>
                </div>

                {/* Glassmorphism Card DIBESARKAN & TEKS 2X */}
                <div className="mt-4 w-full rounded-3xl border-2 border-white/20 bg-white/10 p-5 text-center shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-xl">
                  <div className="text-xs font-black tracking-[0.25em] text-white/60 font-game">{tr(language, 'SKOR AKHIR')}</div>

                  {/* Score Counter Roll-up (Besar & Bergetar) */}
                  <div className="text-7xl sm:text-8xl font-black leading-none my-1.5 font-game text-white filter drop-shadow-[0_8px_16px_rgba(255,255,255,0.3)] animate-pulse">
                    {displayScore}
                  </div>

                  {result.newBest && (
                    <div className="float-y mx-auto mt-1.5 mb-0.5 inline-block rounded-full bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-300 px-4 py-1 text-xs font-black text-black shadow-[0_0_15px_#fde047] font-game">
                      ⭐ REKOR TERBARU! ⭐
                    </div>
                  )}

                  {/* Stat Grid (Teks Diperbesar 2x) */}
                  <div className="mt-4 grid grid-cols-2 gap-2.5 border-t-2 border-white/15 pt-3">
                    <div className="rounded-2xl border-2 border-white/15 bg-black/60 px-2 py-2.5 shadow-inner">
                      <div className="text-[10px] font-black tracking-wider text-white/50 font-game">{tr(language, 'REKOR TERBAIK')}</div>
                      <div className="text-2xl font-black text-amber-300 font-mono mt-0.5 drop-shadow">{best}</div>
                    </div>
                    <div className="rounded-2xl border-2 border-white/15 bg-black/60 px-2 py-2.5 shadow-inner">
                      <div className="text-[10px] font-black tracking-wider text-white/50 font-game">{tr(language, 'DAPAT KOIN')}</div>
                      <div className="mt-0.5 flex items-center justify-center gap-1 text-2xl font-black text-amber-300 font-mono drop-shadow"><span>+{result.coins}</span><CoinSprite size={24} /></div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons: DIBESARKAN & TEBAL */}
                <button
                  onClick={play}
                  className="pulse-btn mt-4 w-full rounded-2xl border-b-4 border-emerald-800 bg-gradient-to-b from-[#22c55e] via-[#16a34a] to-[#15803d] py-3.5 text-2xl font-black text-white shadow-[0_12px_28px_rgba(34,197,94,0.5)] transition active:translate-y-1 active:border-b-0 font-game hover:brightness-110"
                >
                  ↻ MAIN LAGI
                </button>

                <button
                  onClick={goToMainMenuFromPlay}
                  className="mt-2.5 w-full rounded-2xl border-2 border-white/20 bg-white/15 py-2.5 text-sm sm:text-base font-black text-white transition hover:bg-white/25 active:scale-95 font-game shadow-lg"
                >
                  🏠 MENU UTAMA
                </button>
              </div>
            )}
          </div>
        )}
        {menuPageTransition && (
          <TransitionOverlay
            phase={menuPageTransition.phase}
            origin={{ x: 50, y: 50 }}
            label={menuPageTransition.label}
            variant={menuPageTransition.variant}
            rate={menuPageTransition.rate}
          />
        )}
        {playTransition && (
          <TransitionOverlay phase={playTransition.phase} origin={playTransition.origin} label={playTransition.label} variant="scope" lens={playTransition.lens} />
        )}
        {weaponFlight && <Overlay><SgaWeaponFlight key={weaponFlight.id} flight={weaponFlight} /></Overlay>}
      </div>
    </div>
  );
}
