import React from 'react';
import { isMobilePerfProfile } from '../games/gunhit/utils/mobilePerf';
import {
  buildVariableWidthTubePath,
  buildDeformedLetterAPath,
  buildDeformedLetterNPath,
  deformSoftBodyPoint,
  SoftBodyParams,
  SpinePoint,
} from '../utils/smoothLogoGeometry';

export interface LetterTransform {
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
  skewX: number;
  jellyBendX: number;
  jellySquishY: number;
  opacity: number;
}

export interface DropletTransform {
  scale: number;
  distance: number; // 0 = tucked inside S, 1 = normal resting position, >1 = overshoot
  rotation: number;
  stretch: number;
  opacity: number;
}

export interface FaceState {
  expression: 'normal' | 'happy' | 'wink';
  eyeLookX: number; // -1 to 1
  eyeLookY: number; // -1 to 1
  blinkAmount: number; // 0 = open, 1 = closed
  winkAmount: number; // 0 = open pill eye, 1 = full happy curved wink arc (continuous!)
  eyeSquish: number; // phase-locked with letter A's squash & stretch
  mouthOpen: number; // 0.7 to 1.35
}

export interface ImpactFxItem {
  id: number;
  x: number;
  y: number;
  progress: number; // 0 to 1
  type: 'ring' | 'burst' | 'puffs' | 'globalWave' | 'stars' | 'winkSparkle';
  scale: number;
}

export interface StudioCharTransform {
  y: number;
  scaleX: number;
  scaleY: number;
  opacity: number;
  rotation: number;
}

interface SansWordmarkSvgProps {
  letters: [LetterTransform, LetterTransform, LetterTransform, LetterTransform];
  droplets: [DropletTransform, DropletTransform, DropletTransform, DropletTransform];
  studioChars: StudioCharTransform[];
  face: FaceState;
  globalSqueeze: {
    scaleX: number;
    scaleY: number;
    y: number;
    rotation: number;
  };
  impacts: ImpactFxItem[];
  hoveredLetter: number | null;
  activeSqueezeLetter: number | null;
  onLetterPointerDown: (index: number, e: React.PointerEvent) => void;
  onLetterPointerEnter: (index: number) => void;
  onLetterPointerLeave: () => void;
  onStudioSublabelClick?: (e: React.PointerEvent) => void;
  redBgHex?: string;
  isPortrait916?: boolean;
  showShineMarks?: boolean;
  logoScaleFactor?: number;
}

// Smooth teardrop droplet path between two endpoints with radii r1 and r2
function createSmoothTeardropPath(
  x1: number,
  y1: number,
  r1: number,
  x2: number,
  y2: number,
  r2: number,
): string {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const angle = Math.atan2(dy, dx);

  const pts: Array<{ x: number; y: number }> = [];
  const arcSteps = 12;

  for (let i = 0; i <= arcSteps; i++) {
    const theta = angle - Math.PI / 2 + (i / arcSteps) * Math.PI;
    pts.push({
      x: x2 + Math.cos(theta) * r2,
      y: y2 + Math.sin(theta) * r2,
    });
  }

  for (let i = 0; i <= arcSteps; i++) {
    const theta = angle + Math.PI / 2 + (i / arcSteps) * Math.PI;
    pts.push({
      x: x1 + Math.cos(theta) * r1,
      y: y1 + Math.sin(theta) * r1,
    });
  }

  const n = pts.length;
  const startMidX = (pts[n - 1].x + pts[0].x) * 0.5;
  const startMidY = (pts[n - 1].y + pts[0].y) * 0.5;
  const cmds = [`M ${startMidX.toFixed(2)} ${startMidY.toFixed(2)}`];

  for (let i = 0; i < n; i++) {
    const c = pts[i];
    const next = pts[(i + 1) % n];
    const mx = (c.x + next.x) * 0.5;
    const my = (c.y + next.y) * 0.5;
    cmds.push(`Q ${c.x.toFixed(2)} ${c.y.toFixed(2)} ${mx.toFixed(2)} ${my.toFixed(2)}`);
  }
  cmds.push('Z');
  return cmds.join(' ');
}

// Iconic SANS STUDIO Bean / U-Smile Mouth Path with optional cheeky wink tilt
function createCuteBeanMouthPath(
  cx: number,
  cy: number,
  halfWidth: number,
  depth: number,
  topSmileDip: number,
  winkLiftLeft: number = 0,
): string {
  const leftX = cx - halfWidth;
  const rightX = cx + halfWidth;
  const leftTopY = cy - depth * 0.28 - winkLiftLeft;
  const rightTopY = cy - depth * 0.28 + winkLiftLeft * 0.25;
  const bottomY = cy + depth * 0.80;

  return [
    `M ${leftX.toFixed(2)} ${leftTopY.toFixed(2)}`,
    `Q ${cx.toFixed(2)} ${(cy - depth * 0.28 + topSmileDip).toFixed(2)} ${rightX.toFixed(2)} ${rightTopY.toFixed(2)}`,
    `C ${(rightX + halfWidth * 0.15).toFixed(2)} ${(rightTopY + depth * 0.28).toFixed(2)}, ${(
      cx +
      halfWidth * 0.90
    ).toFixed(2)} ${bottomY.toFixed(2)}, ${cx.toFixed(2)} ${bottomY.toFixed(2)}`,
    `C ${(cx - halfWidth * 0.90).toFixed(2)} ${bottomY.toFixed(2)}, ${(
      leftX -
      halfWidth * 0.15
    ).toFixed(2)} ${(leftTopY + depth * 0.28).toFixed(2)}, ${leftX.toFixed(2)} ${leftTopY.toFixed(2)}`,
    'Z',
  ].join(' ');
}

// Cute 4-point cartoon sparkle star path
function createSparkleStarPath(cx: number, cy: number, outerR: number): string {
  const innerR = outerR * 0.32;
  return [
    `M ${cx} ${cy - outerR}`,
    `Q ${cx + innerR} ${cy - innerR} ${cx + outerR} ${cy}`,
    `Q ${cx + innerR} ${cy + innerR} ${cx} ${cy + outerR}`,
    `Q ${cx - innerR} ${cy + innerR} ${cx - outerR} ${cy}`,
    `Q ${cx - innerR} ${cy - innerR} ${cx} ${cy - outerR}`,
    'Z',
  ].join(' ');
}

// ============================================================================
// PRECISION COLLINEAR SPINES FOR S1 AND S2 (With Clean Open Inner Counters)
// ============================================================================

const S1_SEGMENTS: Array<[SpinePoint, SpinePoint, SpinePoint, SpinePoint]> = [
  [
    { x: 256, y: 156, r: 32.5 },
    { x: 230, y: 120, r: 33.0 },
    { x: 152, y: 124, r: 33.5 },
    { x: 154, y: 174, r: 34.0 },
  ],
  [
    { x: 154, y: 174, r: 34.0 },
    { x: 156, y: 218, r: 34.5 },
    { x: 266, y: 216, r: 35.5 },
    { x: 264, y: 274, r: 36.0 },
  ],
  [
    { x: 264, y: 274, r: 36.0 },
    { x: 262, y: 326, r: 36.5 },
    { x: 178, y: 330, r: 37.5 },
    { x: 150, y: 300, r: 36.5 },
  ],
];

const S2_SEGMENTS: Array<[SpinePoint, SpinePoint, SpinePoint, SpinePoint]> = [
  [
    { x: 814, y: 162, r: 31.5 },
    { x: 790, y: 128, r: 32.0 },
    { x: 718, y: 132, r: 32.5 },
    { x: 720, y: 178, r: 33.0 },
  ],
  [
    { x: 720, y: 178, r: 33.0 },
    { x: 722, y: 220, r: 33.5 },
    { x: 824, y: 218, r: 34.5 },
    { x: 822, y: 274, r: 35.0 },
  ],
  [
    { x: 822, y: 274, r: 35.0 },
    { x: 820, y: 324, r: 35.5 },
    { x: 742, y: 328, r: 36.0 },
    { x: 716, y: 300, r: 35.0 },
  ],
];

export const SansWordmarkSvg: React.FC<SansWordmarkSvgProps> = ({
  letters,
  droplets,
  studioChars,
  face,
  globalSqueeze,
  impacts,
  hoveredLetter,
  activeSqueezeLetter,
  onLetterPointerDown,
  onLetterPointerEnter,
  onLetterPointerLeave,
  onStudioSublabelClick,
  redBgHex = '#F11E1E',
  isPortrait916 = true,
  showShineMarks = false,
  logoScaleFactor = 0.7,
}) => {
  const mobilePerf = isMobilePerfProfile();

  // Grounded bottom-center pivots for each of the 4 letters (S, A, N, S)
  const pivots = [
    { x: 208, y: 348 }, // S1
    { x: 396, y: 348 }, // A
    { x: 588, y: 348 }, // N
    { x: 768, y: 348 }, // S2
  ];

  const getSoftBody = (idx: number): SoftBodyParams => {
    const l = letters[idx];
    return {
      pivotX: pivots[idx].x,
      pivotY: pivots[idx].y,
      translateX: l.x,
      translateY: l.y,
      scaleX: l.scaleX,
      scaleY: l.scaleY,
      rotationDeg: l.rotation,
      bendX: l.jellyBendX,
      squishY: l.jellySquishY,
    };
  };

  const sb0 = getSoftBody(0);
  const sb1 = getSoftBody(1);
  const sb2 = getSoftBody(2);
  const sb3 = getSoftBody(3);

  const stepsPerSeg = mobilePerf ? 14 : 18;
  const s1Path = buildVariableWidthTubePath(S1_SEGMENTS, stepsPerSeg, sb0);
  const aPath = buildDeformedLetterAPath(sb1);
  const nPath = buildDeformedLetterNPath(sb2);
  const s2Path = buildVariableWidthTubePath(S2_SEGMENTS, stepsPerSeg, sb3);

  const dropletConfigs = [
    // Left Upper
    {
      innerX: 98,
      innerY: 248,
      innerR: 6.8,
      outerX: 54,
      outerY: 212,
      outerR: 14.5,
      originX: 132,
      originY: 264,
    },
    // Left Lower
    {
      innerX: 92,
      innerY: 290,
      innerR: 6.6,
      outerX: 44,
      outerY: 282,
      outerR: 14.0,
      originX: 128,
      originY: 294,
    },
    // Right Upper
    {
      innerX: 868,
      innerY: 256,
      innerR: 6.6,
      outerX: 912,
      outerY: 228,
      outerR: 14.0,
      originX: 836,
      originY: 268,
    },
    // Right Lower
    {
      innerX: 872,
      innerY: 296,
      innerR: 6.4,
      outerX: 920,
      outerY: 289,
      outerR: 13.5,
      originX: 838,
      originY: 300,
    },
  ];

  const STUDIO_LETTERS = ['S', 'T', 'U', 'D', 'I', 'O'];
  const studioPositions = [316, 384, 452, 522, 586, 650];

  // =========================================================================
  // AUTHENTIC SANS STUDIO MASCOT FACE INSIDE 'A' WITH CONTINUOUS MORPHING WINK
  // =========================================================================
  const renderMascotFace = () => {
    const lookX = face.eyeLookX * 5.0;
    const lookY = face.eyeLookY * 4.0;

    const leftEyeCenter = deformSoftBodyPoint(374 + lookX, 224 + lookY, sb1);
    const rightEyeCenter = deformSoftBodyPoint(418 + lookX, 224 + lookY, sb1);
    const mouthCenter = deformSoftBodyPoint(396 + lookX * 0.8, 274 + lookY * 0.8, sb1);

    // Keep the vertical pill eyes crisp, tall, and clearly open during drop & landing
    // (only 35% of letter A's scale so they NEVER flatten into a false blink on impact!)
    const eyeScaleX = 1 + (sb1.scaleX - 1) * 0.35;
    const eyeScaleY = Math.max(0.82, 1 + (sb1.scaleY - 1) * 0.35);
    const faceRot = sb1.rotationDeg + sb1.bendX * 5;

    const w = Math.max(0, Math.min(1.2, face.winkAmount));

    // Right Eye: Always stays a crisp, open vertical capsule!
    const rightEyeRx = 13.0 * eyeScaleX;
    const rightEyeRy = 27.0 * eyeScaleY * (1 + w * 0.05);

    // Left Eye: Stays a crisp open vertical capsule (w=0), and ONLY morphs into the
    // happy curved wink arc '⌒' when w > 0 (right after Mega Squeeze finishes)!
    const renderLeftEye = () => {
      if (w < 0.35) {
        const closeProgress = w / 0.35;
        const leftRx = 13.0 * (1 + closeProgress * 0.14) * eyeScaleX;
        const leftRy = Math.max(5.0, 27.0 * (1 - closeProgress * 0.80) * eyeScaleY);
        return (
          <ellipse
            cx={leftEyeCenter.x}
            cy={leftEyeCenter.y}
            rx={leftRx}
            ry={leftRy}
            fill={redBgHex}
            transform={`rotate(${faceRot - w * 4} ${leftEyeCenter.x} ${leftEyeCenter.y})`}
          />
        );
      }
      const archProgress = Math.min(1.15, (w - 0.35) / 0.65);
      const halfSpan = 15.2 * eyeScaleX;
      const archLift = archProgress * 22.0 * eyeScaleY;
      const endDrop = archProgress * 4.5 * eyeScaleY;

      const x1 = leftEyeCenter.x - halfSpan;
      const y1 = leftEyeCenter.y + endDrop;
      const x2 = leftEyeCenter.x + halfSpan;
      const y2 = leftEyeCenter.y + endDrop * 0.6;
      const ctrlX = leftEyeCenter.x;
      const ctrlY = leftEyeCenter.y - archLift;

      return (
        <path
          d={`M ${x1.toFixed(2)} ${y1.toFixed(2)} Q ${ctrlX.toFixed(2)} ${ctrlY.toFixed(2)} ${x2.toFixed(2)} ${y2.toFixed(2)}`}
          fill="none"
          stroke={redBgHex}
          strokeWidth={13.5 * Math.min(1.12, (eyeScaleX + eyeScaleY) * 0.5)}
          strokeLinecap="round"
          transform={`rotate(${faceRot - 4} ${leftEyeCenter.x} ${leftEyeCenter.y})`}
        />
      );
    };

    const mouthHalfW =
      15.5 * eyeScaleX * (1 + w * 0.12 + (face.expression === 'happy' ? 0.06 : 0));
    const mouthDepth = 20.5 * face.mouthOpen * eyeScaleY * (1 + w * 0.10);
    const topSmileDip = 3.8 * eyeScaleY;
    const winkLiftLeft = w * 2.8 * eyeScaleY;

    const mouthPath = createCuteBeanMouthPath(
      mouthCenter.x - w * 1.2,
      mouthCenter.y,
      mouthHalfW,
      mouthDepth,
      topSmileDip,
      winkLiftLeft,
    );

    return (
      <g>
        {renderLeftEye()}

        <ellipse
          cx={rightEyeCenter.x}
          cy={rightEyeCenter.y}
          rx={rightEyeRx}
          ry={rightEyeRy}
          fill={redBgHex}
          transform={`rotate(${faceRot + w * 2.5} ${rightEyeCenter.x} ${rightEyeCenter.y})`}
        />

        <path
          d={mouthPath}
          fill={redBgHex}
          stroke={redBgHex}
          strokeWidth="2.8"
          strokeLinejoin="round"
          strokeLinecap="round"
          transform={`rotate(${faceRot} ${mouthCenter.x} ${mouthCenter.y})`}
        />
      </g>
    );
  };

  const renderOptionalShineMarks = () => {
    if (!showShineMarks) return null;
    const s1TopA = deformSoftBodyPoint(144, 156, sb0);
    const s1TopB = deformSoftBodyPoint(174, 128, sb0);
    const s2TopA = deformSoftBodyPoint(710, 162, sb3);
    const s2TopB = deformSoftBodyPoint(740, 136, sb3);

    return (
      <g pointerEvents="none">
        <path
          d={`M ${s1TopA.x} ${s1TopA.y} Q ${(s1TopA.x + s1TopB.x) * 0.5 - 7} ${
            (s1TopA.y + s1TopB.y) * 0.5 - 7
          } ${s1TopB.x} ${s1TopB.y}`}
          fill="none"
          stroke={redBgHex}
          strokeWidth="7"
          strokeLinecap="round"
          opacity={letters[0].opacity}
        />
        <path
          d={`M ${s2TopA.x} ${s2TopA.y} Q ${(s2TopA.x + s2TopB.x) * 0.5 - 6.5} ${
            (s2TopA.y + s2TopB.y) * 0.5 - 6.5
          } ${s2TopB.x} ${s2TopB.y}`}
          fill="none"
          stroke={redBgHex}
          strokeWidth="6.5"
          strokeLinecap="round"
          opacity={letters[3].opacity}
        />
      </g>
    );
  };

  const viewBox = isPortrait916 ? '0 -160 960 920' : '0 -30 960 620';

  return (
    <svg
      viewBox={viewBox}
      aria-label="SANS STUDIO"
      className="w-full h-full select-none overflow-visible"
      style={{
        filter: mobilePerf ? undefined : 'drop-shadow(0 16px 34px rgba(130, 4, 4, 0.24))',
        shapeRendering: 'geometricPrecision',
      }}
    >
      {/* =====================================================================
          OUTER SCALE WRAPPER (Scales the entire logo & FX down by 30% -> 0.70x
          centered cleanly at (480, 285) for generous 9:16 studio breathing room)
         ===================================================================== */}
      <g
        transform={`translate(480, 285) scale(${logoScaleFactor}) translate(-480, -285)`}
      >
        {/* ===================================================================
            BACKGROUND 2D CARTOON IMPACT FX LAYER (Clean, Minimal & Tidy)
           =================================================================== */}
        <g pointerEvents="none">
          {impacts.map((fx) => {
            const inv = Math.max(0, 1 - fx.progress);
            const easeOut = 1 - Math.pow(1 - fx.progress, 3);

            if (fx.type === 'ring') {
              const rx = (36 + easeOut * 105) * fx.scale;
              const ry = (8 + easeOut * 20) * fx.scale;
              return (
                <g key={fx.id} opacity={inv * 0.58}>
                  <ellipse
                    cx={fx.x}
                    cy={fx.y}
                    rx={rx}
                    ry={ry}
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth={Math.max(1.5, 6.5 * inv)}
                    strokeLinecap="round"
                  />
                </g>
              );
            }

            if (fx.type === 'globalWave') {
              const rx = (180 + easeOut * 310) * fx.scale;
              const ry = (60 + easeOut * 125) * fx.scale;
              return (
                <ellipse
                  key={fx.id}
                  cx={fx.x}
                  cy={fx.y}
                  rx={rx}
                  ry={ry}
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth={Math.max(1.5, 8.5 * inv)}
                  opacity={inv * 0.32}
                />
              );
            }

            if (fx.type === 'puffs') {
              const spread = (28 + easeOut * 72) * fx.scale;
              const lift = easeOut * 16;
              const r = Math.max(1, 9.5 * inv * fx.scale);
              return (
                <g key={fx.id} opacity={inv * 0.75} fill="#FFFFFF">
                  <circle cx={fx.x - spread} cy={fx.y - lift} r={r} />
                  <circle cx={fx.x + spread} cy={fx.y - lift} r={r} />
                </g>
              );
            }

            if (fx.type === 'winkSparkle') {
              const popScale = Math.sin(Math.min(1, fx.progress * 1.35) * Math.PI);
              const sx = fx.x - easeOut * 28;
              const sy = fx.y - easeOut * 34;
              return (
                <g key={fx.id} opacity={inv * 0.95} fill="#FFFFFF">
                  <path
                    d={createSparkleStarPath(sx, sy, 18 * popScale * fx.scale)}
                    transform={`rotate(${fx.progress * 38 - 12} ${sx} ${sy})`}
                  />
                  <circle
                    cx={sx - 19 * easeOut}
                    cy={sy - 12 * easeOut}
                    r={Math.max(1.5, 5.5 * inv * fx.scale)}
                  />
                </g>
              );
            }

            if (fx.type === 'stars') {
              const starAngles = [-135, -45, 25, 155];
              return (
                <g key={fx.id} opacity={inv * 0.85} fill="#FFFFFF">
                  {starAngles.map((deg, idx) => {
                    const rad = (deg * Math.PI) / 180;
                    const dist = (55 + easeOut * 115) * fx.scale;
                    const sx = fx.x + Math.cos(rad) * dist;
                    const sy = fx.y + Math.sin(rad) * dist - easeOut * 10;
                    const sr = Math.max(2, (idx % 2 === 0 ? 13 : 10) * inv * fx.scale);
                    return (
                      <path
                        key={idx}
                        d={createSparkleStarPath(sx, sy, sr)}
                        transform={`rotate(${fx.progress * 40 * (idx % 2 === 0 ? 1 : -1)} ${sx} ${sy})`}
                      />
                    );
                  })}
                </g>
              );
            }

            const angles = [-155, -125, -55, -25, 25, 155];
            return (
              <g key={fx.id} opacity={inv * 0.82} fill="#FFFFFF">
                {angles.map((deg, idx) => {
                  const rad = (deg * Math.PI) / 180;
                  const dist = (28 + easeOut * 95) * fx.scale;
                  const px = fx.x + Math.cos(rad) * dist;
                  const py = fx.y + Math.sin(rad) * dist + fx.progress * fx.progress * 18;
                  const pr = Math.max(1.5, (idx % 2 === 0 ? 7.5 : 5.5) * inv * fx.scale);
                  return <circle key={idx} cx={px} cy={py} r={pr} />;
                })}
              </g>
            );
          })}
        </g>

        {/* ===================================================================
            GLOBAL WORDMARK SQUEEZE GROUP
           =================================================================== */}
        <g
          transform={`translate(484, ${275 + globalSqueeze.y}) rotate(${globalSqueeze.rotation}) scale(${
            globalSqueeze.scaleX
          }, ${globalSqueeze.scaleY}) translate(-484, -275)`}
        >
          {/* ---------------------------------------------------------------
              4 SIDE SPLASH DROPLETS (2 Left of S1, 2 Right of S2)
             --------------------------------------------------------------- */}
          {dropletConfigs.map((cfg, idx) => {
            const d = droplets[idx];
            if (d.opacity <= 0.01 || d.scale <= 0.01) return null;

            const parentLetter = idx < 2 ? letters[0] : letters[3];
            const followX =
              parentLetter.x * 0.65 +
              (idx < 2 ? -(parentLetter.scaleX - 1) * 22 : (parentLetter.scaleX - 1) * 22);
            const followY = parentLetter.y * 0.35;

            const ix = cfg.originX + (cfg.innerX - cfg.originX) * d.distance + followX;
            const iy = cfg.originY + (cfg.innerY - cfg.originY) * d.distance + followY;
            const ox =
              cfg.originX + (cfg.outerX - cfg.originX) * d.distance * d.stretch + followX;
            const oy =
              cfg.originY + (cfg.outerY - cfg.originY) * d.distance * d.stretch + followY;

            const pathData = createSmoothTeardropPath(
              ix,
              iy,
              cfg.innerR * d.scale,
              ox,
              oy,
              cfg.outerR * d.scale,
            );

            const midX = (ix + ox) * 0.5;
            const midY = (iy + oy) * 0.5;

            return (
              <path
                key={`droplet-${idx}`}
                d={pathData}
                fill="#FFFFFF"
                opacity={d.opacity}
                transform={`rotate(${d.rotation} ${midX} ${midY})`}
              />
            );
          })}

          {/* ---------------------------------------------------------------
              LETTER 1: 'S' (Left — Smooth Closed Soft-Body Contour)
             --------------------------------------------------------------- */}
          <g
            opacity={letters[0].opacity}
            className="cursor-pointer"
            onPointerDown={(e) => onLetterPointerDown(0, e)}
            onPointerEnter={() => onLetterPointerEnter(0)}
            onPointerLeave={onLetterPointerLeave}
          >
            <path d={s1Path} fill="#FFFFFF" />
          </g>

          {/* ---------------------------------------------------------------
              LETTER 2: 'A' (Mascot Character Letter with Authentic Cutout Face)
             --------------------------------------------------------------- */}
          <g
            opacity={letters[1].opacity}
            className="cursor-pointer"
            onPointerDown={(e) => onLetterPointerDown(1, e)}
            onPointerEnter={() => onLetterPointerEnter(1)}
            onPointerLeave={onLetterPointerLeave}
          >
            <path d={aPath} fill="#FFFFFF" />
            {renderMascotFace()}
          </g>

          {/* ---------------------------------------------------------------
              LETTER 3: 'N' (Unified Single-Piece Bubble Soft-Body Contour)
             --------------------------------------------------------------- */}
          <g
            opacity={letters[2].opacity}
            className="cursor-pointer"
            onPointerDown={(e) => onLetterPointerDown(2, e)}
            onPointerEnter={() => onLetterPointerEnter(2)}
            onPointerLeave={onLetterPointerLeave}
          >
            <path d={nPath} fill="#FFFFFF" />
          </g>

          {/* ---------------------------------------------------------------
              LETTER 4: 'S' (Right — Smooth Closed Soft-Body Contour)
             --------------------------------------------------------------- */}
          <g
            opacity={letters[3].opacity}
            className="cursor-pointer"
            onPointerDown={(e) => onLetterPointerDown(3, e)}
            onPointerEnter={() => onLetterPointerEnter(3)}
            onPointerLeave={onLetterPointerLeave}
          >
            <path d={s2Path} fill="#FFFFFF" />
          </g>

          {/* Optional Glossy Cutout Shine on S1 & S2 */}
          {renderOptionalShineMarks()}

          {/* ---------------------------------------------------------------
              SUB-LABEL: 'S T U D I O' (Interactive Rounded Geometric Typography)
             --------------------------------------------------------------- */}
          <g
            className="cursor-pointer"
            onPointerDown={(e) => {
              if (onStudioSublabelClick) {
                e.stopPropagation();
                onStudioSublabelClick(e);
              }
            }}
          >
            {STUDIO_LETTERS.map((char, idx) => {
              const st = studioChars[idx] || {
                y: 0,
                scaleX: 1,
                scaleY: 1,
                opacity: 1,
                rotation: 0,
              };
              const cx = studioPositions[idx];
              const cy = 428;

              return (
                <g
                  key={`studio-${char}-${idx}`}
                  transform={`translate(${cx}, ${cy + st.y}) rotate(${st.rotation}) scale(${st.scaleX}, ${st.scaleY})`}
                  opacity={st.opacity}
                >
                  <text
                    x="0"
                    y="0"
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="#FFFFFF"
                    stroke="#FFFFFF"
                    strokeWidth="2.2"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    className="font-studio font-bold"
                    style={{
                      fontSize: '42px',
                      fontWeight: 700,
                    }}
                  >
                    {char}
                  </text>
                </g>
              );
            })}
          </g>

          {/* Subtle interactive ground ring indicator when user hovers/squeezes a letter */}
          {(hoveredLetter !== null || activeSqueezeLetter !== null) && (
            <g pointerEvents="none" opacity={activeSqueezeLetter !== null ? 0.55 : 0.28}>
              {(() => {
                const idx = activeSqueezeLetter ?? hoveredLetter ?? 0;
                const p = pivots[idx];
                return (
                  <ellipse
                    cx={p.x}
                    cy={p.y + 10}
                    rx={activeSqueezeLetter !== null ? 68 : 48}
                    ry={activeSqueezeLetter !== null ? 12 : 8}
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeDasharray="10 10"
                  />
                );
              })()}
            </g>
          )}
        </g>
      </g>
    </svg>
  );
};
