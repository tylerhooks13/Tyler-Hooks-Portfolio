/*
 * Data and floor-plan geometry for the Guided Task Management page: the
 * page hero (GuidedTaskHero.tsx) and Fig. 01 (GuidedTaskFigures.tsx) draw
 * the same illustrative store. Four tasks in four aisles; the old app sent a
 * team member on a separate walk for each, the redesign picks them all up in
 * one sweep. Values follow the handoff reference (guided-task-figures.html).
 */

export type IconKind = 'bag' | 'bottle' | 'box' | 'pack'

export type Stop = {
  aisle: number
  /** Where along the aisle the task sits, in map units. */
  y: number
  /** The old app's walk this task belonged to. */
  walk: string
  tag: 'Count' | 'Restock' | 'Check' | 'Adjust'
  type: 'replen' | 'check' | 'count'
  label: string
  name: string
  meta: string
  upc: string
  icon: IconKind
  /** Aisle, side, segment, shelf. */
  loc: [string, string, string, string]
  cap: number
  sales: number
  oh: number
  upd: string
  /** Count and adjust tasks: the stepper's label and save button. */
  unit?: string
  save?: string
}

// In store order.
export const STOPS: Stop[] = [
  {
    aisle: 5, y: 330, walk: 'Shelf inventory', tag: 'Count', type: 'count', label: 'Count task',
    name: 'Whole wheat tortillas, 8 ct', meta: '$2.24/unit · 8 ct · Pack 12', upc: '5562', icon: 'pack',
    loc: ['5', 'F', '19', '1'], cap: 18, sales: 22, oh: 14, upd: '22 sold since the last count',
    unit: 'On shelf now', save: 'Save count',
  },
  {
    aisle: 11, y: 250, walk: 'Shelf replenishment', tag: 'Restock', type: 'replen', label: 'Replenishment task',
    name: 'Thin potato chips, sea salt & vinegar, 9 oz', meta: '$2.98/unit · 9 oz · Pack 24', upc: '7020', icon: 'bag',
    loc: ['11', 'B', '12', '2'], cap: 20, sales: 17, oh: 20, upd: 'Count updated by Ana R. today at 10:52 AM',
  },
  {
    aisle: 13, y: 430, walk: 'Store walk', tag: 'Check', type: 'check', label: 'Store walk task',
    name: 'Lime sparkling water, 12 pk', meta: '$4.98/unit · 12 oz cans · Pack 2', upc: '8523', icon: 'box',
    loc: ['13', 'B', '16', '1'], cap: 8, sales: 5, oh: 3, upd: 'New shelf tag set this week',
  },
  {
    aisle: 14, y: 290, walk: 'Inventory adjustment', tag: 'Adjust', type: 'count', label: 'Adjustment task',
    name: 'Electrolyte water, 1 L', meta: '$1.48/unit · 1 L · Pack 12', upc: '1314', icon: 'bottle',
    loc: ['14', 'D', '1', '1'], cap: 24, sales: 9, oh: 11, upd: 'System shows 11; shelf looks low',
    unit: 'Correct on-hand', save: 'Save adjustment',
  },
]

// The old app's walks, in the order a shift ran them (store walk,
// replenishment, inventory, adjustment), and the aisles each one swept.
export const OLD_ORDER = [2, 1, 0, 3]
export const OLD_AISLES = [
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
  [2, 3, 5, 7, 9, 11],
  [3, 4, 5, 6, 8, 10, 12],
  [4, 7, 9, 14],
]

/* ---------- floor plan (SVG viewBox 0 0 600 720) ---------- */

export const MAP_W = 600
export const MAP_H = 720
// Aisle ends and the backroom door.
export const TOP = 128
export const BOT = 598
export const DOOR = 300
// Map units to feet.
const FT = 0.5

/** An aisle's center line. */
export const ax = (a: number) => 123 + (a - 1) * 28

export type Pt = [number, number]

export function pathLength(p: Pt[]) {
  let t = 0
  for (let k = 1; k < p.length; k++) t += Math.hypot(p[k][0] - p[k - 1][0], p[k][1] - p[k - 1][1])
  return t
}

/** The point `len` along a polyline. Movement and trails both use this, so they agree. */
export function pointAt(p: Pt[], len: number): Pt {
  for (let k = 1; k < p.length; k++) {
    const d = Math.hypot(p[k][0] - p[k - 1][0], p[k][1] - p[k - 1][1])
    if (len <= d) {
      const f = d ? len / d : 0
      return [p[k - 1][0] + (p[k][0] - p[k - 1][0]) * f, p[k - 1][1] + (p[k][1] - p[k - 1][1]) * f]
    }
    len -= d
  }
  return p[p.length - 1]
}

export const toPath = (p: Pt[]) => 'M' + p.map((q) => `${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join(' L')

// A walk sweeps its aisles serpentine, from the backroom door and back.
// `stopAt` maps an aisle to the task on it; `marks` records how far along
// the path each one is reached. `off` nudges overlapping routes apart.
function serp(aisles: number[], off: number, stopAt: Record<number, number>) {
  const p: Pt[] = [
    [DOOR + off, 66],
    [DOOR + off, TOP + off],
  ]
  const marks: Record<number, number> = {}
  let top = true
  aisles.forEach((a) => {
    const x = ax(a) + off
    p.push([x, top ? TOP + off : BOT + off])
    if (stopAt[a] != null) {
      p.push([x, stopAt[a]])
      marks[a] = pathLength(p)
    }
    p.push([x, top ? BOT + off : TOP + off])
    top = !top
  })
  if (!top) p.push([513 + off, BOT + off], [513 + off, TOP + off])
  p.push([DOOR + off, TOP + off], [DOOR + off, 66])
  return { pts: p, marks }
}

/** The old way: four trips, each with the stop it serves. */
export const OLD_TRIPS = OLD_ORDER.map((si, k) => {
  const s = STOPS[si]
  const off = (k - 1.5) * 4
  const r = serp(OLD_AISLES[k], off, { [s.aisle]: s.y + off })
  return { stop: si, pts: r.pts, len: pathLength(r.pts), mark: r.marks[s.aisle] }
})

/** The guided walk: one sweep that picks up every task in store order. */
export const ROUTE = (() => {
  const all: Record<number, number> = {}
  STOPS.forEach((s) => (all[s.aisle] = s.y))
  const r = serp([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14], 0, all)
  return { pts: r.pts, len: pathLength(r.pts), stopAt: STOPS.map((s) => r.marks[s.aisle]) }
})()

export const OLD_TOTAL = OLD_TRIPS.reduce((t, tr) => t + tr.len, 0)
export const SAVED_PCT = Math.round((1 - ROUTE.len / OLD_TOTAL) * 100)

// Fixed locale so the server and browser render the same string.
export const feet = (u: number) => `${Math.round(u * FT).toLocaleString('en-US')} ft`

/* ---------- Fig. 02: field-testing results ---------- */

export const OUTCOMES = [
  { key: 's1', label: 'Completed', note: 'Completed', v: 76 },
  { key: 's2', label: 'Mostly understood', note: 'Mostly understood', v: 8 },
  { key: 's3', label: 'Unclear', note: 'Unclear, where to iterate next', v: 12 },
  { key: 's4', label: 'Not completed', note: 'Not completed', v: 4 },
] as const
