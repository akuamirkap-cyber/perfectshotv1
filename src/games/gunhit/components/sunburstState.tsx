import { useEffect, useState, useCallback } from "react";
import { sfx } from "../game/giftBoxSfx";

export type SunburstMode = "new" | "classic";

const STORAGE_KEY = "knife_sunburst_mode";

// Default to 'new' (Sunburst FX Lab) as requested by user
let currentMode: SunburstMode = (() => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "classic" || saved === "new") return saved;
  } catch {}
  return "new";
})();

const listeners = new Set<(mode: SunburstMode) => void>();

export function getSunburstMode(): SunburstMode {
  return currentMode;
}

export function setSunburstMode(mode: SunburstMode) {
  currentMode = mode;
  try {
    localStorage.setItem(STORAGE_KEY, mode);
  } catch {}
  listeners.forEach((fn) => fn(mode));
}

export function toggleSunburstMode(): SunburstMode {
  const next = currentMode === "new" ? "classic" : "new";
  setSunburstMode(next);
  return next;
}

export function useSunburstMode(): [SunburstMode, (mode: SunburstMode) => void, () => SunburstMode] {
  const [mode, setModeState] = useState<SunburstMode>(currentMode);

  useEffect(() => {
    const handler = (m: SunburstMode) => setModeState(m);
    listeners.add(handler);
    return () => {
      listeners.delete(handler);
    };
  }, []);

  const update = useCallback((m: SunburstMode) => {
    setSunburstMode(m);
  }, []);

  const toggle = useCallback(() => {
    return toggleSunburstMode();
  }, []);

  return [mode, update, toggle];
}

/**
 * Interactive toggle pill button to switch between 'Baru' (FX Lab) and 'Lama' (Classic God Rays)
 */
export function SunburstToggle({
  size = "md",
  className = "",
  showLabel = true,
  onToggled,
}: {
  size?: "xs" | "sm" | "md";
  className?: string;
  showLabel?: boolean;
  onToggled?: (mode: SunburstMode) => void;
}) {
  const [mode, , toggle] = useSunburstMode();
  const isNew = mode === "new";

  const handleToggle = (e: React.MouseEvent | React.PointerEvent) => {
    e.stopPropagation();
    sfx.click();
    const next = toggle();
    onToggled?.(next);
  };

  const pad =
    size === "xs"
      ? "px-2 py-0.5 text-[10px]"
      : size === "sm"
      ? "px-2.5 py-1 text-[11px]"
      : "px-3 py-1.5 text-xs";

  return (
    <button
      onPointerDown={handleToggle}
      className={`group relative flex items-center gap-1.5 rounded-full font-bold transition-all duration-200 select-none cursor-pointer backdrop-blur-md active:scale-95 shadow-md ${
        isNew
          ? "bg-gradient-to-r from-violet-600/90 via-fuchsia-600/90 to-amber-500/90 text-white border border-amber-300/50 shadow-violet-900/40 hover:brightness-110"
          : "bg-neutral-900/90 text-neutral-300 border border-white/20 hover:border-white/40 shadow-black/60 hover:text-white"
      } ${pad} ${className}`}
      title={isNew ? "Sunburst: Baru (FX Lab) — Klik untuk ganti ke Sunburst Lama" : "Sunburst: Lama — Klik untuk ganti ke Sunburst Baru (FX Lab)"}
    >
      <span
        className={`flex items-center justify-center rounded-full text-xs transition-transform duration-300 ${
          isNew ? "scale-110 text-amber-200 animate-spin" : "scale-100 text-neutral-400"
        }`}
        style={{ animationDuration: isNew ? "12s" : "0s" }}
      >
        {isNew ? "✨" : "⚡"}
      </span>

      {showLabel && (
        <span className="flex items-center gap-1 leading-none">
          <span className="opacity-75 font-normal text-[10px]">Sunburst:</span>
          <span className={isNew ? "text-amber-200 font-extrabold tracking-wide" : "text-white font-semibold"}>
            {isNew ? "Baru (FX Lab)" : "Lama"}
          </span>
        </span>
      )}

      {/* Mini switch indicator dot */}
      <span
        className={`h-2 w-2 rounded-full transition-all duration-300 ${
          isNew ? "bg-amber-300 shadow-[0_0_8px_#fde047]" : "bg-neutral-500"
        }`}
      />
    </button>
  );
}
