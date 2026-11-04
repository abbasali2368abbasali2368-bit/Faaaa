import React from 'react';
import { useChat } from '../context/ChatContext';
import { Phone, Video, PhoneIncoming, PhoneOutgoing, PhoneMissed, Trash2 } from 'lucide-react';

export const CallsTab: React.FC = () => {
  const { callHistory, startCall, allUsers, currentUser } = useChat();

  const formatTimestamp = (ts: number) => {
    const d = new Date(ts);
    return `${d.toLocaleDateString([], { month: 'short', day: 'numeric' })}, ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  const formatDuration = (secs: number) => {
    if (secs === 0) return 'Missed';
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}m ${s}s`;
  };

  return (
    <div className="flex-1 bg-white dark:bg-[#111b21] overflow-y-auto p-4 max-w-2xl mx-auto w-full select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
        <div>
          <h2 className="text-xl font-black text-gray-900 dark:text-white">Call Log</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Voice and video call history on FA97 Chat
          </p>
        </div>
      </div>

      {/* Call History List */}
      {callHistory.length === 0 ? (
        <div className="p-12 text-center text-gray-400 border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
          <Phone className="w-10 h-10 mx-auto text-emerald-500 mb-2" />
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">No calls yet</p>
          <p className="text-xs mt-1">Start a voice or video call with any contact from their chat window!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {callHistory.map((call) => {
            const isIncoming = call.receiverId === currentUser?.id;
            const peerName = isIncoming ? call.callerName : call.receiverName;
            const peerAvatar = isIncoming ? call.callerAvatar : call.receiverAvatar;
            const peerUserId = isIncoming ? call.callerId : call.receiverId;
            const peerUser = allUsers.find((u) => u.id === peerUserId) || {
              id: peerUserId,
              username: peerName,
              displayName: peerName,
              avatar: peerAvatar,
              statusNote: '',
              isOnline: true,
            };

            return (
              <div
                key={call.id}
                className="p-3.5 rounded-2xl bg-gray-50 dark:bg-[#202c33] border border-gray-200/60 dark:border-gray-800 flex items-center justify-between"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <img
                    src={peerAvatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=user'}
                    alt={peerName}
                    className="w-12 h-12 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                  />
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                      {peerName}
                    </h4>
                    <div className="flex items-center space-x-1.5 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {call.status === 'missed' ? (
                        <PhoneMissed className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                      ) : isIncoming ? (
                        <PhoneIncoming className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                      ) : (
                        <PhoneOutgoing className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                      )}
                      <span className="truncate">{formatTimestamp(call.timestamp)}</span>
                      <span>• {formatDuration(call.duration)}</span>
                    </div>
                  </div>
                </div>

                {/* Call back actions */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => startCall(peerUser, 'voice')}
                    className="p-2.5 bg-emerald-100 dark:bg-emerald-950/60 text-[#075E54] dark:text-emerald-400 hover:bg-emerald-200 rounded-full transition-colors"
                    title="Voice Call"
                  >
                    <Phone className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => startCall(peerUser, 'video')}
                    className="p-2.5 bg-emerald-100 dark:bg-emerald-950/60 text-[#075E54] dark:text-emerald-400 hover:bg-emerald-200 rounded-full transition-colors"
                    title="Video Call"
                  >
                    <Video className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
