import React, { useState } from 'react';
import { useChat } from '../context/ChatContext';
import { X, UserPlus, Lock, Sparkles } from 'lucide-react';

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewChatModal: React.FC<NewChatModalProps> = ({ isOpen, onClose }) => {
  const { createChatWithUsername, allUsers, setActiveChatId } = useChat();
  const [targetUsername, setTargetUsername] = useState('');
  const [isSecret, setIsSecret] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUsername.trim()) return;

    createChatWithUsername(targetUsername.trim(), isSecret);
    setTargetUsername('');
    setIsSecret(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none">
      <div className="bg-white dark:bg-[#111b21] rounded-3xl max-w-sm w-full p-6 text-gray-900 dark:text-gray-100 shadow-2xl border border-gray-200 dark:border-gray-800 animate-in fade-in zoom-in duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-base font-bold flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-emerald-500" />
            <span>Start New Chat</span>
          </h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Friend's Username
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-gray-400 font-semibold text-sm">@</span>
              <input
                type="text"
                required
                value={targetUsername}
                onChange={(e) => setTargetUsername(e.target.value)}
                placeholder="e.g. sam_m, maria_g, alex"
                autoFocus
                className="w-full pl-8 pr-4 py-2.5 text-xs bg-gray-50 dark:bg-[#202c33] border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            </div>
          </div>

          <label className="flex items-center space-x-2 text-xs font-medium cursor-pointer">
            <input
              type="checkbox"
              checked={isSecret}
              onChange={(e) => setIsSecret(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
            />
            <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold">
              <Lock className="w-3.5 h-3.5" />
              Mark as Secret Private Friend
            </span>
          </label>

          <button
            type="submit"
            disabled={!targetUsername.trim()}
            className="w-full py-2.5 bg-[#128C7E] hover:bg-[#075E54] text-white text-xs font-bold rounded-xl shadow-lg transition-transform active:scale-95 disabled:opacity-50"
          >
            Start Conversation
          </button>
        </form>

        {/* Suggested Contacts */}
        <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-800">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
            Suggested Contacts
          </p>

          <div className="space-y-1.5 max-h-40 overflow-y-auto">
            {allUsers.map((u) => (
              <button
                key={u.id}
                onClick={() => {
                  createChatWithUsername(u.username, u.isSecret);
                  onClose();
                }}
                className="w-full p-2 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/40 flex items-center justify-between text-left text-xs transition-colors"
              >
                <div className="flex items-center space-x-2 truncate">
                  <img src={u.avatar} alt={u.displayName} className="w-6 h-6 rounded-full" />
                  <span className="font-semibold truncate">{u.displayName}</span>
                </div>
                <span className="text-[10px] text-gray-400">@{u.username}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
