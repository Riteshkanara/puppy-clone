/**
 * Port of the ORIGINAL TeddyPups mascot controller (recovered from the reference build).
 * It drives the captured rig markup (`[data-p]` parts in data/pupBuddies.ts) every animation frame:
 * poses, eased wag / gaze / ear spring, blinking, and "petting" (eyes squeeze shut while the pointer is over him).
 */

type Pt = [number, number]
const BODY_PIVOT: Pt = [196, 206]
const HEAD_PIVOT: Pt = [212, 100]
const SHOULDER_N: Pt = [186, 194]
const SHOULDER_F: Pt = [168, 192]
const HIP_N: Pt = [110, 194]
const HIP_F: Pt = [94, 192]
const TAIL_BASE: Pt = [84, 150]
const EAR_L: Pt = [174, 82]
const EAR_R: Pt = [250, 82]
const VIEW_W = 300
const VIEW_H = 240
const EYE_Y = 98
const GAZE_CX = 212

export interface Pose {
  bodyRot: number; bodyX: number; bodyY: number; stretch: number
  headX: number; headY: number; headRot: number
  earL: number; earR: number; tail: number
  fn: number; ff: number; bn: number; bf: number
  sit: number; eyes: number; happy: number; tongue: number; mouth: number; front: number
  collar: number
}
const base: Pose = {
  bodyRot: 0, bodyX: 0, bodyY: 0, stretch: 1, headX: 0, headY: 0, headRot: 0, earL: 0, earR: 0, tail: 0,
  fn: 0, ff: 0, bn: 0, bf: 0, sit: 0, eyes: 1, happy: 0, tongue: 0, mouth: 0, front: 0, collar: 1,
}
export const POSES = {
  stand: base,
  walk: { ...base, tail: -6, tongue: 1 },
  sit: { ...base, bodyRot: -24, bodyY: -2, headX: -10, headY: -6, tail: 34, sit: 1, tongue: 1 },
  peek: { ...base, headY: 4, earL: -6, earR: 6, tail: -20, front: 1, tongue: 1 },
  snug: { ...base, headY: 9, headRot: 4, earL: 3, earR: -3, tail: -20, front: 1, tongue: 0, collar: 0 },
  hop: { ...base, bodyRot: -9, stretch: 1.06, headY: -6, fn: -42, ff: -32, bn: 40, bf: 30, earL: -26, earR: 26, tail: -24, tongue: 1 },
  lie: { ...base, bodyRot: -5, bodyY: 22, headX: 12, headY: 40, headRot: 3, fn: -84, ff: -80, sit: 1, tail: 58, tongue: 0 },
  sleep: { ...base, bodyRot: -5, bodyY: 22, headX: 14, headY: 44, headRot: -8, fn: -84, ff: -80, sit: 1, tail: 64, eyes: 0, earL: 4, earR: -4 },
  settle: { ...base, bodyRot: -5, bodyY: 22, headX: 10, headY: 16, fn: -84, ff: -80, sit: 1, tail: 40, tongue: 1 },
  sniff: { ...base, bodyRot: 7, headX: 16, headY: 32, headRot: 9, tail: -14, fn: 6, ff: 4 },
  bow: { ...base, bodyRot: 15, bodyY: 2, headX: 14, headY: 30, fn: -58, ff: -52, tail: -32, happy: 1, tongue: 1 },
  beg: { ...base, bodyRot: -36, bodyY: -6, headX: -18, headY: -18, sit: 1, fn: -70, ff: -64, tail: 30, happy: 1, tongue: 1 },
} satisfies Record<string, Pose>
export type PoseName = keyof typeof POSES

interface Motion { phase: number; stride: number; time: number; wag: number; gazeX: number; gazeY: number; blink: number; ear: number }

const x2 = (v: number) => Math.round(100 * v) / 100
const rot = (a: number, [cx, cy]: Pt) => `rotate(${x2(a)} ${cx} ${cy})`
const ease = (dt: number, tau: number) => 1 - Math.exp(-dt / tau)
const clamp = (v: number, lo = -1, hi = 1) => Math.max(lo, Math.min(hi, v))
const KEYS = Object.keys(base) as (keyof Pose)[]
const lerpPose = (a: Pose, b: Pose, k: number): Pose => {
  const o = { ...a }
  for (const key of KEYS) o[key] = a[key] + (b[key] - a[key]) * k
  return o
}

/** pose + motion → attribute values for every animated part (the original's F()) */
function compute(e: Pose, m: Motion) {
  const sinP = Math.sin(m.phase)
  const sinPP = Math.sin(m.phase + Math.PI)
  const amp = 20 + 10 * m.stride
  const p = (1 - Math.cos(2 * m.phase)) / 2
  const g = +(m.stride > 0.01)
  const br = Math.sin(2.4 * m.time) * (1 - g) // breathing
  const bodyY = e.bodyY - p * (2.5 + 4 * m.stride) * g + 0.6 * br
  const bodyRot = e.bodyRot + 1.6 * Math.sin(m.phase) * g
  const counter = -e.bodyRot
  const wagAmp = 5 + 17 * m.wag
  const wagHz = (1.2 + 2.6 * m.wag) * 1.1 // +10% faster than the first port
  const tail = e.tail + Math.sin(m.time * wagHz * Math.PI * 2) * wagAmp
  const headBob = -(1 - Math.cos(2 * m.phase - 0.7)) / 2 * (2 + 3 * m.stride) * g + 0.9 * br
  return {
    body: `translate(${x2(e.bodyX)} ${x2(bodyY)}) ${rot(bodyRot, BODY_PIVOT)} translate(${BODY_PIVOT[0]} 0) scale(${x2(e.stretch)} 1) translate(${-BODY_PIVOT[0]} 0)`,
    fn: `translate(${SHOULDER_N[0]} ${SHOULDER_N[1]}) rotate(${x2(e.fn + counter + sinP * amp * g)})`,
    ff: `translate(${SHOULDER_F[0]} ${SHOULDER_F[1]}) rotate(${x2(e.ff + counter + sinPP * amp * g)})`,
    bn: `translate(${HIP_N[0]} ${HIP_N[1]}) rotate(${x2(e.bn + sinPP * amp * g)})`,
    bf: `translate(${HIP_F[0]} ${HIP_F[1]}) rotate(${x2(e.bf + sinP * amp * g)})`,
    tail: rot(tail, TAIL_BASE),
    haunch: `translate(0 ${x2(-(0.06 * e.bodyRot))})`,
    head: `translate(${x2(e.headX)} ${x2(e.headY + headBob)}) ${rot(e.headRot + 1.4 * Math.sin(m.phase) * g, HEAD_PIVOT)}`,
    earL: rot(e.earL + m.ear + 4 * Math.sin(2 * m.phase) * g, EAR_L),
    earR: rot(e.earR - m.ear - 4 * Math.sin(2 * m.phase) * g, EAR_R),
    eyes: `translate(${x2(3.4 * m.gazeX)} ${x2(2.6 * m.gazeY)})`,
    blink: `translate(0 ${x2(EYE_Y * m.blink * 0.92)}) scale(1 ${x2(1 - 0.92 * m.blink)})`,
    openEyes: x2(Math.max(0, e.eyes - e.happy)),
    happyEyes: x2(Math.min(e.happy, e.eyes)),
    shutEyes: x2(1 - e.eyes),
    tongue: x2(e.tongue * (1 - e.mouth)),
    mouth: x2(e.mouth),
    backLegs: x2(1 - e.sit),
    haunchOpacity: x2(e.sit * (1 - e.front)),
    side: x2(1 - e.front),
    ledge: x2(e.front),
    collar: x2(e.collar),
    shadow: `translate(${x2(0.6 * e.bodyX)} 0) scale(${x2(1 - 0.05 * p * g)} 1)`,
    shadowOpacity: x2(0.12 * (1 - e.front)),
  }
}

type Out = ReturnType<typeof compute>
// [data-p part, attribute, key in compute()]
const BINDINGS: [string, string, keyof Out | 'root'][] = [
  ['root', 'transform', 'root'],
  ['shadow', 'transform', 'shadow'], ['shadow', 'opacity', 'shadowOpacity'],
  ['body', 'transform', 'body'], ['body', 'opacity', 'side'],
  ['bf', 'transform', 'bf'], ['bf', 'opacity', 'backLegs'],
  ['bn', 'transform', 'bn'], ['bn', 'opacity', 'backLegs'],
  ['ff', 'transform', 'ff'], ['fn', 'transform', 'fn'],
  ['tail', 'transform', 'tail'],
  ['haunch', 'transform', 'haunch'], ['haunch', 'opacity', 'haunchOpacity'],
  ['head', 'transform', 'head'], ['earL', 'transform', 'earL'], ['earR', 'transform', 'earR'],
  ['eyes', 'transform', 'eyes'],
  ['open', 'opacity', 'openEyes'], ['blink', 'transform', 'blink'],
  ['happy', 'opacity', 'happyEyes'], ['shut', 'opacity', 'shutEyes'],
  ['tongue', 'opacity', 'tongue'], ['mouth', 'opacity', 'mouth'],
  ['ledge', 'opacity', 'ledge'],
  ['collar', 'opacity', 'collar'],
]

export class PupRig {
  private els = new Map<string, SVGElement>()
  private written = new Map<string, string>()
  private pose: Pose
  private target: Pose
  private m: Motion = { phase: 0, stride: 0, time: 0, wag: 0, gazeX: 0, gazeY: 0, blink: 0, ear: 0 }
  private strideTarget = 0
  private wagTarget = 0.35
  private gazeTarget = { x: 0, y: 0 }
  private tilt = 0
  private tiltTarget = 0
  private earV = 0
  private nextBlink = 1.2
  private blinkAt = -1
  private woofUntil = 0
  private bounce = 0
  private bounceV = 0
  private offset = 0
  private offsetTarget = 0
  private turn = 0.07
  private pet = 0
  private petTarget = 0
  /** 0 = off, 1 = on: lets the head drift a little left/right (cursor-led, plus a slow idle sway). Only the footer basket uses it. */
  sway = 0
  private swayK = 0
  facing: number
  facingTarget: number

  private svg: SVGSVGElement

  constructor(svg: SVGSVGElement, pose: PoseName = 'sit', facing = 1) {
    this.svg = svg
    svg.querySelectorAll<SVGElement>('[data-p]').forEach((el) => this.els.set(el.dataset.p as string, el))
    this.pose = { ...POSES[pose] }
    this.target = this.pose
    this.facing = this.facingTarget = facing
  }

  setPose(p: PoseName | Pose) { this.target = typeof p === 'string' ? POSES[p] : p }
  /** snap straight to a pose (no easing) */
  jump(p: PoseName, facing?: number) {
    this.pose = { ...POSES[p] }
    this.target = POSES[p]
    if (facing) this.facing = this.facingTarget = facing
  }
  /** turn to face left (-1) / right (1); `tau` is the turn speed (smaller = snappier) */
  face(dir: number, tau = 0.07) { this.facingTarget = dir; this.turn = tau }
  get facingDir() { return this.facingTarget }
  /** 0 = standing still, 1 = full walking stride */
  stride(v: number) { this.strideTarget = clamp(v, 0, 1) }
  /** advance the leg cycle by `px` of ground covered */
  advance(px: number) { this.m.phase += (px / 46) * Math.PI }
  /** set the leg cycle from the total ground covered (so scrolling back un-walks) */
  walkedTo(px: number) { this.m.phase = (px / 46) * Math.PI }
  wag(v: number) { this.wagTarget = clamp(v, 0, 1) }
  cock(deg: number) { this.tiltTarget = deg }
  petting(on: boolean) { this.petTarget = on ? 1 : 0 }
  jolt(k = 1) { this.earV += 220 * k }
  woof(t: number) { this.woofUntil = t + 0.34; this.bounceV = -150; this.earV += 260 }
  hop(k = 1) { this.bounceV = -230 * k; this.earV += 200 * k }
  yawn(t: number, secs = 0.9) { this.woofUntil = t + secs }
  /** slide sideways inside the rig's own box (zoomies) */
  dash(px: number) { this.offsetTarget = px }
  reset() { this.offsetTarget = 0; this.tiltTarget = 0; this.petTarget = 0 }

  /** look toward a screen point (or straight ahead when null) */
  lookAt(pt: { x: number; y: number } | null) {
    if (!pt) { this.gazeTarget = { x: 0, y: 0 }; return }
    const r = this.svg.getBoundingClientRect()
    const ox = this.facingTarget > 0 ? GAZE_CX : VIEW_W - GAZE_CX
    const cx = r.left + (ox / VIEW_W) * r.width
    const cy = r.top + (EYE_Y / VIEW_H) * r.height
    const dx = pt.x - cx
    const dy = pt.y - cy
    const len = Math.hypot(dx, dy) || 1
    const d = Math.min(1, len / 160)
    this.gazeTarget = { x: (dx / len) * d * this.facingTarget, y: (dy / len) * d }
  }

  tick(dtRaw: number, t: number) {
    const dt = Math.min(dtRaw, 0.05)
    const m = this.m
    m.time = t
    this.pose = lerpPose(this.pose, this.target, ease(dt, 0.16))
    this.facing += (this.facingTarget - this.facing) * ease(dt, this.turn)
    m.stride += (this.strideTarget - m.stride) * ease(dt, 0.12)
    if (m.stride < 0.012 && this.strideTarget === 0) m.stride = 0
    m.wag += (this.wagTarget - m.wag) * ease(dt, 0.4)
    m.gazeX += (this.gazeTarget.x - m.gazeX) * ease(dt, 0.07)
    m.gazeY += (this.gazeTarget.y - m.gazeY) * ease(dt, 0.07)
    this.tilt += (this.tiltTarget + 3 * m.gazeX - this.tilt) * ease(dt, 0.18)
    this.earV += (-150 * m.ear - 10 * this.earV) * dt
    m.ear = clamp(m.ear + this.earV * dt, -28, 28)
    // hop / woof bounce is a damped spring
    this.bounceV += (-260 * this.bounce - 16 * this.bounceV) * dt
    this.bounce += this.bounceV * dt
    // zoomies slide: legs keep pace with the ground covered
    const prevOffset = this.offset
    this.offset += (this.offsetTarget - this.offset) * ease(dt, 0.2)
    if (Math.abs(this.offsetTarget - this.offset) < 0.05) this.offset = this.offsetTarget
    const moved = Math.abs(this.offset - prevOffset)
    if (moved) this.advance(moved)
    const slideStride = dt > 0 ? Math.min(1, moved / dt / 180) : 0
    this.pet += (this.petTarget - this.pet) * ease(dt, 0.15)
    // random blinks (only while the eyes are open)
    if (t > this.nextBlink && this.pose.eyes > 0.6) {
      this.blinkAt = t
      this.nextBlink = t + 2.2 + 3.8 * Math.random()
      if (Math.random() < 0.18) this.nextBlink = t + 0.32
    }
    const c = (t - this.blinkAt) / 0.15
    m.blink = c >= 0 && c <= 1 ? Math.sin(c * Math.PI) : 0

    // optional head sway: leans toward the cursor, and keeps a slow, tiny left/right drift when nothing is moving
    this.swayK += (this.sway - this.swayK) * ease(dt, 0.25)
    const idleSway = Math.sin(t * 0.85) * 0.6 + Math.sin(t * 0.37 + 1.3) * 0.4
    const swayX = this.swayK * (3.2 * m.gazeX + 1.5 * idleSway)
    const swayRot = this.swayK * (1.8 * m.gazeX + 1.4 * idleSway)
    const h: Pose = {
      ...this.pose,
      headX: this.pose.headX + swayX,
      headRot: this.pose.headRot + this.tilt + swayRot,
      bodyY: this.pose.bodyY + this.bounce,
      headY: this.pose.headY + 1.15 * this.bounce,
      mouth: t < this.woofUntil ? 1 : this.pose.mouth,
      happy: Math.max(this.pose.happy, this.pet),
    }
    const out = compute(h, slideStride > m.stride ? { ...m, stride: slideStride } : m)
    const f = Math.abs(this.facing) < 0.02 ? 0.02 * Math.sign(this.facing || 1) : this.facing
    const root = `translate(${this.offset.toFixed(1)} 0) translate(${VIEW_W / 2} 0) scale(${f.toFixed(3)} 1) translate(${-VIEW_W / 2} 0)`
    for (const [part, attr, key] of BINDINGS) {
      const el = this.els.get(part)
      if (!el) continue
      const val = key === 'root' ? root : String(out[key])
      const id = `${part}:${attr}`
      if (this.written.get(id) !== val) { el.setAttribute(attr, val); this.written.set(id, val) }
    }
  }
}
