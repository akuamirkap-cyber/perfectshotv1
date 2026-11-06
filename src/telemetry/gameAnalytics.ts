/**
 * Game A's funnel: start → clear → end.
 *
 * The calls are cheap and always safe; with no analytics sink configured they do
 * nothing but keep a couple of numbers for the current run.
 *
 * Event names are stable — if you ever plug a real sink in, these are the ones
 * that answer "where do players stop?":
 *
 *   session_start  { session_index, days_since_install, days_played, returning_d1/7/30, app_version }
 *   stage_start    { stage, mode, weapon, boss, cleared_this_run }
 *   stage_clear    { stage, boss, cleared_this_run, run_ms }
 *   run_end        { outcome: game_over | abandoned, stage, score, coins, cleared, run_ms, weapon, mode }
 *   save_state     { status, from_version, to_version, repaired }
 */
import { track } from './analytics';
import { sessionProps, sessionTracker } from './session';
import { APP_VERSION } from './version';

export type RunOutcome = 'game_over' | 'abandoned';

type RunState = {
  startedAt: number;
  cleared: number;
  stage: number;
  weapon: string;
  mode: string;
};

let run: RunState | null = null;

/** Count this launch and report the retention numbers. Called once at startup. */
export function trackSessionStart(now = Date.now()) {
  const info = sessionTracker.noteStart();
  track('session_start', { ...sessionProps(info), app_version: APP_VERSION });
  return info;
}

export function trackStageStart(
  input: { stage: number; mode: string; weapon: string; boss: boolean },
  now = Date.now(),
): void {
  if (!run) {
    run = { startedAt: now, cleared: 0, stage: input.stage, weapon: input.weapon, mode: input.mode };
  }
  run.stage = Math.max(run.stage, input.stage);
  track('stage_start', {
    stage: input.stage,
    mode: input.mode,
    weapon: input.weapon,
    boss: input.boss,
    cleared_this_run: run.cleared,
  });
}

export function trackStageClear(input: { stage: number; boss: boolean; coins?: number }, now = Date.now()): void {
  if (run) run.cleared += 1;
  track('stage_clear', {
    stage: input.stage,
    boss: input.boss,
    cleared_this_run: run?.cleared ?? 1,
    run_ms: run ? Math.max(0, now - run.startedAt) : 0,
    ...(typeof input.coins === 'number' ? { coins: input.coins } : {}),
  });
}

export function trackRunEnd(
  input: { outcome: RunOutcome; stage: number; score: number; coins: number },
  now = Date.now(),
): void {
  const state = run;
  track('run_end', {
    outcome: input.outcome,
    stage: input.stage,
    score: input.score,
    coins: input.coins,
    cleared: state?.cleared ?? 0,
    run_ms: state ? Math.max(0, now - state.startedAt) : 0,
    weapon: state?.weapon ?? 'unknown',
    mode: state?.mode ?? 'classic',
  });
  run = null;
}

/**
 * How the save file looked at boot: `fresh` (first launch), `migrated` (older
 * schema upgraded), `repaired` (checksum or values did not add up), or
 * `reset-for-downgrade`. A run of `repaired` events is the only early warning
 * that players lose progress on a specific device.
 */
export function trackSaveState(report: { status: string; fromVersion: number; toVersion: number; repaired: string[] }): void {
  track('save_state', {
    status: report.status,
    from_version: report.fromVersion,
    to_version: report.toVersion,
    repaired: report.repaired.length,
    ...(report.repaired.length ? { repaired_keys: report.repaired.join(',') } : {}),
  });
}

/** The run in progress, for debugging; `null` between runs. */
export function currentRun(): RunState | null {
  return run ? { ...run } : null;
}

/** Test seam. */
export function resetGameAnalyticsForTests(): void {
  run = null;
}
