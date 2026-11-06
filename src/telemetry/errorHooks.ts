/**
 * Crash / error hooks.
 *
 * Without an error reporter installed (which is the shipping default), an
 * exception on a phone is invisible: the player sees a frozen screen and you get
 * a one-star review. These hooks capture the error, keep the last few details in
 * memory, and forward them to whatever analytics sink is configured — so
 * enabling a reporter later needs no changes here.
 */
import { track } from './analytics';

const MAX_MESSAGES = 20;

type ErrorEventLike = { message?: string; filename?: string; lineno?: number; colno?: number; error?: unknown };
type RejectionEventLike = { reason?: unknown };

let installed = false;
const seen = new Set<string>();

function messageOf(value: unknown): string {
  if (typeof value === 'string') return value;
  if (value instanceof Error) return `${value.name}: ${value.message}`;
  if (value && typeof value === 'object' && 'message' in value) return String((value as { message: unknown }).message);
  try {
    return JSON.stringify(value).slice(0, 300);
  } catch {
    return 'unknown error';
  }
}

/**
 * Report an error once per message per launch. A broken render loop can fire the
 * same error hundreds of times a second; reporting each one would drown the sink
 * and, with a network sink, hammer the network.
 */
export function reportError(source: string, error: unknown, extra: Record<string, string | number | boolean> = {}): void {
  const message = messageOf(error).slice(0, 300);
  const key = `${source}|${message}`;
  if (seen.has(key)) return;
  if (seen.size >= MAX_MESSAGES) return;
  seen.add(key);
  track('error', { source, message, ...extra });
}

/** Attach the window-level hooks. Safe to call more than once. */
export function installErrorHooks(target?: Pick<Window, 'addEventListener' | 'removeEventListener'>): () => void {
  const host = target ?? (typeof window === 'undefined' ? null : window);
  if (!host || installed) return () => undefined;
  installed = true;

  const onError = (event: Event) => {
    const detail = event as unknown as ErrorEventLike & Event;
    // Resource loads (an <img> that 404s) also fire `error` on window; they have
    // no message and are not crashes, so they are skipped.
    if (!detail.message) return;
    reportError('window', detail.error ?? detail.message, {
      file: (detail.filename ?? '').split('/').pop() ?? '',
      line: detail.lineno ?? 0,
      column: detail.colno ?? 0,
    });
  };

  const onRejection = (event: Event) => {
    const detail = event as unknown as RejectionEventLike & Event;
    reportError('promise', detail.reason ?? 'unhandled rejection');
  };

  host.addEventListener('error', onError);
  host.addEventListener('unhandledrejection', onRejection);

  return () => {
    host.removeEventListener('error', onError);
    host.removeEventListener('unhandledrejection', onRejection);
    installed = false;
  };
}

/** Test seam: forget which messages were already reported. */
export function resetErrorHooksForTests(): void {
  installed = false;
  seen.clear();
}
