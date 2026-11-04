import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Mic } from 'lucide-react';

interface VoiceMessagePlayerProps {
  audioUrl?: string;
  duration?: number;
  senderAvatar?: string;
}

export const VoiceMessagePlayer: React.FC<VoiceMessagePlayerProps> = ({
  audioUrl,
  duration = 5,
  senderAvatar,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState<number>(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioUrl) return;

    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    audio.onended = () => {
      setIsPlaying(false);
      setProgress(0);
    };

    audio.ontimeupdate = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    return () => {
      audio.pause();
    };
  }, [audioUrl]);

  const togglePlay = () => {
    if (!audioRef.current && audioUrl) {
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
    }

    if (!audioRef.current) {
      // Synthetic timer play for demo audio if URL is empty
      setIsPlaying(!isPlaying);
      return;
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.playbackRate = speed;
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {
        // Play synthetic simulation if media play blocked
        setIsPlaying(true);
      });
    }
  };

  const handleSpeedToggle = () => {
    const speeds = [1, 1.5, 2];
    const nextIdx = (speeds.indexOf(speed) + 1) % speeds.length;
    const nextSpeed = speeds[nextIdx];
    setSpeed(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="flex items-center space-x-3 bg-[#005c4b]/10 dark:bg-emerald-950/40 p-2.5 rounded-2xl max-w-xs border border-emerald-500/20">
      {/* Sender avatar mic badge */}
      <div className="relative flex-shrink-0">
        <img
          src={senderAvatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=voice'}
          alt="Voice Sender"
          className="w-10 h-10 rounded-full object-cover border border-emerald-400"
        />
        <div className="absolute -bottom-1 -right-1 bg-[#25D366] text-[#0b141a] p-1 rounded-full shadow">
          <Mic className="w-3 h-3 stroke-[3]" />
        </div>
      </div>

      {/* Play/Pause Button */}
      <button
        type="button"
        onClick={togglePlay}
        className="p-2.5 bg-[#128C7E] hover:bg-[#075E54] text-white rounded-full shadow transition-transform active:scale-95 flex-shrink-0"
      >
        {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
      </button>

      {/* Waveform & Progress */}
      <div className="flex-1">
        <div className="flex items-center space-x-0.5 h-6 cursor-pointer" onClick={togglePlay}>
          {[...Array(20)].map((_, idx) => {
            const heightPct = Math.max(25, Math.abs(Math.sin((idx + 1) * 0.7)) * 100);
            const isActive = (idx / 20) * 100 <= progress;
            return (
              <div
                key={idx}
                className={`w-1 rounded-full transition-colors ${
                  isActive ? 'bg-[#25D366]' : 'bg-gray-300 dark:bg-gray-600'
                }`}
                style={{ height: `${heightPct}%` }}
              />
            );
          })}
        </div>

        <div className="flex items-center justify-between mt-1 text-[11px] text-gray-500 dark:text-gray-400 font-mono">
          <span>{formatTime(duration)}</span>
          {/* Speed multiplier pill */}
          <button
            type="button"
            onClick={handleSpeedToggle}
            className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded text-[10px] font-bold hover:bg-emerald-500 hover:text-white transition-colors"
          >
            {speed}x
          </button>
        </div>
      </div>
    </div>
  );
};
