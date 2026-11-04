import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../context/ChatContext';
import { X, Play, Pause, Send, Eye, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

export const StatusViewer: React.FC = () => {
  const { activeStatusViewer, closeStatusViewer, statuses, currentUser, sendMessage, viewStatus, deleteStatus } = useChat();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [replyText, setReplyText] = useState('');
  const progressIntervalRef = useRef<any>(null);
  const [progress, setProgress] = useState(0);

  if (!activeStatusViewer) return null;

  const userStatuses = statuses.filter((s) => s.userId === activeStatusViewer.userId);
  if (userStatuses.length === 0) {
    closeStatusViewer();
    return null;
  }

  const currentStatus = userStatuses[currentIndex] || userStatuses[0];
  const isMyStatus = currentStatus.userId === currentUser?.id;

  // Track view status
  useEffect(() => {
    if (currentStatus) {
      viewStatus(currentStatus.id);
    }
  }, [currentStatus?.id]);

  // Auto advance timer (5 seconds for text/image, or video duration)
  useEffect(() => {
    if (isPaused) return;

    setProgress(0);
    const duration = 5000;
    const intervalTime = 50;
    let elapsed = 0;

    progressIntervalRef.current = setInterval(() => {
      elapsed += intervalTime;
      const pct = (elapsed / duration) * 100;
      setProgress(pct);

      if (elapsed >= duration) {
        clearInterval(progressIntervalRef.current);
        handleNext();
      }
    }, intervalTime);

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [currentIndex, isPaused, activeStatusViewer.userId]);

  const handleNext = () => {
    if (currentIndex < userStatuses.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      closeStatusViewer();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !currentUser) return;

    // Send chat message to status owner replying to their status
    const targetChatId = `chat_${currentStatus.userId}`;
    sendMessage(targetChatId, `Replied to status: "${replyText.trim()}"`, 'text');
    setReplyText('');
    closeStatusViewer();
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-between p-4 select-none">
      {/* Top Segmented Progress Bar & User Info Header */}
      <div className="w-full max-w-lg space-y-3 z-10">
        <div className="flex space-x-1">
          {userStatuses.map((st, idx) => (
            <div key={st.id} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-75"
                style={{
                  width: idx < currentIndex ? '100%' : idx === currentIndex ? `${progress}%` : '0%',
                }}
              />
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between text-white">
          <div className="flex items-center space-x-3">
            <img
              src={currentStatus.userAvatar}
              alt={currentStatus.username}
              className="w-10 h-10 rounded-full object-cover border border-white/50"
            />
            <div>
              <h3 className="font-bold text-sm leading-tight">{currentStatus.username}</h3>
              <p className="text-[10px] text-white/70 font-medium">
                {new Date(currentStatus.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {isMyStatus && (
              <button
                onClick={() => {
                  deleteStatus(currentStatus.id);
                  closeStatusViewer();
                }}
                className="p-2 bg-red-600/60 hover:bg-red-600 text-white rounded-full transition-colors"
                title="Delete Status"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-full transition-colors"
            >
              {isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4 fill-current" />}
            </button>
            <button
              onClick={closeStatusViewer}
              className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div
        className="w-full max-w-lg flex-1 my-4 rounded-3xl overflow-hidden relative flex items-center justify-center text-white shadow-2xl"
        style={{
          backgroundColor: currentStatus.type === 'text' ? currentStatus.bgColor || '#128C7E' : '#000',
        }}
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {/* Navigation tap areas */}
        <button
          onClick={handlePrev}
          className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/40 text-white rounded-full opacity-70 hover:opacity-100 transition-opacity z-20"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          onClick={handleNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/40 text-white rounded-full opacity-70 hover:opacity-100 transition-opacity z-20"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Text Status */}
        {currentStatus.type === 'text' && (
          <div className="p-8 text-center max-w-sm">
            <p className="text-2xl font-bold leading-relaxed whitespace-pre-wrap">{currentStatus.content}</p>
          </div>
        )}

        {/* Image Status */}
        {currentStatus.type === 'image' && (
          <div className="relative w-full h-full flex flex-col items-center justify-center">
            <img src={currentStatus.content} alt="Status photo" className="max-h-full max-w-full object-contain" />
            {currentStatus.caption && (
              <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-md p-3 rounded-2xl text-center text-sm font-medium">
                {currentStatus.caption}
              </div>
            )}
          </div>
        )}

        {/* Video Status */}
        {currentStatus.type === 'video' && (
          <div className="relative w-full h-full flex flex-col items-center justify-center">
            <video
              src={currentStatus.content}
              autoPlay
              playsInline
              className="max-h-full max-w-full object-contain"
            />
            {currentStatus.caption && (
              <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-md p-3 rounded-2xl text-center text-sm font-medium">
                {currentStatus.caption}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Footer: Reply input or View count */}
      <div className="w-full max-w-lg z-10">
        {isMyStatus ? (
          <div className="flex items-center justify-center space-x-2 py-2 text-white/80 text-xs font-semibold bg-white/10 backdrop-blur-md rounded-2xl">
            <Eye className="w-4 h-4 text-emerald-400" />
            <span>{currentStatus.viewers.length} views</span>
          </div>
        ) : (
          <form onSubmit={handleSendReply} className="flex items-center space-x-2">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={`Reply to ${currentStatus.username}...`}
              className="flex-1 py-2.5 px-4 bg-white/20 backdrop-blur-md text-white placeholder-white/60 text-sm border border-white/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
            <button
              type="submit"
              disabled={!replyText.trim()}
              className="p-2.5 bg-[#25D366] text-[#0b141a] font-bold rounded-2xl shadow-lg disabled:opacity-50"
            >
              <Send className="w-5 h-5 fill-current" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
