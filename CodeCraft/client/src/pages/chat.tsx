import { useState } from "react";
import { useChat } from "@/hooks/use-chat";
import { RegistrationModal } from "@/components/chat/registration-modal";
import { UsersSidebar } from "@/components/chat/users-sidebar";
import { ChatHeader } from "@/components/chat/chat-header";
import { MessagesArea } from "@/components/chat/messages-area";
import { MessageInput } from "@/components/chat/message-input";
import { VirtualKeyboard } from "@/components/chat/virtual-keyboard";

export default function Chat() {
  const {
    isConnected,
    currentUser,
    messages,
    onlineUsers,
    typingUsers,
    isRegistered,
    registerUser,
    sendMessage,
    startTyping,
    stopTyping,
    deleteLastMessage,
  } = useChat();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  const handleRegister = async (username: string, avatarColor: string) => {
    await registerUser(username, avatarColor);
  };

  const handleSendMessage = (message: string) => {
    sendMessage(message);
    setIsKeyboardVisible(false);
  };

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleToggleKeyboard = () => {
    setIsKeyboardVisible(!isKeyboardVisible);
  };

  const handleKeyPress = (key: string) => {
    // This would be handled by the MessageInput component
    // when using the virtual keyboard
  };

  return (
    <div className="flex h-screen bg-background text-foreground" data-testid="chat-page">
      {/* Registration Modal */}
      <RegistrationModal
        isOpen={!isRegistered}
        onRegister={handleRegister}
      />

      {/* Connection Status */}
      {!isConnected && isRegistered && (
        <div className="fixed top-4 right-4 bg-destructive text-destructive-foreground px-4 py-2 rounded-lg shadow-lg z-50" data-testid="connection-status">
          Disconnected - Reconnecting...
        </div>
      )}

      {/* Desktop Sidebar */}
      <UsersSidebar
        users={onlineUsers}
        currentUser={currentUser}
        className="hidden lg:flex"
      />

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" data-testid="mobile-sidebar-overlay">
          <div className="absolute left-0 top-0 h-full">
            <UsersSidebar
              users={onlineUsers}
              currentUser={currentUser}
              className="flex"
            />
            <button
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
              onClick={() => setIsSidebarOpen(false)}
              data-testid="button-close-sidebar"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <ChatHeader onToggleSidebar={handleToggleSidebar} />
        
        <MessagesArea
          messages={messages}
          currentUser={currentUser}
          typingUsers={typingUsers}
          onDeleteLastMessage={deleteLastMessage}
        />
        
        <MessageInput
          onSendMessage={handleSendMessage}
          onStartTyping={startTyping}
          onStopTyping={stopTyping}
          onToggleKeyboard={handleToggleKeyboard}
          disabled={!isConnected}
        />
        
        <VirtualKeyboard
          isVisible={isKeyboardVisible}
          onKeyPress={handleKeyPress}
          onSend={() => {
            // This would trigger the form submission in MessageInput
            // For now, just hide the keyboard
            setIsKeyboardVisible(false);
          }}
        />
      </div>
    </div>
  );
}
