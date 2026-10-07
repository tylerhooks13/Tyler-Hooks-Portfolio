import { ARCHIVE_SAMPLE, VIEWS, type View } from './data'

/*
 * Imperative motion layer, ported from the Claude Design source
 * (design-src/portfolio.dc.html). React renders static markup once; this
 * module owns everything that animates or toggles after mount: the loader,
 * view swaps behind the curtain, reveals, scroll-linked effects and the
 * Ask the Archive demo. Every listener, timer and frame is torn down by the returned cleanup.
 */

const EASE_OUT = 'cubic-bezier(.16,1,.3,1)'
const EASE_SOFT = 'cubic-bezier(.22,1,.36,1)'
const EASE_CURTAIN = 'cubic-bezier(.76,0,.24,1)'
const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#%$&/*+=<>'
const MEDIA_SHOWN = 'grayscale(1) contrast(1.04) blur(0px)'

export type MotionOptions = {
  loader?: boolean
  grain?: number
}

// Old links to the single case study land on the current one.
const HASH_ALIASES: Record<string, View> = { case: 'ai-enablement' }

const viewFromHash = (): View => {
  const raw = window.location.hash.replace('#', '')
  const v = (HASH_ALIASES[raw] ?? raw) as View
  return VIEWS.includes(v) ? v : 'home'
}

export function initSiteMotion(root: HTMLElement, opts: MotionOptions = {}): () => void {
  const ac = new AbortController()
  const { signal } = ac
  const timers = new Set<number>()
  const frames = new Set<number>()
  const observers: IntersectionObserver[] = []
  const charMap = new WeakMap<HTMLElement, HTMLElement[]>()
  const scrambling = new Map<HTMLElement, number>()

  let reduced = false
  try {
    reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  } catch {}

  const $ = <T extends HTMLElement = HTMLElement>(sel: string, scope: ParentNode = root) =>
    scope.querySelector<T>(sel)
  const $$ = <T extends HTMLElement = HTMLElement>(sel: string, scope: ParentNode = root) =>
    Array.from(scope.querySelectorAll<T>(sel))
  const on = <K extends keyof HTMLElementEventMap>(
    el: EventTarget,
    type: K | string,
    fn: (e: any) => void,
    o: AddEventListenerOptions = {},
  ) => el.addEventListener(type, fn, { ...o, signal })
  const later = (fn: () => void, ms: number) => {
    const id = window.setTimeout(() => {
      timers.delete(id)
      fn()
    }, ms)
    timers.add(id)
    return id
  }
  const cancelLater = (id: number | null) => {
    if (id == null) return
    clearTimeout(id)
    timers.delete(id)
  }
  const frame = (fn: FrameRequestCallback) => {
    const id = requestAnimationFrame((t) => {
      frames.delete(id)
      fn(t)
    })
    frames.add(id)
    return id
  }
  const cancelFrame = (id: number | null) => {
    if (id == null) return
    cancelAnimationFrame(id)
    frames.delete(id)
  }
  const observe = (cb: IntersectionObserverCallback, o: IntersectionObserverInit) => {
    const io = new IntersectionObserver(cb, o)
    observers.push(io)
    return io
  }

  let view: View = 'home'
  const activeView = () => $(`[data-view="${view}"]`)

  /* ---------- texture ---------- */
  const setupGrain = () => {
    const el = $('[data-grain]')
    if (!el) return
    const svg =
      "<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='220' height='220' filter='url(%23n)' opacity='0.9'/></svg>"
    el.style.backgroundImage =
      'url("data:image/svg+xml;utf8,' + svg.replace(/</g, '%3C').replace(/>/g, '%3E') + '")'
    el.style.opacity = String(opts.grain ?? 0.32)
  }

  /* ---------- char split + reveal ---------- */
  const splitChars = (el: HTMLElement) => {
    if (el.dataset.split) {
      charMap.set(el, $$('[data-ch]', el))
      return
    }
    el.dataset.split = '1'
    const out: HTMLElement[] = []
    const wrapText = (text: string) => {
      const frag = document.createDocumentFragment()
      text.split(/(\s+)/).forEach((word) => {
        if (!word) return
        if (/^\s+$/.test(word)) {
          frag.appendChild(document.createTextNode(' '))
          return
        }
        const w = document.createElement('span')
        w.className = 'char-word'
        for (const ch of word) {
          const s = document.createElement('span')
          s.dataset.ch = ''
          s.className = 'char'
          s.textContent = ch
          out.push(s)
          w.appendChild(s)
        }
        frag.appendChild(w)
      })
      return frag
    }
    const rebuilt = document.createDocumentFragment()
    Array.from(el.childNodes).forEach((n) => {
      if (n.nodeType === Node.TEXT_NODE) rebuilt.appendChild(wrapText(n.textContent || ''))
      else if (n instanceof HTMLBRElement) rebuilt.appendChild(n.cloneNode())
      else if (n instanceof HTMLElement) {
        // Keep the wrapper (e.g. outlined words) but split its text.
        const holder = n.cloneNode(false) as HTMLElement
        holder.appendChild(wrapText(n.textContent || ''))
        rebuilt.appendChild(holder)
      }
    })
    el.textContent = ''
    el.appendChild(rebuilt)
    el.setAttribute('aria-label', el.textContent || '')
    charMap.set(el, out)
  }

  const hideChars = (el: HTMLElement) => {
    ;(charMap.get(el) || []).forEach((s) => {
      s.style.transition = 'none'
      if (reduced) s.style.opacity = '0'
      else s.style.transform = 'translateY(1.05em)'
    })
  }

  const revealChars = (el: HTMLElement) => {
    el.dataset.done = '1'
    ;(charMap.get(el) || []).forEach((s, i) => {
      const d = i * 38
      s.style.transition = `transform 900ms ${EASE_OUT} ${d}ms, opacity 450ms linear ${d}ms`
      s.style.transform = 'translateY(0)'
      s.style.opacity = '1'
    })
  }

  const showUp = (el: HTMLElement) => {
    el.dataset.done = '1'
    el.style.opacity = '1'
    el.style.transform = 'translateY(0)'
  }

  let revealIO: IntersectionObserver | undefined
  const setupReveals = () => {
    $$('[data-reveal="chars"]').forEach((el) => {
      splitChars(el)
      if (!el.dataset.done) hideChars(el)
    })
    $$('[data-reveal="up"]').forEach((el) => {
      if (el.dataset.done) return
      el.style.opacity = '0'
      if (!reduced) el.style.transform = 'translateY(22px)'
      el.style.transition = `opacity 760ms linear, transform 760ms ${EASE_SOFT}`
    })
    const io = observe(
      (entries) => {
        entries.forEach((e) => {
          const el = e.target as HTMLElement
          if (!e.isIntersecting || el.dataset.done) return
          // The hero heading waits for the loader to lift.
          if (el.dataset.hero !== undefined && !loaderLifted) return
          if (el.dataset.reveal === 'chars') revealChars(el)
          else showUp(el)
          io.unobserve(el)
        })
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.04 },
    )
    $$('[data-reveal]').forEach((el) => {
      if (!el.dataset.done) io.observe(el)
    })
    revealIO = io
  }

  /* ---------- scroll-linked word scrub ---------- */
  type Scrub = { el: HTMLElement; words: HTMLElement[] }
  const scrubs: Scrub[] = []
  const FLOOR = 0.16
  const setupScrub = () => {
    $$('[data-scrub]').forEach((el) => {
      if (!el.dataset.scrubReady) {
        el.dataset.scrubReady = '1'
        const words = (el.textContent || '').split(/(\s+)/)
        el.textContent = ''
        words.forEach((wd) => {
          if (!wd) return
          if (/^\s+$/.test(wd)) {
            el.appendChild(document.createTextNode(' '))
            return
          }
          const s = document.createElement('span')
          s.dataset.word = ''
          s.className = 'scrub-word'
          s.textContent = wd
          el.appendChild(s)
        })
      }
      const list = $$('[data-word]', el)
      list.forEach((s) => (s.style.opacity = reduced ? '1' : String(FLOOR)))
      scrubs.push({ el, words: list })
    })
  }

  const tickScrub = () => {
    if (reduced) return
    const vh = window.innerHeight
    scrubs.forEach(({ el, words }) => {
      const r = el.getBoundingClientRect()
      if (r.height === 0 || r.bottom < -80 || r.top > vh + 80) return
      const p = Math.max(0, Math.min(1, (vh * 0.84 - r.top) / (r.height + vh * 0.22)))
      const reveal = p * (words.length + 10)
      words.forEach((w, i) => {
        const t = Math.max(0, Math.min(1, (reveal - i) / 10))
        w.style.opacity = String(FLOOR + (1 - FLOOR) * t)
      })
    })
  }

  /* ---------- blur-to-sharp media ---------- */
  let mediaIO: IntersectionObserver | undefined
  const showMedia = (el: HTMLElement) => {
    el.dataset.shown = '1'
    el.style.filter = MEDIA_SHOWN
    el.style.transform = 'scale(1)'
    el.style.opacity = '1'
  }
  const setupMedia = () => {
    const io = observe(
      (entries) => {
        entries.forEach((e) => {
          const el = e.target as HTMLElement
          if (!e.isIntersecting || el.dataset.shown) return
          el.style.transition = `filter 1100ms ${EASE_OUT}, transform 1100ms ${EASE_OUT}, opacity 700ms linear`
          showMedia(el)
          io.unobserve(el)
        })
      },
      { rootMargin: '0px 0px -6% 0px', threshold: 0.03 },
    )
    $$('[data-media]').forEach((el) => {
      if (el.dataset.shown) return
      el.style.filter = reduced ? 'grayscale(1) contrast(1.04)' : 'grayscale(1) contrast(1.04) blur(18px)'
      if (!reduced) el.style.transform = 'scale(1.06)'
      el.style.opacity = '0.001'
      io.observe(el)
    })
    mediaIO = io
  }

  /* ---------- horizontal scroller + cursor chip ---------- */
  let chip: HTMLDivElement | null = null
  let syncRail = () => {}
  const setupScroller = () => {
    const rail = $('[data-hscroll]')
    if (!rail) return

    chip = document.createElement('div')
    chip.className = 'cursor-chip'
    chip.setAttribute('aria-hidden', 'true')
    chip.textContent = 'View'
    document.body.appendChild(chip)
    const c = chip
    let tx = 0, ty = 0, cx = 0, cy = 0, hovering = false
    const loop = () => {
      cx += (tx - cx) * 0.14
      cy += (ty - cy) * 0.14
      c.style.transform = `translate3d(${cx + 16}px,${cy + 16}px,0) scale(${hovering ? 1 : 0.9})`
      frame(loop)
    }
    loop()

    // Pinned: the section is as tall as the rail's overflow, so every pixel of
    // page scroll inside it moves the rail one pixel sideways. Page scroll is
    // the single source of truth; drags, swipes and focus moves on the rail
    // are converted back into page scroll. Reduced motion keeps a plain rail;
    // phones get a vertical list (site.css), so pinning only runs when wide.
    const work = rail.closest<HTMLElement>('[data-work]')
    const pin = work && $('[data-work-pin]', work)
    const canPin = !!work && !!pin && !reduced
    const wide = window.matchMedia('(min-width: 641px)')
    let pinned = false
    let railMax = 0
    let railSet = 0
    const railTop = () => (work ? work.getBoundingClientRect().top + window.scrollY : 0)

    if (canPin) {
      const measure = () => {
        pinned = wide.matches
        work.classList.toggle('is-pinned', pinned)
        if (!pinned) {
          work.style.removeProperty('--pin-height')
          return
        }
        if (!rail.clientWidth) return
        railMax = Math.max(0, rail.scrollWidth - rail.clientWidth)
        const h = `${Math.round(pin.offsetHeight + railMax)}px`
        if (work.style.getPropertyValue('--pin-height') !== h) work.style.setProperty('--pin-height', h)
        syncRail()
      }
      syncRail = () => {
        if (!pinned || !rail.clientWidth) return
        const x = Math.max(0, Math.min(railMax, -work.getBoundingClientRect().top))
        rail.scrollLeft = x
        railSet = rail.scrollLeft
      }
      const ro = new ResizeObserver(measure)
      ro.observe(rail)
      signal.addEventListener('abort', () => ro.disconnect())
      on(window, 'resize', measure, { passive: true })
      on(wide, 'change', measure)
      measure()

      // Anything that moved the rail without page scroll (drag, focus) wins.
      on(rail, 'scroll', () => {
        if (!pinned || Math.abs(rail.scrollLeft - railSet) < 1) return
        window.scrollTo(0, railTop() + rail.scrollLeft)
      }, { passive: true })

      // The browser won't reliably reveal a clipped card on Tab; scroll the
      // page to the spot that brings it fully into view.
      on(rail, 'focusin', (e: FocusEvent) => {
        if (!pinned) return
        const card = (e.target as HTMLElement).closest<HTMLElement>('[data-card]')
        if (!card) return
        const r = card.getBoundingClientRect()
        const box = rail.getBoundingClientRect()
        const pad = parseFloat(getComputedStyle(rail).paddingLeft) || 0
        let x = rail.scrollLeft
        if (r.left < box.left + pad) x += r.left - box.left - pad
        else if (r.right > box.right - pad) x += r.right - box.right + pad
        else return
        x = Math.max(0, Math.min(railMax, x))
        window.scrollTo(0, railTop() + x)
      })
    }

    on(
      rail,
      'wheel',
      (e: WheelEvent) => {
        if (pinned) {
          // Sideways trackpad swipes scroll the page through the section too.
          if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return
          e.preventDefault()
          window.scrollBy(0, e.deltaX)
          return
        }
        if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return
        const before = rail.scrollLeft
        rail.scrollLeft += e.deltaY
        if (rail.scrollLeft !== before) e.preventDefault()
      },
      { passive: false },
    )

    let down = false, sx = 0, sl = 0, moved = 0
    on(rail, 'pointerdown', (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      down = true
      moved = 0
      sx = e.clientX
      sl = rail.scrollLeft
      rail.style.cursor = 'grabbing'
    })
    on(rail, 'pointermove', (e: PointerEvent) => {
      tx = e.clientX
      ty = e.clientY
      if (!down) return
      const d = e.clientX - sx
      moved = Math.abs(d)
      rail.scrollLeft = sl - d
    })
    const up = () => {
      down = false
      rail.style.cursor = ''
    }
    on(rail, 'pointerup', up)
    on(rail, 'pointerleave', () => {
      up()
      hovering = false
      c.style.opacity = '0'
    })
    // Swallow image drag ghosts so mouse-drag scrolls instead.
    on(rail, 'dragstart', (e: DragEvent) => e.preventDefault())

    $$('[data-card]').forEach((card) => {
      on(card, 'pointerenter', (e: PointerEvent) => {
        if (e.pointerType !== 'mouse') return
        tx = e.clientX
        ty = e.clientY
        if (!hovering) {
          cx = tx
          cy = ty
        }
        hovering = true
        c.style.opacity = '1'
        c.textContent = card.dataset.chip || 'View'
      })
      // A drag that ends on a card must not count as a click.
      on(card, 'click', (e: MouseEvent) => {
        if (moved > 6) {
          e.preventDefault()
          e.stopImmediatePropagation()
        }
      }, { capture: true })
    })
  }

  /* ---------- magnetic links ---------- */
  const setupMagnets = () => {
    $$('[data-magnet]').forEach((el) => {
      let bar = $('[data-magnet-bar]', el)
      if (!bar) {
        bar = document.createElement('span')
        bar.dataset.magnetBar = ''
        bar.className = 'magnet-bar'
        bar.setAttribute('aria-hidden', 'true')
        el.appendChild(bar)
      }
      const b = bar
      on(el, 'pointerenter', () => {
        b.style.transformOrigin = 'left center'
        b.style.transform = 'scaleX(1)'
      })
      on(el, 'pointermove', (e: PointerEvent) => {
        if (reduced || e.pointerType !== 'mouse') return
        const r = el.getBoundingClientRect()
        const dx = (e.clientX - (r.left + r.width / 2)) * 0.18
        const dy = (e.clientY - (r.top + r.height / 2)) * 0.18
        el.style.transition = 'transform 120ms linear'
        el.style.transform = `translate(${dx}px,${dy}px)`
      })
      on(el, 'pointerleave', () => {
        b.style.transformOrigin = 'right center'
        b.style.transform = 'scaleX(0)'
        el.style.transition = `transform 340ms ${EASE_SOFT}`
        el.style.transform = 'translate(0,0)'
      })
    })
  }

  /* ---------- mono scramble ---------- */
  // Scrambles only the element's own text node so the magnet bar survives.
  const textNodeOf = (el: HTMLElement) =>
    Array.from(el.childNodes).find((n) => n.nodeType === Node.TEXT_NODE && n.textContent?.trim()) as Text | undefined

  const scramble = (el: HTMLElement) => {
    const node = textNodeOf(el)
    if (!node) return
    const target = el.dataset.scrambleText || node.textContent || ''
    el.dataset.scrambleText = target
    const prev = scrambling.get(el)
    if (prev) clearInterval(prev)
    let n = 0
    const total = 13
    const id = window.setInterval(() => {
      n++
      const settled = Math.floor((n / total) * target.length)
      let out = ''
      for (let i = 0; i < target.length; i++) {
        const ch = target[i]
        out += i < settled || ch === ' ' ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
      }
      node.textContent = out
      if (n >= total) {
        clearInterval(id)
        scrambling.delete(el)
        node.textContent = target
      }
    }, 30)
    scrambling.set(el, id)
  }

  const setupScramble = () => {
    $$('[data-scramble]').forEach((el) => {
      el.dataset.scrambleText = textNodeOf(el)?.textContent || ''
      const host = el.closest('a') || el
      on(host, 'pointerenter', () => {
        if (!reduced) scramble(el)
      })
    })
  }

  /* ---------- section counter ---------- */
  const setupCounter = () => {
    const num = $('[data-counter]')
    const label = $('[data-counter-label]')
    if (!num) return
    const io = observe(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return
          const target = e.target as HTMLElement
          const host = target.closest<HTMLElement>('[data-view]')
          if (host && host.dataset.view !== view) return
          const n = target.dataset.section || ''
          const text = target.dataset.sectionLabel || ''
          // Views share section numbers, so compare the label too.
          if (num.textContent === n && (!label || label.textContent === text)) return
          num.style.transition = `transform 190ms ${EASE_SOFT}, opacity 190ms linear`
          num.style.transform = 'translateY(-110%)'
          num.style.opacity = '0'
          later(() => {
            num.textContent = n
            if (label) label.textContent = text
            num.style.transition = 'none'
            num.style.transform = 'translateY(110%)'
            frame(() => {
              num.style.transition = `transform 380ms ${EASE_SOFT}, opacity 380ms linear`
              num.style.transform = 'translateY(0)'
              num.style.opacity = '1'
            })
          }, 190)
        })
      },
      { threshold: 0.01, rootMargin: '-45% 0px -45% 0px' },
    )
    $$('[data-section]').forEach((s) => io.observe(s))
  }

  /* ---------- scroll: progress, marquee speed, parallax, scrub ---------- */
  // Marquee tightens from 38s to 26s per loop while scrolling. Changing
  // animation-duration mid-flight re-maps progress and makes the track jump,
  // so ease the animation's playbackRate instead (position is preserved).
  const FAST_RATE = 38 / 26
  let lastY = 0
  let lastScrollAt = 0
  let marqueeRate = 1
  let marqueeRaf: number | null = null
  const setRate = (anim: Animation, rate: number) => {
    if (typeof anim.updatePlaybackRate === 'function') anim.updatePlaybackRate(rate)
    else anim.playbackRate = rate
  }
  const easeMarquee = () => {
    marqueeRaf = null
    const anim = $('[data-marquee]')?.getAnimations()[0]
    if (!anim) return
    const target = performance.now() - lastScrollAt < 160 ? FAST_RATE : 1
    marqueeRate += (target - marqueeRate) * 0.08
    if (Math.abs(target - marqueeRate) < 0.005) marqueeRate = target
    setRate(anim, marqueeRate)
    if (marqueeRate !== 1) marqueeRaf = frame(easeMarquee)
  }

  const onScroll = () => {
    const bar = $('[data-progress]')
    if (bar) {
      const h = document.documentElement.scrollHeight - window.innerHeight
      bar.style.transform = `scaleX(${h > 0 ? Math.min(1, window.scrollY / h) : 0})`
    }
    const dy = Math.abs(window.scrollY - lastY)
    lastY = window.scrollY
    if (dy > 4 && !reduced) {
      lastScrollAt = performance.now()
      if (marqueeRaf == null) marqueeRaf = frame(easeMarquee)
    }
    const host = $('[data-fullbleed]')
    const fb = host && $('[data-media]', host)
    if (host && fb && !reduced && fb.dataset.shown) {
      const r = host.getBoundingClientRect()
      if (r.bottom > 0 && r.top < window.innerHeight) fb.style.transform = `scale(1.06) translateY(${r.top * -0.08}px)`
    }
    syncRail()
    tickScrub()
  }
  const setupScroll = () => {
    on(window, 'scroll', onScroll, { passive: true })
    on(window, 'resize', onScroll, { passive: true })
    onScroll()
  }

  /* ---------- smoothed wheel scrolling ---------- */
  // Wheel and trackpad input sets a target; the page eases toward it. Mouse /
  // trackpad devices only — touch keeps native momentum, reduced motion skips
  // it. Any scroll we didn't cause (keyboard, scrollbar, scrollTo from routing
  // or the pinned rail) resyncs the target, so nothing else has to know.
  const setupSmoothScroll = () => {
    if (reduced || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    const EASE = 0.1 // share of the remaining distance covered per 60fps frame
    let target = window.scrollY
    let current = window.scrollY
    let last = 0
    let raf: number | null = null
    const maxY = () => document.documentElement.scrollHeight - window.innerHeight

    // Leave wheel input alone over anything that scrolls on its own.
    const ownScroller = (el: Element | null, dy: number) => {
      for (; el && el !== document.body; el = el.parentElement) {
        const oy = getComputedStyle(el).overflowY
        if ((oy === 'auto' || oy === 'scroll') && el.scrollHeight > el.clientHeight) {
          if (dy < 0 ? el.scrollTop > 0 : el.scrollTop + el.clientHeight < el.scrollHeight) return true
        }
      }
      return false
    }

    const step = (now: number) => {
      const dt = last ? Math.min(64, now - last) : 16.7
      last = now
      current += (target - current) * (1 - Math.pow(1 - EASE, dt / 16.7))
      if (Math.abs(target - current) < 0.5) current = target
      window.scrollTo(0, current)
      raf = current === target ? null : frame(step)
    }

    on(
      window,
      'wheel',
      (e: WheelEvent) => {
        if (e.defaultPrevented || e.ctrlKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return
        let dy = e.deltaY
        if (e.deltaMode === 1) dy *= 16
        else if (e.deltaMode === 2) dy *= window.innerHeight
        if (ownScroller(e.target as Element, dy)) return
        e.preventDefault()
        if (raf == null) {
          current = window.scrollY
          target = current
          last = 0
        }
        target = Math.max(0, Math.min(maxY(), target + dy))
        if (raf == null) raf = frame(step)
      },
      { passive: false },
    )

    on(
      window,
      'scroll',
      () => {
        // Someone else moved the page: drop our animation and adopt their position.
        if (Math.abs(window.scrollY - Math.round(current)) > 2) {
          cancelFrame(raf)
          raf = null
          current = target = window.scrollY
        }
      },
      { passive: true },
    )
  }

  /* ---------- loader ---------- */
  let loaderLifted = false
  let loaderRaf: number | null = null
  let loaderCap: number | null = null

  const runLoader = () => {
    const loader = $('[data-loader]')
    if (!loader) return
    // The CSS fallback animation would pin the panel off-screen on replay.
    loader.style.animation = 'none'
    if (reduced || opts.loader === false) {
      loader.style.display = 'none'
      loaderLifted = true
      playHero()
      return
    }
    loaderLifted = false
    const lines = $$('[data-loader-line]', loader)
    const count = $('[data-loader-count]', loader)
    const bar = $('[data-loader-bar]', loader)
    const status = $('[data-loader-status]', loader)
    if (status) status.textContent = 'Indexing archive'
    loader.style.display = 'flex'
    loader.style.pointerEvents = 'auto'
    loader.style.transition = 'none'
    loader.style.transform = 'translateY(0)'
    lines.forEach((l, i) => {
      l.style.transition = 'none'
      l.style.transform = 'translateY(105%)'
      void l.offsetHeight
      later(() => {
        l.style.transition = `transform 900ms ${EASE_OUT}`
        l.style.transform = 'translateY(0)'
      }, 120 + i * 130)
    })
    const DUR = 1500
    const t0 = performance.now()
    const tick = (now: number) => {
      const p = Math.min(1, Math.max(0, (now - t0) / DUR))
      const n = Math.round(p * 100)
      if (count) count.textContent = String(n).padStart(3, '0')
      if (bar) bar.style.transform = `scaleX(${n / 100})`
      if (status && n > 62) status.textContent = 'Loading selected work'
      if (p < 1) loaderRaf = frame(tick)
      else later(liftLoader, 240)
    }
    cancelFrame(loaderRaf)
    loaderRaf = frame(tick)
    cancelLater(loaderCap)
    // Background tabs throttle rAF; never hold the page hostage.
    loaderCap = later(liftLoader, 2600)
  }

  const liftLoader = () => {
    const loader = $('[data-loader]')
    if (!loader || loaderLifted) return
    loaderLifted = true
    cancelFrame(loaderRaf)
    cancelLater(loaderCap)
    loaderRaf = loaderCap = null
    const count = $('[data-loader-count]', loader)
    const bar = $('[data-loader-bar]', loader)
    if (count) count.textContent = '100'
    if (bar) bar.style.transform = 'scaleX(1)'
    loader.style.transition = `transform 900ms ${EASE_CURTAIN}`
    loader.style.transform = 'translateY(-100%)'
    loader.style.pointerEvents = 'none'
    later(() => {
      if (loaderLifted) loader.style.display = 'none'
    }, 950)
    playHero()
  }

  const playHero = () => {
    const h = $<HTMLElement>('[data-reveal="chars"]', activeView() || root)
    if (h) {
      revealIO?.unobserve(h)
      revealChars(h)
    }
    onScroll()
  }

  /* ---------- routing + curtain ---------- */
  const markNav = () => {
    $$('[data-nav] [data-go]').forEach((a) => {
      const matches = (a.dataset.matches || a.dataset.go || '').split(' ')
      if (matches.includes(view)) a.setAttribute('aria-current', 'page')
      else a.removeAttribute('aria-current')
    })
  }

  const showView = (next: View, replay: boolean, anchor?: HTMLElement) => {
    view = next
    $$('[data-view]').forEach((v) => {
      v.hidden = v.dataset.view !== next
    })
    markNav()
    if (anchor) anchor.scrollIntoView({ block: 'start' })
    else window.scrollTo(0, 0)
    const active = activeView()
    if (active && replay) {
      $$('[data-reveal="chars"]', active).forEach((el) => {
        revealIO?.unobserve(el)
        hideChars(el)
        if (!reduced) (charMap.get(el) || []).forEach((s) => (s.style.opacity = '1'))
        frame(() => frame(() => revealChars(el)))
      })
      $$('[data-reveal="up"]', active).forEach((el) => {
        revealIO?.unobserve(el)
        showUp(el)
      })
      $$('[data-media]', active).forEach((el) => {
        mediaIO?.unobserve(el)
        showMedia(el)
      })
    }
    if (chip) chip.style.opacity = '0'
    onScroll()
  }

  const go = (next: View, push: boolean, anchor?: HTMLElement) => {
    if (next === view) {
      window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' })
      return
    }
    if (push) history.pushState(null, '', next === 'home' ? window.location.pathname : '#' + next)
    const curtain = $('[data-curtain]')
    if (!curtain || reduced) {
      showView(next, true, anchor)
      return
    }
    curtain.style.transition = `transform 560ms ${EASE_CURTAIN}`
    curtain.style.transformOrigin = 'bottom'
    curtain.style.transform = 'scaleY(1)'
    later(() => {
      showView(next, true, anchor)
      curtain.style.transformOrigin = 'top'
      curtain.style.transform = 'scaleY(0)'
    }, 580)
  }

  const setupNav = () => {
    // Section jumps (e.g. WPA page → live demo). If the section lives in
    // another view, swap to that view first, then land on the section.
    $$('[data-scroll-to]').forEach((el) => {
      on(el, 'click', (e: MouseEvent) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
        const target = document.getElementById(el.dataset.scrollTo || '')
        if (!target) return
        e.preventDefault()
        const host = target.closest<HTMLElement>('[data-view]')?.dataset.view as View | undefined
        if (host && host !== view) go(host, true, target)
        else target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
      })
    })
    // Section links keep data-go only for nav highlighting; the handler above routes them.
    $$('[data-go]:not([data-scroll-to])').forEach((el) => {
      on(el, 'click', (e: MouseEvent) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
        e.preventDefault()
        go(el.dataset.go as View, true)
      })
    })
    on(window, 'popstate', () => go(viewFromHash(), false))
    const initial = viewFromHash()
    if (initial !== 'home') showView(initial, false)
    else markNav()
  }

  /* ---------- collapsible nav (phones) ---------- */
  const setupMenu = () => {
    const hdr = $('[data-hdr]')
    const btn = $<HTMLButtonElement>('[data-menu-toggle]')
    const nav = $('[data-nav]')
    const label = $('[data-menu-label]')
    if (!hdr || !btn || !nav) return
    hdr.classList.add('has-menu')
    const narrow = window.matchMedia('(max-width: 640px)')
    const setOpen = (open: boolean) => {
      hdr.classList.toggle('is-open', open)
      btn.setAttribute('aria-expanded', String(open))
      if (label) label.textContent = open ? 'Close' : 'Menu'
    }
    on(btn, 'click', () => setOpen(!hdr.classList.contains('is-open')))
    // Picking a destination closes the menu; the curtain covers the swap.
    $$('a', nav).forEach((a) => on(a, 'click', () => setOpen(false)))
    on(document, 'keydown', (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || !hdr.classList.contains('is-open')) return
      setOpen(false)
      btn.focus()
    })
    on(document, 'pointerdown', (e: PointerEvent) => {
      if (hdr.classList.contains('is-open') && !hdr.contains(e.target as Node)) setOpen(false)
    })
    on(narrow, 'change', () => setOpen(false))
  }

  /* ---------- Ask the Archive demo ---------- */
  const setupRag = () => {
    const input = $<HTMLInputElement>('[data-rag-input]')
    const chunksEl = $('[data-rag-chunks]')
    const answerEl = $('[data-rag-answer]')
    const caret = $('[data-rag-caret]')
    const metaEl = $('[data-rag-meta]')
    const countEl = $('[data-rag-count]')
    if (!input || !chunksEl || !answerEl) return
    let typing: number | null = null

    const setAnswer = (text: string, withCaret: boolean) => {
      answerEl.textContent = text
      if (caret) {
        caret.hidden = !withCaret
        answerEl.appendChild(caret)
      }
    }

    // Every query returns the labeled sample state until the live corpus
    // (Vertex AI RAG Engine) is wired in here.
    const run = () => {
      const entry = ARCHIVE_SAMPLE
      cancelLater(typing)
      chunksEl.textContent = ''
      setAnswer('', true)
      if (metaEl) metaEl.textContent = ''
      if (countEl) countEl.textContent = `${entry.chunks.length} · sample`

      entry.chunks.forEach((c, i) => {
        const row = document.createElement('div')
        row.className = 'rag-chunk'
        row.style.transitionDelay = `${i * 70}ms`
        const head = document.createElement('div')
        head.className = 'rag-chunk-head'
        const left = document.createElement('span')
        left.textContent = `[${i + 1}] ${c.src} · ${c.meta}`
        const right = document.createElement('span')
        right.className = 'rag-chunk-score'
        right.textContent = c.score
        head.append(left, right)
        const body = document.createElement('div')
        body.className = 'rag-chunk-body'
        body.textContent = c.text
        row.append(head, body)
        chunksEl.appendChild(row)
        frame(() => frame(() => row.classList.add('is-in')))
      })

      if (reduced) {
        setAnswer(entry.answer, false)
        if (metaEl) metaEl.textContent = entry.meta
        return
      }
      let i = 0
      const step = () => {
        i += 2
        setAnswer(entry.answer.slice(0, i), true)
        if (i < entry.answer.length) typing = later(step, 28)
        else {
          setAnswer(entry.answer, false)
          if (metaEl) metaEl.textContent = entry.meta
        }
      }
      typing = later(step, 300 + entry.chunks.length * 70)
    }

    $$('[data-rag-preset]').forEach((btn) => {
      on(btn, 'click', () => {
        input.value = btn.dataset.ragPreset || ''
        run()
      })
    })
    const form = input.closest('form')
    if (form)
      on(form, 'submit', (e: SubmitEvent) => {
        e.preventDefault()
        if (input.value.trim()) run()
      })
  }

  const steps: [string, () => void][] = [
    ['grain', setupGrain],
    ['reveals', setupReveals],
    ['scrub', setupScrub],
    ['media', setupMedia],
    ['scroller', setupScroller],
    ['magnets', setupMagnets],
    ['scramble', setupScramble],
    ['counter', setupCounter],
    ['nav', setupNav],
    ['menu', setupMenu],
    ['rag', setupRag],
    ['scroll', setupScroll],
    ['smooth scroll', setupSmoothScroll],
    ['loader', runLoader],
  ]
  steps.forEach(([name, fn]) => {
    try {
      fn()
    } catch (err) {
      console.error(`[motion] ${name} failed:`, err)
    }
  })
  // Fail-safe: whatever happens, the loader never stays down.
  later(liftLoader, 4200)

  return () => {
    ac.abort()
    timers.forEach((id) => clearTimeout(id))
    scrambling.forEach((id) => clearInterval(id))
    frames.forEach((id) => cancelAnimationFrame(id))
    observers.forEach((io) => io.disconnect())
    chip?.remove()
  }
}
