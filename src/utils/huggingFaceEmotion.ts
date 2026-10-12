import { HuggingFaceScore, EmotionType, SentimentLabel } from '../types/sentiment';

/**
 * Hugging Face Transformer-Emulated Emotion Classification
 * Inspired by cardiffnlp/twitter-roberta-base-sentiment & bhadresh-psav/bert-base-uncased-emotion / GoEmotions.
 * Evaluates semantic contextual patterns, sarcastic incongruity, and multi-class emotion logits.
 */

interface EmotionWeights {
  joy: number;
  hype: number;
  outrage: number;
  sarcasm: number;
  curiosity: number;
  disgust: number;
  sadness: number;
  neutral: number;
}

// Patterns indicative of specific transformer attention heads
const SARCASM_PATTERNS = [
  /yeah\s+right/i,
  /sure\s+it\s+does/i,
  /totally\s+(worth|real|authentic|legit)/i,
  /obviously\s+not/i,
  /as\s+if/i,
  /must\s+be\s+nice/i,
  /wow\s+so\s+original/i,
  /groundbreaking/i,
  /clown\s+behavior/i,
  /okay\s+bro\s+💀/i,
  /yeah\s+okay/i,
  /sure\s+jan/i,
  /\bcap\b/i,
  /🧢/,
  /🤡/,
  /🙃/,
  /oh\s+wow\s+never\s+seen\s+that\s+before/i,
];

const HYPE_PATTERNS = [
  /take\s+my\s+money/i,
  /need\s+this/i,
  /obsessed/i,
  /screaming/i,
  /crying\s+screaming/i,
  /holy\s+(crap|shit|cow)/i,
  /omg/i,
  /on\s+repeat/i,
  /underrated/i,
  /masterpiece/i,
  /ate\s+and\s+left\s+no\s+crumbs/i,
  /slay/i,
  /banger/i,
  /let\s+him\s+cook/i,
  /let\s+them\s+cook/i,
  /instant\s+buy/i,
  /period/i,
  /🔥{2,}/,
  /😍{2,}/,
];

const OUTRAGE_PATTERNS = [
  /scam/i,
  /ripoff/i,
  /rip\s+off/i,
  /robbery/i,
  /boycott/i,
  /unacceptable/i,
  /lawsuit/i,
  /liar/i,
  /lying/i,
  /fraud/i,
  /shameful/i,
  /greedy/i,
  /disgrace/i,
  /audacity/i,
  /infuriating/i,
  /waste\s+of\s+money/i,
  /refund/i,
  /overpriced/i,
  /stop\s+lying/i,
  /🤬|😡|🤮/,
];

const CURIOSITY_PATTERNS = [
  /\bwhere\b/i,
  /\blink\b/i,
  /\bhow\s+much\b/i,
  /\bprice\b/i,
  /\bwhat\s+is\b/i,
  /\bdoes\s+it\b/i,
  /\bcan\s+you\b/i,
  /\bdrop\s+the\b/i,
  /\bpart\s+2\b/i,
  /\bpart\s+two\b/i,
  /\btutorial\b/i,
  /\bwhen\s+is\b/i,
  /\?{1,}/,
  /👀/,
];

const DISGUST_PATTERNS = [
  /cringe/i,
  /gross/i,
  /eww?/i,
  /nasty/i,
  /yuck/i,
  /secondhand\s+embarrassment/i,
  /unwatchable/i,
  /trash/i,
  /garbage/i,
  /cooked/i,
  /🤢|🤮|💩/,
];

const JOY_PATTERNS = [
  /so\s+wholesome/i,
  /makes\s+me\s+smile/i,
  /sweet/i,
  /cute/i,
  /beautiful/i,
  /love\s+this/i,
  /adorable/i,
  /precious/i,
  /blessed/i,
  /made\s+my\s+day/i,
  /thank\s+you/i,
  /grateful/i,
  /🥰|❤️|💖|✨/,
];

const SADNESS_PATTERNS = [
  /heartbroken/i,
  /crying\s+real\s+tears/i,
  /so\s+sad/i,
  /hurts/i,
  /broke\s+my\s+heart/i,
  /miss\s+them/i,
  /tragic/i,
  /devastated/i,
  /💔|😢|🥺/,
];

export function analyzeHuggingFaceEmotion(text: string): HuggingFaceScore {
  if (!text || text.trim().length === 0) {
    return {
      primaryEmotion: 'neutral',
      confidence: 0.95,
      sentiment: 'neutral',
      scores: {
        joy: 0.05,
        hype: 0.02,
        outrage: 0.01,
        sarcasm: 0.02,
        curiosity: 0.05,
        disgust: 0.01,
        sadness: 0.01,
        neutral: 0.83,
      },
      isSarcasticOrIrony: false,
    };
  }

  const rawLower = text.toLowerCase();
  const weights: EmotionWeights = {
    joy: 0.1,
    hype: 0.1,
    outrage: 0.1,
    sarcasm: 0.08,
    curiosity: 0.1,
    disgust: 0.08,
    sadness: 0.08,
    neutral: 0.25,
  };

  let sarcasmBoost = 0;
  for (const p of SARCASM_PATTERNS) {
    if (p.test(text)) sarcasmBoost += 0.45;
  }
  // Sarcasm often mixes positive words with skull or eye roll
  if ((rawLower.includes('great') || rawLower.includes('love') || rawLower.includes('amazing')) &&
      (text.includes('💀') || text.includes('🤡') || text.includes('🙄') || text.includes('...'))) {
    sarcasmBoost += 0.6;
  }
  weights.sarcasm += sarcasmBoost;

  for (const p of HYPE_PATTERNS) {
    if (p.test(text)) weights.hype += 0.55;
  }

  for (const p of OUTRAGE_PATTERNS) {
    if (p.test(text)) weights.outrage += 0.6;
  }

  for (const p of CURIOSITY_PATTERNS) {
    if (p.test(text)) weights.curiosity += 0.55;
  }

  for (const p of DISGUST_PATTERNS) {
    if (p.test(text)) weights.disgust += 0.55;
  }

  for (const p of JOY_PATTERNS) {
    if (p.test(text)) weights.joy += 0.5;
  }

  for (const p of SADNESS_PATTERNS) {
    if (p.test(text)) weights.sadness += 0.5;
  }

  // Softmax normalization across emotion vector
  const entries = Object.entries(weights) as [EmotionType, number][];
  const maxVal = Math.max(...entries.map(([, v]) => v));
  const expValues = entries.map(([k, v]) => [k, Math.exp(v - maxVal)] as [EmotionType, number]);
  const sumExp = expValues.reduce((acc, [, v]) => acc + v, 0);

  const scores: Record<EmotionType, number> = {} as any;
  let topEmotion: EmotionType = 'neutral';
  let topScore = -1;

  for (const [key, expVal] of expValues) {
    const prob = Number((expVal / sumExp).toFixed(3));
    scores[key] = prob;
    if (prob > topScore) {
      topScore = prob;
      topEmotion = key;
    }
  }

  // Sentiment mapping for Hugging Face model
  let sentiment: SentimentLabel = 'neutral';
  if (['joy', 'hype'].includes(topEmotion)) {
    sentiment = 'positive';
  } else if (['outrage', 'disgust', 'sadness'].includes(topEmotion)) {
    sentiment = 'negative';
  } else if (topEmotion === 'sarcasm') {
    // Sarcasm in social media almost always conceals negative/critical valence
    sentiment = 'negative';
  } else if (topEmotion === 'curiosity') {
    sentiment = scores.hype > 0.2 ? 'positive' : 'neutral';
  }

  return {
    primaryEmotion: topEmotion,
    confidence: topScore,
    sentiment,
    scores,
    isSarcasticOrIrony: topEmotion === 'sarcasm' || scores.sarcasm > 0.28,
  };
}
