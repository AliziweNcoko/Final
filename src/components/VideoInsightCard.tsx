import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Video,
  Upload,
  Link as LinkIcon,
  Sparkles,
  Flame,
  AlertTriangle,
  Compass,
  CheckCircle2,
  Tag,
  RefreshCw,
  ExternalLink,
  Copy,
  Check,
  Film,
  ArrowRight,
  TrendingUp,
  MessageCircle,
  PieChart as PieChartIcon,
  Bell,
  Search,
  Send,
  Zap,
} from 'lucide-react';
import {
  VideoAnalysis,
  CommentItem,
  AggregateStats,
  EmotionAlert,
  EmotionType,
  SentimentLabel,
} from '../types/sentiment';
import { TikTokVideoPlayer } from './TikTokVideoPlayer';
import { PieChartCard } from './PieChartCard';

interface Props {
  video: VideoAnalysis;
  comments: CommentItem[];
  stats: AggregateStats;
  selectedFilter: string | null;
  onSelectFilter: (filter: string | null) => void;
  onUploadVideo: (file: File) => void;
  onAnalyzeLink: (link: string) => void;
  onSelectPreset: (presetKey: string) => void;
  currentPresetKey: string;
  isAnalyzing: boolean;
  onAddComment?: (text: string, author: string) => void;
  alerts?: EmotionAlert[];
  onAcknowledgeAlert?: (alertId: string) => void;
}

export const VideoInsightCard: React.FC<Props> = ({
  video,
  comments,
  stats,
  selectedFilter,
  onSelectFilter,
  onUploadVideo,
  onAnalyzeLink,
  onSelectPreset,
  currentPresetKey,
  isAnalyzing,
  onAddComment,
  alerts = [],
  onAcknowledgeAlert,
}) => {
  const [inputLink, setInputLink] = useState(video.tiktokUrl || '');
  const [linkError, setLinkError] = useState<string | null>(null);
  const [videoSourceUrl, setVideoSourceUrl] = useState<string | null>(video.videoUrl || null);
  const [activeSideTab, setActiveSideTab] = useState<'comments' | 'themes' | 'charts' | 'alerts'>('comments');

  // Comment search & local filter
  const [commentSearch, setCommentSearch] = useState('');
  const [localSentimentFilter, setLocalSentimentFilter] = useState<string>('all');
  const [newCmtText, setNewCmtText] = useState('');
  const [newCmtAuthor, setNewCmtAuthor] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync inputLink when video changes
  useEffect(() => {
    if (video.tiktokUrl) {
      setInputLink(video.tiktokUrl);
    }
  }, [video.tiktokUrl]);

  const handleLinkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputLink.trim()) {
      setLinkError('Please paste a TikTok video link first.');
      return;
    }
    setLinkError(null);
    onAnalyzeLink(inputLink.trim());
  };

  const handlePresetLinkClick = (url: string) => {
    setInputLink(url);
    setLinkError(null);
    onAnalyzeLink(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const localUrl = URL.createObjectURL(file);
      setVideoSourceUrl(localUrl);
      onUploadVideo(file);
    }
  };

  const handleAddCustomComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCmtText.trim()) return;
    onAddComment?.(newCmtText.trim(), newCmtAuthor.trim() || 'TikTok Guest User');
    setNewCmtText('');
  };

  // Filtered comments for the side-aligned comments stream
  const filteredComments = comments.filter((c) => {
    if (localSentimentFilter !== 'all') {
      if (['positive', 'negative', 'neutral'].includes(localSentimentFilter)) {
        if (c.vader.classification !== localSentimentFilter) return false;
      } else {
        if (c.huggingFace.primaryEmotion !== localSentimentFilter) return false;
      }
    }

    if (selectedFilter) {
      const sf = selectedFilter.toLowerCase();
      const matchEmotion = c.huggingFace.primaryEmotion.toLowerCase() === sf;
      const matchSentiment = c.vader.classification.toLowerCase() === sf;
      const matchText = c.text.toLowerCase().includes(sf);
      if (!matchEmotion && !matchSentiment && !matchText) return false;
    }

    if (commentSearch.trim()) {
      const q = commentSearch.toLowerCase();
      return (
        c.text.toLowerCase().includes(q) ||
        c.author.toLowerCase().includes(q) ||
        c.username.toLowerCase().includes(q)
      );
    }

    return true;
  });

  const getEmotionBadgeColor = (emotion: EmotionType) => {
    switch (emotion) {
      case 'joy':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'hype':
        return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';
      case 'outrage':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      case 'sarcasm':
        return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
      case 'curiosity':
        return 'bg-blue-500/15 text-blue-300 border-blue-500/30';
      case 'disgust':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'sadness':
        return 'bg-slate-500/15 text-slate-300 border-slate-500/30';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="bg-[#101726] border border-slate-800/80 rounded-2xl p-5 shadow-2xl backdrop-blur-md relative overflow-hidden">
      {/* Top Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-800/70">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#fe2c55]/20 to-[#25f4ee]/20 border border-slate-700/60 flex items-center justify-center text-[#fe2c55]">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">TikTok Link & Real Video Stream</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                Side-by-Side Intelligence
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Put any TikTok link to watch the real video on the side, with comments sentiment and narrative analysis aligned
            </p>
          </div>
        </div>

        {/* Quick Test Presets */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs">
            <span className="px-2 text-slate-400 text-[11px] font-medium hidden sm:inline">Presets:</span>
            <button
              onClick={() => onSelectPreset('wand_review')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                currentPresetKey === 'wand_review'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              LED Wand Drama
            </button>
            <button
              onClick={() => onSelectPreset('tech_skit')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                currentPresetKey === 'tech_skit'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              2026 Tech Skit
            </button>
            <button
              onClick={() => onSelectPreset('food_burger')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                currentPresetKey === 'food_burger'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Vegas Burger
            </button>
          </div>
        </div>
      </div>

      {/* Main Aligned Split View: Real Video on Left Side (Sticky), Link Input & Intelligence on Right Side */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* SIDE 1: Real TikTok Video Stream (5 cols) - Sticky so it stays visible while scrolling right side */}
        <div className="lg:col-span-5 w-full lg:sticky lg:top-20 self-start">
          <TikTokVideoPlayer
            video={video}
            onJumpToComments={() => setActiveSideTab('comments')}
            videoSourceUrl={videoSourceUrl}
          />
        </div>

        {/* SIDE 2: Upload Link, Narrative Summary, and Analyzed Video Comments (7 cols) */}
        <div className="lg:col-span-7 flex flex-col space-y-4 min-w-0">
          {/* 1. Prominent TikTok Link Upload Bar - Aligned at top */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900/90 via-slate-900/80 to-slate-950 border border-slate-800 shadow-inner space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
                <LinkIcon className="w-3.5 h-3.5 text-[#25f4ee]" />
                Upload TikTok Video Link
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Video & Comments Sync
              </span>
            </div>

            <form onSubmit={handleLinkSubmit} className="space-y-2.5">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <LinkIcon className="w-4 h-4 text-[#25f4ee]" />
                  </div>
                  <input
                    type="text"
                    placeholder="Paste TikTok link (e.g. https://www.tiktok.com/@.../video/... or vm.tiktok.com/...)"
                    value={inputLink}
                    onChange={(e) => {
                      setInputLink(e.target.value);
                      if (linkError) setLinkError(null);
                    }}
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-[#25f4ee]/70 text-xs text-white placeholder-slate-500 focus:outline-none transition-all font-mono"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={isAnalyzing}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#fe2c55] to-[#ff0050] hover:opacity-90 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-rose-950/50 transition-all cursor-pointer whitespace-nowrap"
                  >
                    {isAnalyzing ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Analyzing Video & Comments...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Analyze & Play</span>
                      </>
                    )}
                  </button>

                  {/* Alternative MP4 upload */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="video/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all cursor-pointer"
                    title="Or upload raw MP4 video file from device"
                  >
                    <Upload className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {linkError && (
                <p className="text-xs text-rose-400 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> {linkError}
                </p>
              )}

              {/* Sample link pills for instant 1-click test */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
                <span className="text-slate-500 font-medium">Test links:</span>
                <button
                  type="button"
                  onClick={() => handlePresetLinkClick('https://www.tiktok.com/@alixearle/video/7328910481920194858')}
                  className="px-2 py-0.5 rounded bg-slate-800/80 hover:bg-slate-750 text-cyan-300 font-mono border border-slate-700 transition-all cursor-pointer"
                >
                  @alixearle (GRWM)
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetLinkClick('https://www.tiktok.com/@mrbeast/video/7310481920194858102')}
                  className="px-2 py-0.5 rounded bg-slate-800/80 hover:bg-slate-750 text-cyan-300 font-mono border border-slate-700 transition-all cursor-pointer"
                >
                  @mrbeast (Challenge)
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetLinkClick('https://www.tiktok.com/@khaby.lame/video/7219481920194858192')}
                  className="px-2 py-0.5 rounded bg-slate-800/80 hover:bg-slate-750 text-cyan-300 font-mono border border-slate-700 transition-all cursor-pointer"
                >
                  @khaby.lame (Skit)
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetLinkClick('https://www.tiktok.com/@techlead/video/7301948192019485811')}
                  className="px-2 py-0.5 rounded bg-slate-800/80 hover:bg-slate-750 text-cyan-300 font-mono border border-slate-700 transition-all cursor-pointer"
                >
                  @techlead (Tech)
                </button>
              </div>
            </form>
          </div>

          {/* 2. Video Narrative & Premise Summary */}
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-cyan-300 flex items-center gap-1.5 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                What is this video about?
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                {video.creatorHandle}
              </span>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed font-sans">
              {video.summary}
            </p>

            <div className="pt-2 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/60">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Hook & Pacing Mechanics
                </span>
                <p className="text-slate-300 text-[11px] leading-snug">
                  {video.hookSummary}
                </p>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/60">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Creator Intent
                </span>
                <p className="text-slate-300 text-[11px] leading-snug">
                  {video.creatorIntent}
                </p>
              </div>
            </div>

            {/* Diagnostic Gauges */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-center">
                <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 mb-0.5">
                  <Flame className="w-3 h-3 text-rose-400" />
                  <span>Virality</span>
                </div>
                <div className="text-base font-mono font-bold text-rose-400">{video.viralityScore}%</div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-center">
                <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 mb-0.5">
                  <AlertTriangle className="w-3 h-3 text-amber-400" />
                  <span>Controversy Risk</span>
                </div>
                <div className={`text-base font-mono font-bold ${video.riskIndex > 50 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {video.riskIndex} / 100
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-center">
                <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 mb-0.5">
                  <Compass className="w-3 h-3 text-cyan-400" />
                  <span>Alignment</span>
                </div>
                <div className="text-base font-mono font-bold text-cyan-300">{video.audienceAlignmentScore}%</div>
              </div>
            </div>
          </div>

          {/* 3. Side-by-Side Intelligence Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-900/90 border border-slate-800 rounded-xl text-xs">
            <button
              onClick={() => setActiveSideTab('comments')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                activeSideTab === 'comments'
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Analyzed Comments ({comments.length})</span>
            </button>

            <button
              onClick={() => setActiveSideTab('charts')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                activeSideTab === 'charts'
                  ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <PieChartIcon className="w-3.5 h-3.5" />
              <span>Visual Pie Charts</span>
            </button>

            <button
              onClick={() => setActiveSideTab('themes')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                activeSideTab === 'themes'
                  ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              <span>Extracted Themes ({video.keyThemes.length})</span>
            </button>

            {alerts.length > 0 && (
              <button
                onClick={() => setActiveSideTab('alerts')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  activeSideTab === 'alerts'
                    ? 'bg-gradient-to-r from-rose-500/20 to-amber-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Bell className="w-3.5 h-3.5 text-rose-400" />
                <span>Emotion Alerts ({alerts.filter((a) => !a.resolved).length})</span>
              </button>
            )}
          </div>

          {/* TAB 1: Analyzed Video Comments Feed Aligned Directly Beside Video */}
          {activeSideTab === 'comments' && (
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    TikTok Comments Sentiment Stream
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                    VADER + Hugging Face
                  </span>
                </div>

                {/* Comment search */}
                <div className="relative w-full sm:w-48">
                  <Search className="w-3 h-3 text-slate-500 absolute left-2.5 top-2.5 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search comments..."
                    value={commentSearch}
                    onChange={(e) => setCommentSearch(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-7 pr-2.5 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
              </div>

              {/* Quick Sentiment & Emotion Filters */}
              <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                <button
                  onClick={() => setLocalSentimentFilter('all')}
                  className={`px-2 py-0.5 rounded-md font-medium cursor-pointer transition-all ${
                    localSentimentFilter === 'all'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  All ({comments.length})
                </button>
                <button
                  onClick={() => setLocalSentimentFilter('positive')}
                  className={`px-2 py-0.5 rounded-md font-medium cursor-pointer transition-all ${
                    localSentimentFilter === 'positive'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  Positive ({stats.vader.positivePercent}%)
                </button>
                <button
                  onClick={() => setLocalSentimentFilter('negative')}
                  className={`px-2 py-0.5 rounded-md font-medium cursor-pointer transition-all ${
                    localSentimentFilter === 'negative'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  Negative ({stats.vader.negativePercent}%)
                </button>
                <button
                  onClick={() => setLocalSentimentFilter('hype')}
                  className={`px-2 py-0.5 rounded-md font-medium cursor-pointer transition-all ${
                    localSentimentFilter === 'hype'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  🔥 Hype
                </button>
                <button
                  onClick={() => setLocalSentimentFilter('outrage')}
                  className={`px-2 py-0.5 rounded-md font-medium cursor-pointer transition-all ${
                    localSentimentFilter === 'outrage'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  😡 Outrage
                </button>
                <button
                  onClick={() => setLocalSentimentFilter('sarcasm')}
                  className={`px-2 py-0.5 rounded-md font-medium cursor-pointer transition-all ${
                    localSentimentFilter === 'sarcasm'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  😏 Sarcasm
                </button>
                <button
                  onClick={() => setLocalSentimentFilter('joy')}
                  className={`px-2 py-0.5 rounded-md font-medium cursor-pointer transition-all ${
                    localSentimentFilter === 'joy'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  ✨ Joy
                </button>
              </div>

              {/* Comments List (Scrollable, max-h-[460px]) */}
              <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
                {filteredComments.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-400 bg-slate-950/40 rounded-xl border border-slate-800/60">
                    No comments match the selected filter.
                  </div>
                ) : (
                  filteredComments.map((c, index) => {
                    const isPositive = c.vader.classification === 'positive';
                    const isNegative = c.vader.classification === 'negative';

                    return (
                      <div
                        key={c.id || `cmt-card-${index}`}
                        className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700/80 transition-all space-y-2"
                      >
                        {/* Author & Header */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <img
                              src={c.avatar}
                              alt={c.author}
                              className="w-6 h-6 rounded-full object-cover border border-slate-700 flex-shrink-0"
                            />
                            <div className="min-w-0">
                              <span className="text-xs font-semibold text-slate-200 block truncate">
                                {c.author}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono block truncate">
                                {c.username} • {c.timeAgo}
                              </span>
                            </div>
                          </div>

                          {/* Dual Sentiment Badges */}
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            {/* VADER Compound */}
                            <span
                              className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${
                                isPositive
                                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                  : isNegative
                                  ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                                  : 'bg-slate-800 text-slate-300 border-slate-700'
                              }`}
                              title={`VADER Compound Score: ${c.vader.compound}`}
                            >
                              VADER: {c.vader.compound > 0 ? '+' : ''}
                              {c.vader.compound.toFixed(2)}
                            </span>

                            {/* Hugging Face Emotion */}
                            <span
                              className={`text-[10px] font-mono px-2 py-0.5 rounded capitalize border ${getEmotionBadgeColor(
                                c.huggingFace.primaryEmotion
                              )}`}
                              title={`Hugging Face GoEmotions: ${c.huggingFace.primaryEmotion} (${Math.round(
                                c.huggingFace.confidence * 100
                              )}% confidence)`}
                            >
                              HF: {c.huggingFace.primaryEmotion}
                            </span>
                          </div>
                        </div>

                        {/* Comment Content */}
                        <p className="text-xs text-slate-100 leading-relaxed font-sans pl-1 border-l-2 border-slate-800">
                          {c.text}
                        </p>

                        {/* Footer details: Likes & Discordance alert */}
                        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                          <span className="font-mono">❤️ {c.likes.toLocaleString()} likes</span>
                          {c.huggingFace.isSarcasticOrIrony && (
                            <span className="text-purple-400 font-mono flex items-center gap-1">
                              <Zap className="w-2.5 h-2.5" /> Sarcasm Flagged
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Add / Test Comment Form */}
              <form onSubmit={handleAddCustomComment} className="pt-2 border-t border-slate-800 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Test comment with VADER & Hugging Face..."
                  value={newCmtText}
                  onChange={(e) => setNewCmtText(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 font-sans"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 font-semibold text-xs transition-all cursor-pointer flex items-center gap-1"
                >
                  <Send className="w-3 h-3" />
                  <span>Analyze</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: Visual Pie Charts Aligned Directly Beside Video */}
          {activeSideTab === 'charts' && (
            <PieChartCard
              stats={stats}
              selectedFilter={selectedFilter}
              onSelectFilter={onSelectFilter}
            />
          )}

          {/* TAB 3: Extracted Themes Grid */}
          {activeSideTab === 'themes' && (
            <div className="space-y-2.5 p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center justify-between text-xs pb-1">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-cyan-400" />
                  Key Extracted Themes & Audience Discussions
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {video.keyThemes.length} Clusters
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {video.keyThemes.map((theme, index) => {
                  const isNegative = theme.sentiment === 'negative';
                  const isPositive = theme.sentiment === 'positive';
                  return (
                    <div
                      key={theme.id || `card-theme-${theme.hashtag || theme.name || index}-${index}`}
                      className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/90 hover:border-slate-700 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="font-semibold text-xs text-white tracking-tight">{theme.name}</span>
                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-medium ${
                              isPositive
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : isNegative
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                : 'bg-slate-700/30 text-slate-300 border border-slate-700'
                            }`}
                          >
                            {theme.hashtag}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-snug">{theme.description}</p>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px]">
                        <span className="text-slate-400 capitalize">
                          Emotion: <strong className="text-slate-200">{theme.dominantEmotion}</strong>
                        </span>
                        <div className="flex items-center gap-1 font-mono">
                          <span className="text-slate-500">Weight:</span>
                          <span className="text-cyan-300 font-bold">{theme.frequency || 35}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: Emotion Alerts List */}
          {activeSideTab === 'alerts' && alerts.length > 0 && (
            <div className="space-y-2.5 p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center justify-between text-xs pb-1">
                <span className="font-semibold text-rose-400 flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5" />
                  Active Emotion Threshold Alarms
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  {alerts.filter((a) => !a.resolved).length} Pending
                </span>
              </div>

              <div className="space-y-2">
                {alerts.map((alt) => (
                  <div
                    key={alt.id}
                    className={`p-3 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                      alt.severity === 'critical'
                        ? 'bg-rose-950/20 border-rose-500/40'
                        : 'bg-slate-950/70 border-slate-800'
                    }`}
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{alt.title}</span>
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                          {alt.metric}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-snug">{alt.description}</p>
                      {alt.sampleComment && (
                        <p className="text-[11px] text-slate-400 italic">"{alt.sampleComment}"</p>
                      )}
                    </div>

                    {!alt.resolved && (
                      <button
                        onClick={() => onAcknowledgeAlert?.(alt.id)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] font-medium transition-all cursor-pointer whitespace-nowrap flex-shrink-0"
                      >
                        Acknowledge
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
