/*
 * Data for Fig. 1, the dialect gap (WpaFigures.tsx). Static on purpose: the
 * figure never calls the archive API.
 *
 * - KEYWORD_VS_MEANING: the "Keyword vs meaning" tab. Real live-query output.
 *   Keyword matches are computed from `terms` at render time; meaning-mode
 *   highlights come from the hand-tagged `spans`.
 * - DIALECT_ROUND1: the "Round 1 pairs" and "One word, many spellings" tabs,
 *   from wpa-dialect-round1.json.
 *
 * Rules:
 * - Distances and results come from real retrieval runs only.
 * - Passage text is verbatim transcript; don't correct the spelling.
 * - The Haywood excerpt deliberately stops at "Hallelujah broke out--". The
 *   passage continues into a rhyme with a racial slur; don't extend it.
 */

import round1 from './wpa-dialect-round1.json'

export type DialectPassage = {
  who: string
  id: string
  part: string
  /** Cosine distance from the live corpus. */
  dist: string
  text: string
  /** Phrases highlighted in meaning mode. */
  spans: string[]
  gloss: string
}

export type DialectPreset = {
  q: string
  /** Literal search terms for keyword mode (case-insensitive). */
  terms: string[]
  kindLabel: string
  passages: DialectPassage[]
  kwCaption: string
  mnCaption: string
}

export const KEYWORD_VS_MEANING: DialectPreset = {
  q: 'How did people learn they were free?',
  terms: ['learn', 'free'],
  kindLabel: 'Live query · top 3 of 5 retrieved',
  passages: [
    {
      who: 'Julia Blanks',
      id: '420199',
      part: 'Part 1',
      dist: '0.372',
      text: '"I don\'t know when my mother was set free. My husband\'s marster\'s name was King. He was from Savannah, Georgia, but at the time was...',
      spans: ['set free'],
      gloss: 'MATCHED ON: set free',
    },
    {
      who: 'Felix Haywood',
      id: '420082',
      part: 'Part 2',
      dist: '0.384',
      text: '"The end of the war, it come jus\' like that--like you snap your fingers." "How did you know the end of the war had come?" asked the interviewer. "How did we know it! Hallelujah broke out--',
      spans: ['Hallelujah broke out', 'The end of the war'],
      gloss: 'MATCHED ON: hallelujah broke out ≈ learned they were free',
    },
    {
      who: 'John James',
      id: '420016',
      part: 'Part 2',
      dist: '0.391',
      text: "Him ring de bell and dat am sho' 'nough de liberty bell, 'cause him read from de long paper and say, 'You is slaves no more. You is free.'",
      spans: ['de long paper', 'You is slaves no more'],
      gloss: 'MATCHED ON: de long paper ≈ a proclamation',
    },
  ],
  kwCaption:
    'Keyword search catches two of these because they happen to say "free." It misses Felix Haywood, whose answer is "Hallelujah broke out." That passage shares no words with the question, and it ranked second by meaning.',
  mnCaption:
    'All three came back from one plain-English question. The numbers are cosine distances from the live corpus; lower is closer.',
}

export type DialectResult = {
  rank: number
  name: string
  id: string
  dist: number
  /** The concept's spellings found in this passage. */
  terms: string[]
  /** A slur-free sentence from the passage containing the concept. */
  snip: string | null
}

export type DialectVariant = {
  id: string
  kind: 'plain' | 'phonetic'
  q: string
  target_id: string
  results: DialectResult[]
}

export type DialectPair = {
  id: 'DP-01' | 'DP-02'
  label: string
  target: string
  concept: string
  variants: DialectVariant[]
}

export type DialectRound1 = {
  pairs: DialectPair[]
  spelling: {
    n_narratives: number
    master: { name: string; id: string; counts: Record<string, number>; main: string }[]
    /** From the narratives read so far. */
    patrol: { name: string; id: string; spelling: string }[]
    /** Seen in round 1 search results. */
    patrol_round1: { name: string; id: string; spelling: string }[]
  }
}

// JSON infers per-row `counts` shapes that don't widen to a Record on their own.
export const DIALECT_ROUND1 = round1 as unknown as DialectRound1

/** Captions, verbatim from the handoff. */
export const PAIR_CAPTIONS: Record<DialectPair['id'], string> = {
  'DP-01':
    'Neither phrasing reached Toby Jones. But both landed on the same narrators, and the plain question about "patrols" pulled passages that spell it "patter rolls" and "patters." Meaning crossed the spelling gap, just toward different narrators than I expected.',
  'DP-02':
    "Spelled the way the transcript spells it, the question found Lewis Jones at #1. In plain English it missed him; its top result was a different runaway, Albert Hill's balky horse. Relevant, but every plain result scored weaker than the phonetic version's weakest (0.457 vs 0.428).",
}

export const SPELLING_CAPTION =
  'Each narrative mostly sticks to one spelling of "master," and they disagree with each other. That points to the person transcribing, not the person speaking. Search has to treat all four as one word. Sample: the 18 narratives read so far; two patroller spellings come from round 1 search results.'

/** Column order for the "master" spellings. */
export const MASTER_SPELLINGS = ['massa', 'marse', 'marster', 'master']

/** "What's next": one concept asked three ways. Not yet run. */
export const NEXT_SOURCE = {
  who: 'Albert Hill',
  id: '420007',
  text: "“I heered to tie de rope on de balky hosses tail and run it ’twixt he legs and tie to de shaft. I done dat and puts some cuckleburrs on de rope, too.”",
}

export const NEXT_ROWS: { kind: string; rule: string; text: string; hl: string[] }[] = [
  {
    kind: 'Phonetic',
    rule: "Built from the narrator's own words",
    text: 'Who tie de rope on de balky hosses tail and puts cuckleburrs on de rope?',
    hl: ['de', 'hosses', 'cuckleburrs'],
  },
  {
    kind: 'Plain',
    rule: 'Identical except respelled words',
    text: 'Who tie the rope on the balky horses tail and puts cockleburs on the rope?',
    hl: ['the', 'horses', 'cockleburs'],
  },
  {
    kind: 'Paraphrase',
    rule: 'Same facts, neither set of words',
    text: 'Who describes a trick to get a stalled animal moving that backfired?',
    hl: [],
  },
]

export const NEXT_NOTE =
  'The plain version may differ from the phonetic one only in respelled words (highlighted), so any difference in results comes from spelling. Round 2 sorts each concept by gap type: phonetic spelling, period vocabulary, or grammar.'

export const NEXT_CAPTION =
  "Round 1's pairs didn't always describe the same details, so a difference in results couldn't be pinned on spelling alone. Round 2 fixes the wording first. Concepts come from a dialect inventory, built by reading the narratives in batches."
