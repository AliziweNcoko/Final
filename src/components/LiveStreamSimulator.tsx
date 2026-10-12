import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Radio, Play, Pause, Zap, Flame, AlertCircle } from 'lucide-react';
import { CommentItem } from '../types/sentiment';
import { analyzeVader } from '../utils/vaderSentiment';
import { analyzeHuggingFaceEmotion } from '../utils/huggingFaceEmotion';

interface Props {
  isStreaming: boolean;
  onToggleStream: () => void;
  onNewComment: (comment: CommentItem) => void;
}

const STREAM_TEMPLATES = [
  { text: 'Wait this actually changed my whole routine 🔥 obsessed with the results!', author: 'GlowQueen26', likes: 142 },
  { text: 'A monthly sub for a handheld light?? You guys have lost the plot 💀💀', author: 'AntiSaaS_Dude', likes: 890 },
  { text: 'Are the LED diodes certified by the FDA? Serious question.', author: 'Clinician_Jen', likes: 45 },
  { text: 'DEEP FRYING THAT WAS A CRIME AGAINST HUMANITY 🤮', author: 'BeefConnoisseur', likes: 310 },
  { text: 'My AI attended the meeting and got promoted over me lmaooo 🤣', author: 'Slack_Survivor', likes: 620 },
  { text: 'Can anyone drop the dupe link for this? Need it ASAP!! ✨', author: 'BargainHunter_x', likes: 88 },
  { text: 'Literally crying real tears this is the sweetest video on TikTok 🥺❤️', author: 'Tokyo_RainLover', likes: 1200 },
  { text: 'Totally worth paying $30/mo to look in the mirror lol clown vibes 🤡', author: 'SarcasmKing', likes: 540 },
  { text: 'Stop lying in the comments, mine arrived in 2 days and is pure magic! ❤️', author: 'RealReviewer', likes: 78 },
  { text: 'Instant scam report filed. Boycott this company! 🚩', author: 'ConsumerShield', likes: 430 },
];

export const LiveStreamSimulator: React.FC<Props> = ({
  isStreaming,
  onToggleStream,
  onNewComment,
}) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const streamIndex = useRef(0);

  // Play subtle synthesized audio tone via Web Audio API
  const playAlertChime = (frequency = 587) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {
      // AudioContext might be blocked until user gesture, safely ignore
    }
  };

  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      const template = STREAM_TEMPLATES[streamIndex.current % STREAM_TEMPLATES.length];
      streamIndex.current += 1;

      const vader = analyzeVader(template.text);
      const huggingFace = analyzeHuggingFaceEmotion(template.text);

      const newCmt: CommentItem = {
        id: `live_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        author: template.author,
        username: `@${template.author.toLowerCase()}`,
        avatar: `https://images.unsplash.com/photo-${1534528741775 + (streamIndex.current % 10)}?w=100&auto=format&fit=crop&q=80`,
        text: template.text,
        likes: template.likes,
        timeAgo: 'Just now',
        timestamp: Date.now(),
        vader,
        huggingFace,
        themes: ['Live Audience Stream'],
        isAlertTrigger: huggingFace.primaryEmotion === 'outrage' || huggingFace.primaryEmotion === 'sarcasm',
      };

      onNewComment(newCmt);

      if (huggingFace.primaryEmotion === 'outrage') {
        playAlertChime(440);
        setToastMessage(`🚨 Outrage Signal: "${template.text.slice(0, 40)}..."`);
        setTimeout(() => setToastMessage(null), 3000);
      } else if (huggingFace.primaryEmotion === 'hype') {
        playAlertChime(660);
        setToastMessage(`⚡ Hype Surge: "${template.text.slice(0, 40)}..."`);
        setTimeout(() => setToastMessage(null), 3000);
      }
    }, 3800);

    return () => clearInterval(interval);
  }, [isStreaming, onNewComment]);

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleStream}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
            isStreaming
              ? 'bg-rose-500/15 border-rose-500/40 text-rose-300 shadow-md shadow-rose-950/40 ring-1 ring-rose-500/40'
              : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
          }`}
        >
          <span className="relative flex h-2 w-2">
            {isStreaming && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
            )}
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                isStreaming ? 'bg-rose-500' : 'bg-slate-500'
              }`}
            />
          </span>
          <span>{isStreaming ? 'Live Stream Active' : 'Simulate Live Stream'}</span>
        </button>
      </div>

      {/* Floating Alert Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-5 right-5 z-50 bg-[#101726]/95 border border-cyan-500/50 text-cyan-200 text-xs font-medium px-4 py-2.5 rounded-xl shadow-2xl backdrop-blur-md flex items-center gap-2"
          >
            <Zap className="w-4 h-4 text-cyan-400 animate-bounce" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
