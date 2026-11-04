import React, { useState, useEffect, useRef } from 'react';
import { Mic, Trash2, Send, Square } from 'lucide-react';

interface VoiceRecorderProps {
  onSendVoice: (mediaUrl: string, duration: number) => void;
  onCancel: () => void;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onSendVoice, onCancel }) => {
  const [isRecording, setIsRecording] = useState(true);
  const [seconds, setSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    // Start recording audio
    let stream: MediaStream | null = null;
    navigator.mediaDevices
      ?.getUserMedia({ audio: true })
      .then((audioStream) => {
        stream = audioStream;
        const recorder = new MediaRecorder(audioStream);
        mediaRecorderRef.current = recorder;
        audioChunksRef.current = [];

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };

        recorder.start();
        setIsRecording(true);

        timerRef.current = setInterval(() => {
          setSeconds((s) => s + 1);
        }, 1000);
      })
      .catch((err) => {
        console.warn('Microphone permission denied or unsupported:', err);
        // Fallback simulated recording if microphone hardware permission is restricted in container
        timerRef.current = setInterval(() => {
          setSeconds((s) => s + 1);
        }, 1000);
      });

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const handleStopAndSend = () => {
    if (timerRef.current) clearInterval(timerRef.current);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          onSendVoice(base64Audio, seconds || 1);
        };
        reader.readAsDataURL(audioBlob);
      };
      mediaRecorderRef.current.stop();
    } else {
      // Synthetic fallback audio string for demo testing
      const dummyAudioUrl = 'https://actions.google.com/sounds/v1/ambiences/outdoor_rain.ogg';
      onSendVoice(dummyAudioUrl, seconds || 3);
    }
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="flex items-center space-x-3 w-full bg-emerald-50 dark:bg-[#111b21] p-2.5 rounded-2xl border border-emerald-500/30 animate-in fade-in slide-in-from-bottom duration-150">
      {/* Delete / Cancel Button */}
      <button
        type="button"
        onClick={onCancel}
        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-full transition-colors"
        title="Discard Voice Note"
      >
        <Trash2 className="w-5 h-5" />
      </button>

      {/* Recording indicator & timer */}
      <div className="flex-1 flex items-center space-x-3 bg-white dark:bg-[#202c33] px-4 py-2 rounded-xl shadow-inner border border-emerald-200 dark:border-gray-700">
        <div className="w-3 h-3 rounded-full bg-red-500 animate-ping"></div>
        <span className="font-mono text-sm font-bold text-gray-800 dark:text-gray-200">
          {formatTime(seconds)}
        </span>

        {/* Animated Waveform Visualizer */}
        <div className="flex-1 flex items-center justify-center space-x-1 h-6">
          {[...Array(16)].map((_, i) => (
            <div
              key={i}
              className="w-1 bg-emerald-500 rounded-full animate-pulse"
              style={{
                height: `${Math.max(20, Math.sin(seconds + i) * 100)}%`,
                animationDelay: `${i * 0.08}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Send Button */}
      <button
        type="button"
        onClick={handleStopAndSend}
        className="p-2.5 bg-[#25D366] hover:bg-[#128C7E] text-[#0b141a] font-bold rounded-full shadow-lg transition-transform active:scale-95"
        title="Send Voice Message"
      >
        <Send className="w-5 h-5 fill-current" />
      </button>
    </div>
  );
};
