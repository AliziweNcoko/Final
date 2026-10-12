export type SentimentLabel = 'positive' | 'neutral' | 'negative';

export type EmotionType =
  | 'joy'
  | 'hype'
  | 'outrage'
  | 'sarcasm'
  | 'curiosity'
  | 'disgust'
  | 'sadness'
  | 'neutral';

export interface VaderScore {
  pos: number;
  neu: number;
  neg: number;
  compound: number; // -1.0 to 1.0
  classification: SentimentLabel;
}

export interface HuggingFaceScore {
  primaryEmotion: EmotionType;
  confidence: number; // 0.0 to 1.0
  sentiment: SentimentLabel;
  scores: Record<EmotionType, number>;
  isSarcasticOrIrony: boolean;
}

export interface CommentItem {
  id: string;
  author: string;
  username: string;
  avatar: string;
  text: string;
  likes: number;
  timeAgo: string;
  timestamp: number;
  vader: VaderScore;
  huggingFace: HuggingFaceScore;
  highlightWords?: string[];
  themes: string[];
  isPinned?: boolean;
  isAlertTrigger?: boolean;
}

export interface VideoTheme {
  id: string;
  name: string;
  hashtag: string;
  description: string;
  frequency: number;
  sentiment: SentimentLabel;
  sentimentScore: number; // -1 to 1
  dominantEmotion: EmotionType;
}

export interface VideoAnalysis {
  id: string;
  title: string;
  creator: string;
  creatorHandle: string;
  creatorAvatar: string;
  duration: string;
  views: string;
  likes: string;
  commentsCount: number;
  shares: string;
  videoUrl?: string;
  tiktokUrl?: string;
  videoId?: string;
  embedHtml?: string;
  thumbnailUrl: string;
  summary: string;
  hookSummary: string;
  creatorIntent: string;
  keyThemes: VideoTheme[];
  riskIndex: number; // 0 to 100
  viralityScore: number; // 0 to 100
  audienceAlignmentScore: number; // 0 to 100
}

export type AlertSeverity = 'critical' | 'high' | 'medium' | 'info';

export type AlertCategory =
  | 'all'
  | 'outrage'
  | 'hype'
  | 'sarcasm'
  | 'risk'
  | 'disagreement';

export interface EmotionAlert {
  id: string;
  category: AlertCategory;
  severity: AlertSeverity;
  title: string;
  description: string;
  metric: string;
  threshold: string;
  timeAgo: string;
  timestamp: number;
  prevStatus: string;
  currentStatus: string;
  sampleComment?: string;
  authorAvatar?: string;
  resolved: boolean;
}

export interface TagCloudItem {
  tag: string;
  isHashtag: boolean;
  count: number;
  sentimentScore: number; // -1 to 1
  sentimentLabel: SentimentLabel | 'mixed';
  dominantEmotion: EmotionType;
  sampleComments: string[];
}

export interface AggregateStats {
  totalComments: number;
  vader: {
    positivePercent: number;
    neutralPercent: number;
    negativePercent: number;
    averageCompound: number;
  };
  huggingFace: {
    emotions: Record<EmotionType, { count: number; percent: number }>;
    dominantEmotion: EmotionType;
    sarcasmRate: number;
  };
  modelAgreementRate: number; // 0 to 100%
  topThemes: VideoTheme[];
  activeAlertsCount: number;
}
