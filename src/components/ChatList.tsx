import React, { useState } from 'react';
import { useChat } from '../context/ChatContext';
import { Search, Pin, VolumeX, Lock, UserPlus, CheckCheck, Sparkles } from 'lucide-react';

interface ChatListProps {
  onSelectChat: (chatId: string) => void;
  openNewChatModal: () => void;
}

export const ChatList: React.FC<ChatListProps> = ({ onSelectChat, openNewChatModal }) => {
  const { chats, activeChatId, messages, privacySettings, currentUser } = useChat();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter chats based on secret lock status & search query
  const visibleChats = chats.filter((chat) => {
    // If chat is secret and secret mode is locked, hide it if hideSecretChats is true
    if (chat.isSecret && privacySettings.hideSecretChats && !privacySettings.isSecretUnlocked) {
      return false;
    }

    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return chat.name.toLowerCase().includes(query);
  });

  const formatTimestamp = (ts?: number) => {
    if (!ts) return '';
    const date = new Date(ts);
    const now = new Date();
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="w-full md:w-80 lg:w-96 bg-white dark:bg-[#111b21] border-r border-gray-200 dark:border-gray-800 flex flex-col h-full select-none">
      {/* Search Header */}
      <div className="p-3 bg-gray-50 dark:bg-[#111b21] border-b border-gray-100 dark:border-gray-800 flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search chats or start new chat..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-white dark:bg-[#202c33] text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <button
          onClick={openNewChatModal}
          className="p-2 bg-[#128C7E] hover:bg-[#075E54] text-white rounded-xl shadow transition-transform active:scale-95"
          title="Add Friend by Username"
        >
          <UserPlus className="w-4 h-4" />
        </button>
      </div>

      {/* Chat Items List */}
      <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800/60">
        {visibleChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center p-6 text-gray-400">
            <p className="text-sm font-semibold">No chats found</p>
            <p className="text-xs mt-1">Tap + to start chatting with any username on FA97 Chat!</p>
            <button
              onClick={openNewChatModal}
              className="mt-3 px-4 py-2 bg-[#128C7E] text-white text-xs font-bold rounded-xl shadow"
            >
              Start New Chat
            </button>
          </div>
        ) : (
          visibleChats.map((chat) => {
            const chatMsgs = messages[chat.id] || [];
            const lastMsg = chat.lastMessage || chatMsgs[chatMsgs.length - 1];
            const isSelected = activeChatId === chat.id;

            return (
              <button
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className={`w-full p-3.5 text-left flex items-start space-x-3 transition-colors ${
                  isSelected
                    ? 'bg-emerald-50 dark:bg-[#2a3942]'
                    : 'hover:bg-gray-50 dark:hover:bg-[#202c33]'
                }`}
              >
                {/* Avatar with secret lock indicator */}
                <div className="relative flex-shrink-0">
                  <img
                    src={chat.avatar}
                    alt={chat.name}
                    className="w-12 h-12 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                  />
                  {chat.isSecret && (
                    <div className="absolute -bottom-1 -right-1 bg-amber-500 text-white p-1 rounded-full shadow border border-white dark:border-gray-900">
                      <Lock className="w-3 h-3" />
                    </div>
                  )}
                  {chat.id === 'chat_gemini' && (
                    <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full shadow border border-white dark:border-gray-900">
                      <Sparkles className="w-3 h-3" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate flex items-center gap-1">
                      {chat.name}
                      {chat.isPinned && <Pin className="w-3 h-3 text-emerald-600 fill-current" />}
                    </h3>
                    {lastMsg && (
                      <span className="text-[11px] text-gray-400 font-medium">
                        {formatTimestamp(lastMsg.timestamp)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <p className="truncate pr-2 flex items-center space-x-1">
                      {lastMsg?.senderId === currentUser?.id && (
                        <CheckCheck className="w-3.5 h-3.5 text-emerald-500 inline flex-shrink-0" />
                      )}
                      <span className="truncate">
                        {lastMsg ? (
                          lastMsg.type === 'audio' ? (
                            '🎤 Voice note'
                          ) : lastMsg.type === 'image' ? (
                            '📷 Photo'
                          ) : lastMsg.type === 'video' ? (
                            '🎥 Video'
                          ) : (
                            lastMsg.text
                          )
                        ) : (
                          'Tap to start conversation...'
                        )}
                      </span>
                    </p>

                    {/* Unread badge */}
                    {chat.unreadCount > 0 && !isSelected && (
                      <span className="bg-[#25D366] text-[#0b141a] font-extrabold text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0">
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
