import apiClient from "./client";

// Check if email exists as a user
export const checkUserExists = (email: string) => {
  return apiClient.post("/messages/check-user", { email });
};

// Get or create conversation with a user by email
export const getOrCreateConversation = (receiverEmail: string) => {
  return apiClient.post("/messages/conversation", { receiverEmail });
};

// Send message
export const sendMessage = (data: {
  receiverId: string;
  conversationId: string;
  message: string;
}) => {
  return apiClient.post("/messages/send", data);
};

// Get all messages in a conversation
export const getConversation = (conversationId: string) => {
  return apiClient.get(`/messages/${conversationId}`);
};

// Get list of all conversations
export const getConversationsList = () => {
  return apiClient.get("/messages");
};

// Get unread message count
export const getUnreadCount = () => {
  return apiClient.get("/messages/count/unread");
};

// Get notifications (unread message previews)
export const getNotifications = () => {
  return apiClient.get("/messages/notifications/list");
};

export const messagingApi = {
  checkUserExists,
  getOrCreateConversation,
  sendMessage,
  getConversation,
  getConversationsList,
  getUnreadCount,
  getNotifications,
};
