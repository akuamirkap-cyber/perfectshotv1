import MenuBackdrop, { vividFor } from './MenuBackdrop';
import type { SgaBackgroundTheme } from '../game/backgroundThemes';

export type MenuEnvironmentTheme = SgaBackgroundTheme;

/** Deterministic gold sparkles for the menu night sky. */
const SPARKLES = [
  { l: 12, t: 18, s: 9, d: 0 },
  { l: 26, t: 9, s: 6, d: 0.7 },
  { l: 44, t: 20, s: 7, d: 1.4 },
  { l: 61, t: 11, s: 10, d: 0.4 },
  { l: 76, t: 26, s: 6, d: 1.1 },
  { l: 88, t: 14, s: 8, d: 1.8 },
  { l: 8, t: 42, s: 5, d: 2.2 },
  { l: 68, t: 52, s: 6, d: 0.9 },
  { l: 94, t: 46, s: 5, d: 1.6 },
];

/**
 * Game A's menu world is the reference game's own scenery. Every selectable
 * background (HUTAN, PAGI, TOWN, SALJU, MALAM, PERANG, MISTIS, KRISTAL, NEON,
 * KUBAH, CYBER, NEBULA) is drawn by Game B's backdrop component, so the two
 * games can never drift apart in background art.
 *
 * `vivid` is the menu showroom pass used in landscape: the default forest world
 * is regraded to the deep blue night of the menu art (blue layered hills, warm
 * corner light, gold sparkles) instead of the muted teal of the gameplay world.
 * Picking another background in SETTING keeps that background untouched.
 */
export default function MenuEnvironment({ theme, vivid = false }: { theme: MenuEnvironmentTheme; vivid?: boolean }) {
  const night = vivid && vividFor(theme);
  return (
    <div className="absolute inset-0 overflow-hidden" data-menu-vivid={night ? 'on' : undefined}>
      <div className="absolute inset-0" style={night ? { filter: 'saturate(1.15) brightness(1.06)' } : undefined}>
        <MenuBackdrop theme={theme} vivid={night} />
      </div>
      {night && (
        <>
          {/* cool light pool behind the showcase */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{ background: 'radial-gradient(ellipse 46% 56% at 26% 48%, rgba(120,200,255,.22), transparent 68%)' }}
          />
          {/* warm corner light bleeding in from the top right */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{ background: 'radial-gradient(ellipse 58% 48% at 100% -6%, rgba(255,166,48,.32), transparent 64%)' }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{ background: 'linear-gradient(180deg, transparent 66%, rgba(4,14,30,.42) 100%)' }}
          />
          {/* gold sparkles */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            {SPARKLES.map((sp, i) => (
              <span
                key={i}
                className="mm-spark absolute"
                style={{
                  left: `${sp.l}%`,
                  top: `${sp.t}%`,
                  width: sp.s,
                  height: sp.s,
                  animationDelay: `${sp.d}s`,
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
