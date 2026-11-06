import type { BuffKind } from '../game/Game';
import { tr } from '../../../i18n/strings';
import { useLanguage } from '../../../i18n/useLanguage';

interface StarBuffModalProps {
  treasure?: boolean;
  onPick: (kind: BuffKind) => void;
}

const OPTIONS: { kind: BuffKind; emoji: string; title: string; sub: string; color: string }[] = [
  { kind: 'speed', emoji: '⚡', title: 'TEMBAK 2X CEPAT', sub: 'Jeda antar tembakan lebih singkat', color: '#facc15' },
  { kind: 'ammo', emoji: '📦', title: 'AMMO 2X', sub: 'Dapat satu magasin tambahan', color: '#4ade80' },
  { kind: 'power', emoji: '💥', title: 'DAYA 2X', sub: 'Hit bos lebih kuat, batu lebih cepat terkikis', color: '#f87171' },
  { kind: 'double', emoji: '🔫', title: 'DUA SENJATA', sub: 'Kembar kanan-kiri, pegangan menghadap keluar', color: '#38bdf8' },
];

const TREASURE_OPTIONS: typeof OPTIONS = [
  { kind: 'rapid', emoji: '⚡', title: 'TEMBAK 2X CEPAT', sub: 'Lebih banyak tembakan dalam 10 detik', color: '#38bdf8' },
  { kind: 'double', emoji: '🔫', title: 'DUA SENJATA', sub: 'Dua senjata berdampingan, dua peluru per tembakan', color: '#4ade80' },
  { kind: 'mini', emoji: '✨', title: 'PELURU MINI', sub: 'Berondong dengan jeda lebih rapat', color: '#c084fc' },
  { kind: 'giant', emoji: '🔆', title: 'PELURU RAKSASA', sub: 'Koin dari setiap hit jadi 2x', color: '#fb923c' },
];

export default function StarBuffModal({ onPick, treasure = false }: StarBuffModalProps) {
  const [language] = useLanguage();
  return (
    <div className="pop-in absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/75 px-5 backdrop-blur-sm">
      <div className="mb-1 text-6xl drop-shadow-[0_0_20px_#facc15]">★</div>
      <div className="text-2xl font-black tracking-wide text-amber-300 drop-shadow-[0_3px_0_rgba(0,0,0,0.8)] font-game">
        {tr(language, treasure ? 'BONUS HARTA KARUN!' : 'POWER UP!')}
      </div>
      <div className="mb-5 text-xs text-white/70">{tr(language, 'Waktu berhenti sejenak. Pilih satu kekuatan:')}</div>

      <div className="flex w-full max-w-xs flex-col gap-2.5">
        {(treasure ? TREASURE_OPTIONS : OPTIONS).map((o, i) => (
          <button
            key={o.kind}
            onClick={() => onPick(o.kind)}
            className="pop-in flex items-center gap-3 rounded-2xl border-2 p-3 text-left transition active:scale-95 hover:brightness-110"
            style={{
              borderColor: o.color,
              background: `linear-gradient(135deg, ${o.color}33, ${o.color}11)`,
              boxShadow: `0 0 18px ${o.color}55`,
              animationDelay: `${i * 90}ms`,
            }}
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-black/40 text-2xl">
              {o.emoji}
            </div>
            <div className="flex-1">
              <div className="text-lg font-black leading-none font-game" style={{ color: o.color }}>
                {tr(language, o.title)}
              </div>
              <div className="mt-0.5 text-[11px] text-white/70">{tr(language, o.sub)}</div>
            </div>
            <div className="text-xl text-white/40">▶</div>
          </button>
        ))}
      </div>
    </div>
  );
}
