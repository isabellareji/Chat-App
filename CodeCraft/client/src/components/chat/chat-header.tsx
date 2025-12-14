import { Menu, Settings, Info, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatHeaderProps {
  onToggleSidebar: () => void;
}

export function ChatHeader({ onToggleSidebar }: ChatHeaderProps) {
  return (
    <div className="bg-card border-b border-border p-4 flex items-center justify-between" data-testid="chat-header">
      <div className="flex items-center space-x-3">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden text-muted-foreground hover:text-foreground"
          onClick={onToggleSidebar}
          data-testid="button-toggle-sidebar"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="font-semibold text-foreground flex items-center">
            <Hash className="mr-2 h-4 w-4 text-muted-foreground" />
            general
          </h1>
          <p className="text-xs text-muted-foreground">Real-time chat room</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground"
          data-testid="button-settings"
        >
          <Settings className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground"
          data-testid="button-info"
        >
          <Info className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
