import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { juicyAudio } from '../utils/juicyAudio';
import {
  DropletTransform,
  FaceState,
  ImpactFxItem,
  LetterTransform,
  SansWordmarkSvg,
  StudioCharTransform,
} from './SansWordmarkSvg';

export type IntroPreset = 'classic' | 'mega_squeeze' | 'jelly_wave' | 'balloon_pop';

interface SpringValue {
  pos: number;
  vel: number;
  target: number;
}

interface LetterPhysics {
  x: SpringValue;
  y: SpringValue;
  // Unified phase-locked squash/stretch spring (s < 0 = wide squash, s > 0 = tall stretch)
  squash: SpringValue;
  rotation: SpringValue;
  skewX: SpringValue;
  jellyBendX: SpringValue;
  opacity: number;
  inAir: boolean;
}

function createSpring(initial: number, target: number = initial): SpringValue {
  return { pos: initial, vel: 0, target };
}

// 4x Sub-stepped Symplectic Spring Integrator for 120Hz/60Hz butter-smooth motion
export function stepSpring(
  s: SpringValue,
  stiffness: number,
  damping: number,
  dt: number,
) {
  const subSteps = 4;
  const subDt = dt / subSteps;
  const decay = Math.exp(-damping * subDt);

  for (let i = 0; i < subSteps; i++) {
    const force = (s.target - s.pos) * stiffness;
    s.vel = (s.vel + force * subDt) * decay;
    s.pos += s.vel * subDt;
  }
}

/** Keep the intro's timeline in real time without destabilising its springs. */
export function introFrameDelta(elapsedSeconds: number, speed: number) {
  const elapsed = Math.max(0, elapsedSeconds);
  return { timeline: elapsed * speed, physics: Math.min(0.025, elapsed) * speed };
}

// Exact studio physics & scale parameters from 2d-game-intro-animation (1).zip
export const SANS_INTRO_DEFAULTS = {
  preset: 'classic' as IntroPreset,
  logoScale: 0.7,
  juiciness: 1.15,
  bounciness: 1.12,
  speedMultiplier: 1.0,
  redBgHex: '#F11E1E',
} as const;

export interface SansStudioLoadingProps {
  onComplete: () => void;
  active?: boolean;
}

export default function SansStudioLoading({
  onComplete,
  active = true,
}: SansStudioLoadingProps) {
  const { logoScale, juiciness, bounciness, speedMultiplier, redBgHex } =
    SANS_INTRO_DEFAULTS;

  // Mochi Garden Audio State (synced with juicyAudio from 2d-game-intro-animation (1).zip)
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => juicyAudio.enabled);
  const [soundReady, setSoundReady] = useState<boolean>(() => juicyAudio.ready);
  const [soundVolume, setSoundVolume] = useState<number>(() => juicyAudio.volume);

  // Curtain overlay opacity: 1 = dark cinema curtain, 0 = fully visible red stage
  const [fadeOverlayOpacity, setFadeOverlayOpacity] = useState<number>(1);
  const [stageExitScale, setStageExitScale] = useState<number>(1);
  // Once the red stage fades into the dark curtain at 3.02s, hide red stage & lift curtain to reveal SGA
  const [stageHidden, setStageHidden] = useState<boolean>(false);
  const stageHiddenRef = useRef<boolean>(false);

  // Interactive Hover & Squeeze State
  const [hoveredLetter, setHoveredLetter] = useState<number | null>(null);
  const [activeSqueezeLetter, setActiveSqueezeLetter] = useState<number | null>(null);

  // Render State for SVG
  const [renderState, setRenderState] = useState<{
    letters: [LetterTransform, LetterTransform, LetterTransform, LetterTransform];
    droplets: [DropletTransform, DropletTransform, DropletTransform, DropletTransform];
    studioChars: StudioCharTransform[];
    face: FaceState;
    globalSqueeze: { scaleX: number; scaleY: number; y: number; rotation: number };
    impacts: ImpactFxItem[];
  }>(() => ({
    letters: [0, 1, 2, 3].map(() => ({
      x: 0,
      y: -210,
      scaleX: 0.9,
      scaleY: 1.12,
      rotation: 0,
      skewX: 0,
      jellyBendX: 0,
      jellySquishY: 0,
      opacity: 0,
    })) as [LetterTransform, LetterTransform, LetterTransform, LetterTransform],
    droplets: [0, 1, 2, 3].map(() => ({
      scale: 0,
      distance: 0,
      rotation: 0,
      stretch: 1,
      opacity: 0,
    })) as [DropletTransform, DropletTransform, DropletTransform, DropletTransform],
    studioChars: [0, 1, 2, 3, 4, 5].map(() => ({
      y: 20,
      scaleX: 0.6,
      scaleY: 0.6,
      opacity: 0,
      rotation: 0,
    })),
    face: {
      expression: 'normal',
      eyeLookX: 0,
      eyeLookY: 0,
      blinkAmount: 0,
      winkAmount: 0,
      eyeSquish: 0,
      mouthOpen: 1,
    },
    globalSqueeze: { scaleX: 1, scaleY: 1, y: 0, rotation: 0 },
    impacts: [],
  }));

  // Mutable Physics Refs for 60/120fps loop
  const animTimeRef = useRef<number>(0);
  const completedRef = useRef<boolean>(false);
  const triggeredEventsRef = useRef<Set<string>>(new Set(['WANT_GAME_TRANSITION']));
  const nextImpactIdRef = useRef<number>(1);
  const impactsRef = useRef<ImpactFxItem[]>([]);
  const pointerPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const dragStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const activeLetterRef = useRef<number | null>(null);
  const isGlobalHoldRef = useRef<boolean>(false);
  const delayedActionsRef = useRef<Set<number>>(new Set());
  const justUnlockedRestartRef = useRef<boolean>(false);

  const scheduleAction = useCallback((action: () => void, delay: number) => {
    const timer = window.setTimeout(() => {
      delayedActionsRef.current.delete(timer);
      action();
    }, delay);
    delayedActionsRef.current.add(timer);
  }, []);

  const cancelDelayedActions = useCallback(() => {
    delayedActionsRef.current.forEach((timer) => window.clearTimeout(timer));
    delayedActionsRef.current.clear();
  }, []);

  useEffect(
    () => () => {
      cancelDelayedActions();
      if (!completedRef.current) {
        juicyAudio.stopAll();
      }
    },
    [cancelDelayedActions],
  );

  const lettersPhysRef = useRef<
    [LetterPhysics, LetterPhysics, LetterPhysics, LetterPhysics]
  >(
    [0, 1, 2, 3].map(() => ({
      x: createSpring(0, 0),
      y: createSpring(-210, 0),
      squash: createSpring(0.1, 0),
      rotation: createSpring(0, 0),
      skewX: createSpring(0, 0),
      jellyBendX: createSpring(0, 0),
      opacity: 0,
      inAir: true,
    })) as [LetterPhysics, LetterPhysics, LetterPhysics, LetterPhysics],
  );

  const dropletsPhysRef = useRef<
    Array<{
      scale: SpringValue;
      distance: SpringValue;
      rotation: SpringValue;
      stretch: SpringValue;
      opacity: number;
    }>
  >(
    [0, 1, 2, 3].map(() => ({
      scale: createSpring(0, 0),
      distance: createSpring(0.25, 0.25),
      rotation: createSpring(0, 0),
      stretch: createSpring(1.25, 1),
      opacity: 0,
    })),
  );

  const studioPhysRef = useRef<
    Array<{
      y: SpringValue;
      squash: SpringValue;
      rotation: SpringValue;
      opacity: number;
    }>
  >(
    [0, 1, 2, 3, 4, 5].map(() => ({
      y: createSpring(18, 18),
      squash: createSpring(-0.18, 0),
      rotation: createSpring(0, 0),
      opacity: 0,
    })),
  );

  const globalPhysRef = useRef<{
    squash: SpringValue;
    y: SpringValue;
    rotation: SpringValue;
  }>({
    squash: createSpring(0, 0),
    y: createSpring(0, 0),
    rotation: createSpring(0, 0),
  });

  const faceRef = useRef<FaceState>({
    expression: 'normal',
    eyeLookX: 0,
    eyeLookY: 0,
    blinkAmount: 0,
    winkAmount: 0,
    eyeSquish: 0,
    mouthOpen: 1,
  });

  const winkSpringRef = useRef<SpringValue>(createSpring(0, 0));
  const eyeSquishSpringRef = useRef<SpringValue>(createSpring(0, 0));

  // Reset & Start/Replay the Choreographed Intro Sequence (from 2d-game-intro-animation (1).zip)
  const startIntro = useCallback(() => {
    cancelDelayedActions();
    juicyAudio.resetScene();
    void juicyAudio.unlock().then((ready) => {
      setSoundReady(ready);
      if (ready && animTimeRef.current < 0.15) {
        juicyAudio.playIntroBloom();
      }
    });

    activeLetterRef.current = null;
    isGlobalHoldRef.current = false;
    dragStartRef.current = null;
    setActiveSqueezeLetter(null);

    completedRef.current = false;
    stageHiddenRef.current = false;
    setStageHidden(false);
    setFadeOverlayOpacity(1);
    setStageExitScale(1);

    animTimeRef.current = 0;
    triggeredEventsRef.current = new Set(['WANT_GAME_TRANSITION']);
    impactsRef.current = [];

    lettersPhysRef.current.forEach((lp) => {
      lp.x = createSpring(0, 0);
      lp.y = createSpring(-210, 0);
      lp.squash = createSpring(0.1, 0);
      lp.rotation = createSpring(0, 0);
      lp.skewX = createSpring(0, 0);
      lp.jellyBendX = createSpring(0, 0);
      lp.opacity = 0;
      lp.inAir = true;
    });

    dropletsPhysRef.current.forEach((dp) => {
      dp.scale = createSpring(0, 0);
      dp.distance = createSpring(0.25, 0.25);
      dp.rotation = createSpring(0, 0);
      dp.stretch = createSpring(1.25, 1);
      dp.opacity = 0;
    });

    studioPhysRef.current.forEach((sp) => {
      sp.y = createSpring(18, 18);
      sp.squash = createSpring(-0.18, 0);
      sp.rotation = createSpring(0, 0);
      sp.opacity = 0;
    });

    globalPhysRef.current = {
      squash: createSpring(0, 0),
      y: createSpring(0, 0),
      rotation: createSpring(0, 0),
    };

    winkSpringRef.current = createSpring(0, 0);
    eyeSquishSpringRef.current = createSpring(0, 0);
    faceRef.current = {
      expression: 'normal',
      eyeLookX: 0,
      eyeLookY: 0,
      blinkAmount: 0,
      winkAmount: 0,
      eyeSquish: 0,
      mouthOpen: 1,
    };
  }, [cancelDelayedActions]);

  // Run initial intro sequence on mount
  useEffect(() => {
    startIntro();
  }, [startIntro]);

  // Unlock Mochi Garden Web Audio on first user gesture (and replay intro from 0s if autoplay was blocked)
  const unlockSound = useCallback(
    (event: React.SyntheticEvent) => {
      if ((event.target as Element | null)?.closest('[data-audio-toggle]')) return;
      if (!juicyAudio.enabled) return;

      const wasReady = juicyAudio.ready;
      if (!wasReady && !completedRef.current && !stageHiddenRef.current) {
        justUnlockedRestartRef.current = true;
      }
      void juicyAudio.unlock().then((ready) => {
        setSoundReady(ready);
        if (ready && !wasReady && !completedRef.current && !stageHiddenRef.current) {
          if (animTimeRef.current < 0.08) {
            juicyAudio.playIntroBloom();
          } else {
            startIntro();
          }
        }
      });
    },
    [startIntro],
  );

  // Also listen for keyboard unlock while intro is visible
  useEffect(() => {
    const onWindowKey = () => {
      if (!juicyAudio.enabled || juicyAudio.ready || completedRef.current) return;
      void juicyAudio.unlock().then((ready) => {
        setSoundReady(ready);
        if (ready && !completedRef.current && !stageHiddenRef.current) {
          if (animTimeRef.current < 0.08) {
            juicyAudio.playIntroBloom();
          } else {
            startIntro();
          }
        }
      });
    };
    window.addEventListener('keydown', onWindowKey);
    return () => window.removeEventListener('keydown', onWindowKey);
  }, [startIntro]);

  const toggleSound = async () => {
    if (soundEnabled && soundReady && soundVolume > 0) {
      juicyAudio.enabled = false;
      setSoundEnabled(false);
      return;
    }
    juicyAudio.enabled = true;
    setSoundEnabled(true);
    if (soundVolume === 0) {
      juicyAudio.volume = 0.7;
      setSoundVolume(0.7);
    }
    const ready = await juicyAudio.unlock();
    setSoundReady(ready);
    if (ready && !completedRef.current) {
      startIntro();
    }
  };

  const spawnImpact = useCallback(
    (x: number, y: number, type: ImpactFxItem['type'], scale: number = 1) => {
      impactsRef.current.push({
        id: nextImpactIdRef.current++,
        x,
        y,
        progress: 0,
        type,
        scale,
      });
    },
    [],
  );

  const triggerMascotWinkAction = useCallback(() => {
    void juicyAudio.unlock().then(setSoundReady);
    juicyAudio.playMascotWink();

    const j = juiciness;
    const lpA = lettersPhysRef.current[1];
    lpA.inAir = false;
    lpA.squash.vel -= 4.2 * j;
    lpA.y.vel = -150 * j;

    lettersPhysRef.current[0].squash.vel -= 1.8 * j;
    lettersPhysRef.current[2].squash.vel -= 1.8 * j;
    lettersPhysRef.current[3].squash.vel -= 1.4 * j;

    winkSpringRef.current.target = 1;
    winkSpringRef.current.vel = 6.0;
    faceRef.current.expression = 'wink';

    spawnImpact(362, 165, 'winkSparkle', 0.9 * j);

    scheduleAction(() => {
      winkSpringRef.current.target = 0;
      faceRef.current.expression = 'normal';
    }, 460);
  }, [juiciness, spawnImpact, scheduleAction]);

  const triggerStudioSublabelWave = useCallback(() => {
    void juicyAudio.unlock().then(setSoundReady);
    const j = juiciness;
    [0, 1, 2, 3, 4, 5].forEach((idx) => {
      scheduleAction(() => {
        const sp = studioPhysRef.current[idx];
        sp.opacity = 1;
        sp.y.vel = -165 * j;
        sp.squash.vel = -4.2 * j;
        juicyAudio.playStudioLetterTick(idx);
      }, idx * 42);
    });
    triggerMascotWinkAction();
  }, [juiciness, triggerMascotWinkAction, scheduleAction]);

  // Main Ultra-Smooth 60/120fps Choreographed Timeline & Neat Phase-Locked Spring Loop
  useEffect(() => {
    if (!active) return;

    let rafId = 0;
    let lastTime = performance.now();
    const groundPivotsX = [208, 396, 588, 768];

    const tick = (now: number) => {
      // Choreography follows real elapsed time even when a phone drops below
      // 40 fps; only the spring integrator needs a capped step for stability.
      const frame = introFrameDelta((now - lastTime) / 1000, speedMultiplier);
      lastTime = now;
      const dt = frame.physics;

      animTimeRef.current += frame.timeline;
      const t = animTimeRef.current;
      const events = triggeredEventsRef.current;
      const j = juiciness;
      const b = bounciness;

      const once = (key: string, timeThreshold: number, fn: () => void) => {
        if (t >= timeThreshold && !events.has(key)) {
          events.add(key);
          fn();
        }
      };

      // =====================================================================
      // 1. SMOOTH PAGE FADE-IN (t = 0.00s -> 0.34s)
      // =====================================================================
      if (t <= 0.34) {
        const p = Math.min(1, t / 0.34);
        const eased = 1 - Math.pow(1 - p, 3);
        setFadeOverlayOpacity(1 - eased);
      } else if (t < 2.48) {
        setFadeOverlayOpacity(0);
      }

      // =====================================================================
      // 2. CLASSIC CHOREOGRAPHY TIMELINE (2d-game-intro-animation (1).zip)
      // =====================================================================
      // A. Drop & Landing (0.05s -> 0.62s) — 100ms C-E-G-C (Do-Mi-Sol-Do) landings, ZERO wink!
      [0, 1, 2, 3].forEach((i) => {
        const dropStart = 0.05 + i * 0.1;
        const fallDuration = 0.17;
        const impactTime = dropStart + fallDuration;
        const lp = lettersPhysRef.current[i];

        once(`whoosh_${i}`, dropStart, () => {
          juicyAudio.playDropWhoosh(i);
        });

        if (t < dropStart) {
          lp.inAir = true;
          lp.opacity = 0;
          lp.y.pos = -210;
        } else if (t < impactTime) {
          lp.inAir = true;
          const p = (t - dropStart) / fallDuration;
          lp.opacity = Math.min(1, p * 3.5);
          lp.y.pos = -210 * (1 - p * p);
          lp.y.vel = 0;
          lp.y.target = 0;

          lp.squash.pos = 0.05 + 0.06 * p;
          lp.squash.vel = 0;
        }

        // Exact Moment of Floor Contact (y === 0.0) — Gentle landing settle, NO WINK!
        once(`impact_${i}`, impactTime, () => {
          lp.inAir = false;
          lp.opacity = 1;
          lp.y.pos = 0;
          lp.y.vel = 0;
          lp.y.target = 0;

          lp.squash.pos = -0.03;
          lp.squash.target = 0;
          lp.squash.vel = -3.8 * j;

          winkSpringRef.current.pos = 0;
          winkSpringRef.current.vel = 0;
          winkSpringRef.current.target = 0;

          spawnImpact(groundPivotsX[i], 348, 'ring', 0.72 * j);
          juicyAudio.playSquishImpact(i, 0.75 * j, 0, speedMultiplier);
        });
      });

      // B. Distinct MEGA SQUEEZE Compression (0.65s -> 0.94s)
      once('neat_group_squeeze', 0.65, () => {
        const symPull = [42, 14, -14, -42];
        lettersPhysRef.current.forEach((lp, i) => {
          lp.x.target = symPull[i] * j;
          lp.squash.target = -0.30 * j;
        });
        globalPhysRef.current.squash.target = -0.16 * j;
        winkSpringRef.current.pos = 0;
        winkSpringRef.current.vel = 0;
        winkSpringRef.current.target = 0;
        faceRef.current.expression = 'happy';
        juicyAudio.playManualSquish(1.15);
      });

      // C. Mega Squeeze Releases / Pops Outward + 4 Side Droplets + STUDIO Wave! (0.94s -> 1.28s)
      once('neat_group_pop', 0.94, () => {
        juicyAudio.playReleaseBoing(1.15);
        juicyAudio.playDropletBurst();

        globalPhysRef.current.squash.target = 0;
        globalPhysRef.current.squash.vel = 5.2 * j;

        lettersPhysRef.current.forEach((lp) => {
          lp.x.target = 0;
          lp.squash.target = 0;
          lp.squash.vel = 6.2 * j;
          lp.y.vel = -130 * j;
        });

        dropletsPhysRef.current.forEach((dp, idx) => {
          dp.opacity = 1;
          dp.scale.pos = 0.25;
          dp.scale.target = 1;
          dp.scale.vel = 8.4 * j;

          dp.distance.pos = 0.3;
          dp.distance.target = 1;
          dp.distance.vel = 7.4 * j;

          dp.stretch.pos = 1.3;
          dp.stretch.target = 1;
          dp.rotation.pos = idx < 2 ? -10 : 10;
          dp.rotation.target = 0;
        });

        spawnImpact(484, 245, 'globalWave', 0.95 * j);
      });

      // D. S T U D I O Sub-label Neat Staggered Glide-In (0.96s - 1.18s)
      [0, 1, 2, 3, 4, 5].forEach((idx) => {
        once(`studio_char_${idx}`, 0.96 + idx * 0.036, () => {
          const sp = studioPhysRef.current[idx];
          sp.opacity = 1;
          sp.y.target = 0;
          sp.y.vel = -165 * j;
          sp.squash.pos = -0.16;
          sp.squash.target = 0;
          sp.squash.vel = 4.2 * j;
          sp.rotation.target = 0;
          juicyAudio.playStudioLetterTick(idx);
        });
      });

      // E. ONLY 1 WINK 😉 — RIGHT AFTER THE MEGA SQUEEZE FINISHES & SETTLES (1.32s)!
      once('mascot_wink_after_squeeze_done', 1.32, () => {
        winkSpringRef.current.target = 1;
        winkSpringRef.current.vel = 7.5;
        faceRef.current.expression = 'wink';

        spawnImpact(362, 165, 'winkSparkle', 0.95 * j);
        juicyAudio.playMascotWink();
        juicyAudio.playStudioResolveChord();
      });

      // F. Smoothly open the winking eye back to normal (1.82s)
      once('mascot_wink_end', 1.82, () => {
        if (activeLetterRef.current === null && !isGlobalHoldRef.current) {
          winkSpringRef.current.target = 0;
          faceRef.current.expression = 'normal';
        }
      });

      // =====================================================================
      // 3. SMOOTH FADE-OUT PAGE TRANSITION TO MAIN GAME (t = 2.48s -> 3.30s)
      // =====================================================================
      if (events.has('WANT_GAME_TRANSITION')) {
        once('exit_anticipation', 2.42, () => {
          globalPhysRef.current.squash.vel -= 2.0 * j;
        });

        once('audio_fade_out', 2.48, () => {
          juicyAudio.playTransitionOut(0.54 / speedMultiplier);
        });

        if (t >= 2.48 && t <= 3.02) {
          const progress = Math.min(1, (t - 2.48) / 0.54);
          const eased =
            progress < 0.5
              ? 4 * progress * progress * progress
              : 1 - Math.pow(-2 * progress + 2, 3) / 2;
          setFadeOverlayOpacity(eased);
          setStageExitScale(1 - eased * 0.06);
        }

        // At 3.02s the dark curtain covers 100%; chime game arrival, hide red stage & lift curtain onto SGA
        once('hide_red_stage_reveal_sga', 3.02, () => {
          juicyAudio.playGameArrival();
          stageHiddenRef.current = true;
          setStageHidden(true);
        });

        if (t > 3.02 && t <= 3.30) {
          const revealP = Math.min(1, (t - 3.02) / 0.28);
          const easedOut = 1 - Math.pow(1 - revealP, 2);
          setFadeOverlayOpacity(1 - easedOut);
        }

        if (t >= 3.30 && !completedRef.current) {
          completedRef.current = true;
          onComplete();
          return;
        }
      }

      // =====================================================================
      // 4. LIVING IDLE BREATHING (No extra blink/wink — strictly 1 Wink only!)
      // =====================================================================
      if (t > 1.9 && activeLetterRef.current === null && !isGlobalHoldRef.current) {
        lettersPhysRef.current.forEach((lp, i) => {
          const wave = Math.sin(t * 3.0 + i * 0.75);
          lp.squash.target = wave * 0.014 * j;
        });
        faceRef.current.blinkAmount = 0;
      }

      // Smooth cursor eye tracking for letter 'A'
      const targetLookX = pointerPosRef.current.x;
      const targetLookY = pointerPosRef.current.y;
      faceRef.current.eyeLookX += (targetLookX - faceRef.current.eyeLookX) * 0.16;
      faceRef.current.eyeLookY += (targetLookY - faceRef.current.eyeLookY) * 0.16;

      // =====================================================================
      // 5. STEP ALL HOOKE'S LAW SPRINGS
      // =====================================================================
      const posStiffness = 295 * b;
      const posDamping = Math.max(14.0, 18.5 / Math.sqrt(b));

      const jellyStiffness = 330 * b;
      const jellyDamping = Math.max(7.8, 11.0 / Math.sqrt(b));

      lettersPhysRef.current.forEach((lp) => {
        stepSpring(lp.x, posStiffness, posDamping, dt);
        if (!lp.inAir) {
          stepSpring(lp.y, posStiffness, posDamping, dt);
          if (lp.y.pos > 0 && activeLetterRef.current === null) {
            lp.y.pos = 0;
            if (lp.y.vel > 0) lp.y.vel = 0;
          }
          stepSpring(lp.squash, jellyStiffness, jellyDamping, dt);
        }
        stepSpring(lp.rotation, posStiffness, posDamping, dt);
        stepSpring(lp.skewX, posStiffness, posDamping, dt);
        stepSpring(lp.jellyBendX, jellyStiffness, jellyDamping, dt);
      });

      dropletsPhysRef.current.forEach((dp) => {
        stepSpring(dp.scale, jellyStiffness, jellyDamping, dt);
        stepSpring(dp.distance, jellyStiffness * 0.95, jellyDamping, dt);
        stepSpring(dp.rotation, posStiffness, posDamping, dt);
        stepSpring(dp.stretch, jellyStiffness, jellyDamping, dt);
      });

      studioPhysRef.current.forEach((sp) => {
        stepSpring(sp.y, posStiffness, posDamping, dt);
        stepSpring(sp.squash, jellyStiffness, jellyDamping, dt);
        stepSpring(sp.rotation, posStiffness, posDamping, dt);
      });

      stepSpring(globalPhysRef.current.squash, jellyStiffness, jellyDamping, dt);
      stepSpring(globalPhysRef.current.y, posStiffness, posDamping, dt);
      stepSpring(globalPhysRef.current.rotation, posStiffness, posDamping, dt);

      stepSpring(winkSpringRef.current, 320, 16, dt);
      stepSpring(eyeSquishSpringRef.current, jellyStiffness, jellyDamping, dt);

      faceRef.current.winkAmount = Math.max(0, winkSpringRef.current.pos);
      faceRef.current.eyeSquish = eyeSquishSpringRef.current.pos;

      // Zero-allocation style compaction when no active impacts remain
      const activeImpacts = impactsRef.current;
      let writeIdx = 0;
      for (let i = 0; i < activeImpacts.length; i++) {
        const nextProgress = activeImpacts[i].progress + dt * 2.4;
        if (nextProgress < 1) {
          activeImpacts[writeIdx++] = {
            ...activeImpacts[i],
            progress: nextProgress,
          };
        }
      }
      activeImpacts.length = writeIdx;

      if (!stageHiddenRef.current) {
        const gs = globalPhysRef.current.squash.pos;
        setRenderState({
          letters: lettersPhysRef.current.map((lp) => {
            const s = Math.max(-0.48, Math.min(0.45, lp.squash.pos));
            const scaleY = Math.exp(s);
            const scaleX = Math.exp(-s * 0.86);
            const jellySquishY = -s * 1.35;

            return {
              x: lp.x.pos,
              y: lp.y.pos,
              scaleX,
              scaleY,
              rotation: lp.rotation.pos,
              skewX: lp.skewX.pos,
              jellyBendX: lp.jellyBendX.pos,
              jellySquishY,
              opacity: lp.opacity,
            };
          }) as [LetterTransform, LetterTransform, LetterTransform, LetterTransform],
          droplets: dropletsPhysRef.current.map((dp) => ({
            scale: Math.max(0, dp.scale.pos),
            distance: Math.max(0, dp.distance.pos),
            rotation: dp.rotation.pos,
            stretch: Math.max(0.4, dp.stretch.pos),
            opacity: dp.opacity,
          })) as [DropletTransform, DropletTransform, DropletTransform, DropletTransform],
          studioChars: studioPhysRef.current.map((sp) => {
            const cs = Math.max(-0.36, Math.min(0.36, sp.squash.pos));
            return {
              y: sp.y.pos,
              scaleX: Math.exp(-cs * 0.85),
              scaleY: Math.exp(cs),
              opacity: sp.opacity,
              rotation: sp.rotation.pos,
            };
          }),
          face: { ...faceRef.current },
          globalSqueeze: {
            scaleX: Math.exp(-gs * 0.85),
            scaleY: Math.exp(gs),
            y: globalPhysRef.current.y.pos,
            rotation: globalPhysRef.current.rotation.pos,
          },
          impacts: activeImpacts.slice(),
        });
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [active, bounciness, juiciness, onComplete, speedMultiplier, spawnImpact]);

  // Tactile squeeze interaction (keeps auto-transition intact so player always enters SGA smoothly)
  const handleLetterPointerDown = (index: number, e: React.PointerEvent) => {
    e.stopPropagation();
    if (justUnlockedRestartRef.current) {
      justUnlockedRestartRef.current = false;
      return;
    }
    if (animTimeRef.current >= 2.42) return;
    void juicyAudio.unlock().then(setSoundReady);
    juicyAudio.playManualSquish(1.18);

    activeLetterRef.current = index;
    setActiveSqueezeLetter(index);
    dragStartRef.current = { x: e.clientX, y: e.clientY, time: performance.now() };

    const lp = lettersPhysRef.current[index];
    lp.inAir = false;
    const j = juiciness;
    lp.squash.target = -0.30 * j;

    lettersPhysRef.current.forEach((other, idx) => {
      if (idx !== index) {
        const dir = idx < index ? 1 : -1;
        other.x.target = dir * 12 * j;
        other.squash.target = -0.06;
      }
    });

    eyeSquishSpringRef.current.target = 0.85;
    winkSpringRef.current.target = 0;
    faceRef.current.expression = 'happy';
  };

  const handleStagePointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement | null)?.closest('[data-ui-control="true"]')) return;
    if (justUnlockedRestartRef.current) {
      justUnlockedRestartRef.current = false;
      return;
    }
    if (animTimeRef.current >= 2.42) return;
    void juicyAudio.unlock().then(setSoundReady);

    isGlobalHoldRef.current = true;
    dragStartRef.current = { x: e.clientX, y: e.clientY, time: performance.now() };
    juicyAudio.playManualSquish(1.22);

    const j = juiciness;
    globalPhysRef.current.squash.target = -0.18 * j;

    const pullIn = [26, 9, -9, -26];
    lettersPhysRef.current.forEach((lp, i) => {
      lp.inAir = false;
      lp.x.target = pullIn[i] * j;
      lp.squash.target = -0.20 * j;
    });

    eyeSquishSpringRef.current.target = 0.85;
    winkSpringRef.current.target = 0;
    faceRef.current.expression = 'happy';
  };

  const handleGlobalPointerMove = (e: React.PointerEvent) => {
    const vw = window.innerWidth || 1;
    const vh = window.innerHeight || 1;
    pointerPosRef.current = {
      x: (e.clientX / vw - 0.5) * 2,
      y: (e.clientY / vh - 0.5) * 2,
    };

    if (activeLetterRef.current !== null && dragStartRef.current) {
      const idx = activeLetterRef.current;
      const dx = (e.clientX - dragStartRef.current.x) * 0.35;
      const dy = (e.clientY - dragStartRef.current.y) * 0.35;
      const lp = lettersPhysRef.current[idx];

      lp.x.target = Math.max(-40, Math.min(40, dx));
      lp.jellyBendX.target = Math.max(-1.0, Math.min(1.0, dx * 0.022));

      if (dy > 0) {
        const extraSquash = Math.min(0.20, dy * 0.0032);
        lp.y.target = 0;
        lp.squash.target = -0.28 - extraSquash;
        eyeSquishSpringRef.current.target = 0.9;
      } else {
        const extraStretch = Math.min(0.28, -dy * 0.0035);
        lp.squash.target = 0.10 + extraStretch;
        lp.y.target = Math.max(-42, dy * 0.42);
        eyeSquishSpringRef.current.target = -0.4;
      }
    }
  };

  const handleGlobalPointerUp = useCallback(() => {
    justUnlockedRestartRef.current = false;
    const j = juiciness;
    const groundX = [208, 396, 588, 768];

    if (activeLetterRef.current !== null) {
      const idx = activeLetterRef.current;
      activeLetterRef.current = null;
      setActiveSqueezeLetter(null);
      dragStartRef.current = null;

      juicyAudio.playReleaseBoing(idx);

      lettersPhysRef.current.forEach((lp, i) => {
        lp.x.target = 0;
        lp.y.target = 0;
        lp.squash.target = 0;
        lp.rotation.target = 0;
        lp.jellyBendX.target = 0;

        if (i === idx) {
          lp.squash.vel = 6.8 * j;
          lp.y.vel = -155 * j;
        } else {
          lp.squash.vel = 2.0 * j;
        }
      });

      if (idx === 0 || idx === 3) {
        dropletsPhysRef.current.forEach((dp) => {
          dp.scale.vel += 4.2 * j;
          dp.distance.vel += 3.5 * j;
        });
      }

      eyeSquishSpringRef.current.target = 0;
      eyeSquishSpringRef.current.vel = -3.8 * j;

      if (idx === 1) {
        juicyAudio.playMascotWink();
        winkSpringRef.current.target = 1;
        spawnImpact(362, 165, 'winkSparkle', 0.9 * j);
      }

      spawnImpact(groundX[idx], 348, 'ring', 0.8 * j);

      scheduleAction(() => {
        if (activeLetterRef.current === null && !isGlobalHoldRef.current) {
          winkSpringRef.current.target = 0;
          faceRef.current.expression = 'normal';
        }
      }, 460);
    }

    if (isGlobalHoldRef.current) {
      isGlobalHoldRef.current = false;
      dragStartRef.current = null;

      juicyAudio.playReleaseBoing(1.3);
      juicyAudio.playDropletBurst();

      globalPhysRef.current.squash.target = 0;
      globalPhysRef.current.squash.vel = 5.4 * j;
      globalPhysRef.current.y.target = 0;

      lettersPhysRef.current.forEach((lp) => {
        lp.x.target = 0;
        lp.y.target = 0;
        lp.squash.target = 0;
        lp.squash.vel = 6.0 * j;
        lp.y.vel = -140 * j;
        lp.rotation.target = 0;
      });

      dropletsPhysRef.current.forEach((dp) => {
        dp.opacity = 1;
        dp.scale.target = 1;
        dp.scale.vel += 6.0 * j;
        dp.distance.target = 1;
        dp.distance.vel += 5.0 * j;
      });

      eyeSquishSpringRef.current.target = 0;
      eyeSquishSpringRef.current.vel = -4.0 * j;

      spawnImpact(484, 245, 'globalWave', 0.95 * j);

      // Right as the Mega Squeeze finishes its pop-back (~240ms), Letter 'A' performs the Cheeky WINK!
      scheduleAction(() => {
        if (activeLetterRef.current === null && !isGlobalHoldRef.current) {
          const lpA = lettersPhysRef.current[1];
          lpA.squash.vel -= 3.2 * j;
          lpA.y.vel = -115 * j;
          winkSpringRef.current.target = 1;
          winkSpringRef.current.vel = 7.5;
          faceRef.current.expression = 'wink';
          juicyAudio.playMascotWink();
          spawnImpact(362, 165, 'winkSparkle', 0.92 * j);
        }
      }, 240);

      scheduleAction(() => {
        if (activeLetterRef.current === null && !isGlobalHoldRef.current) {
          winkSpringRef.current.target = 0;
          faceRef.current.expression = 'normal';
        }
      }, 720);
    }
  }, [juiciness, spawnImpact, scheduleAction]);

  const handleLetterPointerEnter = (index: number) => {
    setHoveredLetter(index);
    if (
      activeLetterRef.current === null &&
      !isGlobalHoldRef.current &&
      animTimeRef.current > 1.4 &&
      animTimeRef.current < 2.42
    ) {
      const lp = lettersPhysRef.current[index];
      lp.squash.vel -= 2.8 * juiciness;
      if (index === 1) {
        faceRef.current.expression = 'happy';
      }
    }
  };

  const handleLetterPointerLeave = () => {
    setHoveredLetter(null);
    if (
      activeLetterRef.current === null &&
      !isGlobalHoldRef.current &&
      animTimeRef.current > 1.8
    ) {
      faceRef.current.expression = 'normal';
    }
  };

  const soundOn = soundEnabled && soundReady && soundVolume > 0;

  return (
    <div
      id="sans-stage-container"
      role="status"
      aria-live="polite"
      aria-label="SANS STUDIO Intro Animation"
      onPointerDownCapture={unlockSound}
      onKeyDownCapture={unlockSound}
      onPointerDown={handleStagePointerDown}
      onPointerMove={handleGlobalPointerMove}
      onPointerUp={handleGlobalPointerUp}
      onPointerCancel={handleGlobalPointerUp}
      className={`fixed inset-0 z-[120] flex items-center justify-center overflow-hidden select-none ${
        stageHidden ? 'pointer-events-none' : ''
      }`}
    >
      {/* Clean Full-Viewport Red Studio Stage (#F11E1E radial stage lighting) */}
      {!stageHidden && (
        <div className="studio-red-stage relative flex h-full w-full items-center justify-center overflow-hidden">
          <div className="relative z-10 flex h-full w-full max-w-[calc(100dvh*9/16)] items-center justify-center">
            <button
              type="button"
              data-ui-control="true"
              data-audio-toggle="true"
              onClick={() => {
                if (completedRef.current) return;
                completedRef.current = true;
                cancelDelayedActions();
                juicyAudio.resetScene();
                onComplete();
              }}
              className="absolute left-3.5 top-3.5 z-20 rounded-full border border-white/25 bg-black/20 px-3 py-1.5 text-[11px] font-semibold text-white"
            >
              Lewati intro
            </button>
            {/* Mochi Garden Sound Toggle Pill (from 2d-game-intro-animation (1).zip) */}
            <div
              data-ui-control="true"
              className="absolute right-3.5 top-3.5 z-20 flex items-center"
            >
              <button
                type="button"
                onClick={() => {
                  void toggleSound();
                }}
                data-audio-toggle="true"
                className="flex items-center gap-1.5 rounded-full border border-white/25 bg-black/20 px-2.5 py-1.5 text-[11px] font-semibold text-white backdrop-blur-md transition hover:bg-black/30 active:scale-95 cursor-pointer"
                aria-label={soundOn ? 'Matikan suara' : 'Nyalakan suara dan putar intro'}
                aria-pressed={soundOn}
                title={
                  soundOn
                    ? 'Mochi Garden: suara aktif'
                    : 'Klik untuk mendengarkan intro dengan suara'
                }
              >
                {soundOn ? (
                  <Volume2 className="h-3.5 w-3.5" />
                ) : (
                  <>
                    <VolumeX className="h-3.5 w-3.5 text-white/80" />
                    <span>{soundEnabled ? 'Suara Intro' : 'Suara Mati'}</span>
                  </>
                )}
              </button>
            </div>

            <div
              className="flex h-full w-full items-center justify-center px-2 pb-16 pt-8"
              style={{
                transform: `scale(${stageExitScale}) translateZ(0)`,
                willChange: 'transform',
              }}
            >
              <SansWordmarkSvg
                letters={renderState.letters}
                droplets={renderState.droplets}
                studioChars={renderState.studioChars}
                face={renderState.face}
                globalSqueeze={renderState.globalSqueeze}
                impacts={renderState.impacts}
                hoveredLetter={hoveredLetter}
                activeSqueezeLetter={activeSqueezeLetter}
                onLetterPointerDown={handleLetterPointerDown}
                onLetterPointerEnter={handleLetterPointerEnter}
                onLetterPointerLeave={handleLetterPointerLeave}
                onStudioSublabelClick={triggerStudioSublabelWave}
                redBgHex={redBgHex}
                isPortrait916={true}
                showShineMarks={false}
                logoScaleFactor={logoScale}
              />
            </div>
          </div>
        </div>
      )}

      {/* Smooth Cinema Curtain Overlay (Fade-In 0->0.34s, Fade-Out 2.48s->3.02s, Reveal SGA 3.02s->3.30s) */}
      <div
        className="pointer-events-none absolute inset-0 z-30 bg-[#12131F]"
        style={{
          opacity: fadeOverlayOpacity,
          willChange: 'opacity',
        }}
      />
    </div>
  );
}
