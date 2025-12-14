interface TypingUser {
  userId: string;
  username: string;
  isTyping: boolean;
}

interface TypingIndicatorProps {
  typingUsers: TypingUser[];
  currentUserId?: string;
}

export function TypingIndicator({ typingUsers, currentUserId }: TypingIndicatorProps) {
  const activeTypers = typingUsers.filter(user => 
    user.isTyping && user.userId !== currentUserId
  );

  if (activeTypers.length === 0) {
    return null;
  }

  const getTypingText = () => {
    if (activeTypers.length === 1) {
      return `${activeTypers[0].username} is typing...`;
    } else if (activeTypers.length === 2) {
      return `${activeTypers[0].username} and ${activeTypers[1].username} are typing...`;
    } else {
      return `${activeTypers[0].username} and ${activeTypers.length - 1} others are typing...`;
    }
  };

  return (
    <div className="typing-indicator flex items-center space-x-2 p-2 text-muted-foreground text-sm" data-testid="typing-indicator">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
      <span data-testid="typing-text">{getTypingText()}</span>
    </div>
  );
}
