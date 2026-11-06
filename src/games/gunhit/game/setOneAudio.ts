/**
 * Exact slide-7 (Weapon Hit 71 Senjata / `games/game-4`) audio for slide 1.
 *
 * Slide 7 synthesises every sound procedurally in its own `SFX` class
 * (`games/game-4/src/game/audio.ts`). Instead of re-typing those envelopes we
 * play the real class, so SET 1 sounds identical to slide 7 — same graph,
 * same compressor (-14 / 6), same master gain, same stacked noise+tone
 * recipes, note for note: golden_fire/golden_hit, bh_charge/bh_fire/bh_hit,
 * sling_fire/sling_hit, sumpit_fire/sumpit_hit, shotgun_fire/pump/shotgun_hit
 * and soaker_fire/splash.
 */
import { sfx as slide7Sfx } from '../vendor/game-4/src/game/audio';

class SetOneAudio {
  private volume = 1;
  muted = false;

  private syncVolume() {
    const m = (slide7Sfx as unknown as { master?: GainNode | null }).master;
    if (m) m.gain.value = this.muted ? 0 : 0.8 * this.volume;
  }

  unlock() {
    if (this.muted || this.volume <= 0) return;
    try {
      slide7Sfx.ensure();
      this.syncVolume();
    } catch {
      /* Audio may be blocked before the first gesture. */
    }
  }

  setMuted(m: boolean) {
    this.muted = m;
    slide7Sfx.muted = m;
    this.syncVolume();
  }

  setVolume(v: number) {
    this.volume = Math.max(0, Math.min(1, v));
    this.syncVolume();
  }

  /** Plays a slide-7 sound id exactly as slide 7 would. */
  play(name: string) {
    if (this.muted || this.volume <= 0) return;
    try {
      slide7Sfx.ensure();
      this.syncVolume();
      slide7Sfx.play(name);
    } catch {
      /* Never break a frame for audio. */
    }
  }
}

export const setOneSfx = new SetOneAudio();
