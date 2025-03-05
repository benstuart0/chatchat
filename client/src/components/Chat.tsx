import { useCallback, useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { DrawingBoard } from './DrawingBoard';
import { MessageInput } from './MessageInput';
import { UserList } from './UserList';

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
  onSendMessage: (message: string) => void;
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
      const content = msg.content as MessageContent;
      if (content.gifUrl) {
        return (
          <div className="relative w-48 h-48">
            <img
              src={content.gifUrl}
              alt="GIF"
              className="w-full h-full object-cover rounded"
            />
          </div>
        );
      }
      return <div>{content.text}</div>;
    }
    return <div>{msg.content as string}</div>;
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <div className="grid grid-cols-[1fr,200px] gap-4 p-4">
        <div className="space-y-4">
          <div className="flex gap-4 border-b">
            <button
              className={`px-4 py-2 ${activeTab === 'chat' ? 'border-b-2 border-blue-500' : ''}`}
              onClick={() => setActiveTab('chat')}
            >
              Chat
            </button>
            <button
              className={`px-4 py-2 ${activeTab === 'draw' ? 'border-b-2 border-blue-500' : ''}`}
              onClick={() => setActiveTab('draw')}
            >
              Draw
            </button>
          </div>
          {activeTab === 'chat' ? (
            <div className="space-y-4">
              <div className="h-[500px] overflow-y-auto space-y-4 p-4">
                {messages
                  .filter(msg => msg.type === 'chat' || msg.type === 'system')
                  .map((msg, index) => (
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
              <MessageInput onSendMessage={onSendMessage} disabled={!isConnected} />
            </div>
          ) : (
            <DrawingBoard onDraw={onDraw} messages={messages} />
          )}
        </div>
        <UserList users={users} />
      </div>
    </Card>
  );
} 