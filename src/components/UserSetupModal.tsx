import React, { useState } from 'react';
import { useChat } from '../context/ChatContext';
import { User, Sparkles, Shield, MessageCircle } from 'lucide-react';

export const UserSetupModal: React.FC = () => {
  const { currentUser, login, allUsers, switchUser } = useChat();
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [statusNote, setStatusNote] = useState('Hey there! Using FA97 Chat.');

  if (currentUser) return null; // Only show if user is not set

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    login(username.trim(), undefined, displayName.trim() || username.trim());
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#111b21] rounded-3xl max-w-md w-full p-8 shadow-2xl border border-gray-100 dark:border-gray-800 text-gray-900 dark:text-gray-100 animate-in fade-in zoom-in duration-200">
        {/* Logo Banner */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="bg-[#25D366] text-[#0b141a] font-extrabold text-2xl px-4 py-1.5 rounded-2xl tracking-wider shadow-lg mb-3">
            FA97
          </div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white">
            Welcome to FA97 Chat
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xs">
            No login or password needed! Choose a username to start chatting, calling, and posting statuses instantly.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Pick a Username <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-gray-400 text-sm font-semibold">@</span>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. alex97, sarah, john"
                className="w-full pl-8 pr-4 py-2.5 text-sm bg-gray-50 dark:bg-[#202c33] border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Display Name (Optional)
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Alex Miller"
              className="w-full px-4 py-2.5 text-sm bg-gray-50 dark:bg-[#202c33] border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            />
          </div>

          <button
            type="submit"
            disabled={!username.trim()}
            className="w-full py-3 px-4 bg-[#128C7E] hover:bg-[#075E54] text-white font-bold text-sm rounded-xl shadow-lg transition-all transform active:scale-[0.98] disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Start FA97 Chat</span>
          </button>
        </form>

        {/* Demo Users Switcher */}
        <div className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-800">
          <p className="text-xs text-center text-gray-500 dark:text-gray-400 font-medium mb-3 flex items-center justify-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Or enter as a Demo Account:
          </p>
          <div className="grid grid-cols-2 gap-2">
            {allUsers.map((u) => (
              <button
                key={u.id}
                onClick={() => switchUser(u)}
                className="flex items-center space-x-2 p-2 rounded-xl bg-gray-50 hover:bg-emerald-50 dark:bg-[#202c33] dark:hover:bg-emerald-950/40 border border-gray-200 dark:border-gray-700 text-left transition-colors"
              >
                <img src={u.avatar} alt={u.displayName} className="w-7 h-7 rounded-full object-cover" />
                <div className="truncate">
                  <p className="text-xs font-bold truncate text-gray-900 dark:text-gray-100">{u.displayName}</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">@{u.username}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
