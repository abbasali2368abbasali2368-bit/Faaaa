import React, { useState, useEffect } from 'react';
import { ChatProvider, useChat } from './context/ChatContext';
import { Header } from './components/Header';
import { ChatList } from './components/ChatList';
import { ChatWindow } from './components/ChatWindow';
import { StatusTab } from './components/StatusTab';
import { CallsTab } from './components/CallsTab';
import { PrivacySettingsModal } from './components/PrivacySettingsModal';
import { VideoCallModal } from './components/VideoCallModal';
import { VoiceCallModal } from './components/VoiceCallModal';
import { StatusViewer } from './components/StatusViewer';
import { GalleryPickerModal } from './components/GalleryPickerModal';
import { NewChatModal } from './components/NewChatModal';
import { UserSetupModal } from './components/UserSetupModal';
import { MessageSquare, Shield, Phone, CircleDashed, Lock } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { activeTab, setActiveTab, activeChatId } = useChat();
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('fa97_dark_mode') !== 'false';
  });
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('fa97_dark_mode', String(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className={`h-screen w-screen flex flex-col ${darkMode ? 'dark bg-[#0c1317]' : 'bg-[#d1d7db]'} text-gray-900 dark:text-gray-100 overflow-hidden font-sans select-none`}>
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onOpenNewChat={() => setIsNewChatOpen(true)}
      />

      {/* Main Container - WhatsApp Style Dual Pane */}
      <div className="flex-1 flex overflow-hidden max-w-[1700px] w-full mx-auto shadow-2xl relative">
        {/* Left Sidebar Pane (Chats, Status, Calls, Privacy) */}
        <div
          className={`w-full md:w-[420px] lg:w-[450px] flex-shrink-0 flex flex-col border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111b21] transition-all duration-200 ${
            activeChatId && activeTab === 'chats' ? 'hidden md:flex' : 'flex'
          }`}
        >
          {activeTab === 'chats' && (
            <ChatList onOpenNewChat={() => setIsNewChatOpen(true)} />
          )}
          {activeTab === 'status' && <StatusTab />}
          {activeTab === 'calls' && <CallsTab />}
          {activeTab === 'privacy' && <PrivacySettingsModal />}
        </div>

        {/* Right Main Pane (Chat Window or Empty Placeholder) */}
        <div
          className={`flex-1 flex flex-col bg-[#efeae2] dark:bg-[#0b141a] relative ${
            !activeChatId && activeTab === 'chats' ? 'hidden md:flex' : 'flex'
          }`}
        >
          {activeTab === 'chats' ? (
            activeChatId ? (
              <ChatWindow />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#f0f2f5] dark:bg-[#222e35] text-gray-600 dark:text-gray-300">
                <div className="w-24 h-24 mb-6 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 shadow-inner">
                  <MessageSquare className="w-12 h-12" />
                </div>
                <h1 className="text-3xl font-light tracking-tight text-gray-800 dark:text-gray-100 mb-2">
                  FA97 Chat Web
                </h1>
                <p className="text-sm max-w-md text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                  Send and receive messages with high quality voice recordings, video calls, status stories, and PIN-protected secret chats.
                </p>

                <div className="grid grid-cols-2 gap-4 max-w-md w-full text-left">
                  <div className="p-3.5 bg-white dark:bg-[#111b21] rounded-2xl border border-gray-200/80 dark:border-gray-800 flex items-center space-x-3 shadow-sm">
                    <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-500">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-gray-900 dark:text-white">Secret Friends</div>
                      <div className="text-[11px] text-gray-500 dark:text-gray-400">PIN protected chats</div>
                    </div>
                  </div>

                  <div className="p-3.5 bg-white dark:bg-[#111b21] rounded-2xl border border-gray-200/80 dark:border-gray-800 flex items-center space-x-3 shadow-sm">
                    <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-500">
                      <CircleDashed className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-gray-900 dark:text-white">Video Status</div>
                      <div className="text-[11px] text-gray-500 dark:text-gray-400">24h photo & clip stories</div>
                    </div>
                  </div>
                </div>

                <div className="mt-10 flex items-center justify-center space-x-2 text-xs text-gray-400 dark:text-gray-500">
                  <Shield className="w-4 h-4 text-emerald-500" />
                  <span>End-to-end encrypted messaging interface</span>
                </div>
              </div>
            )
          ) : (
            /* When tab is status, calls, or privacy on desktop, keep right pane informative */
            <div className="hidden md:flex flex-1 flex-col items-center justify-center p-8 text-center bg-[#f0f2f5] dark:bg-[#222e35] text-gray-600 dark:text-gray-300">
              {activeTab === 'status' && (
                <>
                  <CircleDashed className="w-16 h-16 text-emerald-500 mb-4 animate-spin-slow" />
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-1">Status Updates</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm">
                    Select a contact's story on the left sidebar to view their photo or video status update.
                  </p>
                </>
              )}
              {activeTab === 'calls' && (
                <>
                  <Phone className="w-16 h-16 text-emerald-500 mb-4" />
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-1">Call Logs & Audio Calls</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm">
                    Start high-definition voice or video calls directly from any active contact conversation.
                  </p>
                </>
              )}
              {activeTab === 'privacy' && (
                <>
                  <Shield className="w-16 h-16 text-amber-500 mb-4" />
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-1">Privacy & Secret PIN</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm">
                    Configure your secret friends list and custom 4-digit PIN lock on the left panel.
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Global Application Modals & Overlays */}
      <UserSetupModal />
      <NewChatModal isOpen={isNewChatOpen} onClose={() => setIsNewChatOpen(false)} />
      <VideoCallModal />
      <VoiceCallModal />
      <StatusViewer />
      <GalleryPickerModal />
    </div>
  );
};

export default function App() {
  return (
    <ChatProvider>
      <MainLayout />
    </ChatProvider>
  );
}
