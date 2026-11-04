import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  User,
  Chat,
  Message,
  StatusItem,
  CallRecord,
  ActiveCall,
  PrivacySettings,
  MessageType,
  CallType,
} from '../types';
import { SYSTEM_USERS, INITIAL_STATUSES, INITIAL_CALLS, GEMINI_BOT_ID } from '../data/initialData';

interface ChatContextType {
  currentUser: User | null;
  allUsers: User[];
  chats: Chat[];
  activeChatId: string | null;
  activeChat: Chat | null;
  messages: Record<string, Message[]>; // chatId -> messages
  statuses: StatusItem[];
  callHistory: CallRecord[];
  activeCall: ActiveCall | null;
  privacySettings: PrivacySettings;
  activeTab: 'chats' | 'status' | 'calls' | 'privacy';
  activeStatusViewer: { userId: string; initialIndex?: number } | null;
  isGalleryOpen: boolean;
  galleryTarget: 'status' | 'chat' | null;
  
  // Actions
  login: (username: string, avatar?: string, displayName?: string) => void;
  switchUser: (user: User) => void;
  logout: () => void;
  setActiveChatId: (id: string | null) => void;
  setActiveTab: (tab: 'chats' | 'status' | 'calls' | 'privacy') => void;
  sendMessage: (chatId: string, text?: string, type?: MessageType, mediaUrl?: string, voiceDuration?: number) => void;
  addReaction: (messageId: string, emoji: string) => void;
  deleteMessage: (messageId: string) => void;
  createChatWithUsername: (username: string, isSecret?: boolean) => string | null;
  postStatus: (type: 'text' | 'image' | 'video', content: string, caption?: string, bgColor?: string, fontStyle?: string) => void;
  deleteStatus: (statusId: string) => void;
  viewStatus: (statusId: string) => void;
  openStatusViewer: (userId: string, index?: number) => void;
  closeStatusViewer: () => void;
  startCall: (peerUser: User, callType: CallType) => void;
  acceptCall: () => void;
  endCall: () => void;
  toggleMuteCall: () => void;
  toggleCameraCall: () => void;
  toggleSecretFriend: (userId: string) => void;
  setSecretPin: (pin: string) => void;
  unlockSecretPin: (pin: string) => boolean;
  lockSecretMode: () => void;
  openGallery: (target: 'status' | 'chat') => void;
  closeGallery: () => void;
  triggerGeminiReply: (chatId: string, userText: string) => Promise<void>;
  updateUserStatusNote: (note: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('fa97_current_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return null; }
    }
    return null;
  });

  const [allUsers, setAllUsers] = useState<User[]>(SYSTEM_USERS);
  const [activeTab, setActiveTab] = useState<'chats' | 'status' | 'calls' | 'privacy'>('chats');
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  
  // Messages state
  const [messages, setMessages] = useState<Record<string, Message[]>>(() => {
    const saved = localStorage.getItem('fa97_messages');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    // Default starter messages for demo chats
    return {
      'chat_gemini': [
        {
          id: 'msg_gem_1',
          chatId: 'chat_gemini',
          senderId: GEMINI_BOT_ID,
          senderName: 'FA97 Gemini AI Assistant',
          text: 'Hello! I am your FA97 Gemini AI Assistant. Ask me anything, request a story, or get help with your statuses!',
          type: 'text',
          timestamp: Date.now() - 1000 * 60 * 10,
          status: 'read',
        },
      ],
      'chat_sam': [
        {
          id: 'msg_sam_1',
          chatId: 'chat_sam',
          senderId: 'user_sam',
          senderName: 'Sam Miller',
          text: 'Hey! Did you see the new video call and voice note features on FA97 Chat? They work great!',
          type: 'text',
          timestamp: Date.now() - 1000 * 60 * 30,
          status: 'read',
        },
      ],
      'chat_david': [
        {
          id: 'msg_david_1',
          chatId: 'chat_david',
          senderId: 'user_david',
          senderName: 'David Kim',
          text: 'Hey, this is our private secret chat! It is locked behind your Secret PIN 🔒',
          type: 'text',
          timestamp: Date.now() - 1000 * 60 * 60,
          status: 'read',
          isSecret: true,
        },
      ],
    };
  });

  // Chats list state
  const [chats, setChats] = useState<Chat[]>(() => {
    const saved = localStorage.getItem('fa97_chats');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return [
      {
        id: 'chat_gemini',
        isGroup: false,
        name: 'FA97 Gemini AI Assistant',
        avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
        participantIds: [GEMINI_BOT_ID],
        unreadCount: 0,
        isPinned: true,
      },
      {
        id: 'chat_sam',
        isGroup: false,
        name: 'Sam Miller',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        participantIds: ['user_sam'],
        unreadCount: 1,
      },
      {
        id: 'chat_maria',
        isGroup: false,
        name: 'Maria Garcia',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        participantIds: ['user_maria'],
        unreadCount: 0,
      },
      {
        id: 'chat_david',
        isGroup: false,
        name: 'David Kim (Secret 🔒)',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        participantIds: ['user_david'],
        unreadCount: 0,
        isSecret: true,
      },
    ];
  });

  // Statuses state
  const [statuses, setStatuses] = useState<StatusItem[]>(() => {
    const saved = localStorage.getItem('fa97_statuses');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return INITIAL_STATUSES;
  });

  // Calls state
  const [callHistory, setCallHistory] = useState<CallRecord[]>(INITIAL_CALLS);
  const [activeCall, setActiveCall] = useState<ActiveCall | null>(null);

  // Status viewer state
  const [activeStatusViewer, setActiveStatusViewer] = useState<{ userId: string; initialIndex?: number } | null>(null);

  // Gallery picker modal state
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [galleryTarget, setGalleryTarget] = useState<'status' | 'chat' | null>(null);

  // Privacy Settings state
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>(() => {
    const saved = localStorage.getItem('fa97_privacy');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return {
      secretPin: '1234',
      secretPinEnabled: true,
      isSecretUnlocked: false,
      hideSecretChats: true,
      statusPrivacy: 'all',
      secretFriendIds: ['user_david'],
    };
  });

  // Socket reference
  const socketRef = useRef<WebSocket | null>(null);

  // Persist storage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('fa97_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('fa97_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('fa97_chats', JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    localStorage.setItem('fa97_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('fa97_statuses', JSON.stringify(statuses));
  }, [statuses]);

  useEffect(() => {
    localStorage.setItem('fa97_privacy', JSON.stringify(privacySettings));
  }, [privacySettings]);

  // Establish WebSocket connection
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    try {
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        console.log('Connected to FA97 Chat WebSocket');
      };

      socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'NEW_MESSAGE') {
            const incomingMsg: Message = payload.data;
            setMessages((prev) => {
              const chatMsgs = prev[incomingMsg.chatId] || [];
              if (chatMsgs.some((m) => m.id === incomingMsg.id)) return prev;
              return {
                ...prev,
                [incomingMsg.chatId]: [...chatMsgs, incomingMsg],
              };
            });
            // Update last message in chats
            setChats((prev) =>
              prev.map((c) =>
                c.id === incomingMsg.chatId
                  ? { ...c, lastMessage: incomingMsg, unreadCount: c.id === activeChatId ? 0 : c.unreadCount + 1 }
                  : c
              )
            );
          } else if (payload.type === 'NEW_STATUS') {
            const incomingStatus: StatusItem = payload.data;
            setStatuses((prev) => {
              if (prev.some((s) => s.id === incomingStatus.id)) return prev;
              return [incomingStatus, ...prev];
            });
          } else if (payload.type === 'CALL_OFFER') {
            if (currentUser && payload.targetUserId === currentUser.id) {
              setActiveCall({
                id: payload.callId,
                callType: payload.callType,
                peerUser: payload.callerUser,
                isIncoming: true,
                status: 'ringing',
                isMuted: false,
                isCameraOn: payload.callType === 'video',
              });
            }
          } else if (payload.type === 'CALL_END') {
            if (activeCall && activeCall.id === payload.callId) {
              setActiveCall(null);
            }
          }
        } catch (e) {
          console.error('WebSocket receive parse error:', e);
        }
      };

      return () => {
        socket.close();
      };
    } catch (e) {
      console.warn('WebSocket setup failed:', e);
    }
  }, [currentUser, activeChatId]);

  // Login handler
  const login = (username: string, avatar?: string, displayName?: string) => {
    const cleanUsername = username.trim().toLowerCase();
    const cleanDisplayName = displayName?.trim() || username.trim();
    const userAvatar = avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanUsername}`;
    
    const newUser: User = {
      id: `user_${cleanUsername.replace(/\s+/g, '_')}`,
      username: cleanUsername,
      displayName: cleanDisplayName,
      avatar: userAvatar,
      statusNote: 'Hey there! Using FA97 Chat.',
      isOnline: true,
    };

    setCurrentUser(newUser);

    // Register on backend
    fetch('/api/users/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser),
    }).catch(console.error);
  };

  const switchUser = (user: User) => {
    setCurrentUser(user);
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('fa97_current_user');
  };

  const activeChat = chats.find((c) => c.id === activeChatId) || null;

  // Send message function
  const sendMessage = (
    chatId: string,
    text?: string,
    type: MessageType = 'text',
    mediaUrl?: string,
    voiceDuration?: number
  ) => {
    if (!currentUser) return;

    const currentChat = chats.find((c) => c.id === chatId);
    const newMsg: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      chatId,
      senderId: currentUser.id,
      senderName: currentUser.displayName,
      text,
      type,
      mediaUrl,
      voiceDuration,
      timestamp: Date.now(),
      status: 'sent',
      isSecret: currentChat?.isSecret,
    };

    // Update local state immediately (optimistic)
    setMessages((prev) => ({
      ...prev,
      [chatId]: [...(prev[chatId] || []), newMsg],
    }));

    setChats((prev) =>
      prev.map((c) => (c.id === chatId ? { ...c, lastMessage: newMsg } : c))
    );

    // Send via WebSocket if connected
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          type: 'SEND_MESSAGE',
          payload: newMsg,
        })
      );
    } else {
      // Fallback via REST API
      fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMsg),
      }).catch(console.error);
    }

    // Trigger Gemini AI reply if chatting with Gemini AI Assistant
    if (chatId === 'chat_gemini' || currentChat?.participantIds.includes(GEMINI_BOT_ID)) {
      triggerGeminiReply(chatId, text || 'Attached media');
    }
  };

  // Gemini reply simulation / proxy handler
  const triggerGeminiReply = async (chatId: string, userText: string) => {
    try {
      const res = await fetch('/api/chat/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userText }),
      });
      const data = await res.json();
      const replyText = data.reply || 'Thanks for chatting with FA97 Gemini AI!';

      setTimeout(() => {
        const geminiMsg: Message = {
          id: `msg_gem_${Date.now()}`,
          chatId,
          senderId: GEMINI_BOT_ID,
          senderName: 'FA97 Gemini AI Assistant',
          text: replyText,
          type: 'text',
          timestamp: Date.now(),
          status: 'read',
        };

        setMessages((prev) => ({
          ...prev,
          [chatId]: [...(prev[chatId] || []), geminiMsg],
        }));

        setChats((prev) =>
          prev.map((c) => (c.id === chatId ? { ...c, lastMessage: geminiMsg } : c))
        );
      }, 800);
    } catch (e) {
      console.error('Gemini call error:', e);
    }
  };

  const addReaction = (messageId: string, emoji: string) => {
    if (!currentUser || !activeChatId) return;
    setMessages((prev) => {
      const chatMsgs = prev[activeChatId] || [];
      const updated = chatMsgs.map((m) => {
        if (m.id === messageId) {
          const currentReactions = m.reactions || {};
          const userList = currentReactions[emoji] || [];
          const hasReacted = userList.includes(currentUser.id);
          const newList = hasReacted
            ? userList.filter((uid) => uid !== currentUser.id)
            : [...userList, currentUser.id];

          return {
            ...m,
            reactions: {
              ...currentReactions,
              [emoji]: newList,
            },
          };
        }
        return m;
      });
      return { ...prev, [activeChatId]: updated };
    });
  };

  const deleteMessage = (messageId: string) => {
    if (!activeChatId) return;
    setMessages((prev) => ({
      ...prev,
      [activeChatId]: (prev[activeChatId] || []).filter((m) => m.id !== messageId),
    }));
  };

  // Create chat with a friend by username
  const createChatWithUsername = (username: string, isSecret = false): string | null => {
    const clean = username.trim().toLowerCase();
    if (!clean) return null;

    // Check if chat already exists
    const existing = chats.find(
      (c) => c.name.toLowerCase() === clean || c.participantIds.some((p) => p.includes(clean))
    );
    if (existing) {
      setActiveChatId(existing.id);
      return existing.id;
    }

    const newChatId = `chat_${clean}_${Date.now()}`;
    const displayName = username.charAt(0).toUpperCase() + username.slice(1);
    const avatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${clean}`;

    const newChat: Chat = {
      id: newChatId,
      isGroup: false,
      name: displayName + (isSecret ? ' (Secret 🔒)' : ''),
      avatar,
      participantIds: [`user_${clean}`],
      unreadCount: 0,
      isSecret,
    };

    setChats((prev) => [newChat, ...prev]);
    setActiveChatId(newChatId);
    return newChatId;
  };

  // Post new status
  const postStatus = (
    type: 'text' | 'image' | 'video',
    content: string,
    caption?: string,
    bgColor = '#128C7E',
    fontStyle = 'sans'
  ) => {
    if (!currentUser) return;

    const newStatus: StatusItem = {
      id: `status_${Date.now()}`,
      userId: currentUser.id,
      username: currentUser.displayName,
      userAvatar: currentUser.avatar,
      type,
      content,
      caption,
      bgColor,
      fontStyle,
      timestamp: Date.now(),
      viewers: [],
    };

    setStatuses((prev) => [newStatus, ...prev]);

    // Broadcast status to server
    fetch('/api/statuses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newStatus),
    }).catch(console.error);
  };

  const deleteStatus = (statusId: string) => {
    setStatuses((prev) => prev.filter((s) => s.id !== statusId));
  };

  const viewStatus = (statusId: string) => {
    if (!currentUser) return;
    setStatuses((prev) =>
      prev.map((s) => {
        if (s.id === statusId && !s.viewers.includes(currentUser.id)) {
          return { ...s, viewers: [...s.viewers, currentUser.id] };
        }
        return s;
      })
    );
  };

  const openStatusViewer = (userId: string, index = 0) => {
    setActiveStatusViewer({ userId, initialIndex: index });
  };

  const closeStatusViewer = () => {
    setActiveStatusViewer(null);
  };

  // Video & Voice Call management
  const startCall = (peerUser: User, callType: CallType) => {
    if (!currentUser) return;

    const callId = `call_${Date.now()}`;
    const call: ActiveCall = {
      id: callId,
      callType,
      peerUser,
      isIncoming: false,
      status: 'ringing',
      isMuted: false,
      isCameraOn: callType === 'video',
    };

    setActiveCall(call);

    // Send call offer via WebSockets
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          type: 'CALL_OFFER',
          callId,
          callType,
          callerUser: currentUser,
          targetUserId: peerUser.id,
        })
      );
    }
  };

  const acceptCall = () => {
    if (!activeCall) return;
    setActiveCall((prev) => (prev ? { ...prev, status: 'connected', startTime: Date.now() } : null));
  };

  const endCall = () => {
    if (activeCall && currentUser) {
      // Record call history log
      const duration = activeCall.startTime ? Math.round((Date.now() - activeCall.startTime) / 1000) : 0;
      const newCallRecord: CallRecord = {
        id: activeCall.id,
        callerId: activeCall.isIncoming ? activeCall.peerUser.id : currentUser.id,
        receiverId: activeCall.isIncoming ? currentUser.id : activeCall.peerUser.id,
        callerName: activeCall.isIncoming ? activeCall.peerUser.displayName : currentUser.displayName,
        callerAvatar: activeCall.isIncoming ? activeCall.peerUser.avatar : currentUser.avatar,
        receiverName: activeCall.isIncoming ? currentUser.displayName : activeCall.peerUser.displayName,
        receiverAvatar: activeCall.isIncoming ? currentUser.avatar : activeCall.peerUser.avatar,
        type: activeCall.callType,
        status: activeCall.status === 'connected' ? 'completed' : 'missed',
        duration,
        timestamp: Date.now(),
      };

      setCallHistory((prev) => [newCallRecord, ...prev]);

      // Broadcast call end signal
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(
          JSON.stringify({
            type: 'CALL_END',
            callId: activeCall.id,
          })
        );
      }
    }
    setActiveCall(null);
  };

  const toggleMuteCall = () => {
    setActiveCall((prev) => (prev ? { ...prev, isMuted: !prev.isMuted } : null));
  };

  const toggleCameraCall = () => {
    setActiveCall((prev) => (prev ? { ...prev, isCameraOn: !prev.isCameraOn } : null));
  };

  // Secret Friends & Privacy
  const toggleSecretFriend = (userId: string) => {
    setPrivacySettings((prev) => {
      const exists = prev.secretFriendIds.includes(userId);
      const updatedList = exists
        ? prev.secretFriendIds.filter((id) => id !== userId)
        : [...prev.secretFriendIds, userId];

      // Also toggle isSecret on matching chat
      setChats((chatList) =>
        chatList.map((c) =>
          c.participantIds.includes(userId) ? { ...c, isSecret: !exists } : c
        )
      );

      return { ...prev, secretFriendIds: updatedList };
    });
  };

  const setSecretPin = (pin: string) => {
    setPrivacySettings((prev) => ({ ...prev, secretPin: pin, secretPinEnabled: true }));
  };

  const unlockSecretPin = (pin: string) => {
    if (pin === privacySettings.secretPin) {
      setPrivacySettings((prev) => ({ ...prev, isSecretUnlocked: true }));
      return true;
    }
    return false;
  };

  const lockSecretMode = () => {
    setPrivacySettings((prev) => ({ ...prev, isSecretUnlocked: false }));
  };

  const openGallery = (target: 'status' | 'chat') => {
    setGalleryTarget(target);
    setIsGalleryOpen(true);
  };

  const closeGallery = () => {
    setIsGalleryOpen(false);
    setGalleryTarget(null);
  };

  const updateUserStatusNote = (note: string) => {
    if (!currentUser) return;
    const updated = { ...currentUser, statusNote: note };
    setCurrentUser(updated);
  };

  return (
    <ChatContext.Provider
      value={{
        currentUser,
        allUsers,
        chats,
        activeChatId,
        activeChat,
        messages,
        statuses,
        callHistory,
        activeCall,
        privacySettings,
        activeTab,
        activeStatusViewer,
        isGalleryOpen,
        galleryTarget,
        login,
        switchUser,
        logout,
        setActiveChatId,
        setActiveTab,
        sendMessage,
        addReaction,
        deleteMessage,
        createChatWithUsername,
        postStatus,
        deleteStatus,
        viewStatus,
        openStatusViewer,
        closeStatusViewer,
        startCall,
        acceptCall,
        endCall,
        toggleMuteCall,
        toggleCameraCall,
        toggleSecretFriend,
        setSecretPin,
        unlockSecretPin,
        lockSecretMode,
        openGallery,
        closeGallery,
        triggerGeminiReply,
        updateUserStatusNote,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
