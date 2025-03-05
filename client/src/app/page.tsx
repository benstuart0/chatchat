'use client';

import { useState, useEffect } from 'react';
import { Chat } from '../components/Chat';
import { useWebSocket } from '../hooks/useWebSocket';

// In development, use ws://localhost, in production use wss:// from env
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws';

export default function Home() {
  const [username, setUsername] = useState('');
  const [hasJoined, setHasJoined] = useState(false);
  const { messages, sendMessage, isConnected, activeUsers } = useWebSocket(
    WS_URL,
    username,
    hasJoined
  );

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedUsername = username.trim();
    if (trimmedUsername) {
      setUsername(trimmedUsername);
      setHasJoined(true);
    }
  };

  const handleSendMessage = (message: string) => {
    sendMessage({ text: message }, 'text');
  };

  const handleDraw = (drawData: { points: { x: number; y: number }[]; color: string; clear?: boolean }) => {
    sendMessage(drawData, 'draw');
  };

  if (!hasJoined) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="container mx-auto max-w-md p-4">
          <form onSubmit={handleJoin} className="space-y-4 bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-center mb-6">Join Chat</h2>
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">
                Choose your username
              </label>
              <input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username..."
                className="w-full px-3 py-2 border rounded-md"
                minLength={2}
                maxLength={20}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
            >
              Join Chat
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 py-8">
      <Chat
        username={username}
        messages={messages}
        users={activeUsers}
        isConnected={isConnected}
        onSendMessage={handleSendMessage}
        onDraw={handleDraw}
      />
    </main>
  );
}
