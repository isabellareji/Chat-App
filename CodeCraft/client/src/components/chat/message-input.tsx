import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Paperclip, Smile, Image, Keyboard } from "lucide-react";

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  onStartTyping: () => void;
  onStopTyping: () => void;
  onToggleKeyboard: () => void;
  disabled?: boolean;
}

export function MessageInput({ 
  onSendMessage, 
  onStartTyping, 
  onStopTyping, 
  onToggleKeyboard,
  disabled = false 
}: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedMessage = message.trim();
    if (!trimmedMessage || disabled) return;
    
    onSendMessage(trimmedMessage);
    setMessage("");
    handleStopTyping();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    handleStartTyping();
  };

  const handleStartTyping = useCallback(() => {
    if (!isTyping) {
      setIsTyping(true);
      onStartTyping();
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      handleStopTyping();
    }, 3000);
  }, [isTyping, onStartTyping]);

  const handleStopTyping = useCallback(() => {
    if (isTyping) {
      setIsTyping(false);
      onStopTyping();
    }
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  }, [isTyping, onStopTyping]);

  const handleKeyPress = (key: string) => {
    if (key === 'Backspace') {
      setMessage(prev => prev.slice(0, -1));
    } else {
      setMessage(prev => prev + key);
    }
    handleStartTyping();
  };

  return (
    <div className="bg-card border-t border-border p-4" data-testid="message-input-area">
      <form onSubmit={handleSubmit} className="flex items-end space-x-3">
        <div className="flex-1">
          <div className="relative">
            <Input
              value={message}
              onChange={handleInputChange}
              onBlur={handleStopTyping}
              placeholder="Message #general"
              className="w-full px-4 py-3 bg-input text-foreground rounded-lg border border-border focus:ring-2 focus:ring-ring focus:border-transparent pr-10"
              autoComplete="off"
              maxLength={500}
              disabled={disabled}
              data-testid="input-message"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground lg:hidden h-6 w-6"
              onClick={onToggleKeyboard}
              data-testid="button-toggle-keyboard"
            >
              <Keyboard className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center space-x-2">
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                className="text-muted-foreground hover:text-foreground h-8 w-8"
                data-testid="button-attach"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                className="text-muted-foreground hover:text-foreground h-8 w-8"
                data-testid="button-emoji"
              >
                <Smile className="h-4 w-4" />
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                className="text-muted-foreground hover:text-foreground h-8 w-8"
                data-testid="button-gif"
              >
                <Image className="h-4 w-4" />
              </Button>
            </div>
            <span className="text-xs text-muted-foreground" data-testid="char-count">
              {message.length}/500
            </span>
          </div>
        </div>
        
        <Button
          type="submit"
          className="px-6 py-3 font-medium flex items-center space-x-2"
          disabled={!message.trim() || disabled}
          data-testid="button-send-message"
        >
          <Send className="h-4 w-4" />
          <span>Send</span>
        </Button>
      </form>
    </div>
  );
}
