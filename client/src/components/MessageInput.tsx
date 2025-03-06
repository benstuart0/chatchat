import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import EmojiPicker from 'emoji-picker-react';
import { GiphyFetch } from '@giphy/js-fetch-api';
import { Grid, SearchBar, SearchContext, SearchContextManager } from '@giphy/react-components';
import { Smile } from 'lucide-react';
import styles from './Chat.module.css';

const gf = new GiphyFetch(process.env.NEXT_PUBLIC_GIPHY_API_KEY || '');

interface MessageInputProps {
  onSendMessage: (message: string, type?: 'text' | 'gif') => void;
  disabled?: boolean;
}

export function MessageInput({ onSendMessage, disabled }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message.trim(), 'text');
      setMessage('');
    }
  };

  const onEmojiClick = (emojiData: any) => {
    setMessage(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const onGifSelect = (gif: any) => {
    onSendMessage(gif.images.original.url, 'gif');
    setShowGifPicker(false);
  };

  return (
    <div className={styles.inputWrapper}>
      <form onSubmit={handleSubmit} className={styles.inputContainer}>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={styles.emojiButton}
          onClick={() => {
            setShowEmojiPicker(!showEmojiPicker);
            setShowGifPicker(false);
          }}
        >
          <Smile />
        </Button>
        <Button
          type="button"
          variant="ghost"
          className={styles.gifButton}
          onClick={() => {
            setShowGifPicker(!showGifPicker);
            setShowEmojiPicker(false);
          }}
        >
          GIF
        </Button>
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          disabled={disabled}
          className={styles.input}
        />
        <Button type="submit" disabled={disabled || !message.trim()}>
          Send
        </Button>
        {showEmojiPicker && (
          <div className={styles.emojiPicker}>
            <EmojiPicker onEmojiClick={onEmojiClick} />
          </div>
        )}
        {showGifPicker && (
          <div className={styles.gifPicker}>
            <SearchContextManager apiKey={process.env.NEXT_PUBLIC_GIPHY_API_KEY || ''}>
              <SearchContext.Consumer>
                {({ fetchGifs, searchKey }) => (
                  <>
                    <div className={styles.gifSearch}>
                      <Input
                        type="search"
                        placeholder="Search GIFs..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={styles.gifSearchInput}
                      />
                    </div>
                    <Grid
                      key={searchQuery}
                      columns={2}
                      width={320}
                      fetchGifs={() =>
                        searchQuery
                          ? gf.search(searchQuery, { limit: 10 })
                          : gf.trending({ limit: 10 })
                      }
                      onGifClick={(gif, e) => {
                        e.preventDefault();
                        onGifSelect(gif);
                      }}
                      noLink={true}
                    />
                  </>
                )}
              </SearchContext.Consumer>
            </SearchContextManager>
          </div>
        )}
      </form>
    </div>
  );
} 