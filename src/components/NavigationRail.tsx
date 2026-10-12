import React from 'react';
import {
  LayoutDashboard,
  Video,
  PieChart,
  Bell,
  Cloud,
  MessageSquare,
  FileText,
  Sliders,
  Sparkles,
  Zap,
} from 'lucide-react';

export type NavView = 'dashboard' | 'alerts' | 'video' | 'charts' | 'tags' | 'comments';

interface Props {
  currentView: NavView;
  onSelectView: (view: NavView) => void;
  activeAlertsCount: number;
  onOpenReport: () => void;
}

export const NavigationRail: React.FC<Props> = ({
  currentView,
  onSelectView,
  activeAlertsCount,
  onOpenReport,
}) => {
  const navItems = [
    {
      id: 'dashboard' as NavView,
      label: 'Main Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'alerts' as NavView,
      label: 'Emotion Alert Center',
      icon: Bell,
      badge: activeAlertsCount,
    },
    {
      id: 'video' as NavView,
      label: 'Video & Themes',
      icon: Video,
    },
    {
      id: 'charts' as NavView,
      label: 'Pie Chart Visuals',
      icon: PieChart,
    },
    {
      id: 'tags' as NavView,
      label: 'Tag Cloud NLP',
      icon: Cloud,
    },
    {
      id: 'comments' as NavView,
      label: 'TikTok Comments',
      icon: MessageSquare,
    },
  ];

  return (
    <aside className="w-16 md:w-20 bg-[#090d16] border-r border-slate-800/80 flex flex-col items-center py-5 justify-between flex-shrink-0 z-30 select-none">
      {/* Brand Icon */}
      <div className="flex flex-col items-center space-y-6">
        <div
          onClick={() => onSelectView('dashboard')}
          className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#fe2c55] via-purple-600 to-[#25f4ee] p-0.5 shadow-lg shadow-rose-950/40 cursor-pointer hover:scale-105 transition-transform flex items-center justify-center group"
          title="TokPulse Home"
        >
          <div className="w-full h-full bg-[#0b0f17] rounded-[14px] flex items-center justify-center text-white font-extrabold text-lg tracking-tighter">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#fe2c55] to-[#25f4ee]">
              TK
            </span>
          </div>
        </div>

        {/* Navigation Item Icons */}
        <nav className="flex flex-col space-y-2.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectView(item.id)}
                className={`relative w-11 h-11 rounded-xl flex items-center justify-center transition-all cursor-pointer group ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-md shadow-cyan-950/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                }`}
                title={item.label}
              >
                <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />

                {/* Active Indicator Bar on left */}
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 bg-cyan-400 rounded-r-full" />
                )}

                {/* Badge count for alerts */}
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-mono text-[9px] font-bold flex items-center justify-center shadow-md animate-pulse">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Action: Executive Report Trigger */}
      <div className="flex flex-col items-center space-y-3">
        <button
          onClick={onOpenReport}
          className="w-11 h-11 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-cyan-500/40 hover:bg-slate-850 flex items-center justify-center transition-all cursor-pointer"
          title="Export Insights Report"
        >
          <FileText className="w-5 h-5 text-cyan-400" />
        </button>
      </div>
    </aside>
  );
};
