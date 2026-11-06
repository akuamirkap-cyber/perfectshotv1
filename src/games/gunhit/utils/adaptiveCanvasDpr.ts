/**
 * Conservative mobile render-resolution governor. It changes only the canvas
 * backing-store density, not simulation speed, particle counts or artwork.
 * A single expensive shot or a background-tab pause must not lower quality.
 */
export class AdaptiveCanvasDpr {
  private enabled = false;
  private ceiling = 1;
  private floor = 1;
  private density = 1;
  private elapsed = 0;
  private frames = 0;
  private slowFrames = 0;
  private stableWindows = 0;

  reset(baseDensity: number, enabled: boolean): void {
    this.ceiling = baseDensity;
    this.floor = Math.min(baseDensity, 1.1);
    this.density = baseDensity;
    this.enabled = enabled && baseDensity > this.floor;
    this.pause();
  }

  /** Discard incomplete measurements while paused or hidden, retaining density. */
  pause(): void {
    this.elapsed = 0;
    this.frames = 0;
    this.slowFrames = 0;
    this.stableWindows = 0;
  }

  /**
   * Feed one visible, active requestAnimationFrame interval in milliseconds.
   * Returns a new DPR only when the backing store should actually be resized.
   */
  recordFrame(ms: number): number | null {
    // Do not confuse resuming a suspended tab, or a clock discontinuity, with
    // sustained rendering load. The simulation has its own independent dt cap.
    if (!this.enabled || !Number.isFinite(ms) || ms <= 0 || ms > 1000) {
      this.pause();
      return null;
    }
    // A single long stall contributes only one slow frame, not an entire
    // measurement window, while repeated long frames still lower the DPR.
    this.elapsed += Math.min(ms, 200);
    this.frames++;
    if (ms > 25) this.slowFrames++;
    if (this.elapsed < 2400) return null;

    const slowFraction = this.slowFrames / this.frames;
    this.elapsed = 0;
    this.frames = 0;
    this.slowFrames = 0;
    let next = this.density;
    if (slowFraction >= 0.35) {
      this.stableWindows = 0;
      next = Math.max(this.floor, this.density - 0.1);
    } else if (slowFraction <= 0.08) {
      // Recover only after nearly ten seconds of consistently smooth frames,
      // so density does not oscillate during repeated shooting.
      if (++this.stableWindows >= 4) {
        next = Math.min(this.ceiling, this.density + 0.1);
        this.stableWindows = 0;
      }
    } else {
      this.stableWindows = 0;
    }
    if (next === this.density) return null;
    next = Math.min(this.ceiling, Math.max(this.floor, Math.round(next * 100) / 100));
    if (next === this.density) return null;
    this.density = next;
    return next;
  }
}
