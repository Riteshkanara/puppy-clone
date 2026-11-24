type Pt = { x: number; y: number };

/**
 * Curly "cloud" outline: `bumps` points sampled round an ellipse, each joined by a
 * quadratic curve whose control point is pushed outward — gives the poodle-fur scallops.
 * Returns SVG path data centred on (cx, cy).
 */
export function fluff(cx: number, cy: number, rx: number, ry: number, bumps: number, amp = 0.16, rot = 0): string {
  const r = (n: number) => Math.round(n * 10) / 10;
  const pts: Pt[] = [];
  for (let i = 0; i < bumps; i++) {
    const a = rot + (i / bumps) * Math.PI * 2;
    pts.push({ x: cx + Math.cos(a) * rx, y: cy + Math.sin(a) * ry });
  }
  let d = `M${r(pts[0].x)} ${r(pts[0].y)}`;
  for (let i = 0; i < bumps; i++) {
    const am = rot + ((i + 0.5) / bumps) * Math.PI * 2;
    const next = pts[(i + 1) % bumps];
    d += ` Q${r(cx + Math.cos(am) * rx * (1 + amp * 1.9))} ${r(cy + Math.sin(am) * ry * (1 + amp * 1.9))} ${r(next.x)} ${r(next.y)}`;
  }
  return d + "Z";
}
