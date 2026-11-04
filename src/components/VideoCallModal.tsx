import React, { useEffect, useRef } from 'react';
import { useChat } from '../context/ChatContext';
import { Video, VideoOff, Mic, MicOff, PhoneOff, Phone, Monitor, RefreshCw, Maximize2 } from 'lucide-react';

export const VideoCallModal: React.FC = () => {
  const { activeCall, endCall, acceptCall, toggleMuteCall, toggleCameraCall } = useChat();
  const localVideoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!activeCall || activeCall.callType !== 'video') return;

    let localStream: MediaStream | null = null;
    if (activeCall.isCameraOn) {
      navigator.mediaDevices
        ?.getUserMedia({ video: true, audio: true })
        .then((stream) => {
          localStream = stream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        })
        .catch((err) => {
          console.warn('Camera access denied or unmounted:', err);
        });
    }

    return () => {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [activeCall?.callType, activeCall?.isCameraOn]);

  if (!activeCall || activeCall.callType !== 'video') return null;

  const isRinging = activeCall.status === 'ringing';

  return (
    <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-lg z-50 flex items-center justify-center p-4 select-none">
      <div className="relative w-full max-w-4xl h-[85vh] bg-[#111b21] rounded-3xl overflow-hidden shadow-2xl border border-gray-800 flex flex-col justify-between">
        {/* Remote Video Container */}
        <div className="relative flex-1 bg-gradient-to-b from-[#1f2c34] to-[#0b141a] flex flex-col items-center justify-center p-6 text-white overflow-hidden">
          {isRinging ? (
            <div className="flex flex-col items-center text-center animate-pulse z-10">
              <img
                src={activeCall.peerUser.avatar}
                alt={activeCall.peerUser.displayName}
                className="w-28 h-28 rounded-full object-cover ring-8 ring-emerald-500/40 shadow-2xl mb-4"
              />
              <h3 className="text-2xl font-bold">{activeCall.peerUser.displayName}</h3>
              <p className="text-sm text-emerald-400 font-medium mt-1">
                {activeCall.isIncoming ? 'Incoming WhatsApp Video Call...' : 'Calling...'}
              </p>
            </div>
          ) : (
            // Connected Call Simulated Remote Feed
            <div className="relative w-full h-full flex flex-col items-center justify-center">
              {/* Simulated HD Remote Stream avatar background */}
              <img
                src={activeCall.peerUser.avatar}
                alt={activeCall.peerUser.displayName}
                className="absolute inset-0 w-full h-full object-cover filter blur-2xl opacity-30"
              />
              <div className="relative z-10 flex flex-col items-center">
                <img
                  src={activeCall.peerUser.avatar}
                  alt={activeCall.peerUser.displayName}
                  className="w-32 h-32 rounded-full object-cover border-4 border-emerald-400 shadow-2xl mb-3"
                />
                <h3 className="text-xl font-bold">{activeCall.peerUser.displayName}</h3>
                <span className="text-xs bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full font-mono mt-1 border border-emerald-500/30">
                  ● 720p HD Stream Connected
                </span>
              </div>
            </div>
          )}

          {/* Local Camera Picture-in-Picture */}
          {activeCall.isCameraOn && (
            <div className="absolute top-4 right-4 w-36 sm:w-48 h-28 sm:h-36 bg-black rounded-2xl overflow-hidden shadow-2xl border-2 border-emerald-500/50 z-20">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform -scale-x-100"
              />
              <span className="absolute bottom-1 left-2 text-[10px] bg-black/60 px-1.5 py-0.5 rounded text-white font-semibold">
                You
              </span>
            </div>
          )}
        </div>

        {/* Call Toolbar Controls */}
        <div className="bg-[#1f2c34] p-4 flex items-center justify-center space-x-4 border-t border-gray-800 z-30">
          {isRinging && activeCall.isIncoming ? (
            <>
              {/* Accept Call */}
              <button
                onClick={acceptCall}
                className="px-6 py-3 bg-[#25D366] hover:bg-[#128C7E] text-[#0b141a] font-bold rounded-full shadow-lg flex items-center space-x-2 animate-bounce"
              >
                <Phone className="w-5 h-5 fill-current" />
                <span>Accept Video Call</span>
              </button>

              {/* Decline Call */}
              <button
                onClick={endCall}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-full shadow-lg flex items-center space-x-2"
              >
                <PhoneOff className="w-5 h-5" />
                <span>Decline</span>
              </button>
            </>
          ) : (
            <>
              {/* Mute Mic */}
              <button
                onClick={toggleMuteCall}
                className={`p-3.5 rounded-full transition-colors ${
                  activeCall.isMuted
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                }`}
                title={activeCall.isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
              >
                {activeCall.isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              {/* Toggle Camera */}
              <button
                onClick={toggleCameraCall}
                className={`p-3.5 rounded-full transition-colors ${
                  !activeCall.isCameraOn
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                }`}
                title={activeCall.isCameraOn ? 'Turn Off Camera' : 'Turn On Camera'}
              >
                {activeCall.isCameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </button>

              {/* End Call */}
              <button
                onClick={endCall}
                className="p-4 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-xl transition-transform active:scale-95"
                title="End Call"
              >
                <PhoneOff className="w-6 h-6" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
