'use client'

import { useEffect, useRef, type CSSProperties } from 'react'
import { haptic } from './haptics'
import { BriefingV1Screen, DashboardScreen, NoteDetailScreen } from './StoreLeaderScreens'

/*
 * Interactive figures for the store leader platform page, in place of static
 * images. The phone (screens recreated in HTML) and its description pin
 * together; scrolling steps through the description, and the phone lights up
 * the part of the screen each step describes and dims the rest. Fig. 02 adds a v1 / v2
 * compare: drag the screen, use the slider (keyboard), or the buttons.
 */

// Fig. 02: how much of v2 each step reveals, 0–100. The v1 step rests split
// down the middle so both versions show.
const STEP_W: Record<string, number> = { v1: 50, summary: 100, share: 100, actions: 100, comments: 100 }

const PHONE_W = 470 // phone plus breathing room, for fitting to the stage
const PHONE_H = 900

function Step({ id, label, title, children }: { id: string; label: string; title: string; children: React.ReactNode }) {
  return (
    <article className="slf-step" data-step={id}>
      <div className="slf-step-body" data-step-body="">
        <span className="eyebrow eyebrow-tight">{label}</span>
        <span className="slf-rule" aria-hidden="true" />
        <h3 className="slf-step-title">{title}</h3>
        {children}
      </div>
    </article>
  )
}

export default function StoreLeaderFigures() {
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = root.current
    if (!el) return
    const q = <T extends HTMLElement = HTMLElement>(sel: string, scope: ParentNode = el) => scope.querySelector<T>(sel)
    const qa = <T extends HTMLElement = HTMLElement>(sel: string, scope: ParentNode = el) =>
      Array.from(scope.querySelectorAll<T>(sel))

    const screen1 = q('[data-screen="1"]')
    const screen2 = q('[data-screen="2"]')
    const range = q<HTMLInputElement>('[data-compare]')
    const vbtns = qa<HTMLButtonElement>('[data-set]')
    if (!screen1 || !screen2 || !range) return

    // Fit each phone to its stage. Views start hidden (0×0), so only apply
    // real measurements.
    const ro = new ResizeObserver((entries) => {
      entries.forEach(({ target, contentRect: r }) => {
        if (!r.width || !r.height) return
        const s = Math.min(r.height / PHONE_H, r.width / PHONE_W, 1)
        ;(target as HTMLElement).style.setProperty('--base', s.toFixed(3))
      })
    })
    qa('[data-stage]').forEach((s) => ro.observe(s))

    const setW = (w: number) => {
      screen2.style.setProperty('--w', (w / 100).toFixed(3))
      range.value = String(w)
      // Fully on one version: the handle has nothing to divide, so it steps
      // out of the way instead of sitting on the content (site.css).
      screen2.classList.toggle('is-edge', w <= 0.5 || w >= 99.5)
      vbtns.forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.set) === (w > 50 ? 100 : 0))))
    }

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    // The screens scroll themselves to the lit section. A slower, eased glide
    // than the browser's smooth scroll, so you see the screen move.
    const glides = new WeakMap<HTMLElement, number>()
    const glide = (sc: HTMLElement, to: number) => {
      cancelAnimationFrame(glides.get(sc) ?? 0)
      const from = sc.scrollTop
      if (reduced || Math.abs(to - from) < 1) {
        sc.scrollTop = to
        return
      }
      const start = performance.now()
      const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2)
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / 450)
        sc.scrollTop = from + (to - from) * ease(t)
        if (t < 1) glides.set(sc, requestAnimationFrame(tick))
      }
      glides.set(sc, requestAnimationFrame(tick))
    }
    const focus = (screen: HTMLElement, key: string) => {
      let lit: HTMLElement | null = null
      qa('[data-focus]', screen).forEach((f) => {
        const on = f.dataset.focus === key
        f.classList.toggle('is-lit', on)
        if (on) lit = f
      })
      screen.classList.toggle('is-focusing', !!lit)
      // A screen taller than the phone (the dashboard runs under its tab bar)
      // scrolls itself, like the real app would, just far enough to show the
      // lit section in full; with nothing lit it returns to the top.
      const sc = q('[data-scroll]', screen)
      if (!sc) return
      const zone = lit as HTMLElement | null
      const max = sc.scrollHeight - sc.clientHeight
      const top = zone ? Math.min(max, Math.max(0, zone.offsetTop + zone.offsetHeight + 12 - sc.clientHeight)) : 0
      glide(sc, top)
    }

    const activate = (group: string, key: string) => {
      if (group === '1') focus(screen1, key)
      else {
        setW(STEP_W[key])
        focus(screen2, key)
      }
    }

    const ac = new AbortController()
    const { signal } = ac

    // `jump`: a step picked on the screen. Until the page scrolls there, the
    // steps it passes on the way don't flash by.
    type Group = { split: HTMLElement; pin: HTMLElement; list: HTMLElement; items: HTMLElement[]; on: number; jump: number | null }
    const groups: Group[] = qa('.slf-split').map((split) => {
      const list = split.querySelector<HTMLElement>('[data-steps]') as HTMLElement
      return { split, pin: split.querySelector<HTMLElement>('.slf-pin') as HTMLElement, list, items: qa('[data-step]', list), on: 0, jump: null }
    })
    const setOn = (g: Group, i: number) => {
      if (g.jump !== null) {
        if (i !== g.jump) return
        g.jump = null
      }
      if (g.on === i) return
      g.on = i
      // Touch: a tick as each step lands (a tap on the screen included).
      haptic()
      g.items.forEach((s, k) => s.classList.toggle('is-on', k === i))
      activate(g.list.dataset.steps || '1', g.items[i].dataset.step || '')
    }

    // Both layouts pin the phone and its description together; where you are
    // in the split's scroll decides the step. Side by side, the text swaps in
    // place. Stacked (phones), the cards slide sideways, resting for most of
    // each stretch and moving only near the boundary.
    // The first step holds for LEAD steps' worth of scroll after the figure
    // pins, and the last for HOLD before it unpins, so neither end is gone as
    // soon as it lands. Matches `+ 0.5 + 0.67` in .slf-split's height (site.css).
    const LEAD = 0.5
    const HOLD = 0.67
    const smooth = (t: number) => t * t * (3 - 2 * t)
    const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
    const position = (g: Group) => {
      const n = g.items.length
      const travel = g.split.offsetHeight - g.pin.offsetHeight
      const top = parseFloat(getComputedStyle(g.pin).top) || 0
      const scrolled = top - g.split.getBoundingClientRect().top
      const span = n - 1 + LEAD + HOLD
      return { n, travel, scrolled, span, raw: travel > 0 ? clamp01(scrolled / travel) * span - LEAD : 0 }
    }
    let stacked = false
    const update = () => {
      groups.forEach((g) => {
        const { n, raw } = position(g)
        if (n < 2) return
        const pos = Math.min(n - 1, Math.max(0, raw))
        if (!stacked) {
          setOn(g, Math.round(pos))
          return
        }
        const i = Math.min(n - 2, Math.floor(pos))
        const at = i + smooth(clamp01((pos - i - 0.3) / 0.4))
        const gap = parseFloat(getComputedStyle(g.list).columnGap) || 0
        // Exact width, not offsetWidth: rounding to whole pixels adds up card
        // by card and shaves the edge off the later ones.
        const w = g.items[0].getBoundingClientRect().width
        g.list.style.transform = `translate3d(${-at * (w + gap)}px, 0, 0)`
        setOn(g, Math.round(at))
      })
    }
    // Side by side, every step hangs from the same top line, and the block is
    // centered beside the phone. Sized to its tallest step (Fig. 02's v1, with
    // its buttons), the block would leave the others sitting high, so it's
    // sized to the median step instead; a longer step just runs below.
    const fitSteps = () => {
      groups.forEach((g) => {
        if (stacked) {
          g.list.style.height = ''
          return
        }
        const hs = g.items
          .map((s) => (s.querySelector('[data-step-body]') as HTMLElement | null)?.offsetHeight ?? 0)
          .sort((a, b) => a - b)
        const median = hs[Math.floor((hs.length - 1) / 2)]
        if (median) g.list.style.height = `${median}px`
      })
    }
    const setMode = () => {
      const pin = groups[0]?.pin
      const next = !!pin && getComputedStyle(pin).display === 'flex'
      if (next !== stacked) {
        stacked = next
        groups.forEach((g) => (g.list.style.transform = ''))
      }
      fitSteps()
      update()
    }
    window.addEventListener('scroll', update, { passive: true, signal })

    // Fig. 01: tap a section of the screen to jump to its step (anywhere else
    // on the screen goes back to the overview). The page scrolls to where that
    // step rests, so scrolling on from there carries on as normal.
    let jumpTimer = 0
    const g1 = groups.find((g) => g.list.dataset.steps === '1')
    screen1.addEventListener(
      'click',
      (e) => {
        if (!g1) return
        const key = (e.target as HTMLElement).closest<HTMLElement>('[data-focus]')?.dataset.focus
        const i = Math.max(0, g1.items.findIndex((s) => s.dataset.step === key))
        const { travel, scrolled, span } = position(g1)
        if (travel <= 0) return
        g1.jump = null
        setOn(g1, i)
        g1.jump = i
        window.clearTimeout(jumpTimer)
        jumpTimer = window.setTimeout(() => ((g1.jump = null), update()), 1500)
        window.scrollBy({ top: ((i + LEAD) / span) * travel - scrolled, behavior: reduced ? 'auto' : 'smooth' })
      },
      { signal },
    )

    // Phones: if scrolling stops while the cards are mid-slide, finish the
    // slide to the nearer card so the page never rests on two half cards.
    // (Side by side there's nothing to settle; the text swaps in place.)
    let settleTimer = 0
    const settle = () => {
      if (reduced || !stacked) return
      for (const g of groups) {
        const { n, travel, scrolled, span, raw } = position(g)
        if (travel <= 0 || raw < 0 || raw > n - 1) continue
        const frac = raw - Math.floor(raw)
        if (frac <= 0.3 || frac >= 0.7) continue
        const delta = ((Math.round(raw) + LEAD) / span) * travel - scrolled
        if (Math.abs(delta) > 4) window.scrollBy({ top: delta, behavior: 'smooth' })
        return
      }
    }
    window.addEventListener(
      'scroll',
      () => {
        window.clearTimeout(settleTimer)
        settleTimer = window.setTimeout(settle, 200)
      },
      { passive: true, signal },
    )
    // Re-check when the column crosses the stacking width (and when the view,
    // hidden at first, gets its real size).
    const modeRo = new ResizeObserver(setMode)
    modeRo.observe(el)
    // Web fonts change the step heights once they load; measure again then.
    document.fonts?.ready.then(() => !signal.aborted && fitSteps())

    // The site's fixed section counter (bottom right) would sit over the
    // phone and the steps, so it steps aside while the figures are on screen.
    // Hiding the view (navigating away) reports "not intersecting" too.
    const page = document.documentElement
    const inView = new IntersectionObserver(([e]) => page.classList.toggle('slf-in-view', e.isIntersecting))
    inView.observe(el)

    // Resting state: the first step of each figure.
    qa('[data-steps]').forEach((g) => g.querySelector('[data-step]')?.classList.add('is-on'))
    activate('1', 'overview')
    activate('2', 'v1')

    // Drag to compare: follows the pointer directly, no easing mid-drag.
    let dragging = false
    let pending: number | null = null
    let raf = 0
    // Touch: a tick as the handle crosses the middle or reaches either edge
    // (not as it leaves one).
    const zoneOf = (w: number) => (w <= 0.5 ? 'v1' : w >= 99.5 ? 'v2' : w < 50 ? 'a' : 'b')
    let zone = ''
    const feel = (w: number) => {
      const z = zoneOf(w)
      if (z !== zone && (zone === 'a' || zone === 'b')) haptic()
      zone = z
    }
    const fromX = (x: number) => {
      const r = screen2.getBoundingClientRect()
      return (1 - Math.min(1, Math.max(0, (x - r.left) / r.width))) * 100
    }
    const tick = () => {
      if (pending !== null) {
        feel(pending)
        setW(pending)
        pending = null
      }
      raf = dragging ? requestAnimationFrame(tick) : 0
    }
    const touched = () => screen2.classList.add('is-touched')
    screen2.addEventListener(
      'pointerdown',
      (e) => {
        dragging = true
        screen2.classList.add('is-dragging')
        touched()
        try {
          screen2.setPointerCapture(e.pointerId)
        } catch {}
        zone = zoneOf(Number(range.value))
        pending = fromX(e.clientX)
        if (!raf) raf = requestAnimationFrame(tick)
      },
      { signal },
    )
    screen2.addEventListener('pointermove', (e) => dragging && (pending = fromX(e.clientX)), { signal })
    const end = () => {
      dragging = false
      screen2.classList.remove('is-dragging')
    }
    screen2.addEventListener('pointerup', end, { signal })
    screen2.addEventListener('pointercancel', end, { signal })
    range.addEventListener(
      'input',
      () => {
        touched()
        setW(Number(range.value))
      },
      { signal },
    )
    vbtns.forEach((b) =>
      b.addEventListener(
        'click',
        () => {
          touched()
          haptic('tap')
          setW(Number(b.dataset.set))
        },
        { signal },
      ),
    )

    return () => {
      ac.abort()
      window.clearTimeout(settleTimer)
      window.clearTimeout(jumpTimer)
      ro.disconnect()
      modeRo.disconnect()
      inView.disconnect()
      page.classList.remove('slf-in-view')
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div className="slf" ref={root}>
      {/* FIGURE 01 */}
      <section className="slf-fig" aria-labelledby="slf-f1">
        <div className="slf-head">
          <h3 className="display slf-title" id="slf-f1">
            The morning, on one screen
          </h3>
          <span className="eyebrow eyebrow-tight">Fig. 01 · Scroll or tap the screen</span>
        </div>
        <div className="slf-split" style={{ ['--n' as string]: 5, ['--step' as string]: '40svh' } as CSSProperties}>
          <div className="slf-pin">
          <div className="slf-stage" data-stage="">
            <div className="slf-scaler">
              <div className="slf-phone">
                <div
                  className="slf-screen is-pickable"
                  data-screen="1"
                  role="img"
                  aria-label="Store leader dashboard: key metrics, AI briefing summary, action items, and recognition"
                >
                  <DashboardScreen />
                </div>
              </div>
            </div>
          </div>
          <div className="slf-steps" data-steps="1">
            <Step id="overview" label="Overview" title="A store leader's first screen of the day">
              <p>
                Before the doors open, the leader needs the numbers, the plan from the leadership briefing, and who needs
                recognition. The dashboard puts all of it on one scroll.
              </p>
            </Step>
            <Step id="metrics" label="01 · Key metrics" title="The numbers to know before the briefing">
              <p>Sales, shrink, and hospitality sit in a swipeable row, one tap from the payroll forecast.</p>
            </Step>
            <Step id="briefing" label="02 · AI briefing summary" title="The briefing, summarized">
              <p>
                Managers who missed the leadership briefing still start the day aligned. The summary is generated from the
                meeting notes.
              </p>
            </Step>
            <Step id="actions" label="03 · Action items" title="Every takeaway gets an owner">
              <p>
                Each item from the briefing becomes a task with a person and a priority, tracked back to where it came from.
              </p>
            </Step>
            <Step id="recognition" label="04 · Recognition" title="The day starts with people">
              <p>Work anniversaries and team wins sit on the same screen as the numbers, so they get said out loud.</p>
            </Step>
          </div>
          </div>
        </div>
      </section>

      {/* FIGURE 02 */}
      <section className="slf-fig" aria-labelledby="slf-f2">
        <div className="slf-head">
          <h3 className="display slf-title" id="slf-f2">
            One screen, v1 to v2
          </h3>
          <span className="eyebrow eyebrow-tight">Fig. 02 · Drag or scroll to compare</span>
        </div>
        <div className="slf-split" style={{ ['--n' as string]: 5 } as CSSProperties}>
          <div className="slf-pin">
          <div className="slf-stage" data-stage="">
            <div className="slf-scaler">
              <div className="slf-phone">
                <div className="slf-screen slf-compare" data-screen="2">
                  {/* V1 */}
                  <div className="slf-layer" role="img" aria-label="Version 1: a briefing page with an AI summary and three follow-ups">
                    <BriefingV1Screen />
                  </div>
                  {/* V2 */}
                  <div
                    className="slf-layer slf-v2"
                    role="img"
                    aria-label="Version 2: a full note with an AI summary, acknowledgments, action items and comments"
                  >
                    <NoteDetailScreen />
                  </div>
                  <span className="slf-tag is-l">V1</span>
                  <span className="slf-tag is-r">V2</span>
                  <input
                    className="slf-range"
                    data-compare=""
                    type="range"
                    min={0}
                    max={100}
                    defaultValue={0}
                    aria-label="Compare version 1 and version 2"
                  />
                  <div className="slf-handle" />
                  <div className="slf-knob" aria-hidden="true">
                    <div className="slf-grip">
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 6l-6 6 6 6M15 6l6 6-6 6" />
                      </svg>
                    </div>
                    <span className="slf-hint">Drag to compare</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="slf-steps" data-steps="2">
            <Step id="v1" label="V1 · Early sessions" title="A summary, and nowhere for the rest">
              <p>
                The first build treated notes like the dashboard&apos;s briefing: an AI summary of the meeting and a few
                follow-ups. Leaders still jotted the rest on their phones, on scraps of paper, even on their hands, and
                anything they needed to share went out by email that nobody on the floor was checking.
              </p>
              <p className="slf-drag-tip">
                <b>Drag the handle on the phone</b> to compare v1 and v2.
              </p>
              <div className="slf-versions" role="group" aria-label="Show version">
                <button type="button" data-set="0" aria-pressed="true">
                  Show v1
                </button>
                <button type="button" data-set="100" aria-pressed="false">
                  Show v2
                </button>
              </div>
            </Step>
            <Step id="summary" label="V2 · New · AI summary" title="The gist first, the note underneath">
              <p>
                An AI summary and key topics sit on top, so a partner catching up between tasks gets the point in seconds.
                The leader&apos;s full note stays right below it.
              </p>
            </Step>
            <Step id="share" label="V2 · New · Acknowledgments" title="Shared, and seen">
              <p>
                Instead of an email nobody on the floor reads, the note goes to the people who need it, and the leader can
                see who has acknowledged it.
              </p>
            </Step>
            <Step id="actions" label="V2 · New · Action items" title="Follow-ups that don't get lost">
              <p>
                Follow-ups become action items with an owner and a priority, added right from the note instead of written
                on a hand.
              </p>
            </Step>
            <Step id="comments" label="V2 · New · Comments" title="The conversation stays with the note">
              <p>Questions and answers live on the note itself, so the context doesn&apos;t scatter across texts and inboxes.</p>
            </Step>
          </div>
          </div>
        </div>
      </section>
    </div>
  )
}
