import { useEffect, type CSSProperties } from 'react';
import { t, tList } from '../../../i18n/catalog';
import { useLanguage } from '../../../i18n/useLanguage';

type Props = {
  onClose: () => void;
  /** First run shows a friendlier headline than "opened from Settings". */
  firstRun?: boolean;
};

/**
 * CARA MAIN — ditampilkan sekali saat pertama kali main, lalu bisa dibuka lagi
 * dari Pengaturan. Semua teksnya dari katalog dua bahasa.
 */
export default function HowToPlayPage({ onClose, firstRun = false }: Props) {
  const [language] = useLanguage();
  const steps = tList(language, 'help.steps');

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="absolute inset-0 z-[80] flex flex-col bg-[#0b0e14]/97 text-slate-100 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={t(language, 'help.title')}
      style={{ '--d': '0ms' } as CSSProperties}
    >
      <div className="flex shrink-0 items-center gap-3 border-b border-white/10 px-4 py-3">
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-black tracking-[0.22em] text-amber-300">{t(language, 'help.title')}</div>
          <div className="truncate text-[10px] font-semibold text-white/50">
            {firstRun ? t(language, 'help.firstRun') : t(language, 'help.subtitle')}
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={t(language, 'common.close')}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border-2 border-white/20 bg-white/10 text-base text-white active:scale-95"
        >
          ✕
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4">
        <ol className="mx-auto flex max-w-md flex-col gap-3">
          {steps.map((step, index) => (
            <li key={index} className="flex gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-amber-400 text-[12px] font-black text-[#1a1206]">
                {index + 1}
              </span>
              <span className="text-[12px] leading-relaxed text-white/80">{step}</span>
            </li>
          ))}
        </ol>
        <p className="mx-auto mt-3 max-w-md rounded-xl border border-sky-400/30 bg-sky-400/10 px-3 py-2 text-[11px] font-semibold text-sky-200">
          {t(language, 'help.tip')}
        </p>
      </div>

      <div className="shrink-0 border-t border-white/10 px-4 py-3">
        <button
          type="button"
          onClick={onClose}
          autoFocus
          className="w-full rounded-xl border-2 border-emerald-700 bg-gradient-to-b from-emerald-400 to-emerald-600 py-3 text-[15px] font-black text-white active:scale-[0.99]"
        >
          {t(language, 'help.start')}
        </button>
      </div>
    </div>
  );
}
