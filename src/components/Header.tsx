import React, { useState } from 'react';
import { useChat } from '../context/ChatContext';
import {
  MessageSquare,
  CircleDashed,
  Phone,
  Shield,
  ShieldAlert,
  Lock,
  Unlock,
  UserCheck,
  Moon,
  Sun,
  Plus,
  Search,
  KeyRound,
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'chats' | 'status' | 'calls' | 'privacy';
  setActiveTab: (tab: 'chats' | 'status' | 'calls' | 'privacy') => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  onOpenNewChat: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  darkMode,
  setDarkMode,
  onOpenNewChat,
}) => {
  const {
    currentUser,
    activeTab,
    setActiveTab,
    chats,
    privacySettings,
    lockSecretMode,
    unlockSecretPin,
    switchUser,
    allUsers,
  } = useChat();

  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Calculate unread message total
  const totalUnread = chats.reduce((acc, c) => acc + (c.isSecret && !privacySettings.isSecretUnlocked ? 0 : c.unreadCount), 0);

  const handleToggleLock = () => {
    if (privacySettings.isSecretUnlocked) {
      lockSecretMode();
    } else {
      setShowPinModal(true);
      setPinInput('');
      setPinError(false);
    }
  };

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (unlockSecretPin(pinInput)) {
      setShowPinModal(false);
      setPinInput('');
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  return (
    <header className="bg-[#075E54] dark:bg-[#1f2c34] text-white shadow-md select-none transition-colors">
      {/* Top Main Bar */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between">
        {/* Brand & Logo */}
        <div className="flex items-center space-x-3">
          <div className="bg-[#25D366] text-[#0b141a] font-extrabold text-sm px-2.5 py-1 rounded-lg tracking-wider shadow-inner flex items-center justify-center">
            FA97
          </div>
          <div>
            <h1 className="font-bold text-lg leading-none tracking-wide flex items-center gap-1.5">
              FA97 Chat
              <span className="text-[10px] bg-[#128C7E] dark:bg-[#111b21] text-[#25D366] font-semibold px-1.5 py-0.5 rounded border border-[#25D366]/30">
                Web
              </span>
            </h1>
            <p className="text-[11px] text-emerald-100 dark:text-gray-400">
              WhatsApp-Style Instant Messaging
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* New Chat Button */}
          <button
            onClick={onOpenNewChat}
            className="bg-[#128C7E] hover:bg-[#075E54] dark:bg-[#202c33] dark:hover:bg-[#2a3942] p-2 rounded-full text-white transition-colors"
            title="Start New Chat / Add Friend"
          >
            <Plus className="w-5 h-5" />
          </button>

          {/* Secret Mode Lock Toggle */}
          <button
            onClick={handleToggleLock}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              privacySettings.isSecretUnlocked
                ? 'bg-amber-500/20 text-amber-300 border border-amber-400/50'
                : 'bg-emerald-900/40 text-emerald-200 border border-emerald-500/30 hover:bg-emerald-900/60'
            }`}
            title={privacySettings.isSecretUnlocked ? 'Secret Mode Unlocked (Tap to Lock)' : 'Secret Mode Locked (Tap to Unlock Private Friends)'}
          >
            {privacySettings.isSecretUnlocked ? (
              <>
                <Unlock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span className="hidden sm:inline">Secret Mode: Unlocked</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Secret Mode: Locked</span>
              </>
            )}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 text-emerald-100 hover:text-white dark:text-gray-300 rounded-full hover:bg-black/10 transition-colors"
            title="Toggle Dark / Light Mode"
          >
            {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Current User Chip & Switcher */}
          {currentUser && (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 bg-emerald-800/60 hover:bg-emerald-800 dark:bg-gray-800/80 p-1.5 pr-3 rounded-full border border-emerald-500/30 transition-colors"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.displayName}
                  className="w-7 h-7 rounded-full object-cover border border-emerald-400"
                />
                <span className="text-xs font-medium text-white max-w-[90px] truncate hidden sm:inline">
                  {currentUser.displayName}
                </span>
              </button>

              {/* User Switcher Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#111b21] rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 py-2 z-50 text-gray-800 dark:text-gray-100">
                  <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Logged in as</p>
                    <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 truncate">
                      @{currentUser.username}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                      "{currentUser.statusNote}"
                    </p>
                  </div>

                  <p className="px-4 pt-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    Switch User / Testing
                  </p>
                  <div className="max-h-40 overflow-y-auto">
                    {allUsers.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => {
                          switchUser(u);
                          setShowUserMenu(false);
                        }}
                        className={`w-full px-4 py-2 text-left text-xs flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-800/70 transition-colors ${
                          u.id === currentUser.id ? 'bg-emerald-50 dark:bg-emerald-950/40 font-bold text-emerald-700 dark:text-emerald-400' : ''
                        }`}
                      >
                        <div className="flex items-center space-x-2 truncate">
                          <img src={u.avatar} alt={u.displayName} className="w-5 h-5 rounded-full" />
                          <span className="truncate">{u.displayName}</span>
                        </div>
                        {u.id === currentUser.id && <UserCheck className="w-4 h-4 text-emerald-500" />}
                      </button>
                    ))}
                  </div>

                  <div className="border-t border-gray-100 dark:border-gray-800 mt-1 pt-1">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        setActiveTab('privacy');
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center space-x-2"
                    >
                      <Shield className="w-4 h-4 text-emerald-600" />
                      <span>Privacy & Secret Friends</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <nav className="max-w-7xl mx-auto px-4 flex space-x-1 sm:space-x-4 border-t border-emerald-700/40 dark:border-gray-700/40 text-xs font-semibold uppercase tracking-wider">
        <button
          onClick={() => setActiveTab('chats')}
          className={`flex-1 py-3 text-center flex items-center justify-center space-x-1.5 border-b-2 transition-all ${
            activeTab === 'chats'
              ? 'border-white text-white font-bold'
              : 'border-transparent text-emerald-100/80 dark:text-gray-400 hover:text-white'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Chats</span>
          {totalUnread > 0 && (
            <span className="bg-[#25D366] text-[#0b141a] text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">
              {totalUnread}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('status')}
          className={`flex-1 py-3 text-center flex items-center justify-center space-x-1.5 border-b-2 transition-all ${
            activeTab === 'status'
              ? 'border-white text-white font-bold'
              : 'border-transparent text-emerald-100/80 dark:text-gray-400 hover:text-white'
          }`}
        >
          <CircleDashed className="w-4 h-4" />
          <span>Status</span>
          <span className="w-2 h-2 rounded-full bg-emerald-300"></span>
        </button>

        <button
          onClick={() => setActiveTab('calls')}
          className={`flex-1 py-3 text-center flex items-center justify-center space-x-1.5 border-b-2 transition-all ${
            activeTab === 'calls'
              ? 'border-white text-white font-bold'
              : 'border-transparent text-emerald-100/80 dark:text-gray-400 hover:text-white'
          }`}
        >
          <Phone className="w-4 h-4" />
          <span>Calls</span>
        </button>

        <button
          onClick={() => setActiveTab('privacy')}
          className={`flex-1 py-3 text-center flex items-center justify-center space-x-1.5 border-b-2 transition-all ${
            activeTab === 'privacy'
              ? 'border-white text-white font-bold'
              : 'border-transparent text-emerald-100/80 dark:text-gray-400 hover:text-white'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Secret Friends 🔒</span>
        </button>
      </nav>

      {/* PIN Unlock Modal */}
      {showPinModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111b21] rounded-2xl max-w-sm w-full p-6 text-gray-900 dark:text-gray-100 shadow-2xl border border-gray-200 dark:border-gray-800 animate-in fade-in zoom-in duration-150">
            <div className="flex flex-col items-center text-center mb-5">
              <div className="bg-emerald-100 dark:bg-emerald-950/60 p-3 rounded-full mb-2">
                <KeyRound className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold">Enter Secret PIN</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Unlock private chats & secret friends on FA97 Chat. (Default PIN: <code className="text-emerald-600 font-mono">1234</code>)
              </p>
            </div>

            <form onSubmit={handleVerifyPin} className="space-y-4">
              <input
                type="password"
                maxLength={6}
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setPinError(false);
                }}
                placeholder="Enter PIN..."
                autoFocus
                className="w-full text-center text-2xl tracking-[0.5em] font-mono py-2.5 px-4 bg-gray-50 dark:bg-[#202c33] border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />

              {pinError && (
                <p className="text-xs text-red-500 text-center font-medium">
                  Incorrect PIN. Please try again or reset in Privacy settings.
                </p>
              )}

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPinModal(false)}
                  className="flex-1 py-2.5 text-xs font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-semibold text-white bg-[#128C7E] hover:bg-[#075E54] rounded-xl shadow"
                >
                  Unlock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
