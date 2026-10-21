'use client'

import { useEffect, useRef, useState } from 'react'
import { haptic } from './haptics'
import {
  AFTER,
  AGENT_QUESTIONS,
  AGENT_SOURCES,
  BEFORE,
  FLOW_DESC,
  LANES,
  MORPH,
  PLUGIN_HOURS,
  PLUGIN_SCALES,
  type Flow,
  type FlowNode,
  type Lane,
  type NodeId,
} from './enablement-data'

/*
 * Figures for the AI Enablement case study, placed between its chapters
 * (CaseStudyBody.tsx). Fig. 1, the Instruction Builder, is its own file
 * (InstructionBuilder.tsx). Fig. 2: what the design research agent can draw
 * on, now and next. Fig. 3: the plugin estimate against the two sessions it
 * took. Fig. 4: who prototypes, before and after, as one played story.
 * All run on example data (enablement-data.ts) and share the .wpf figure shell.
 */

const reducedMotion = () => {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  } catch {
    return false
  }
}

function Toggle<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T
  options: { key: T; label: string }[]
  onChange: (v: T) => void
}) {
  return (
    <div className="wpf-toggle" role="group" aria-label={label}>
      {options.map((o) => (
        <button
          key={o.key}
          type="button"
          aria-pressed={o.key === value}
          onClick={() => (haptic('tap'), onChange(o.key))}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

/* ---------- Fig. 1: design research agent ---------- */

// Wide layout, and a compact one for phones that pulls the hub in so the
// labels stay readable once the diagram scales down to the screen.
const AGENT_LAYOUT = {
  wide: { w: 520, hub: { x: 370, y: 115, w: 140, h: 70 } },
  compact: { w: 384, hub: { x: 262, y: 115, w: 118, h: 70 } },
}

export function ResearchAgent() {
  const [ver, setVer] = useState<'v1' | 'next'>('v1')
  const [qi, setQi] = useState(0)
  const [compact, setCompact] = useState(false)
  const viz = useRef<SVGSVGElement>(null)
  const { w: VW, hub: HUB } = AGENT_LAYOUT[compact ? 'compact' : 'wide']

  useEffect(() => {
    const el = viz.current
    if (!el) return
    // The SVG fills its grid cell whatever its viewBox, so measuring it can't feed back.
    const ro = new ResizeObserver(() => el.clientWidth && setCompact(el.clientWidth < 440))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  const q = AGENT_QUESTIONS[qi]
  const active = new Set(ver === 'v1' ? q.uses : [...q.uses, ...q.next])
  const available = (v1: boolean) => ver === 'next' || v1
  const used = AGENT_SOURCES.filter((s) => available(s.v1) && active.has(s.id))
  const ready = AGENT_SOURCES.filter((s) => available(s.v1)).map((s) => s.label)

  return (
    <figure className="enf-fig" aria-labelledby="enf-ag-title">
      <div className="wpf enf">
        <div className="wpf-head">
          <span className="wpf-label">Fig. 2 · Design research agent</span>
          <Toggle
            label="Agent version"
            value={ver}
            onChange={setVer}
            options={[
              { key: 'v1', label: 'V1 · Rovo' },
              { key: 'next', label: 'Next · custom agent' },
            ]}
          />
        </div>
        <h3 className="display wpf-title" id="enf-ag-title">
          One place to ask what we already know
        </h3>

        <div className="enf-agent">
          <div className="enf-agent-qs">
            <span className="wpf-label">Try a question</span>
            <div className="wpf-presets enf-qs">
              {AGENT_QUESTIONS.map((x, i) => (
                <button key={x.q} type="button" aria-pressed={i === qi} onClick={() => (haptic('tap'), setQi(i))}>
                  {x.q}
                </button>
              ))}
            </div>
          </div>

          <svg
            ref={viz}
            className="enf-agent-viz"
            viewBox={`0 0 ${VW} 300`}
            role="img"
            aria-label={`Sources connected to the research agent (${ver === 'v1' ? 'V1, Rovo' : 'next version, custom agent with MCPs'}): ${ready.join(', ')}. This question uses ${used.length ? used.map((s) => s.label).join(', ') : 'none of them'}.`}
          >
            {AGENT_SOURCES.map((s) => {
              const avail = available(s.v1)
              const on = avail && active.has(s.id)
              const state = on ? ' is-on' : !avail ? ' is-off' : ''
              return (
                <g key={s.id}>
                  <path
                    className={'enf-link' + state}
                    d={`M200,${s.y + 22} C${(200 + HUB.x) / 2},${s.y + 22} ${(200 + HUB.x) / 2},${HUB.y + HUB.h / 2} ${HUB.x},${HUB.y + HUB.h / 2}`}
                  />
                  <g className={'enf-src' + state}>
                    <rect x={10} y={s.y} width={190} height={44} rx={2} />
                    <text x={22} y={s.y + 19}>
                      {s.label}
                    </text>
                    <text x={22} y={s.y + 34} className="enf-sub">
                      {avail ? s.sub : s.sub + ' · not yet'}
                    </text>
                  </g>
                </g>
              )
            })}
            <g className="enf-hub">
              <rect x={HUB.x} y={HUB.y} width={HUB.w} height={HUB.h} rx={2} />
              <text x={HUB.x + HUB.w / 2} y={HUB.y + 32} textAnchor="middle">
                Research agent
              </text>
              <text x={HUB.x + HUB.w / 2} y={HUB.y + 50} textAnchor="middle" className="enf-sub">
                {ver === 'v1' ? 'V1 · Rovo' : 'custom · MCPs'}
              </text>
            </g>
          </svg>
        </div>

        <p className="enf-answer" aria-live="polite">
          {used.length ? (
            <>
              <b>Draws on</b> {used.map((s) => s.label).join(', ')}. Answers stay grounded in internal research only.
            </>
          ) : (
            <>
              <b>V1 can’t answer this yet.</b> Session transcripts aren’t connected. Switch to the next version to see
              why it matters.
            </>
          )}
        </p>
      </div>
      <figcaption className="enf-caption">
        V1 is grounded only in our research repositories and pulls related Figma artifacts. The next version would
        connect testing transcripts and other tools through their MCPs. Questions are examples.
      </figcaption>
    </figure>
  )
}

/* ---------- Fig. 2: plugin timeline ---------- */

export function PluginTimeline() {
  const [scale, setScale] = useState<keyof typeof PLUGIN_SCALES>('weeks')
  const { max, ticks } = PLUGIN_SCALES[scale]
  const pct = (v: number) => `${Math.min(100, (v / max) * 100)}%`
  const H = PLUGIN_HOURS

  return (
    <figure className="enf-fig" aria-labelledby="enf-tl-title">
      <div className="wpf enf">
        <div className="wpf-head">
          <span className="wpf-label">Fig. 3 · Accessibility plugin</span>
          <Toggle
            label="Scale"
            value={scale}
            onChange={setScale}
            options={[
              { key: 'weeks', label: 'Weeks' },
              { key: 'hours', label: 'Zoom to hours' },
            ]}
          />
        </div>
        <h3 className="display wpf-title" id="enf-tl-title">
          Weeks of work in two sessions
        </h3>

        <p className="sr-only">
          Their estimate: 2 to 12 weeks, 80 to 480 working hours. With Copilot: 2 sessions of 1 hour each, 2 hours.
        </p>
        <div className="enf-tl" aria-hidden="true">
          <div className="enf-tl-row">
            <div className="enf-tl-lbl">
              <b>Their estimate</b>
              <span>weeks to most of a quarter</span>
            </div>
            <div className="enf-tl-track">
              <div className="enf-tl-bar is-base" style={{ width: pct(H.estMin) }} />
              <div className="enf-tl-bar is-range" style={{ width: pct(H.estMax) }} />
            </div>
          </div>
          <div className="enf-tl-row">
            <div className="enf-tl-lbl">
              <b>With Copilot</b>
              <span>2 sessions · 1 hr each</span>
            </div>
            <div className="enf-tl-track">
              <div className="enf-tl-bar is-solid" style={{ width: pct(H.act) }} />
            </div>
          </div>
          <div className="enf-tl-row">
            <div />
            <div className="enf-tl-ticks">
              {ticks.map(([v, t]) => (
                <span key={t} style={{ left: pct(v) }}>
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      <figcaption className="enf-caption">
        A partner on the accessibility team had never built a Figma plugin. Estimate shown as a range from 2 weeks to
        about 12 weeks (most of a quarter), counted in working hours.
      </figcaption>
    </figure>
  )
}

/* ---------- Fig. 3: who prototypes ---------- */

// Lane names sit above each lane rather than in a left column, so the seven
// columns get the full width and neighbouring nodes keep a clear gap (32).
const NW = 140
const NH = 50
const X0 = 4
const COL = 172
const SVG_NS = 'http://www.w3.org/2000/svg'

const laneIdx = (l: Lane) => LANES.findIndex((x) => x.id === l)
const laneY = (l: Lane) => LANES[laneIdx(l)].y
const box = (d: FlowNode) => {
  const x = X0 + d.col * COL
  const y = laneY(d.lane) - NH / 2
  return { x, y, cx: x + NW / 2, cy: y + NH / 2, r: x + NW, b: y + NH }
}

// Every edge is one cubic Bézier: start, two controls, end.
type Curve = [number, number, number, number, number, number, number, number]
function curve(A: FlowNode, B: FlowNode): Curve {
  const a = box(A)
  const b = box(B)
  const diff = Math.abs(laneIdx(A.lane) - laneIdx(B.lane))
  if (B.col > A.col) {
    if (diff > 1) {
      const sx = a.cx,
        sy = a.b,
        ex = b.x,
        ey = b.cy
      return [sx, sy, sx, ey, sx + (ex - sx) * 0.4, ey, ex, ey]
    }
    const sx = a.r,
      sy = a.cy,
      ex = b.x,
      ey = b.cy,
      m = (ex - sx) / 2
    return [sx, sy, sx + m, sy, ex - m, ey, ex, ey]
  }
  // Going back: a loop over the top within a lane, or a crossing between lanes.
  if (A.lane === B.lane) {
    const sx = a.cx - 14,
      ex = b.cx + 14,
      y = a.y
    return [sx, y, sx, y - 46, ex, y - 46, ex, y]
  }
  const sx = a.cx - 18,
    sy = a.y,
    ex = b.cx + 18,
    ey = b.b,
    my = (sy + ey) / 2
  return [sx, sy, sx, my, ex, my, ex, ey]
}
const pathD = (c: Curve) => `M${c[0]},${c[1]} C${c[2]},${c[3]} ${c[4]},${c[5]} ${c[6]},${c[7]}`
const pointAt = (c: Curve, t: number) => {
  const u = 1 - t
  const k = [u * u * u, 3 * u * u * t, 3 * u * t * t, t * t * t]
  return {
    x: k[0] * c[0] + k[1] * c[2] + k[2] * c[4] + k[3] * c[6],
    y: k[0] * c[1] + k[1] * c[3] + k[2] * c[5] + k[3] * c[7],
  }
}
// Rough arc length (between the chord and the control polygon), for pacing the dot.
const lengthOf = (c: Curve) => {
  const d = (i: number, j: number) => Math.hypot(c[j] - c[i], c[j + 1] - c[i + 1])
  return (d(0, 6) + d(0, 2) + d(2, 4) + d(4, 6)) / 2
}

type Mode = 'before' | 'after'
type Caption = { k: string; t: string; h: string }
type Stats = { who: string; hand: string; role: string }

const END: Record<Mode, { cap: Caption; stats: Stats }> = {
  before: {
    cap: { k: 'Before', t: 'Press Play to watch the old process run, then restructure into the new one.', h: '' },
    stats: { who: 'Design tech', hand: '5', role: 'Builder' },
  },
  after: {
    cap: { k: 'After', t: 'The new process. Press Play to watch how it changed from the old one.', h: '' },
    stats: { who: 'Designer', hand: '1 (+1 when needed)', role: 'Guide' },
  },
}

export function Workflow() {
  const fig = useRef<HTMLElement>(null)
  const svg = useRef<SVGSVGElement>(null)
  const edgeLayer = useRef<SVGGElement>(null)
  const nodeLayer = useRef<SVGGElement>(null)
  const api = useRef<{ play: () => void; stopTo: (m: Mode) => void }>()
  const [mode, setMode] = useState<Mode>('before')
  const [playing, setPlaying] = useState(false)
  const [cap, setCap] = useState<Caption>(END.before.cap)
  const [stats, setStats] = useState<Stats>(END.before.stats)

  useEffect(() => {
    if (!svg.current || !edgeLayer.current || !nodeLayer.current) return
    // Look the SVG layers up on every draw rather than holding them: if React
    // swaps the SVG out underneath (a hot reload, a remount), the next draw
    // lands in the one on screen instead of a detached copy.
    const R = () => svg.current as SVGSVGElement
    const E = () => edgeLayer.current as SVGGElement
    const reduce = reducedMotion()
    const timers = new Set<number>()
    const wait = (fn: () => void, ms: number) => {
      const id = window.setTimeout(() => (timers.delete(id), fn()), ms)
      timers.add(id)
    }
    const make = <K extends keyof SVGElementTagNameMap>(
      tag: K,
      attrs: Record<string, string | number>,
      parent: Element,
    ) => {
      const e = document.createElementNS(SVG_NS, tag)
      for (const k in attrs) e.setAttribute(k, String(attrs[k]))
      parent.appendChild(e)
      return e
    }

    // The same seven nodes in both states: the restructure moves, relabels or hides them.
    // Built on first use, and rebuilt if they're no longer in the SVG on screen.
    let N = {} as Record<NodeId, { g: SVGGElement; t1: SVGTextElement; t2: SVGTextElement; key: string }>
    const ensureNodes = () => {
      const layer = nodeLayer.current
      if (!layer || N.a?.g.parentNode === layer) return
      layer.replaceChildren()
      N = {} as typeof N
      ;(Object.keys(BEFORE.nodes) as NodeId[]).forEach((id) => {
        const g = make('g', { class: 'enf-node' }, layer)
        make('rect', { x: 0, y: 0, width: NW, height: NH, rx: 2 }, g)
        const t1 = make('text', { x: NW / 2, 'text-anchor': 'middle' }, g)
        const t2 = make('text', { x: NW / 2, y: NH / 2 + 14, 'text-anchor': 'middle', class: 'enf-sub' }, g)
        N[id] = { g, t1, t2, key: '' }
      })
    }
    const setTexts = (id: NodeId, d: FlowNode) => {
      const n = N[id]
      n.t1.textContent = d.label
      n.t1.setAttribute('y', String(d.sub ? NH / 2 - 2 : NH / 2 + 5.5))
      n.t2.textContent = d.sub || ''
      n.key = d.label + '|' + (d.sub || '')
    }
    const setNode = (id: NodeId, d: FlowNode, animate: boolean) => {
      ensureNodes()
      const n = N[id]
      const b = box(d)
      n.g.style.transform = `translate(${b.x}px, ${b.y}px)`
      n.g.classList.toggle('is-optional', !!d.optional)
      n.g.style.opacity = d.hidden ? '0' : '1'
      if (n.key === d.label + '|' + (d.sub || '')) return
      if (animate && !reduce) {
        n.g.classList.add('is-relabel')
        wait(() => (setTexts(id, d), n.g.classList.remove('is-relabel')), 220)
      } else setTexts(id, d)
    }
    const activate = (id: NodeId | null, follow?: FlowNode) => {
      ensureNodes()
      const root = R()
      const scroller = root.parentElement
      ;(Object.keys(N) as NodeId[]).forEach((k) => N[k].g.classList.toggle('is-active', k === id))
      // When the diagram is wider than the screen, keep the step in view.
      if (!follow || !scroller || scroller.scrollWidth <= scroller.clientWidth) return
      const x = (box(follow).cx / 1180) * root.clientWidth
      scroller.scrollTo({ left: x - scroller.clientWidth / 2, behavior: reduce ? 'auto' : 'smooth' })
    }

    const drawEdges = (S: Flow) => {
      const edges = E()
      edges.replaceChildren()
      return S.edges.map(([s, t, o = {}]) => {
        const A = S.nodes[s]
        const B = S.nodes[t]
        const handoff = A.lane !== B.lane && !o.optional
        const c = curve(A, B)
        make(
          'path',
          { d: pathD(c), class: 'enf-edge' + (o.optional ? ' is-optional' : '') + (handoff ? ' is-handoff' : '') },
          edges,
        )
        // Arrowhead along the end tangent (end minus the last control point).
        const ang = (Math.atan2(c[7] - c[5], c[6] - c[4]) * 180) / Math.PI
        make(
          'path',
          {
            d: 'M0,0 L-8,-4 L-8,4 Z',
            class: handoff ? 'enf-arrow is-handoff' : 'enf-arrow',
            transform: `translate(${c[6]},${c[7]}) rotate(${ang})`,
          },
          edges,
        )
        if (o.label) {
          // A loop within a lane is labeled over its arc. A loop back across lanes
          // crosses the forward arrow halfway, so its label sits where it starts,
          // just above the node it leaves, clear of both lines.
          const across = A.lane !== B.lane
          const m = across ? { x: c[0] + 10, y: c[1] - 9 } : pointAt(c, 0.5)
          const tx = make(
            'text',
            { x: m.x, y: across ? m.y : m.y - 6, 'text-anchor': across ? 'start' : 'middle', class: 'enf-edge-label' },
            edges,
          )
          tx.textContent = o.label
        }
        return c
      })
    }

    let run = 0
    let running = false
    let dot: SVGCircleElement | null = null
    const dropDot = () => {
      dot?.remove()
      dot = null
    }

    const showStatic = (m: Mode) => {
      const S = m === 'before' ? BEFORE : AFTER
      const root = R()
      root.classList.add('is-instant')
      ;(Object.keys(S.nodes) as NodeId[]).forEach((id) => setNode(id, S.nodes[id], false))
      root.getBoundingClientRect()
      root.classList.remove('is-instant')
      drawEdges(S)
      E().style.opacity = '1'
      activate(null)
      setMode(m)
      setCap(END[m].cap)
      setStats(END[m].stats)
    }

    const sleep = (ms: number, id: number) =>
      new Promise<void>((res, rej) => wait(() => (id === run ? res() : rej('stop')), ms))
    const travel = (c: Curve, id: number) => {
      if (reduce || !dot) return sleep(250, id)
      const d = dot
      return new Promise<void>((res, rej) => {
        const dur = Math.min(650, Math.max(260, lengthOf(c) * 1.6))
        let t0: number | null = null
        const step = (ts: number) => {
          if (id !== run) return rej('stop')
          if (t0 === null) t0 = ts
          const u = Math.min(1, (ts - t0) / dur)
          const e = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2
          const p = pointAt(c, e)
          d.setAttribute('cx', String(p.x))
          d.setAttribute('cy', String(p.y))
          d.style.opacity = '1'
          if (u < 1) requestAnimationFrame(step)
          else res()
        }
        requestAnimationFrame(step)
      })
    }
    const runSeq = async (S: Flow, curves: Curve[], phase: string, id: number) => {
      let h = 0
      for (let i = 0; i < S.seq.length; i++) {
        const s = S.seq[i]
        if (s.e !== undefined) {
          let note = ''
          if (s.hand) {
            h++
            const n = String(h)
            setStats((x) => ({ ...x, hand: n }))
            note = `Handoff ${h}: ${s.hand}.`
          }
          setCap((x) => ({ ...x, h: note }))
          await travel(curves[s.e], id)
        }
        activate(s.to, S.nodes[s.to])
        setCap((x) => ({ ...x, k: `${phase} · ${i + 1}/${S.seq.length}`, t: s.say }))
        await sleep(s.hand ? 1150 : 750, id)
      }
    }

    const story = async () => {
      const id = ++run
      running = true
      setPlaying(true)
      showStatic('before')
      dropDot()
      if (!reduce) {
        dot = make('circle', { r: 6, class: 'enf-dot' }, R())
        dot.style.opacity = '0'
      }
      try {
        setStats({ who: 'Design tech', hand: '0', role: 'Builder' })
        let curves = drawEdges(BEFORE)
        await runSeq(BEFORE, curves, 'Before', id)
        await sleep(700, id)
        if (dot) dot.style.opacity = '0'
        activate(null)
        E().style.opacity = '0'
        setCap((x) => ({ ...x, h: '' }))
        for (let i = 0; i < MORPH.length; i++) {
          const m = MORPH[i]
          setCap({ k: `What changed · ${i + 1}/${MORPH.length}`, t: m.say, h: '' })
          m.ids.forEach((k) => {
            activate(k, AFTER.nodes[k])
            setNode(k, AFTER.nodes[k], true)
          })
          if (m.who || m.role) setStats((x) => ({ ...x, who: m.who ?? x.who, role: m.role ?? x.role }))
          await sleep(1700, id)
        }
        activate(null)
        setMode('after')
        curves = drawEdges(AFTER)
        E().style.opacity = '1'
        setStats((x) => ({ ...x, hand: '0' }))
        await sleep(500, id)
        await runSeq(AFTER, curves, 'After', id)
        await sleep(600, id)
        activate(null)
        if (dot) dot.style.opacity = '0'
        setStats((x) => ({ ...x, hand: END.after.stats.hand }))
        setCap({
          k: 'Result',
          t: 'Five handoffs became one. Design tech went from building every prototype to guiding the people who build them.',
          h: '',
        })
      } catch {
        /* stopped */
      } finally {
        if (id === run) {
          running = false
          setPlaying(false)
          dropDot()
        }
      }
    }
    const stopTo = (m: Mode) => {
      run++
      running = false
      dropDot()
      setPlaying(false)
      showStatic(m)
    }
    api.current = { play: story, stopTo }
    showStatic('before')

    // Leaving the figure (scrolling away, or switching pages) stops the story.
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting && running) stopTo('before')
    })
    if (fig.current) io.observe(fig.current)

    return () => {
      run++
      io.disconnect()
      timers.forEach(clearTimeout)
      dropDot()
      // Leave the SVG empty for whichever effect runs next.
      nodeLayer.current?.replaceChildren()
      edgeLayer.current?.replaceChildren()
    }
  }, [])

  const choose = (m: Mode) => api.current?.stopTo(m)
  const playBtn = () => {
    haptic('tap')
    if (playing) api.current?.stopTo('before')
    else api.current?.play()
  }

  return (
    <figure ref={fig} className="enf-fig" aria-labelledby="enf-wf-title">
      <div className="wpf enf">
        <div className="wpf-head">
          <span className="wpf-label">Fig. 4 · Who prototypes</span>
          <div className="enf-controls">
            <Toggle
              label="Workflow"
              value={mode}
              onChange={choose}
              options={[
                { key: 'before', label: 'Before' },
                { key: 'after', label: 'After' },
              ]}
            />
            <button type="button" className="enf-btn enf-play" onClick={playBtn}>
              {playing ? '■ Stop' : '▶ Play the change'}
            </button>
          </div>
        </div>
        <h3 className="display wpf-title" id="enf-wf-title">
          From a request queue to self-serve prototyping
        </h3>

        <div className="enf-flow">
          <div className="enf-flow-scroll" tabIndex={0} role="region" aria-label="Workflow diagram, scrolls sideways">
            <svg ref={svg} viewBox="0 0 1180 352" role="img" aria-labelledby="enf-wf-desc">
              <desc id="enf-wf-desc">{FLOW_DESC[mode]}</desc>
              {LANES.map((l) => (
                <g key={l.id}>
                  <line className="enf-lane-line" x1={0} x2={1180} y1={l.y + 50} y2={l.y + 50} />
                  <text className="enf-lane-label" x={X0} y={l.y - 36}>
                    {l.name}
                  </text>
                </g>
              ))}
              <g ref={edgeLayer} className="enf-edges" />
              <g ref={nodeLayer} />
            </svg>
          </div>

          <div className="enf-step" aria-live="polite">
            <p className="enf-step-main">
              <b>{cap.k}</b>
              <span>{cap.t}</span>
            </p>
            <p className="enf-step-hand">{cap.h}</p>
          </div>

          <dl className="enf-stats">
            <div>
              <dt>Builds the prototype</dt>
              <dd>{stats.who}</dd>
            </div>
            <div>
              <dt>Handoffs between teams</dt>
              <dd>{stats.hand}</dd>
            </div>
            <div>
              <dt>Design tech’s role</dt>
              <dd>{stats.role}</dd>
            </div>
          </dl>
        </div>
      </div>
      <figcaption className="enf-caption">
        Play runs the old process, restructures it into the new one, then runs that. Bold lines mark a handoff between
        teams.
      </figcaption>
    </figure>
  )
}
