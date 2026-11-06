/**
 * Silence for the arsenal's *card* previews.
 *
 * The design/effect picker paints the real shot of every layer — slide 1's own
 * rounds, slide 7's, 9's, 11's and slide 2's — by running that layer's own
 * `fire()` recipe on a throwaway object, 18 times a second. Those recipes also
 * play their layer's voice, so opening the card of a charged gun (EMERALD,
 * RAILGUN, MOONBEAM, BUSTER…) used to repeat its charge-up whine over and over
 * while you were choosing: the "spam" sound on the picker.
 *
 * `silentPreview()` mutes every ported layer for the length of one paint, then
 * puts each layer's own mute state back — slide 1's mute button and slide 11's
 * stored preference stay untouched.
 */
import { sfx as setSevenSfx } from '../vendor/game-4/src/game/audio';
import { slide2Sfx } from './slide2Audio';
import { nineMuted, setNineMuted } from './setNineFx';
import { elevenMuted, setElevenMuted } from './setElevenFx';

interface MuteState {
  seven: boolean;
  two: boolean;
  nine: boolean;
  eleven: boolean;
}

let depth = 0;
let saved: MuteState | null = null;

function snapshot(): MuteState {
  return {
    seven: setSevenSfx.muted,
    two: slide2Sfx.muted,
    nine: nineMuted(),
    eleven: elevenMuted(),
  };
}

function apply(state: MuteState) {
  setSevenSfx.muted = state.seven;
  slide2Sfx.setMuted(state.two);
  setNineMuted(state.nine);
  setElevenMuted(state.eleven);
}

/** Run `fn` with every ported layer's audio muted, then restore it. */
export function silentPreview<T>(fn: () => T): T {
  if (depth === 0) {
    saved = snapshot();
    apply({ seven: true, two: true, nine: true, eleven: true });
  }
  depth++;
  try {
    return fn();
  } finally {
    depth--;
    if (depth === 0 && saved) {
      apply(saved);
      saved = null;
    }
  }
}
