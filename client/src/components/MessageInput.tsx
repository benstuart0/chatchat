import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { GiphyFetch } from '@giphy/js-fetch-api';
import { Grid } from '@giphy/react-components';
import { IGif } from '@giphy/js-types';

// Initialize Giphy with API key from environment
const gf = new GiphyFetch(process.env.NEXT_PUBLIC_GIPHY_API_KEY || '');

interface MessageInputProps {
  onSendMessage: (content: string | { text?: string; gifUrl?: string }, messageType: 'text' | 'gif') => void;
  disabled: boolean;
}

export function MessageInput({ onSendMessage, disabled }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [gifSearchTerm, setGifSearchTerm] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage({ text: message.trim() }, 'text');
      setMessage('');
    }
  };

  const onEmojiClick = (emojiData: EmojiClickData) => {
    setMessage((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const onGifClick = (gif: IGif) => {
    onSendMessage({ gifUrl: gif.images.original.url }, 'gif');
    setShowGifPicker(false);
  };

  const fetchGifs = useCallback(
    (offset: number) =>
      gifSearchTerm
        ? gf.search(gifSearchTerm, { offset, limit: 10 })
        : gf.trending({ offset, limit: 10 }),
    [gifSearchTerm]
  );

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="flex-1 relative">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            disabled={disabled}
            className="pr-20"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => {
                setShowEmojiPicker(!showEmojiPicker);
                setShowGifPicker(false);
              }}
            >
              😊
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => {
                setShowGifPicker(!showGifPicker);
                setShowEmojiPicker(false);
              }}
            >
              GIF
            </Button>
          </div>
        </div>
        <Button type="submit" disabled={disabled}>
          Send
        </Button>
      </form>

      {showEmojiPicker && (
        <div className="absolute bottom-full mb-2">
          <EmojiPicker onEmojiClick={onEmojiClick} />
        </div>
      )}

      {showGifPicker && (
        <div className="absolute bottom-full mb-2 bg-white rounded-lg shadow-lg p-4 w-[500px] max-h-[500px] overflow-y-auto">
          <Input
            value={gifSearchTerm}
            onChange={(e) => setGifSearchTerm(e.target.value)}
            placeholder="Search GIFs..."
            className="mb-4"
          />
          <Grid
            onGifClick={onGifClick}
            fetchGifs={fetchGifs}
            width={452}
            columns={3}
            gutter={6}
          />
        </div>
      )}
    </div>
  );
} 