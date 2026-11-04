import express from 'express';
import http from 'http';
import path from 'path';
import { WebSocketServer, WebSocket } from 'ws';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

const app = express();
const server = http.createServer(app);
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// In-memory data store for real-time messaging across tabs/clients
interface ChatMessageData {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  text?: string;
  type: string;
  mediaUrl?: string;
  voiceDuration?: number;
  timestamp: number;
  status: string;
  isSecret?: boolean;
}

interface StatusItemData {
  id: string;
  userId: string;
  username: string;
  userAvatar: string;
  type: string;
  content: string;
  caption?: string;
  bgColor?: string;
  fontStyle?: string;
  timestamp: number;
  viewers: string[];
  isSecretOnly?: boolean;
}

const inMemoryMessages: ChatMessageData[] = [];
const inMemoryStatuses: StatusItemData[] = [];
const registeredUsers: Map<string, { username: string; displayName: string; avatar: string; isOnline: boolean }> = new Map();

// Initialize Gemini Client safely
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY') {
    try {
      aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    } catch (err) {
      console.warn('Failed to initialize GoogleGenAI client:', err);
    }
  }
  return aiClient;
}

// ----------------------------------------------------
// REST API Endpoints (Mounted FIRST before Vite)
// ----------------------------------------------------

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', appName: 'FA97 Chat' });
});

// Users endpoint
app.get('/api/users', (_req, res) => {
  const users = Array.from(registeredUsers.entries()).map(([id, u]) => ({
    id,
    ...u,
  }));
  res.json({ users });
});

app.post('/api/users/register', (req, res) => {
  const { id, username, displayName, avatar } = req.body;
  if (!username) {
    return res.status(400).json({ error: 'Username required' });
  }
  const userId = id || `user_${username.toLowerCase().replace(/\s+/g, '_')}`;
  registeredUsers.set(userId, {
    username,
    displayName: displayName || username,
    avatar: avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`,
    isOnline: true,
  });

  res.json({ success: true, userId, user: registeredUsers.get(userId) });
});

// Gemini AI Assistant Chat Endpoint
app.post('/api/chat/gemini', async (req, res) => {
  try {
    const { prompt, history } = req.body;
    const client = getGeminiClient();

    if (!client) {
      // Intelligent fallback responses if Gemini API Key is not set yet
      const fallbackResponses = [
        "Hey there! I'm FA97 Gemini AI Assistant. Add your GEMINI_API_KEY to secrets for live AI answers!",
        "Hello! I can help you summarize text, generate status ideas, translate messages, or just chat on FA97 Chat!",
        "Greetings! How can I assist you with your FA97 Chat experience today?",
        "That's a great question! Once Gemini API Key is configured, I can provide full real-time AI capabilities right here."
      ];
      const reply = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
      return res.json({ reply });
    }

    const model = 'gemini-2.5-flash';
    const response = await client.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: "You are FA97 Gemini AI Assistant inside FA97 Chat, a WhatsApp-like messaging app. Keep answers friendly, helpful, concise, and WhatsApp-chat appropriate with light emoji use.",
      }
    });

    const reply = response.text || "I couldn't process that request right now.";
    res.json({ reply });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ reply: "FA97 Gemini AI is temporarily unavailable. Please try again in a moment!" });
  }
});

// Messages API
app.get('/api/messages/:chatId', (req, res) => {
  const { chatId } = req.params;
  const messages = inMemoryMessages.filter((m) => m.chatId === chatId);
  res.json({ messages });
});

app.post('/api/messages', (req, res) => {
  const msg: ChatMessageData = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    ...req.body,
    timestamp: req.body.timestamp || Date.now(),
    status: req.body.status || 'sent',
  };
  inMemoryMessages.push(msg);

  // Broadcast to WebSockets
  broadcastToSockets({ type: 'NEW_MESSAGE', data: msg });

  res.json({ success: true, message: msg });
});

// Statuses API
app.get('/api/statuses', (_req, res) => {
  res.json({ statuses: inMemoryStatuses });
});

app.post('/api/statuses', (req, res) => {
  const newStatus: StatusItemData = {
    id: `status_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    ...req.body,
    timestamp: req.body.timestamp || Date.now(),
    viewers: req.body.viewers || [],
  };
  inMemoryStatuses.unshift(newStatus);

  // Broadcast
  broadcastToSockets({ type: 'NEW_STATUS', data: newStatus });

  res.json({ success: true, status: newStatus });
});

// ----------------------------------------------------
// WebSocket Real-Time Broadcasting Engine
// ----------------------------------------------------

const wss = new WebSocketServer({ server, path: '/ws' });
const connectedClients = new Set<WebSocket>();

wss.on('connection', (ws) => {
  connectedClients.add(ws);

  ws.send(JSON.stringify({ type: 'CONNECTED', message: 'Connected to FA97 Chat Realtime Server' }));

  ws.on('message', (messageRaw) => {
    try {
      const data = JSON.parse(messageRaw.toString());
      
      if (data.type === 'SEND_MESSAGE') {
        const msg: ChatMessageData = {
          id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          ...data.payload,
          timestamp: Date.now(),
          status: 'delivered',
        };
        inMemoryMessages.push(msg);
        broadcastToSockets({ type: 'NEW_MESSAGE', data: msg });
      } else if (data.type === 'CALL_OFFER' || data.type === 'CALL_ANSWER' || data.type === 'CALL_END' || data.type === 'TYPING') {
        // Forward call signalling and typing indicators to all clients
        broadcastToSockets(data, ws);
      } else if (data.type === 'POST_STATUS') {
        const newStatus: StatusItemData = {
          id: `status_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          ...data.payload,
          timestamp: Date.now(),
          viewers: [],
        };
        inMemoryStatuses.unshift(newStatus);
        broadcastToSockets({ type: 'NEW_STATUS', data: newStatus });
      }
    } catch (e) {
      console.error('WebSocket Error:', e);
    }
  });

  ws.on('close', () => {
    connectedClients.delete(ws);
  });
});

function broadcastToSockets(payload: any, excludeSender?: WebSocket) {
  const json = JSON.stringify(payload);
  connectedClients.forEach((client) => {
    if (client !== excludeSender && client.readyState === WebSocket.OPEN) {
      client.send(json);
    }
  });
}

// ----------------------------------------------------
// Vite Middleware / Static Serving
// ----------------------------------------------------

async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`FA97 Chat Server running on http://0.0.0.0:${PORT}`);
  });
}

start();
