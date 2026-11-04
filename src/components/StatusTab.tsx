import React, { useState } from 'react';
import { useChat } from '../context/ChatContext';
import { Plus, Edit3, Image as ImageIcon, Film, Eye, Trash2, Camera, Lock } from 'lucide-react';

export const StatusTab: React.FC = () => {
  const {
    currentUser,
    statuses,
    postStatus,
    openStatusViewer,
    deleteStatus,
    openGallery,
    privacySettings,
  } = useChat();

  const [showTextComposer, setShowTextComposer] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [bgColor, setBgColor] = useState('#128C7E');
  const [fontStyle, setFontStyle] = useState<'sans' | 'serif' | 'mono' | 'cursive'>('sans');

  const bgColors = ['#128C7E', '#8E24AA', '#D81B60', '#00897B', '#E65100', '#1E88E5', '#2E7D32', '#37474F'];

  const myStatuses = statuses.filter((s) => s.userId === currentUser?.id);
  const friendsStatuses = statuses.filter((s) => s.userId !== currentUser?.id);

  // Group friends statuses by user
  const groupedFriendsStatuses: Record<string, typeof statuses> = {};
  friendsStatuses.forEach((s) => {
    if (!groupedFriendsStatuses[s.userId]) {
      groupedFriendsStatuses[s.userId] = [];
    }
    groupedFriendsStatuses[s.userId].push(s);
  });

  const handlePostTextStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusText.trim()) return;
    postStatus('text', statusText.trim(), undefined, bgColor, fontStyle);
    setStatusText('');
    setShowTextComposer(false);
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex-1 bg-white dark:bg-[#111b21] overflow-y-auto p-4 max-w-2xl mx-auto w-full select-none">
      {/* Top Banner Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
        <div>
          <h2 className="text-xl font-black text-gray-900 dark:text-white">Status Stories</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Statuses disappear after 24 hours. Post videos, photos, or text updates!
          </p>
        </div>

        {/* Action Buttons: Text status & Gallery Video Status */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowTextComposer(true)}
            className="p-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-[#202c33] dark:hover:bg-[#2a3942] text-emerald-600 dark:text-emerald-400 rounded-full transition-transform active:scale-95 shadow"
            title="Create Text Status"
          >
            <Edit3 className="w-5 h-5" />
          </button>

          <button
            onClick={() => openGallery('status')}
            className="p-2.5 bg-[#128C7E] hover:bg-[#075E54] text-white rounded-full transition-transform active:scale-95 shadow"
            title="Post Video/Photo from Gallery"
          >
            <Camera className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* "My Status" Row */}
      <div className="mb-8">
        <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
          My Status
        </h3>

        <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-[#202c33] border border-gray-200/60 dark:border-gray-800">
          <div
            onClick={() => {
              if (myStatuses.length > 0 && currentUser) {
                openStatusViewer(currentUser.id);
              } else {
                setShowTextComposer(true);
              }
            }}
            className="flex items-center space-x-3 cursor-pointer flex-1"
          >
            <div className="relative">
              <img
                src={currentUser?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=my_status'}
                alt="My Status"
                className={`w-14 h-14 rounded-full object-cover ${
                  myStatuses.length > 0
                    ? 'ring-4 ring-[#25D366] ring-offset-2 dark:ring-offset-[#111b21]'
                    : 'border-2 border-gray-300 dark:border-gray-700'
                }`}
              />
              {myStatuses.length === 0 && (
                <div className="absolute -bottom-1 -right-1 bg-[#25D366] text-[#0b141a] p-1 rounded-full shadow">
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              )}
            </div>

            <div>
              <h4 className="text-sm font-bold text-gray-900 dark:text-white">My Status</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {myStatuses.length > 0
                  ? `${myStatuses.length} updates • Tap to view`
                  : 'Tap to add status update'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => openGallery('status')}
              className="px-3 py-1.5 bg-[#25D366]/20 text-[#0b141a] dark:text-[#25D366] font-bold text-xs rounded-xl hover:bg-[#25D366]/30 transition-colors flex items-center space-x-1"
            >
              <Film className="w-4 h-4" />
              <span>Upload Video</span>
            </button>
          </div>
        </div>
      </div>

      {/* Friends Status Updates */}
      <div>
        <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
          Recent Updates
        </h3>

        {Object.keys(groupedFriendsStatuses).length === 0 ? (
          <div className="p-8 text-center text-gray-400 border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
            <p className="text-xs font-semibold">No recent status updates from friends yet.</p>
            <p className="text-[11px] mt-1">Post a status or invite friends to share updates!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {Object.entries(groupedFriendsStatuses).map(([userId, userStatusList]) => {
              const latestStatus = userStatusList[0];
              return (
                <button
                  key={userId}
                  onClick={() => openStatusViewer(userId)}
                  className="w-full p-3 rounded-2xl bg-white dark:bg-[#111b21] hover:bg-gray-50 dark:hover:bg-[#202c33] border border-gray-100 dark:border-gray-800/80 flex items-center space-x-3 text-left transition-colors"
                >
                  <div className="relative">
                    <img
                      src={latestStatus.userAvatar}
                      alt={latestStatus.username}
                      className="w-13 h-13 rounded-full object-cover ring-4 ring-[#25D366] ring-offset-2 dark:ring-offset-[#111b21]"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                      {latestStatus.username}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {formatTime(latestStatus.timestamp)} •{' '}
                      {latestStatus.type === 'video'
                        ? '📹 Video status'
                        : latestStatus.type === 'image'
                        ? '📷 Photo status'
                        : latestStatus.content}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Text Status Composer Modal */}
      {showTextComposer && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div
            className="rounded-3xl max-w-md w-full p-6 text-white shadow-2xl transition-all relative flex flex-col justify-between min-h-[400px]"
            style={{ backgroundColor: bgColor }}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-widest opacity-80">Text Status</span>
              <button
                onClick={() => setShowTextComposer(false)}
                className="p-1 rounded-full hover:bg-white/20"
              >
                ✕
              </button>
            </div>

            {/* Input textarea */}
            <form onSubmit={handlePostTextStatus} className="flex-1 flex flex-col justify-center">
              <textarea
                autoFocus
                value={statusText}
                onChange={(e) => setStatusText(e.target.value)}
                placeholder="Type a status..."
                rows={4}
                className="w-full bg-transparent text-center text-2xl font-bold focus:outline-none placeholder-white/60 resize-none font-sans"
              />

              {/* Color Palette Selector */}
              <div className="flex items-center justify-center space-x-2 my-4">
                {bgColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setBgColor(color)}
                    className={`w-6 h-6 rounded-full border-2 ${
                      bgColor === color ? 'border-white scale-125' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={!statusText.trim()}
                className="w-full py-3 bg-white text-gray-900 font-bold rounded-2xl shadow-xl hover:bg-gray-100 transition-transform active:scale-95 disabled:opacity-50"
              >
                Post Status
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
