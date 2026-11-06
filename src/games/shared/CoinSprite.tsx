import { useEffect, useRef } from 'react';
import { drawBreakerCoin } from './coinArt';
import { useSlideActive } from './SlideActivity';

/** Small animated copy of the game's gold coin, suitable for compact HUD counters. */
export default function CoinSprite({ size, className = '' }: { size: number; className?: string }) {
  const active = useSlideActive();
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(size * dpr);
    canvas.height = Math.round(size * dpr);
    let raf = 0;
    const draw = (now: number) => {
      const time = now / 1000;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, size, size);
      // Keep the coin face legible while it gently flips; avoid collapsing into a bright sliver.
      const flip = 0.68 + Math.abs(Math.cos(time * 2.8)) * 0.32;
      drawBreakerCoin(ctx, size / 2, size / 2, size * 0.37, time, 0, flip, false, false);
      if (active) raf = requestAnimationFrame(draw);
    };
    draw(performance.now());
    return () => cancelAnimationFrame(raf);
  }, [size, active]);

  return <canvas ref={ref} className={className} style={{ width: size, height: size }} aria-hidden="true" />;
}
