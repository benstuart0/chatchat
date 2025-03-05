import { useState, useRef, useEffect } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { MessageInput } from '@/components/MessageInput';
import Image from 'next/image';

interface Message {
  type: 'system' | 'chat';
  content: string | { text?: string; gifUrl?: string };
  username?: string;
  messageType?: 'text' | 'gif';
}

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws';

export function Chat() {
  const [username, setUsername] = useState('');
  const [hasJoined, setHasJoined] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, sendMessage, isConnected } = useWebSocket(
    WS_URL,
    username,
    hasJoined
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedUsername = username.trim();
    if (trimmedUsername) {
      setUsername(trimmedUsername);
      setHasJoined(true);
    }
  };

  const renderMessageContent = (message: Message) => {
    if (message.type === 'system') {
      return <div>{String(message.content)}</div>;
    }

    if (message.messageType === 'gif' && typeof message.content === 'object' && message.content.gifUrl) {
      return (
        <div className="max-w-sm">
          <Image 
            src={message.content.gifUrl} 
            alt="GIF" 
            width={300}
            height={200}
            className="w-full rounded-lg"
          />
        </div>
      );
    }

    return <div>{typeof message.content === 'object' ? message.content.text : String(message.content)}</div>;
  };

  if (!hasJoined) {
    return (
      <div className="container mx-auto max-w-md p-4">
        <Card className="p-6">
          <form onSubmit={handleJoin} className="space-y-4">
            <h2 className="text-2xl font-bold text-center mb-6">Join Chat</h2>
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">
                Choose your username
              </label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username..."
                className="w-full"
                minLength={2}
                maxLength={20}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Join Chat
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl p-4">
      <Card className="p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Chat Room</h2>
            <div className="text-sm text-gray-500">
              Chatting as <span className="font-medium">{username}</span>
            </div>
          </div>

          <div className="h-[500px] overflow-y-auto space-y-4 p-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`p-2 rounded-lg ${
                  msg.type === 'system'
                    ? 'bg-gray-100 text-gray-600 text-center text-sm'
                    : msg.username === username
                    ? 'bg-blue-100 ml-auto max-w-[80%]'
                    : 'bg-gray-100 max-w-[80%]'
                }`}
              >
                {msg.type === 'chat' && (
                  <div className="font-semibold text-sm text-gray-600">
                    {msg.username}
                  </div>
                )}
                {renderMessageContent(msg)}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <MessageInput onSendMessage={sendMessage} disabled={!isConnected} />

          {!isConnected && (
            <div className="text-red-500 text-center">
              Disconnected from server. Please refresh the page.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
} 