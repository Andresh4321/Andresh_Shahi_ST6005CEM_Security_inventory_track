import request from "supertest";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import app from "../../app";
import { UserModel } from "../../models/auth/user.models";
import { MessageModel } from "../../models/messaging/message.model";
import jwt from "jsonwebtoken";
import { JWT_SECRET, MONGO_URI } from "../../config";

let senderToken: string;
let senderId: string;
let receiverToken: string;
let receiverId: string;
let receiverEmail: string;
let conversationId: string;

// Connect to test DB before all tests
beforeAll(async () => {
  await mongoose.connect(MONGO_URI);
  await MessageModel.deleteMany({});
  await UserModel.deleteMany({});

  // Create sender user
  const hashedPassword = await bcrypt.hash("sender123", 10);
  const sender = await UserModel.create({
    fullname: "Sender User",
    email: "sender@test.com",
    password: hashedPassword,
    phone_number: "1234567890",
    role: "user",
  });
  senderId = sender._id.toString();
  senderToken = jwt.sign({ id: sender._id }, JWT_SECRET, { expiresIn: "1h" });

  // Create receiver user
  const hashedReceiverPassword = await bcrypt.hash("receiver123", 10);
  const receiver = await UserModel.create({
    fullname: "Receiver User",
    email: "receiver@test.com",
    password: hashedReceiverPassword,
    phone_number: "0987654321",
    role: "user",
  });
  receiverId = receiver._id.toString();
  receiverEmail = receiver.email;
  receiverToken = jwt.sign({ id: receiver._id }, JWT_SECRET, {
    expiresIn: "1h",
  });
});

afterAll(async () => {
  if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
    await mongoose.connection.db.dropDatabase();
  }
  await mongoose.disconnect();
});

describe("Messaging Integration Tests", () => {
  // 1. CHECK USER EXISTS
  it("should check if user exists by email", async () => {
    const res = await request(app)
      .post("/api/messages/check-user")
      .set("Authorization", `Bearer ${senderToken}`)
      .send({
        email: receiverEmail,
      });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("should return 404 for non-existent user email", async () => {
    const res = await request(app)
      .post("/api/messages/check-user")
      .set("Authorization", `Bearer ${senderToken}`)
      .send({
        email: "nonexistent@test.com",
      });
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it("should fail check-user without authentication", async () => {
    const res = await request(app)
      .post("/api/messages/check-user")
      .send({
        email: receiverEmail,
      });
    expect(res.status).toBe(401);
  });

  // 2. GET OR CREATE CONVERSATION
  it("should get or create conversation", async () => {
    const res = await request(app)
      .post("/api/messages/conversation")
      .set("Authorization", `Bearer ${senderToken}`)
      .send({
        receiverEmail: receiverEmail,
      });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("conversationId");
    expect(res.body.data).toHaveProperty("receiverId");
    conversationId = res.body.data.conversationId;
  });

  it("should fail to create conversation without receiver email", async () => {
    const res = await request(app)
      .post("/api/messages/conversation")
      .set("Authorization", `Bearer ${senderToken}`)
      .send({});
    expect(res.status).toBe(400);
  });

  it("should fail conversation without authentication", async () => {
    const res = await request(app)
      .post("/api/messages/conversation")
      .send({
        receiverEmail: receiverEmail,
      });
    expect(res.status).toBe(401);
  });

  // 3. SEND MESSAGE
  it("should send a message", async () => {
    const res = await request(app)
      .post("/api/messages/send")
      .set("Authorization", `Bearer ${senderToken}`)
      .send({
        receiverId: receiverId,
        conversationId: conversationId,
        message: "Hello! This is a test message.",
      });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.message).toBe("Hello! This is a test message.");
    expect(res.body.data.conversationId).toBe(conversationId);
  });

  it("should fail to send message without required fields", async () => {
    const res = await request(app)
      .post("/api/messages/send")
      .set("Authorization", `Bearer ${senderToken}`)
      .send({
        message: "Test",
      });
    expect(res.status).toBe(400);
  });

  it("should fail to send message without authentication", async () => {
    const res = await request(app)
      .post("/api/messages/send")
      .send({
        receiverId: receiverId,
        conversationId: conversationId,
        message: "Test",
      });
    expect(res.status).toBe(401);
  });

  // 4. GET CONVERSATION MESSAGES
  it("should get messages in a conversation", async () => {
    const res = await request(app)
      .get(`/api/messages/${conversationId}`)
      .set("Authorization", `Bearer ${senderToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0]).toHaveProperty("message");
  });

  it("should fail to get conversation without authentication", async () => {
    const res = await request(app).get(`/api/messages/${conversationId}`);
    expect(res.status).toBe(401);
  });

  // 5. GET CONVERSATIONS LIST
  it("should get all conversations for a user", async () => {
    const res = await request(app)
      .get("/api/messages")
      .set("Authorization", `Bearer ${senderToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it("should fail to get conversations without authentication", async () => {
    const res = await request(app).get("/api/messages");
    expect(res.status).toBe(401);
  });

  // 6. GET UNREAD COUNT
  it("should get unread message count", async () => {
    const res = await request(app)
      .get("/api/messages/count/unread")
      .set("Authorization", `Bearer ${receiverToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("unreadCount");
    expect(typeof res.body.data.unreadCount).toBe("number");
  });

  it("should fail to get unread count without authentication", async () => {
    const res = await request(app).get("/api/messages/count/unread");
    expect(res.status).toBe(401);
  });

  // 7. SEND REPLY FROM RECEIVER
  it("should allow receiver to send a reply", async () => {
    const res = await request(app)
      .post("/api/messages/send")
      .set("Authorization", `Bearer ${receiverToken}`)
      .send({
        receiverId: senderId,
        conversationId: conversationId,
        message: "Hi! This is a reply message.",
      });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.message).toBe("Hi! This is a reply message.");
  });

  // 8. VERIFY MESSAGES IN CONVERSATION
  it("should have multiple messages in conversation", async () => {
    const res = await request(app)
      .get(`/api/messages/${conversationId}`)
      .set("Authorization", `Bearer ${senderToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(2);
  });

  // 9. VERIFY CONVERSATION SHOWS FOR RECEIVER
  it("should show conversation in receiver's list", async () => {
    const res = await request(app)
      .get("/api/messages")
      .set("Authorization", `Bearer ${receiverToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    const conversation = res.body.data.find(
      (c: any) => c.conversationId === conversationId
    );
    expect(conversation).toBeDefined();
  });

  // 10. VERIFY READ STATUS UPDATE
  it("should mark messages as read when viewing conversation", async () => {
    // View conversation as receiver (should mark sender's messages as read)
    await request(app)
      .get(`/api/messages/${conversationId}`)
      .set("Authorization", `Bearer ${receiverToken}`);

    // Check that messages are marked as read
    const messages = await MessageModel.find({
      conversationId: conversationId,
      receiverId: receiverId,
    });
    
    const readMessages = messages.filter((msg) => msg.isRead);
    expect(readMessages.length).toBeGreaterThan(0);
  });
});
