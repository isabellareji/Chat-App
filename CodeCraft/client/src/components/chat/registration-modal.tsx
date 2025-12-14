import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RegistrationModalProps {
  isOpen: boolean;
  onRegister: (username: string, avatarColor: string) => Promise<void>;
}

const avatarColors = [
  { name: 'primary', color: 'bg-primary' },
  { name: 'green', color: 'bg-green-500' },
  { name: 'red', color: 'bg-red-500' },
  { name: 'yellow', color: 'bg-yellow-500' },
  { name: 'purple', color: 'bg-purple-500' },
  { name: 'pink', color: 'bg-pink-500' },
];

export function RegistrationModal({ isOpen, onRegister }: RegistrationModalProps) {
  const [username, setUsername] = useState("");
  const [selectedColor, setSelectedColor] = useState("primary");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError("Username is required");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await onRegister(username.trim(), selectedColor);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to register");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" data-testid="registration-modal">
      <Card className="w-full max-w-md mx-4 bg-card text-card-foreground">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome to Chat</CardTitle>
          <p className="text-muted-foreground">Choose a username to get started</p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="username-input" className="text-sm font-medium">
                Username
              </Label>
              <Input
                id="username-input"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username..."
                maxLength={20}
                required
                className="mt-2"
                data-testid="input-username"
              />
            </div>
            
            <div>
              <Label className="text-sm font-medium">Choose an Avatar Color</Label>
              <div className="flex space-x-2 mt-2">
                {avatarColors.map((color) => (
                  <button
                    key={color.name}
                    type="button"
                    className={`w-8 h-8 rounded-full ${color.color} transition-all ${
                      selectedColor === color.name ? 'ring-2 ring-ring' : ''
                    }`}
                    onClick={() => setSelectedColor(color.name)}
                    data-testid={`avatar-color-${color.name}`}
                  />
                ))}
              </div>
            </div>
            
            {error && (
              <p className="text-destructive text-sm" data-testid="error-message">
                {error}
              </p>
            )}
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
              data-testid="button-join-chat"
            >
              {isLoading ? "Joining..." : "Join Chat"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
