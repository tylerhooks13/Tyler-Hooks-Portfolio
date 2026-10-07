# Motion spec

Design-to-dev handoff for every animated effect on the portfolio. This used to live on the
site itself (the **Motion** page and the **Motion notes** toggle); it now lives here.

The implementation is in `components/site/motion.ts`. Where this doc and the code disagree,
treat this doc as the design intent and the code as what currently ships.

## Rules

- One accentless palette: ink, paper, and inversion do all the emphasis work.
- `prefers-reduced-motion` collapses every effect to a plain opacity fade; the loader is skipped.
- No effect exceeds 1100ms (the loader and the looping grain/marquee are the exceptions).
- Scroll is eased, never redirected: wheel/trackpad input glides to the same place native scroll would land (mouse and trackpad only; touch, keyboard and reduced motion stay native).

## Curves

| Token          | Value                         | Used for                                  |
| -------------- | ----------------------------- | ----------------------------------------- |
| `EASE_OUT`     | `cubic-bezier(.16,1,.3,1)`    | Reveals, media, full-bleed expand          |
| `EASE_SOFT`    | `cubic-bezier(.22,1,.36,1)`   | Hover/pointer effects, counter, retrieval |
| `EASE_CURTAIN` | `cubic-bezier(.76,0,.24,1)`   | Loader, curtain transition                |

## Effects

| Effect                   | Trigger                       | Transform                                                        | Duration     | Curve                          |
| ------------------------ | ----------------------------- | ---------------------------------------------------------------- | ------------ | ------------------------------ |
| Intro loader             | First paint                   | Counter 000→100, name lines rise 105%→0, panel lifts −100%       | 2100ms       | `(.76,0,.24,1)`                |
| Char mask reveal         | Enters 88% viewport           | `translateY(1.05em)` → 0, clipped by word box                    | 900ms        | `(.16,1,.3,1)` · 38ms stagger  |
| Word scrub               | Scroll position               | Per-word opacity .16 → 1, 10-word soft edge, scroll-linked       | scroll-bound | linear on progress             |
| Grain drift              | Always                        | Turbulence tile translates ±2% on a 4-step loop, multiply blend  | 7s loop      | `steps(4)`                     |
| Mono scramble            | Nav hover                     | Glyphs cycle random monospace chars, settle left to right        | 380ms        | 30ms frame step                |
| Hover invert             | Card / row hover              | Panel swaps to ink, text to paper, borders to 20% paper          | 450ms        | `ease`                         |
| Blur-to-sharp media      | Enters 92% viewport           | `blur(18px)` → 0, scale 1.06 → 1, grayscale held at 1            | 1100ms       | `(.16,1,.3,1)`                 |
| Cursor chip follow       | Card hover                    | Pointer position, 0.14 lerp per frame, scale .9 → 1              | 420ms in     | `(.22,1,.36,1)`                |
| Magnetic link            | Pointer within bounds         | Element translates 0.18× cursor offset, underline sweeps scaleX  | 340ms        | `(.22,1,.36,1)`                |
| Full-bleed expand        | Card → case study             | Media grows to 100vw / 70vh, then parallaxes at 0.92×            | 900ms        | `(.16,1,.3,1)`                 |
| Curtain transition       | Any nav change                | Ink panel scaleY 0→1 (bottom), swap, 1→0 (top)                   | 2 × 560ms    | `(.76,0,.24,1)`                |
| Counter tick             | Section crosses mid-viewport  | Digit exits −100%, re-enters +100% on a masked line              | 2 × 190ms    | `(.22,1,.36,1)`                |
| Smoothed scroll          | Wheel / trackpad (fine pointer) | Page eases toward the wheel target, 10% of remaining distance per frame | ~900ms settle | exponential ease-out           |
| Retrieval stagger → type | Query submitted               | Rows rise 12px at 70ms intervals, then answer types              | 28ms / 2ch   | `(.22,1,.36,1)` · linear type  |

## Per-section notes

These were the in-context annotations shown on the site when Motion notes was on.

| Where                                  | Note                                                                                                                                         |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Home · hero headline                   | Per-character mask reveal · 900ms · `cubic-bezier(.16,1,.3,1)` · 38ms stagger · runs after the loader lifts                                  |
| Home · marquee                         | Constant-velocity marquee · duplicated track · 38s linear · tightens to 26s while scrolling                                                  |
| Home · selected work scroller          | Horizontal scroller · wheel-Y maps to `scrollLeft` · card lifts `scale(1.012)` + shadow deepens · body inverts to ink on hover · cursor chip trails at 0.14 lerp |
| Home · Ask the Archive answer          | Retrieval rows stagger in at 70ms · answer types at 28ms/2 chars · caret blinks 1s `step-end` · source scores land with the row             |
| Project / case study · hero media      | Full-bleed expand · card media grows to 100vw over 900ms · media parallaxes 8% slower than scroll                                            |

## Storyboards

Frames at 0 / ⅓ / ⅔ / end, for the effects a table can't fully convey.

### Intro loader — 2100ms · `(.76,0,.24,1)`

| Time   | Frame                                                    |
| ------ | -------------------------------------------------------- |
| 000ms  | Ink field, counter at zero                               |
| 700ms  | Name line ("Tyler Hooks") rises from mask, bar tracks count |
| 1700ms | Count settles at 100, both lines set (name + role)       |
| 2100ms | Panel lifts, hero chars begin immediately                |

### Word scrub — scroll-bound · 10-word edge

Example line: *"I turn emerging technology into things people can test."*

| Progress | Frame                                        |
| -------- | -------------------------------------------- |
| p = 0    | All words at 16% ink                         |
| p = 0.35 | Leading edge inks, soft gradient behind      |
| p = 0.7  | Edge advances with scroll, reversible        |
| p = 1    | Full ink, paragraph read                     |

### Curtain transition — 2 × 560ms · `(.76,0,.24,1)`

| Time   | Frame                                           |
| ------ | ----------------------------------------------- |
| 000ms  | Outgoing view, curtain at `scaleY(0)`           |
| 560ms  | Full cover; DOM swaps, scroll resets            |
| 840ms  | Origin flips to top, curtain retracts up        |
| 1120ms | Headings replay their char reveal               |

### Retrieval stagger → answer type — 70ms rows · 28ms/2ch

| Time  | Frame                                  |
| ----- | -------------------------------------- |
| 000ms | Query sent, slots reserved             |
| 140ms | Chunks rise 12px in sequence           |
| 420ms | Evidence complete, answer types        |
| end   | Caret removed, source meta lands       |

## Where it lives in code

| Effect                     | `motion.ts`                         | Markup hook                     |
| -------------------------- | ----------------------------------- | ------------------------------- |
| Intro loader               | `runLoader`, `liftLoader`           | `[data-loader]`                 |
| Char mask reveal           | `splitChars`, `revealChars`, `setupReveals` | `[data-reveal="chars"]` |
| Word scrub                 | `setupScrub`                        | `[data-scrub]`                  |
| Grain drift                | `setupGrain`                        | `[data-grain]`                  |
| Mono scramble              | `scramble`, `setupScramble`         | `[data-scramble]`               |
| Blur-to-sharp media        | `setupMedia`                        | media slots                     |
| Horizontal scroller / chip | `setupScroller`                     | `.hscroll`                      |
| Magnetic link              | `setupMagnets`                      | `[data-magnet]`                 |
| Smoothed scroll            | `setupSmoothScroll`                 | window wheel                    |
| Marquee speed, parallax    | `setupScroll`                       | `[data-marquee]`, `[data-fullbleed]` |
| Curtain transition         | `go`, `showView`                    | `[data-curtain]`                |
| Counter tick               | `setupCounter`                      | `[data-counter]`                |
| Retrieval stagger → type   | `setupRag`                          | `[data-rag-*]`                  |

Loader on/off and grain strength are set by `MOTION` in `components/site/Site.tsx`.
