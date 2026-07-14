import { MessageRepository } from "../../routes/repositories/messaging/message.repository";
import { IMessage } from "../../models/messaging/message.model";
import mongoose from "mongoose";

export class MessageService {
  private messageRepository: MessageRepository;

  constructor() {
    this.messageRepository = new MessageRepository();
  }

  // Create a unique conversation ID from two user IDs
  private createConversationId(userId1: string, userId2: string): string {
    const ids = [userId1, userId2].sort();
    return `${ids[0]}_${ids[1]}`;
  }

  private normalizeId(value: any): string {
    if (!value) return "";
    if (typeof value === "string") return value;
    if (typeof value === "object") {
      if (typeof value.$oid === "string") return value.$oid;
      if (typeof value._id === "string") return value._id;
      if (typeof value.id === "string") return value.id;
    }
    return String(value);
  }

  async sendMessage(
    senderId: string,
    senderName: string,
    senderEmail: string,
    receiverEmail: string
  ): Promise<{ message: string; exists: boolean; error?: string }> {
    // Check if receiver email exists as a user
    const receiver = await this.messageRepository.findUserByEmail(
      receiverEmail
    );

    if (!receiver) {
      return {
        message: "This email is not registered in the app",
        exists: false,
        error: "User not found",
      };
    }

    return {
      message: "ready",
      exists: true,
    };
  }

  async getOrCreateConversation(
    senderId: string,
    receiverEmail: string
  ): Promise<{
    success: boolean;
    receiverId?: string;
    receiverName?: string;
    receiverEmail?: string;
    conversationId?: string;
    error?: string;
  }> {
    const receiver = await this.messageRepository.findUserByEmail(
      receiverEmail
    );

    if (!receiver) {
      return {
        success: false,
        error: `${receiverEmail} is not registered in the app`,
      };
    }

    const conversationId = this.createConversationId(
      senderId,
      receiver._id.toString()
    );

    return {
      success: true,
      receiverId: receiver._id.toString(),
      receiverName: receiver.fullname,
      receiverEmail: receiver.email,
      conversationId,
    };
  }

  async saveMessage(data: {
    senderId: string;
    receiverId: string;
    conversationId: string;
    message: string;
  }): Promise<IMessage> {
    const senderId = this.normalizeId(data.senderId);
    const receiverId = this.normalizeId(data.receiverId);
    const incomingConversationId = (data.conversationId || "").trim();

    const sender = await this.messageRepository.findUserById(senderId);
    const receiver = await this.messageRepository.findUserById(receiverId);

    if (!sender || !receiver) {
      throw new Error("Invalid sender or receiver");
    }

    const expectedConversationId = this.createConversationId(senderId, receiverId);
    const conversationId = incomingConversationId || expectedConversationId;

    return await this.messageRepository.createMessage({
      senderId: new mongoose.Types.ObjectId(senderId),
      senderName: sender.fullname,
      senderEmail: sender.email,
      receiverId: new mongoose.Types.ObjectId(receiverId),
      receiverName: receiver.fullname,
      receiverEmail: receiver.email,
      conversationId,
      message: data.message,
    });
  }

  async getUserPublicById(userId: string): Promise<{
    _id: string;
    fullname: string;
    email: string;
  } | null> {
    const user = await this.messageRepository.findUserById(userId);
    if (!user) return null;

    return {
      _id: user._id.toString(),
      fullname: user.fullname,
      email: user.email,
    };
  }

  async getConversation(conversationId: string, userId: string): Promise<IMessage[]> {
    const messages = await this.messageRepository.getMessagesByConversation(
      conversationId,
      userId,
      1000,
      0
    );
    console.log(`Fetching conversation ${conversationId} for user ${userId}: found ${messages.length} messages`);
    return messages.reverse(); // Return in chronological order
  }

  async getConversationsList(userId: string): Promise<any[]> {
    return await this.messageRepository.getConversationsList(userId);
  }

  async markAsRead(conversationId: string, userId: string): Promise<void> {
    await this.messageRepository.markMessagesAsRead(conversationId, userId);
  }

  async getUnreadCount(userId: string): Promise<number> {
    return await this.messageRepository.getUnreadCount(userId);
  }

  async getNotifications(userId: string): Promise<any[]> {
    // Get unread messages for this user
    const notifications = await this.messageRepository.getUnreadNotifications(userId);
    return notifications;
  }
}
