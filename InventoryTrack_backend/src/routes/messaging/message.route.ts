import { Router, Request, Response } from "express";
import { MessageController } from "../../controllers/messaging/message.controller";
import { authorizedMiddelWare } from "../../middleware/authorized.middleware";

const router = Router();
const messageController = new MessageController();

router.use(authorizedMiddelWare);

// Check if user exists by email (must come before catch-all)
router.post("/check-user", (req: Request, res: Response) => {
  messageController.checkUserExists(req, res);
});

// Get or create conversation with a user
router.post("/conversation", (req: Request, res: Response) => {
  messageController.getOrCreateConversation(req, res);
});

// Send a message
router.post("/send", (req: Request, res: Response) => {
  messageController.sendMessage(req, res);
});

// Get unread count (must come before :conversationId)
router.get("/count/unread", (req: Request, res: Response) => {
  messageController.getUnreadCount(req, res);
});

// Get notifications (unread message previews)
router.get("/notifications/list", (req: Request, res: Response) => {
  messageController.getNotifications(req, res);
});

// Get messages from a conversation
router.get("/:conversationId", (req: Request, res: Response) => {
  messageController.getConversation(req, res);
});

// Get list of conversations (catch-all, must be last)
router.get("/", (req: Request, res: Response) => {
  messageController.getConversationsList(req, res);
});

export default router;
