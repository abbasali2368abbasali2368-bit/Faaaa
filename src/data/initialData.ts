import { User, Chat, StatusItem, CallRecord, Message } from '../types';

export const GEMINI_BOT_ID = 'gemini-ai-bot';

export const SYSTEM_USERS: User[] = [
  {
    id: GEMINI_BOT_ID,
    username: 'gemini_ai',
    displayName: 'FA97 Gemini AI Assistant',
    avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
    statusNote: '🤖 AI Assistant on FA97 Chat. Ask me anything!',
    isOnline: true,
  },
  {
    id: 'user_sam',
    username: 'sam_m',
    displayName: 'Sam Miller',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    statusNote: 'Hey there! Using FA97 Chat.',
    isOnline: true,
  },
  {
    id: 'user_maria',
    username: 'maria_g',
    displayName: 'Maria Garcia',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    statusNote: 'At work 💼 | Call if urgent',
    isOnline: false,
    lastSeen: 'Today at 09:42 AM',
  },
  {
    id: 'user_david',
    username: 'david_k',
    displayName: 'David Kim (Secret Friend 🔒)',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    statusNote: '🔒 Private contact',
    isOnline: true,
    isSecret: true,
  },
];

export const INITIAL_STATUSES: StatusItem[] = [
  {
    id: 'status-1',
    userId: 'user_sam',
    username: 'Sam Miller',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    type: 'text',
    content: '🚀 Welcome to FA97 Chat! Enjoy video calls, status updates, and secret private chats!',
    bgColor: '#128C7E',
    fontStyle: 'sans',
    timestamp: Date.now() - 1000 * 60 * 45,
    viewers: [],
  },
  {
    id: 'status-2',
    userId: 'user_maria',
    username: 'Maria Garcia',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    type: 'image',
    content: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
    caption: 'Sunset vibes at the beach today 🌅🌊',
    timestamp: Date.now() - 1000 * 60 * 120,
    viewers: [],
  },
];

export const INITIAL_CALLS: CallRecord[] = [
  {
    id: 'call-1',
    callerId: 'user_sam',
    receiverId: 'current_user',
    callerName: 'Sam Miller',
    callerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    receiverName: 'You',
    receiverAvatar: '',
    type: 'video',
    status: 'completed',
    duration: 142,
    timestamp: Date.now() - 1000 * 60 * 60 * 2,
  },
  {
    id: 'call-2',
    callerId: 'user_maria',
    receiverId: 'current_user',
    callerName: 'Maria Garcia',
    callerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    receiverName: 'You',
    receiverAvatar: '',
    type: 'voice',
    status: 'missed',
    duration: 0,
    timestamp: Date.now() - 1000 * 60 * 60 * 18,
  },
];
