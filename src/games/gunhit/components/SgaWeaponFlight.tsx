import { useLayoutEffect, useRef } from 'react';
import { WEAPON_FLIGHT_MS } from './weaponFlightTiming';
export { WEAPON_FLIGHT_MS };

type Rect = { x: number; y: number; w: number; h: number };
export type SgaWeaponFlightData = { id: number; image: string; from: Rect; to: Rect };

/**
 * How long the captured menu frame travels before it lands on the gun slot.
 * The live canvas gun stays hidden for exactly this long, so the hand-off never
 * shows two weapons at once. The value itself lives in `weaponFlightTiming` so
 * the menu can schedule the hand-off without loading this overlay.
 */

/** Carries the actual SGA menu-canvas frame into the gameplay weapon slot. */
export default function SgaWeaponFlight({ flight }: { flight: SgaWeaponFlightData }) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;
    const { from, to } = flight;
    const scale = from.h / to.h;
    const dx = from.x + from.w / 2 - (to.x + to.w / 2);
    const dy = from.y - to.y;
    const animation = node.animate([
      { transform: `translate(${dx}px, ${dy}px) scale(${scale})`, easing: 'cubic-bezier(.3,0,.6,1)' },
      { offset: 0.18, transform: `translate(${dx}px, ${dy - 18}px) scale(${scale * 1.04}) rotate(-3deg)`, easing: 'cubic-bezier(.55,0,.85,.4)' },
      { offset: 0.78, transform: 'translate(0, 0) scale(1.06, .9)' },
      { offset: 0.9, transform: 'translate(0, -6px) scale(.98, 1.03)' },
      { transform: 'none' },
    ], { duration: WEAPON_FLIGHT_MS, fill: 'both' });
    return () => animation.cancel();
  }, [flight]);

  return (
    <div
      className="pointer-events-none absolute z-[60]"
      style={{ left: flight.to.x, top: flight.to.y, width: flight.to.w, height: flight.to.h }}
      aria-hidden="true"
    >
      <div ref={ref} className="h-full w-full" style={{ transformOrigin: '50% 0%' }}>
        <img src={flight.image} alt="" className="h-full w-full object-contain" />
      </div>
    </div>
  );
}
