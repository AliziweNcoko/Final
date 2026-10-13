import React from 'react';
import {
  Home,
  LayoutDashboard,
  Video,
  PieChart,
  Bell,
  Cloud,
  MessageSquare,
  FileText,
  Compass,
  CheckCircle,
  Hash,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

export type NavView = 'foryou' | 'dashboard' | 'alerts' | 'video' | 'charts' | 'tags' | 'comments';

export interface CreatorQuickPick {
  handle: string;
  name: string;
  url: string;
  avatar: string;
  followers: string;
  verified: boolean;
}

export const SUGGESTED_CREATORS: CreatorQuickPick[] = [
  {
    handle: '@scout2015',
    name: 'Scout, Suki & Stella',
    url: 'https://www.tiktok.com/@scout2015/video/6718335390845095173',
    avatar: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=100&auto=format&fit=crop&q=80',
    followers: '3.4M',
    verified: true,
  },
  {
    handle: '@khaby.lame',
    name: 'Khaby Lame',
    url: 'https://www.tiktok.com/@khaby.lame/video/7106594312292453678',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    followers: '161.8M',
    verified: true,
  },
  {
    handle: '@zachking',
    name: 'Zach King',
    url: 'https://www.tiktok.com/@zachking/video/7178345719391063342',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    followers: '81.2M',
    verified: true,
  },
  {
    handle: '@gordonramsayofficial',
    name: 'Gordon Ramsay',
    url: 'https://www.tiktok.com/@gordonramsayofficial/video/7204620603758365998',
    avatar: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=100&auto=format&fit=crop&q=80',
    followers: '40.6M',
    verified: true,
  },
  {
    handle: '@elena_glowtech',
    name: 'Elena GlowTech',
    url: 'https://www.tiktok.com/@scout2015/video/6718335390845095173',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    followers: '1.2M',
    verified: true,
  },
];

export const TRENDING_TAGS = [
  { tag: 'TikTokViral', views: '4.8B' },
  { tag: 'LEDWandScam', views: '280M' },
  { tag: 'ComedyTok', views: '12.4B' },
  { tag: 'BurgerTok', views: '940M' },
  { tag: 'RealOrFake', views: '1.9B' },
];

interface Props {
  currentView: NavView;
  onSelectView: (view: NavView) => void;
  activeAlertsCount: number;
  onOpenReport: () => void;
  onSelectCreator?: (url: string) => void;
  onSelectTag?: (tag: string) => void;
}

export const NavigationRail: React.FC<Props> = ({
  currentView,
  onSelectView,
  activeAlertsCount,
  onOpenReport,
  onSelectCreator,
  onSelectTag,
}) => {
  const mainNavItems = [
    {
      id: 'foryou' as NavView,
      label: 'For You',
      icon: Home,
      highlight: true,
    },
    {
      id: 'dashboard' as NavView,
      label: 'Analytics Suite',
      icon: LayoutDashboard,
    },
    {
      id: 'alerts' as NavView,
      label: 'Emotion Alerts',
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
      label: 'Visual Charts',
      icon: PieChart,
    },
    {
      id: 'tags' as NavView,
      label: 'Tag Cloud NLP',
      icon: Cloud,
    },
    {
      id: 'comments' as NavView,
      label: 'Comments Feed',
      icon: MessageSquare,
    },
  ];

  return (
    <aside className="w-16 md:w-60 lg:w-64 bg-[#0a0a0a] border-r border-[#1f1f1f] flex flex-col justify-between flex-shrink-0 z-30 select-none overflow-y-auto overflow-x-hidden scrollbar-none transition-all duration-200">
      <div className="flex flex-col p-3 space-y-5">
        {/* TikTok Brand Logo */}
        <div
          onClick={() => onSelectView('foryou')}
          className="flex items-center gap-3 px-2 py-2 cursor-pointer group rounded-xl hover:bg-[#161616] transition-colors"
          title="TokPulse - TikTok Intelligence"
        >
          {/* Chromatic Aberration Music Note Mark */}
          <div className="relative w-9 h-9 flex items-center justify-center flex-shrink-0">
            {/* Cyan layer */}
            <div className="absolute inset-0 translate-x-[-1.5px] translate-y-[-1px] text-[#25f4ee] font-black text-2xl flex items-center justify-center opacity-90">
              ♪
            </div>
            {/* Red layer */}
            <div className="absolute inset-0 translate-x-[1.5px] translate-y-[1px] text-[#fe2c55] font-black text-2xl flex items-center justify-center opacity-90">
              ♪
            </div>
            {/* Center white layer */}
            <div className="relative text-white font-black text-2xl flex items-center justify-center">
              ♪
            </div>
          </div>

          <div className="hidden md:flex flex-col min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-white font-black text-lg tracking-tight">TokPulse</span>
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#fe2c55]/20 text-[#fe2c55] border border-[#fe2c55]/30">
                FYP AI
              </span>
            </div>
            <span className="text-[10px] text-neutral-400 truncate">TikTok Sentiment Engine</span>
          </div>
        </div>

        {/* Primary Navigation Links */}
        <nav className="flex flex-col space-y-1">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            const isForYou = item.id === 'foryou';

            return (
              <button
                key={item.id}
                onClick={() => onSelectView(item.id)}
                className={`flex items-center gap-3.5 px-3 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer group text-left ${
                  isActive
                    ? 'text-[#fe2c55] bg-[#1a1a1a] shadow-sm'
                    : 'text-neutral-300 hover:text-white hover:bg-[#141414]'
                }`}
                title={item.label}
              >
                <div className="relative flex items-center justify-center">
                  <Icon
                    className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-[#fe2c55] stroke-[2.5]' : 'text-neutral-400 group-hover:text-white'
                    }`}
                  />
                  {/* Badge count for alerts */}
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-1.5 -right-2 min-w-4 h-4 px-1 rounded-full bg-[#fe2c55] text-white font-mono text-[9px] font-bold flex items-center justify-center shadow-md animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </div>

                <span className="hidden md:inline truncate">{item.label}</span>

                {isForYou && (
                  <span className="hidden lg:inline ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#25f4ee]/15 text-[#25f4ee] border border-[#25f4ee]/30 uppercase">
                    Feed
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* TikTok Suggested Creators (Desktop Only) */}
        <div className="hidden md:flex flex-col pt-3 border-t border-[#1e1e1e] space-y-2">
          <div className="flex items-center justify-between px-2 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
            <span>Viral Creators</span>
            <span className="text-[10px] text-neutral-600 font-normal">Click to load</span>
          </div>

          <div className="flex flex-col space-y-1">
            {SUGGESTED_CREATORS.map((creator) => (
              <button
                key={creator.handle}
                onClick={() => onSelectCreator?.(creator.url)}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-[#181818] transition-colors cursor-pointer group text-left w-full"
                title={`Analyze video by ${creator.name}`}
              >
                <img
                  src={creator.avatar}
                  alt={creator.name}
                  className="w-7 h-7 rounded-full object-cover border border-[#333] flex-shrink-0"
                />
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-neutral-200 group-hover:text-white truncate">
                      {creator.handle}
                    </span>
                    {creator.verified && (
                      <CheckCircle className="w-3 h-3 text-[#20d5ec] fill-[#20d5ec]/20 flex-shrink-0" />
                    )}
                  </div>
                  <span className="text-[10px] text-neutral-400 truncate">{creator.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Trending Hashtags (Desktop Only) */}
        <div className="hidden lg:flex flex-col pt-3 border-t border-[#1e1e1e] space-y-2">
          <div className="px-2 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
            Discover
          </div>
          <div className="flex flex-col space-y-1">
            {TRENDING_TAGS.map((t) => (
              <button
                key={t.tag}
                onClick={() => onSelectTag?.(t.tag)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-[#181818] text-neutral-400 hover:text-white transition-colors cursor-pointer text-xs group text-left"
              >
                <Hash className="w-3.5 h-3.5 text-[#25f4ee] flex-shrink-0" />
                <span className="truncate group-hover:text-[#fe2c55] transition-colors">
                  {t.tag}
                </span>
                <span className="ml-auto text-[10px] text-neutral-600">{t.views}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Actions: Export Report & TikTok footer */}
      <div className="p-3 border-t border-[#1e1e1e] space-y-2">
        <button
          onClick={onOpenReport}
          className="w-full flex items-center justify-center md:justify-start gap-2.5 px-3 py-2.5 rounded-xl bg-gradient-to-r from-[#fe2c55]/20 to-[#25f4ee]/20 hover:from-[#fe2c55]/30 hover:to-[#25f4ee]/30 text-white font-bold text-xs border border-[#333] transition-all cursor-pointer"
          title="Export Insights Report"
        >
          <FileText className="w-4 h-4 text-[#25f4ee] flex-shrink-0" />
          <span className="hidden md:inline truncate">Executive Report</span>
        </button>

        <div className="hidden md:block px-2 text-[10px] text-neutral-600 leading-tight">
          TokPulse TikTok Intelligence © 2026
        </div>
      </div>
    </aside>
  );
};
