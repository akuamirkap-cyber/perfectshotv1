/**
 * QA switch for telemetry: `?telemetry=console`.
 *
 * Only ever active in a development build (`import.meta.env.DEV`) — a release
 * build ignores the query string entirely, so a shipped APK cannot be talked
 * into printing or collecting events by a URL.
 */
import { configureAnalytics, createConsoleSink, createMemorySink, type TrackedEvent } from './analytics';

export function installDebugSinkFromUrl(
  search: string,
  dev: boolean,
  onEvents?: (sink: { id: string; events: TrackedEvent[] }) => void,
): string | null {
  if (!dev) return null;
  const mode = new URLSearchParams(search).get('telemetry');
  if (mode !== 'console' && mode !== 'memory') return null;
  if (mode === 'console') {
    configureAnalytics(createConsoleSink());
    return 'console';
  }
  const sink = createMemorySink();
  configureAnalytics(sink);
  onEvents?.(sink);
  return 'memory';
}
