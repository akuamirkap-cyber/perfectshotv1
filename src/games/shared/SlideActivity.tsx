import { createContext, useContext, type ReactNode } from 'react';

// The games stay mounted when focus changes, but only the selected, visible slide
// may advance its simulation or schedule animation frames.
const SlideActivity = createContext(true);

export function SlideActivityProvider({ active, children }: { active: boolean; children: ReactNode }) {
  return <SlideActivity.Provider value={active}>{children}</SlideActivity.Provider>;
}

export function useSlideActive() {
  return useContext(SlideActivity);
}
