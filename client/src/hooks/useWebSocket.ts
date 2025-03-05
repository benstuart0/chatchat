import { useState, useEffect, useCallback } from 'react';

interface MessageContent {
  text?: string;
  gifUrl?: string;
}

interface Message {
  type: 'chat' | 'system';
  content: string | MessageContent;
  user_id?: string;
  username?: string;
  messageType?: 'text' | 'gif';
}

export const useWebSocket = (baseUrl: string, username: string, shouldConnect: boolean) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);

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
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setMessages((prev) => [...prev, message]);
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, [baseUrl, username, shouldConnect]);

  const sendMessage = useCallback(
    (content: string | MessageContent, messageType: 'text' | 'gif' = 'text') => {
      if (socket && isConnected) {
        socket.send(
          JSON.stringify({
            type: 'chat',
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
  };
}; 