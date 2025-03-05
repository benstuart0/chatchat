import { useState, useEffect, useCallback } from 'react';

interface MessageContent {
  text?: string;
  gifUrl?: string;
}

interface DrawContent {
  points: Point[];
  color: string;
  clear?: boolean;
}

interface Point {
  x: number;
  y: number;
}

interface Message {
  type: 'chat' | 'system' | 'users' | 'draw';
  content: string | MessageContent | string[] | DrawContent;
  user_id?: string;
  username?: string;
  messageType?: 'text' | 'gif' | 'draw';
}

export const useWebSocket = (baseUrl: string, username: string, shouldConnect: boolean) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [activeUsers, setActiveUsers] = useState<string[]>([]);

  useEffect(() => {
    if (!username || !shouldConnect) return;

    const ws = new WebSocket(`${baseUrl}/${encodeURIComponent(username)}`);

    ws.onopen = () => {
      setIsConnected(true);
      console.log('Connected to WebSocket');
    };

    ws.onclose = () => {
      setIsConnected(false);
      console.log('Disconnected from WebSocket');
      setActiveUsers([]); // Clear users list on disconnect
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'users') {
        // Update active users list
        setActiveUsers(message.content as string[]);
      } else {
        setMessages((prev) => [...prev, message]);
      }
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, [baseUrl, username, shouldConnect]);

  const sendMessage = useCallback(
    (content: string | MessageContent | DrawContent, messageType: 'text' | 'gif' | 'draw' = 'text') => {
      if (socket && isConnected) {
        socket.send(
          JSON.stringify({
            type: messageType === 'draw' ? 'draw' : 'chat',
            content,
            messageType,
          })
        );
      }
    },
    [socket, isConnected]
  );

  return {
    messages,
    sendMessage,
    isConnected,
    activeUsers,
  };
}; 