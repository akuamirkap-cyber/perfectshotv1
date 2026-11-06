import { useEffect, useRef } from 'react';
import { drawBreakerDiamond } from './diamondArt';
import { useSlideActive } from './SlideActivity';

/** The game's faceted boulder-core diamond, animated on a small 2D canvas. */
export default function DiamondSprite({ size, className = '', fillRatio = 0.76 }: { size: number; className?: string; fillRatio?: number }) {
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
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, size, size);
      ctx.save();
      ctx.translate(size / 2, size / 2);
      ctx.scale((size * fillRatio) / 108, (size * fillRatio) / 108);
      drawBreakerDiamond(ctx, 0, 0, now / 1000, 1.08);
      ctx.restore();
      if (active) raf = requestAnimationFrame(draw);
    };
    draw(performance.now());
    return () => cancelAnimationFrame(raf);
  }, [size, active, fillRatio]);

  return <canvas ref={ref} className={className} style={{ width: size, height: size }} aria-hidden="true" />;
}
