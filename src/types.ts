export type MessageType = 'text' | 'image' | 'video' | 'audio' | 'system' | 'call_log';
export type MessageStatus = 'sent' | 'delivered' | 'read';

export interface User {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  statusNote: string;
  isOnline: boolean;
  lastSeen?: string;
  isSecret?: boolean;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  text?: string;
  type: MessageType;
  mediaUrl?: string;
  voiceDuration?: number; // in seconds
  timestamp: number;
  status: MessageStatus;
  reactions?: Record<string, string[]>; // emoji -> array of userIds
  isSecret?: boolean;
  replyTo?: {
    id: string;
    senderName: string;
    text: string;
  };
}

export interface Chat {
  id: string;
  isGroup: boolean;
  name: string;
  avatar: string;
  participantIds: string[];
  lastMessage?: Message;
  unreadCount: number;
  isPinned?: boolean;
  isMuted?: boolean;
  isSecret?: boolean;
  disappearingHours?: number;
}

export type StatusType = 'text' | 'image' | 'video';

export interface StatusItem {
  id: string;
  userId: string;
  username: string;
  userAvatar: string;
  type: StatusType;
  content: string; // text string or media URL
  caption?: string;
  bgColor?: string;
  fontStyle?: string;
  timestamp: number;
  viewers: string[]; // userIds who viewed
  isSecretOnly?: boolean;
}

export type CallType = 'voice' | 'video';
export type CallStatus = 'completed' | 'missed' | 'declined' | 'ongoing';

export interface CallRecord {
  id: string;
  callerId: string;
  receiverId: string;
  callerName: string;
  callerAvatar: string;
  receiverName: string;
  receiverAvatar: string;
  type: CallType;
  status: CallStatus;
  duration: number; // in seconds
  timestamp: number;
}

export interface ActiveCall {
  id: string;
  callType: CallType;
  peerUser: User;
  isIncoming: boolean;
  status: 'ringing' | 'connected' | 'ended';
  isMuted: boolean;
  isCameraOn: boolean;
  isScreenSharing?: boolean;
  startTime?: number;
}

export interface PrivacySettings {
  secretPin: string;
  secretPinEnabled: boolean;
  isSecretUnlocked: boolean;
  hideSecretChats: boolean;
  statusPrivacy: 'all' | 'contacts' | 'except_secret';
  secretFriendIds: string[];
}
