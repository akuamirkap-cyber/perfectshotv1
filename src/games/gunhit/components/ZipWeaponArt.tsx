import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import type * as ZipArtModule from '../zipWeapons';

/**
 * The zip's weapons, drawn as live SVG instead of a baked picture.
 *
 * `svg-weapons-with-glow-animation.zip` animates its own art with CSS keyframes
 * (aura breath, shimmer, twinkle, meter LEDs, muzzle bursts). Baking that to a
 * canvas bitmap would freeze every one of them, so the markup is mounted as it
 * is: the browser runs the zip's CSS exactly like the zip's own page does. Only
 * placement is ours — the ink is scaled by its measured height and anchored by
 * the barrel tip, so the same numbers work in the menu, the armory and play.
 *
 * An identical copy of the artwork also rides underneath as an `<img>`. It is
 * the same vector, so nothing changes when the live layer paints; if a device
 * refuses to run the inline copy, the weapon is still on screen instead of
 * missing.
 */
let zipArtPromise: Promise<typeof ZipArtModule> | null = null;
const loadZipArt = () => (zipArtPromise ??= import('../zipWeapons'));

export default function ZipWeaponArt({
  id,
  height,
  anchor = 'center',
  className,
  style,
}: {
  id: string;
  /** Height of the weapon's ink, in CSS px. */
  height: number;
  /** `muzzle` pins the barrel tip to the container's (0,0); `center` centres the ink. */
  anchor?: 'muzzle' | 'center';
  className?: string;
  style?: CSSProperties;
}) {
  const [mod, setMod] = useState<typeof ZipArtModule | null>(null);
  useEffect(() => {
    let alive = true;
    void loadZipArt().then((m) => { if (alive) setMod(m); });
    return () => { alive = false; };
  }, []);

  const art = mod?.zipArt(id) ?? null;
  // The muzzle crystal gets a name of its own, so the page can fade the round
  // that has just been fired and let a new one grow back on the muzzle.
  const markup = useMemo(() => art && art.markup
    .replace('<g transform="translate(286 -20) scale(1.5)">',
             '<g class="zip-muzzle-gem" transform="translate(286 -20) scale(1.5)">')
    // The zip's own muzzle crystal stands down: the page puts design #3's
    // faceted round there instead, and fires it.
    .replace('</style>', '.zip-muzzle-gem{opacity:0}</style>'),
  [art]);
  const still = useMemo(
    () => (markup ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}` : ''),
    [markup],
  );
  if (!mod || !art) return null;
  const place = mod.placeZipArt(art, height, anchor);
  return (
    <div
      className={className}
      style={{
        position: 'absolute',
        width: place.size,
        height: place.size,
        // `muzzle` anchors the barrel tip on the container's (0,0); `center`
        // anchors the ink's centre on the container's middle.
        left: anchor === 'center' ? `calc(50% + ${place.left}px)` : place.left,
        top: anchor === 'center' ? `calc(50% + ${place.top}px)` : place.top,
        ...style,
      }}
      data-zip-weapon={id}
    >
      {/* Same vector, no script: the weapon cannot go missing. */}
      <img src={still} alt="" aria-hidden="true" draggable={false} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', userSelect: 'none' }} />
      {/* The animated copy: the zip's own markup, its own CSS, its own keyframes. */}
      <div
        aria-hidden="true"
        style={{ position: 'absolute', inset: 0 }}
        // The markup is generated from the zip's own components and carries its
        // own <style>; nothing here is user input.
        dangerouslySetInnerHTML={{ __html: markup ?? '' }}
      />
    </div>
  );
}

/** True once the zip's artwork chunk is in memory (for skins and tests). */
export function zipArtLoaded(): boolean {
  return zipArtPromise !== null;
}
