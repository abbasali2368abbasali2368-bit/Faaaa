import React, { useState, useEffect } from 'react';
import { useChat } from '../context/ChatContext';
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';

export const VoiceCallModal: React.FC = () => {
  const { activeCall, endCall, acceptCall, toggleMuteCall } = useChat();
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (activeCall?.status === 'connected') {
      const interval = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [activeCall?.status]);

  if (!activeCall || activeCall.callType !== 'voice') return null;

  const isRinging = activeCall.status === 'ringing';

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-lg z-50 flex items-center justify-center p-4 select-none">
      <div className="relative w-full max-w-md bg-[#111b21] rounded-3xl p-8 shadow-2xl border border-gray-800 flex flex-col items-center justify-between min-h-[500px] text-white">
        {/* Contact Info Header */}
        <div className="flex flex-col items-center text-center mt-4">
          <div className="relative mb-6">
            <img
              src={activeCall.peerUser.avatar}
              alt={activeCall.peerUser.displayName}
              className={`w-32 h-32 rounded-full object-cover border-4 border-emerald-500 shadow-2xl ${
                isRinging ? 'animate-pulse ring-8 ring-emerald-500/30' : ''
              }`}
            />
            {!isRinging && (
              <div className="absolute inset-0 rounded-full border-4 border-emerald-400 animate-ping opacity-25"></div>
            )}
          </div>

          <h2 className="text-2xl font-bold">{activeCall.peerUser.displayName}</h2>
          <p className="text-sm font-semibold text-emerald-400 mt-1">
            {isRinging
              ? activeCall.isIncoming
                ? 'Incoming Voice Call...'
                : 'Calling...'
              : formatTime(seconds)}
          </p>
        </div>

        {/* Animated Sound Waveforms */}
        {!isRinging && (
          <div className="flex items-center space-x-1.5 h-12 my-6">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="w-1.5 bg-[#25D366] rounded-full animate-pulse"
                style={{
                  height: `${Math.max(20, Math.sin(seconds + i) * 100)}%`,
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
        )}

        {/* Action Controls */}
        <div className="w-full flex items-center justify-center space-x-6 mb-4">
          {isRinging && activeCall.isIncoming ? (
            <>
              <button
                onClick={acceptCall}
                className="px-6 py-3.5 bg-[#25D366] hover:bg-[#128C7E] text-[#0b141a] font-bold rounded-full shadow-lg flex items-center space-x-2 animate-bounce"
              >
                <Phone className="w-5 h-5 fill-current" />
                <span>Answer</span>
              </button>

              <button
                onClick={endCall}
                className="px-6 py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-full shadow-lg flex items-center space-x-2"
              >
                <PhoneOff className="w-5 h-5" />
                <span>Decline</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={toggleMuteCall}
                className={`p-4 rounded-full transition-colors ${
                  activeCall.isMuted
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-800 hover:bg-gray-700 text-white'
                }`}
                title={activeCall.isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
              >
                {activeCall.isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </button>

              <button
                onClick={endCall}
                className="p-5 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-xl transition-transform active:scale-95"
                title="End Voice Call"
              >
                <PhoneOff className="w-7 h-7" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
