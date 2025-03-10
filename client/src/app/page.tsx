'use client';

import { useState } from 'react';
import { Chat } from '../components/Chat';
import { useWebSocket } from '../hooks/useWebSocket';
import styles from './page.module.css';

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
      <div className={styles.container}>
        <form onSubmit={handleJoin} className={styles.loginForm}>
          <h2 className={styles.title}>Welcome to Chat</h2>
          <div className={styles.inputGroup}>
            <label htmlFor="username" className={styles.label}>
              Choose your username
            </label>
            <input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username..."
              className={styles.input}
              minLength={2}
              maxLength={20}
              required
            />
          </div>
          <button type="submit" className={styles.button} disabled={!username.trim()}>
            Join Chat
          </button>
        </form>
      </div>
    );
  }

  return (
    <main className={styles.container}>
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
