/**
 * Local session bookkeeping.
 *
 * Retention normally needs a server: you only know a player came back on day 3
 * because something told you. This game has no server, so the device counts for
 * itself — how many launches, how many distinct days, how old the install is —
 * and hands those numbers to any analytics sink as plain event properties. With
 * no sink configured (the default) the numbers never leave the phone.
 */
import { telemetryStorage, type AnalyticsProps } from './analytics';
import type { KeyValueStore } from '../games/gunhit/game/safeStorage';

const KEY = 'sga.telemetry.session.v1';
const MAX_DAYS = 90;
const DAY_MS = 86_400_000;

export type SessionInfo = {
  /** 1 on the very first launch, 2 on the next, … */
  sessionIndex: number;
  daysSinceInstall: number;
  /** Distinct calendar days the game has been opened. */
  daysPlayed: number;
  /** Came back at least one / seven / thirty days after installing. */
  returningD1: boolean;
  returningD7: boolean;
  returningD30: boolean;
};

type SessionRecord = {
  install: number;
  sessions: number;
  last: number;
  days: string[];
};

const dayKey = (time: number) => {
  const date = new Date(time);
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
};

function read(store: KeyValueStore): SessionRecord | null {
  try {
    const raw = store.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SessionRecord>;
    if (!parsed || typeof parsed.install !== 'number') return null;
    return {
      install: parsed.install,
      sessions: typeof parsed.sessions === 'number' ? parsed.sessions : 0,
      last: typeof parsed.last === 'number' ? parsed.last : parsed.install,
      days: Array.isArray(parsed.days) ? parsed.days.filter((day) => typeof day === 'string') : [],
    };
  } catch {
    return null;
  }
}

function describe(record: SessionRecord, now: number): SessionInfo {
  const daysSinceInstall = Math.max(0, Math.floor((now - record.install) / DAY_MS));
  return {
    sessionIndex: Math.max(1, record.sessions),
    daysSinceInstall,
    daysPlayed: record.days.length,
    returningD1: daysSinceInstall >= 1,
    returningD7: daysSinceInstall >= 7,
    returningD30: daysSinceInstall >= 30,
  };
}

export function createSessionTracker(store: KeyValueStore, now: () => number = () => Date.now()) {
  return {
    /** Count this launch and return the numbers (writes only when needed). */
    noteStart(): SessionInfo {
      const time = now();
      const record = read(store) ?? { install: time, sessions: 0, last: time, days: [] };
      record.sessions += 1;
      record.last = time;
      const today = dayKey(time);
      if (!record.days.includes(today)) {
        record.days = [...record.days, today].slice(-MAX_DAYS);
      }
      try {
        store.setItem(KEY, JSON.stringify(record));
      } catch {
        // A full or refused store must not stop the game from starting.
      }
      return describe(record, time);
    },
    /** Peek without counting a launch. */
    peek(): SessionInfo {
      const time = now();
      const record = read(store);
      if (!record) return describe({ install: time, sessions: 1, last: time, days: [dayKey(time)] }, time);
      return describe(record, time);
    },
    /** Wipe the counters (used by the "reset progress" action). */
    clear() {
      try {
        store.removeItem(KEY);
      } catch {
        // ignore
      }
    },
  };
}

export type SessionTracker = ReturnType<typeof createSessionTracker>;

/** The app-wide tracker, backed by the same safe storage as the game saves. */
export const sessionTracker: SessionTracker = createSessionTracker(telemetryStorage);

/** Event properties that describe this launch, ready to attach to any event. */
export function sessionProps(info: SessionInfo): AnalyticsProps {
  return {
    session_index: info.sessionIndex,
    days_since_install: info.daysSinceInstall,
    days_played: info.daysPlayed,
    returning_d1: info.returningD1,
    returning_d7: info.returningD7,
    returning_d30: info.returningD30,
  };
}
