/*
 * Data for Fig. 1, the dialect gap (WpaFigures.tsx). Static on purpose: the
 * figure never calls the archive API. Keyword matches are computed from
 * `terms` at render time; meaning-mode highlights come from the hand-tagged
 * `spans`.
 *
 * Rules for adding a preset:
 * - Distances and results come from real retrieval runs only. A pair that
 *   hasn't been run gets kind 'pair' and `dist: null`.
 * - Passage text is verbatim transcript; don't correct the spelling.
 * - The Haywood excerpt deliberately stops at "Hallelujah broke out--". The
 *   passage continues into a rhyme with a racial slur; don't extend it.
 */

export type DialectPassage = {
  who: string
  id: string
  part: string
  /** Cosine distance from the live corpus; null when not yet run. */
  dist: string | null
  text: string
  /** Phrases highlighted in meaning mode. */
  spans: string[]
  gloss: string
}

export type DialectPreset = {
  q: string
  /** Literal search terms for keyword mode (case-insensitive). */
  terms: string[]
  /** 'retrieved': real live-query output. 'pair': from the eval set, not yet run. */
  kind: 'retrieved' | 'pair'
  kindLabel: string
  passages: DialectPassage[]
  kwCaption: string
  mnCaption: string
}

export const DIALECT_PRESETS: DialectPreset[] = [
  {
    q: 'How did people learn they were free?',
    terms: ['learn', 'free'],
    kind: 'retrieved',
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
  },
  {
    q: 'What were the masters called?',
    terms: ['master'],
    kind: 'pair',
    kindLabel: 'Dialect pair · retrieval not yet tested',
    passages: [
      {
        who: 'Julia Blanks',
        id: '420199',
        part: 'Part 1',
        dist: null,
        text: "My husband's marster's name was King. He was from Savannah, Georgia, but at the time was...",
        spans: ['marster'],
        gloss: 'marster → master',
      },
      {
        who: 'John James',
        id: '420016',
        part: 'Part 2',
        dist: null,
        text: '"One day Massa Chapman call all us to de front gallery. Us didn\'t know what gwine to happen, \'cause it not ord\'nary to git called from de work.',
        spans: ['Massa'],
        gloss: 'massa → master',
      },
    ],
    kwCaption: 'Both passages name a master, and neither spells it "master." To a keyword index, they don\'t exist.',
    mnCaption:
      'Whether semantic search connects "marster" and "massa" to "master" is still a hypothesis. This pair is part of the eval set and hasn\'t been run yet.',
  },
]
