import { rarityLabel, tr, trId } from '../../../i18n/strings';
import { useLanguage } from '../../../i18n/useLanguage';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Check, Crosshair, Crown, Download, Flame, Gem, LockKeyhole, MoreHorizontal, Palette, Shield, Skull, Star, Zap } from 'lucide-react';
import CoinSprite from '../../shared/CoinSprite';
import DiamondSprite from '../../shared/DiamondSprite';
import { WEAPONS, getWeapon, RARITY_COLOR, type WeaponId, type Weapon } from '../game/weapons';
import { BOSS_CATALOG, type BossProfile } from '../game/bossCatalog';
import { HeadArt } from '../../perfect-shot/play/HeadArt';
import { drawBossProjectile } from '../game/bossProjectileArt';
import { drawGunCentered } from '../game/art/drawCentered';
import { getGunMetrics } from '../game/art/metrics';
import { sfx } from '../game/audio';
import { sfx4 } from '../game/sfx4';
import { useSlideActive } from '../../shared/SlideActivity';
import { SunburstFX } from './Effects';
import { getSavedSgaSpeed } from '../game/gameSpeed';
import { isLandscape } from '../game/orientation';
import { useSgaOrientation } from '../utils/useSgaOrientation';
import { getFast2DContext, getOptimalCanvasDpr } from '../utils/mobilePerf';
import ZipWeaponArt from './ZipWeaponArt';
import { hasZipArt } from '../zipWeapons/ids';
import {
  UNIQUE_EDITABLE_WEAPONS,
  getGunVariant,
  setGunVariant,
  getGunEffect,
  setGunEffect,
  getGunSkinAndEffectPosition,
  canChooseGunDesign,
  markGunDefault,
  unmarkGunDefault,
  isGunDefaultMarked,
  isCurrentSelectionMarkedDefault,
  getWeaponDefaultExportEntries,
  hasSlide7Update,
  slide7UpdateSet,
  hasSlide9Update,
  hasSlide11Update,
  hasSlide6Update,
  type EditableWeapon,
  type GunVariant,
} from '../game/art/gunVariants';
import GunVariantPicker from './GunVariantPicker';
import DefaultExportModal from './DefaultExportModal';
import { SHOP_IN, SHOP_OUT } from '../../perfect-shot/shop/timeline';
// The shared motion/art stylesheet is imported once by src/main.tsx so it is
// part of the startup CSS; importing it here too would push it into the lazy
// chunk and reorder it against src/index.css.

type Tab = 'ALL' | 'DESAIN' | 'EPIC' | 'LANGKA' | 'LEGENDARIS' | 'UMUM' | 'BOSS';

interface ArsenalProps {
  current: WeaponId;
  highestLevel: number;
  totalCoins: number;
  diamonds: number;
  /** Naik saat cheat key C dipakai — memaksa sinkron ulang koleksi dari localStorage. */
  refreshKey: number;
  onBuyRare: (id: WeaponId) => boolean;
  onUnlockAll: () => WeaponId[];
  onPick: (id: WeaponId) => void;
  onClose: () => void;
}

// -------------------------------------------------------------
// Gun Render: 100% PERFECT CENTER PIVOT, 30% BIGGER & ZERO CROP!
// -------------------------------------------------------------
function GunItemCanvas({ weapon, isSelected, variant, size = 110, eager = false }: { weapon: Weapon; isSelected: boolean; variant: GunVariant; size?: number; eager?: boolean }) {
  const active = useSlideActive();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  /**
   * The catalogue holds 90 weapons, so mounting the page used to allocate 90
   * canvas surfaces and paint 90 pieces of vector gun art before the first frame
   * landed — measured at 134 ms of drawing alone, before React and GPU uploads.
   * Cards are only painted once they are near the scroll viewport (the one
   * IntersectionObserver clips to the arsenal's own scroll box), so opening the
   * page paints the nine cards a player can actually see and every other card
   * paints itself the moment it is scrolled into view.
   */
  // The first screenful paints in the same commit as the page, so the catalogue
  // never flashes empty; everything below the fold waits for the observer.
  const [painted, setPainted] = useState(eager);
  const visible = painted || isSelected;

  useEffect(() => {
    if (visible) return;
    const cv = canvasRef.current;
    if (!cv || typeof IntersectionObserver === 'undefined') {
      setPainted(true);
      return;
    }
    const io = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      setPainted(true);
      io.disconnect();
    }, { rootMargin: '320px 0px' });
    io.observe(cv);
    return () => io.disconnect();
  }, [visible]);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv || !visible) return;
    const dpr = getOptimalCanvasDpr(2);
    cv.width = Math.round(size * dpr);
    cv.height = Math.round(size * dpr);
    const ctx = getFast2DContext(cv);
    if (!ctx) return;

    let raf = 0;
    const start = performance.now();
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)');

    const loop = (now: number) => {
      const t = reducedMotion?.matches ? 0 : ((now - start) / 1000) * getSavedSgaSpeed();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, size, size);

      ctx.save();
      // True geometric center pivot
      ctx.translate(size / 2, size / 2);

      // Alive dynamic sway animation (tidak diam saja!)
      const sway = Math.sin(t * 2.8 + (weapon.previewLen || 180)) * 0.045;
      const selectPulse = isSelected ? Math.sin(t * 5) * 0.03 : 0;
      ctx.rotate(Math.PI / 4 + sway + selectPulse);

      // 30% LEBIH BESAR + 100% ZERO CROP FORMULA:
      // Weapon span is the true diagonal length of the gun
      const m = getGunMetrics(weapon.id, variant);
      const span = Math.max(m.span, 130);
      // Scale: 30% bigger than standard while safely fitting inside the 110px canvas
      const scale = (size * 0.92) / span;
      ctx.scale(scale, scale);

      // drawGunCentered places the true mass center precisely at (0, 0)!
      drawGunCentered(ctx, weapon.id, t, 0, true, variant, true);

      ctx.restore();

      // Eleven static thumbnails and just one animated selection: no grid of
      // twelve simultaneous canvas loops while browsing the arsenal.
      if (active && isSelected && !reducedMotion?.matches) raf = requestAnimationFrame(loop);
    };

    const onMotionChange = () => { cancelAnimationFrame(raf); loop(performance.now()); };
    reducedMotion?.addEventListener?.('change', onMotionChange);
    loop(start);
    return () => { cancelAnimationFrame(raf); reducedMotion?.removeEventListener?.('change', onMotionChange); };
  }, [weapon.id, size, isSelected, active, variant, visible]);

  if (hasZipArt(weapon.id) && variant === 'zip') {
    // On its "Skin 3" card the zip's weapons are live SVG (their glow keeps
    // animating), shown at the same 45° the canvas thumbnails are drawn at.
    // Every other card is ordinary canvas art, so the picked design shows.
    return (
      <div style={{ width: size, height: size, position: 'relative' }} className="pointer-events-none overflow-visible">
        <div className="absolute inset-0" style={{ transform: 'rotate(45deg)' }}>
          <ZipWeaponArt id={weapon.id} height={size * 0.92} anchor="center" />
        </div>
      </div>
    );
  }
  return (
    <canvas
      ref={canvasRef}
      style={{ width: size, height: size }}
      className="block pointer-events-none"
    />
  );
}

// -------------------------------------------------------------
// Top Spotlight Preview with Sunburst Rays
// -------------------------------------------------------------
function SpotlightGun({ weapon, variant, box }: { weapon: Weapon; variant: GunVariant; box: { w: number; h: number } }) {
  const active = useSlideActive();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const dpr = getOptimalCanvasDpr(2);
    const { w, h } = box;
    if (w < 2 || h < 2) return;
    cv.width = Math.round(w * dpr);
    cv.height = Math.round(h * dpr);
    const ctx = getFast2DContext(cv);
    if (!ctx) return;

    let raf = 0;
    const start = performance.now();
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)');

    const loop = (now: number) => {
      const t = reducedMotion?.matches ? 0 : ((now - start) / 1000) * getSavedSgaSpeed();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      ctx.save();
      ctx.translate(w / 2, h / 2 - 4);

      ctx.rotate(Math.PI / 4 + Math.sin(t * 2.2) * 0.05);

      const m = getGunMetrics(weapon.id, variant);
      const span = Math.max(m.span, 130);
      // 0.98 of the showcase height: the pose reads as large as the reference
      // and still scales down with the pane on small screens.
      const scale = (h * 0.98) / span;
      ctx.scale(scale, scale);

      drawGunCentered(ctx, weapon.id, t, 0, true, variant, true);
      ctx.restore();

      if (active && !reducedMotion?.matches) raf = requestAnimationFrame(loop);
    };

    const onMotionChange = () => { cancelAnimationFrame(raf); loop(performance.now()); };
    reducedMotion?.addEventListener?.('change', onMotionChange);
    loop(start);
    return () => { cancelAnimationFrame(raf); reducedMotion?.removeEventListener?.('change', onMotionChange); };
  }, [weapon.id, active, variant, box.w, box.h]);

  if (hasZipArt(weapon.id) && variant === 'zip') {
    return (
      <div style={{ width: box.w, height: box.h, position: 'relative' }} className="pointer-events-none overflow-visible">
        <div className="absolute inset-0" style={{ transform: 'rotate(45deg)' }}>
          <ZipWeaponArt id={weapon.id} height={box.h * 0.92} anchor="center" />
        </div>
      </div>
    );
  }
  return (
    <canvas
      ref={canvasRef}
      style={{ width: box.w, height: box.h }}
      className="pointer-events-none block max-w-full filter drop-shadow-[0_12px_28px_rgba(255,255,255,0.45)]"
    />
  );
}

/** Same rarity chips the reference plate uses. */
const RARITY_CHIP: Record<Weapon['rarity'], string> = {
  UMUM: 'bg-[#c9ced6] text-[#2b3038]',
  LANGKA: 'bg-[#3b82f6] text-white',
  EPIC: 'bg-[#a855f7] text-white',
  LEGENDARIS: 'bg-gradient-to-b from-[#ffd23f] to-[#f59e0b] text-[#3a2400]',
};

function RarityIconForWeapon({ rarity }: { rarity: Weapon['rarity'] }) {
  const Icon = rarity === 'UMUM' ? Shield : rarity === 'LANGKA' ? Gem : rarity === 'EPIC' ? Zap : Flame;
  return <Icon className="h-3 w-3" />;
}

/**
 * The boss roster of Game A *is* the boss roster of Game B: eleven heads, in
 * Perfect Shot's order, one catalog entry per stage-5 boss (5, 10, … 55).
 * There is no Game A boss to merge a legacy profile into.
 */
type CatalogBoss = BossProfile & { stage: number };
const GAME_B_BOSSES: CatalogBoss[] = BOSS_CATALOG.map((boss, index) => ({
  ...boss,
  stage: (index + 1) * 5,
}));

function BossAttackPreview({ boss }: { boss: CatalogBoss }) {
  const [language] = useLanguage();
  const active = useSlideActive();
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !active) return;
    const W = 160, H = 96;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    const start = performance.now();
    const draw = (now: number) => {
      const t = ((now - start) / 1000) * getSavedSgaSpeed();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = 'rgba(5,9,22,.92)';
      ctx.beginPath(); ctx.roundRect(0, 0, W, H, 12); ctx.fill();
      ctx.strokeStyle = `${boss.accent}88`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Mini firing loop: boss portrait, weapon projectile, and its real in-game trail.

      const phase = t % 1.55;
      if (phase < 1.02) {
        const x = 72 + phase * 45;
        drawBossProjectile(ctx, {
          x,
          y: 48 + Math.sin(t * 7) * 1.5,
          vx: 180,
          vy: 0,
          rot: -Math.PI / 2,
          type: boss.family,
          head: boss.head,
        }, t, 0.56);
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [active, boss.id, boss.accent]);

  return <div className="relative h-24 w-40 shrink-0"><canvas ref={ref} aria-label={`${tr(language, 'Demo serangan ')}${trId(language, boss.name)}`} className="h-24 w-40 rounded-xl" /><div className="pointer-events-none absolute left-[10px] top-[31px] h-[34px] w-[34px]"><HeadArt kind={boss.head} className="h-full w-full" /></div></div>;
}

export default function Arsenal({
  current,
  highestLevel,
  totalCoins,
  diamonds,
  refreshKey,
  onBuyRare,
  onUnlockAll,
  onPick,
  onClose,
}: ArsenalProps) {
  const [language] = useLanguage();
  const [tab, setTab] = useState<Tab>('ALL');
  const [grid, setGrid] = useState<{ phase: 'in' | 'out'; key: number }>({ phase: 'in', key: 0 });
  const gridBusyRef = useRef(false);
  const gridTimerRef = useRef<number | undefined>(undefined);
  const [selectedGunId, setSelectedGunId] = useState<WeaponId>(current);
  const [heroKey, setHeroKey] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [useRandom, setUseRandom] = useState(false);
  const [ownedRare, setOwnedRare] = useState<string[]>(() => {
    try {
      const ids = JSON.parse(localStorage.getItem('gunhit_rare_owned') || '[]');
      return Array.isArray(ids) ? ids.filter((id): id is string => typeof id === 'string') : [];
    } catch { return []; }
  });
  const [editingDesign, setEditingDesign] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showTools, setShowTools] = useState(false);
  const [, setDesignRevision] = useState(0);
  const [selectedBoss, setSelectedBoss] = useState<CatalogBoss>(GAME_B_BOSSES[0]);
  const [bulkUnlockMessage, setBulkUnlockMessage] = useState('');
  const gridRef = useRef<HTMLDivElement>(null);
  // The showcase strip is measured once and handed to the canvas, so the hero
  // pose is drawn at the strip's own size on every screen.
  const heroSectionRef = useRef<HTMLElement>(null);
  const [heroBox, setHeroBox] = useState({ w: 380, h: 180 });

  /**
   * Armory in landscape.
   *
   * The page is a vertical stack (header → showcase → name plate → tabs →
   * catalog). In the 760x420 landscape frame that stack leaves the catalog with
   * almost no height, so landscape instead lays the same blocks out in two
   * columns, exactly like the reference armory screen: the showcase, name plate
   * and palette button own the LEFT column, while the seven rarity tabs and the
   * scrollable catalog own the RIGHT column. DOM order, keys and every entrance
   * class stay unchanged — only the grid placement and a few paddings differ.
   */
  const [orientation] = useSgaOrientation();
  const landscape = isLandscape(orientation);
  const area = (name: 'head' | 'hero' | 'tabs' | 'panel' | 'plate' | 'buy'): CSSProperties =>
    landscape ? { gridArea: name } : {};
  const withArea = (motion: { className: string; style: CSSProperties }, name: Parameters<typeof area>[0]) => ({
    ...motion,
    style: { ...motion.style, ...area(name) },
  });
  const armoryGridStyle: CSSProperties = landscape
    ? {
        display: 'grid',
        gridTemplateColumns: 'minmax(0,43fr) minmax(0,57fr)',
        gridTemplateRows: 'auto auto minmax(0,1fr) auto auto',
        gridTemplateAreas: '"head head" "hero tabs" "hero panel" "plate panel" "buy panel"',
        columnGap: '8px',
      }
    : {};

  useEffect(() => {
    const el = heroSectionRef.current;
    if (!el) return;
    const measure = () => {
      // clientWidth/clientHeight, not getBoundingClientRect: the whole game is
      // drawn inside ScaledFrame, whose CSS transform scales every rect by the
      // fit factor. Measuring the transformed rect and then applying it as the
      // canvas' own CSS size made the showcase as many times too big as the
      // frame was scaled — on a wide window the gun spilled over the ARMORY
      // header (and on a small phone it shrank). Layout pixels are what the
      // canvas needs.
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (w > 2 && h > 2) {
        setHeroBox((prev) => (Math.abs(prev.w - w) < 1 && Math.abs(prev.h - h) < 1 ? prev : { w: Math.round(w), h: Math.round(h) }));
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => { if (gridRef.current) gridRef.current.scrollTop = 0; }, [tab]);

  useEffect(() => () => {
    if (gridTimerRef.current !== undefined) window.clearTimeout(gridTimerRef.current);
  }, []);

  const requestClose = () => {
    if (leaving) return;
    setLeaving(true);
    // Let the parent coordinate the steel shutter with SHOP_OUT's last frame.
    onClose();
  };
  const A = (inCls: string, entering: { d: number; dur: number }, outCls: string, exiting: { d: number; dur: number }, extra = '') => ({
    className: `a ${leaving ? outCls : inCls} ${extra}`,
    style: {
      '--d': `${leaving ? exiting.d : entering.d}ms`,
      '--dur': `${leaving ? exiting.dur : entering.dur}ms`,
    } as CSSProperties,
  });
  const changeTab = (next: Tab) => {
    if (next === tab || gridBusyRef.current || leaving) return;
    gridBusyRef.current = true;
    sfx.unlock();
    setGrid((current) => ({ ...current, phase: 'out' }));
    gridTimerRef.current = window.setTimeout(() => {
      setTab(next);
      setGrid((current) => ({ phase: 'in', key: current.key + 1 }));
      gridTimerRef.current = window.setTimeout(() => { gridBusyRef.current = false; }, 450);
    }, 280);
  };

  const cardMotion = (i: number) => {
    const col = i % 3;
    const k = Math.min(i, 11);
    const vars = {
      '--cx': `${(1 - col) * 105}%`,
      '--cr': `${(col - 1) * -24}deg`,
      '--ox': `${(col - 1) * 60}%`,
      '--or': `${(col - 1) * 30 + (i < 3 ? -10 : 10)}deg`,
    };
    if (leaving) {
      if (i > 8) return { className: 'a out-fade', style: { ...vars, '--d': '0ms', '--dur': '250ms' } as CSSProperties };
      const t = SHOP_OUT.card(Math.min(5, i));
      return { className: 'a sh-card-out', style: { ...vars, '--d': `${t.d}ms`, '--dur': `${t.dur}ms` } as CSSProperties };
    }
    if (grid.phase === 'out') {
      return { className: 'a sh-card-flipout', style: { ...vars, '--d': `${k * 15}ms`, '--dur': '240ms' } as CSSProperties };
    }
    if (grid.key === 0) {
      if (i > 8) {
        const t = SHOP_IN.card(9);
        return { className: 'a in-fade', style: { ...vars, '--d': `${t.d}ms`, '--dur': '500ms' } as CSSProperties };
      }
      const t = SHOP_IN.card(i);
      return { className: 'a sh-card-in', style: { ...vars, '--d': `${t.d}ms`, '--dur': `${t.dur}ms` } as CSSProperties };
    }
    if (i > 11) return { className: 'a in-fade', style: { ...vars, '--d': '300ms', '--dur': '400ms' } as CSSProperties };
    return { className: 'a sh-card-in', style: { ...vars, '--d': `${k * 45}ms`, '--dur': '520ms' } as CSSProperties };
  };

  // Cheat key C menulis langsung ke localStorage; sinkron ulang koleksi
  // LANGKA supaya gembok hilang seketika meski Arsenal sedang terbuka.
  useEffect(() => {
    if (refreshKey === 0) return;
    try {
      const ids = JSON.parse(localStorage.getItem('gunhit_rare_owned') || '[]');
      setOwnedRare(Array.isArray(ids) ? ids.filter((id): id is string => typeof id === 'string') : []);
    } catch { /* collection save is optional */ }
  }, [refreshKey]);

  useEffect(() => {
    const handleSpace = (event: KeyboardEvent) => {
      if (leaving || event.code !== 'Space') return;
      // Consume Space only while Arsenal is mounted, so it never leaks into gameplay fire.
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      if (event.repeat) return;

      const allRare = WEAPONS.filter(w => w.rarity === 'LANGKA');
      const remaining = allRare.filter(w => !ownedRare.includes(w.id));
      if (remaining.length === 0) {
        setBulkUnlockMessage(tr(language, 'Semua senjata LANGKA sudah dibeli.'));
        return;
      }
      const purchased = onUnlockAll();
      if (purchased.length) {
        setOwnedRare(ids => [...new Set([...ids, ...purchased])]);
        const stillLocked = remaining.length - purchased.length;
        setBulkUnlockMessage(stillLocked
          ? `${purchased.length}${tr(language, ' dibeli · ')}${stillLocked}${tr(language, ' masih terkunci. Per senjata: 500 diamond.')}`
          : `${tr(language, 'Semua ')}${allRare.length}${tr(language, ' senjata LANGKA terbuka · biaya 500 diamond per senjata.')}`);
      } else {
        setBulkUnlockMessage(tr(language, 'Diamond belum cukup. Senjata LANGKA berharga 500 diamond masing-masing.'));
      }
    };
    window.addEventListener('keydown', handleSpace, true);
    return () => window.removeEventListener('keydown', handleSpace, true);
  }, [onUnlockAll, ownedRare, leaving]);

  const selectedGun = getWeapon(selectedGunId);
  const selectedVariant = getGunVariant(selectedGunId);
  const isLocked = (w: Weapon) => w.rarity === 'LANGKA' && !ownedRare.includes(w.id);
  const selectedLocked = isLocked(selectedGun);
  const editableCatalogIds: EditableWeapon[] = WEAPONS
    .map((w) => w.id)
    .filter((id): id is EditableWeapon => canChooseGunDesign(id));
  const stepIds = editableCatalogIds.length > 0 ? editableCatalogIds : [...UNIQUE_EDITABLE_WEAPONS];
  const exportableCount = getWeaponDefaultExportEntries('marked_or_changed', WEAPONS).length;
  // The showcase lands the gun at the same beat as the reference, so the white
  // flash and dust fire exactly where it touches down.
  const heroLand = heroKey === 0 ? SHOP_IN.hero.d + SHOP_IN.hero.dur * SHOP_IN.hero.land : 120 + 620 * 0.55;
  const selectedPos = canChooseGunDesign(selectedGunId)
    ? getGunSkinAndEffectPosition(selectedGunId, selectedVariant, getGunEffect(selectedGunId))
    : null;

  const stepEditableWeapon = (delta: -1 | 1) => {
    if (!stepIds.length) return;
    const idx = stepIds.indexOf(selectedGunId as EditableWeapon);
    const nextIdx = idx < 0 ? 0 : (idx + delta + stepIds.length) % stepIds.length;
    const nextId = stepIds[nextIdx];
    const nextWeapon = getWeapon(nextId);
    setSelectedGunId(nextId);
    setHeroKey((key) => key + 1);
    if (!isLocked(nextWeapon)) onPick(nextId);
    sfx.unlock();
  };

  // Filter weapons
  const filteredWeapons = WEAPONS.filter((w) => {
    if (tab === 'ALL') return true;
    if (tab === 'DESAIN') return canChooseGunDesign(w.id);
    if (tab === 'EPIC') return w.rarity === 'EPIC';
    if (tab === 'LANGKA') return w.rarity === 'LANGKA';
    if (tab === 'LEGENDARIS') return w.rarity === 'LEGENDARIS';
    if (tab === 'UMUM') return w.rarity === 'UMUM';
    return true;
  });

  const unlockedCount = WEAPONS.filter((w) => !isLocked(w)).length;
  const unlockPercent = Math.round((unlockedCount / Math.max(1, WEAPONS.length)) * 100);

  const handleSelectGun = (w: Weapon) => {
    setSelectedGunId(w.id);
    setHeroKey((key) => key + 1);
    if (isLocked(w)) return;
    onPick(w.id);
    sfx.unlock();
    sfx4.match();
  };

  const handleRandomToggle = () => {
    const next = !useRandom;
    setUseRandom(next);
    if (next) {
      const available = WEAPONS.filter((w) => !isLocked(w));
      const randW = available[Math.floor(Math.random() * available.length)];
      handleSelectGun(randW);
    }
  };

  const RarityIcon = selectedGun.rarity === 'UMUM' ? Shield : selectedGun.rarity === 'LANGKA' ? Gem : selectedGun.rarity === 'EPIC' ? Zap : Flame;
  const rarityName = (rarity: Weapon['rarity']) => rarityLabel(rarity, language);
  const tabItems = [
    { id: 'ALL' as Tab, label: 'ALL', Icon: Crown, color: '#fde68a' },
    { id: 'UMUM' as Tab, label: 'UMUM', Icon: Shield, color: '#cbd5e1' },
    { id: 'LANGKA' as Tab, label: 'RARE', Icon: Gem, color: '#7dd3fc' },
    { id: 'EPIC' as Tab, label: 'EPIC', Icon: Zap, color: '#d8b4fe' },
    { id: 'LEGENDARIS' as Tab, label: 'LEGEND', Icon: Flame, color: '#fdba74' },
    { id: 'DESAIN' as Tab, label: 'SKIN', Icon: Palette, color: '#f9a8d4' },
    { id: 'BOSS' as Tab, label: 'BOSS', Icon: Skull, color: '#fca5a5' },
  ];
  const panelTitle = tab === 'ALL' ? tr(language, 'SEMUA SENJATA')
    : tab === 'DESAIN' ? 'CUSTOM SKINS'
    : tab === 'EPIC' ? tr(language, 'SENJATA EPIC')
    : tab === 'LANGKA' ? tr(language, 'SENJATA RARE')
    : tab === 'LEGENDARIS' ? tr(language, 'SENJATA LEGEND')
    : tab === 'UMUM' ? tr(language, 'SENJATA UMUM')
    : 'BOSS';

  return (
    <div aria-hidden={leaving} style={armoryGridStyle} className={`absolute inset-0 z-50 flex min-h-0 flex-col overflow-hidden px-3 pb-2.5 pt-3 font-game text-white select-none ${leaving ? 'arsenal-armory-closing pointer-events-none' : 'arsenal-armory-open'}`}>
      {/* Armory's purple night-sky palette and soft fireflies. */}
      <div {...A('sh-bg-in', SHOP_IN.bg, 'out-bg', SHOP_OUT.bg, 'pointer-events-none absolute inset-0 overflow-hidden')} aria-hidden="true">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#2b1f4d_0%,#1d1238_45%,#140b29_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_75%_32%_at_50%_18%,rgba(214,205,255,.34),rgba(120,100,200,.12)_52%,transparent_78%)]" />
        <div {...A('sh-spot-in', SHOP_IN.spot, 'out-fade', { d: 60, dur: 300 }, 'pointer-events-none absolute left-1/2 top-0 h-[46%] w-[86%] -translate-x-1/2 origin-top')}>
          <div className="h-full w-full" style={{ background: 'linear-gradient(180deg,rgba(255,255,255,.22),rgba(255,255,255,0) 85%)', clipPath: 'polygon(38% 0,62% 0,100% 100%,0 100%)', filter: 'blur(6px)' }} />
        </div>
        {Array.from({ length: 14 }).map((_, i) => (
          <span key={i} className="arsenal-firefly absolute rounded-full"
            style={{ left: `${(i * 37) % 100}%`, top: `${(i * 23) % 62}%`, width: 3 + (i % 3), height: 3 + (i % 3), animationDelay: `${-i * 0.63}s`, background: i % 4 === 0 ? '#7dd3fc' : '#c4b5fd' }} />
        ))}
      </div>

      {/* Header: same yellow back button, title/progress and coin + gem wallet. */}
      <header {...withArea(A('in-down', SHOP_IN.top(0), 'out-up', SHOP_OUT.top(0), 'relative z-20 flex shrink-0 items-center gap-2.5'), 'head')}>
        <button onClick={requestClose} disabled={leaving} aria-label="Kembali" className="press grid h-11 w-11 shrink-0 place-items-center rounded-2xl border-2 border-[#7a4b00] bg-gradient-to-b from-[#ffe27a] to-[#f59e0b] shadow-[0_4px_0_#7a4b00,inset_0_2px_0_rgba(255,255,255,.5)]">
          <svg viewBox="0 0 24 24" className="h-7 w-7"><path d="M11 4 L3 12 L11 20 V15 H21 V9 H11 Z" fill="#fff" stroke="#7a4b00" strokeWidth="1.8" strokeLinejoin="round" /></svg>
        </button>
        <div className="min-w-0 flex-1">
          <div className="font-arsenal-title truncate text-[22px] leading-none text-white [text-shadow:0_2px_0_#2a1650,0_0_14px_rgba(192,132,252,.55)]">ARMORY</div>
          <div className="mt-1 flex items-center gap-1 text-[10px] tracking-wide text-[#c4b5fd]">
            <Crosshair className="h-3.5 w-3.5 shrink-0" />
            <span className="font-arsenal-title whitespace-nowrap">{unlockedCount}/{WEAPONS.length}{tr(language, ' TERBUKA')}</span>
            <span className="h-1 w-10 overflow-hidden rounded-full bg-black/50"><span className="block h-full rounded-full bg-gradient-to-r from-[#c084fc] to-[#f0abfc]" style={{ width: `${unlockPercent}%` }} /></span>
            <button type="button" aria-label={tr(language, 'Alat Arsenal')} title={tr(language, 'Alat Arsenal')} onClick={() => setShowTools((open) => !open)} className="press grid h-5 w-5 shrink-0 place-items-center rounded-full bg-white/10 text-white/75"><MoreHorizontal className="h-4 w-4" /></button>
          </div>
        </div>
        {/* Wallet: same coin/diamond sizes and type scale as the main menu HUD
            (25/24 px art, text-xl / text-lg), so the currency never shrinks
            when the Armory opens. */}
        <div className="flex h-11 shrink-0 items-center gap-1.5 rounded-full border-2 border-white/10 bg-black/45 pl-2 pr-1 text-white shadow-inner">
          <CoinSprite size={25} className="drop-shadow-[0_0_5px_rgba(255,210,80,.7)]" />
          <span className="min-w-[34px] text-xl font-black tabular-nums leading-none">{totalCoins}</span>
          <span className="h-6 w-px bg-white/20" />
          <DiamondSprite size={24} />
          <span className="min-w-[26px] text-lg font-black tabular-nums leading-none">{diamonds}</span>
          <button onClick={() => sfx.coin()} aria-label={tr(language, 'Tambah mata uang')} className="press grid h-9 w-9 place-items-center rounded-full bg-gradient-to-b from-[#7c6cff] to-[#4b3bd6] text-xl leading-none shadow-[0_2px_0_#2a1f8a]">+</button>
        </div>
        {showTools && <div className="a in-pop absolute right-0 top-[calc(100%+6px)] z-[90] w-48 rounded-xl border border-[#c084fc]/45 bg-[#1e1338]/95 p-2 shadow-[0_12px_28px_rgba(0,0,0,.65)] backdrop-blur">
          <div className="font-arsenal-title mb-1 px-1 text-[9px] text-white/55">{tr(language, 'ARSENAL · TOOLS')}</div>
          <button type="button" onClick={() => { handleRandomToggle(); setShowTools(false); }} className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-[10px] font-bold text-white/90 hover:bg-white/10">USE ALL <span className={`flex h-4 w-7 items-center rounded-full p-0.5 ${useRandom ? 'bg-fuchsia-600' : 'bg-white/20'}`}><span className={`h-3 w-3 rounded-full bg-white transition-transform ${useRandom ? 'translate-x-3' : ''}`} /></span></button>
          <a href={`${import.meta.env.BASE_URL}gun-hit-sga-weapons-svg.zip`} download="gun-hit-sga-weapons-svg.zip" target="_blank" rel="noopener" onClick={() => setShowTools(false)} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-[10px] font-bold text-cyan-100 hover:bg-white/10"><Download className="h-3.5 w-3.5" /> SVG ZIP · {WEAPONS.length}</a>
          <button type="button" onClick={() => { setShowExportModal(true); setShowTools(false); sfx.unlock(); }} className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[10px] font-bold text-amber-100 hover:bg-white/10">↗ EXPORT{exportableCount > 0 ? ` · ${exportableCount}` : ''}</button>
          <div className="mt-1 border-t border-white/10 px-2 pt-1.5 text-[8px] leading-snug text-white/45">{tr(language, 'SPACE · borong senjata RARE, 500 diamond per senjata')}</div>
        </div>}
      </header>

      {/* The reference showcase: spinning ray burst, rarity aura, a landing
          flash + dust ring, and the gun floating above its podium. */}
      <section ref={heroSectionRef} style={area('hero')} className={`relative z-10 flex items-center justify-center ${landscape ? 'mt-0 h-full min-h-0 w-full' : 'mt-1 h-[clamp(120px,20vh,185px)] shrink-0'}`}>
        {/* The showcase light is the menu's own sunburst — one burst of rays,
            same size/speed/strength as the cover screen, so the armory and the
            menu read as the same room instead of two stacked ray wheels. */}
        <div {...A('in-rays', SHOP_IN.rays, 'out-rays', { d: 80, dur: 500 }, 'pointer-events-none absolute h-[150%] aspect-square')} aria-hidden="true">
          <SunburstFX
            size={430}
            color="255,255,255"
            intensity={0.44}
            speed={32}
            core={false}
            stars={false}
            style={{ left: '50%', top: '50%' }}
          />
        </div>
        <div className="pointer-events-none absolute bottom-0 left-1/2 h-6 w-48 -translate-x-1/2 rounded-[50%] border-2 border-[#c084fc]/40 bg-gradient-to-b from-[#3b2a66] to-[#1a1033] shadow-[0_0_24px_rgba(168,85,247,.35)]" />
        {!leaving && (
          <div key={`hero-fx-${heroKey}`} className="pointer-events-none absolute inset-0" aria-hidden="true">
            <div
              className="a sh-flash absolute left-1/2 top-1/2 -ml-24 -mt-24 h-48 w-48 rounded-full"
              style={{ '--d': `${heroLand - 40}ms`, '--dur': '600ms', background: 'radial-gradient(circle, rgba(255,255,255,.95), rgba(255,240,200,.5) 35%, transparent 70%)' } as CSSProperties}
            />
            <div
              className="a sh-dust absolute bottom-[2%] left-1/2 h-6 w-36 rounded-[50%]"
              style={{ '--d': `${heroLand}ms`, '--dur': '700ms', background: 'radial-gradient(ellipse, rgba(220,210,255,.7), transparent 70%)' } as CSSProperties}
            />
          </div>
        )}
        <div key={`hero-${selectedGunId}-${heroKey}`} {...A(heroKey === 0 ? 'sh-hero-in' : 'sh-hero-swap', heroKey === 0 ? SHOP_IN.hero : { d: 120, dur: 620 }, 'sh-hero-out', SHOP_OUT.hero, `relative z-10 ${selectedLocked ? 'opacity-35 grayscale' : ''}`)}>
          <div className={`float ${selectedLocked ? 'opacity-35 grayscale' : ''}`}><SpotlightGun weapon={selectedGun} variant={selectedVariant} box={heroBox} /></div>
          {selectedLocked && <div className="absolute inset-0 grid place-items-center"><LockKeyhole className="h-14 w-14 rounded-2xl border-2 border-cyan-100/80 bg-slate-950/90 p-3 text-cyan-100 shadow-[0_0_28px_rgba(34,211,238,.7)]" /></div>}
        </div>
      </section>

      <div style={area('plate')} className={`relative z-20 flex items-center justify-center gap-2 ${landscape ? 'mb-1 mt-0 min-h-0' : 'mt-1.5 min-h-[42px] shrink-0'}`}>
        <div key={`plate-${selectedGunId}-${heroKey}`} {...A('in-slam', heroKey === 0 ? SHOP_IN.plate : { d: 260, dur: 460 }, 'out-up', SHOP_OUT.plate, 'flex max-w-[82%] items-center gap-2 rounded-2xl border-2 border-[#ffd23f]/30 bg-gradient-to-b from-[#2a1d48] to-[#140b26] px-4 py-2 shadow-[0_6px_16px_rgba(0,0,0,.5),inset_0_1px_0_rgba(255,255,255,.12)]')}>
          <span className="font-arsenal-title truncate text-[24px] leading-none text-[#ffd23f] [text-shadow:0_2px_0_#9c5a10,0_0_12px_rgba(255,210,63,.35)]">{selectedGun.name.toUpperCase()}</span>
          <span className={`font-arsenal-title flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-[12px] leading-none ${RARITY_CHIP[selectedGun.rarity]}`}><RarityIcon className="h-3 w-3" />{rarityName(selectedGun.rarity)}</span>
        </div>
        {canChooseGunDesign(selectedGunId) && selectedPos && (
          <button {...A('in-pop', SHOP_IN.pill, 'out-up', { d: 30, dur: 360 }, 'press relative grid h-12 w-12 shrink-0 place-items-center rounded-2xl border-2 border-[#c084fc]/60 bg-gradient-to-b from-[#7c3aed] to-[#4c1d95] text-white shadow-[0_4px_0_#2e1065]')} type="button" onClick={() => setEditingDesign(true)} aria-label={`${tr(language, 'Bandingkan desain ')}${selectedGun.name}`} title={tr(language, 'Ganti desain dan efek')}><Palette className="h-5 w-5" /><span className="font-arsenal-title absolute -bottom-1.5 -right-1.5 rounded-full bg-[#fbbf24] px-1.5 py-[1px] text-[8px] leading-none text-[#4a2a00] ring-2 ring-[#140b26]">{selectedPos.skinNo}/{selectedPos.skinTotal}</span></button>
        )}
      </div>

      {selectedLocked && (
        <div {...withArea(A('in-pop', SHOP_IN.pill, 'out-up', { d: 30, dur: 360 }, 'relative z-20 flex justify-center'), 'buy')}>
          <button type="button" onClick={() => {
            if (diamonds < 500) { sfx.coin(); return; }
            if (onBuyRare(selectedGun.id)) setOwnedRare((ids) => ids.includes(selectedGun.id) ? ids : [...ids, selectedGun.id]);
          }} className={`rounded-xl border px-3 py-1 text-[9px] font-black shadow-lg transition active:scale-95 ${diamonds >= 500 ? 'border-cyan-100 bg-gradient-to-r from-cyan-500 to-blue-600 text-white' : 'border-white/20 bg-slate-900/90 text-white/55'}`}><LockKeyhole className="mr-1 inline h-3 w-3" /> {tr(language, 'BELI · 500')} <DiamondSprite size={14} className="inline align-middle" /> {diamonds < 500 ? `(${tr(language, 'kurang ')}${500 - diamonds})` : ''}</button>
        </div>
      )}

      {/* The seven icon tabs mirror Perfect Shot; SGA's filtering and catalog stay intact. */}
      <nav style={area('tabs')} className={`relative z-20 grid grid-cols-7 gap-1 ${landscape ? 'mb-1 mt-0' : 'mt-3 shrink-0'}`} aria-label={tr(language, 'Kategori senjata')}>
        {tabItems.map(({ id, label, Icon, color }, i) => {
          const active = tab === id;
          return <div key={id} {...A('in-pop', SHOP_IN.tab(i), 'out-down', SHOP_OUT.tab(i))}><button type="button" aria-pressed={active} onClick={() => changeTab(id)} className={`press flex w-full flex-col items-center gap-0.5 rounded-t-xl border-x-2 border-t-2 px-0.5 pt-1.5 pb-1 transition-all duration-300 ${active ? '-translate-y-1 border-[#f0abfc]/70 bg-gradient-to-b from-[#c026d3] to-[#7e22ce] shadow-[0_-4px_14px_rgba(192,38,211,.45)]' : 'border-white/10 bg-gradient-to-b from-[#3a2d5c] to-[#271c42]'}`}>
            <span className={active ? 'bounce-soft' : ''}>
              <Icon className={`h-5 w-5 ${active ? 'scale-110 text-white' : ''}`} style={active ? undefined : { color }} />
            </span>
            <span className={`font-arsenal-title text-[10px] leading-none ${active ? 'text-white' : 'text-white/70'}`}>{label}</span>
          </button></div>;
        })}
      </nav>

      {/* Scrollable catalog panel, replacing the old six-weapons-per-page carousel. */}
      <section {...withArea(A('sh-panel-in', SHOP_IN.panel, 'sh-panel-out', SHOP_OUT.panel, 'relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden rounded-b-2xl rounded-tr-2xl border-2 border-[#7e22ce]/80 bg-gradient-to-b from-[#1e1338] to-[#140c27] shadow-[0_10px_30px_rgba(0,0,0,.5)]'), 'panel')}>
        <div className="flex shrink-0 items-center justify-between bg-gradient-to-r from-[#5b21b6] to-[#3b1a6e] px-3 py-2">
          <span key={tab} {...A('in-left', { d: 0, dur: 450 }, 'out-fade', { d: 0, dur: 200 }, 'font-arsenal-title text-[15px] text-white')}>{panelTitle}</span>
          {tab !== 'BOSS' && <span className="font-arsenal-title rounded-lg bg-black/40 px-2 py-1 text-[11px] text-white/85">{filteredWeapons.length} ITEM</span>}
        </div>
        {tab !== 'BOSS' ? (
          <div ref={gridRef} aria-label={tr(language, 'Senjata, gulir untuk melihat semua')} className="arsenal-scroll-area relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-2.5 pb-5 pt-2.5">
            {bulkUnlockMessage && <div role="status" className="a in-down absolute inset-x-3 top-3 z-30 rounded-lg border border-emerald-300/40 bg-[#123324]/95 px-2 py-1.5 text-center text-[9px] font-bold text-emerald-100 shadow-lg">{bulkUnlockMessage}</div>}
            <div key={grid.key} className="grid grid-cols-3 items-start gap-2.5">
              {filteredWeapons.map((w, index) => {
                const isSelected = selectedGunId === w.id;
                const locked = isLocked(w);
                const rc = RARITY_COLOR[w.rarity];
                const ca = cardMotion(index);
                return (
                  <button key={w.id} type="button" onClick={() => handleSelectGun(w)} aria-pressed={isSelected} className={`${ca.className} press relative block aspect-[0.9] w-full overflow-hidden rounded-2xl border-2 text-left transition-all ${isSelected ? 'sh-sel z-10 border-[#ffe066]' : 'border-black/40 hover:border-white/30'}`} style={{ ...ca.style, background: locked ? 'linear-gradient(180deg,#2a2f3a,#161a22)' : `radial-gradient(circle at 50% 42%, ${rc}3d, transparent 65%), linear-gradient(180deg,#555b67,#292c36)` }}>
                    <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/15 to-transparent" />
                    <span className="font-arsenal-title absolute left-1.5 top-1.5 z-10 flex items-center gap-1 rounded-md px-1.5 py-1 text-[9px] leading-none text-black shadow-[0_2px_0_rgba(0,0,0,.35)]" style={{ background: rc }}><RarityIconForWeapon rarity={w.rarity} />{rarityName(w.rarity)}</span>
                    {isGunDefaultMarked(w.id) && <span title={tr(language, 'Default tersimpan')} className="absolute left-1.5 top-7 z-10 grid h-5 w-5 place-items-center rounded-md bg-[#ffd23f] text-[#7a4300] shadow-[0_2px_0_#9a5b00]"><Star className="h-3.5 w-3.5 fill-current" /></span>}
                    {(hasSlide11Update(w.id) || hasSlide9Update(w.id) || hasSlide6Update(w.id) || hasSlide7Update(w.id)) && <span className="font-arsenal-title absolute right-1.5 top-7 z-10 rounded-full border border-[#3fdc72] bg-[#0f3b1f] px-1.5 py-1 text-[7px] leading-none text-[#4ade80]">NEW</span>}
                    {isSelected && <span className="absolute right-1.5 top-1.5 z-20 grid h-5 w-5 place-items-center rounded-full bg-[#22c55e] text-white shadow ring-2 ring-[#0f3b1f]"><Check className="h-3.5 w-3.5" /></span>}
                    <div className={`absolute inset-x-1 grid place-items-center transition-[filter] ${landscape ? 'top-6 bottom-7' : 'top-7 bottom-8'} ${locked ? 'brightness-[.18] grayscale' : 'drop-shadow-[0_6px_6px_rgba(0,0,0,.52)]'}`}>
                      <GunItemCanvas weapon={w} isSelected={isSelected} variant={getGunVariant(w.id)} size={landscape ? 88 : 112} eager={index < 12} />
                    </div>
                    {locked && <span className="absolute inset-0 z-20 grid place-items-center"><LockKeyhole className="h-10 w-10 rounded-2xl border-2 border-[#22d3ee] bg-[#08202a]/85 p-2 text-cyan-50 shadow-[0_0_16px_rgba(34,211,238,.6)]" /></span>}
                    <span className={`font-arsenal-title absolute inset-x-1.5 bottom-1.5 z-10 break-words rounded-lg border px-1 py-1.5 text-center text-[11px] leading-[1.05] ${isSelected ? 'border-[#ffe066]/70 bg-black/85 text-[#ffe066]' : 'border-white/10 bg-black/70 text-white'}`}>{w.name.toUpperCase()}</span>
                  </button>
                );
              })}
            </div>
            <div className="font-arsenal-title mt-4 pb-2 text-center text-[9px] tracking-wider text-white/35">— {filteredWeapons.length}{tr(language, ' SENJATA · AKHIR DAFTAR —')}</div>
          </div>
        ) : (
          <div className="arsenal-scroll-area min-h-0 flex-1 space-y-2 overflow-y-auto px-2.5 pb-4 pt-2.5">
            <div className="flex items-center gap-3 rounded-2xl border border-[#c084fc]/35 bg-[#211638]/90 p-2.5 shadow-lg">
              <div className="relative grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-xl border-2 bg-black/45" style={{ borderColor: selectedBoss.accent }}>
                <HeadArt kind={selectedBoss.head} className="h-16 w-16" />
              </div>
              <div className="min-w-0 flex-1"><div className="font-arsenal-title text-sm" style={{ color: selectedBoss.accent }}>{selectedBoss.name}</div><div className="text-[10px] font-bold text-white/70">{selectedBoss.title}</div><div className="mt-0.5 text-[8px] leading-tight text-white/50">{selectedBoss.desc}</div></div>
            </div>
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[#110a24]/90 p-2"><BossAttackPreview boss={selectedBoss} /><div className="min-w-0"><div className="font-arsenal-title text-[8px] tracking-[.16em] text-white/55">{tr(language, 'DEMO SERANGAN BOS')}</div><div className="mt-1 text-[10px] font-black" style={{ color: selectedBoss.accent }}>{selectedBoss.projectileEmoji} {selectedBoss.projectileName}</div><div className="mt-1 text-[8px] leading-tight text-white/55">{tr(language, 'Senjata dan efek bergerak sesuai karakter boss.')}</div></div></div>
            <div className="grid grid-cols-2 gap-2">{GAME_B_BOSSES.map((boss, idx) => { const beaten = highestLevel >= (idx + 1) * 5; const isSel = selectedBoss.head === boss.head; return <button key={boss.head} type="button" onClick={() => { setSelectedBoss(boss); sfx.unlock(); }} className={`flex items-center gap-2 rounded-xl border p-2 text-left transition ${isSel ? 'border-amber-300 bg-[#2d1656]' : 'border-purple-500/20 bg-[#1e1038] hover:bg-[#27144a]'}`}><span className="grid h-9 w-9 place-items-center rounded-full bg-white/5 text-2xl" style={{ color: boss.accent }}><HeadArt kind={boss.head} className="h-9 w-9" /></span><span><span className="block text-[10px] font-bold leading-none text-white">{boss.name}</span><span className="mt-1 block text-[8px] text-white/50">LEVEL {(idx + 1) * 5} {beaten ? '✓' : ''}</span></span></button>; })}</div>
          </div>
        )}
      </section>

      {editingDesign && canChooseGunDesign(selectedGunId) && (
        <GunVariantPicker weapon={selectedGun} variantId={selectedGunId} selected={selectedVariant} effect={getGunEffect(selectedGunId)}
          onSelect={(variant) => { setGunVariant(selectedGunId, variant); setHeroKey((key) => key + 1); setDesignRevision((n) => n + 1); sfx.unlock(); }}
          onEffectSelect={(effect) => { setGunEffect(selectedGunId, effect); setHeroKey((key) => key + 1); setDesignRevision((n) => n + 1); sfx.unlock(); }}
          onMarkDefault={() => { markGunDefault(selectedGunId, selectedVariant, getGunEffect(selectedGunId)); setDesignRevision((n) => n + 1); sfx.coin(); }}
          onUnmarkDefault={() => { unmarkGunDefault(selectedGunId); setDesignRevision((n) => n + 1); sfx.unlock(); }}
          onOpenExport={() => { setShowExportModal(true); sfx.unlock(); }}
          onPrevWeapon={() => stepEditableWeapon(-1)} onNextWeapon={() => stepEditableWeapon(1)}
          weaponStepLabel={`${Math.max(1, stepIds.indexOf(selectedGunId) + 1)} / ${stepIds.length} · ${selectedGun.id}`} exportCount={exportableCount} onClose={() => setEditingDesign(false)} />
      )}
      {showExportModal && <DefaultExportModal onClose={() => setShowExportModal(false)} onJumpToWeapon={(id) => { setSelectedGunId(id); setHeroKey((key) => key + 1); setShowExportModal(false); setEditingDesign(true); sfx.unlock(); }} onChanged={() => setDesignRevision((n) => n + 1)} />}
    </div>
  );
}
