import { useEffect, useRef } from "react";
import { type Message, type User } from "@shared/schema";
import { TypingIndicator } from "./typing-indicator";
import { Reply, Smile, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TypingUser {
  userId: string;
  username: string;
  isTyping: boolean;
}

interface MessagesAreaProps {
  messages: Message[];
  currentUser: User | null;
  typingUsers: TypingUser[];
  onDeleteLastMessage: () => Promise<any>;
}

const getAvatarClass = (color: string) => {
  const colorMap: Record<string, string> = {
    'primary': 'avatar-primary',
    'green': 'avatar-green',
    'red': 'avatar-red',
    'yellow': 'avatar-yellow',
    'purple': 'avatar-purple',
    'pink': 'avatar-pink'
  };
  return colorMap[color] || 'avatar-primary';
};

const getInitials = (username: string) => {
  return username.substring(0, 2).toUpperCase();
};

const formatTimestamp = (timestamp: Date | string) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export function MessagesArea({ messages, currentUser, typingUsers, onDeleteLastMessage }: MessagesAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingUsers]);

  const handleDeleteLastMessage = async () => {
    try {
      await onDeleteLastMessage();
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar bg-background" data-testid="messages-area">
      <div className="p-4 space-y-4">
        {/* Welcome Message */}
        <div className="text-center py-8" data-testid="welcome-message">
          <div className="text-4xl mb-4">👋</div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Welcome to #general</h3>
          <p className="text-muted-foreground">This is the beginning of your chat history.</p>
        </div>
        
        {/* Messages */}
        {messages.map((message, index) => {
          const isLastMessage = index === messages.length - 1;
          return (
          <div 
            key={message.id} 
            className="message-animation group hover:bg-muted/20 p-2 rounded-lg transition-colors"
            data-testid={`message-${message.id}`}
          >
            <div className="flex items-start space-x-3">
              <div className={`user-avatar ${getAvatarClass(message.avatarColor)}`}>
                {getInitials(message.username)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline space-x-2 mb-1">
                  <span className="font-medium text-foreground" data-testid={`message-username-${message.id}`}>
                    {message.username}
                    {currentUser?.id === message.userId && " (You)"}
                  </span>
                  <span className="text-xs text-muted-foreground" data-testid={`message-timestamp-${message.id}`}>
                    {formatTimestamp(message.timestamp || message.createdAt!)}
                  </span>
                </div>
                <p className="text-foreground" data-testid={`message-content-${message.id}`}>
                  {message.content}
                </p>
                <div className="flex items-center space-x-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground text-sm p-1 h-auto"
                    data-testid={`button-reply-${message.id}`}
                  >
                    <Reply className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground text-sm p-1 h-auto"
                    data-testid={`button-react-${message.id}`}
                  >
                    <Smile className="h-3 w-3" />
                  </Button>
                  {isLastMessage && messages.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive text-sm p-1 h-auto"
                      onClick={handleDeleteLastMessage}
                      data-testid={`button-delete-${message.id}`}
                      title="Delete last message"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
        })}
        
        {/* Typing Indicator */}
        <TypingIndicator typingUsers={typingUsers} currentUserId={currentUser?.id} />
        
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
