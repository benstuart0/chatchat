import { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { GiphyFetch } from '@giphy/js-fetch-api';
import { Grid } from '@giphy/react-components';
import { IGif } from '@giphy/js-types';
import Image from 'next/image';

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
  const [selectedGif, setSelectedGif] = useState<IGif | null>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Handle click outside of pickers
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
        setShowGifPicker(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedGif) {
      onSendMessage({ gifUrl: selectedGif.images.original.url }, 'gif');
      setSelectedGif(null);
    } else if (message.trim()) {
      onSendMessage({ text: message.trim() }, 'text');
    }
    setMessage('');
  };

  const onEmojiClick = (emojiData: EmojiClickData) => {
    setMessage((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const onGifClick = (gif: IGif) => {
    setSelectedGif(gif);
    setShowGifPicker(false);
  };

  const fetchGifs = useCallback(
    (offset: number) =>
      gifSearchTerm
        ? gf.search(gifSearchTerm, { offset, limit: 10 })
        : gf.trending({ offset, limit: 10 }),
    [gifSearchTerm]
  );

  const handleGifSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGifSearchTerm(e.target.value);
  };

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="flex-1 relative">
          {selectedGif ? (
            <div className="relative">
              <div className="max-w-[200px] relative">
                <Image
                  src={selectedGif.images.fixed_height.url}
                  alt="Selected GIF"
                  width={200}
                  height={Number(selectedGif.images.fixed_height.height)}
                  className="rounded-lg"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="absolute top-1 right-1 h-6 w-6 bg-white/80 hover:bg-white"
                  onClick={() => setSelectedGif(null)}
                >
                  ✕
                </Button>
              </div>
            </div>
          ) : (
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              disabled={disabled}
              className="pr-20"
            />
          )}
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
        <Button type="submit" disabled={disabled || (!message.trim() && !selectedGif)}>
          Send
        </Button>
      </form>

      <div ref={pickerRef}>
        {showEmojiPicker && (
          <div className="absolute bottom-full mb-2">
            <EmojiPicker onEmojiClick={onEmojiClick} />
          </div>
        )}

        {showGifPicker && (
          <div className="absolute bottom-full mb-2 bg-white rounded-lg shadow-lg p-4 w-[500px] max-h-[500px] overflow-y-auto">
            <Input
              value={gifSearchTerm}
              onChange={handleGifSearch}
              placeholder="Search GIFs..."
              className="mb-4"
            />
            <Grid
              onGifClick={(gif: IGif, e: React.SyntheticEvent<HTMLElement, Event>) => {
                e.preventDefault();
                onGifClick(gif);
              }}
              fetchGifs={fetchGifs}
              width={452}
              columns={3}
              gutter={6}
              noLink={true}
              key={gifSearchTerm} // Force re-render when search term changes
            />
          </div>
        )}
      </div>
    </div>
  );
} 