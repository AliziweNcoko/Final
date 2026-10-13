import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Music2,
  ExternalLink,
  Copy,
  Check,
  Sparkles,
  Maximize2,
  CheckCircle2,
} from 'lucide-react';
import { VideoAnalysis } from '../types/sentiment';

interface Props {
  video: VideoAnalysis;
  onJumpToComments?: () => void;
  videoSourceUrl?: string | null;
}

export const TikTokVideoPlayer: React.FC<Props> = ({
  video,
  onJumpToComments,
  videoSourceUrl,
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(60);
  const [likesCount, setLikesCount] = useState(parseInt(video.likes.replace(/[^0-9]/g, '')) * 1000 || 418200);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [floatingHearts, setFloatingHearts] = useState<{ id: number; x: number; y: number }[]>([]);
  // Default to real TikTok embed so the real video displays on the side immediately
  const [viewMode, setViewMode] = useState<'interactive' | 'embed'>('embed');

  const videoRef = useRef<HTMLVideoElement>(null);

  // Video ID resolution: checks videoId, /video/(\d+), or any 15-22 digit sequence
  const effectiveVideoId =
    video.videoId ||
    (video.tiktokUrl ? (video.tiktokUrl.match(/\/video\/(\d+)/) || video.tiktokUrl.match(/(\d{15,22})/))?.[1] : null) ||
    '6718335390845095173';

  const fullTikTokUrl =
    video.tiktokUrl ||
    `https://www.tiktok.com/${video.creatorHandle}/video/${effectiveVideoId}`;

  // State to track if embed iframe loaded or blocked
  const [iframeLoaded, setIframeLoaded] = useState(false);

  // Whenever video or tiktokUrl changes, reset iframe state
  useEffect(() => {
    setIframeLoaded(false);
  }, [video.id, video.tiktokUrl, video.videoId]);

  // Time ticker simulation if no HTML5 video element is loaded
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= 65) return 0;
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1));

    // Spawn floating heart
    const newHeart = {
      id: Date.now() + Math.random(),
      x: e.clientX - e.currentTarget.getBoundingClientRect().left,
      y: e.clientY - e.currentTarget.getBoundingClientRect().top,
    };
    setFloatingHearts((prev) => [...prev, newHeart]);
    setTimeout(() => {
      setFloatingHearts((prev) => prev.filter((h) => h.id !== newHeart.id));
    }, 1200);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(fullTikTokUrl).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    });
  };

  return (
    <div className="flex flex-col space-y-3 w-full">
      {/* Top Header Mode Toggle */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#fe2c55] animate-pulse" />
          <span className="text-xs font-bold text-white tracking-wide">TikTok Video Stream</span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
            9:16 HD
          </span>
        </div>

        <div className="inline-flex p-0.5 bg-slate-900 border border-slate-800 rounded-lg text-[11px]">
          <button
            onClick={() => setViewMode('interactive')}
            className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
              viewMode === 'interactive'
                ? 'bg-gradient-to-r from-[#fe2c55]/30 to-[#25f4ee]/30 text-white border border-[#25f4ee]/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Interactive Player
          </button>
          <button
            onClick={() => setViewMode('embed')}
            className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
              viewMode === 'embed'
                ? 'bg-gradient-to-r from-[#fe2c55]/30 to-[#25f4ee]/30 text-white border border-[#25f4ee]/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            TikTok Web Embed
          </button>
        </div>
      </div>

      {/* Main Video Stage Container (Portrait 9:16) */}
      <div className="relative rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-2xl aspect-[9/16] w-full max-h-[620px] select-none group">
        {viewMode === 'embed' ? (
          /* Official TikTok Player Embed (player/v1) */
          <div className="w-full h-full relative bg-slate-950 flex flex-col">
            <iframe
              key={effectiveVideoId}
              src={`https://www.tiktok.com/player/v1/${effectiveVideoId}`}
              className="w-full h-full rounded-2xl border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              onLoad={() => setIframeLoaded(true)}
              title={`TikTok Video ${effectiveVideoId}`}
            />
            {/* Live Indicator Badge */}
            <div className="absolute top-2.5 right-2.5 pointer-events-none z-10">
              <span className="px-2 py-0.5 rounded-full bg-black/80 backdrop-blur-md text-[10px] font-mono text-cyan-300 border border-cyan-500/30 flex items-center gap-1 shadow-md">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                Live TikTok Stream
              </span>
            </div>

            {/* Quick Controls & Player Mode Switcher */}
            <div className="absolute bottom-2 inset-x-2 p-2 rounded-xl bg-slate-950/90 backdrop-blur-md border border-slate-800 text-[11px] text-slate-300 flex items-center justify-between gap-2 shadow-lg z-10">
              <span className="truncate text-slate-400">
                Playing <strong className="text-white font-medium">{video.creatorHandle}</strong>
              </span>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setViewMode('interactive')}
                  className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 font-medium transition-all cursor-pointer"
                  title="Switch to full Interactive Video Player"
                >
                  HD Player
                </button>
                <a
                  href={fullTikTokUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2 py-0.5 rounded-md bg-[#fe2c55]/20 hover:bg-[#fe2c55]/30 text-[#fe2c55] border border-[#fe2c55]/30 font-medium transition-all flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  TikTok.com
                </a>
              </div>
            </div>
          </div>
        ) : (
          /* Real Interactive Player with TikTok UI Overlays & Animation */
          <div className="w-full h-full relative cursor-pointer" onClick={togglePlay}>
            {/* Background Media: Video file if available or dynamic high-res visual video simulator */}
            {videoSourceUrl ? (
              <video
                ref={videoRef}
                src={videoSourceUrl}
                className="w-full h-full object-cover"
                loop
                autoPlay
                muted={isMuted}
                playsInline
              />
            ) : (
              <div className="w-full h-full relative overflow-hidden bg-slate-950">
                <img
                  src={video.thumbnailUrl}
                  alt={video.title}
                  className={`w-full h-full object-cover transition-transform duration-700 ${
                    isPlaying ? 'scale-105 filter brightness-105' : 'scale-100 filter brightness-90'
                  }`}
                />

                {/* Ambient glow effect indicating active video stream */}
                {isPlaying && (
                  <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 via-transparent to-rose-500/10 mix-blend-screen pointer-events-none animate-pulse" />
                )}
              </div>
            )}

            {/* Dark Gradients for Readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/40 pointer-events-none" />

            {/* Top Bar: Following / For You indicator & Sound Mute Toggle */}
            <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between z-10">
              <div className="flex items-center gap-3 text-xs font-semibold drop-shadow-md">
                <span className="text-slate-400 hover:text-white transition-colors">Following</span>
                <span className="text-white font-bold border-b-2 border-white pb-0.5">For You</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMuted(!isMuted);
                    if (videoRef.current) videoRef.current.muted = !isMuted;
                  }}
                  className="p-1.5 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black/80 transition-all border border-white/20 cursor-pointer"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
                </button>
              </div>
            </div>

            {/* Center Play/Pause indicator overlay when paused */}
            <AnimatePresence>
              {!isPlaying && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-black/65 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-2xl pointer-events-none z-10"
                >
                  <Play className="w-8 h-8 fill-white ml-1 text-white" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Floating Heart Animations */}
            {floatingHearts.map((heart) => (
              <motion.div
                key={heart.id}
                initial={{ opacity: 1, y: 0, scale: 1 }}
                animate={{ opacity: 0, y: -80, scale: 1.5 }}
                transition={{ duration: 1 }}
                className="absolute pointer-events-none z-20 text-[#fe2c55]"
                style={{ left: heart.x, top: heart.y }}
              >
                <Heart className="w-8 h-8 fill-[#fe2c55]" />
              </motion.div>
            ))}

            {/* Right Action Bar (TikTok signature icons: Avatar, Like, Comment, Bookmark, Share, Vinyl) */}
            <div className="absolute right-3 bottom-16 flex flex-col items-center space-y-4 z-10">
              {/* Creator Avatar with follow plus badge */}
              <div className="relative group cursor-pointer" onClick={(e) => e.stopPropagation()}>
                <img
                  src={video.creatorAvatar}
                  alt={video.creator}
                  className="w-10 h-10 rounded-full border-2 border-white object-cover shadow-lg"
                />
                <div className="absolute -bottom-1 left-0 right-0 mx-auto w-4 h-4 rounded-full bg-[#fe2c55] text-white flex items-center justify-center text-[10px] font-bold shadow">
                  +
                </div>
              </div>

              {/* Heart / Like Button */}
              <button
                onClick={handleLikeClick}
                className="flex flex-col items-center space-y-0.5 text-white transition-transform active:scale-125 cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
                  <Heart
                    className={`w-6 h-6 transition-colors ${
                      isLiked ? 'text-[#fe2c55] fill-[#fe2c55]' : 'text-white fill-transparent'
                    }`}
                  />
                </div>
                <span className="text-[11px] font-mono font-bold text-white drop-shadow">
                  {(likesCount / 1000).toFixed(1)}K
                </span>
              </button>

              {/* Comment Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onJumpToComments?.();
                }}
                className="flex flex-col items-center space-y-0.5 text-white cursor-pointer hover:scale-110 transition-transform"
                title="View TikTok Comments"
              >
                <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-white fill-white/20" />
                </div>
                <span className="text-[11px] font-mono font-bold text-white drop-shadow">
                  {video.commentsCount}
                </span>
              </button>

              {/* Bookmark Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsSaved(!isSaved);
                }}
                className="flex flex-col items-center space-y-0.5 text-white cursor-pointer hover:scale-110 transition-transform"
              >
                <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
                  <Bookmark
                    className={`w-5 h-5 ${isSaved ? 'text-amber-400 fill-amber-400' : 'text-white'}`}
                  />
                </div>
                <span className="text-[11px] font-mono font-bold text-white drop-shadow">Save</span>
              </button>

              {/* Share Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopy();
                }}
                className="flex flex-col items-center space-y-0.5 text-white cursor-pointer hover:scale-110 transition-transform"
                title="Copy TikTok Video Link"
              >
                <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
                  <Share2 className="w-5 h-5 text-white" />
                </div>
                <span className="text-[11px] font-mono font-bold text-white drop-shadow">Share</span>
              </button>

              {/* Spinning Vinyl Record Music Icon */}
              <div
                className={`w-9 h-9 rounded-full bg-slate-900 border-2 border-slate-800 p-1 flex items-center justify-center shadow-lg ${
                  isPlaying ? 'animate-spin' : ''
                }`}
                style={{ animationDuration: '4s' }}
              >
                <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center">
                  <Music2 className="w-3.5 h-3.5 text-cyan-300" />
                </div>
              </div>
            </div>

            {/* Bottom Overlay: Creator info, caption text, sound title */}
            <div className="absolute bottom-4 left-3 right-16 text-white space-y-1.5 z-10 pointer-events-none">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm tracking-tight text-white drop-shadow-md">
                  {video.creatorHandle}
                </span>
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400/20" />
              </div>

              <p className="text-xs text-slate-100 line-clamp-2 leading-snug drop-shadow-md font-sans">
                {video.title}
              </p>

              {/* Extracted Hashtags */}
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                {(video.keyThemes || []).slice(0, 3).map((th, index) => (
                  <span
                    key={`player-theme-tag-${video.id || effectiveVideoId}-${index}-${th.hashtag || th.name || index}`}
                    className="text-[11px] font-semibold text-cyan-300 bg-black/50 px-1.5 py-0.2 rounded"
                  >
                    {th.hashtag}
                  </span>
                ))}
              </div>

              {/* Music sound ticker */}
              <div className="flex items-center gap-1.5 text-[11px] text-slate-300 pt-0.5">
                <Music2 className="w-3 h-3 text-cyan-400 flex-shrink-0 animate-bounce" />
                <span className="truncate drop-shadow">♬ original sound - {video.creator}</span>
              </div>
            </div>

            {/* Progress Scrubber Bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-10">
              <div
                className="h-full bg-gradient-to-r from-[#fe2c55] to-[#25f4ee] transition-all duration-300"
                style={{ width: `${(currentTime / 65) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Synced Link Bar directly underneath the real video */}
      <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-2 text-xs shadow-md">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
          <div className="min-w-0">
            <span className="text-[10px] text-slate-400 block font-medium">Synced Real TikTok URL</span>
            <span className="text-[11px] font-mono text-cyan-300 truncate block">
              {fullTikTokUrl}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer font-medium text-[11px]"
            title="Copy TikTok Link"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Copied' : 'Copy'}</span>
          </button>

          <a
            href={fullTikTokUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 transition-all cursor-pointer font-medium text-[11px]"
            title="Watch Video on TikTok"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open TikTok</span>
          </a>
        </div>
      </div>
    </div>
  );
};
