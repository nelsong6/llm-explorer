import type { PageDef } from './types';
import { colors } from '../colors';

export const PAGES: PageDef[] = [
  {
    id: 'overview',
    title: 'The Pipeline',
    subtitle: 'End-to-end overview',
    description: 'How text goes in and text comes out. The full journey from prompt to response, showing where each stage fits.',
    color: colors.accent.purple,
    order: 0,
  },
  {
    id: 'tokenization',
    title: 'Tokenization',
    subtitle: 'Text to numbers',
    description: 'Before the model sees anything, text gets chopped into tokens — not words, not characters, but something in between. This is where meaning starts being encoded.',
    color: colors.accent.blue,
    order: 1,
  },
  {
    id: 'embedding',
    title: 'Embedding',
    subtitle: 'Numbers to meaning-space',
    description: 'Each token becomes a high-dimensional vector. Similar meanings cluster together. This is the geometry of language — where "king" and "queen" are neighbors.',
    color: colors.accent.green,
    order: 2,
  },
  {
    id: 'attention',
    title: 'Attention',
    subtitle: 'Tokens looking at each other',
    description: 'The mechanism that lets every token decide how much to care about every other token. This is where context lives — where "bank" learns whether it means river or money.',
    color: colors.accent.orange,
    order: 3,
  },
  {
    id: 'feed-forward',
    title: 'Feed-Forward',
    subtitle: 'The transformation',
    description: 'After attention gathers context, feed-forward layers transform the representation. This is the "thinking" step — pattern matching, feature extraction, knowledge recall.',
    color: colors.accent.cyan,
    order: 4,
  },
  {
    id: 'sampling',
    title: 'Sampling',
    subtitle: 'The coin toss',
    description: 'The model outputs probabilities for every possible next token. Sampling picks one. This is the stochastic moment — the I Ching coin toss that makes each response unique.',
    color: colors.accent.red,
    order: 5,
  },
];
