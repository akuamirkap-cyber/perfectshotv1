import { useEffect, useRef } from 'react';
import { displaySize, W, H, worldTransform } from '../game/layout';
import { paintStageForest, paintStageGrass, paintStageVignette } from '../game/stageBackdrop';

/**
 * The menu's room is the gameplay room.
 *
 * The cover used to paint its own blue night sky while a run opened on Gun Hit's
 * teal forest, so pressing PLAY felt like walking into a different game. This
 * canvas paints `paintStageForest()` — the exact function the game uses for its
 * stage backdrop — plus the same bottom grass and vignette.
 *
 * It is drawn in *world* coordinates with the same `worldTransform()` the engine
 * uses, so landscape shows the forest lying on its side (trunks top and bottom,
 * grass on the left) exactly the way a stage does.
 */
export default function MenuStageBackdrop({
  orientation = 'portrait',
  animated = true,
}: {
  orientation?: 'portrait' | 'landscape';
  animated?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const paintRef = useRef<(time: number) => void>(() => {});

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fit the stage world into the frame the menu actually occupies, using the
    // engine's own mapping (portrait = identity, landscape = 90° rotation).
    const { w: displayW, h: displayH } = displaySize(orientation);
    const resize = () => {
      const cssW = canvas.clientWidth || displayW;
      const cssH = canvas.clientHeight || displayH;
      const dpr = Math.min(2, Math.max(1, Math.round((typeof window === 'undefined' ? 1 : window.devicePixelRatio) || 1)));
      const k = Math.min(cssW / displayW, cssH / displayH) * dpr;
      const next = Math.round(cssW * dpr);
      const nextH = Math.round(cssH * dpr);
      if (canvas.width !== next || canvas.height !== nextH) {
        canvas.width = next;
        canvas.height = nextH;
      }
      paintRef.current = (time: number) => {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.setTransform(...worldTransform(orientation, k));
        paintStageForest(ctx, 'orange');
        paintStageVignette(ctx);
        // The same wind-swept grass band the stage draws under the gun.
        paintStageGrass(ctx, time);
      };
      paintRef.current(0);
    };
    resize();
    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(() => resize()) : null;
    observer?.observe(canvas);
    if (!animated) return () => observer?.disconnect();

    let raf = 0;
    const started = typeof performance === 'undefined' ? 0 : performance.now();
    let last = 0;
    const loop = () => {
      // The grass is the only moving part; 30 fps is plenty and keeps the menu
      // from repainting a full-screen canvas on every display frame.
      const now = performance.now();
      if (now - last >= 33) {
        last = now;
        paintRef.current((now - started) / 1000);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      observer?.disconnect();
    };
  }, [animated, orientation]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      data-menu-stage-backdrop={orientation}
      data-stage-world={`${W}x${H}`}
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={{ width: '100%', height: '100%' }}
    />
  );
}
