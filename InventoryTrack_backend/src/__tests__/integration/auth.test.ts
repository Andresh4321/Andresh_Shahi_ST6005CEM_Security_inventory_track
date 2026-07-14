// File: src/__tests__/integration/auth.test.ts

import request from "supertest";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import app from "../../app";
import { UserModel } from "../../models/auth/user.models";
import jwt from "jsonwebtoken";
import { JWT_SECRET, MONGO_URI } from "../../config";

let userToken: string;
let userId: string;
let adminToken: string;

// Connect to test DB before all tests
beforeAll(async () => {
  await mongoose.connect(MONGO_URI);
  await UserModel.deleteMany({});

  // Create a normal user
  const hashedPassword = await bcrypt.hash("user123", 10);
  const user = await UserModel.create({
    fullname: "Test User",
    email: "user@test.com",
    password: hashedPassword,
    phone_number: "9999999999",
    role: "user",
  });
  userId = user._id.toString();

  // JWT for normal user
  userToken = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });

  // Create admin user
  const hashedAdminPassword = await bcrypt.hash("admin123", 10);
  const admin = await UserModel.create({
    fullname: "Admin User",
    email: "admin@test.com",
    password: hashedAdminPassword,
    role: "admin",
  });
  adminToken = jwt.sign({ id: admin._id }, JWT_SECRET, { expiresIn: "1h" });
});

afterAll(async () => {
  if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
    await mongoose.connection.db.dropDatabase();
  }
  await mongoose.disconnect();
});

describe("Auth Integration Tests", () => {
  // 1. REGISTER USER
  it("should register a new user", async () => {
    const res = await request(app).post("/api/auth/register").send({
      fullname: "New User",
      email: "newuser@test.com",
      password: "123456",
      phone_number: "8888888888",
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe("newuser@test.com");
  });

  // 2. REGISTER DUPLICATE EMAIL
  it("should not register with existing email", async () => {
    const res = await request(app).post("/api/auth/register").send({
      fullname: "Another User",
      email: "user@test.com",
      password: "123456",
      phone_number: "7777777777",
    });
    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  // 3. LOGIN USER
  it("should login a normal user", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "user@test.com",
      password: "user123",
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe("user@test.com");
  });

  // 4. LOGIN USER WITH WRONG PASSWORD
  it("should fail login with wrong password", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "user@test.com",
      password: "wrongpass",
    });
    expect(res.status).toBe(401);
  });

  // 5. LOGIN ADMIN
  it("should login admin user", async () => {
    const res = await request(app).post("/api/auth/admin/login").send({
      email: "admin@test.com",
      password: "admin123",
      role: "admin",
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.role).toBe("admin");
  });

  // 6. WHOAMI
  it("should return logged-in user info", async () => {
    const res = await request(app)
      .get("/api/auth/whoami")
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe("user@test.com");
  });

  // 7. UPDATE PROFILE
  it("should update user profile", async () => {
    const res = await request(app)
      .put(`/api/auth/${userId}`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ fullname: "Updated User" });
    expect(res.status).toBe(200);
    expect(res.body.data.fullname).toBe("Updated User");
  });

  // 8. UPLOAD PROFILE PHOTO
  it("should upload profile photo", async () => {
    const res = await request(app)
      .post("/api/auth/upload-photo")
      .set("Authorization", `Bearer ${userToken}`)
      .attach("userImage", "src/__tests__/fitures/test-image.png");
    expect(res.status).toBe(200);
    expect(res.body.imageUrl).toContain("/uploads/");
  });

  // 9. FORGOT PASSWORD
  it("should send forgot password email", async () => {
    const res = await request(app).post("/api/auth/forgot-password").send({
      email: "user@test.com",
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  // 10. RESET PASSWORD
  it("should reset password with valid token", async () => {
    const user = await UserModel.findOne({ email: "user@test.com" });
    const token = "resettoken123";
    user!.resetPasswordToken = token;
    user!.resetPasswordExpire = new Date(Date.now() + 15 * 60 * 1000);
    await user!.save();

    const res = await request(app)
      .post(`/api/auth/reset-password/${token}`)
      .send({ password: "newpassword123" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });



  it("should fail admin login for non-admin user", async () => {
  const res = await request(app)
    .post("/api/auth/admin/login")
    .send({
      email: "newuser@test.com",   // normal user
      password: "123456",      // must match hashed password
      role: "admin",            // pretend to be admin
    });

  expect(res.status).toBe(403);
  expect(res.body.success).toBe(false);
  expect(res.body.message).toBe("Forbidden, Admins only");
});


  
});
