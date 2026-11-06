import type { Language } from '../../../i18n/language';
import { tr } from '../../../i18n/strings';
import { useLanguage } from '../../../i18n/useLanguage';
import { useEffect, useRef } from 'react';
import type { Weapon } from '../game/weapons';
import { drawGunCentered } from '../game/art/drawCentered';
import { getGunMetrics } from '../game/art/metrics';
import {
  getGunVariantOptions,
  getGunEffectOptions,
  getGunSkinAndEffectPosition,
  getMarkedGunDefault,
  type GunVariant,
  type GunEffect,
  type EditableWeapon,
} from '../game/art/gunVariants';
import ShotEffectCanvas from './ShotEffectCanvas';
import ZipWeaponArt from './ZipWeaponArt';

type Description = Partial<Record<EditableWeapon, readonly string[]>>;
const DESCRIPTIONS: Description = {
  chicken: ['Peluncur ayam karet klasik', 'Ayam pompa berayun', 'Ayam karet dengan sayap, grip, dan squeaker'],
  dragon: ['Naga merah klasik', 'Naga bersayap dan api', 'Kepala naga, sayap terlipat, grip kulit'],
  diamond: ['Permata dan bodi platinum', 'Kristal bersinar modern', 'Pistol berfaset dengan pegangan tegas'],
  rainbow: ['Busur pelangi klasik', 'Spektrum bercahaya', 'Prisma pelangi dalam pistol mutiara'],
  meteor: ['Batuan lava klasik', 'Inti meteor menyala', 'Meriam tempa dengan grip dan ventilasi lava'],
  golden: ['Pistol emas klasik', 'Emas berukir dan reload', 'Meriam emas, silinder dan slide bergerak', 'GOLDEN GUN slide 3: pistol emas dengan slide mundur dan selongsong terlempar'],
  moonbeam: ['Bulan sabit klasik', 'Tongkat bulan berbintang', 'Tongkat sihir dengan bintang dan aura'],
  honey: ['Stoples madu klasik dengan tutup kain', 'Blaster lebah dengan pompa dan reservoir madu'],
  cricket: ['Cricket mini lama dengan receiver dan grip mungil', 'Profil krom seperti referensi: laras panjang, pelatuk terbuka, grip hitam'],
  fish: ['Fish Gun dengan grip lama', 'Grip akuatik ramping dengan aksen sirip dan warna amber'],
  electro: ['Electro Gun dengan lilitan dan receiver lama', 'Receiver graphite, kapasitor cyan, dan lilitan tembaga rapi'],
  blackhole: [
    'Meriam singularitas klasik slide 1',
    'Meriam versi Firework 8-Gun: cincin foton ganda, inti singularitas, dan orb mengisi di moncong',
    'BLACK HOLE slide 3: tongkat singularitas dengan orb mengisi dan cakar energi',
  ],
  slingshot: [
    'Ketapel kayu sawo slide 1',
    'KETAPEL slide 3: kayu bercabang, karet ban, kantung kulit dan batu kali berputar',
  ],
  blowgun: [
    'Sumpitan Dayak slide 1',
    'SUMPIT DAYAK slide 3: buluh panjang, mata tombak, dan jumbai yang bergoyang',
  ],
  shotgun: [
    'Shotgun slide 1',
    'SHOTGUN slide 3: pompa kayu, selongsong terlempar dan kepulan asap pekat',
  ],
  soaker: [
    'Pistol air neon slide 1',
    'SUPER SOAKER slide 3: tangki berisi air, pengukur tekanan dan pompa yang bergerak',
  ],
};

/**
 * What the zip's animated SVG shows, per weapon — read from the zip's own
 * artwork, so the card tells the player what they are about to pick.
 */
const ZIP_DESCRIPTIONS: Partial<Record<EditableWeapon, string>> = {
  diamond: 'Gun kristal putih-marmer dengan filigree emas, berlian biru menyala dan kristal besar berputar di moncong (SVG animasi)',
  blaster: 'Blaster galaksi bersel energi dengan muara plasma merah yang berkedip (SVG animasi)',
  paintball: 'Paintball gun neon dengan tabung cat, kilau pink dan cipratan cat (SVG animasi)',
  shark: 'Shark launcher dengan rahang menggigit, mata menyala dan jet biru (SVG animasi)',
  heat_ray: 'Martian heat-ray dengan ekor manik hijau meliuk dan busur petir (SVG animasi)',
};

/**
 * Every imported card explains itself even without a hand-written paragraph:
 * it names the hub slide its shape, its shot and (where ported) its sound come
 * from, by the hub's current numbering — set11 = Slide 5, set9 = Slide 4,
 * set6 = Slide 2 (beam visuals only, no sounds), SET 1..7 = Slide 3, set2 =
 * Firework 8-Gun (no longer in the hub). Every other card is a slide-1 design.
 */
function describeFallback(weapon: Weapon, variant: GunVariant, label: string, language: Language): string {
  if (variant === 'set11') {
    return tr(language, '{label}: {w} dengan bentuk, efek tembakan dan suara asli dari slide 5').replace('{label}', label).replace('{w}', weapon.name);
  }
  if (variant === 'set9') {
    return tr(language, '{label}: {w} dengan bentuk, efek tembakan dan suara asli dari slide 4').replace('{label}', label).replace('{w}', weapon.name);
  }
  if (variant === 'set6') {
    return tr(language, '{label}: {w} dengan bentuk dan efek sinar asli dari slide 2').replace('{label}', label).replace('{w}', weapon.name);
  }
  if (variant === 'set1' || variant === 'set7') {
    return tr(language, '{label}: {w} dengan bentuk, efek tembakan dan suara asli dari slide 3').replace('{label}', label).replace('{w}', weapon.name);
  }
  if (variant === 'set2') {
    return tr(language, '{label}: {w} dengan bentuk, efek tembakan dan suara asli dari Firework 8-Gun').replace('{label}', label).replace('{w}', weapon.name);
  }
  if (variant === 'zip') {
    return tr(language, '{label}: art SVG animasi (glow, kilau dan flash) dari svg-weapons-with-glow-animation.zip').replace('{label}', label);
  }
  return tr(language, '{label}: desain {w} di slide 1').replace('{label}', label).replace('{w}', weapon.name);
}

function VariantCanvas({ weapon, variant }: { weapon: Weapon; variant: GunVariant }) {
  const ref = useRef<HTMLCanvasElement>(null);
  // The zip's "Skin 3" is the zip's own animated SVG, not a canvas drawing: the
  // card has to show the same artwork the game will.
  const zipCard = variant === 'zip';
  useEffect(() => {
    if (zipCard) return;
    const cv = ref.current;
    if (!cv) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = 138; const h = 132;
    cv.width = w * dpr; cv.height = h * dpr;
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.translate(w / 2, h / 2);
    ctx.rotate(Math.PI / 4);
    const m = getGunMetrics(weapon.id, variant);
    ctx.scale((h * 0.94) / Math.max(m.span, 130), (h * 0.94) / Math.max(m.span, 130));
    drawGunCentered(ctx, weapon.id, 0.8, 0, true, variant);
  }, [weapon.id, variant, zipCard]);
  if (zipCard) {
    return (
      <div className="relative h-[116px] w-[121px] shrink-0 sm:h-[132px] sm:w-[138px]" aria-hidden="true">
        <div className="absolute inset-0" style={{ transform: 'rotate(45deg)' }}>
          <ZipWeaponArt id={weapon.id} height={118} anchor="center" />
        </div>
      </div>
    );
  }
  return <canvas ref={ref} width={138} height={132} className="block h-[116px] w-[121px] shrink-0 sm:h-[132px] sm:w-[138px]" />;
}

interface Props {
  weapon: Weapon;
  variantId: EditableWeapon;
  selected: GunVariant;
  effect: GunEffect;
  onSelect: (variant: GunVariant) => void;
  onEffectSelect: (effect: GunEffect) => void;
  onMarkDefault?: () => void;
  onUnmarkDefault?: () => void;
  onOpenExport?: () => void;
  onPrevWeapon?: () => void;
  onNextWeapon?: () => void;
  weaponStepLabel?: string;
  exportCount?: number;
  onClose: () => void;
}

export default function GunVariantPicker({
  weapon,
  variantId,
  selected,
  effect,
  onSelect,
  onEffectSelect,
  onMarkDefault,
  onUnmarkDefault,
  onOpenExport,
  onPrevWeapon,
  onNextWeapon,
  weaponStepLabel,
  exportCount = 0,
  onClose,
}: Props) {
  const [language] = useLanguage();
  const designs = getGunVariantOptions(variantId);
  const effects = getGunEffectOptions(variantId);
  const pos = getGunSkinAndEffectPosition(variantId, selected, effect);
  const marked = getMarkedGunDefault(variantId);
  const markedPos = marked
    ? getGunSkinAndEffectPosition(variantId, marked.variant, marked.effect)
    : null;
  const isCurrentDefault = !!marked && marked.variant === selected && marked.effect === effect;

  return (
    <div role="dialog" aria-modal="true" aria-label={`${tr(language, 'Bandingkan desain ')}${weapon.name}`}
      className="absolute inset-0 z-30 overflow-y-auto bg-gradient-to-b from-[#211346] via-[#110a2d] to-[#080316] text-white">
      <div className="mx-auto flex min-h-full w-full max-w-xl flex-col px-3 py-3 sm:px-5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-300">{tr(language, 'ARSENAL · PILIH DESAIN & DEFAULT')}</div>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-black leading-tight text-white">{weapon.name}</h2>
              {markedPos && (
                <span className="rounded-full border border-emerald-300/60 bg-emerald-500/20 px-2 py-0.5 text-[9.5px] font-black text-emerald-200">
                  ★ {tr(language, 'DEFAULT: SKIN #')}{markedPos.skinNo} · {tr(language, 'EFEK #')}{markedPos.effectNo}
                </span>
              )}
            </div>
            <p className="mt-1 text-[11px] leading-snug text-indigo-200">
              {tr(language, 'Pilih nomor skin & efek tembakan, tandai default per senjata, lalu export massal.')}
            </p>
          </div>
          <button onClick={onClose} aria-label={tr(language, 'Tutup pilihan desain')}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/30 bg-white/10 text-xl font-bold hover:bg-white/20">×</button>
        </div>

        {(onPrevWeapon || onNextWeapon) && (
          <div className="mt-2 flex items-center justify-between gap-2 rounded-xl border border-purple-400/30 bg-[#180e34] px-2 py-1">
            <button
              type="button"
              onClick={onPrevWeapon}
              className="rounded-lg border border-purple-300/35 bg-purple-900/60 px-2.5 py-1 text-[10px] font-black text-purple-100 transition hover:bg-purple-700 active:scale-95"
            >
              {tr(language, '◀ SENJATA SBLM')}
            </button>
            <span className="font-mono text-[10px] font-black text-amber-200">
              {weaponStepLabel ?? weapon.id}
            </span>
            <button
              type="button"
              onClick={onNextWeapon}
              className="rounded-lg border border-purple-300/35 bg-purple-900/60 px-2.5 py-1 text-[10px] font-black text-purple-100 transition hover:bg-purple-700 active:scale-95"
            >
              {tr(language, 'SENJATA LANJUT ▶')}
            </button>
          </div>
        )}

        <div className="mt-2.5 flex flex-1 flex-col justify-center gap-2">
          {designs.map(({ id, label: rawLabel }, index) => {
            const label = tr(language, rawLabel);
            const isDefaultSkin = marked?.variant === id;
            return (
              <button key={id} type="button" onClick={() => onSelect(id)}
                aria-pressed={selected === id} aria-label={`${tr(language, 'Pilih desain ')}${label}${tr(language, ' untuk ')}${weapon.name}`}
                className={`group relative flex min-h-[118px] w-full items-center gap-2 overflow-hidden rounded-2xl border-2 px-2 py-1 text-left transition active:scale-[0.99] sm:min-h-[132px] sm:gap-4 sm:px-4 ${selected === id
                  ? 'border-amber-300 bg-[#402358] shadow-[0_0_20px_rgba(250,204,21,0.22)]'
                  : 'border-indigo-400/30 bg-[#21153f] hover:border-fuchsia-300 hover:bg-[#30204e]'}`}>
                <div className="pointer-events-none absolute -left-4 -top-12 h-40 w-40 rounded-full bg-purple-400/10 blur-2xl" />
                <VariantCanvas weapon={weapon} variant={id} />
                <span className="relative flex min-w-0 flex-1 flex-col gap-1">
                  <span className="flex flex-wrap items-center gap-1.5">
                    <span className="rounded-md bg-indigo-950/90 px-1.5 py-0.5 font-mono text-[10px] font-black uppercase tracking-wider text-amber-200 border border-amber-300/30">
                      {tr(language, 'SKIN NO. ')}{index + 1} / {designs.length}
                    </span>
                    {isDefaultSkin && (
                      <span className="rounded-md bg-emerald-400 px-1.5 py-0.5 text-[9px] font-black text-[#052e16]">
                        ★ {tr(language, 'DEFAULT')}
                      </span>
                    )}
                  </span>
                  <span className="text-base font-black text-white sm:text-lg">{label}</span>
                  <span className="text-[11px] leading-snug text-indigo-200 sm:text-xs">
                    {tr(language, (id === 'zip' ? ZIP_DESCRIPTIONS[variantId] : DESCRIPTIONS[variantId]?.[index])
                      ?? describeFallback(weapon, id, label, language))}
                  </span>
                  <span className={`w-fit rounded-full px-2 py-0.5 text-[10px] font-black ${selected === id ?
                    'bg-amber-300 text-[#271528]' : 'bg-white/10 text-white/80'}`}>
                    {selected === id ? `${tr(language, '✓ DIPAKAI (SKIN #')}${index + 1})` : `${tr(language, 'PILIH SKIN #')}${index + 1}`}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-2.5 rounded-2xl border border-fuchsia-300/30 bg-[#1b1237] p-2.5" aria-label={tr(language, 'Pilihan efek tembakan')}>
          <div className="mb-2 text-center text-[10px] font-black uppercase tracking-[0.18em] text-fuchsia-200">
            {tr(language, '✦ EFEK TEMBAKAN · PILIH TERPISAH ✦')}
          </div>
          <div className={`grid gap-2 ${effects.length > 3 ? 'grid-cols-4' : effects.length > 2 ? 'grid-cols-3' : 'grid-cols-2'}`}>
            {effects.map(({ id, label: rawEffectLabel }, index) => {
              const label = tr(language, rawEffectLabel);
              const isDefaultEff = marked?.effect === id;
              return (
                <button key={id} type="button" onClick={() => onEffectSelect(id)}
                  aria-pressed={effect === id} aria-label={`${tr(language, 'Pilih efek ')}${label}${tr(language, ' untuk ')}${weapon.name}`}
                  className={`relative flex min-w-0 flex-col items-center rounded-xl border-2 px-1 py-1.5 transition active:scale-[0.98] ${effect === id
                    ? 'border-cyan-200 bg-[#29425f] shadow-[0_0_14px_rgba(125,211,252,0.27)]'
                    : 'border-indigo-400/30 bg-[#281945] hover:border-fuchsia-300'}`}>
                  <span className="mb-0.5 flex items-center gap-1 font-mono text-[9px] font-black text-amber-200">
                    <span>{tr(language, 'EFEK #')}{index + 1}/{effects.length}</span>
                    {isDefaultEff && <span className="rounded bg-emerald-400 px-1 text-[8px] text-[#052e16]">★</span>}
                  </span>
                  <ShotEffectCanvas weapon={weapon} effect={id} />
                  <span className="text-[11px] font-black text-white">{label}</span>
                  <span className={`text-[9px] font-bold ${effect === id ? 'text-cyan-200' : 'text-indigo-300'}`}>
                    {effect === id ? tr(language, '✓ DIPAKAI') : `${tr(language, 'PILIH #')}${index + 1}`}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-center text-[9px] leading-snug text-indigo-300">
            {tr(language, 'Peluru, jejak, beam dan percikan berubah; damage, ammo, dan buff tetap.')}
          </p>
        </div>

        {variantId === 'moonbeam' && <p className="mt-2 text-center text-[10px] text-indigo-300">
          {tr(language, 'Ketiga versi Moonbeam tetap tongkat ajaib, tanpa pegangan pistol.')}
        </p>}

        {/* Per-Weapon Default Pinning + Direct Bulk Export */}
        {onMarkDefault && (
          <div className="mt-2.5 flex flex-col gap-1.5 rounded-2xl border border-emerald-300/35 bg-[#122629]/90 p-2">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={onMarkDefault}
                className={`flex-1 rounded-xl border py-2 px-2 text-xs font-black tracking-wide shadow transition active:scale-[0.98] ${
                  isCurrentDefault
                    ? 'border-emerald-200 bg-gradient-to-b from-emerald-400 to-green-600 text-[#052e16]'
                    : 'border-amber-200 bg-gradient-to-b from-emerald-300 via-teal-300 to-cyan-400 text-[#082226] hover:brightness-110'
                }`}
              >
                {isCurrentDefault
                  ? `★ ${tr(language, 'TERSIMPAN DEFAULT: SKIN NO. ')}${pos.skinNo} · ${tr(language, 'EFEK NO. ')}${pos.effectNo}`
                  : marked
                  ? `★ ${tr(language, 'UPDATE DEFAULT KE SKIN NO. ')}${pos.skinNo} · ${tr(language, 'EFEK NO. ')}${pos.effectNo}`
                  : `★ ${tr(language, 'TANDAI SEBAGAI DEFAULT (SKIN NO. ')}${pos.skinNo} · ${tr(language, 'EFEK NO. ')}${pos.effectNo})`}
              </button>
              {marked && onUnmarkDefault && (
                <button
                  type="button"
                  onClick={onUnmarkDefault}
                  aria-label={`${tr(language, 'Hapus tanda default ')}${weapon.name}`}
                  className="shrink-0 rounded-xl border border-rose-300/50 bg-rose-950/70 px-2.5 py-2 text-[10px] font-black text-rose-200 transition hover:bg-rose-900 active:scale-95"
                >
                  {tr(language, '✕ HAPUS')}
                </button>
              )}
            </div>
            {onOpenExport && (
              <button
                type="button"
                onClick={onOpenExport}
                className="w-full rounded-xl border border-cyan-300/45 bg-cyan-950/70 py-1.5 text-[10.5px] font-black tracking-wide text-cyan-100 transition hover:bg-cyan-900/80 active:scale-[0.98]"
              >
                {tr(language, '📋 EXPORT DATA DEFAULT MASSAL (')}{exportCount}{tr(language, ' SENJATA)')}
              </button>
            )}
          </div>
        )}

        <button onClick={onClose}
          className="mt-2.5 w-full rounded-xl border border-amber-200/80 bg-gradient-to-b from-amber-300 to-amber-500 py-2.5 text-sm font-black text-[#231432] shadow-lg transition hover:brightness-110 active:scale-[0.98]">
          {tr(language, 'GUNAKAN DESAIN ')}{tr(language, designs.find((v) => v.id === selected)?.label ?? '').toUpperCase()} · {tr(language, 'EFEK ')}{tr(language, effects.find((v) => v.id === effect)?.label ?? '').toUpperCase()}
        </button>
      </div>
    </div>
  );
}
