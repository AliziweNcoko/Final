import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageCircle,
  Heart,
  Search,
  Filter,
  X,
  Send,
  Zap,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  ThumbsDown,
  ThumbsUp,
  Minus,
} from 'lucide-react';
import { CommentItem, EmotionType, SentimentLabel } from '../types/sentiment';

interface Props {
  comments: CommentItem[];
  activeFilter: string | null;
  onClearFilter: () => void;
  onAddComment: (text: string, author: string) => void;
}

export const CommentsFeed: React.FC<Props> = ({
  comments,
  activeFilter,
  onClearFilter,
  onAddComment,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sentimentTab, setSentimentTab] = useState<'all' | 'positive' | 'negative' | 'neutral' | 'sarcasm'>('all');
  const [newCommentText, setNewCommentText] = useState('');
  const [newAuthorName, setNewAuthorName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter logic
  const filteredComments = comments.filter((c) => {
    // Active filter from pie chart or tag cloud
    if (activeFilter) {
      const lowerFilter = activeFilter.toLowerCase();
      const matchesEmotion = c.huggingFace.primaryEmotion.toLowerCase() === lowerFilter;
      const matchesSentiment = c.vader.classification.toLowerCase() === lowerFilter;
      const matchesKeyword = c.text.toLowerCase().includes(lowerFilter);
      const matchesTheme = c.themes.some((t) => t.toLowerCase().includes(lowerFilter));
      if (!matchesEmotion && !matchesSentiment && !matchesKeyword && !matchesTheme) {
        return false;
      }
    }

    // Sentiment tab
    if (sentimentTab === 'positive' && c.vader.classification !== 'positive') return false;
    if (sentimentTab === 'negative' && c.vader.classification !== 'negative') return false;
    if (sentimentTab === 'neutral' && c.vader.classification !== 'neutral') return false;
    if (sentimentTab === 'sarcasm' && !c.huggingFace.isSarcasticOrIrony) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.text.toLowerCase().includes(q) ||
        c.author.toLowerCase().includes(q) ||
        c.username.toLowerCase().includes(q)
      );
    }

    return true;
  });

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    setIsSubmitting(true);
    onAddComment(newCommentText.trim(), newAuthorName.trim() || 'TikTok Guest User');
    setNewCommentText('');
    setIsSubmitting(false);
  };

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
    <div className="bg-[#101726] border border-slate-800/80 rounded-2xl p-5 shadow-xl backdrop-blur-md relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800/70">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-rose-500/20 border border-slate-700/60 flex items-center justify-center text-cyan-400">
            <MessageCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">TikTok Comment Sentiment Explorer</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {comments.length} Analyzed
              </span>
            </div>
            <p className="text-xs text-slate-400">
              VADER lexicon vs Hugging Face transformer emotion classification side-by-side
            </p>
          </div>
        </div>

        {/* Search bar */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search comment text..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
          />
        </div>
      </div>

      {/* Filter Tabs & Active Filter Pill */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setSentimentTab('all')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              sentimentTab === 'all'
                ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Comments
          </button>
          <button
            onClick={() => setSentimentTab('positive')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              sentimentTab === 'positive'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Positive
          </button>
          <button
            onClick={() => setSentimentTab('negative')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              sentimentTab === 'negative'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Negative / Outrage
          </button>
          <button
            onClick={() => setSentimentTab('sarcasm')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              sentimentTab === 'sarcasm'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sarcastic Mockery
          </button>
          <button
            onClick={() => setSentimentTab('neutral')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              sentimentTab === 'neutral'
                ? 'bg-slate-800/80 text-slate-300 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Neutral / Inquiries
          </button>
        </div>

        {/* Clear Active Filter Pill if set */}
        {activeFilter && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-xs text-cyan-300">
            <span>Filter: <strong>{activeFilter}</strong></span>
            <button
              onClick={onClearFilter}
              className="p-0.5 hover:bg-cyan-500/30 rounded text-cyan-200 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Real-time Custom Comment Tester Input */}
      <form onSubmit={handlePostComment} className="mb-4 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <input
            type="text"
            placeholder="Test a live TikTok comment (e.g. 'This is literally a scam 💀' or 'Need this rn!! 🔥')"
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            className="flex-1 w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
          />
          <button
            type="submit"
            disabled={!newCommentText.trim() || isSubmitting}
            className="w-full sm:w-auto px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Analyze Instantly</span>
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
        <AnimatePresence>
          {filteredComments.length === 0 ? (
            <div className="p-8 text-center rounded-xl bg-slate-900/40 border border-slate-800 text-slate-400">
              <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs">No comments match the current search or sentiment filter.</p>
            </div>
          ) : (
            filteredComments.map((comment) => {
              const isPositive = comment.vader.classification === 'positive';
              const isNegative = comment.vader.classification === 'negative';
              const isDiscordant =
                (comment.vader.classification === 'positive' && comment.huggingFace.sentiment === 'negative') ||
                (comment.vader.classification === 'negative' && comment.huggingFace.sentiment === 'positive');

              return (
                <motion.div
                  key={comment.id}
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700/80 transition-all space-y-2.5"
                >
                  {/* Top user row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img
                        src={comment.avatar}
                        alt={comment.author}
                        className="w-7 h-7 rounded-full object-cover border border-slate-700"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-white">{comment.author}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{comment.username}</span>
                          {comment.isPinned && (
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                              Pinned
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span className="text-[11px] text-slate-500">{comment.timeAgo}</span>
                      <span className="flex items-center gap-1 font-mono text-[11px]">
                        <Heart className="w-3 h-3 text-rose-400 fill-rose-500/30" />
                        {comment.likes.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Comment Text */}
                  <p className="text-xs text-slate-200 leading-relaxed font-sans">
                    {comment.text}
                  </p>

                  {/* Dual Model Assessment Badges */}
                  <div className="pt-2 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* VADER Compound Score Badge */}
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-[11px]">
                        <span className="text-slate-400 text-[10px]">VADER:</span>
                        <span
                          className={`font-mono font-bold ${
                            isPositive
                              ? 'text-emerald-400'
                              : isNegative
                              ? 'text-rose-400'
                              : 'text-slate-300'
                          }`}
                        >
                          {comment.vader.compound > 0 ? '+' : ''}
                          {comment.vader.compound.toFixed(2)}
                        </span>
                        <span className="text-slate-400 text-[9px] capitalize">
                          ({comment.vader.classification})
                        </span>
                      </div>

                      {/* Hugging Face Emotion Badge */}
                      <div
                        className={`flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-medium ${getEmotionBadgeColor(
                          comment.huggingFace.primaryEmotion
                        )}`}
                      >
                        <span className="text-[10px] opacity-75">HF Emotion:</span>
                        <span className="capitalize font-semibold">
                          {comment.huggingFace.primaryEmotion}
                        </span>
                        <span className="text-[10px] font-mono opacity-80">
                          {Math.round(comment.huggingFace.confidence * 100)}%
                        </span>
                      </div>

                      {/* Sarcasm flag if detected */}
                      {comment.huggingFace.isSarcasticOrIrony && (
                        <span className="px-2 py-0.5 rounded-md bg-purple-950/60 text-purple-300 border border-purple-800/40 text-[10px] font-mono flex items-center gap-1">
                          💀 Sarcasm Flagged
                        </span>
                      )}

                      {/* Discordance Badge */}
                      {isDiscordant && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-950/60 text-amber-300 border border-amber-800/40 text-[10px] font-mono flex items-center gap-1">
                          <Zap className="w-3 h-3 text-amber-400" /> Model Divergence
                        </span>
                      )}
                    </div>

                    {/* Associated Themes */}
                    {comment.themes.length > 0 && (
                      <div className="flex items-center gap-1">
                        {comment.themes.map((th, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] text-slate-400 bg-slate-800/50 px-1.5 py-0.5 rounded"
                          >
                            #{th}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
