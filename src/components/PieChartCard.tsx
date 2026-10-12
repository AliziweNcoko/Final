import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PieChart, Sparkles, Filter, Info, ShieldCheck, Zap } from 'lucide-react';
import { AggregateStats, EmotionType, SentimentLabel } from '../types/sentiment';

interface PieSlice {
  label: string;
  value: number;
  percentage: number;
  color: string;
  glowColor: string;
  id: string;
  type: 'sentiment' | 'emotion' | 'concordance';
}

interface Props {
  stats: AggregateStats;
  selectedFilter: string | null;
  onSelectFilter: (filterId: string | null) => void;
}

export const PieChartCard: React.FC<Props> = ({ stats, selectedFilter, onSelectFilter }) => {
  const [activeTab, setActiveTab] = useState<'sentiment' | 'emotion' | 'comparison'>('emotion');
  const [hoveredSlice, setHoveredSlice] = useState<PieSlice | null>(null);

  // Colors aligned with modern TikTok dark aesthetic
  const EMOTION_COLORS: Record<EmotionType, { color: string; glow: string }> = {
    joy: { color: '#10b981', glow: 'rgba(16, 185, 129, 0.4)' },
    hype: { color: '#06b6d4', glow: 'rgba(6, 182, 212, 0.4)' },
    outrage: { color: '#ef4444', glow: 'rgba(239, 68, 68, 0.4)' },
    sarcasm: { color: '#a855f7', glow: 'rgba(168, 85, 247, 0.4)' },
    curiosity: { color: '#3b82f6', glow: 'rgba(59, 130, 246, 0.4)' },
    disgust: { color: '#f97316', glow: 'rgba(249, 115, 22, 0.4)' },
    sadness: { color: '#64748b', glow: 'rgba(100, 116, 139, 0.4)' },
    neutral: { color: '#475569', glow: 'rgba(71, 85, 105, 0.4)' },
  };

  // Build Slices based on active tab
  let slices: PieSlice[] = [];

  if (activeTab === 'sentiment') {
    // VADER Rule-Based Sentiment
    const pos = stats.vader.positivePercent;
    const neu = stats.vader.neutralPercent;
    const neg = stats.vader.negativePercent;
    slices = [
      {
        id: 'positive',
        label: 'Positive',
        value: Math.round((pos / 100) * stats.totalComments),
        percentage: pos,
        color: '#10b981',
        glowColor: 'rgba(16, 185, 129, 0.4)',
        type: 'sentiment' as const,
      },
      {
        id: 'neutral',
        label: 'Neutral',
        value: Math.round((neu / 100) * stats.totalComments),
        percentage: neu,
        color: '#64748b',
        glowColor: 'rgba(100, 116, 139, 0.3)',
        type: 'sentiment' as const,
      },
      {
        id: 'negative',
        label: 'Negative',
        value: Math.round((neg / 100) * stats.totalComments),
        percentage: neg,
        color: '#fe2c55', // TikTok signature pink/red
        glowColor: 'rgba(254, 44, 85, 0.4)',
        type: 'sentiment' as const,
      },
    ].filter((s) => s.percentage > 0);
  } else if (activeTab === 'emotion') {
    // Hugging Face Transformer Emotion Spectrum
    slices = (Object.entries(stats.huggingFace.emotions) as [EmotionType, { count: number; percent: number }][])
      .map(([emotion, data]) => ({
        id: emotion,
        label: emotion.charAt(0).toUpperCase() + emotion.slice(1),
        value: data.count,
        percentage: data.percent,
        color: EMOTION_COLORS[emotion]?.color || '#94a3b8',
        glowColor: EMOTION_COLORS[emotion]?.glow || 'rgba(148, 163, 184, 0.3)',
        type: 'emotion' as const,
      }))
      .filter((s) => s.percentage > 0)
      .sort((a, b) => b.percentage - a.percentage);
  } else {
    // Model Comparison / Concordance
    const agreement = stats.modelAgreementRate;
    const sarcasmDisagreement = Math.min(stats.huggingFace.sarcasmRate, 100 - agreement);
    const divergence = Math.max(0, 100 - agreement - sarcasmDisagreement);

    slices = [
      {
        id: 'agreement',
        label: 'VADER & Hugging Face Agree',
        value: Math.round((agreement / 100) * stats.totalComments),
        percentage: agreement,
        color: '#25f4ee', // TikTok signature cyan
        glowColor: 'rgba(37, 244, 238, 0.4)',
        type: 'concordance' as const,
      },
      {
        id: 'sarcasm',
        label: 'Sarcasm (HF Overrides VADER)',
        value: Math.round((sarcasmDisagreement / 100) * stats.totalComments),
        percentage: sarcasmDisagreement,
        color: '#a855f7',
        glowColor: 'rgba(168, 85, 247, 0.4)',
        type: 'concordance' as const,
      },
      {
        id: 'divergence',
        label: 'Polarity Nuance Divergence',
        value: Math.round((divergence / 100) * stats.totalComments),
        percentage: divergence,
        color: '#f59e0b',
        glowColor: 'rgba(245, 158, 11, 0.4)',
        type: 'concordance' as const,
      },
    ].filter((s) => s.percentage > 0);
  }

  // Calculate SVG Pie paths
  const radius = 95;
  const innerRadius = 55; // Donut style for modern HUD feel
  const center = 120;
  let cumulativeAngle = 0;

  const totalPercentage = slices.reduce((acc, s) => acc + s.percentage, 0) || 1;

  const paths = slices.map((slice) => {
    const sliceAngle = (slice.percentage / totalPercentage) * 360;
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + sliceAngle;
    cumulativeAngle += sliceAngle;

    // Convert polar to cartesian
    const toRad = (deg: number) => ((deg - 90) * Math.PI) / 180;
    const x1 = center + radius * Math.cos(toRad(startAngle));
    const y1 = center + radius * Math.sin(toRad(startAngle));
    const x2 = center + radius * Math.cos(toRad(endAngle));
    const y2 = center + radius * Math.sin(toRad(endAngle));

    const ix1 = center + innerRadius * Math.cos(toRad(endAngle));
    const iy1 = center + innerRadius * Math.sin(toRad(endAngle));
    const ix2 = center + innerRadius * Math.cos(toRad(startAngle));
    const iy2 = center + innerRadius * Math.sin(toRad(startAngle));

    const largeArc = sliceAngle > 180 ? 1 : 0;

    const d = `
      M ${x1} ${y1}
      A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}
      L ${ix1} ${iy1}
      A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${ix2} ${iy2}
      Z
    `;

    return {
      ...slice,
      d,
      midAngle: startAngle + sliceAngle / 2,
    };
  });

  return (
    <div className="bg-[#101726] border border-slate-800/80 rounded-2xl p-5 shadow-xl relative overflow-hidden backdrop-blur-md">
      {/* Top Header & Tab Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#fe2c55]/20 to-[#25f4ee]/20 border border-slate-700/60 flex items-center justify-center text-[#25f4ee]">
            <PieChart className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-white tracking-tight">Audience Sentiment & Emotion</h3>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-cyan-400 border border-cyan-500/20">
                Pie Visuals
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Interactive dual-engine visual breakdown (VADER & Hugging Face)
            </p>
          </div>
        </div>

        {/* Tab Switcher Pills */}
        <div className="inline-flex p-1 bg-slate-900/90 border border-slate-800 rounded-xl text-xs">
          <button
            onClick={() => setActiveTab('emotion')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'emotion'
                ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Hugging Face Emotions
          </button>
          <button
            onClick={() => setActiveTab('sentiment')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'sentiment'
                ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            VADER Polarity
          </button>
          <button
            onClick={() => setActiveTab('comparison')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'comparison'
                ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border border-purple-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Model Agreement
          </button>
        </div>
      </div>

      {/* Main Content Grid: Pie on left, details & legends on right */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        {/* SVG Pie Chart Canvas */}
        <div className="md:col-span-6 flex flex-col items-center justify-center relative py-2">
          <div className="relative w-[240px] h-[240px]">
            <svg
              viewBox="0 0 240 240"
              className="w-full h-full filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] cursor-pointer select-none"
            >
              <defs>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {paths.map((slice) => {
                const isSelected = selectedFilter === slice.id;
                const isHovered = hoveredSlice?.id === slice.id;

                return (
                  <path
                    key={slice.id}
                    d={slice.d}
                    fill={slice.color}
                    stroke="#0b0f17"
                    strokeWidth="2.5"
                    style={{
                      transformOrigin: '120px 120px',
                      transform: isSelected || isHovered ? 'scale(1.05)' : 'scale(1)',
                      transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      filter: isSelected || isHovered ? 'url(#glow)' : undefined,
                      opacity: hoveredSlice && !isHovered && !isSelected ? 0.45 : 1,
                    }}
                    onMouseEnter={() => setHoveredSlice(slice)}
                    onMouseLeave={() => setHoveredSlice(null)}
                    onClick={() => onSelectFilter(selectedFilter === slice.id ? null : slice.id)}
                  />
                );
              })}
            </svg>

            {/* Donut Center Metric Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center p-4">
              <AnimatePresence mode="wait">
                {hoveredSlice ? (
                  <motion.div
                    key={hoveredSlice.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex flex-col items-center"
                  >
                    <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                      {hoveredSlice.label}
                    </span>
                    <span
                      className="text-2xl font-bold font-mono tracking-tight"
                      style={{ color: hoveredSlice.color }}
                    >
                      {hoveredSlice.percentage.toFixed(1)}%
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {hoveredSlice.value} comments
                    </span>
                  </motion.div>
                ) : (
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex flex-col items-center"
                  >
                    {activeTab === 'sentiment' && (
                      <>
                        <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                          VADER Compound
                        </span>
                        <span
                          className={`text-2xl font-bold font-mono ${
                            stats.vader.averageCompound >= 0.05
                              ? 'text-emerald-400'
                              : stats.vader.averageCompound <= -0.05
                              ? 'text-rose-400'
                              : 'text-slate-300'
                          }`}
                        >
                          {stats.vader.averageCompound > 0 ? '+' : ''}
                          {stats.vader.averageCompound.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {stats.vader.averageCompound >= 0.05
                            ? 'Net Positive'
                            : stats.vader.averageCompound <= -0.05
                            ? 'Net Critical'
                            : 'Neutral Equilibrium'}
                        </span>
                      </>
                    )}

                    {activeTab === 'emotion' && (
                      <>
                        <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                          Dominant Emotion
                        </span>
                        <span className="text-xl font-bold capitalize text-cyan-300 tracking-tight">
                          {stats.huggingFace.dominantEmotion}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {stats.huggingFace.emotions[stats.huggingFace.dominantEmotion]?.percent.toFixed(1)}% share
                        </span>
                      </>
                    )}

                    {activeTab === 'comparison' && (
                      <>
                        <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                          Concordance
                        </span>
                        <span className="text-2xl font-bold font-mono text-cyan-300">
                          {stats.modelAgreementRate.toFixed(0)}%
                        </span>
                        <span className="text-[10px] text-slate-400">Model Agreement</span>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            <span>Click any slice to filter comment stream</span>
          </div>
        </div>

        {/* Right Side: Interactive Legend & Model Insights */}
        <div className="md:col-span-6 flex flex-col justify-between h-full space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 pb-1 border-b border-slate-800">
              <span className="font-medium text-slate-300">Category & Polarity</span>
              <span>Audience Ratio</span>
            </div>

            <div className="space-y-1.5 max-h-[190px] overflow-y-auto pr-1">
              {slices.map((slice) => {
                const isSelected = selectedFilter === slice.id;
                return (
                  <div
                    key={slice.id}
                    onClick={() => onSelectFilter(selectedFilter === slice.id ? null : slice.id)}
                    className={`flex items-center justify-between p-2 rounded-xl border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-slate-800/90 border-cyan-500/50 shadow-md ring-1 ring-cyan-500/40'
                        : 'bg-slate-900/60 border-slate-800/70 hover:bg-slate-850 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: slice.color, boxShadow: `0 0 8px ${slice.glowColor}` }}
                      />
                      <span className="font-medium text-slate-200">{slice.label}</span>
                      {isSelected && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">
                          Active Filter
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400 font-mono text-[11px]">{slice.value} cmt</span>
                      <span className="font-mono font-semibold text-slate-100">{slice.percentage.toFixed(1)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Context Footer Banner */}
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
            <Info className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div>
              {activeTab === 'sentiment' && (
                <span>
                  <strong>VADER Lexicon:</strong> Calculates compound sentiment (-1.0 to +1.0) considering TikTok slang, ALL CAPS emphasis, and viral emoji valences.
                </span>
              )}
              {activeTab === 'emotion' && (
                <span>
                  <strong>Hugging Face GoEmotions:</strong> Transformer attention heads detect subtle emotions including outrage, sarcasm roasts, and unboxing hype.
                </span>
              )}
              {activeTab === 'comparison' && (
                <span>
                  <strong>Transformer Concordance:</strong> Identifies where rule-based lexicons miss contextual TikTok sarcasm, giving deep creator protection.
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
