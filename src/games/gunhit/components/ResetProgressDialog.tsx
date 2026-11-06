import { useEffect, type CSSProperties } from 'react';
import { t } from '../../../i18n/catalog';
import { useLanguage } from '../../../i18n/useLanguage';

type Props = {
  onCancel: () => void;
  onConfirm: () => void;
  /** Progres sudah dihapus; dialog menampilkan konfirmasi sebelum reload. */
  done?: boolean;
};

/**
 * Konfirmasi RESET PROGRES. Sengaja dua langkah (tombol di Pengaturan → dialog
 * ini) dan tombol hapusnya berwarna merah, bukan hijau: tindakan ini tidak bisa
 * dibatalkan.
 */
export default function ResetProgressDialog({ onCancel, onConfirm, done = false }: Props) {
  const [language] = useLanguage();

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !done) {
        event.preventDefault();
        onCancel();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);

  return (
    <div
      className="absolute inset-0 z-[85] grid place-items-center bg-black/70 px-5 backdrop-blur-sm"
      role="alertdialog"
      aria-modal="true"
      aria-label={t(language, 'reset.title')}
      style={{ '--d': '0ms' } as CSSProperties}
    >
      <div className="w-full max-w-sm rounded-2xl border-2 border-red-500/40 bg-[#180d10] p-4 text-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.7)]">
        <div className="text-[15px] font-black tracking-wide text-red-300">{t(language, 'reset.title')}</div>
        <p className="mt-2 text-[12px] leading-relaxed text-white/75">
          {t(language, done ? 'reset.done' : 'reset.body')}
        </p>
        {done ? (
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-emerald-400" />
          </div>
        ) : (
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={onCancel}
              autoFocus
              className="flex-1 rounded-xl border-2 border-white/20 bg-white/5 py-2.5 text-[13px] font-black text-white/85 active:scale-[0.99]"
            >
              {t(language, 'common.cancel')}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="flex-1 rounded-xl border-2 border-red-800 bg-gradient-to-b from-red-500 to-red-700 py-2.5 text-[13px] font-black text-white active:scale-[0.99]"
            >
              {t(language, 'reset.confirm')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
