/**
 * Back-navigation stack for the Android hardware/gesture back button.
 *
 * The app is a single page with a game pane, a menu, and a pile of overlays, so
 * "back" has to mean whatever is on top: close the newest panel, otherwise pause
 * the run, otherwise leave the app — exactly like a native Android game. Each
 * screen registers a handler that returns `true` when it consumed the press; the
 * most recently registered handler wins (and is skipped while inactive, because
 * both game panes stay mounted in the hub).
 *
 * Kept free of Capacitor imports so it can be unit tested on Node.
 */
export type BackHandler = () => boolean;

interface Entry {
  id: number;
  fn: BackHandler;
}

const stack: Entry[] = [];
let nextId = 1;

/** Register a handler; returns the unregister function. */
export function pushBackHandler(fn: BackHandler): () => void {
  const entry: Entry = { id: nextId++, fn };
  stack.push(entry);
  return () => {
    const index = stack.indexOf(entry);
    if (index >= 0) stack.splice(index, 1);
  };
}

/**
 * Run the handlers from newest to oldest and stop at the first one that
 * consumes the press. A throwing handler is skipped: a broken panel must never
 * make the back button dead.
 */
export function runBackHandlers(): boolean {
  for (let i = stack.length - 1; i >= 0; i -= 1) {
    try {
      // Only a strict `true` counts as consumed, so a handler that accidentally
      // returns a truthy object cannot silently swallow the press.
      if (stack[i].fn() === true) return true;
    } catch {
      /* keep walking the stack */
    }
  }
  return false;
}

/** Handlers currently registered — for tests and diagnostics. */
export function backHandlerCount(): number {
  return stack.length;
}

/** Drop every handler (tests only). */
export function clearBackHandlers(): void {
  stack.length = 0;
}
