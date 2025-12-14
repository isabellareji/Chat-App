import { useState, useEffect, useCallback, useRef } from "react";
import { type User, type Message } from "@shared/schema";

interface TypingUser {
  userId: string;
  username: string;
  isTyping: boolean;
}

interface ChatState {
  isConnected: boolean;
  currentUser: User | null;
  messages: Message[];
  onlineUsers: User[];
  typingUsers: TypingUser[];
  isRegistered: boolean;
}

export function useChat() {
  const [chatState, setChatState] = useState<ChatState>({
    isConnected: false,
    currentUser: null,
    messages: [],
    onlineUsers: [],
    typingUsers: [],
    isRegistered: false,
  });

  const wsRef = useRef<WebSocket | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setChatState(prev => ({ ...prev, isConnected: true }));
      
      // If user is already registered, rejoin
      if (chatState.currentUser) {
        ws.send(JSON.stringify({
          type: 'user_join',
          userId: chatState.currentUser.id,
          username: chatState.currentUser.username
        }));
      }
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'user_joined':
            setChatState(prev => ({
              ...prev,
              onlineUsers: prev.onlineUsers.some(u => u.id === data.user.id) 
                ? prev.onlineUsers 
                : [...prev.onlineUsers, data.user]
            }));
            break;

          case 'user_left':
            setChatState(prev => ({
              ...prev,
              onlineUsers: prev.onlineUsers.filter(u => u.id !== data.userId)
            }));
            break;

          case 'online_users':
            setChatState(prev => ({ ...prev, onlineUsers: data.users }));
            break;

          case 'message_history':
            setChatState(prev => ({ ...prev, messages: data.messages }));
            break;

          case 'new_message':
            setChatState(prev => ({
              ...prev,
              messages: [...prev.messages, data.message]
            }));
            break;

          case 'typing_update':
            setChatState(prev => ({ ...prev, typingUsers: data.typingUsers }));
            break;

          case 'error':
            console.error('WebSocket error:', data.message);
            break;
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    ws.onclose = () => {
      setChatState(prev => ({ ...prev, isConnected: false }));
      
      // Attempt to reconnect after 3 seconds
      setTimeout(() => {
        connect();
      }, 3000);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }, [chatState.currentUser]);

  const registerUser = useCallback(async (username: string, avatarColor: string) => {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, avatarColor }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      const user = await response.json();
      setChatState(prev => ({ 
        ...prev, 
        currentUser: user, 
        isRegistered: true 
      }));

      // Join WebSocket room
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'user_join',
          userId: user.id,
          username: user.username
        }));
      }

      return user;
    } catch (error) {
      console.error('Failed to register user:', error);
      throw error;
    }
  }, []);

  const sendMessage = useCallback((content: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN || !chatState.currentUser) {
      return;
    }

    wsRef.current.send(JSON.stringify({
      type: 'send_message',
      content,
      avatarColor: chatState.currentUser.avatarColor
    }));
  }, [chatState.currentUser]);

  const startTyping = useCallback(() => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN || !chatState.currentUser) {
      return;
    }

    wsRef.current.send(JSON.stringify({
      type: 'typing_start'
    }));

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Auto-stop typing after 3 seconds
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 3000);
  }, [chatState.currentUser]);

  const stopTyping = useCallback(() => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN || !chatState.currentUser) {
      return;
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    wsRef.current.send(JSON.stringify({
      type: 'typing_stop'
    }));
  }, [chatState.currentUser]);

  const deleteLastMessage = useCallback(async () => {
    try {
      const response = await fetch('/api/messages/last', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      const result = await response.json();
      
      // Remove the deleted message from local state
      setChatState(prev => ({
        ...prev,
        messages: prev.messages.slice(0, -1)
      }));

      return result;
    } catch (error) {
      console.error('Failed to delete message:', error);
      throw error;
    }
  }, []);

  // Connect on mount
  useEffect(() => {
    connect();
    
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  return {
    ...chatState,
    registerUser,
    sendMessage,
    startTyping,
    stopTyping,
    deleteLastMessage,
    connect,
  };
}
