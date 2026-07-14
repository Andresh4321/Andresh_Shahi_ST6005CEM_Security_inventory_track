import { MessageModel, IMessage } from "../../../models/messaging/message.model";
import { UserModel } from "../../../models/auth/user.models";
import mongoose from "mongoose";

export class MessageRepository {
  async createMessage(data: Partial<IMessage>): Promise<IMessage> {
    const message = new MessageModel(data);
    return await message.save();
  }

  async getMessagesByConversation(
    conversationId: string,
    userId: string,
    limit: number = 50,
    skip: number = 0
  ): Promise<IMessage[]> {
    // Only return messages from conversations this user is part of
    return await MessageModel.find({ 
      conversationId,
      $or: [
        { senderId: new mongoose.Types.ObjectId(userId) },
        { receiverId: new mongoose.Types.ObjectId(userId) },
      ]
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);
  }

  async getConversationsList(userId: string): Promise<any[]> {
    return await MessageModel.aggregate([
      {
        $match: {
          $or: [
            { senderId: new mongoose.Types.ObjectId(userId) },
            { receiverId: new mongoose.Types.ObjectId(userId) },
          ],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: "$conversationId",
          lastMessage: { $first: "$$ROOT" },
        },
      },
      {
        $sort: { "lastMessage.createdAt": -1 },
      },
      {
        $replaceRoot: { newRoot: "$lastMessage" },
      },
    ]);
  }

  async findUserByEmail(email: string): Promise<any> {
    // Case-insensitive email search with trimming
    const trimmedEmail = email.trim();
    // Escape special regex characters
    const escapedEmail = trimmedEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const user = await UserModel.findOne({ 
      email: { $regex: new RegExp(`^${escapedEmail}$`, 'i') }
    }).select("_id fullname email");
    
    console.log('Finding user by email:', email, '→', trimmedEmail, '| Result:', user ? `Found: ${user.email}` : 'Not found');
    return user;
  }

  async findUserById(userId: string): Promise<any> {
    return await UserModel.findById(userId).select("_id fullname email");
  }

  async markMessagesAsRead(conversationId: string, userId: string): Promise<any> {
    return await MessageModel.updateMany(
      {
        conversationId,
        receiverId: new mongoose.Types.ObjectId(userId),
        isRead: false,
      },
      { isRead: true }
    );
  }

  async getUnreadCount(userId: string): Promise<number> {
    return await MessageModel.countDocuments({
      receiverId: new mongoose.Types.ObjectId(userId),
      isRead: false,
    });
  }

  async getUnreadNotifications(userId: string): Promise<any[]> {
    // Group unread messages by sender to create notification previews
    return await MessageModel.aggregate([
      {
        $match: {
          receiverId: new mongoose.Types.ObjectId(userId),
          isRead: false,
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: "$senderId",
          senderName: { $first: "$senderName" },
          senderEmail: { $first: "$senderEmail" },
          conversationId: { $first: "$conversationId" },
          lastMessage: { $first: "$message" },
          createdAt: { $first: "$createdAt" },
          messageCount: { $sum: 1 },
        },
      },
      {
        $sort: { createdAt: -1 },
      },
    ]);
  }
}
