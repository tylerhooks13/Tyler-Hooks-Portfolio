/*
 * Data for Fig. 2, the evaluation set (WpaFigures.tsx): the 78 test questions
 * and their round 1 results, from wpa-eval-round1.json. Static on purpose:
 * the figure never calls the archive API.
 *
 * Rules:
 * - Round 1 answers are unreviewed. The figure shows retrieval rank (KI, DP)
 *   as the only scored result, never pass/fail on an answer.
 * - A null `ans` stays withheld: those answers quote a period slur from the
 *   source passage. Never fill them in from elsewhere.
 * - Question and answer text is verbatim.
 */

import round1 from './wpa-eval-round1.json'

export type EvalLaneKey = 'KI' | 'TH' | 'DP' | 'IT' | 'SF'
export type EvalTag = '' | 'false-premise' | 'source-conflict' | 'plain' | 'phonetic' | 'out-of-scope' | 'counting'

export type EvalQuestion = {
  /** KI-01…KI-60, TH-01…07, DP-01a/b, DP-02a/b, IT-01…03, SF-01…04 */
  id: string
  lane: EvalLaneKey
  /** Known-item difficulty level; null for other lanes. */
  lvl: number | null
  tag: EvalTag
  q: string
  /** Narrator(s) the question was drafted from. */
  targets: string[]
  /** KI/DP: rank of the target in the top 5; null if missed. */
  rank: number | null
  /** TH/IT: how many of `targets` came back. */
  found: number | null
  /** TH/IT: targets.length. */
  expected: number | null
  /** The 5 narrators that came back, in order (may repeat). */
  top: string[]
  /** The answer said the passages didn't cover it. */
  declined: boolean
  /** The generated answer; null = withheld. */
  ans: string | null
}

export const EVAL_QUESTIONS = round1 as EvalQuestion[]

export type EvalLane = { key: EvalLaneKey; name: string; tests: string; pass: string }

export const EVAL_LANES: EvalLane[] = [
  {
    key: 'KI',
    name: 'Known-item',
    tests: 'Asks about something one specific narrative says.',
    pass: 'Finds that narrative and answers from it, with a citation.',
  },
  {
    key: 'TH',
    name: 'Thematic',
    tests: 'Asks about a theme that runs across several narratives.',
    pass: 'Brings back relevant accounts from several narrators and cites each one.',
  },
  {
    key: 'DP',
    name: 'Dialect pairs',
    tests: "Asks the same thing twice: once in plain English, once in the transcript's phonetic spelling.",
    pass: 'Both phrasings reach the same passages.',
  },
  {
    key: 'IT',
    name: 'Interpretive traps',
    tests: 'Invites a sweeping generalization about slavery.',
    pass: 'Reports individual accounts instead of one verdict.',
  },
  {
    key: 'SF',
    name: 'Should fail',
    tests: 'Out of scope, or needs counting across the whole collection.',
    pass: "Says the passages can't answer it, instead of answering from general knowledge.",
  },
]

/** Known-item difficulty. There are no level-1 questions in the set. */
export const EVAL_LEVELS: Record<number, string> = {
  2: 'Same fact, different wording from the text.',
  3: 'The fact is buried mid- or late-narrative.',
  4: 'The text only says it in dialect.',
  5: 'The text describes it without naming it.',
  6: 'Needs facts from two parts of the narrative.',
  7: 'The question contains a wrong fact.',
}

/** Tag labels; `pass` overrides the lane's pass condition. */
export const EVAL_TAGS: Record<Exclude<EvalTag, ''>, { label: string; pass?: string }> = {
  'false-premise': { label: 'False premise', pass: 'Corrects the wrong fact instead of inventing an answer.' },
  'source-conflict': { label: 'Source conflict', pass: 'Reports both conflicting figures instead of picking one.' },
  plain: { label: 'Plain English' },
  phonetic: { label: 'Phonetic spelling' },
  'out-of-scope': { label: 'Out of scope' },
  counting: { label: 'Counting' },
}
