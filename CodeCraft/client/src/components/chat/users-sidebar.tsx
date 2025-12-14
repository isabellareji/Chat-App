import { type User } from "@shared/schema";
import { Users } from "lucide-react";

interface UsersSidebarProps {
  users: User[];
  currentUser: User | null;
  className?: string;
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

export function UsersSidebar({ users, currentUser, className = "" }: UsersSidebarProps) {
  return (
    <div className={`w-64 bg-card border-r border-border flex-shrink-0 flex-col ${className}`} data-testid="users-sidebar">
      <div className="p-4 border-b border-border">
        <h2 className="font-semibold text-foreground flex items-center">
          <Users className="mr-2 h-4 w-4 text-primary" />
          Online Users
          <span className="ml-auto bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full" data-testid="user-count">
            {users.length}
          </span>
        </h2>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {users.map((user) => (
          <div 
            key={user.id} 
            className="p-3 hover:bg-muted/50 cursor-pointer transition-colors"
            data-testid={`user-item-${user.id}`}
          >
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className={`user-avatar user-avatar-sm ${getAvatarClass(user.avatarColor)}`}>
                  {getInitials(user.username)}
                </div>
                <div className={`status-indicator ${user.isOnline ? 'status-online' : 'status-offline'}`}></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate" data-testid={`username-${user.id}`}>
                  {user.username}
                  {currentUser?.id === user.id && " (You)"}
                </p>
                <p className="text-xs text-muted-foreground" data-testid={`status-${user.id}`}>
                  {user.isOnline ? "Online" : "Offline"}
                </p>
              </div>
            </div>
          </div>
        ))}
        
        {users.length === 0 && (
          <div className="p-4 text-center text-muted-foreground" data-testid="no-users">
            No users online
          </div>
        )}
      </div>
    </div>
  );
}
