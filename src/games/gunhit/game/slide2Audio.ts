/**
 * Exact slide-2 audio for slide-1 weapons.
 *
 * Slide 2 (`games/fireworkgun`) ships its own synthesised sound engine —
 * `Sfx` — with a dedicated voice for every weapon it supports
 * (`shootBH`/`hitBH`/`voidBoom`, `shootShark`/`hitShark`/`sharkLeap`, …).
 * Instead of re-typing those envelopes (which is how the older `slide23Sfx`
 * approximation drifted), slide 1 now plays the real class, so every sound is
 * bit-for-bit the slide-2 one: same graph, same master gain (0.8), same
 * compressor, same reverb send, same numbers.
 *
 * Only weapons that exist in BOTH slides use this engine; everything else
 * keeps its existing gunhit sound.
 */
import { Sfx } from '../vendor/fireworkgun/src/game/sfx';

class Slide2Audio {
  private engine: Sfx | null = null;
  private volume = 1;
  muted = false;

  private syncVolume() {
    const m = (this.engine as unknown as { master?: GainNode | null } | null)?.master;
    if (m) m.gain.value = this.muted ? 0 : 0.8 * this.volume;
  }

  /** Lazily created so a page that never fires one of these guns stays silent. */
  private get e(): Sfx {
    if (!this.engine) {
      this.engine = new Sfx();
      this.engine.muted = this.muted;
      this.engine.init();
      this.syncVolume();
    }
    return this.engine;
  }

  unlock() {
    this.e.init();
    this.syncVolume();
  }

  setMuted(m: boolean) {
    this.muted = m;
    this.engine?.setMuted(m);
    this.syncVolume();
  }

  setVolume(v: number) {
    this.volume = Math.max(0, Math.min(1, v));
    this.syncVolume();
  }

  private play(run: (s: Sfx) => void) {
    if (this.muted) return;
    try {
      run(this.e);
    } catch {
      /* Audio may be blocked before the first gesture — never break a frame. */
    }
  }

  // ---------------------------------------------------------------- firework
  shootFirework() { this.play(s => s.shoot()); }
  hitFirework(idx: number) { this.play(s => s.hit(idx)); }
  boom(size = 1) { this.play(s => s.boom(size)); }
  skyLaunch() { this.play(s => s.skyLaunch()); }
  clearFirework() { this.play(s => s.clear()); }
  failFirework() { this.play(s => s.fail()); }

  // ---------------------------------------------------------------- black hole
  shootBH() { this.play(s => s.shootBH()); }
  hitBH(idx: number) { this.play(s => s.hitBH(idx)); }
  voidOpen() { this.play(s => s.voidOpen()); }
  voidBoom(size = 1) { this.play(s => s.voidBoom(size)); }
  clearBH() { this.play(s => s.clearBH()); }
  failBH() { this.play(s => s.failBH()); }

  // ---------------------------------------------------------------- shark
  shootShark() { this.play(s => s.shootShark()); }
  hitShark(idx: number) { this.play(s => s.hitShark(idx)); }
  sharkLeap() { this.play(s => s.sharkLeap()); }
  clearShark() { this.play(s => s.clearShark()); }
  failShark() { this.play(s => s.failShark()); }

  // ---------------------------------------------------------------- bamboo
  shootBamboo() { this.play(s => s.shootBamboo()); }
  hitBamboo(idx: number) { this.play(s => s.hitBamboo(idx)); }
  bambooSkyBoom(size = 1) { this.play(s => s.bambooSkyBoom(size)); }
  clearBamboo() { this.play(s => s.clearBamboo()); }
  failBamboo() { this.play(s => s.failBamboo()); }

  // ---------------------------------------------------------------- soaker
  shootSoaker() { this.play(s => s.shootSoaker()); }
  hitSoaker(idx: number) { this.play(s => s.hitSoaker(idx)); }
  soakerGeyser() { this.play(s => s.soakerGeyser()); }
  clearSoaker() { this.play(s => s.clearSoaker()); }
  failSoaker() { this.play(s => s.failSoaker()); }

  // ---------------------------------------------------------------- rainbow
  shootRainbow() { this.play(s => s.shootRainbow()); }
  hitRainbow(idx: number) { this.play(s => s.hitRainbow(idx)); }
  rainbowSky() { this.play(s => s.rainbowSky()); }
  clearRainbow() { this.play(s => s.clearRainbow()); }
  failRainbow() { this.play(s => s.failRainbow()); }

  // ---------------------------------------------------------------- bazooka
  shootBazooka() { this.play(s => s.shootBazooka()); }
  hitBazooka(idx: number) { this.play(s => s.hitBazooka(idx)); }
  bazookaSkyBoom(size = 1) { this.play(s => s.bazookaSkyBoom(size)); }
  clearBazooka() { this.play(s => s.clearBazooka()); }
  failBazooka() { this.play(s => s.failBazooka()); }

  // ---------------------------------------------------------------- rpg
  shootRpg() { this.play(s => s.shootRpg()); }
  hitRpg(idx: number) { this.play(s => s.hitRpg(idx)); }
  rpgSkyBoom(size = 1) { this.play(s => s.rpgSkyBoom(size)); }
  clearRpg() { this.play(s => s.clearRpg()); }
  failRpg() { this.play(s => s.failRpg()); }
}

export const slide2Sfx = new Slide2Audio();
