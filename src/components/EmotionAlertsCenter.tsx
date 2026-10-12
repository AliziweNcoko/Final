import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell,
  AlertTriangle,
  Flame,
  Zap,
  ShieldAlert,
  ArrowRight,
  Search,
  CheckCircle,
  Clock,
  Sparkles,
  Volume2,
  VolumeX,
  Sliders,
  Filter,
} from 'lucide-react';
import { EmotionAlert, AlertCategory, AlertSeverity } from '../types/sentiment';

interface Props {
  alerts: EmotionAlert[];
  onSelectCommentFilter: (keyword: string) => void;
  onAcknowledgeAlert: (alertId: string) => void;
}

export const EmotionAlertsCenter: React.FC<Props> = ({
  alerts,
  onSelectCommentFilter,
  onAcknowledgeAlert,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<AlertCategory>('all');
  const [subTab, setSubTab] = useState<'all' | 'critical' | 'surges' | 'resolved'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Category counts inspired by the screenshot's left list with badges
  const categoryCounts = {
    all: alerts.length,
    outrage: alerts.filter((a) => a.category === 'outrage').length,
    hype: alerts.filter((a) => a.category === 'hype').length,
    sarcasm: alerts.filter((a) => a.category === 'sarcasm').length,
    risk: alerts.filter((a) => a.category === 'risk').length,
    disagreement: alerts.filter((a) => a.category === 'disagreement').length,
  };

  // Subtab counts
  const criticalCount = alerts.filter((a) => a.severity === 'critical').length;
  const surgeCount = alerts.filter((a) => a.category === 'hype' || a.category === 'outrage').length;
  const resolvedCount = alerts.filter((a) => a.resolved).length;

  // Filtered alerts
  const filteredAlerts = alerts.filter((alert) => {
    // Category filter
    if (selectedCategory !== 'all' && alert.category !== selectedCategory) {
      return false;
    }

    // Subtab filter
    if (subTab === 'critical' && alert.severity !== 'critical') return false;
    if (subTab === 'surges' && !['hype', 'outrage'].includes(alert.category)) return false;
    if (subTab === 'resolved' && !alert.resolved) return false;
    if (subTab !== 'resolved' && alert.resolved && subTab !== 'all') return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        alert.title.toLowerCase().includes(q) ||
        alert.description.toLowerCase().includes(q) ||
        (alert.sampleComment && alert.sampleComment.toLowerCase().includes(q))
      );
    }

    return true;
  });

  const getSeverityBadge = (sev: AlertSeverity) => {
    switch (sev) {
      case 'critical':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      case 'high':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'medium':
        return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
      case 'info':
      default:
        return 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30';
    }
  };

  return (
    <div className="bg-[#101726] border border-slate-800/80 rounded-2xl shadow-xl backdrop-blur-md overflow-hidden">
      {/* Top Banner / Breadcrumb inspired by reference screenshot */}
      <div className="px-5 py-3.5 bg-slate-900/60 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="hover:text-slate-200 cursor-pointer">Intelligence</span>
          <span>&gt;</span>
          <span className="hover:text-slate-200 cursor-pointer">Real-time Signals</span>
          <span>&gt;</span>
          <span className="text-white font-medium">Emotion Alert Center</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Chime Alerts ON</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline text-slate-500">Muted</span>
              </>
            )}
          </button>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
            Live Monitoring
          </span>
        </div>
      </div>

      {/* Main 2-Column Layout (Matching the reference screenshot style) */}
      <div className="grid grid-cols-1 md:grid-cols-12 min-h-[460px]">
        {/* Left Sub-sidebar: Search & Categories with badge counts */}
        <div className="md:col-span-4 lg:col-span-3 border-r border-slate-800/80 p-4 bg-slate-950/40 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Alert Feeds</h3>
            <span className="text-[11px] text-slate-400 font-mono">{alerts.length} total</span>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search alerts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          {/* Category List with badge numbers like the screenshot */}
          <div className="space-y-1">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                selectedCategory === 'all'
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm'
                  : 'text-slate-300 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Bell className="w-4 h-4 text-cyan-400" />
                <span>All Alerts</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                {categoryCounts.all}
              </span>
            </button>

            <button
              onClick={() => setSelectedCategory('outrage')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                selectedCategory === 'outrage'
                  ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30 shadow-sm'
                  : 'text-slate-300 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>Outrage Spikes</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-950/60 text-rose-300 border border-rose-800/40">
                {categoryCounts.outrage}
              </span>
            </button>

            <button
              onClick={() => setSelectedCategory('hype')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                selectedCategory === 'hype'
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-300 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Flame className="w-4 h-4 text-emerald-400" />
                <span>Hype Surges</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-800/40">
                {categoryCounts.hype}
              </span>
            </button>

            <button
              onClick={() => setSelectedCategory('sarcasm')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                selectedCategory === 'sarcasm'
                  ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30 shadow-sm'
                  : 'text-slate-300 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>Sarcasm Roasts</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-950/60 text-purple-300 border border-purple-800/40">
                {categoryCounts.sarcasm}
              </span>
            </button>

            <button
              onClick={() => setSelectedCategory('risk')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                selectedCategory === 'risk'
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm'
                  : 'text-slate-300 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span>Brand Risk</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-950/60 text-amber-300 border border-amber-800/40">
                {categoryCounts.risk}
              </span>
            </button>

            <button
              onClick={() => setSelectedCategory('disagreement')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                selectedCategory === 'disagreement'
                  ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30 shadow-sm'
                  : 'text-slate-300 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Zap className="w-4 h-4 text-blue-400" />
                <span>Model Discordance</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-950/60 text-blue-300 border border-blue-800/40">
                {categoryCounts.disagreement}
              </span>
            </button>
          </div>

          {/* Threshold Automation Settings Box */}
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 space-y-2 mt-4">
            <div className="flex items-center justify-between text-slate-300 font-semibold">
              <span className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                Active Thresholds
              </span>
            </div>
            <div className="space-y-1 font-mono text-[10px]">
              <div className="flex justify-between">
                <span>Outrage Alert:</span>
                <span className="text-rose-400">&gt; 25%</span>
              </div>
              <div className="flex justify-between">
                <span>Hype Surge:</span>
                <span className="text-emerald-400">&gt; 20%</span>
              </div>
              <div className="flex justify-between">
                <span>Brand Risk:</span>
                <span className="text-amber-400">&gt; 50/100</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Main Panel: Sub-tab Pills and Alert Cards */}
        <div className="md:col-span-8 lg:col-span-9 p-5 space-y-4">
          {/* Main header in right column */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white capitalize">
                  {selectedCategory === 'all' ? 'Real-Time Emotion Alerts' : `${selectedCategory} Alerts`}
                </h3>
                <p className="text-xs text-slate-400">
                  Automated anomalies and velocity shifts flagged in TikTok comments
                </p>
              </div>
            </div>

            {/* Filter Pills matching "Show all 8 | Conversions 2 | Leads activity 2" in screenshot */}
            <div className="flex items-center gap-2 border-b border-slate-800 pb-1">
              <button
                onClick={() => setSubTab('all')}
                className={`text-xs pb-1 font-medium transition-colors border-b-2 ${
                  subTab === 'all'
                    ? 'border-cyan-400 text-cyan-300 font-semibold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Show all <span className="font-mono text-[10px] ml-0.5">({alerts.length})</span>
              </button>
              <button
                onClick={() => setSubTab('critical')}
                className={`text-xs pb-1 font-medium transition-colors border-b-2 ${
                  subTab === 'critical'
                    ? 'border-rose-400 text-rose-300 font-semibold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Critical Spikes <span className="font-mono text-[10px] ml-0.5">({criticalCount})</span>
              </button>
              <button
                onClick={() => setSubTab('surges')}
                className={`text-xs pb-1 font-medium transition-colors border-b-2 ${
                  subTab === 'surges'
                    ? 'border-emerald-400 text-emerald-300 font-semibold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Surge Activity <span className="font-mono text-[10px] ml-0.5">({surgeCount})</span>
              </button>
              <button
                onClick={() => setSubTab('resolved')}
                className={`text-xs pb-1 font-medium transition-colors border-b-2 ${
                  subTab === 'resolved'
                    ? 'border-purple-400 text-purple-300 font-semibold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Resolved <span className="font-mono text-[10px] ml-0.5">({resolvedCount})</span>
              </button>
            </div>
          </div>

          {/* Alert Cards Feed */}
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            <AnimatePresence>
              {filteredAlerts.length === 0 ? (
                <div className="p-8 text-center rounded-xl bg-slate-900/40 border border-slate-800 text-slate-400 space-y-2">
                  <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
                  <h4 className="text-sm font-semibold text-white">No active alerts in this view</h4>
                  <p className="text-xs">All emotional thresholds are currently operating within baseline limits.</p>
                </div>
              ) : (
                filteredAlerts.map((alert) => (
                  <motion.div
                    key={alert.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`p-4 rounded-xl border transition-all ${
                      alert.resolved
                        ? 'bg-slate-900/30 border-slate-800/50 opacity-60'
                        : 'bg-slate-900/80 border-slate-800/90 hover:border-slate-700 shadow-sm'
                    }`}
                  >
                    {/* Top Row: Title, Severity, and Time Ago */}
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full border uppercase tracking-wider font-semibold ${getSeverityBadge(
                            alert.severity
                          )}`}
                        >
                          {alert.severity}
                        </span>
                        <h4 className="text-xs font-bold text-white tracking-tight">{alert.title}</h4>
                      </div>

                      <div className="flex items-center gap-1.5 text-slate-400 text-[11px] flex-shrink-0">
                        <Clock className="w-3 h-3" />
                        <span>{alert.timeAgo}</span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-300 leading-relaxed mb-3">
                      {alert.description}
                    </p>

                    {/* Transition badge row inspired by the reference screenshot (e.g. Courtney Henry: Lead -> Buyer) */}
                    <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/70 text-xs mb-3">
                      <div className="flex items-center gap-2">
                        {alert.authorAvatar ? (
                          <img
                            src={alert.authorAvatar}
                            alt="Trigger User"
                            className="w-5 h-5 rounded-full object-cover border border-slate-700"
                          />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-cyan-300">
                            TK
                          </div>
                        )}
                        <span className="text-slate-400 text-[11px]">Threshold State:</span>
                        <span className="font-mono text-[11px] text-slate-400">{alert.prevStatus}</span>
                        <ArrowRight className="w-3 h-3 text-cyan-400" />
                        <span className="font-mono text-[11px] font-bold text-rose-400">{alert.currentStatus}</span>
                      </div>

                      <div className="flex items-center gap-2 font-mono text-[11px]">
                        <span className="text-slate-500">Metric:</span>
                        <span className="text-cyan-300 font-semibold">{alert.metric}</span>
                      </div>
                    </div>

                    {/* Sample comment quote if present */}
                    {alert.sampleComment && (
                      <div className="text-[11px] text-slate-300 italic bg-slate-950/40 p-2 rounded border border-slate-800/50 mb-3 line-clamp-2">
                        "{alert.sampleComment}"
                      </div>
                    )}

                    {/* Bottom Action Buttons */}
                    <div className="flex items-center justify-end gap-2 text-xs">
                      <button
                        onClick={() => {
                          const keyword = alert.category === 'outrage' ? 'scam' : alert.category === 'hype' ? 'obsessed' : 'light';
                          onSelectCommentFilter(keyword);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 transition-all font-medium flex items-center gap-1 cursor-pointer"
                      >
                        <Filter className="w-3 h-3" />
                        Filter Matching Comments
                      </button>

                      {!alert.resolved ? (
                        <button
                          onClick={() => onAcknowledgeAlert(alert.id)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all font-medium flex items-center gap-1 cursor-pointer"
                        >
                          <CheckCircle className="w-3 h-3 text-emerald-400" />
                          Acknowledge
                        </button>
                      ) : (
                        <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Acknowledged
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};
