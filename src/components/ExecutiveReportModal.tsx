import React from 'react';
import { motion } from 'motion/react';
import {
  X,
  Printer,
  Download,
  Share2,
  Sparkles,
  PieChart,
  ShieldAlert,
  Flame,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import { VideoAnalysis, AggregateStats } from '../types/sentiment';

interface Props {
  video: VideoAnalysis;
  stats: AggregateStats;
  onClose: () => void;
}

export const ExecutiveReportModal: React.FC<Props> = ({ video, stats, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({ video, stats }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `TokPulse_Report_${video.id}_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.94 }}
        className="bg-[#0b0f17] border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-4xl w-full shadow-2xl relative my-8 text-slate-100"
      >
        {/* Header Actions */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#fe2c55] to-[#25f4ee] flex items-center justify-center text-black font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Executive TikTok Insights Report</h2>
              <p className="text-xs text-slate-400">Audience Emotion & Sentiment Intelligence Brief</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white border border-slate-700 transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-cyan-400" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={handleExportJSON}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-xs font-semibold text-cyan-300 border border-cyan-500/40 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Report Content */}
        <div className="space-y-6 mt-6 text-xs leading-relaxed">
          {/* Executive Overview Banner */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Target Video</span>
              <span className="font-bold text-white line-clamp-1">{video.title}</span>
              <span className="text-[10px] text-cyan-400">{video.creatorHandle}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">VADER Polarity</span>
              <span className={`text-base font-bold font-mono ${stats.vader.averageCompound >= 0.05 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {stats.vader.averageCompound > 0 ? '+' : ''}{stats.vader.averageCompound.toFixed(2)} Compound
              </span>
              <span className="text-[10px] text-slate-500 block">{stats.vader.positivePercent}% Pos / {stats.vader.negativePercent}% Neg</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Dominant Emotion</span>
              <span className="text-base font-bold capitalize text-cyan-300 block">
                {stats.huggingFace.dominantEmotion}
              </span>
              <span className="text-[10px] text-slate-500 block">GoEmotions Transformer</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Risk & Virality</span>
              <span className="text-base font-bold font-mono text-amber-400 block">
                Risk {video.riskIndex}/100
              </span>
              <span className="text-[10px] text-rose-400 block">Virality: {video.viralityScore}%</span>
            </div>
          </div>

          {/* Section 1: Video Narrative & Hook Synthesis */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              1. Video Content & Extracted Themes
            </h3>
            <p className="text-slate-300 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
              {video.summary}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Retention Hook Mechanics
                </span>
                <p className="text-slate-300">{video.hookSummary}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Creator Strategic Intent
                </span>
                <p className="text-slate-300">{video.creatorIntent}</p>
              </div>
            </div>
          </div>

          {/* Section 2: Audience Emotion Spectrum (Hugging Face) */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <PieChart className="w-4 h-4 text-purple-400" />
              2. Trending Audience Emotion Distribution (Hugging Face Model)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {Object.entries(stats.huggingFace.emotions).map(([emotion, item]) => (
                <div key={emotion} className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block capitalize">
                    {emotion}
                  </span>
                  <span className="text-base font-bold font-mono text-cyan-300">
                    {item.percent.toFixed(1)}%
                  </span>
                  <span className="text-[10px] text-slate-500 block">{item.count} comments</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Strategic Recommendations */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              3. Strategic Playbook & Brand Action Items
            </h3>
            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  <h4 className="font-semibold text-emerald-300 text-xs">Address Pricing Paywall Upfront in Pinned Response</h4>
                  <p className="text-slate-300 text-[11px] mt-0.5">
                    Pin a clarifying comment or film Part 2 explaining why the software subscription exists or detailing free-tier features to alleviate the 38.4% Outrage Spike.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/30 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  <h4 className="font-semibold text-cyan-300 text-xs">Amplify High-Performing Aesthetic Visuals</h4>
                  <p className="text-slate-300 text-[11px] mt-0.5">
                    Double down on macro lighting shots and raw skin texture transitions, as the Skincare Aesthetics theme scored an 82% positive sentiment in audience reaction.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/30 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                  3
                </span>
                <div>
                  <h4 className="font-semibold text-purple-300 text-xs">Lean Into Relatable Humor to Disarm Sarcasm</h4>
                  <p className="text-slate-300 text-[11px] mt-0.5">
                    Acknowledge the "charging for photons" meme in creator stories to transform viral roasting into authentic comedic rapport.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="mt-8 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>Generated by TokPulse Sentiment Intelligence Engine</span>
          <span>Validated with VADER & Hugging Face GoEmotions</span>
        </div>
      </motion.div>
    </div>
  );
};
