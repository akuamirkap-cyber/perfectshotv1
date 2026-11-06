// Ultra-smooth variable-radius Bézier spine & soft-body FFD (Free-Form Deformation) geometry engine
// Produces 100% bump-free, studio-grade vector outlines for SANS STUDIO.

export interface SpinePoint {
  x: number;
  y: number;
  r: number;
}

export interface SoftBodyParams {
  pivotX: number;
  pivotY: number;
  translateX: number;
  translateY: number;
  scaleX: number;
  scaleY: number;
  rotationDeg: number;
  // Subtle upper-lobe follow-through bend (-1.0 to +1.0)
  bendX: number;
  // Subtle cushion belly fullness (-1.0 to +1.0)
  squishY: number;
}

// Evaluate a cubic Bézier curve at parameter t in [0, 1]
function cubicBezier(
  p0: SpinePoint,
  p1: SpinePoint,
  p2: SpinePoint,
  p3: SpinePoint,
  t: number,
): SpinePoint {
  const mt = 1 - t;
  const mt2 = mt * mt;
  const t2 = t * t;
  const a = mt2 * mt;
  const b = 3 * mt2 * t;
  const c = 3 * mt * t2;
  const d = t2 * t;

  return {
    x: a * p0.x + b * p1.x + c * p2.x + d * p3.x,
    y: a * p0.y + b * p1.y + c * p2.y + d * p3.y,
    r: a * p0.r + b * p1.r + c * p2.r + d * p3.r,
  };
}

// Evaluate derivative (tangent) of cubic Bézier at parameter t
function cubicBezierTangent(
  p0: SpinePoint,
  p1: SpinePoint,
  p2: SpinePoint,
  p3: SpinePoint,
  t: number,
): { dx: number; dy: number } {
  const mt = 1 - t;
  const a = 3 * mt * mt;
  const b = 6 * mt * t;
  const c = 3 * t * t;

  return {
    dx: a * (p1.x - p0.x) + b * (p2.x - p1.x) + c * (p3.x - p2.x),
    dy: a * (p1.y - p0.y) + b * (p2.y - p1.y) + c * (p3.y - p2.y),
  };
}

// Apply Clean, Proportional 2D Cushion Deformation to any vertex (x, y)
// Keeps letterforms razor-sharp and typographically neat while adding a tactile marshmallow feel
export function deformSoftBodyPoint(
  rawX: number,
  rawY: number,
  params: SoftBodyParams,
): { x: number; y: number } {
  const {
    pivotX,
    pivotY,
    translateX,
    translateY,
    scaleX,
    scaleY,
    rotationDeg,
    bendX,
    squishY,
  } = params;

  const relX = rawX - pivotX;
  const relY = rawY - pivotY; // negative for points above bottom pivot
  const heightNorm = Math.max(0, Math.min(1.2, -relY / 225));

  // Subtle, clean pillow fullness at mid-height (preserves crisp typographic silhouette)
  const bellyProfile = Math.sin(Math.min(1, heightNorm) * Math.PI);
  const squishBulgeX = 1 + squishY * 0.075 * bellyProfile;

  // Gentle upper-body shear when dragged horizontally
  const bendOffsetX = bendX * 14 * (heightNorm * heightNorm);

  const sx = (relX * squishBulgeX + bendOffsetX) * scaleX;
  const sy = relY * scaleY;

  if (rotationDeg === 0) {
    return {
      x: pivotX + sx + translateX,
      y: pivotY + sy + translateY,
    };
  }

  const rad = (rotationDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);

  const rx = sx * cos - sy * sin;
  const ry = sx * sin + sy * cos;

  return {
    x: pivotX + rx + translateX,
    y: pivotY + ry + translateY,
  };
}

// Convert a multi-segment cubic Bézier spine with variable radius into a single ultra-smooth
// closed SVG path with semicircular rounded endcaps
export function buildVariableWidthTubePath(
  segments: Array<[SpinePoint, SpinePoint, SpinePoint, SpinePoint]>,
  stepsPerSegment: number,
  softBody: SoftBodyParams,
): string {
  const centerPoints: Array<{
    x: number;
    y: number;
    r: number;
    nx: number;
    ny: number;
  }> = [];

  segments.forEach((seg, segIdx) => {
    const [p0, p1, p2, p3] = seg;
    const startStep = segIdx === 0 ? 0 : 1;
    for (let i = startStep; i <= stepsPerSegment; i++) {
      const t = i / stepsPerSegment;
      const pt = cubicBezier(p0, p1, p2, p3, t);
      const tan = cubicBezierTangent(p0, p1, p2, p3, t);
      const len = Math.hypot(tan.dx, tan.dy) || 1;
      const nx = -tan.dy / len;
      const ny = tan.dx / len;
      centerPoints.push({ x: pt.x, y: pt.y, r: pt.r, nx, ny });
    }
  });

  if (centerPoints.length < 2) return '';

  const leftSide: Array<{ x: number; y: number }> = [];
  const rightSide: Array<{ x: number; y: number }> = [];

  for (let i = 0; i < centerPoints.length; i++) {
    const c = centerPoints[i];
    leftSide.push(
      deformSoftBodyPoint(c.x + c.nx * c.r, c.y + c.ny * c.r, softBody),
    );
    rightSide.push(
      deformSoftBodyPoint(c.x - c.nx * c.r, c.y - c.ny * c.r, softBody),
    );
  }

  const endCap: Array<{ x: number; y: number }> = [];
  const last = centerPoints[centerPoints.length - 1];
  const lastAngle = Math.atan2(last.ny, last.nx);
  const capSteps = 16;
  for (let i = 1; i < capSteps; i++) {
    const theta = lastAngle - (i / capSteps) * Math.PI;
    const cx = last.x + Math.cos(theta) * last.r;
    const cy = last.y + Math.sin(theta) * last.r;
    endCap.push(deformSoftBodyPoint(cx, cy, softBody));
  }

  const startCap: Array<{ x: number; y: number }> = [];
  const first = centerPoints[0];
  const firstAngle = Math.atan2(-first.ny, -first.nx);
  for (let i = 1; i < capSteps; i++) {
    const theta = firstAngle - (i / capSteps) * Math.PI;
    const cx = first.x + Math.cos(theta) * first.r;
    const cy = first.y + Math.sin(theta) * first.r;
    startCap.push(deformSoftBodyPoint(cx, cy, softBody));
  }

  const allPoints = [
    ...leftSide,
    ...endCap,
    ...rightSide.reverse(),
    ...startCap,
  ];

  return pointsToSmoothClosedSvgPath(allPoints);
}

// Convert a dense ring of points into a smooth closed SVG path using midpoint quadratic splines
export function pointsToSmoothClosedSvgPath(
  pts: Array<{ x: number; y: number }>,
): string {
  const n = pts.length;
  if (n < 3) return '';

  const startMidX = (pts[n - 1].x + pts[0].x) * 0.5;
  const startMidY = (pts[n - 1].y + pts[0].y) * 0.5;

  const commands: string[] = [`M ${startMidX.toFixed(2)} ${startMidY.toFixed(2)}`];

  for (let i = 0; i < n; i++) {
    const curr = pts[i];
    const next = pts[(i + 1) % n];
    const midX = (curr.x + next.x) * 0.5;
    const midY = (curr.y + next.y) * 0.5;
    commands.push(
      `Q ${curr.x.toFixed(2)} ${curr.y.toFixed(2)} ${midX.toFixed(2)} ${midY.toFixed(2)}`,
    );
  }

  commands.push('Z');
  return commands.join(' ');
}

function buildDeformedClosedBezierLoop(
  segments: Array<
    [
      { x: number; y: number },
      { x: number; y: number },
      { x: number; y: number },
      { x: number; y: number },
    ]
  >,
  stepsPerSegment: number,
  softBody: SoftBodyParams,
): string {
  const ringPoints: Array<{ x: number; y: number }> = [];

  segments.forEach((seg) => {
    const [p0, p1, p2, p3] = seg;
    for (let i = 0; i < stepsPerSegment; i++) {
      const t = i / stepsPerSegment;
      const pt = cubicBezier(
        { ...p0, r: 0 },
        { ...p1, r: 0 },
        { ...p2, r: 0 },
        { ...p3, r: 0 },
        t,
      );
      ringPoints.push(deformSoftBodyPoint(pt.x, pt.y, softBody));
    }
  });

  return pointsToSmoothClosedSvgPath(ringPoints);
}

// Precision Gumdrop Arch Silhouette for Mascot Letter 'A'
export function buildDeformedLetterAPath(softBody: SoftBodyParams): string {
  const segments: Array<
    [
      { x: number; y: number },
      { x: number; y: number },
      { x: number; y: number },
      { x: number; y: number },
    ]
  > = [
    [
      { x: 396, y: 112 },
      { x: 454, y: 112 },
      { x: 476, y: 180 },
      { x: 482, y: 300 },
    ],
    [
      { x: 482, y: 300 },
      { x: 485, y: 334 },
      { x: 468, y: 348 },
      { x: 442, y: 348 },
    ],
    [
      { x: 442, y: 348 },
      { x: 418, y: 348 },
      { x: 412, y: 318 },
      { x: 396, y: 318 },
    ],
    [
      { x: 396, y: 318 },
      { x: 380, y: 318 },
      { x: 374, y: 348 },
      { x: 350, y: 348 },
    ],
    [
      { x: 350, y: 348 },
      { x: 324, y: 348 },
      { x: 307, y: 334 },
      { x: 310, y: 300 },
    ],
    [
      { x: 310, y: 300 },
      { x: 316, y: 180 },
      { x: 338, y: 112 },
      { x: 396, y: 112 },
    ],
  ];

  return buildDeformedClosedBezierLoop(segments, 16, softBody);
}

// Unified Single-Piece Bubble Outline for Letter 'N'
export function buildDeformedLetterNPath(softBody: SoftBodyParams): string {
  const segments: Array<
    [
      { x: number; y: number },
      { x: number; y: number },
      { x: number; y: number },
      { x: number; y: number },
    ]
  > = [
    [
      { x: 494, y: 308 },
      { x: 496, y: 256 },
      { x: 502, y: 204 },
      { x: 506, y: 156 },
    ],
    [
      { x: 506, y: 156 },
      { x: 510, y: 118 },
      { x: 556, y: 114 },
      { x: 576, y: 146 },
    ],
    [
      { x: 576, y: 146 },
      { x: 590, y: 170 },
      { x: 604, y: 202 },
      { x: 610, y: 202 },
    ],
    [
      { x: 610, y: 202 },
      { x: 614, y: 202 },
      { x: 614, y: 174 },
      { x: 616, y: 148 },
    ],
    [
      { x: 616, y: 148 },
      { x: 618, y: 116 },
      { x: 678, y: 116 },
      { x: 682, y: 152 },
    ],
    [
      { x: 682, y: 152 },
      { x: 680, y: 204 },
      { x: 674, y: 256 },
      { x: 670, y: 308 },
    ],
    [
      { x: 670, y: 308 },
      { x: 666, y: 346 },
      { x: 618, y: 350 },
      { x: 598, y: 316 },
    ],
    [
      { x: 598, y: 316 },
      { x: 584, y: 292 },
      { x: 570, y: 260 },
      { x: 564, y: 260 },
    ],
    [
      { x: 564, y: 260 },
      { x: 560, y: 260 },
      { x: 560, y: 288 },
      { x: 558, y: 312 },
    ],
    [
      { x: 558, y: 312 },
      { x: 556, y: 348 },
      { x: 492, y: 346 },
      { x: 494, y: 308 },
    ],
  ];

  return buildDeformedClosedBezierLoop(segments, 12, softBody);
}
