import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cloud, Tag, Filter, X, ArrowUpRight, MessageSquare, Sparkles, TrendingUp } from 'lucide-react';
import { TagCloudItem, EmotionType, SentimentLabel } from '../types/sentiment';

interface Props {
  tags: TagCloudItem[];
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
  onFilterCommentsByKeyword: (keyword: string) => void;
}

export const InteractiveTagCloud: React.FC<Props> = ({
  tags,
  selectedTag,
  onSelectTag,
  onFilterCommentsByKeyword,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'hashtags' | 'slang' | 'controversial'>('all');
  const [inspectModalTag, setInspectModalTag] = useState<TagCloudItem | null>(null);

  // Filter tags based on sub-tab
  const filteredTags = tags.filter((t) => {
    if (activeTab === 'hashtags') return t.isHashtag;
    if (activeTab === 'slang') return !t.isHashtag && ['hype', 'joy', 'sarcasm'].includes(t.dominantEmotion);
    if (activeTab === 'controversial') return t.sentimentLabel === 'negative' || t.dominantEmotion === 'outrage';
    return true;
  });

  const getTagColorClass = (tag: TagCloudItem) => {
    if (tag.sentimentLabel === 'positive') {
      return 'text-emerald-400 border-emerald-500/30 bg-emerald-950/20 hover:bg-emerald-900/40 hover:border-emerald-400';
    }
    if (tag.sentimentLabel === 'negative') {
      return 'text-rose-400 border-rose-500/30 bg-rose-950/20 hover:bg-rose-900/40 hover:border-rose-400';
    }
    if (tag.dominantEmotion === 'sarcasm') {
      return 'text-purple-400 border-purple-500/30 bg-purple-950/20 hover:bg-purple-900/40 hover:border-purple-400';
    }
    return 'text-cyan-300 border-cyan-500/30 bg-cyan-950/20 hover:bg-cyan-900/40 hover:border-cyan-400';
  };

  const getFontSize = (count: number) => {
    if (count > 30) return 'text-xl font-bold py-1.5 px-3';
    if (count > 20) return 'text-base font-semibold py-1.5 px-2.5';
    if (count > 10) return 'text-sm font-medium py-1 px-2';
    return 'text-xs py-0.5 px-2';
  };

  return (
    <div className="bg-[#101726] border border-slate-800/80 rounded-2xl p-5 shadow-xl backdrop-blur-md relative overflow-hidden">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800/70">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 border border-slate-700/60 flex items-center justify-center text-cyan-400">
            <Cloud className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">Interactive Sentiment Tag Cloud</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                Deep NLP
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Click any trending keyword or hashtag to inspect sentiment polarity and quotes
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="inline-flex p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
              activeTab === 'all'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Keywords
          </button>
          <button
            onClick={() => setActiveTab('hashtags')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
              activeTab === 'hashtags'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Hashtags
          </button>
          <button
            onClick={() => setActiveTab('slang')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
              activeTab === 'slang'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Viral Slang
          </button>
          <button
            onClick={() => setActiveTab('controversial')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
              activeTab === 'controversial'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Risk & Outrage
          </button>
        </div>
      </div>

      {/* Cloud Container */}
      <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/80 min-h-[160px] flex flex-wrap items-center justify-center gap-2.5">
        {filteredTags.map((tagItem) => {
          const isSelected = selectedTag === tagItem.tag;
          return (
            <motion.button
              key={tagItem.tag}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setInspectModalTag(tagItem);
                onSelectTag(tagItem.tag);
              }}
              className={`rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 font-sans ${getTagColorClass(
                tagItem
              )} ${getFontSize(tagItem.count)} ${
                isSelected ? 'ring-2 ring-cyan-400 shadow-lg shadow-cyan-950/50' : ''
              }`}
            >
              <span>{tagItem.tag}</span>
              <span className="text-[10px] font-mono opacity-70 bg-black/30 px-1.5 py-0.2 rounded-md">
                {tagItem.count}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Cloud Legend strip */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Positive / Hype
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400" /> Outrage / Criticism
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400" /> Sarcasm / Satire
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" /> Inquiries / Neutral
          </span>
        </div>
        <span className="text-[11px] font-mono text-slate-500">
          Showing {filteredTags.length} extracted semantic tokens
        </span>
      </div>

      {/* Deep Dive Inspect Modal */}
      <AnimatePresence>
        {inspectModalTag && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              className="bg-[#101726] border border-slate-700 rounded-2xl p-5 max-w-lg w-full shadow-2xl relative"
            >
              <div className="flex items-start justify-between mb-4 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold">
                    #
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white tracking-tight">{inspectModalTag.tag}</h4>
                    <p className="text-xs text-slate-400">Semantic & Emotion Deep Dive</p>
                  </div>
                </div>
                <button
                  onClick={() => setInspectModalTag(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Tag Metrics Grid */}
              <div className="grid grid-cols-3 gap-2.5 mb-4 text-center">
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block mb-0.5">Mentions</span>
                  <span className="font-mono font-bold text-sm text-cyan-300">{inspectModalTag.count} times</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block mb-0.5">VADER Score</span>
                  <span
                    className={`font-mono font-bold text-sm ${
                      inspectModalTag.sentimentScore > 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {inspectModalTag.sentimentScore > 0 ? '+' : ''}
                    {inspectModalTag.sentimentScore.toFixed(2)}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block mb-0.5">Dominant Emotion</span>
                  <span className="font-bold text-sm capitalize text-purple-300">
                    {inspectModalTag.dominantEmotion}
                  </span>
                </div>
              </div>

              {/* Sample Comments Quote List */}
              <div className="space-y-2 mb-4">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                  Contextual Quotes from Audience
                </span>
                <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                  {inspectModalTag.sampleComments.map((cmt, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 text-xs text-slate-200">
                      "{cmt}"
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  onClick={() => setInspectModalTag(null)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    onFilterCommentsByKeyword(inspectModalTag.tag);
                    setInspectModalTag(null);
                  }}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-cyan-500 to-blue-500 hover:opacity-90 text-white shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Filter className="w-3.5 h-3.5" />
                  Filter Comment Table for "{inspectModalTag.tag}"
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
