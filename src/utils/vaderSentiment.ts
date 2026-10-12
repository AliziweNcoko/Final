import { VaderScore, SentimentLabel } from '../types/sentiment';

/**
 * Valence Aware Dictionary for sEntiment Reasoning (VADER)
 * High-performance, social-media attuned sentiment analyzer
 * Augmented with TikTok vernacular, slang, and modern emoji valences.
 */

// Core lexicon valence values (-4.0 to +4.0)
const VADER_LEXICON: Record<string, number> = {
  // TikTok slang & social expressions
  slay: 3.4,
  ate: 3.1,
  rizz: 2.8,
  goat: 3.5,
  w: 2.6,
  win: 2.5,
  peak: 2.9,
  obsessed: 3.2,
  fire: 3.3,
  lit: 3.0,
  banger: 3.2,
  valid: 2.3,
  underrated: 2.4,
  clean: 2.1,
  iconic: 3.3,
  legendary: 3.6,
  queen: 2.7,
  king: 2.7,
  masterpiece: 3.7,
  cook: 2.5,
  cooking: 2.7,
  gem: 3.0,
  glowup: 2.9,

  // Negative TikTok slang
  mid: -1.9,
  flop: -2.8,
  l: -2.3,
  trash: -3.2,
  garbage: -3.3,
  scam: -3.6,
  rip: -1.8,
  ripoff: -3.5,
  cringe: -2.7,
  cringey: -2.6,
  cap: -2.4,
  overpriced: -2.8,
  overrated: -2.3,
  sus: -1.9,
  cooked: -2.4,
  delusional: -2.9,
  unhinged: -1.2,
  toxic: -3.2,
  fake: -2.8,
  clown: -2.5,
  yikes: -2.1,
  nah: -1.4,
  meh: -1.3,
  gross: -2.9,
  ew: -2.5,
  ruined: -3.0,

  // Standard VADER core words
  love: 3.2,
  loving: 3.1,
  loved: 3.0,
  great: 3.1,
  good: 1.9,
  awesome: 3.1,
  amazing: 3.4,
  excellent: 3.2,
  fantastic: 3.5,
  incredible: 3.4,
  beautiful: 2.9,
  best: 3.2,
  perfect: 3.3,
  happy: 2.7,
  favorite: 2.8,
  enjoy: 2.2,
  enjoyed: 2.2,
  cool: 1.8,
  nice: 1.8,
  brilliant: 3.0,
  stunning: 3.2,
  helpful: 2.3,
  worth: 2.1,
  recommend: 2.5,
  superb: 3.1,
  sweet: 2.0,

  bad: -2.5,
  terrible: -3.4,
  awful: -3.3,
  horrible: -3.4,
  hate: -3.3,
  hating: -3.2,
  worst: -3.5,
  poor: -1.9,
  disappointed: -2.6,
  disappointing: -2.5,
  waste: -2.9,
  useless: -2.8,
  broken: -2.3,
  failed: -2.4,
  boring: -2.0,
  annoying: -2.4,
  ugly: -2.6,
  ridiculous: -2.3,
  stupid: -2.7,
  dumb: -2.4,
  wrong: -1.8,
  sad: -2.1,
  angry: -2.8,
  mad: -2.4,
  upset: -2.2,
  hurt: -2.4,
  shame: -2.3,
  fault: -1.8,
  sucks: -2.7,
  suck: -2.6,
  pain: -2.4,
  loser: -2.9,
};

// Boosters (intensifiers and dampeners)
const BOOSTER_DICT: Record<string, number> = {
  absolutely: 0.293,
  amazingly: 0.293,
  awfully: 0.293,
  completely: 0.293,
  considerably: 0.293,
  decidedly: 0.293,
  deeply: 0.293,
  effing: 0.293,
  enormously: 0.293,
  entirely: 0.293,
  especially: 0.293,
  exceptionally: 0.293,
  extremely: 0.32,
  fabulously: 0.293,
  fully: 0.293,
  hugely: 0.293,
  incredibly: 0.32,
  insanely: 0.34,
  intensely: 0.293,
  majorly: 0.293,
  literally: 0.28,
  more: 0.15,
  most: 0.25,
  particularly: 0.293,
  purely: 0.293,
  quite: 0.18,
  really: 0.25,
  remarkably: 0.293,
  so: 0.25,
  substantially: 0.293,
  thoroughly: 0.293,
  totally: 0.293,
  tremendously: 0.293,
  unbelievably: 0.32,
  unusually: 0.293,
  utterly: 0.293,
  very: 0.293,
  way: 0.2,

  // Dampeners
  barely: -0.293,
  hardly: -0.293,
  just: -0.15,
  kinda: -0.18,
  kindof: -0.18,
  little: -0.15,
  marginally: -0.2,
  partly: -0.15,
  scarcely: -0.293,
  slightly: -0.2,
  somewhat: -0.18,
  sorta: -0.18,
};

// Negation terms
const NEGATIONS = new Set([
  'not',
  'never',
  'no',
  'neither',
  'nowhere',
  'hardly',
  'barely',
  'scarcely',
  'without',
  "isn't",
  "aren't",
  "wasn't",
  "weren't",
  "haven't",
  "hasn't",
  "hadn't",
  "won't",
  "wouldn't",
  "don't",
  "doesn't",
  "didn't",
  "can't",
  "couldn't",
  "shouldn't",
  "ain't",
  'aint',
  'cant',
  'dont',
  'wont',
  'isnt',
]);

// Emoji Valence Dictionary
const EMOJI_VALENCE: Record<string, number> = {
  '🔥': 3.2,
  '❤️': 3.4,
  '💖': 3.3,
  '😍': 3.5,
  '🥰': 3.3,
  '✨': 2.6,
  '👏': 2.7,
  '💯': 3.1,
  '👑': 3.0,
  '🤩': 3.4,
  '🙌': 2.8,
  '🎉': 2.9,
  '🥺': 1.8,
  '😭': 1.6, // in TikTok context, 😭 is overwhelmingly positive hysteria or crying laughing
  '💀': 0.8, // "dead laughing"
  '🤣': 2.5,
  '😂': 2.2,
  '👀': 0.4,

  '🤮': -3.6,
  '🤢': -3.3,
  '😡': -3.5,
  '🤬': -3.8,
  '👎': -3.0,
  '😤': -2.4,
  '🙄': -2.2,
  '🤡': -3.0,
  '💩': -3.1,
  '💔': -3.2,
  '🤦': -2.1,
  '🧢': -2.5,
};

export function analyzeVader(text: string): VaderScore {
  if (!text || text.trim().length === 0) {
    return {
      pos: 0,
      neu: 1,
      neg: 0,
      compound: 0,
      classification: 'neutral',
    };
  }

  // Tokenize preserving emojis and casing
  const words = text.match(/[\p{L}\p{N}'’]+|[^\s\p{L}\p{N}]/gu) || [];
  const sentiments: number[] = [];

  // Punctuation amplification (exclamation marks)
  const exclamationCount = Math.min((text.match(/!/g) || []).length, 4);
  const punctuationBoost = exclamationCount * 0.292;

  // Question mark uncertainty dampener
  const questionCount = (text.match(/\?/g) || []).length;

  for (let i = 0; i < words.length; i++) {
    const rawWord = words[i];
    const lowerWord = rawWord.toLowerCase();

    // Check Emoji
    if (EMOJI_VALENCE[rawWord]) {
      sentiments.push(EMOJI_VALENCE[rawWord]);
      continue;
    }

    let valence = VADER_LEXICON[lowerWord];
    if (valence === undefined) continue;

    // Check ALL CAPS bonus
    const isAllCaps = rawWord.length > 1 && rawWord === rawWord.toUpperCase();
    if (isAllCaps) {
      valence += valence > 0 ? 0.733 : -0.733;
    }

    // Check 3-word preceding window for boosters and negations
    for (let j = 1; j <= 3; j++) {
      if (i - j < 0) break;
      const prevWord = words[i - j].toLowerCase();

      // Check booster
      if (BOOSTER_DICT[prevWord]) {
        let b = BOOSTER_DICT[prevWord];
        if (valence < 0) b = -b;
        // distance dampening
        if (j === 2) b *= 0.95;
        if (j === 3) b *= 0.9;
        valence += b;
      }

      // Check negation
      if (NEGATIONS.has(prevWord)) {
        valence *= -0.74; // inverts and slightly dampens
        break;
      }
    }

    // Exclamation mark reinforcement on the sentiment word
    if (valence > 0) {
      valence += punctuationBoost;
    } else if (valence < 0) {
      valence -= punctuationBoost;
    }

    // Question mark dampening
    if (questionCount > 1 && valence !== 0) {
      valence *= 0.85;
    }

    sentiments.push(valence);
  }

  // Contrastive "but" clause weighting
  const butIndex = words.findIndex((w) => w.toLowerCase() === 'but' || w.toLowerCase() === 'however');
  if (butIndex !== -1 && sentiments.length > 1) {
    // Words after "but" receive higher weight in VADER
    for (let k = 0; k < sentiments.length; k++) {
      sentiments[k] = k > butIndex ? sentiments[k] * 1.5 : sentiments[k] * 0.5;
    }
  }

  let totalPos = 0;
  let totalNeg = 0;
  let neuCount = Math.max(1, words.length - sentiments.length);

  for (const s of sentiments) {
    if (s > 0) totalPos += s + 1; // standard VADER adjustment
    else if (s < 0) totalNeg += Math.abs(s - 1);
  }

  const rawSum = sentiments.reduce((acc, curr) => acc + curr, 0);

  // Normalization Compound Score = sum / sqrt(sum^2 + alpha), alpha = 15
  const alpha = 15;
  const compound = rawSum / Math.sqrt(rawSum * rawSum + alpha);
  const normalizedCompound = Math.max(-1, Math.min(1, Number(compound.toFixed(4))));

  const total = totalPos + totalNeg + neuCount;
  const pos = Number((totalPos / total).toFixed(3));
  const neg = Number((totalNeg / total).toFixed(3));
  const neu = Number((neuCount / total).toFixed(3));

  let classification: SentimentLabel = 'neutral';
  if (normalizedCompound >= 0.05) {
    classification = 'positive';
  } else if (normalizedCompound <= -0.05) {
    classification = 'negative';
  }

  return {
    pos,
    neu,
    neg,
    compound: normalizedCompound,
    classification,
  };
}
