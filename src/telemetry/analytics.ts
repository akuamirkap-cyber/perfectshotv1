/**
 * Telemetry, with nothing behind it by default.
 *
 * The shipped game has **no analytics SDK**: `sink` starts as `null`, so every
 * `track()` call is a no-op and nothing leaves the device. That is what
 * `docs/PRIVACY.md` promises, and `tests/telemetry.test.ts` keeps it true.
 *
 * When you *do* decide to measure retention, you plug a sink in at startup:
 *
 * ```ts
 * import { configureAnalytics } from './telemetry/analytics';
 * configureAnalytics({ id: 'firebase', track: (name, props) => logEvent(fb, name, props) });
 * ```
 *
 * Read docs/ANALYTICS.md first — adding a sink that transmits data means the
 * privacy policy and Play Console Data safety answers must change in the same
 * release.
 */
import { createSafeStorage, type KeyValueStore } from '../games/gunhit/game/safeStorage';

export type AnalyticsPrimitive = string | number | boolean;
export type AnalyticsProps = Record<string, AnalyticsPrimitive>;

export type TrackedEvent = {
  name: string;
  /** Wall-clock time of the event (ms). */
  t: number;
  /** Changes on every app launch, so a run can be grouped. */
  session: string;
  props: AnalyticsProps;
};

export interface AnalyticsSink {
  /** Short id shown in logs and in the debug panel ("firebase", "memory", …). */
  id: string;
  track(event: TrackedEvent): void;
}

const MAX_RECENT = 40;
const MAX_STRING = 160;
const MAX_PROPS = 24;

let sink: AnalyticsSink | null = null;
let sessionId = createSessionId();
let recent: TrackedEvent[] = [];

function createSessionId(): string {
  const random = Math.random().toString(36).slice(2, 8);
  return `${Date.now().toString(36)}-${random}`;
}

/** Keep values small, finite and serialisable; a sink must never receive junk. */
function sanitize(props: AnalyticsProps): AnalyticsProps {
  const out: AnalyticsProps = {};
  let count = 0;
  for (const [key, value] of Object.entries(props)) {
    if (count >= MAX_PROPS) break;
    if (typeof value === 'string') {
      out[key] = value.length > MAX_STRING ? `${value.slice(0, MAX_STRING)}…` : value;
    } else if (typeof value === 'number') {
      if (Number.isFinite(value)) out[key] = value;
    } else if (typeof value === 'boolean') {
      out[key] = value;
    }
    count += 1;
  }
  return out;
}

/**
 * Install (or remove, with `null`) the sink that receives events.
 * Returns a function that puts the previous sink — usually "none" — back.
 */
export function configureAnalytics(next: AnalyticsSink | null): () => void {
  const previous = sink;
  sink = next;
  return () => {
    sink = previous;
  };
}

/** `null` when the build sends nothing, which is the default. */
export function analyticsSinkId(): string | null {
  return sink?.id ?? null;
}

/**
 * Record one event. This is safe to call anywhere: it never throws, never
 * touches storage itself, and does nothing at all when no sink is configured.
 */
export function track(name: string, props: AnalyticsProps = {}): void {
  if (!sink) return;
  try {
    const event: TrackedEvent = {
      name,
      t: Date.now(),
      session: sessionId,
      props: sanitize(props),
    };
    recent.push(event);
    if (recent.length > MAX_RECENT) recent = recent.slice(-MAX_RECENT);
    sink.track(event);
  } catch {
    // Telemetry must never be the reason a run dies.
  }
}

/** The last few events, newest last — for bug reports and the debug overlay. */
export function recentEvents(): readonly TrackedEvent[] {
  return recent;
}

/** Resets the in-memory session id and buffer; used by tests. */
export function resetAnalyticsForTests(): void {
  sink = null;
  recent = [];
  sessionId = createSessionId();
}

/** A sink that only keeps events in memory — handy for QA builds and tests. */
export function createMemorySink(store: TrackedEvent[] = []): AnalyticsSink & { events: TrackedEvent[] } {
  return {
    id: 'memory',
    events: store,
    track(event) {
      store.push(event);
    },
  };
}

/** A sink that prints to the console — dev only, never shipped enabled. */
export function createConsoleSink(): AnalyticsSink {
  return {
    id: 'console',
    track(event) {
      // eslint-disable-next-line no-console
      console.info(`[analytics] ${event.name}`, event.props);
    },
  };
}

/**
 * A store the telemetry modules use for their own tiny bookkeeping (session
 * counters). It is a separate key namespace from the game's save data, so
 * clearing the save never breaks telemetry and vice versa.
 */
export const telemetryStorage: KeyValueStore = createSafeStorage();
