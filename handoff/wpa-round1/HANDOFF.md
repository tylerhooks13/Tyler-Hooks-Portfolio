# Handoff: Texas WPA page, round 1 results

**For:** Claude Code, in Tyler's portfolio repo, branch `wpa-interactive-figures`
**Scope:** the `texas-wpa` page only. Update both interactive figures with real round 1 data, and update the page copy.
**Folder:** everything referenced here is in `handoff/wpa-round1/`.

```
handoff/wpa-round1/
  HANDOFF.md                      this file
  data/wpa-eval-round1.json       all 78 questions + round 1 results  → Fig. 2
  data/wpa-dialect-round1.json    dialect pairs + spelling tally       → Fig. 1
  reference/fig2-eval-set.dc.html working mockup of the new Fig. 2
  reference/fig1-dialect.dc.html  working mockup of the new Fig. 1
```

The reference files are Claude Design canvas files: the `<x-dc>` block is the layout, and the `renderVals()` class at the bottom holds all the logic. `{{hole}}`, `<sc-for>` and `<sc-if>` map directly to JSX. They're the source of truth for behavior and copy. Match the site's existing styles (`site.css`, `wpf-*` classes), not the mockups' inline styles.

---

## 0. Before you start

- The branch has a lot of uncommitted work (`WpaFigures.tsx`, `wpa-eval.ts`, `wpa-dialect-gap.ts`, `data.ts`, `CaseView.tsx`, …). **Ask Tyler to commit it first**, so this change is reviewable on its own.
- Move the two JSON files into `components/site/` (next to `archive-presets.json`) as `wpa-eval-round1.json` and `wpa-dialect-round1.json`, and import them.
- **Numbering:** on the site, the dialect figure is Fig. 1 and the eval set is Fig. 2. The mockups say "Fig. 2" and "Fig. 3"; ignore that and keep the site's numbering.

---

## 1. Fig. 2: the evaluation set (`EvalLadder` in `WpaFigures.tsx`, data in `wpa-eval.ts`)

### What changes
The ladder currently has placeholder lanes (FP 4 / CX 3 / DP 4 / IT 3 / SF 4) and empty results, so every tile says "Not run." Replace it with the real 78 questions and their round 1 results. Behavior per `reference/fig2-eval-set.dc.html`.

### Lanes (real split; replace `EVAL_LANES`)

| key | Name | Count | What it tests | A pass looks like |
|---|---|---|---|---|
| KI | Known-item | 60 | Asks about something one specific narrative says. | Finds that narrative and answers from it, with a citation. |
| TH | Thematic | 7 | Asks about a theme that runs across several narratives. | Brings back relevant accounts from several narrators and cites each one. |
| DP | Dialect pairs | 4 (shown as "2 pairs") | Asks the same thing twice: once in plain English, once in the transcript's phonetic spelling. | Both phrasings reach the same passages. |
| IT | Interpretive traps | 3 | Invites a sweeping generalization about slavery. | Reports individual accounts instead of one verdict. |
| SF | Should fail | 4 | Out of scope, or needs counting across the whole collection. | Says the passages can't answer it, instead of answering from general knowledge. |

False-premise and source-conflict questions are **not** separate lanes. They're known-item questions with a `tag`. They override "A pass looks like":
- `false-premise`: "Corrects the wrong fact instead of inventing an answer."
- `source-conflict`: "Reports both conflicting figures instead of picking one."

Known-item "What it tests" appends the level: `Level 5: The text describes it without naming it.`
Levels: 2 Same fact, different wording from the text · 3 The fact is buried mid- or late-narrative · 4 The text only says it in dialect · 5 The text describes it without naming it · 6 Needs facts from two parts of the narrative · 7 The question contains a wrong fact. (No level-1 questions exist; the band label should read **Level 2 → Level 7**.)

### Data: `wpa-eval-round1.json`, an array of 78
```ts
type EvalQuestion = {
  id: string            // KI-01…KI-60, TH-01…07, DP-01a/b, DP-02a/b, IT-01…03, SF-01…04
  lane: 'KI'|'TH'|'DP'|'IT'|'SF'
  lvl: number | null    // KI only
  tag: '' | 'false-premise' | 'source-conflict' | 'plain' | 'phonetic' | 'out-of-scope' | 'counting'
  q: string             // the question text
  targets: string[]     // narrator(s) the question was drafted from
  rank: number | null   // KI/DP: rank of the target in the top 5, null if missed
  found: number | null  // TH/IT: how many of `targets` came back
  expected: number|null // TH/IT: targets.length
  top: string[]         // the 5 narrators that came back, in order
  declined: boolean     // the answer said the passages didn't cover it
  ans: string | null    // the generated answer; null = withheld (see rules)
}
```

### Tiles (round 1 retrieval, not pass/fail)
- **KI and DP:** solid = target found at #1 · half-fill diagonal = found at #2–5 · dim outline = not in top 5. These are objective retrieval results.
- **TH, IT, SF:** dashed outline = "judged by the answer." There's no tile state for these until Tyler reviews the answers.
- Legend reads: `ROUND 1 RETRIEVAL: FOUND AT #1 · #2–5 · NOT IN TOP 5 · JUDGED BY THE ANSWER`.
- **Remove the `RUN OF 78` progress bar.** In its place, right-aligned: `AI-DRAFTED FROM 12 NARRATIVES / UNDER REVIEW AS I READ`.
- Title: **"78 questions, and what each one tests"** (Tyler approved).
- Default selection: `KI-04` (a false-premise question).

### Detail panel (everything per question): three columns
1. **ID** (display type) · lane name · `LEVEL n · TAG LABEL` · a small boxed label `AI-DRAFTED · UNDER REVIEW`.
2. **The question in quotes** → `WHAT IT TESTS` → `A PASS LOOKS LIKE`.
3. `ROUND 1 · NOT YET REVIEWED`, then:
   - a retrieval line:
     - KI/DP: `Found {target} at #{rank}.` or `{target} was not in the top 5.`
     - SF: `The answer declined.` or `The answer did not clearly decline.`
     - TH/IT: `Of the narratives this question was drafted from, {found} of {expected} came back. Others may be just as relevant.`
   - `CAME BACK:` the de-duplicated `top` names, comma-separated
   - `ANSWER`, then the answer text in a scrollable block. If `ans` is null: *"Not shown here: the answer quotes a period slur from its source passage."*

Mobile (≤600px): the 20-column grid drops to 10, edge lanes stack, and the detail panel becomes one column.

---

## 2. Fig. 1: the dialect gap (`DialectGap` in `WpaFigures.tsx`, data in `wpa-dialect-gap.ts`)

### What changes
Fig. 1 becomes a tabbed figure. **Keep the current keyword/meaning view** ("How did people learn they were free?"); it's real live-query data. **Remove the second preset** ("What were the masters called?"); the spellings tab replaces it. Add three tabs per `reference/fig1-dialect.dc.html`:

| Tab | Content |
|---|---|
| **Keyword vs meaning** | Existing view, with only the first preset. |
| **Round 1 pairs** | Pair chips: *Patrols* / *Runaway carriage*. Two columns, Plain English and Phonetic spelling, each showing its question and the real top 5. Per result: rank, narrator, distance, a `TARGET` badge if it's the target narrative, an `IN BOTH` badge if that narrator appears in the other column, and `SAYS: …` listing the concept's spellings found in that passage. Below: three stats (where each phrasing found the target · results using the concept's words, x/5 each · narrators in both lists). |
| **One word, many spellings** | "Master" in 16 of 18 narratives, in four columns by main spelling (massa 9 · marse 3 · marster 3 · master 1), narrator names under each, with mixed users noted, e.g. `William Byrd (also master ×3)`. Then "patrollers": each spelling as a chip with who used it. |
| **What's next** | The balky-horse example: the source quote (Albert Hill, #420007), then Phonetic / Plain / Paraphrase rows with the respelled words highlighted. Badge: `NOT YET RUN`. |

### Data: `wpa-dialect-round1.json`
```ts
{
  pairs: [{ id: 'DP-01'|'DP-02', label, target, concept,
            variants: [{ id, kind: 'plain'|'phonetic', q, target_id,
                         results: [{ rank, name, id, dist, terms: string[], snip: string|null }] }] }],
  spelling: { n_narratives: 18,
              master: [{ name, id, counts: Record<string, number>, main }],
              patrol: [{ name, id, spelling }],          // from the 18 narratives
              patrol_round1: [{ name, id, spelling }] }  // seen in round 1 results
}
```
`snip` is a slur-free sentence from the passage containing the concept. It isn't shown in the mockup, but it's available if you want an expandable excerpt.

### Captions (use verbatim)
- **Patrols:** "Neither phrasing reached Toby Jones. But both landed on the same narrators, and the plain question about "patrols" pulled passages that spell it "patter rolls" and "patters." Meaning crossed the spelling gap, just toward different narrators than I expected."
- **Runaway carriage:** "Spelled the way the transcript spells it, the question found Lewis Jones at #1. In plain English it missed him; its top result was a different runaway, Albert Hill's balky horse. Relevant, but every plain result scored weaker than the phonetic version's weakest (0.457 vs 0.428)."
- **Spellings:** "Each narrative mostly sticks to one spelling of "master," and they disagree with each other. That points to the person transcribing, not the person speaking. Search has to treat all four as one word. Sample: the 18 narratives read so far; two patroller spellings come from round 1 search results."
- **What's next:** "Round 1's pairs didn't always describe the same details, so a difference in results couldn't be pinned on spelling alone. Round 2 fixes the wording first. Concepts come from a dialect inventory, built by reading the narratives in batches."

---

## 3. Page copy (`texas-wpa` in `components/site/data.ts`)

Context, Facts and Approach 01–03 stay as they are. Changes:

### Challenge: replace the last sentence
> …The question this project tests: can semantic retrieval bridge that gap, and can the answer stay honest about where it came from? The first test run suggests the second part holds. The first is more complicated.

### New Approach 04 (it introduces the figures)
**Title:** Testing it
> Building the pipeline was the easy part. Knowing whether it works is harder, and that's where most of my time is going now.
>
> To start, I had AI draft 78 test questions from 12 narratives I'd read: questions about one specific narrative, at increasing difficulty; questions about themes that run across many; the same question in plain English and in phonetic spelling; questions that invite a sweeping generalization; and questions the system should refuse. The second figure shows what each one is testing.
>
> Those questions are a first draft, and I'm treating them that way. AI-written questions tend to borrow the source's wording, which makes them easier than they look, and a few already turned out to misread the passage they were based on. I'm reviewing them as I read through the narratives myself.

### Replace `outcome`
`outcome` is a single string today. Either let this page override the "Outcome" heading with **"Where it stands"**, or add an optional `sections?: { title: string; text: string }[]` to the page type and render the three sections below in place of Outcome, after the figures. Use whichever fits `CaseView.tsx` better.

**What the first run suggested**
> I ran all 78 through the same pipeline the demo uses. Nothing here is final, but a few patterns were hard to miss:
>
> - **It didn't make things up.** When retrieval missed, the answer said the passages didn't cover the question, rather than filling the gap. That held every time.
> - **Naming the narrator changed everything.** Questions that named the person almost always found them. Questions that only described what happened, which is how someone new to the collection would actually ask, found the right narrative about half the time.
> - **Dialect cut both ways.** Asking about "patrols" in plain English still reached passages that spell it "patter rolls." But asking about horses running off with a carriage missed Lewis Jones's story, and the same question in his spelling found it first.

**Questions I'm sitting with**
> - **Is the dialect really the narrator's?** In the 18 narratives I've read so far, "master" shows up as massa, marse, marster or master. Each narrative mostly sticks to one spelling, and they disagree with each other. That points to whoever transcribed the interview, which raises a question about what "searching the dialect" even means.
> - **How should the text be cut up?** Right now each narrative is split into 512-token pieces. Larger 1024-token pieces would keep more of a story together but blur separate moments into one. I want to compare the two on the same questions.
> - **What should every piece carry?** A narrator's name only appears at the top of their file, so most pieces don't know who's speaking. Adding it to every piece might fix the naming gap, or it might just hide it.

**What's next**
> I'm working through the narratives in batches, noting how dialect actually shows up: respelled everyday words, period vocabulary, and grammar. That review will reshape the test questions, especially the dialect pairs, so that a plain question and its phonetic twin ask exactly the same thing. This is a side project I'm learning through, so it'll move in steps. I'll update this page as it does.

### Reflection
Leave it. It already carries a `TODO: rewrite in Tyler's voice`.

### Comment in `data.ts`
Update the `interactiveFigures` comment to: `Fig. 1: the dialect gap (tabs). Fig. 2: the 78-question evaluation set with round 1 results.`

---

## 4. Rules

- **No network calls from either figure.** Static JSON only. The live demo is the only part of the site that touches Google Cloud.
- **Don't show pass/fail on answers.** Round 1 answers are unreviewed; the UI labels them that way. Retrieval rank is the only scored result shown.
- **Null `ans` stays withheld.** Those 7 answers quote a period slur from the source. Never fill them in from elsewhere.
- **Quotes and transcript text are verbatim.** Don't correct spellings.
- **Don't change the numbers.** The copy deliberately softens them ("about half the time"). Exact counts live in the figures.
- Accessibility: real `<button>`s, `aria-pressed` / `aria-selected` on toggles and tabs, an `aria-label` on every tile, `aria-live="polite"` on the detail panel, and visible focus.

## 5. Done when
- [ ] Fig. 2 shows all 78 questions in five real lanes; every tile opens its question, what it tests, pass condition, retrieval result, what came back, and the answer.
- [ ] The progress bar is gone, and the AI-drafted note is in place.
- [ ] Fig. 1 has four tabs; the "masters" preset is removed; the captions are verbatim.
- [ ] The page copy is updated per §3.
- [ ] Both figures work at 375px wide.
- [ ] `npm run build` and lint pass.
- [ ] Give Tyler a short summary of what changed. Don't commit unless he asks.
