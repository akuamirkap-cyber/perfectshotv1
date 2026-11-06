import { tr } from '../../../i18n/strings';
import { useLanguage } from '../../../i18n/useLanguage';
import { useRef, useState } from 'react';
import { WEAPONS } from '../game/weapons';
import {
  clearAllMarkedGunDefaults,
  formatWeaponDefaultsExport,
  getMarkedGunDefaultCount,
  getWeaponDefaultExportEntries,
  isGunDefaultMarked,
  isGunModifiedFromFactory,
  markGunDefault,
  UNIQUE_EDITABLE_WEAPONS,
  type DefaultExportScope,
  type EditableWeapon,
} from '../game/art/gunVariants';
import { sfx } from '../game/audio';

interface Props {
  onClose: () => void;
  onJumpToWeapon?: (id: EditableWeapon) => void;
  onChanged: () => void;
}

export default function DefaultExportModal({ onClose, onJumpToWeapon, onChanged }: Props) {
  const markedCount = getMarkedGunDefaultCount();
  const markedOrChangedCount = getWeaponDefaultExportEntries('marked_or_changed', WEAPONS).length;
  const allCount = getWeaponDefaultExportEntries('all', WEAPONS).length;

  const [language] = useLanguage();
  const [scope, setScope] = useState<DefaultExportScope>(() =>
    markedOrChangedCount > 0 ? 'marked_or_changed' : 'all',
  );
  const [copied, setCopied] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const textRef = useRef<HTMLTextAreaElement>(null);

  const entries = getWeaponDefaultExportEntries(scope, WEAPONS);
  const exportText = formatWeaponDefaultsExport(scope, WEAPONS);

  const handleCopy = async () => {
    let ok = false;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(exportText);
        ok = true;
      }
    } catch {
      ok = false;
    }
    if (!ok && textRef.current) {
      const el = textRef.current;
      el.focus();
      el.select();
      el.setSelectionRange(0, exportText.length);
      try {
        ok = document.execCommand('copy');
      } catch {
        ok = false;
      }
    } else if (textRef.current) {
      textRef.current.focus();
      textRef.current.select();
    }
    setCopied(true);
    sfx.coin();
    window.setTimeout(() => setCopied(false), 2600);
  };

  const handleDownloadTxt = () => {
    try {
      const blob = new Blob([exportText], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sga-default-weapons-${scope}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      sfx.unlock();
    } catch {
      /* ignore if download blocked */
    }
  };

  const handleMarkAllChanged = () => {
    let added = 0;
    for (const id of UNIQUE_EDITABLE_WEAPONS) {
      if (!isGunDefaultMarked(id) && isGunModifiedFromFactory(id)) {
        markGunDefault(id);
        added++;
      }
    }
    if (added > 0) {
      onChanged();
      setScope('marked_or_changed');
      sfx.coin();
    }
  };

  const handleResetMarks = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      window.setTimeout(() => setConfirmReset(false), 3500);
      return;
    }
    clearAllMarkedGunDefaults();
    setConfirmReset(false);
    onChanged();
    sfx.unlock();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={tr(language, 'Export data default senjata massal')}
      className="absolute inset-0 z-50 flex flex-col bg-gradient-to-b from-[#1d103d] via-[#100826] to-[#070312] px-3.5 py-3 text-white font-game select-none"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-300">
            {tr(language, '★ EXPORT DEFAULT MASSAL')}
          </div>
          <h2 className="mt-0.5 text-lg font-black leading-tight text-white">
            {tr(language, 'DATA PILIHAN DEFAULT SENJATA')}
          </h2>
          <p className="mt-0.5 text-[10.5px] leading-snug text-indigo-200">
            {tr(language, 'Copy data di bawah lalu paste langsung ke chat agar diset permanen sebagai default game.')}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={tr(language, 'Tutup export default')}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/30 bg-white/10 text-xl font-bold hover:bg-white/20"
        >
          ×
        </button>
      </div>

      {/* Scope Tabs */}
      <div className="mt-2.5 grid grid-cols-3 gap-1.5">
        {([
          {
            id: 'marked_or_changed' as const,
            label: `${tr(language, 'DIUBAH / ★ (')}${markedOrChangedCount})`,
          },
          {
            id: 'marked_only' as const,
            label: `${tr(language, 'HANYA ★ (')}${markedCount})`,
          },
          {
            id: 'all' as const,
            label: `${tr(language, 'SEMUA (')}${allCount})`,
          },
        ]).map((tab) => {
          const active = scope === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setScope(tab.id);
                sfx.unlock();
              }}
              className={`rounded-xl border px-2 py-1.5 text-[9.5px] font-black tracking-wide transition active:scale-95 ${
                active
                  ? 'border-amber-300 bg-gradient-to-b from-amber-300 to-amber-500 text-[#221133] shadow-[0_0_12px_rgba(250,204,21,0.35)]'
                  : 'border-purple-400/35 bg-[#231445] text-purple-100 hover:bg-[#311d5e]'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Quick Visual Summary List */}
      <div className="mt-2 max-h-[145px] shrink-0 overflow-y-auto rounded-xl border border-purple-400/30 bg-[#150b2e] p-2">
        <div className="mb-1 flex items-center justify-between text-[9.5px] font-black uppercase tracking-wider text-purple-200">
          <span>{tr(language, 'RINGKASAN (')}{entries.length}{tr(language, ' SENJATA)')}</span>
          <span>{tr(language, 'KLIK BARIS UNTUK EDIT')}</span>
        </div>
        {entries.length === 0 ? (
          <div className="py-3 text-center text-[10.5px] text-indigo-200/80">
            {tr(language, 'Belum ada senjata di kategori ini. Buka')} <b>{tr(language, 'PILIH DESAIN')}</b> {tr(language, 'pada senjata lalu klik')}{' '}
            <b>★ {tr(language, 'TANDAI SEBAGAI DEFAULT')}</b>{tr(language, ', atau pilih tab')} <b>{tr(language, 'SEMUA (')}{allCount})</b>.
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {entries.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onJumpToWeapon?.(item.id)}
                className="flex items-center justify-between gap-2 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-left text-[10px] transition hover:border-amber-300/60 hover:bg-white/10"
              >
                <span className="truncate font-black text-yellow-200">
                  {item.marked ? '★ ' : ''}
                  {item.name}{' '}
                  <span className="font-mono text-[9px] font-normal text-indigo-300">
                    ({item.id})
                  </span>
                </span>
                <span className="shrink-0 font-mono text-[9.5px] font-bold text-cyan-200">
                  {tr(language, 'Skin #')}{item.skinNo}/{item.skinTotal} · {tr(language, 'Efek #')}{item.effectNo}/{item.effectTotal}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Raw Copy-Paste Textarea */}
      <div className="mt-2 flex min-h-0 flex-1 flex-col">
        <div className="mb-1 flex items-center justify-between text-[9.5px] font-black uppercase tracking-wider text-amber-200">
          <span>{tr(language, 'DATA EXPORT (SIAP COPAS KE CHAT):')}</span>
          <span className="font-mono text-[9px] text-indigo-300">
            {exportText.split('\n').length}{tr(language, ' baris')}
          </span>
        </div>
        <textarea
          ref={textRef}
          readOnly
          aria-label={tr(language, 'Teks data export default senjata')}
          value={exportText}
          onFocus={(e) => e.currentTarget.select()}
          className="min-h-[120px] w-full flex-1 resize-none rounded-xl border border-cyan-300/35 bg-[#090418] p-2.5 font-mono text-[10px] leading-relaxed text-emerald-200 focus:border-amber-300 focus:outline-none select-text"
        />
      </div>

      {/* Action Buttons */}
      <div className="mt-2.5 flex flex-col gap-1.5">
        <button
          type="button"
          onClick={handleCopy}
          className={`w-full rounded-xl border py-2.5 text-xs font-black tracking-wide shadow-lg transition active:scale-[0.98] ${
            copied
              ? 'border-emerald-200 bg-gradient-to-b from-emerald-400 to-green-600 text-[#052e16]'
              : 'border-amber-200 bg-gradient-to-b from-amber-300 to-amber-500 text-[#231432] hover:brightness-110'
          }`}
        >
          {copied
            ? tr(language, '✓ BERHASIL DICOPY! TINGGAL PASTE KE CHAT')
            : `${tr(language, '📋 COPY DATA MASSAL (')}${entries.length})`}
        </button>

        <div className="grid grid-cols-3 gap-1.5">
          <button
            type="button"
            onClick={handleDownloadTxt}
            className="rounded-xl border border-cyan-300/40 bg-cyan-950/60 py-1.5 text-[9.5px] font-black text-cyan-100 transition hover:bg-cyan-900/70 active:scale-95"
          >
            {tr(language, '⬇ UNDUH .TXT')}
          </button>
          <button
            type="button"
            onClick={handleMarkAllChanged}
            className="rounded-xl border border-amber-300/40 bg-amber-950/50 py-1.5 text-[9.5px] font-black text-amber-200 transition hover:bg-amber-900/60 active:scale-95"
          >
            {tr(language, '★ TANDAI DIUBAH')}
          </button>
          <button
            type="button"
            onClick={handleResetMarks}
            className={`rounded-xl border py-1.5 text-[9.5px] font-black transition active:scale-95 ${
              confirmReset
                ? 'border-rose-300 bg-rose-600 text-white'
                : 'border-rose-400/35 bg-rose-950/50 text-rose-200 hover:bg-rose-900/60'
            }`}
          >
            {confirmReset ? tr(language, 'YAKIN RESET?') : tr(language, '↺ RESET TANDA')}
          </button>
        </div>
      </div>
    </div>
  );
}
