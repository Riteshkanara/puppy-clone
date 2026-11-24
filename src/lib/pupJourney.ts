import { POSES, type PoseName } from './pupRig'

/**
 * Teddy's journey down the page — the path maths, ported from the original controller.
 *
 * Every `[data-pup-stop]` on the page is a place Teddy can sit. `buildPlan` measures them all and works out,
 * for each one, the band of scroll positions in which he stays put ("hold") and, between two stops, the band
 * in which he travels. `solve` then turns any scroll position into where he is: it is a pure function of
 * `scrollY`, so scrolling down walks him down the path and scrolling up walks the very same path back.
 */

export type Box = [number, number, number, number]
export type Track =
  | { kind: 'page'; top: number }
  | { kind: 'screen'; top: number }
  | { kind: 'pin'; top: number; from: number; to: number }

export interface Stop {
  x: number
  track: Track
  s: number
  behind: boolean
  /** > 0 : the stop is a "peek over the screen edge" stop (mobile lane) — how far he sinks */
  sink: number
  box: Box
}
export interface StopMeta {
  scene: HTMLElement | null
  pose: PoseName
  facing: 1 | -1
  act: string
  looks: HTMLElement[]
  /** treadmill stops: the moving element whose sideways travel drives his legs */
  track: HTMLElement | null
}
export interface Plan {
  lane: boolean
  stops: Stop[]
  meta: StopMeta[]
  holds: [number, number][]
  blend: number
  mainTop: number
}
export interface Safe { left: number; top: number; right: number; bottom: number }
export interface State {
  x: number; y: number; s: number
  front: boolean; airborne: boolean
  k: number; t: number; walked: number
}

/** where the rig's "feet" are inside its 300 × 240 viewBox */
export const ANCHOR = { x: 150, y: 228 }
export const RIG_W = 300
const DEFAULT_BOX: Box = [48, 30, 288, 236]
const BOXES: Partial<Record<string, Box>> = {
  sit: [50, 26, 284, 234],
  peek: [148, 34, 280, 163],
  snug: [148, 40, 280, 163],
  bow: [58, 56, 292, 236],
}
const boxOf = (pose: string): Box => BOXES[pose] ?? DEFAULT_BOX
const SINK = ANCHOR.y - 159
/** share of the screen height in which a stop "holds" Teddy: [lane (phone), desktop] */
const BAND_LANE: [number, number] = [0.6, 0.86]
const BAND: [number, number] = [0.42, 0.78]

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const smooth = (v: number) => v * v * (3 - 2 * v)
const smoothstep = (a: number, b: number, v: number) => (b === a ? +(v >= b) : smooth(clamp01((v - a) / (b - a))))
const lerp = (a: number, b: number, k: number) => a + (b - a) * k
const lerpBox = (a: Box, b: Box, k: number): Box => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k), lerp(a[3], b[3], k)]
/** smooth max / min — keeps him inside the screen without a hard "wall" */
const softMax = (v: number, floor: number, k: number) => {
  const s = (v - floor) / k
  return s > 20 ? v : floor + k * Math.log1p(Math.exp(s))
}
const softMin = (v: number, ceil: number, k: number) => -softMax(-v, -ceil, k)

const bezier = (p0: Pt, c1: Pt, c2: Pt, p1: Pt, t: number): Pt => {
  const u = 1 - t
  const a = u * u * u
  const b = 3 * u * u * t
  const c = 3 * u * t * t
  const d = t * t * t
  return { x: a * p0.x + b * c1.x + c * c2.x + d * p1.x, y: a * p0.y + b * c1.y + c * c2.y + d * p1.y }
}
interface Pt { x: number; y: number }

/** where a stop's rig anchor sits on screen for a given scroll position */
function stopPoint(stop: Stop, scroll: number): Pt {
  const k = stop.track
  const top =
    k.kind === 'page' ? k.top - scroll
    : k.kind === 'screen' ? k.top
    : scroll < k.from ? k.top - (scroll - k.from)
    : scroll > k.to ? k.top - (scroll - k.to)
    : k.top
  return { x: stop.x + ANCHOR.x * stop.s, y: top + ANCHOR.y * stop.s }
}

/** which segment a scroll position falls in: k = stop (t = 0, holding) or the gap after stop k (0 < t < 1) */
export function locate(holds: [number, number][], scroll: number): { k: number; t: number } {
  if (!holds.length || scroll <= holds[0][1]) return { k: 0, t: 0 }
  for (let i = 0; i < holds.length - 1; i++) {
    const leave = holds[i][1]
    const arrive = holds[i + 1][0]
    if (scroll < arrive) return { k: i, t: clamp01((scroll - leave) / Math.max(1, arrive - leave)) }
    if (scroll <= holds[i + 1][1]) return { k: i + 1, t: 0 }
  }
  return { k: holds.length - 1, t: 0 }
}

/** keep the whole rig box (scaled) inside the safe screen area, softly */
function clampInto(x: number, y: number, scale: number, box: Box, safe: Safe, k = 8): Pt {
  const l = (ANCHOR.x - box[0]) * scale
  const r = (box[2] - ANCHOR.x) * scale
  const t = (ANCHOR.y - box[1]) * scale
  const b = (box[3] - ANCHOR.y) * scale
  return {
    x: safe.right - safe.left > l + r ? softMin(softMax(x, safe.left + l, k), safe.right - r, k) : (safe.left + safe.right) / 2 - (r - l) / 2,
    y: safe.bottom - safe.top > t + b ? softMin(softMax(y, safe.top + t, k), safe.bottom - b, k) : safe.bottom - b,
  }
}

/** the curved path between two stops (a cubic bézier, pushed sideways when the stops are stacked) */
function curve(a: Pt, b: Pt, safe: Safe) {
  const dx = b.x - a.x
  const width = safe.right - safe.left
  const reach = Math.max(0.45 * Math.abs(dx), 0)
  const dir = dx >= 0 ? 1 : -1
  let c1: Pt = { x: a.x + dir * reach, y: a.y }
  let c2: Pt = { x: b.x - dir * reach, y: b.y }
  const minSwing = 0.14 * width
  if (Math.abs(dx) < minSwing) {
    const push = ((a.x + b.x) / 2 < (safe.left + safe.right) / 2 ? 1 : -1) * (minSwing - Math.abs(dx)) * 0.9
    c1 = { x: c1.x + push, y: lerp(a.y, b.y, 0.2) }
    c2 = { x: c2.x + push, y: lerp(a.y, b.y, 0.8) }
  }
  const fit = (p: Pt): Pt => ({ x: Math.min(safe.right, Math.max(safe.left, p.x)), y: Math.min(safe.bottom, Math.max(safe.top, p.y)) })
  return { p0: a, c1: fit(c1), c2: fit(c2), p1: b }
}

/** scroll position → Teddy's state */
export function solve(plan: Plan, scroll: number, safe: Safe): State {
  const { stops, holds } = plan
  const { k, t } = locate(holds, scroll)
  if (t <= 0 || k >= stops.length - 1) {
    const stop = stops[k]
    const p = stopPoint(stop, scroll)
    const c = clampInto(p.x, p.y, stop.s, stop.box, safe)
    return { x: c.x, y: c.y, s: stop.s, front: !stop.behind, airborne: false, k, t: 0, walked: 0 }
  }
  const a = stops[k]
  const b = stops[k + 1]
  const leave = holds[k][1]
  const arrive = holds[k + 1][0]
  const span = Math.max(1, arrive - leave)
  const v = clamp01((scroll - leave) / span)
  const pa = stopPoint(a, leave)
  const pb = stopPoint(b, arrive)
  const path = curve({ x: pa.x, y: pa.y - a.sink * a.s }, { x: pb.x, y: pb.y - b.sink * b.s }, safe)
  const along = v * v * v * (v * (6 * v - 15) + 10) // smootherstep: gentle start, gentle landing
  const m = bezier(path.p0, path.c1, path.c2, path.p1, along)
  const scale = lerp(a.s, b.s, smooth(clamp01(v / 0.65)))
  // near either end he is glued to the stop (it keeps scrolling under him), so blend its drift in and out
  const blend = Math.min(0.3, Math.max(0.06, plan.blend / span))
  const fromA = 1 - smoothstep(0, blend, v)
  const toB = smoothstep(1 - blend, 1, v)
  let y = m.y + fromA * (stopPoint(a, scroll).y - pa.y) + toB * (stopPoint(b, scroll).y - pb.y)
  const x = m.x
  y += a.sink * a.s * (1 - smoothstep(0, 0.22, v)) + b.sink * b.s * smoothstep(0.78, 1, v)
  let airborne = false
  if (a.behind && v < 0.36) {
    y -= Math.sin((v / 0.36) * Math.PI) * Math.min(64 * a.s, 72)
    airborne = v < 0.32
  }
  if (b.behind && v > 0.68) {
    y -= Math.sin(((v - 0.68) / 0.32) * Math.PI) * Math.min(56 * b.s, 60)
    airborne = true
  }
  if (a.sink && v < 0.2) airborne = true
  const front = !((a.behind && v < 0.12) || (b.behind && v > 0.92))
  const box =
    v < 0.5
      ? lerpBox(a.box, DEFAULT_BOX, smoothstep(0, a.sink ? 0.22 : a.behind ? 0.36 : 0.06, v))
      : lerpBox(DEFAULT_BOX, b.box, smoothstep(b.sink ? 0.78 : b.behind ? 0.68 : 0.94, 1, v))
  const c = clampInto(x, y, scale, box, safe)
  // ground covered along the curve (drives his leg cycle, so scrolling back un-walks him)
  let walked = 0
  let last = path.p0
  const steps = Math.max(1, Math.ceil(32 * clamp01(along)))
  for (let i = 1; i <= steps; i++) {
    const p = bezier(path.p0, path.c1, path.c2, path.p1, (i / steps) * clamp01(along))
    walked += Math.hypot(p.x - last.x, p.y - last.y)
    last = p
  }
  return { x: c.x, y: c.y, s: scale, front, airborne, k, t: v, walked }
}

/** when the scroll is idle between two stops he settles at the nearest "end" of a hide / sink move instead of freezing mid-air */
export function settleScroll(plan: Plan, scroll: number): number {
  const { stops, holds } = plan
  const { k, t } = locate(holds, scroll)
  if (t <= 0 || k >= stops.length - 1) return scroll
  const a = stops[k]
  const b = stops[k + 1]
  const lo = a.sink ? 0.22 : a.behind ? 0.36 : 0
  const hi = b.sink ? 0.78 : b.behind ? 0.68 : 1
  let d = t
  if (t < lo) d = t < lo / 2 ? 0 : lo
  else if (t > hi) d = t > (1 + hi) / 2 ? 1 : hi
  return d === t ? scroll : holds[k][1] + d * (holds[k + 1][0] - holds[k][1])
}

// ------------------------------------------------------------------------------------------------ planner

const LANE_QUERY = '(max-width: 767px), (pointer: coarse) and (max-height: 519px)'

/** the nearest `position: sticky` ancestor — a pinned scene: Teddy rides along with the pin */
function stickyParent(el: HTMLElement): HTMLElement | null {
  for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
    if (getComputedStyle(p).position === 'sticky') return p
  }
  return null
}

function trackFor(el: HTMLElement, r: DOMRect): Track {
  const sticky = stickyParent(el)
  if (!sticky) return { kind: 'page', top: r.top + scrollY }
  const stick = parseFloat(getComputedStyle(sticky).top) || 0
  const offset = r.top - sticky.getBoundingClientRect().top
  const saved = sticky.style.position
  sticky.style.position = 'relative'
  const rest = sticky.getBoundingClientRect()
  const parent = sticky.parentElement as HTMLElement
  const parentBottom = parent.getBoundingClientRect().bottom - (parseFloat(getComputedStyle(parent).paddingBottom) || 0)
  sticky.style.position = saved
  const from = rest.top + scrollY - stick
  const to = parentBottom + scrollY - rest.height - stick
  return to <= from ? { kind: 'page', top: rest.top + scrollY + offset } : { kind: 'pin', top: stick + offset, from, to }
}

export function whatsappBarTop(): number {
  const bar = document.querySelector<HTMLElement>('[data-whatsapp-bar]')
  const r = bar?.getClientRects().length ? bar.getBoundingClientRect() : null
  return r && r.height ? r.top : innerHeight - 6
}
export function headerHeight(): number {
  return document.querySelector<HTMLElement>('.site-header, #site-header')?.offsetHeight ?? 76
}

export function safeArea(plan: Plan): Safe {
  const w = document.documentElement.clientWidth
  const top = headerHeight() + 10
  if (plan.lane) return { left: 10, top, right: w - 10, bottom: whatsappBarTop() + 40 }
  const bar = document.querySelector<HTMLElement>('[data-whatsapp-bar]')
  const barTop = bar?.getClientRects().length ? bar.getBoundingClientRect().top : innerHeight
  return { left: 10, top, right: w - 10, bottom: Math.min(innerHeight, barTop) - 10 }
}

const KNOWN = (pose: string): pose is PoseName => pose in POSES

/** measure every stop on the page */
export function buildPlan(probe: HTMLElement): Plan {
  const lane = matchMedia(LANE_QUERY).matches
  const clientW = document.documentElement.clientWidth
  const vh = probe.getBoundingClientRect().height || innerHeight
  const hh = headerHeight()
  const bar = document.querySelector<HTMLElement>('[data-whatsapp-bar]')
  const view = {
    left: 10,
    top: hh + 10,
    right: clientW - 10,
    bottom: vh - 10 - (bar?.getClientRects().length ? bar.getBoundingClientRect().height : 0),
  }
  const main = document.querySelector<HTMLElement>('main')
  const stops: Stop[] = []
  const meta: StopMeta[] = []
  const bands: [number, number][] = []

  const addStop = (el: HTMLElement) => {
    const r = el.getBoundingClientRect()
    const pose = el.dataset.pose ?? 'sit'
    const act = el.dataset.act ?? ''
    const unit = r.width / RIG_W
    const scale = act === 'basket' || lane ? unit : 1.12 * unit
    const anchor = pose === 'peek' ? { x: ANCHOR.x, y: 159 } : ANCHOR
    const track = trackFor(el, r)
    if (track.kind !== 'screen') track.top += anchor.y * (unit - scale)
    const stop: Stop = {
      x: r.left + anchor.x * (unit - scale),
      track,
      s: scale,
      behind: el.dataset.behind === 'true',
      sink: 0,
      box: boxOf(pose),
    }
    const scene = el.closest<HTMLElement>('[data-pup-scene]')
    stops.push(stop)
    meta.push({
      scene,
      pose: pose as PoseName,
      facing: el.dataset.facing === 'left' ? -1 : 1,
      act,
      looks: scene ? [...scene.querySelectorAll<HTMLElement>('[data-pup-look]')] : [],
      track: act === 'treadmill' ? (scene?.querySelector<HTMLElement>('[data-treadmill]') ?? null) : null,
    })
    // the band of scroll positions in which this stop holds him: the screen-height share he should sit in
    let band: [number, number]
    if (track.kind === 'pin') band = [track.from, track.to]
    else {
      const top = track.top
      const boxTop = top + stop.box[1] * stop.s
      const boxBottom = top + stop.box[3] * stop.s
      const mid = (boxTop + boxBottom) / 2
      const h = view.bottom - view.top
      const share = lane ? BAND_LANE : BAND
      let late = mid - (view.top + share[1] * h)
      let early = mid - (view.top + share[0] * h)
      late = Math.max(late, boxBottom - view.bottom)
      early = Math.min(early, boxTop - view.top)
      band = late > early ? [mid - (view.top + h / 2), mid - (view.top + h / 2)] : [late, early]
      band = [band[0], band[1]]
    }
    if (!lane && scene && track.kind === 'page' && act !== 'basket' && act !== 'peekaboo') {
      // never let him linger past the end of his own scene
      const h = view.bottom - view.top
      const sceneEnd = scene.getBoundingClientRect().top + scrollY - view.top + 0.08 * h
      const floor = track.top + stop.box[3] * stop.s - view.bottom
      if (band[1] > sceneEnd) {
        const end = Math.max(sceneEnd, floor + 0.12 * h)
        band = [Math.max(floor, end - Math.max(band[1] - band[0], 0.2 * h)), end]
      }
    }
    bands.push(band)
  }

  const all = [...document.querySelectorAll<HTMLElement>('[data-pup-stop]')]
    .filter((el) => el.getClientRects().length)
    // stops in a pose the rig doesn't know (the Meet hall's own runner) are left to their scene
    .filter((el) => KNOWN(el.dataset.pose ?? 'sit'))

  if (lane) {
    // phones: he walks along the bottom edge of the screen and peeks up into each scene
    const laneStops = all.filter((el) => el.dataset.lane === 'true')
    const first = laneStops[0]
    const last = laneStops.length > 1 ? laneStops[laneStops.length - 1] : undefined
    if (first) addStop(first)
    const firstScene = meta[0]?.scene ?? null
    const scenes = [...document.querySelectorAll<HTMLElement>('main [data-pup-scene]')].filter((el) => el !== firstScene && el.getClientRects().length)
    const scale = Math.min(0.62, Math.max(0.5, clientW / 650))
    const box = boxOf('peek')
    scenes.forEach((scene, i) => {
      const left = i % 2 === 0
      stops.push({
        x: left ? view.left + 2 - box[0] * scale : view.right - 2 - box[2] * scale,
        track: { kind: 'screen', top: 0 },
        s: scale,
        behind: false,
        sink: SINK,
        box,
      })
      meta.push({ scene, pose: 'peek', facing: left ? 1 : -1, act: 'lane', looks: [], track: null })
      const r = scene.getBoundingClientRect()
      const a = r.top + scrollY - 0.42 * vh
      const b = r.bottom + scrollY - 0.58 * vh
      bands.push(a <= b ? [a, b] : [(a + b) / 2, (a + b) / 2])
    })
    if (last) addStop(last)
  } else all.forEach(addStop)

  const maxScroll = document.documentElement.scrollHeight - innerHeight
  const gaps = stops.slice(1).map((s, i) => {
    const p = stops[i]
    const sideways = Math.abs(s.x + ANCHOR.x * s.s - (p.x + ANCHOR.x * p.s))
    const rise = (BAND[1] - BAND[0]) * vh
    return Math.min(1.4 * vh, Math.max((lane ? 0.32 : 0.5) * vh, 1.15 * Math.hypot(sideways, rise)))
  })
  return {
    lane,
    stops,
    meta,
    holds: spreadHolds(bands, gaps, maxScroll),
    blend: 0.12 * vh,
    mainTop: main ? main.getBoundingClientRect().top + scrollY : 0,
  }
}

/** make sure consecutive holds don't overlap and leave each gap enough scroll distance to travel in */
function spreadHolds(bands: [number, number][], gaps: number[], maxScroll: number): [number, number][] {
  const n = bands.map((b): [number, number] => (b[0] <= b[1] ? [b[0], b[1]] : [(b[0] + b[1]) / 2, (b[0] + b[1]) / 2]))
  if (!n.length) return n
  n[0][0] = -Infinity
  const end = n[n.length - 1]
  end[1] = Infinity
  end[0] = Math.min(end[0], maxScroll - 1)
  for (let i = 0; i < n.length - 1; i++) {
    const a = n[i]
    const b = n[i + 1]
    if (b[0] < a[1]) {
      const mid = (a[1] + b[0]) / 2
      a[1] = Math.max(a[0], mid)
      b[0] = Math.min(b[1], mid)
      if (b[0] < a[1]) b[0] = a[1]
    }
    let need = (gaps[i] ?? 0) - (b[0] - a[1])
    if (need > 0) {
      const takeA = Math.min(need / 2, a[1] - a[0])
      const takeB = Math.min(need / 2, b[1] - b[0])
      a[1] -= takeA
      b[0] += takeB
      need -= takeA + takeB
      const more = Math.min(need, b[1] - b[0])
      b[0] += more
      need -= more
      if (need > 0) a[1] -= Math.min(need, a[1] - a[0])
    }
  }
  for (const r of n) if (r[1] < r[0]) r[1] = r[0]
  return n
}

/** let any scene nudge Teddy: `cuePup({ look: element, secs, say })` — only acts if he is in that scene */
export interface PupCue { look?: HTMLElement; secs?: number; say?: string }
export function cuePup(detail: PupCue) {
  dispatchEvent(new CustomEvent<PupCue>('pup:cue', { detail }))
}
