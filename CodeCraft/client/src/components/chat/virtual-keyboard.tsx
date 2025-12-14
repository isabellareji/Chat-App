import { Button } from "@/components/ui/button";
import { Delete, Send } from "lucide-react";

interface VirtualKeyboardProps {
  isVisible: boolean;
  onKeyPress: (key: string) => void;
  onSend: () => void;
}

const keyboardRows = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
];

export function VirtualKeyboard({ isVisible, onKeyPress, onSend }: VirtualKeyboardProps) {
  if (!isVisible) return null;

  const handleKeyPress = (key: string) => {
    if (key === 'backspace') {
      onKeyPress('Delete');
    } else if (key === 'space') {
      onKeyPress(' ');
    } else {
      onKeyPress(key.toLowerCase());
    }
  };

  return (
    <div className="virtual-keyboard bg-card border-t border-border p-4 lg:hidden" data-testid="virtual-keyboard">
      <div className="space-y-3">
        {/* Keyboard Rows */}
        {keyboardRows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center space-x-1">
            {row.map((key) => (
              <Button
                key={key}
                variant="secondary"
                size="sm"
                className="keyboard-key bg-muted text-foreground px-3 py-2 font-medium hover:bg-muted/80 min-w-[32px]"
                onClick={() => handleKeyPress(key)}
                data-testid={`keyboard-key-${key.toLowerCase()}`}
              >
                {key}
              </Button>
            ))}
            {/* Add backspace to last row */}
            {rowIndex === keyboardRows.length - 1 && (
              <Button
                variant="destructive"
                size="sm"
                className="keyboard-key px-4 py-2 font-medium hover:bg-destructive/80"
                onClick={() => handleKeyPress('backspace')}
                data-testid="keyboard-key-backspace"
              >
                <Delete className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
        
        {/* Bottom Row */}
        <div className="flex justify-center space-x-1">
          <Button
            variant="secondary"
            size="sm"
            className="keyboard-key bg-secondary text-secondary-foreground px-6 py-2 font-medium hover:bg-secondary/80"
            onClick={() => handleKeyPress('space')}
            data-testid="keyboard-key-space"
          >
            Space
          </Button>
          <Button
            variant="default"
            size="sm"
            className="keyboard-key bg-primary text-primary-foreground px-6 py-2 font-medium hover:bg-primary/80"
            onClick={onSend}
            data-testid="keyboard-key-send"
          >
            <Send className="h-4 w-4 mr-2" />
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}
