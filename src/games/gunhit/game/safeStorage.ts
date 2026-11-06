/**
 * Storage that can never take the game down.
 *
 * The hub is shown inside the preview's cross-origin iframe, and a browser with
 * third-party storage blocked does not hand back `null` for `localStorage` —
 * touching the property itself throws `SecurityError`. Slide 1 reads its coins,
 * weapon, collection and quests from storage inside the very first render, so a
 * single throw there unmounted the whole React tree: the page came up blank with
 * nothing but `SecurityError: Access is denied for this document` in the console.
 *
 * `createSafeStorage()` answers the same three calls and never throws. On top of
 * the memory fallback, the page shim in `vite.config.ts` persists the refused
 * values to IndexedDB and `window.name`, so progress still survives a reload
 * wherever the browser allows either of those; `savedValues` is how slide 1
 * waits for that restore before it reads the first value.
 *
 * The fallback also keeps the session consistent when storage exists but rejects
 * a write (quota, private mode).
 */
export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/** How the real `localStorage` is reached; injectable so the fallback is testable. */
export type StorageSource = () => Storage | null;

function defaultSource(): Storage | null {
  return (globalThis as { localStorage?: Storage }).localStorage ?? null;
}

/**
 * A `localStorage`-shaped object that never throws.
 *
 * Every read is answered from memory first and then from the browser's store,
 * so a value written while storage was refused is still readable in the same
 * session.
 */
export function createSafeStorage(source: StorageSource = defaultSource): KeyValueStore {
  const memory = new Map<string, string>();
  let real: Storage | null = null;
  // Reading one key is what actually proves the origin may use storage: in the
  // blocked case the *getter* throws, not `getItem`.
  try {
    real = source();
    real?.getItem('gunhit_storage_probe');
  } catch {
    real = null;
  }

  if (!real) {
    return {
      getItem: (key) => (memory.has(key) ? memory.get(key)! : null),
      setItem: (key, value) => { memory.set(key, String(value)); },
      removeItem: (key) => { memory.delete(key); },
    };
  }

  const store = real;
  return {
    getItem: (key) => {
      try {
        const live = store.getItem(key);
        return live ?? (memory.has(key) ? memory.get(key)! : null);
      } catch {
        return memory.has(key) ? memory.get(key)! : null;
      }
    },
    setItem: (key, value) => {
      memory.set(key, String(value));
      try {
        store.setItem(key, String(value));
      } catch {
        /* quota / private mode: the session keeps the value in memory */
      }
    },
    removeItem: (key) => {
      memory.delete(key);
      try {
        store.removeItem(key);
      } catch {
        /* nothing to undo when storage refuses the call */
      }
    },
  };
}

/** The store slide 1 uses for every one of its saved values. */
export const storage: KeyValueStore = createSafeStorage();

/** What the page shim reports about the values it is still restoring. */
export interface SavedValuesState {
  /** `true` while the shim is still reading the fallback store. */
  pending: boolean;
  /** Resolves when the shim is done, whatever the outcome. */
  settled: Promise<unknown> | null;
}

export interface ReadinessTracker {
  /** May the game read its saved values yet? */
  isReady(): boolean;
  /**
   * Called once when the values land; returns an unsubscribe function. Always
   * re-check `isReady()` after subscribing: the restore may have finished in
   * between, in which case no call is coming.
   */
  subscribe(listener: () => void): () => void;
}

/**
 * Whether saved values are readable *now*.
 *
 * A browser that refuses `localStorage` still has IndexedDB and `window.name`,
 * but both are restored asynchronously (or, for `indexedDB`, after a round trip),
 * so slide 1 must not read its coins/weapon/collection before the shim is done:
 * it would paint the defaults and then never pick the saved values up. When
 * nothing needs restoring this answers `true` on the first call, so the normal
 * path never renders a waiting state.
 */
export function createReadinessTracker(read: () => SavedValuesState | null): ReadinessTracker {
  let ready = false;
  let watching = false;
  const listeners = new Set<() => void>();

  const settle = () => {
    if (ready) return;
    ready = true;
    const waiting = [...listeners];
    listeners.clear();
    waiting.forEach((listener) => listener());
  };

  const probe = () => {
    if (ready || watching) return;
    let state: SavedValuesState | null = null;
    try {
      state = read();
    } catch {
      state = null;
    }
    if (!state || !state.pending || !state.settled) {
      settle();
      return;
    }
    watching = true;
    state.settled.then(settle, settle);
  };

  return {
    isReady: () => {
      probe();
      return ready;
    },
    subscribe: (listener) => {
      probe();
      if (ready) return () => {};
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

interface SavedValuesGlobal {
  __gunhitStorageReady?: Promise<unknown> | null;
  __gunhitStoragePending?: boolean;
}

/** The state the page shim leaves on `window` (absent when the shim never ran). */
export const savedValues: ReadinessTracker = createReadinessTracker(() => {
  const scope = globalThis as SavedValuesGlobal;
  const settled = scope.__gunhitStorageReady ?? null;
  return { pending: scope.__gunhitStoragePending === true, settled };
});
