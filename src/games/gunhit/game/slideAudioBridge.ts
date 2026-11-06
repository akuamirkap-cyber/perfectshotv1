/**
 * Slide 1's master volume/mute has to reach the ported slides' own audio buses,
 * but those buses are declared next to artwork and engine code that must stay
 * out of the menu's first chunk. They register themselves here instead of
 * `audio.ts` importing them, so muting still works the moment they load.
 */
type SlideAudioHook = (muted: boolean, volume: number) => void;

const hooks = new Set<SlideAudioHook>();
let muted = false;
let volume = 1;

/** Called by a ported slide's audio module once it is loaded. */
export function registerSlideAudio(apply: SlideAudioHook) {
  hooks.add(apply);
  apply(muted, volume);
}

export function broadcastSlideAudio(nextMuted: boolean, nextVolume: number) {
  muted = nextMuted;
  volume = nextVolume;
  for (const fn of hooks) fn(muted, volume);
}
