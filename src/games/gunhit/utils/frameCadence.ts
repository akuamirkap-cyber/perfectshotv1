/**
 * Frame-cadence governor for high-refresh phones.
 *
 * A 120 Hz screen asks the game for a frame every 8.3 ms. When the device cannot
 * hold that (the work itself starts to fill the interval), the browser delivers
 * an *uneven* mix of 8.3 ms and 16.7 ms frames — which reads as judder even
 * though the average frame rate is still "high". Locking the drawing to the
 * 60 Hz grid in exactly that situation trades a jittery 80-100 fps for a rock
 * steady 60, which is what "smooth" actually looks like.
 *
 * It only ever skips *drawing*. Simulation keeps running on every animation
 * frame, the resolution governor keeps its own job, and nothing about the
 * artwork changes. On a 60 Hz screen, or while there is headroom, it does
 * nothing at all.
 */
export class FrameCadence {
  /** Draw at most one frame per 60 Hz tick while the lock is on. */
  private capped = false;
  private interval = 16.7;
  private work = 0;
  private warm = 0;
  private strained = 0;
  private relaxed = 0;
  private lastDraw = -Infinity;

  reset(): void {
    this.capped = false;
    this.interval = 16.7;
    this.work = 0;
    this.warm = 0;
    this.strained = 0;
    this.relaxed = 0;
    this.lastDraw = -Infinity;
  }

  get isCapped(): boolean {
    return this.capped;
  }

  /** Exponential averages of what the loop can actually observe. */
  private sample(intervalMs: number, workMs: number): void {
    // Ignore tab switches and other clock discontinuities.
    if (!Number.isFinite(intervalMs) || intervalMs <= 0 || intervalMs > 200) return;
    this.interval += (intervalMs - this.interval) * 0.08;
    this.work += (Math.max(0, workMs) - this.work) * 0.12;
  }

  /**
   * Decide whether this animation frame should draw.
   *
   * @param now      the timestamp handed to the RAF callback
   * @param interval milliseconds since the previous callback
   * @param work     milliseconds the previous frame spent in update + render
   */
  shouldRender(now: number, interval: number, work: number): boolean {
    this.sample(interval, work);
    if (this.warm < 30) {
      this.warm++;
      this.lastDraw = now;
      return true;
    }
    if (!this.capped) {
      // Faster than 60 Hz display, and the frame work is eating the interval.
      const highRefresh = this.interval < 12.5;
      const strained = highRefresh && this.work > 5.5;
      this.strained = strained ? this.strained + 1 : 0;
      if (this.strained >= 45) {
        this.capped = true;
        this.strained = 0;
        this.relaxed = 0;
      }
    } else {
      // Recover only after a long stretch with real headroom again.
      this.relaxed = this.work < 4 ? this.relaxed + 1 : 0;
      if (this.relaxed >= 180) {
        this.capped = false;
        this.relaxed = 0;
      }
    }
    if (!this.capped) {
      this.lastDraw = now;
      return true;
    }
    if (now - this.lastDraw < (1000 / 61)) return false;
    this.lastDraw = now;
    return true;
  }
}
