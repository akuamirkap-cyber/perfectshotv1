import { useSyncExternalStore } from "react";
import { sfx } from "./sfx";

export function useSound() {
  return useSyncExternalStore(sfx.subscribe, sfx.getState, sfx.getState);
}

/** pointer-enter helper (mouse only) */
export const hoverSfx = (e: { pointerType: string }) => {
  if (e.pointerType === "mouse") sfx.hover();
};
