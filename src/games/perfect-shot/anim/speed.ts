/**
 * Global pacing for page entrances / exits.
 * Every page timeline (visual + audio share the same object) is multiplied by PAGE_K,
 * so the whole choreography stays in sync — just faster.
 */
export const PAGE_K = 0.78; // page entrance/exit speed (1 = original)
export const OVERLAY_RATE = 1.25; // themed transition overlays play 1.25× faster

const KEEP = new Set(["land", "pop"]); // fractions — never scale

export function scaleTL<T>(o: T, k = PAGE_K): T {
  if (typeof o === "function") {
    const fn = o as unknown as (...a: unknown[]) => unknown;
    return ((...a: unknown[]) => scaleTL(fn(...a), k)) as unknown as T;
  }
  if (o && typeof o === "object") {
    const r: Record<string, unknown> = {};
    for (const [key, v] of Object.entries(o as Record<string, unknown>)) {
      r[key] = typeof v === "number" ? (KEEP.has(key) ? v : Math.round(v * k)) : scaleTL(v, k);
    }
    return r as T;
  }
  return o;
}
