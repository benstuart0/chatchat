import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Card } from '../components/ui/card';
import { DrawingBoard } from './DrawingBoard';
import { MessageInput } from './MessageInput';
import { UserList } from './UserList';
import styles from './Chat.module.css';

interface Point {
  x: number;
  y: number;
}

interface DrawEvent {
  points: Point[];
  color: string;
  clear?: boolean;
}

interface MessageContent {
  text?: string;
  gifUrl?: string;
}

interface Message {
  type: 'draw' | 'chat' | 'system' | 'users';
  content: string | DrawEvent | MessageContent | string[];
  username?: string;
  messageType?: 'text' | 'gif' | 'draw';
}

interface ChatProps {
  username: string;
  messages: Message[];
  users: string[];
  isConnected: boolean;
  onSendMessage: (message: string, type?: 'text' | 'gif') => void;
  onDraw: (data: DrawEvent) => void;
}

export function Chat({ username, messages, users, isConnected, onSendMessage, onDraw }: ChatProps) {
  const [activeTab, setActiveTab] = useState('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, scrollToBottom]);

  const renderMessageContent = (msg: Message) => {
    if (msg.type === 'chat') {
      if (msg.messageType === 'gif') {
        return (
          <div className={styles.imageContainer}>
            <img
              src={msg.content as string}
              alt="GIF"
              className={styles.image}
            />
          </div>
        );
      }

      const content = msg.content as MessageContent | string;
      
      if (typeof content === 'string') {
        try {
          const parsed = JSON.parse(content);
          if (parsed.gifUrl) {
            return (
              <div className={styles.imageContainer}>
                <img
                  src={parsed.gifUrl}
                  alt="GIF"
                  className={styles.image}
                />
              </div>
            );
          }
        } catch (e) {
          return <div style={{ wordBreak: 'break-word' }}>{content}</div>;
        }
      }

      if (typeof content === 'object' && 'gifUrl' in content && content.gifUrl) {
        return (
          <div className={styles.imageContainer}>
            <img
              src={content.gifUrl}
              alt="GIF"
              className={styles.image}
            />
          </div>
        );
      }

      return <div style={{ wordBreak: 'break-word' }}>{typeof content === 'string' ? content : content.text}</div>;
    }
    return <div style={{ wordBreak: 'break-word' }}>{msg.content as string}</div>;
  };

  return (
    <div className={styles.container} key="chat-container">
      <div className={styles.grid}>
        <div className={styles.space}>
          <div className={styles.tabs}>
            <button
              className={activeTab === 'chat' ? styles.activeTab : styles.tab}
              onClick={() => setActiveTab('chat')}
            >
              Chat
            </button>
            <button
              className={activeTab === 'draw' ? styles.activeTab : styles.tab}
              onClick={() => setActiveTab('draw')}
            >
              Draw
            </button>
          </div>
          {activeTab === 'chat' ? (
            <div className={styles.messagesContainer}>
              {messages
                .filter(msg => msg.type === 'chat' || msg.type === 'system')
                .map((msg, index) => (
                  <div
                    key={index}
                    className={
                      msg.type === 'system'
                        ? styles.systemMessage
                        : msg.username === username
                        ? styles.userMessage
                        : styles.otherMessage
                    }
                  >
                    {msg.type === 'chat' && (
                      <div className={styles.username}>
                        {msg.username}
                      </div>
                    )}
                    {renderMessageContent(msg)}
                  </div>
                ))}
              <div ref={messagesEndRef} />
            </div>
          ) : (
            <DrawingBoard onDraw={onDraw} messages={messages} />
          )}
          <MessageInput onSendMessage={onSendMessage} disabled={!isConnected} />
        </div>
        <UserList users={users} />
      </div>
    </div>
  );
} 