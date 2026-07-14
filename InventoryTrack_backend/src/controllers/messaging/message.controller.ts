import { Request, Response } from "express";
import { MessageService } from "../../services/messaging/message.service";

export class MessageController {
  private messageService: MessageService;

  constructor() {
    this.messageService = new MessageService();
  }

  async checkUserExists(req: Request, res: Response) {
    try {
      const { email } = req.body;
      const senderId = req.user?._id?.toString() || "";

      if (!senderId) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      if (!email) {
        return res
          .status(400)
          .json({ success: false, message: "Email is required" });
      }

      const result = await this.messageService.sendMessage(
        senderId,
        req.user?.fullname || "User",
        req.user?.email || "",
        email
      );

      return res.status(result.exists ? 200 : 404).json({
        success: result.exists,
        message: result.message,
        error: result.error,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getOrCreateConversation(req: Request, res: Response) {
    try {
      const { receiverEmail } = req.body;
      const senderId = req.user?._id?.toString() || "";

      if (!senderId) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      if (!receiverEmail) {
        return res
          .status(400)
          .json({ success: false, message: "Email is required" });
      }

      const result = await this.messageService.getOrCreateConversation(
        senderId,
        receiverEmail
      );

      if (!result.success) {
        return res.status(404).json({
          success: false,
          message: result.error,
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          conversationId: result.conversationId,
          receiverId: result.receiverId,
          receiverName: result.receiverName,
          receiverEmail: result.receiverEmail,
        },
        message: "Conversation retrieved successfully",
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async sendMessage(req: Request, res: Response) {
    try {
      const { receiverId, conversationId, message } = req.body;
      const senderId = req.user?._id?.toString() || "";

      if (!senderId) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      if (!message || !receiverId || !conversationId) {
        return res.status(400).json({
          success: false,
          message: "All fields are required",
        });
      }

      console.log(`[sendMessage] User ${senderId} (${req.user?.fullname}) sending message to ${receiverId} in conversation ${conversationId}`);

      const newMessage = await this.messageService.saveMessage({
        senderId,
        receiverId,
        conversationId,
        message,
      });

      console.log(`[sendMessage] Message saved successfully: ${newMessage._id}`);

      return res.status(201).json({
        success: true,
        data: newMessage,
        message: "Message sent successfully",
      });
    } catch (error: any) {
      console.error(`[sendMessage] Error:`, error);
      return res.status(500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getConversation(req: Request, res: Response) {
    try {
      const { conversationId } = req.params;
      const userId = req.user?._id?.toString() || "";

      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      if (!conversationId) {
        return res
          .status(400)
          .json({ success: false, message: "Conversation ID is required" });
      }

      console.log(`[getConversation] User ${userId} requesting conversation ${conversationId}`);

      // Mark messages as read
      await this.messageService.markAsRead(conversationId, userId);

      const messages = await this.messageService.getConversation(
        conversationId,
        userId
      );

      console.log(`[getConversation] Returning ${messages.length} messages`);

      const mappedMessages = messages.map((msg: any) => {
        const plain = typeof msg.toObject === "function" ? msg.toObject() : msg;
        const senderId = plain.senderId?.toString ? plain.senderId.toString() : String(plain.senderId || "");
        const receiverId = plain.receiverId?.toString ? plain.receiverId.toString() : String(plain.receiverId || "");

        return {
          ...plain,
          senderId,
          receiverId,
          isMine: senderId === userId,
        };
      });

      return res.status(200).json({
        success: true,
        data: mappedMessages,
        message: "Conversation retrieved successfully",
      });
    } catch (error: any) {
      console.error(`[getConversation] Error:`, error);
      return res.status(500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getConversationsList(req: Request, res: Response) {
    try {
      const userId = req.user?._id?.toString() || "";

      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const conversations = await this.messageService.getConversationsList(
        userId
      );

      // Map to get other user info from actual user records (prevents stale/wrong names)
      const mapped = await Promise.all(conversations.map(async (conv: any) => {
        const isCurrentUserSender = conv.senderId.toString() === userId;
        const otherUserId = isCurrentUserSender
          ? conv.receiverId.toString()
          : conv.senderId.toString();
        const otherUser = await this.messageService.getUserPublicById(otherUserId);

        return {
          conversationId: conv.conversationId,
          otherUserId,
          otherUserName: otherUser?.fullname || (isCurrentUserSender
            ? conv.receiverName
            : conv.senderName),
          otherUserEmail: otherUser?.email || (isCurrentUserSender
            ? conv.receiverEmail
            : conv.senderEmail),
          lastMessage: conv.message,
          lastMessageTime: conv.createdAt,
          unread: !conv.isRead && conv.receiverId.toString() === userId,
        };
      }));

      return res.status(200).json({
        success: true,
        data: mapped,
        message: "Conversations retrieved successfully",
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getUnreadCount(req: Request, res: Response) {
    try {
      const userId = req.user?._id?.toString() || "";

      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const count = await this.messageService.getUnreadCount(userId);

      return res.status(200).json({
        success: true,
        data: { unreadCount: count },
        message: "Unread count retrieved successfully",
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getNotifications(req: Request, res: Response) {
    try {
      const userId = req.user?._id?.toString() || "";

      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const notifications = await this.messageService.getNotifications(userId);

      return res.status(200).json({
        success: true,
        data: notifications,
        message: "Notifications retrieved successfully",
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
}
