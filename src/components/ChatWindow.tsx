import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../context/ChatContext';
import { VoiceRecorder } from './VoiceRecorder';
import { VoiceMessagePlayer } from './VoiceMessagePlayer';
import {
  Video,
  Phone,
  MoreVertical,
  Paperclip,
  Send,
  Smile,
  CheckCheck,
  Lock,
  Unlock,
  Shield,
  Trash2,
  Sparkles,
  ArrowLeft,
  Image as ImageIcon,
  Film,
} from 'lucide-react';

interface ChatWindowProps {
  onBackMobile: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ onBackMobile }) => {
  const {
    activeChat,
    activeChatId,
    messages,
    currentUser,
    sendMessage,
    addReaction,
    deleteMessage,
    startCall,
    allUsers,
    toggleSecretFriend,
    privacySettings,
    openGallery,
  } = useChat();

  const [textInput, setTextInput] = useState('');
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const chatMessages = activeChatId ? messages[activeChatId] || [] : [];

  // Peer user info
  const peerUserId = activeChat?.participantIds.find((id) => id !== currentUser?.id) || activeChat?.participantIds[0];
  const peerUser = allUsers.find((u) => u.id === peerUserId) || {
    id: peerUserId || 'unknown',
    username: activeChat?.name || 'Contact',
    displayName: activeChat?.name || 'Contact',
    avatar: activeChat?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=friend',
    statusNote: 'Using FA97 Chat',
    isOnline: true,
  };

  const isSecretFriend = privacySettings.secretFriendIds.includes(peerUser.id);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages.length]);

  if (!activeChat) {
    return (
      <div className="flex-1 bg-[#f0f2f5] dark:bg-[#0b141a] flex flex-col items-center justify-center p-8 text-center select-none border-b-8 border-[#25D366]">
        <div className="w-24 h-24 bg-[#25D366]/20 rounded-full flex items-center justify-center mb-4">
          <div className="bg-[#25D366] text-[#0b141a] font-black text-2xl px-4 py-2 rounded-xl">
            FA97
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          FA97 Chat for Web
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 max-w-sm leading-relaxed">
          Send and receive messages without logging in! Start voice/video calls, share voice notes, pictures, and post status updates.
        </p>
        <div className="mt-6 flex items-center space-x-2 text-xs text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-gray-800 px-4 py-2 rounded-full">
          <Lock className="w-3.5 h-3.5 text-emerald-500" />
          <span>Secret Private Chats Protected with Secret PIN</span>
        </div>
      </div>
    );
  }

  const handleSendText = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!textInput.trim() || !activeChatId) return;

    sendMessage(activeChatId, textInput.trim(), 'text');
    setTextInput('');
    setShowEmojiPicker(false);
  };

  const handleSendVoiceNote = (mediaUrl: string, duration: number) => {
    if (!activeChatId) return;
    sendMessage(activeChatId, undefined, 'audio', mediaUrl, duration);
    setIsRecordingVoice(false);
  };

  const sampleEmojis = ['👍', '❤️', '😂', '😮', '😢', '🙏', '🔥', '🎉'];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#efeae2] dark:bg-[#0b141a] relative overflow-hidden">
      {/* WhatsApp Background Subtle Pattern Overlay */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02] bg-[radial-gradient(#075E54_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>

      {/* Header Bar */}
      <div className="bg-white dark:bg-[#202c33] px-4 py-2.5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between z-10 shadow-sm">
        <div className="flex items-center space-x-3 min-w-0">
          <button
            onClick={onBackMobile}
            className="md:hidden p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <img
            src={peerUser.avatar}
            alt={peerUser.displayName}
            className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-700"
          />

          <div className="min-w-0">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white truncate flex items-center gap-1.5">
              {peerUser.displayName}
              {isSecretFriend && <Lock className="w-3.5 h-3.5 text-amber-500 inline" />}
              {activeChat.id === 'chat_gemini' && <Sparkles className="w-3.5 h-3.5 text-emerald-500 inline" />}
            </h2>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium truncate">
              {peerUser.isOnline ? 'online' : peerUser.lastSeen || 'offline'}
            </p>
          </div>
        </div>

        {/* Action Controls (Video, Voice Call, Options) */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          {/* Video Call */}
          <button
            onClick={() => startCall(peerUser, 'video')}
            className="p-2 text-[#075E54] dark:text-emerald-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            title="Start Video Call"
          >
            <Video className="w-5 h-5" />
          </button>

          {/* Voice Call */}
          <button
            onClick={() => startCall(peerUser, 'voice')}
            className="p-2 text-[#075E54] dark:text-emerald-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            title="Start Voice Call"
          >
            <Phone className="w-5 h-5" />
          </button>

          {/* More Options Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowOptionsMenu(!showOptionsMenu)}
              className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {showOptionsMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#111b21] rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 py-1.5 z-50 text-xs">
                <button
                  onClick={() => {
                    toggleSecretFriend(peerUser.id);
                    setShowOptionsMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center space-x-2 text-gray-800 dark:text-gray-200"
                >
                  <Shield className="w-4 h-4 text-amber-500" />
                  <span>{isSecretFriend ? 'Remove Secret Lock' : 'Mark as Secret Friend 🔒'}</span>
                </button>

                <button
                  onClick={() => {
                    openGallery('chat');
                    setShowOptionsMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center space-x-2 text-gray-800 dark:text-gray-200"
                >
                  <ImageIcon className="w-4 h-4 text-emerald-500" />
                  <span>Attach Media from Gallery</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages Scroll View */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 z-0">
        {chatMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
            <div className="bg-emerald-100 dark:bg-emerald-950/60 p-4 rounded-full mb-3">
              <Lock className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Messages are end-to-end simulated & stored locally!
            </p>
            <p className="text-[11px] text-gray-400 max-w-xs mt-1">
              No login required. Type a message or send a voice note to start talking.
            </p>
          </div>
        ) : (
          chatMessages.map((msg) => {
            const isMe = msg.senderId === currentUser?.id;
            return (
              <div
                key={msg.id}
                className={`flex flex-col group ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`relative max-w-[85%] sm:max-w-md p-3 rounded-2xl shadow-sm text-sm ${
                    isMe
                      ? 'bg-[#d9fdd3] dark:bg-[#005c4b] text-gray-900 dark:text-gray-100 rounded-tr-none'
                      : 'bg-white dark:bg-[#202c33] text-gray-900 dark:text-gray-100 rounded-tl-none border border-gray-100 dark:border-gray-800'
                  }`}
                >
                  {/* Sender Name in group/chats */}
                  {!isMe && (
                    <p className="text-[11px] font-bold text-[#128C7E] dark:text-[#25D366] mb-1">
                      {msg.senderName}
                    </p>
                  )}

                  {/* Message Content: Voice Note */}
                  {msg.type === 'audio' && (
                    <VoiceMessagePlayer
                      audioUrl={msg.mediaUrl}
                      duration={msg.voiceDuration || 5}
                      senderAvatar={isMe ? currentUser?.avatar : peerUser.avatar}
                    />
                  )}

                  {/* Message Content: Image */}
                  {msg.type === 'image' && msg.mediaUrl && (
                    <div className="rounded-xl overflow-hidden mb-1 border border-black/10">
                      <img src={msg.mediaUrl} alt="Shared photo" className="max-h-60 w-full object-cover" />
                    </div>
                  )}

                  {/* Message Content: Video */}
                  {msg.type === 'video' && msg.mediaUrl && (
                    <div className="rounded-xl overflow-hidden mb-1 border border-black/10">
                      <video src={msg.mediaUrl} controls className="max-h-60 w-full object-cover" />
                    </div>
                  )}

                  {/* Message Content: Text */}
                  {msg.text && <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>}

                  {/* Reactions Display */}
                  {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                    <div className="flex space-x-1 mt-1 bg-white/80 dark:bg-black/40 px-2 py-0.5 rounded-full text-xs border border-gray-200 dark:border-gray-700 w-fit">
                      {Object.entries(msg.reactions).map(([emoji, uids]) => (
                        <span key={emoji} title={`${uids.length} reactions`}>
                          {emoji} {uids.length > 1 && uids.length}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Timestamp & Ticks */}
                  <div className="flex items-center justify-end space-x-1 text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                    <span>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {isMe && (
                      <CheckCheck
                        className={`w-3.5 h-3.5 ${
                          msg.status === 'read' ? 'text-blue-500' : 'text-gray-400'
                        }`}
                      />
                    )}
                  </div>

                  {/* Quick Reaction Bar on Hover */}
                  <div className="hidden group-hover:flex items-center space-x-1 absolute -top-4 right-2 bg-white dark:bg-[#111b21] p-1 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 z-20">
                    {sampleEmojis.slice(0, 5).map((e) => (
                      <button
                        key={e}
                        onClick={() => addReaction(msg.id, e)}
                        className="hover:scale-125 transition-transform text-xs"
                      >
                        {e}
                      </button>
                    ))}
                    <button
                      onClick={() => deleteMessage(msg.id)}
                      className="p-1 text-red-500 hover:text-red-700 text-xs"
                      title="Delete message"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Emoji Picker Popup */}
      {showEmojiPicker && (
        <div className="p-2 bg-white dark:bg-[#202c33] border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-2 text-xl z-10 animate-in fade-in duration-100">
          {['😀', '😂', '😍', '🔥', '🎉', '👍', '❤️', '🙌', '😎', '🙏', '✨', '👋', '💯', '🚀'].map((emoji) => (
            <button
              key={emoji}
              onClick={() => {
                setTextInput((prev) => prev + emoji);
              }}
              className="hover:scale-125 transition-transform p-1"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Bottom Composer */}
      <div className="p-3 bg-gray-50 dark:bg-[#202c33] border-t border-gray-200 dark:border-gray-800 z-10">
        {isRecordingVoice ? (
          <VoiceRecorder
            onSendVoice={handleSendVoiceNote}
            onCancel={() => setIsRecordingVoice(false)}
          />
        ) : (
          <form onSubmit={handleSendText} className="flex items-center space-x-2">
            {/* Emoji Toggle */}
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-emerald-600 transition-colors"
            >
              <Smile className="w-5 h-5" />
            </button>

            {/* Attachment / Gallery */}
            <button
              type="button"
              onClick={() => openGallery('chat')}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-emerald-600 transition-colors"
              title="Upload picture or video from gallery"
            >
              <Paperclip className="w-5 h-5" />
            </button>

            {/* Input Field */}
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 py-2 px-4 bg-white dark:bg-[#111b21] text-gray-900 dark:text-gray-100 text-sm border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />

            {/* Voice Note or Send Button */}
            {textInput.trim() ? (
              <button
                type="submit"
                className="p-2.5 bg-[#128C7E] hover:bg-[#075E54] text-white rounded-full shadow transition-transform active:scale-95"
              >
                <Send className="w-5 h-5 fill-current" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsRecordingVoice(true)}
                className="p-2.5 bg-[#128C7E] hover:bg-[#075E54] text-white rounded-full shadow transition-transform active:scale-95"
                title="Hold or tap to record voice note"
              >
                <Phone className="w-5 h-5" />
              </button>
            )}
          </form>
        )}
      </div>
    </div>
  );
};
