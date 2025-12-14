import { type User, type InsertUser, type Message, type InsertMessage } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserOnlineStatus(id: string, isOnline: boolean): Promise<void>;
  getOnlineUsers(): Promise<User[]>;
  
  // Message methods
  createMessage(message: InsertMessage): Promise<Message>;
  getMessages(limit?: number): Promise<Message[]>;
  getMessagesByUser(userId: string): Promise<Message[]>;
  deleteLastMessage(): Promise<Message | null>;
  clearAllMessages(): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private messages: Map<string, Message>;

  constructor() {
    this.users = new Map();
    this.messages = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const now = new Date();
    const user: User = { 
      ...insertUser,
      avatarColor: insertUser.avatarColor || "primary",
      id,
      isOnline: true,
      lastSeen: now,
      createdAt: now,
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserOnlineStatus(id: string, isOnline: boolean): Promise<void> {
    const user = this.users.get(id);
    if (user) {
      user.isOnline = isOnline;
      user.lastSeen = new Date();
      this.users.set(id, user);
    }
  }

  async getOnlineUsers(): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => user.isOnline);
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const now = new Date();
    const message: Message = {
      ...insertMessage,
      avatarColor: insertMessage.avatarColor || "primary",
      id,
      timestamp: now,
      createdAt: now,
    };
    this.messages.set(id, message);
    return message;
  }

  async getMessages(limit: number = 50): Promise<Message[]> {
    const allMessages = Array.from(this.messages.values());
    return allMessages
      .sort((a, b) => a.createdAt!.getTime() - b.createdAt!.getTime())
      .slice(-limit);
  }

  async getMessagesByUser(userId: string): Promise<Message[]> {
    return Array.from(this.messages.values()).filter(
      message => message.userId === userId
    );
  }

  async deleteLastMessage(): Promise<Message | null> {
    const allMessages = Array.from(this.messages.values());
    if (allMessages.length === 0) {
      return null;
    }
    
    const sortedMessages = allMessages.sort((a, b) => a.createdAt!.getTime() - b.createdAt!.getTime());
    const lastMessage = sortedMessages[sortedMessages.length - 1];
    
    this.messages.delete(lastMessage.id);
    return lastMessage;
  }

  async clearAllMessages(): Promise<void> {
    this.messages.clear();
  }
}

export const storage = new MemStorage();
