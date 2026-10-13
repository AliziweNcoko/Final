import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Link as LinkIcon,
  Send,
  RefreshCw,
  TrendingUp,
  ShieldAlert,
  Flame,
  MessageSquare,
  Heart,
  ChevronDown,
  ChevronUp,
  Share2,
  ExternalLink,
  Check,
  Search,
  Filter,
  CheckCircle,
} from 'lucide-react';
import { VideoAnalysis, CommentItem, EmotionAlert, AggregateStats, EmotionType } from '../types/sentiment';
import { TikTokVideoPlayer } from './TikTokVideoPlayer';

interface Props {
  video: VideoAnalysis;
  comments: CommentItem[];
  stats: AggregateStats;
  alerts: EmotionAlert[];
  isAnalyzing: boolean;
  onAnalyzeLink: (link: string) => void;
  onAddComment: (text: string, author: string) => void;
  onNextVideo?: () => void;
  onPrevVideo?: () => void;
  onSelectPreset: (presetKey: string) => void;
  currentPresetKey: string;
}

export const TikTokFeedView: React.FC<Props> = ({
  video,
  comments,
  stats,
  alerts,
  isAnalyzing,
  onAnalyzeLink,
  onAddComment,
  onNextVideo,
  onPrevVideo,
  onSelectPreset,
  currentPresetKey,
}) => {
  const [inputLink, setInputLink] = useState('');
  const [commentSearch, setCommentSearch] = useState('');
  const [selectedSentiment, setSelectedSentiment] = useState<string>('all');
  const [newCommentText, setNewCommentText] = useState('');
  const [newAuthorName, setNewAuthorName] = useState('');
  const [linkError, setLinkError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'comments' | 'themes' | 'alerts'>('comments');

  const handleLinkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputLink.trim()) {
      setLinkError('Please paste a TikTok video link or username first.');
      return;
    }
    setLinkError(null);
    onAnalyzeLink(inputLink.trim());
  };

  const handleQuickTest = (url: string) => {
    setInputLink(url);
    setLinkError(null);
    onAnalyzeLink(url);
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    onAddComment(newCommentText.trim(), newAuthorName.trim() || 'TikTok Guest Viewer');
    setNewCommentText('');
  };

  // Filter comments
  const filteredComments = comments.filter((c) => {
    if (selectedSentiment !== 'all') {
      if (['positive', 'negative', 'neutral'].includes(selectedSentiment)) {
        if (c.vader.classification !== selectedSentiment) return false;
      } else {
        if (c.huggingFace.primaryEmotion !== selectedSentiment) return false;
      }
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

  const getEmotionBadge = (emotion: EmotionType) => {
    switch (emotion) {
      case 'joy':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'hype':
        return 'bg-[#25f4ee]/15 text-[#25f4ee] border-[#25f4ee]/30';
      case 'outrage':
        return 'bg-[#fe2c55]/15 text-[#fe2c55] border-[#fe2c55]/30';
      case 'sarcasm':
        return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
      case 'curiosity':
        return 'bg-blue-500/15 text-blue-300 border-blue-500/30';
      case 'disgust':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'sadness':
        return 'bg-neutral-500/15 text-neutral-300 border-neutral-500/30';
      default:
        return 'bg-neutral-800 text-neutral-400 border-neutral-700';
    }
  };

  return (
    <div className="flex flex-col space-y-4 max-w-6xl mx-auto w-full pb-10">
      {/* 1. TikTok Link Input Bar - Prominent & Unmissable */}
      <div className="p-4 rounded-2xl bg-[#121212] border border-[#222] shadow-xl">
        <form onSubmit={handleLinkSubmit} className="space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                <LinkIcon className="w-4 h-4 text-[#25f4ee]" />
              </div>
              <input
                type="text"
                placeholder="Paste TikTok video link (e.g. vm.tiktok.com, tiktok.com/@user/video/..., or @creator)"
                value={inputLink}
                onChange={(e) => {
                  setInputLink(e.target.value);
                  if (linkError) setLinkError(null);
                }}
                className="w-full pl-10 pr-20 py-3 rounded-xl bg-[#0a0a0a] border border-[#2a2a2a] focus:border-[#fe2c55] text-xs md:text-sm text-white placeholder-neutral-500 focus:outline-none transition-all font-mono"
              />
              {inputLink && (
                <button
                  type="button"
                  onClick={() => setInputLink('')}
                  className="absolute inset-y-0 right-3 flex items-center text-xs text-neutral-500 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={isAnalyzing}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#fe2c55] to-[#ff0050] hover:opacity-95 disabled:opacity-50 text-white font-bold text-xs md:text-sm shadow-lg shadow-rose-950/40 transition-all cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap flex-shrink-0"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Analyzing Link & Comments...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze & Play TikTok</span>
                </>
              )}
            </button>
          </div>

          {linkError && (
            <p className="text-xs text-[#fe2c55] font-medium flex items-center gap-1.5 pl-1">
              <span>⚠</span> {linkError}
            </p>
          )}

          {/* Quick 1-click test links */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs text-neutral-400">
            <span className="font-semibold text-neutral-500 text-[11px] uppercase tracking-wider">
              Instant Test:
            </span>
            <button
              type="button"
              onClick={() => handleQuickTest('https://www.tiktok.com/@scout2015/video/6718335390845095173')}
              className="px-2.5 py-1 rounded-lg bg-[#1a1a1a] hover:bg-[#252525] text-neutral-200 hover:text-white border border-[#333] transition-colors cursor-pointer text-[11px]"
            >
              🐶 @scout2015 (Viral Pets)
            </button>
            <button
              type="button"
              onClick={() => handleQuickTest('https://www.tiktok.com/@khaby.lame/video/7106594312292453678')}
              className="px-2.5 py-1 rounded-lg bg-[#1a1a1a] hover:bg-[#252525] text-neutral-200 hover:text-white border border-[#333] transition-colors cursor-pointer text-[11px]"
            >
              🤷 @khaby.lame (Comedy Skit)
            </button>
            <button
              type="button"
              onClick={() => handleQuickTest('https://www.tiktok.com/@zachking/video/7178345719391063342')}
              className="px-2.5 py-1 rounded-lg bg-[#1a1a1a] hover:bg-[#252525] text-neutral-200 hover:text-white border border-[#333] transition-colors cursor-pointer text-[11px]"
            >
              ✨ @zachking (Magic Illusion)
            </button>
            <button
              type="button"
              onClick={() => handleQuickTest('https://www.tiktok.com/@gordonramsayofficial/video/7204620603758365998')}
              className="px-2.5 py-1 rounded-lg bg-[#1a1a1a] hover:bg-[#252525] text-neutral-200 hover:text-white border border-[#333] transition-colors cursor-pointer text-[11px]"
            >
              🥪 @gordonramsay (Food Roast)
            </button>
          </div>
        </form>
      </div>

      {/* 2. TikTok FYP Stream: Real Video on Left, Comments & Intelligence on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Real TikTok Video Stream (5 cols) */}
        <div className="lg:col-span-5 w-full flex flex-col items-center">
          <div className="w-full max-w-[380px] lg:max-w-none">
            <TikTokVideoPlayer
              video={video}
              onJumpToComments={() => setActiveTab('comments')}
              videoSourceUrl={video.videoUrl}
            />
          </div>

          {/* Quick Next / Prev Feed Navigation */}
          <div className="flex items-center justify-center gap-3 pt-3 w-full">
            <button
              onClick={() => onSelectPreset('wand_review')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                currentPresetKey === 'wand_review'
                  ? 'bg-[#fe2c55] text-white shadow-md'
                  : 'bg-[#181818] text-neutral-400 hover:text-white border border-[#2a2a2a]'
              }`}
            >
              1. LED Wand
            </button>
            <button
              onClick={() => onSelectPreset('tech_skit')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                currentPresetKey === 'tech_skit'
                  ? 'bg-[#fe2c55] text-white shadow-md'
                  : 'bg-[#181818] text-neutral-400 hover:text-white border border-[#2a2a2a]'
              }`}
            >
              2. Tech Skit
            </button>
            <button
              onClick={() => onSelectPreset('food_burger')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                currentPresetKey === 'food_burger'
                  ? 'bg-[#fe2c55] text-white shadow-md'
                  : 'bg-[#181818] text-neutral-400 hover:text-white border border-[#2a2a2a]'
              }`}
            >
              3. Vegas Burger
            </button>
          </div>
        </div>

        {/* Right Side: TikTok Comments Stream & AI Intelligence Sheet (7 cols) */}
        <div className="lg:col-span-7 flex flex-col space-y-4 min-w-0">
          {/* Key Metrics Pill Bar */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="p-3 rounded-xl bg-[#141414] border border-[#252525] flex flex-col">
              <span className="text-[10px] uppercase font-bold text-neutral-400 flex items-center gap-1">
                <Flame className="w-3 h-3 text-[#fe2c55]" />
                Virality Score
              </span>
              <span className="text-xl font-black text-white font-mono mt-0.5">
                {video.viralityScore}%
              </span>
              <span className="text-[10px] text-neutral-500">TikTok Algorithm Index</span>
            </div>

            <div className="p-3 rounded-xl bg-[#141414] border border-[#252525] flex flex-col">
              <span className="text-[10px] uppercase font-bold text-neutral-400 flex items-center gap-1">
                <ShieldAlert className="w-3 h-3 text-[#25f4ee]" />
                Risk Index
              </span>
              <span
                className={`text-xl font-black font-mono mt-0.5 ${
                  video.riskIndex > 45 ? 'text-[#fe2c55]' : 'text-emerald-400'
                }`}
              >
                {video.riskIndex}%
              </span>
              <span className="text-[10px] text-neutral-500">
                {video.riskIndex > 45 ? 'Controversy Active' : 'Low Controversy'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#141414] border border-[#252525] flex flex-col">
              <span className="text-[10px] uppercase font-bold text-neutral-400 flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-purple-400" />
                VADER Ratio
              </span>
              <span
                className={`text-xl font-black font-mono mt-0.5 ${
                  stats.vader.averageCompound >= 0.05 ? 'text-emerald-400' : 'text-[#fe2c55]'
                }`}
              >
                {stats.vader.averageCompound > 0 ? '+' : ''}
                {stats.vader.averageCompound.toFixed(2)}
              </span>
              <span className="text-[10px] text-neutral-500">
                {stats.vader.positivePercent}% Pos / {stats.vader.negativePercent}% Neg
              </span>
            </div>
          </div>

          {/* Tab Navigation for Right Sheet */}
          <div className="flex items-center gap-1 p-1 bg-[#141414] rounded-xl border border-[#222]">
            <button
              onClick={() => setActiveTab('comments')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'comments'
                  ? 'bg-[#222] text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#25f4ee]" />
              <span>TikTok Comments ({filteredComments.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('themes')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'themes'
                  ? 'bg-[#222] text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#fe2c55]" />
              <span>Narrative & Themes ({video.keyThemes.length})</span>
            </button>
          </div>

          {/* TAB 1: TikTok Comments Feed with Sentiment Tagging */}
          {activeTab === 'comments' && (
            <div className="p-4 rounded-2xl bg-[#121212] border border-[#222] flex flex-col space-y-3">
              {/* Sentiment filter pills */}
              <div className="flex flex-wrap items-center gap-1 text-[11px]">
                <button
                  onClick={() => setSelectedSentiment('all')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                    selectedSentiment === 'all'
                      ? 'bg-white text-black'
                      : 'bg-[#1e1e1e] text-neutral-300 hover:text-white'
                  }`}
                >
                  All ({comments.length})
                </button>
                <button
                  onClick={() => setSelectedSentiment('positive')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                    selectedSentiment === 'positive'
                      ? 'bg-emerald-500 text-black'
                      : 'bg-[#1e1e1e] text-emerald-400 hover:text-emerald-300'
                  }`}
                >
                  Positive
                </button>
                <button
                  onClick={() => setSelectedSentiment('negative')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                    selectedSentiment === 'negative'
                      ? 'bg-[#fe2c55] text-white'
                      : 'bg-[#1e1e1e] text-[#fe2c55] hover:text-rose-300'
                  }`}
                >
                  Negative
                </button>
                <button
                  onClick={() => setSelectedSentiment('hype')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                    selectedSentiment === 'hype'
                      ? 'bg-[#25f4ee] text-black'
                      : 'bg-[#1e1e1e] text-[#25f4ee] hover:text-cyan-300'
                  }`}
                >
                  Hype 🔥
                </button>
                <button
                  onClick={() => setSelectedSentiment('sarcasm')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                    selectedSentiment === 'sarcasm'
                      ? 'bg-purple-500 text-white'
                      : 'bg-[#1e1e1e] text-purple-300 hover:text-purple-200'
                  }`}
                >
                  Sarcasm 💀
                </button>
              </div>

              {/* Search within comments */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search comments by keyword or username..."
                  value={commentSearch}
                  onChange={(e) => setCommentSearch(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0a0a0a] border border-[#252525] focus:border-[#25f4ee] text-xs text-white placeholder-neutral-500 focus:outline-none"
                />
              </div>

              {/* Comments Scrollable Stream */}
              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {filteredComments.length === 0 ? (
                  <div className="p-8 text-center text-xs text-neutral-500">
                    No comments match your filter criteria.
                  </div>
                ) : (
                  filteredComments.map((cmt) => (
                    <div
                      key={cmt.id}
                      className="p-3 rounded-xl bg-[#161616] border border-[#242424] hover:border-[#333] transition-all space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <img
                            src={cmt.avatar}
                            alt={cmt.author}
                            className="w-6 h-6 rounded-full object-cover border border-[#333] flex-shrink-0"
                          />
                          <span className="text-xs font-bold text-white truncate">{cmt.author}</span>
                          <span className="text-[10px] text-neutral-500 truncate">{cmt.username}</span>
                        </div>

                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {/* Emotion Badge */}
                          <span
                            className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${getEmotionBadge(
                              cmt.huggingFace.primaryEmotion
                            )}`}
                          >
                            {cmt.huggingFace.primaryEmotion}
                          </span>

                          <span className="text-[10px] text-neutral-500 flex items-center gap-1">
                            <Heart className="w-3 h-3 text-[#fe2c55]" />
                            {cmt.likes.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-neutral-200 leading-relaxed font-sans">{cmt.text}</p>

                      <div className="flex items-center justify-between text-[10px] text-neutral-500 pt-1">
                        <span>{cmt.timeAgo}</span>
                        <div className="flex items-center gap-2">
                          <span>
                            VADER: {cmt.vader.compound > 0 ? '+' : ''}
                            {cmt.vader.compound.toFixed(2)}
                          </span>
                          {cmt.huggingFace.isSarcasticOrIrony && (
                            <span className="text-purple-400 font-bold">Irony Flagged</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Add Comment Input Form */}
              <form onSubmit={handlePostComment} className="pt-2 border-t border-[#222] space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Your name or handle..."
                    value={newAuthorName}
                    onChange={(e) => setNewAuthorName(e.target.value)}
                    className="w-1/3 px-3 py-2 rounded-xl bg-[#0a0a0a] border border-[#252525] text-xs text-white placeholder-neutral-500 focus:outline-none"
                  />
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Add a comment to this TikTok video..."
                      value={newCommentText}
                      onChange={(e) => setNewCommentText(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#0a0a0a] border border-[#252525] focus:border-[#fe2c55] text-xs text-white placeholder-neutral-500 focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="p-2 rounded-xl bg-[#fe2c55] hover:bg-[#e0264b] text-white transition-colors cursor-pointer flex-shrink-0"
                    title="Send comment"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: Video Narrative & Premise Summary */}
          {activeTab === 'themes' && (
            <div className="p-4 rounded-2xl bg-[#121212] border border-[#222] space-y-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#25f4ee] flex items-center gap-1.5 mb-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Video Premise & Hook
                </h3>
                <p className="text-xs text-neutral-300 leading-relaxed bg-[#161616] p-3 rounded-xl border border-[#222]">
                  {video.summary}
                </p>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                  Extracted Content Themes
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {video.keyThemes.map((theme) => (
                    <div
                      key={theme.id}
                      className="p-3 rounded-xl bg-[#161616] border border-[#242424] space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{theme.name}</span>
                        <span className="text-[10px] font-mono text-[#25f4ee] bg-[#25f4ee]/10 px-1.5 py-0.5 rounded">
                          {theme.hashtag}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-400 leading-tight">
                        {theme.description}
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-neutral-500 pt-1">
                        <span>Freq: {theme.frequency}%</span>
                        <span
                          className={`font-bold capitalize ${
                            theme.sentiment === 'positive'
                              ? 'text-emerald-400'
                              : theme.sentiment === 'negative'
                              ? 'text-[#fe2c55]'
                              : 'text-neutral-400'
                          }`}
                        >
                          {theme.sentiment}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
