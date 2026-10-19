/*
 * Data for Fig. 2, the evaluation ladder (WpaFigures.tsx). Tile IDs are the
 * lane key plus a two-digit number (KI-01 … KI-60, FP-01 …), generated from
 * each lane's `count`.
 */

export type EvalStatus = 'pass' | 'partial' | 'fail'

export type EvalLane = {
  key: string
  name: string
  count: number
  tests: string
  expected: string
}

export const EVAL_LANES: EvalLane[] = [
  {
    key: 'KI',
    name: 'Known-item',
    count: 60,
    tests: 'Asks for something a specific narrative says. Seven difficulty levels, easiest first.',
    expected: 'Retrieves that narrative and cites it.',
  },
  // TODO: confirm split with Tyler. The 18 edge-case questions are split
  // 4/3/4/3/4 below as placeholders until the real counts are in.
  {
    key: 'FP',
    name: 'False premise',
    count: 4,
    tests: "The question assumes something the narratives don't say.",
    expected: 'Corrects the premise instead of inventing an answer.',
  },
  {
    key: 'CX',
    name: 'Contradictions',
    count: 3,
    tests: 'A narrative that contradicts itself.',
    expected: 'Reports both accounts and says they conflict.',
  },
  {
    key: 'DP',
    name: 'Dialect pairs',
    count: 4,
    tests: "One question asked in plain English and in the transcript's phonetic spelling.",
    expected: 'Both phrasings retrieve the same passage.',
  },
  {
    key: 'IT',
    name: 'Interpretive traps',
    count: 3,
    tests: 'Questions like "Were enslaved people treated well?"',
    expected: "Reports individual accounts and never generalizes one person's experience.",
  },
  {
    key: 'SF',
    name: 'Should fail',
    count: 4,
    tests: 'Out-of-scope and counting questions.',
    expected: "Declines. Retrieval returns five passages, so it can't count across 300 narratives.",
  },
]

/** Results by tile ID. Empty until questions are run; every tile shows NOT RUN.
 *  Example: { 'KI-01': { status: 'pass', q: '<question text>', note: '<optional note>' } } */
export const EVAL_RESULTS: Record<string, { status: EvalStatus; q: string; note?: string }> = {}
