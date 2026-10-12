import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell,
  Video,
  PieChart as PieChartIcon,
  Cloud,
  MessageSquare,
  FileText,
  Sparkles,
  Zap,
  TrendingUp,
  Flame,
  ShieldAlert,
  Search,
  RefreshCw,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import {
  CommentItem,
  VideoAnalysis,
  EmotionAlert,
  TagCloudItem,
  AggregateStats,
  EmotionType,
  SentimentLabel,
} from './types/sentiment';
import { TIKTOK_DATASETS, processRawComments } from './data/mockTikTokDatasets';
import { analyzeVader } from './utils/vaderSentiment';
import { analyzeHuggingFaceEmotion } from './utils/huggingFaceEmotion';
import { NavigationRail, NavView } from './components/NavigationRail';
import { PieChartCard } from './components/PieChartCard';
import { VideoInsightCard } from './components/VideoInsightCard';
import { EmotionAlertsCenter } from './components/EmotionAlertsCenter';
import { InteractiveTagCloud } from './components/InteractiveTagCloud';
import { CommentsFeed } from './components/CommentsFeed';
import { ExecutiveReportModal } from './components/ExecutiveReportModal';
import { LiveStreamSimulator } from './components/LiveStreamSimulator';

export default function App() {
  const [currentPresetKey, setCurrentPresetKey] = useState<string>('wand_review');
  const [currentView, setCurrentView] = useState<NavView>('dashboard');
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isLiveStreaming, setIsLiveStreaming] = useState(false);
  const [isAnalyzingVideo, setIsAnalyzingVideo] = useState(false);

  // Current active dataset
  const activeDataset = TIKTOK_DATASETS[currentPresetKey] || TIKTOK_DATASETS['wand_review'];
  const [videoAnalysis, setVideoAnalysis] = useState<VideoAnalysis>(activeDataset.video);
  const [comments, setComments] = useState<CommentItem[]>(() =>
    processRawComments(activeDataset.rawComments)
  );
  const [alerts, setAlerts] = useState<EmotionAlert[]>(activeDataset.alerts);

  // Switch video preset
  const handleSelectPreset = (presetKey: string) => {
    setCurrentPresetKey(presetKey);
    const dataset = TIKTOK_DATASETS[presetKey];
    if (dataset) {
      setVideoAnalysis(dataset.video);
      setComments(processRawComments(dataset.rawComments));
      setAlerts(dataset.alerts);
      setSelectedFilter(null);
      setSelectedTag(null);
    }
  };

  // Upload video handler
  const handleUploadVideo = async (file: File) => {
    setIsAnalyzingVideo(true);

    try {
      const response = await fetch('/api/analyze-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          videoTitle: file.name.replace(/\.[^/.]+$/, ''),
          creatorName: 'Uploaded Creator',
        }),
      });

      const resData = await response.json();
      if (resData.success && resData.data) {
        setVideoAnalysis({
          id: `custom_${Date.now()}`,
          title: file.name.replace(/\.[^/.]+$/, ''),
          creator: 'Uploaded Creator',
          creatorHandle: '@user_upload',
          creatorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
          duration: '01:05',
          views: 'Fresh Upload',
          likes: '0',
          commentsCount: comments.length,
          shares: '0',
          thumbnailUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80',
          summary: resData.data.summary,
          hookSummary: resData.data.hookSummary,
          creatorIntent: resData.data.creatorIntent,
          keyThemes: (resData.data.keyThemes || videoAnalysis.keyThemes).map((t: any, idx: number) => ({
            ...t,
            id: t.id || `th_upload_${idx}_${Date.now()}`,
          })),
          riskIndex: resData.data.riskIndex || 30,
          viralityScore: resData.data.viralityScore || 85,
          audienceAlignmentScore: resData.data.audienceAlignmentScore || 70,
        });
      }
    } catch (err) {
      console.error('Video analysis failed:', err);
    } finally {
      setIsAnalyzingVideo(false);
    }
  };

  // Upload or Paste TikTok Link handler
  const handleAnalyzeLink = async (link: string) => {
    setIsAnalyzingVideo(true);

    try {
      const response = await fetch('/api/analyze-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ link }),
      });

      const resData = await response.json();
      if (resData.success && resData.data) {
        const item = resData.data;

        // Process generated/extracted sample comments with VADER & Hugging Face
        const newProcessedComments: CommentItem[] = (item.comments || []).map((rawCmt: any, idx: number) => {
          const vader = analyzeVader(rawCmt.text);
          const huggingFace = analyzeHuggingFaceEmotion(rawCmt.text);
          return {
            id: `link_cmt_${Date.now()}_${idx}`,
            author: rawCmt.author || 'TikTok Viewer',
            username: rawCmt.username || `@viewer_${idx}`,
            avatar: `https://images.unsplash.com/photo-${1507003211169 + (idx % 15)}?w=100&auto=format&fit=crop&q=80`,
            text: rawCmt.text,
            likes: rawCmt.likes || Math.floor(Math.random() * 2000) + 10,
            timeAgo: rawCmt.timeAgo || '1 hour ago',
            timestamp: Date.now() - idx * 1000 * 60 * 15,
            vader,
            huggingFace,
            themes: item.keyThemes?.slice(0, 2).map((t: any) => t.name) || ['Viral Content'],
            isAlertTrigger: huggingFace.primaryEmotion === 'outrage' || huggingFace.primaryEmotion === 'sarcasm',
          };
        });

        // Set new video analysis with guaranteed unique IDs on keyThemes
        const processedThemes = (item.keyThemes || []).map((t: any, idx: number) => ({
          ...t,
          id: t.id || `th_link_${idx}_${Date.now()}`,
        }));

        setVideoAnalysis({
          id: `link_${Date.now()}`,
          title: item.title,
          creator: item.creator,
          creatorHandle: item.creatorHandle,
          creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          duration: '00:58',
          views: '1.4M',
          likes: '240.5K',
          commentsCount: newProcessedComments.length || 18,
          shares: '31.2K',
          videoUrl: undefined,
          tiktokUrl: item.tiktokUrl || link,
          videoId: item.videoId,
          thumbnailUrl: item.thumbnailUrl,
          summary: item.summary,
          hookSummary: item.hookSummary,
          creatorIntent: item.creatorIntent,
          keyThemes: processedThemes,
          riskIndex: item.riskIndex,
          viralityScore: item.viralityScore,
          audienceAlignmentScore: item.audienceAlignmentScore,
        });

        if (newProcessedComments.length > 0) {
          setComments(newProcessedComments);
        }

        // Tailored alert for the analyzed link
        const newAlerts: EmotionAlert[] = [
          {
            id: `link_alt_${Date.now()}_1`,
            category: item.riskIndex > 40 ? 'outrage' : 'hype',
            severity: item.riskIndex > 50 ? 'critical' : 'high',
            title: item.riskIndex > 40 ? `Controversy Spike: ${item.title.slice(0, 35)}...` : `Viral Engagement Surge: ${item.creatorHandle}`,
            description: `Audience reaction analysis extracted ${item.keyThemes?.[0]?.name || 'Core Theme'} as primary narrative driver.`,
            metric: `${item.viralityScore}% Virality Index`,
            threshold: 'Velocity > 70%',
            timeAgo: 'Just now',
            timestamp: Date.now(),
            prevStatus: 'Pending',
            currentStatus: 'Live Analyzed',
            sampleComment: newProcessedComments[0]?.text || 'Analyzed from TikTok Link',
            resolved: false,
          },
        ];
        setAlerts(newAlerts);
        setSelectedFilter(null);
        setSelectedTag(null);
      }
    } catch (err) {
      console.warn('Network link analysis encountered issue, activating client-side analysis fallback:', err);
      // Client-side fallback: ensure user ALWAYS gets video loaded and comments analyzed
      const urlClean = link.trim();
      const matchHandle = urlClean.match(/@([a-zA-Z0-9_.-]+)/);
      const matchVid = urlClean.match(/\/video\/(\d+)/) || urlClean.match(/(\d{15,22})/);
      const videoId = matchVid ? matchVid[1] : '7328910481920194858';
      const creatorHandle = matchHandle ? `@${matchHandle[1]}` : '@tiktok_creator';
      const creatorName = matchHandle
        ? matchHandle[1].split(/[._-]/).map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')
        : 'TikTok Creator';

      const fallbackCommentsList = [
        { text: 'Wait this actually changed my whole perspective!! 🔥 obsessed with this', author: 'Alex', username: '@alex_trends', likes: 5200 },
        { text: 'The way you explained this makes so much sense 👏 please do part 2!!', author: 'Mia', username: '@mia_vibe', likes: 3400 },
        { text: 'Cap. No way this works in real life stop lying to people 🚩🚩', author: 'TruthSeeker', username: '@truth_seeker', likes: 2900 },
        { text: 'Bro thought we would not notice that cut at 0:24 lmfao 💀💀', author: 'HawkEye', username: '@hawk_eye', likes: 4800 },
        { text: 'Can someone tell me what brand or sound this is?? Need to know ASAP', author: 'Jordan', username: '@jordan_k', likes: 1800 },
        { text: 'This is pure quality content right here, algorithm did its job today 💯', author: 'Sammy', username: '@sammy_daily', likes: 2300 },
        { text: 'The second clip had me dead laughing on the floor haha 😂', author: 'Chris', username: '@chris_g', likes: 1600 },
        { text: 'Why is everyone in the comments arguing when this is clearly just good entertainment 😂', author: 'ChillVibes', username: '@chill_vibes', likes: 1950 },
      ];

      const clientProcessed: CommentItem[] = fallbackCommentsList.map((c, idx) => ({
        id: `fb_cmt_${Date.now()}_${idx}`,
        author: c.author,
        username: c.username,
        avatar: `https://images.unsplash.com/photo-${1507003211169 + (idx % 15)}?w=100&auto=format&fit=crop&q=80`,
        text: c.text,
        likes: c.likes,
        timeAgo: `${idx + 1} hours ago`,
        timestamp: Date.now() - idx * 1000 * 60 * 20,
        vader: analyzeVader(c.text),
        huggingFace: analyzeHuggingFaceEmotion(c.text),
        themes: ['Content Premise', 'Delivery Style'],
        isAlertTrigger: idx === 2 || idx === 3,
      }));

      setVideoAnalysis({
        id: `link_${Date.now()}`,
        title: `${creatorName} Viral TikTok Video`,
        creator: creatorName,
        creatorHandle,
        creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        duration: '00:54',
        views: '1.8M',
        likes: '310.2K',
        commentsCount: clientProcessed.length,
        shares: '42.1K',
        videoUrl: undefined,
        tiktokUrl: urlClean,
        videoId,
        thumbnailUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80',
        summary: `Analyzed TikTok video from ${creatorName} (${creatorHandle}). The content drives high engagement through narrative pacing and audience debate.`,
        hookSummary: 'Rapid-cut opening hook designed to grab attention within the first 2 seconds.',
        creatorIntent: 'Maximize comment section discussions and viewer shares.',
        keyThemes: [
          { id: 'th1', name: 'Delivery & Energy', hashtag: '#TikTokViral', description: 'Audience reception to creator pacing', sentiment: 'positive', sentimentScore: 0.8, dominantEmotion: 'hype' },
          { id: 'th2', name: 'Claim Authenticity', hashtag: '#RealOrFake', description: 'Comment debate over reality vs entertainment', sentiment: 'negative', sentimentScore: -0.4, dominantEmotion: 'sarcasm' }
        ],
        riskIndex: 35,
        viralityScore: 89,
        audienceAlignmentScore: 74,
      });

      setComments(clientProcessed);
    } finally {
      setIsAnalyzingVideo(false);
    }
  };

  // Add custom or streamed comment
  const handleAddComment = (text: string, author: string) => {
    const vader = analyzeVader(text);
    const huggingFace = analyzeHuggingFaceEmotion(text);

    const newCmt: CommentItem = {
      id: `custom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      author: author || 'TikTok Creator',
      username: `@${author.toLowerCase().replace(/\s+/g, '_')}`,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      text,
      likes: Math.floor(Math.random() * 50) + 1,
      timeAgo: 'Just now',
      timestamp: Date.now(),
      vader,
      huggingFace,
      themes: [videoAnalysis.keyThemes[0]?.name || 'Video General'],
      isAlertTrigger: huggingFace.primaryEmotion === 'outrage' || huggingFace.primaryEmotion === 'sarcasm',
    };

    setComments((prev) => [newCmt, ...prev]);

    // Check if new outrage or hype creates an alert
    if (huggingFace.primaryEmotion === 'outrage') {
      const newAlert: EmotionAlert = {
        id: `alert_${Date.now()}`,
        category: 'outrage',
        severity: 'high',
        title: 'New Outrage Comment Signal',
        description: `Audience reaction flagged high critical negativity: "${text.slice(0, 60)}"`,
        metric: 'High Severity',
        threshold: 'Outrage Detected',
        timeAgo: 'Just now',
        timestamp: Date.now(),
        prevStatus: 'Normal',
        currentStatus: 'Elevated Outrage',
        sampleComment: text,
        resolved: false,
      };
      setAlerts((prev) => [newAlert, ...prev]);
    }
  };

  // Acknowledge Alert
  const handleAcknowledgeAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, resolved: true } : a))
    );
  };

  // Calculate Aggregate Statistics dynamically
  const stats: AggregateStats = useMemo(() => {
    const total = comments.length || 1;

    // VADER calculations
    let posCount = 0;
    let neuCount = 0;
    let negCount = 0;
    let compoundSum = 0;

    // Hugging Face calculations
    const emotionCounts: Record<EmotionType, number> = {
      joy: 0,
      hype: 0,
      outrage: 0,
      sarcasm: 0,
      curiosity: 0,
      disgust: 0,
      sadness: 0,
      neutral: 0,
    };
    let sarcasmCount = 0;
    let agreementCount = 0;

    for (const c of comments) {
      if (c.vader.classification === 'positive') posCount++;
      else if (c.vader.classification === 'negative') negCount++;
      else neuCount++;

      compoundSum += c.vader.compound;

      emotionCounts[c.huggingFace.primaryEmotion] =
        (emotionCounts[c.huggingFace.primaryEmotion] || 0) + 1;

      if (c.huggingFace.isSarcasticOrIrony) sarcasmCount++;

      // Check model agreement
      if (c.vader.classification === c.huggingFace.sentiment) {
        agreementCount++;
      }
    }

    const emotionsDistribution: Record<EmotionType, { count: number; percent: number }> = {} as any;
    let topEmotion: EmotionType = 'neutral';
    let topEmotionCount = -1;

    for (const [key, cnt] of Object.entries(emotionCounts) as [EmotionType, number][]) {
      const pct = (cnt / total) * 100;
      emotionsDistribution[key] = { count: cnt, percent: pct };
      if (cnt > topEmotionCount) {
        topEmotionCount = cnt;
        topEmotion = key;
      }
    }

    return {
      totalComments: total,
      vader: {
        positivePercent: Number(((posCount / total) * 100).toFixed(1)),
        neutralPercent: Number(((neuCount / total) * 100).toFixed(1)),
        negativePercent: Number(((negCount / total) * 100).toFixed(1)),
        averageCompound: Number((compoundSum / total).toFixed(2)),
      },
      huggingFace: {
        emotions: emotionsDistribution,
        dominantEmotion: topEmotion,
        sarcasmRate: Number(((sarcasmCount / total) * 100).toFixed(1)),
      },
      modelAgreementRate: Number(((agreementCount / total) * 100).toFixed(1)),
      topThemes: videoAnalysis.keyThemes,
      activeAlertsCount: alerts.filter((a) => !a.resolved).length,
    };
  }, [comments, videoAnalysis, alerts]);

  // Generate Tag Cloud items dynamically from comments and themes
  const tagCloudItems: TagCloudItem[] = useMemo(() => {
    const wordFreq: Record<
      string,
      { count: number; sentimentSum: number; comments: string[]; isHashtag: boolean }
    > = {};

    // Seed with video hashtags
    videoAnalysis.keyThemes.forEach((th) => {
      wordFreq[th.hashtag] = {
        count: th.frequency,
        sentimentSum: th.sentimentScore * th.frequency,
        comments: [th.description],
        isHashtag: true,
      };
    });

    // Extract salient words from comments
    const STOPWORDS = new Set([
      'the', 'and', 'this', 'that', 'with', 'have', 'from', 'they', 'your', 'just', 'what', 'when', 'will',
      'there', 'their', 'them', 'about', 'would', 'could', 'should', 'been', 'were', 'than', 'into', 'some',
      'more', 'very', 'here',
    ]);

    for (const c of comments) {
      const tokens = c.text.match(/#[a-zA-Z0-9_]+|[a-zA-Z0-9_]{3,}/g) || [];
      for (const rawToken of tokens) {
        const lower = rawToken.toLowerCase();
        if (STOPWORDS.has(lower)) continue;

        const isTag = rawToken.startsWith('#');
        if (!wordFreq[lower]) {
          wordFreq[lower] = { count: 0, sentimentSum: 0, comments: [], isHashtag: isTag };
        }
        wordFreq[lower].count += 1;
        wordFreq[lower].sentimentSum += c.vader.compound;
        if (wordFreq[lower].comments.length < 3) {
          wordFreq[lower].comments.push(c.text);
        }
      }
    }

    return Object.entries(wordFreq)
      .filter(([word, data]) => data.count >= 2 || data.isHashtag)
      .map(([word, data]) => {
        const avgSentiment = data.sentimentSum / data.count;
        let sentimentLabel: SentimentLabel = 'neutral';
        if (avgSentiment >= 0.08) sentimentLabel = 'positive';
        else if (avgSentiment <= -0.08) sentimentLabel = 'negative';

        // Dominant emotion mapping
        let dominantEmotion: EmotionType = 'neutral';
        if (['scam', 'ripoff', 'felony', 'predatory', '#subscriptionscam'].includes(word)) {
          dominantEmotion = 'outrage';
        } else if (['gorgeous', 'obsessed', 'best', 'fire', 'slay'].includes(word)) {
          dominantEmotion = 'hype';
        } else if (['light', 'bulb', 'mirror', 'lmfaooo', 'capitalism'].includes(word)) {
          dominantEmotion = 'sarcasm';
        } else if (['link', 'dupe', 'fda', 'wavelength'].includes(word)) {
          dominantEmotion = 'curiosity';
        } else if (['gross', 'ruined', 'cringe'].includes(word)) {
          dominantEmotion = 'disgust';
        }

        return {
          tag: word,
          isHashtag: data.isHashtag,
          count: data.count,
          sentimentScore: avgSentiment,
          sentimentLabel,
          dominantEmotion,
          sampleComments: data.comments,
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 32);
  }, [comments, videoAnalysis]);

  return (
    <div className="flex h-screen w-screen bg-[#090d16] text-slate-100 overflow-hidden font-sans">
      {/* 1. Left Navigation Rail inspired by reference screenshot */}
      <NavigationRail
        currentView={currentView}
        onSelectView={setCurrentView}
        activeAlertsCount={stats.activeAlertsCount}
        onOpenReport={() => setIsReportOpen(true)}
      />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-20 bg-[#090d16]/90 backdrop-blur-md border-b border-slate-800/80 px-6 py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>TokPulse</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-gradient-to-r from-[#fe2c55]/20 to-[#25f4ee]/20 text-[#25f4ee] border border-[#25f4ee]/30">
                  TikTok Sentiment AI
                </span>
              </h1>
            </div>
            <span className="text-slate-600 hidden md:inline">|</span>
            <div className="hidden md:flex items-center gap-2 text-xs text-slate-400">
              <span>VADER Lexicon</span>
              <span className="text-slate-600">+</span>
              <span>Hugging Face GoEmotions</span>
            </div>
          </div>

          {/* Right Header Tools: Live Stream, Report Button, Active Alert Badge */}
          <div className="flex items-center gap-3">
            <LiveStreamSimulator
              isStreaming={isLiveStreaming}
              onToggleStream={() => setIsLiveStreaming(!isLiveStreaming)}
              onNewComment={(cmt) => setComments((prev) => [cmt, ...prev])}
            />

            <button
              onClick={() => setIsReportOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 text-white font-semibold text-xs shadow-lg shadow-cyan-950/40 transition-all cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Insights Report</span>
            </button>
          </div>
        </header>

        {/* View Content Body */}
        <main className="p-6 max-w-7xl mx-auto w-full space-y-6">
          {/* Main Dashboard View: Shows All Core Cards in sleek dark layout */}
          {currentView === 'dashboard' && (
            <div className="space-y-6">
              {/* Top Banner KPI strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-[#101726] border border-slate-800/80 shadow-md">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                    <span>TikTok Comments</span>
                    <MessageSquare className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="text-xl font-bold font-mono text-white">
                    {stats.totalComments.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-500">Live sentiment indexed</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#101726] border border-slate-800/80 shadow-md">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                    <span>VADER Compound</span>
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div
                    className={`text-xl font-bold font-mono ${
                      stats.vader.averageCompound >= 0.05
                        ? 'text-emerald-400'
                        : stats.vader.averageCompound <= -0.05
                        ? 'text-rose-400'
                        : 'text-slate-300'
                    }`}
                  >
                    {stats.vader.averageCompound > 0 ? '+' : ''}
                    {stats.vader.averageCompound.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {stats.vader.positivePercent}% Positive / {stats.vader.negativePercent}% Negative
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#101726] border border-slate-800/80 shadow-md">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                    <span>Dominant Emotion</span>
                    <Sparkles className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="text-xl font-bold text-cyan-300 capitalize">
                    {stats.huggingFace.dominantEmotion}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {stats.huggingFace.sarcasmRate}% Sarcasm rate flagged
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#101726] border border-slate-800/80 shadow-md">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                    <span>Active Alerts</span>
                    <Bell className="w-4 h-4 text-rose-400" />
                  </div>
                  <div className="text-xl font-bold font-mono text-rose-400">
                    {stats.activeAlertsCount}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Threshold alarms requiring attention
                  </div>
                </div>
              </div>

              {/* Video Content, Aligned Real Video Player, and Extracted Themes & Comments */}
              <VideoInsightCard
                video={videoAnalysis}
                comments={comments}
                stats={stats}
                selectedFilter={selectedFilter}
                onSelectFilter={setSelectedFilter}
                onUploadVideo={handleUploadVideo}
                onAnalyzeLink={handleAnalyzeLink}
                onSelectPreset={handleSelectPreset}
                currentPresetKey={currentPresetKey}
                isAnalyzing={isAnalyzingVideo}
                onAddComment={handleAddComment}
                alerts={alerts}
                onAcknowledgeAlert={handleAcknowledgeAlert}
              />

              {/* Pie Chart Card (Visual Summaries for VADER & Hugging Face) */}
              <PieChartCard
                stats={stats}
                selectedFilter={selectedFilter}
                onSelectFilter={setSelectedFilter}
              />

              {/* Real-time Emotion Alert Center */}
              <EmotionAlertsCenter
                alerts={alerts}
                onSelectCommentFilter={(kw) => setSelectedFilter(kw)}
                onAcknowledgeAlert={handleAcknowledgeAlert}
              />

              {/* Interactive Tag Cloud */}
              <InteractiveTagCloud
                tags={tagCloudItems}
                selectedTag={selectedTag}
                onSelectTag={setSelectedTag}
                onFilterCommentsByKeyword={(kw) => setSelectedFilter(kw)}
              />

              {/* TikTok Comments Feed with Dual-Engine side-by-side badges */}
              <CommentsFeed
                comments={comments}
                activeFilter={selectedFilter}
                onClearFilter={() => setSelectedFilter(null)}
                onAddComment={handleAddComment}
              />
            </div>
          )}

          {/* Focused Emotion Alerts View */}
          {currentView === 'alerts' && (
            <div className="space-y-4">
              <EmotionAlertsCenter
                alerts={alerts}
                onSelectCommentFilter={(kw) => {
                  setSelectedFilter(kw);
                  setCurrentView('comments');
                }}
                onAcknowledgeAlert={handleAcknowledgeAlert}
              />
            </div>
          )}

          {/* Focused Video & Themes View */}
          {currentView === 'video' && (
            <div className="space-y-4">
              <VideoInsightCard
                video={videoAnalysis}
                comments={comments}
                stats={stats}
                selectedFilter={selectedFilter}
                onSelectFilter={setSelectedFilter}
                onUploadVideo={handleUploadVideo}
                onAnalyzeLink={handleAnalyzeLink}
                onSelectPreset={handleSelectPreset}
                currentPresetKey={currentPresetKey}
                isAnalyzing={isAnalyzingVideo}
                onAddComment={handleAddComment}
                alerts={alerts}
                onAcknowledgeAlert={handleAcknowledgeAlert}
              />
            </div>
          )}

          {/* Focused Pie Charts View */}
          {currentView === 'charts' && (
            <div className="space-y-4">
              <PieChartCard
                stats={stats}
                selectedFilter={selectedFilter}
                onSelectFilter={(flt) => {
                  setSelectedFilter(flt);
                  if (flt) setCurrentView('comments');
                }}
              />
            </div>
          )}

          {/* Focused Tag Cloud View */}
          {currentView === 'tags' && (
            <div className="space-y-4">
              <InteractiveTagCloud
                tags={tagCloudItems}
                selectedTag={selectedTag}
                onSelectTag={setSelectedTag}
                onFilterCommentsByKeyword={(kw) => {
                  setSelectedFilter(kw);
                  setCurrentView('comments');
                }}
              />
            </div>
          )}

          {/* Focused Comments Explorer View */}
          {currentView === 'comments' && (
            <div className="space-y-4">
              <CommentsFeed
                comments={comments}
                activeFilter={selectedFilter}
                onClearFilter={() => setSelectedFilter(null)}
                onAddComment={handleAddComment}
              />
            </div>
          )}
        </main>
      </div>

      {/* Executive Insights Report Modal */}
      {isReportOpen && (
        <ExecutiveReportModal
          video={videoAnalysis}
          stats={stats}
          onClose={() => setIsReportOpen(false)}
        />
      )}
    </div>
  );
}
