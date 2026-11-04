import React, { useState } from 'react';
import { useChat } from '../context/ChatContext';
import { Shield, Lock, Unlock, KeyRound, Eye, EyeOff, Check, UserCheck, ShieldAlert } from 'lucide-react';

export const PrivacySettingsModal: React.FC = () => {
  const { privacySettings, toggleSecretFriend, setSecretPin, lockSecretMode, unlockSecretPin, allUsers, currentUser } = useChat();

  const [newPin, setNewPin] = useState('');
  const [pinChangeSuccess, setPinChangeSuccess] = useState(false);
  const [testPin, setTestPin] = useState('');

  const handleUpdatePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.trim().length >= 4) {
      setSecretPin(newPin.trim());
      setNewPin('');
      setPinChangeSuccess(true);
      setTimeout(() => setPinChangeSuccess(false), 3000);
    }
  };

  return (
    <div className="flex-1 bg-white dark:bg-[#111b21] overflow-y-auto p-4 max-w-2xl mx-auto w-full select-none text-gray-900 dark:text-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-amber-100 dark:bg-amber-950/60 rounded-2xl text-amber-600 dark:text-amber-400">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black">Privacy & Secret Friends</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Protect private chats & manage secret friends on FA97 Chat
            </p>
          </div>
        </div>
      </div>

      {/* Secret Mode Status Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-900 to-[#075E54] text-white shadow-xl mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            {privacySettings.isSecretUnlocked ? (
              <Unlock className="w-5 h-5 text-amber-400" />
            ) : (
              <Lock className="w-5 h-5 text-emerald-300" />
            )}
            <h3 className="font-bold text-base">
              Secret Mode: {privacySettings.isSecretUnlocked ? 'UNLOCKED' : 'LOCKED'}
            </h3>
          </div>

          <button
            onClick={() => {
              if (privacySettings.isSecretUnlocked) {
                lockSecretMode();
              } else {
                unlockSecretPin(privacySettings.secretPin);
              }
            }}
            className="px-4 py-1.5 bg-white text-[#0b141a] text-xs font-bold rounded-xl shadow hover:bg-gray-100"
          >
            {privacySettings.isSecretUnlocked ? 'Lock Now 🔒' : 'Unlock Mode 🔓'}
          </button>
        </div>
        <p className="text-xs text-emerald-100 opacity-90">
          When Secret Mode is locked, secret friends' chats are hidden or protected behind your Secret PIN.
        </p>
      </div>

      {/* Secret Friends Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Manage Secret / Private Friends
          </h3>
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            {privacySettings.secretFriendIds.length} secret friends
          </span>
        </div>

        <div className="space-y-2">
          {allUsers
            .filter((u) => u.id !== currentUser?.id)
            .map((user) => {
              const isSecret = privacySettings.secretFriendIds.includes(user.id);
              return (
                <div
                  key={user.id}
                  className="p-3.5 rounded-2xl bg-gray-50 dark:bg-[#202c33] border border-gray-200/60 dark:border-gray-800 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={user.avatar}
                      alt={user.displayName}
                      className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                    />
                    <div>
                      <h4 className="text-sm font-bold truncate flex items-center gap-1">
                        {user.displayName}
                        {isSecret && <Lock className="w-3.5 h-3.5 text-amber-500" />}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">@{user.username}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleSecretFriend(user.id)}
                    className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-colors ${
                      isSecret
                        ? 'bg-amber-500 text-white hover:bg-amber-600'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-emerald-500 hover:text-white'
                    }`}
                  >
                    {isSecret ? 'Secret Friend 🔒' : '+ Add Secret'}
                  </button>
                </div>
              );
            })}
        </div>
      </div>

      {/* Secret PIN Configuration */}
      <div className="p-5 rounded-2xl bg-gray-50 dark:bg-[#202c33] border border-gray-200/60 dark:border-gray-800">
        <h3 className="text-sm font-bold flex items-center space-x-2 mb-2">
          <KeyRound className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Change Secret PIN</span>
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          Current PIN: <code className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{privacySettings.secretPin}</code>
        </p>

        <form onSubmit={handleUpdatePin} className="flex space-x-2">
          <input
            type="password"
            maxLength={6}
            value={newPin}
            onChange={(e) => setNewPin(e.target.value)}
            placeholder="Enter new 4-digit PIN..."
            className="flex-1 px-4 py-2 text-xs bg-white dark:bg-[#111b21] border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            type="submit"
            disabled={newPin.length < 4}
            className="px-4 py-2 bg-[#128C7E] hover:bg-[#075E54] text-white text-xs font-bold rounded-xl shadow disabled:opacity-50"
          >
            Update PIN
          </button>
        </form>

        {pinChangeSuccess && (
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 font-semibold">
            ✓ Secret PIN updated successfully!
          </p>
        )}
      </div>
    </div>
  );
};
