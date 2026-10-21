'use client'

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { haptic } from './haptics'
import {
  DOOR,
  OLD_AISLES,
  OLD_ORDER,
  OLD_TOTAL,
  OLD_TRIPS,
  OUTCOMES,
  ROUTE,
  SAVED_PCT,
  STOPS,
  feet,
  pointAt,
  toPath,
  type Pt,
} from './guided-task-data'
import { Handheld, MapPin, ProductIcon, ScanPrompt, StopScreen, StorePlan } from './GuidedTaskScreens'

/*
 * Figures for the Guided Task Management page, in place of static images.
 * Fig. 01: a store floor plan linked to a store handheld. Watch the old app
 * send a team member on four separate walks, then play the same shift as one
 * guided walk (scan, then act, at each stop) and compare on the scorecard.
 * Fig. 02: how team members did in field testing.
 * Behavior, copy and data follow the handoff reference (guided-task-figures.html).
 */

export default function GuidedTaskFigures() {
  return (
    <div className="gtf">
      <WalkGame />
      <Results />
    </div>
  )
}

/* ---------- Fig. 01: four trips, or one ---------- */

type Mode = 'intro' | 'old' | 'new'
type Phase = 'walking' | 'wait' | 'act' | 'returning'
type Screen = 'walks' | 'stop' | 'list'
type PinState = '' | 'active' | 'done'

const DEVICE_W = 470 // the handheld plus breathing room, for fitting to the stage
const DEVICE_H = 870
const LAST = STOPS.length - 1

const INTRO = {
  h: 'Four tasks, four aisles',
  p: 'Press “Watch the old way” to see the shift on the old app.',
}

const ACT_COPY = {
  replen: ['Tap Replenish', 'Restock the shelf, or choose No action if it’s already full.'],
  check: ['Tap Looks good', 'Confirm the shelf, or flag an issue if something is off.'],
  count: ['Save the count', 'Use − and + to match what’s on the shelf, then save.'],
} as const

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

function WalkGame() {
  const [mode, setMode] = useState<Mode>('intro')
  const [oldDone, setOldDone] = useState(false)
  const [newDone, setNewDone] = useState(false)
  const [screen, setScreen] = useState<Screen>('walks')
  const [pins, setPins] = useState<PinState[]>(() => STOPS.map(() => ''))
  const [faded, setFaded] = useState(false)
  // Scorecard (distance is written straight to the DOM every frame, below).
  const [oldScore, setOldScore] = useState<{ trips: number; tasks: number } | null>(null)
  const [newScore, setNewScore] = useState<{ tasks: number } | null>(null)
  // The old app's walks list.
  const [walkCur, setWalkCur] = useState(-1)
  const [walksDone, setWalksDone] = useState<number[]>([])
  // The guided walk.
  const [i, setI] = useState(0)
  const [phase, setPhase] = useState<Phase>('walking')
  const [res, setRes] = useState<string[]>([])
  const [count, setCount] = useState(0)
  const [listDone, setListDone] = useState(false)
  const [toast, setToast] = useState<{ text: string; on: boolean }>({ text: '', on: false })
  const [led, setLed] = useState(false)
  const [live, setLive] = useState(INTRO)

  // Bumped on every reset or replay; an animation from an older run stops at its next frame.
  const run = useRef(0)
  const pos = useRef(0)
  const focusAfterScan = useRef(false)
  const timers = useRef<number[]>([])
  const avatar = useRef<SVGGElement>(null)
  const oldPaths = useRef<(SVGPathElement | null)[]>([])
  const newPath = useRef<SVGPathElement>(null)
  const oDist = useRef<HTMLElement>(null)
  const nDist = useRef<HTMLElement>(null)
  const plate = useRef<HTMLDivElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const scaler = useRef<HTMLDivElement>(null)
  const device = useRef<HTMLDivElement>(null)
  const act = useRef<HTMLDivElement>(null)
  const coach = useRef<HTMLDivElement>(null)
  const coachH = useRef<HTMLSpanElement>(null)
  const coachP = useRef<HTMLSpanElement>(null)
  const coachIcon = useRef<SVGSVGElement>(null)

  // Stacked (phones), the map and the handheld sit below the controls:
  // bring the one that matters into view, unless it already is.
  const reveal = (el: HTMLElement | null) => {
    if (!el || !plate.current || !stage.current) return
    if (stage.current.offsetTop <= plate.current.offsetTop) return // side by side
    const r = el.getBoundingClientRect()
    const top = 90 // clears the fixed site header
    if (r.top >= top && r.bottom <= window.innerHeight) return
    window.scrollBy({ top: r.top - top, behavior: reducedMotion() ? 'auto' : 'smooth' })
  }

  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms))

  /* -- map: the marker and the trails are drawn imperatively, every frame -- */

  const place = (pt: Pt) => avatar.current?.setAttribute('transform', `translate(${pt[0].toFixed(1)} ${pt[1].toFixed(1)})`)
  const drawOld = (k: number, l: number) =>
    oldPaths.current[k]?.setAttribute('stroke-dasharray', `${l.toFixed(1)} ${(OLD_TRIPS[k].len + 10).toFixed(1)}`)
  const drawNew = (l: number) => newPath.current?.setAttribute('stroke-dasharray', `${l.toFixed(1)} ${(ROUTE.len + 10).toFixed(1)}`)
  const setText = (el: HTMLElement | null, t: string) => el && (el.textContent = t)
  const setPin = (k: number, s: PinState) => setPins((p) => p.map((x, j) => (j === k ? s : x)))

  // Eases the marker along `pts` from one length to another. Resolves false
  // if a reset or replay cut it short. Reduced motion jumps to the end.
  const walk = (pts: Pt[], from: number, to: number, speed: number, onFrame: (l: number) => void) =>
    new Promise<boolean>((resolve) => {
      const id = run.current
      const dur = (Math.abs(to - from) / speed) * 1000
      if (reducedMotion() || dur <= 0) {
        onFrame(to)
        resolve(true)
        return
      }
      let t0: number | null = null
      const frame = (ts: number) => {
        if (id !== run.current) return resolve(false)
        if (t0 === null) t0 = ts
        const k = Math.min(1, (ts - t0) / dur)
        const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2
        onFrame(from + (to - from) * e)
        if (k < 1) requestAnimationFrame(frame)
        else resolve(true)
      }
      requestAnimationFrame(frame)
    })
  const pause = (ms: number) =>
    new Promise<boolean>((resolve) => {
      const id = run.current
      if (reducedMotion()) return resolve(true)
      later(() => resolve(id === run.current), ms)
    })

  // Stops whatever is running and puts the marker back at the backroom door.
  const halt = () => {
    run.current++
    timers.current.forEach(clearTimeout)
    timers.current = []
    place([DOOR, 66])
    setPins(STOPS.map(() => ''))
    setFaded(false)
  }
  const clearOld = () => OLD_TRIPS.forEach((_, k) => drawOld(k, 0))
  const clearNew = () => {
    drawNew(0)
    setNewScore(null)
    setText(nDist.current, '–')
  }

  /* -- the old way: autoplay -- */

  const playOld = async () => {
    halt()
    clearOld()
    // Interrupting a guided walk drops it; a finished one stays on the map to compare.
    if (mode === 'new') clearNew()
    const id = run.current
    setMode('old')
    setScreen('walks')
    setOldScore({ trips: 0, tasks: 0 })
    setText(oDist.current, feet(0))
    let dist = 0
    const done: number[] = []
    for (let k = 0; k < OLD_TRIPS.length; k++) {
      const tr = OLD_TRIPS[k]
      const s = STOPS[tr.stop]
      setWalkCur(k)
      setWalksDone([...done])
      setPin(tr.stop, 'active')
      setOldScore({ trips: k + 1, tasks: done.length })
      setLive({
        h: `Trip ${k + 1} of 4 · ${s.walk}`,
        p: `A full sweep of ${OLD_AISLES[k].length} aisles from the backroom and back, to ${s.tag.toLowerCase()} in aisle ${s.aisle}.`,
      })
      let marked = false
      const ok = await walk(tr.pts, 0, tr.len, 2200, (l) => {
        place(pointAt(tr.pts, l))
        drawOld(k, l)
        setText(oDist.current, feet(dist + l))
        if (!marked && l >= tr.mark) {
          marked = true
          setPin(tr.stop, 'done')
        }
      })
      if (!ok) return
      dist += tr.len
      done.push(k)
      setPin(tr.stop, 'done')
      setOldScore({ trips: k + 1, tasks: done.length })
      if (!(await pause(250))) return
    }
    if (id !== run.current) return
    setWalkCur(-1)
    setWalksDone(done)
    place([DOOR, 66])
    setMode('intro')
    setOldDone(true)
    setLive({
      h: 'Four trips from the backroom',
      p: 'Four walks crossed the same aisles again and again. Now run the same shift as one guided walk.',
    })
  }

  /* -- the guided walk: the viewer plays it -- */

  const moveTo = (target: number) =>
    walk(ROUTE.pts, pos.current, target, 900, (l) => {
      pos.current = l
      place(pointAt(ROUTE.pts, l))
      drawNew(l)
      setText(nDist.current, feet(l))
    })

  const goTo = async (k: number) => {
    setI(k)
    setPhase('walking')
    setPin(k, 'active')
    setLive({
      h: `Heading to aisle ${STOPS[k].aisle}`,
      p: 'One sweep through the store, picking up every task in aisle order. No trips back to the backroom.',
    })
    if (!(await moveTo(ROUTE.stopAt[k]))) return
    setPhase('wait')
    setLive({
      h: `At aisle ${STOPS[k].aisle} · scan to confirm`,
      p: 'Press a scan trigger on the side of the handheld, or tap the prompt on screen.',
    })
  }

  const playNew = () => {
    halt()
    drawNew(0)
    pos.current = 0
    if (oldDone) setFaded(true)
    setMode('new')
    setNewScore({ tasks: 0 })
    setText(nDist.current, feet(0))
    setRes([])
    setListDone(false)
    setScreen('stop')
    goTo(0)
  }

  const scan = () => {
    if (mode !== 'new' || screen !== 'stop' || phase !== 'wait') return
    haptic('tap')
    setLed(true)
    later(() => setLed(false), 220)
    const s = STOPS[i]
    setCount(s.oh)
    focusAfterScan.current = true
    setPhase('act')
    setLive(
      s.type === 'replen'
        ? { h: 'Restock or move on', p: `Shelf holds ${s.cap} and ${s.oh} are on hand.` }
        : s.type === 'check'
          ? { h: 'Check the shelf', p: 'A store walk task: confirm the shelf and the new tag look right.' }
          : {
              h: s.tag === 'Adjust' ? 'Fix the system count' : 'Count the shelf',
              p: 'Set the number to what is actually there, then save it.',
            },
    )
  }

  const finish = (r: string) => {
    haptic('tap')
    const next = [...res]
    next[i] = r
    setRes(next)
    setPin(i, 'done')
    setNewScore({ tasks: next.filter(Boolean).length })
    setToast({ text: r, on: true })
    later(() => setToast((t) => ({ ...t, on: false })), 1200)
    if (i < LAST) {
      goTo(i + 1)
      return
    }
    setPhase('returning')
    setLive({ h: 'Walk complete', p: 'One trip out and back, with every task done in store order.' })
    moveTo(ROUTE.len).then((ok) => {
      if (!ok) return
      setMode('intro')
      setNewDone(true)
      setListDone(true)
      setScreen('list')
    })
  }

  // See all, mid-walk: × goes back to the stop.
  const openList = () => {
    if (mode !== 'new' || phase === 'returning') return
    setListDone(false)
    setScreen('list')
  }

  const resetAll = () => {
    halt()
    clearOld()
    clearNew()
    setText(oDist.current, '–')
    setMode('intro')
    setOldDone(false)
    setNewDone(false)
    setOldScore(null)
    setWalkCur(-1)
    setWalksDone([])
    setScreen('walks')
    setPhase('walking')
    setLive(INTRO)
  }

  // After a scan, focus moves to the task's first action.
  useEffect(() => {
    if (phase !== 'act' || !focusAfterScan.current) return
    focusAfterScan.current = false
    act.current?.querySelector('button')?.focus({ preventScroll: true })
  }, [phase, i])

  /* -- coach mark: points at what to press next -- */

  const coachKind = mode === 'new' && screen === 'stop' ? (phase === 'wait' ? 'scan' : phase === 'act' ? 'act' : null) : null

  const placeCoach = useRef<() => void>(() => {})
  useLayoutEffect(() => {
    const position = () => {
      const c = coach.current
      const st = stage.current
      const dev = device.current
      if (!c || !st || !dev || !coachKind) return
      const sr = st.getBoundingClientRect()
      const head = coachH.current!
      const body = coachP.current!
      c.classList.remove('is-side', 'is-top', 'is-below')
      coachIcon.current?.style.setProperty('display', coachKind === 'scan' ? '' : 'none')
      if (coachKind === 'scan') {
        const tr = dev.querySelector('.gtd-trig.is-l')!.getBoundingClientRect()
        const room = tr.left - sr.left
        // Room beside the handheld: point at the trigger itself.
        if (room > 220) {
          c.classList.add('is-side')
          head.textContent = 'Press to scan'
          body.textContent = 'Click this scan button on the side of the handheld, or tap the black prompt on screen.'
          c.style.left = `${room - c.offsetWidth - 16}px`
          c.style.top = `${tr.top - sr.top + tr.height / 2 - c.offsetHeight / 2}px`
          return
        }
        const b = act.current?.querySelector('.gtd-waiting')
        if (!b) return
        const br = b.getBoundingClientRect()
        c.classList.add('is-top')
        head.textContent = 'Tap to scan'
        body.textContent = 'Tap the black prompt, or press a scan button on either side of the handheld.'
        c.style.left = `${Math.max(0, Math.min(sr.width - c.offsetWidth, br.left - sr.left + br.width / 2 - c.offsetWidth / 2))}px`
        c.style.top = `${br.top - sr.top - c.offsetHeight - 12}px`
        c.style.setProperty('--ax', `${br.left - sr.left + br.width / 2 - c.offsetLeft}px`)
        return
      }
      const s = STOPS[i]
      const copy = ACT_COPY[s.type]
      const tgt = act.current?.querySelector('.gtd-pill.is-solid')
      if (!tgt) return
      head.textContent = s.tag === 'Adjust' ? 'Save the adjustment' : copy[0]
      body.textContent = copy[1]
      const r = tgt.getBoundingClientRect()
      c.classList.add('is-below')
      const left = Math.max(0, Math.min(sr.width - c.offsetWidth, r.left - sr.left + r.width / 2 - c.offsetWidth / 2))
      c.style.left = `${left}px`
      c.style.top = `${r.bottom - sr.top + 12}px`
      c.style.setProperty('--ax', `${r.left - sr.left + r.width / 2 - left}px`)
    }
    placeCoach.current = position
    position()
    window.addEventListener('resize', position)
    return () => window.removeEventListener('resize', position)
  }, [coachKind, i])

  /* -- fit the handheld to its stage; hide the section counter while on screen -- */

  useEffect(() => {
    const st = stage.current
    const sc = scaler.current
    if (!st || !sc) return
    // The view starts hidden (0×0); only scale from a real measurement.
    const ro = new ResizeObserver(([e]) => {
      const { width: w, height: h } = e.contentRect
      if (!w || !h) return
      sc.style.setProperty('--base', Math.min(h / DEVICE_H, w / DEVICE_W, 1).toFixed(3))
      placeCoach.current()
    })
    ro.observe(st)
    const page = document.documentElement
    const io = new IntersectionObserver(([e]) => page.classList.toggle('gtf-in-view', e.isIntersecting))
    io.observe(st)
    const pending = timers
    return () => {
      ro.disconnect()
      io.disconnect()
      page.classList.remove('gtf-in-view')
      run.current++
      pending.current.forEach(clearTimeout)
    }
  }, [])

  /* -- render -- */

  const s = STOPS[i]
  const progress = phase === 'returning' ? 1 : res.filter(Boolean).length / STOPS.length
  const verdict =
    oldDone && newDone ? (
      <>
        Same four tasks: <strong>1 trip instead of 4</strong>, and <strong>{`${SAVED_PCT}% less walking`}</strong>{' '}
        {`(${feet(ROUTE.len)} vs ${feet(OLD_TOTAL)}).`}
      </>
    ) : oldDone ? (
      <>
        The old way took <strong>4 trips</strong> and <strong>{feet(OLD_TOTAL)}</strong>. Now press{' '}
        <strong>Run the guided walk</strong>.
      </>
    ) : newDone ? (
      <>
        The guided walk took <strong>1 trip</strong> and <strong>{feet(ROUTE.len)}</strong>. Press{' '}
        <strong>Watch the old way</strong> to compare.
      </>
    ) : (
      <>
        Start with <strong>Watch the old way</strong>.
      </>
    )
  // The control that moves the story on is the solid one.
  const nextUp = !oldDone ? 'old' : !newDone && mode !== 'new' ? 'new' : null

  let action
  if (phase === 'walking') {
    action = (
      <div className="gtd-walking">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
          <circle cx="13" cy="4" r="2" />
          <path d="M10 21l2-6 3 3v3M7 12l3-4 4 1 3 4M12 15l-2-4" />
        </svg>
        {`Head to aisle ${s.aisle} · side ${s.loc[1]}`}
      </div>
    )
  } else if (phase === 'returning') {
    action = <div className="gtd-walking">All tasks done · heading back</div>
  } else if (phase === 'wait') {
    action = <ScanPrompt onScan={scan} />
  } else if (s.type === 'count') {
    action = (
      <>
        <div className="gtd-countrow">
          <b>{s.unit}</b>
          <div className="gtd-stepper">
            <button type="button" aria-label="One fewer" onClick={() => setCount((c) => Math.max(0, c - 1))}>
              −
            </button>
            <output aria-live="polite">{count}</output>
            <button type="button" aria-label="One more" onClick={() => setCount((c) => c + 1)}>
              +
            </button>
          </div>
        </div>
        <div className="gtd-decide is-one">
          <button className="gtd-pill is-solid" type="button" onClick={() => finish(`${s.tag === 'Adjust' ? 'Adjusted to' : 'Counted'} ${count}`)}>
            {s.save}
          </button>
        </div>
      </>
    )
  } else {
    const [alt, main] = s.type === 'replen' ? (['No action', 'Replenish'] as const) : (['Flag issue', 'Looks good'] as const)
    const [altR, mainR] = s.type === 'replen' ? ['No action', 'Replenished'] : ['Flagged', 'Checked']
    action = (
      <div className="gtd-decide">
        <button className="gtd-pill" type="button" onClick={() => finish(altR)}>
          {alt}
        </button>
        <button className="gtd-pill is-solid" type="button" onClick={() => finish(mainR)}>
          {main}
        </button>
      </div>
    )
  }

  const nTasks = res.filter(Boolean).length

  return (
    <section className="gtf-fig" aria-labelledby="gtf-f1">
      <div className="gtf-head">
        <h3 className="display gtf-title" id="gtf-f1">
          Four trips, or one
        </h3>
        <span className="eyebrow eyebrow-tight">Fig. 01 · Interactive</span>
      </div>
      <div className="gtf-intro">
        <p>
          Today&apos;s shift has four tasks in four aisles: check a shelf, restock chips, count tortillas, and fix a water
          count. Watch how the old app sent a team member out for each one, then run the same shift as one guided walk.
        </p>
        <div className="gtf-controls">
          <button
            className={nextUp === 'old' ? 'gtf-ctl is-primary' : 'gtf-ctl'}
            type="button"
            disabled={mode === 'old'}
            onClick={() => {
              haptic('tap')
              reveal(plate.current)
              playOld()
            }}
          >
            <span className="gtf-ctl-n">1</span>Watch the old way
          </button>
          <button
            className={nextUp === 'new' ? 'gtf-ctl is-primary' : 'gtf-ctl'}
            type="button"
            onClick={() => {
              haptic('tap')
              reveal(stage.current)
              playNew()
            }}
          >
            <span className="gtf-ctl-n">2</span>Run the guided walk
          </button>
          <button className="gtf-ctl" type="button" onClick={resetAll}>
            Reset
          </button>
        </div>
      </div>

      <div className="gtf-game">
        <div className="gtf-plate" ref={plate}>
          <div className="gtf-score" role="group" aria-label="Scorecard">
            <span />
            <span className="eyebrow eyebrow-tight">Trips</span>
            <span className="eyebrow eyebrow-tight">Distance</span>
            <span className="eyebrow eyebrow-tight">Tasks</span>
            <span className="gtf-score-r is-old">
              <i />
              Old way
            </span>
            <b className={oldScore ? '' : 'is-dim'}>{oldScore ? oldScore.trips : '–'}</b>
            <b className={oldScore ? '' : 'is-dim'} ref={oDist} suppressHydrationWarning>
              –
            </b>
            <b className={oldScore ? '' : 'is-dim'}>{oldScore ? oldScore.tasks : '–'}</b>
            <span className="gtf-score-r">
              <i />
              Guided walk
            </span>
            <b className={newScore ? '' : 'is-dim'}>{newScore ? 1 : '–'}</b>
            <b className={newScore ? '' : 'is-dim'} ref={nDist} suppressHydrationWarning>
              –
            </b>
            <b className={newScore ? '' : 'is-dim'}>{newScore ? newScore.tasks : '–'}</b>
          </div>

          <StorePlan className="gtf-map" label="Store floor plan showing the team member's route to four tasks">
            <g className={faded ? 'gtm-old is-faded' : 'gtm-old'}>
              {OLD_TRIPS.map((tr, k) => (
                <path
                  key={k}
                  ref={(el) => {
                    oldPaths.current[k] = el
                  }}
                  className="gtm-trail is-old"
                  d={toPath(tr.pts)}
                  strokeDasharray="0 99999"
                />
              ))}
            </g>
            <path ref={newPath} className="gtm-trail is-new" d={toPath(ROUTE.pts)} strokeDasharray={`0 ${ROUTE.len + 10}`} />
            {STOPS.map((st, k) => (
              <MapPin key={k} stop={st} n={k + 1} state={pins[k]} />
            ))}
            <g ref={avatar} className="gtm-avatar" transform={`translate(${DOOR} 66)`}>
              <circle r="7.5" />
              <text x="12" y="4">
                YOU
              </text>
            </g>
          </StorePlan>

          <p className="gtf-verdict" aria-live="polite">
            {verdict}
          </p>
          <span className="eyebrow eyebrow-tight gtf-illus">Illustrative store, routes, and distances</span>
        </div>

        <div className="gtf-stage" ref={stage}>
          <div className="gtf-coach" ref={coach} hidden={!coachKind} role="note">
            <b>
              <svg ref={coachIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
                <path d="M4 7V4h3M17 4h3v3M20 17v3h-3M7 20H4v-3M8 8v8M11 8v8M14 8v8M17 8v8" />
              </svg>
              <span ref={coachH} />
            </b>
            <span ref={coachP} />
          </div>
          <div className="gtf-scaler" ref={scaler}>
            <div
              ref={device}
              className={[
                'gtf-device',
                mode === 'new' && screen === 'stop' && phase === 'wait' ? 'is-waiting' : '',
                mode === 'new' && phase === 'act' ? 'is-acting' : '',
              ].join(' ')}
            >
              <Handheld onScan={scan} led={led}>
                {/* The old app: one walk per task type */}
                <div className={screen === 'walks' ? 'gtd-view is-shown' : 'gtd-view'}>
                  <div className="gtd-apphead">
                    <div className="gtd-apphead-sub">Store 214 · Old app</div>
                    <h4>My walks</h4>
                  </div>
                  <div className="gtd-wlist">
                    {OLD_ORDER.map((si, k) => {
                      const d = walksDone.includes(k)
                      const c = k === walkCur
                      const aisles = OLD_AISLES[k]
                      return (
                        <div key={k} className={['gtd-walkcard', c ? 'is-cur' : '', d ? 'is-done' : ''].join(' ')}>
                          <div>
                            <div className="gtd-walkcard-t">{STOPS[si].walk}</div>
                            <div className="gtd-walkcard-s">
                              {`${aisles.length} aisles · ${aisles.length === 14 ? '1–14' : aisles.join(', ')}`}
                            </div>
                          </div>
                          <span className="gtd-walkcard-st">{d ? 'Done' : c ? 'Walking' : 'Start'}</span>
                        </div>
                      )
                    })}
                  </div>
                  <p className="gtd-wnote">Each walk starts and ends at the backroom and sweeps its own aisles.</p>
                </div>

                {/* The guided walk's stop */}
                <div className={screen === 'stop' ? 'gtd-view is-shown' : 'gtd-view'}>
                  <StopScreen
                    stop={s}
                    index={i}
                    total={STOPS.length}
                    progress={progress}
                    onSeeAll={openList}
                    action={<div ref={act}>{action}</div>}
                  >
                    <div className={toast.on ? 'gtd-toast is-on' : 'gtd-toast'} role="status">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
                        <path d="M4 12l5 5L20 6" />
                      </svg>
                      {toast.text}
                    </div>
                  </StopScreen>
                </div>

                {/* Task list: mid-walk, or the walk's summary */}
                <div className={screen === 'list' ? 'gtd-view is-shown' : 'gtd-view'}>
                  <div className="gtd-sheet-h">
                    <span>{listDone ? 'Walk complete' : 'Current walk task list'}</span>
                    {!listDone && (
                      <button className="gtd-xbtn" type="button" aria-label="Back to walk" onClick={() => setScreen('stop')}>
                        ×
                      </button>
                    )}
                  </div>
                  <div className="gtd-tl-sum">
                    <b>{`${nTasks} / ${STOPS.length} tasks completed`}</b> <span>· 1 trip</span>
                  </div>
                  {STOPS.map((st, k) => {
                    const r = res[k]
                    const cur = !listDone && k === i && !r
                    return (
                      <div key={k} className={['gtd-tl-item', r ? 'is-done' : '', cur ? 'is-cur' : ''].join(' ')}>
                        <ProductIcon kind={st.icon} className="gtd-thumb is-sm" />
                        <div>
                          <div className="gtd-tl-t">
                            {st.name.split(',')[0]}
                            <span className="gtd-tag">{st.tag}</span>
                          </div>
                          <div className="gtd-tl-s">{`Aisle ${st.loc.join(' | ')}`}</div>
                          <div className="gtd-tl-st">
                            <i className={r ? 'gtd-dot is-f' : 'gtd-dot'} />
                            {r || (cur ? 'In progress' : 'Not yet completed')}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  <div className="gtd-foot">
                    <button
                      className="gtd-pill is-solid"
                      type="button"
                      onClick={() => (listDone ? playNew() : setScreen('stop'))}
                    >
                      {listDone ? 'Play again' : 'Back to walk'}
                    </button>
                  </div>
                </div>
              </Handheld>
            </div>
          </div>
        </div>
      </div>

      <div className="gtf-live" aria-live="polite">
        <span className="eyebrow eyebrow-tight">Now</span>
        <b>{live.h}</b>
        <span>{live.p}</span>
      </div>
    </section>
  )
}

/* ---------- Fig. 02: how team members did ---------- */

const RESULT_COPY = {
  76: {
    bracket: '76% completed',
    p: 'Team members finished three in four tasks in the redesigned walk with no help, on their first time using it.',
  },
  84: {
    bracket: '84% completed or mostly understood',
    p: 'Counting tasks they mostly understood, team members got through 84% of the redesigned walk.',
  },
} as const

function Results() {
  const [bw, setBw] = useState<76 | 84>(76)
  const [tip, setTip] = useState<{ text: string; left: number } | null>(null)
  const track = useRef<HTMLDivElement>(null)
  const tipEl = useRef<HTMLDivElement>(null)

  const show = (el: HTMLElement, label: string, v: number) => {
    const tr = track.current?.getBoundingClientRect()
    if (!tr) return
    const r = el.getBoundingClientRect()
    setTip({ text: `${label} · ${v}% of tasks`, left: r.left - tr.left + r.width / 2 })
  }
  // Keep the tooltip inside the track once its width is known.
  useLayoutEffect(() => {
    const t = tipEl.current
    const tr = track.current
    if (!t || !tr || !tip) return
    const half = t.offsetWidth / 2
    t.style.left = `${Math.min(Math.max(tip.left, half), tr.clientWidth - half)}px`
  }, [tip])

  return (
    <section className="gtf-fig" aria-labelledby="gtf-f2">
      <div className="gtf-head">
        <h3 className="display gtf-title" id="gtf-f2">
          How team members did
        </h3>
        <span className="eyebrow eyebrow-tight">Fig. 02 · Hover or tap the bar</span>
      </div>
      <div className="gtf-results">
        <div className="gtf-hero-num">
          <span className="eyebrow eyebrow-tight">Tasks completed outright</span>
          <div className="display gtf-big">{`${bw}%`}</div>
          <p>{RESULT_COPY[bw].p}</p>
        </div>
        <div className="gtf-chart">
          <div className="gtf-toggle" role="group" aria-label="Choose what counts as success">
            {([76, 84] as const).map((k) => (
              <button
                key={k}
                type="button"
                aria-pressed={bw === k}
                onClick={() => {
                  haptic('tap')
                  setBw(k)
                }}
              >
                {k === 76 ? 'Completed' : '+ Mostly understood'}
              </button>
            ))}
          </div>
          <div className="gtf-track" ref={track}>
            <div className="gtf-bracket" style={{ '--bw': `${bw}%` } as CSSProperties}>
              <span>{RESULT_COPY[bw].bracket}</span>
            </div>
            <div className="gtf-stack" role="list" aria-label="Task outcomes in field testing">
              {OUTCOMES.map((o) => (
                <div
                  key={o.key}
                  className={`gtf-seg is-${o.key}`}
                  role="listitem"
                  tabIndex={0}
                  style={{ flex: o.v }}
                  aria-label={`${o.label}, ${o.v} percent`}
                  onPointerEnter={(e) => show(e.currentTarget, o.label, o.v)}
                  onFocus={(e) => show(e.currentTarget, o.label, o.v)}
                  onClick={(e) => show(e.currentTarget, o.label, o.v)}
                  onPointerLeave={() => setTip(null)}
                  onBlur={() => setTip(null)}
                >
                  {o.key === 's1' && <span className="gtf-seg-in">76%</span>}
                </div>
              ))}
            </div>
            {tip && (
              <div className="gtf-tip" ref={tipEl} style={{ left: tip.left }}>
                {tip.text}
              </div>
            )}
          </div>
          <ul className="gtf-legend">
            {OUTCOMES.map((o) => (
              <li key={o.key}>
                <i className={`gtf-sw is-${o.key}`} />
                <strong>{`${o.v}%`}</strong>
                <span>{o.note}</span>
              </li>
            ))}
          </ul>
          <div className="gtf-facts">
            <div>
              <span className="eyebrow eyebrow-tight">Where</span>
              <b>Austin, Round Rock, San Antonio</b>
            </div>
            <div>
              <span className="eyebrow eyebrow-tight">On</span>
              <b>The store&apos;s own rugged handhelds</b>
            </div>
            <div>
              <span className="eyebrow eyebrow-tight">How</span>
              <b>One-hour, in-person sessions</b>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
