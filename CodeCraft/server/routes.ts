import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertUserSchema, insertMessageSchema } from "@shared/schema";
import { z } from "zod";

interface WebSocketWithUser extends WebSocket {
  userId?: string;
  username?: string;
}

interface TypingData {
  userId: string;
  username: string;
  isTyping: boolean;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // User registration endpoint
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already taken" });
      }

      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  // Get online users
  app.get("/api/users/online", async (req, res) => {
    try {
      const users = await storage.getOnlineUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to get users" });
    }
  });

  // Get messages
  app.get("/api/messages", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const messages = await storage.getMessages(limit);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to get messages" });
    }
  });

  // Delete last message
  app.delete("/api/messages/last", async (req, res) => {
    try {
      const deletedMessage = await storage.deleteLastMessage();
      if (!deletedMessage) {
        return res.status(404).json({ message: "No messages to delete" });
      }
      res.json({ message: "Message deleted", deletedMessage });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete message" });
    }
  });

  const httpServer = createServer(app);

  // Setup WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  const connectedClients = new Map<string, WebSocketWithUser>();
  const typingUsers = new Map<string, TypingData>();

  wss.on('connection', (ws: WebSocketWithUser) => {
    console.log('New WebSocket connection');

    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());

        switch (message.type) {
          case 'user_join':
            ws.userId = message.userId;
            ws.username = message.username;
            connectedClients.set(message.userId, ws);
            
            // Update user online status
            await storage.updateUserOnlineStatus(message.userId, true);
            
            // Broadcast user joined
            broadcast({
              type: 'user_joined',
              user: await storage.getUser(message.userId)
            }, ws);

            // Send current online users to new client
            const onlineUsers = await storage.getOnlineUsers();
            ws.send(JSON.stringify({
              type: 'online_users',
              users: onlineUsers
            }));

            // Send recent messages to new client
            const recentMessages = await storage.getMessages(50);
            ws.send(JSON.stringify({
              type: 'message_history',
              messages: recentMessages
            }));
            break;

          case 'send_message':
            if (!ws.userId) {
              ws.send(JSON.stringify({ type: 'error', message: 'Not authenticated' }));
              return;
            }

            const messageData = insertMessageSchema.parse({
              content: message.content,
              userId: ws.userId,
              username: ws.username,
              avatarColor: message.avatarColor
            });

            const savedMessage = await storage.createMessage(messageData);
            
            // Broadcast message to all clients
            broadcast({
              type: 'new_message',
              message: savedMessage
            });
            break;

          case 'typing_start':
            if (!ws.userId) return;
            
            typingUsers.set(ws.userId, {
              userId: ws.userId,
              username: ws.username!,
              isTyping: true
            });

            broadcast({
              type: 'typing_update',
              typingUsers: Array.from(typingUsers.values()).filter(u => u.isTyping)
            }, ws);
            break;

          case 'typing_stop':
            if (!ws.userId) return;
            
            typingUsers.delete(ws.userId);

            broadcast({
              type: 'typing_update', 
              typingUsers: Array.from(typingUsers.values()).filter(u => u.isTyping)
            }, ws);
            break;
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
        ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
      }
    });

    ws.on('close', async () => {
      if (ws.userId) {
        // Update user offline status
        await storage.updateUserOnlineStatus(ws.userId, false);
        
        // Remove from connected clients
        connectedClients.delete(ws.userId);
        
        // Remove from typing users
        typingUsers.delete(ws.userId);
        
        // Broadcast user left
        broadcast({
          type: 'user_left',
          userId: ws.userId,
          username: ws.username
        });
      }
    });
  });

  function broadcast(message: any, excludeWs?: WebSocket) {
    const messageStr = JSON.stringify(message);
    connectedClients.forEach((client) => {
      if (client !== excludeWs && client.readyState === WebSocket.OPEN) {
        client.send(messageStr);
      }
    });
  }

  return httpServer;
}
