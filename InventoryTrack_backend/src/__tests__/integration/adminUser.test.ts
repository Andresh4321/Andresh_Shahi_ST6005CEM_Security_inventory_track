// File: src/__tests__/adminUser.test.ts

import request from "supertest";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import app from "../../app"; // make sure your app export is named 'app'
import { UserModel } from "../../models/auth/user.models";
import jwt from "jsonwebtoken";
import { JWT_SECRET,MONGO_URI } from "../../config";

// --------- Test Variables ---------
let adminToken: string;
let adminId: string;
let testUserIds: string[] = [];

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URI_TEST!);
  }

  // Clear users collection
  await UserModel.deleteMany({});

  // Create admin user
  const hashedPassword = await bcrypt.hash("admin123", 10);
  const admin = await UserModel.create({
    fullname: "Admin User",
    email: "admin@test.com",
    password: hashedPassword,
    role: "admin",
    phone_number: "0000000000", // optional if unique removed
  });
  adminId = admin._id.toString();

  // Generate JWT
  adminToken = jwt.sign({ id: admin._id }, JWT_SECRET, { expiresIn: "1h" });

  // Create test normal users
  const users = [
    { fullname: "User One", email: "user1@test.com", password: await bcrypt.hash("123456", 10), phone_number: "1111111111" },
    { fullname: "User Two", email: "user2@test.com", password: await bcrypt.hash("123456", 10), phone_number: "2222222222" },
    { fullname: "User Three", email: "user3@test.com", password: await bcrypt.hash("123456", 10), phone_number: "3333333333" },
    { fullname: "User Four", email: "user4@test.com", password: await bcrypt.hash("123456", 10), phone_number: "4444444444" },
    { fullname: "User Five", email: "user5@test.com", password: await bcrypt.hash("123456", 10), phone_number: "5555555555" },
  ];

  const createdUsers = await UserModel.insertMany(users);
  testUserIds = createdUsers.map(u => u._id.toString());
});


afterAll(async () => {
  if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
    await mongoose.connection.db.dropDatabase();
  }
  await mongoose.disconnect();
});


// --------- CREATE USER ---------
describe("POST /api/admin/users", () => {
  it("should create a new user", async () => {
    const res = await request(app)
      .post("/api/admin/users")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ fullname: "New User", email: "newuser@test.com", password: "123456",phone_number: "9999999999"  });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe("newuser@test.com");
  });

  it("should not allow duplicate email", async () => {
    const res = await request(app)
      .post("/api/admin/users")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ fullname: "Another User", email: "user1@test.com", password: "123456" , phone_number: "6666666666"});

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
});

// --------- GET ALL USERS WITH PAGINATION ---------
describe("GET /api/admin/users", () => {
  it("should get first page of users", async () => {
    const res = await request(app)
      .get("/api/admin/users?page=1&limit=3")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(3);
    expect(res.body.total).toBeGreaterThanOrEqual(6); // admin + 5 test users
    expect(res.body.totalPages).toBe(Math.ceil(res.body.total / 3));
  });

  it("should return empty array if page exceeds total", async () => {
    const res = await request(app)
      .get("/api/admin/users?page=100&limit=5")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(0);
  });
});

// --------- GET USER BY ID ---------
describe("GET /api/admin/users/:id", () => {
  it("should get a single user by ID", async () => {
    const res = await request(app)
      .get(`/api/admin/users/${testUserIds[0]}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe("user1@test.com");
  });

  it("should return 400 for invalid ID", async () => {
    const res = await request(app)
      .get("/api/admin/users/invalidid")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(400);
  });

  it("should return 404 for non-existing user", async () => {
    const res = await request(app)
      .get(`/api/admin/users/${new mongoose.Types.ObjectId()}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(404);
  });
});

// --------- UPDATE USER ---------
describe("PUT /api/admin/users/:id", () => {
  it("should update user fullname", async () => {
    const res = await request(app)
      .put(`/api/admin/users/${testUserIds[0]}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ fullname: "Updated User One" });

    expect(res.status).toBe(200);
    expect(res.body.data.fullname).toBe("Updated User One");
  });

  it("should reject invalid update", async () => {
    const res = await request(app)
      .put(`/api/admin/users/${testUserIds[0]}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ email: "not-an-email" });

    expect(res.status).toBe(400);
  });
});

// --------- UPDATE USER IMAGE ---------
describe("PUT /api/admin/users/:id/image", () => {
  it("should update profile image", async () => {
    const res = await request(app)
      .put(`/api/admin/users/${testUserIds[0]}/image`)
      .set("Authorization", `Bearer ${adminToken}`)
      .attach("image", "src/__tests__/fitures/test-image.png"); // place a dummy image in fixtures

    expect(res.status).toBe(200);
    expect(res.body.data.profileImage).toContain("/uploads/");
  });

  it("should return 400 if no image provided", async () => {
    const res = await request(app)
      .put(`/api/admin/users/${testUserIds[0]}/image`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(400);
  });
});

// --------- DELETE USER ---------
describe("DELETE /api/admin/users/:id", () => {
  it("should delete a user", async () => {
    const res = await request(app)
      .delete(`/api/admin/users/${testUserIds[1]}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
  });

  it("should return 404 for non-existing user", async () => {
    const res = await request(app)
      .delete(`/api/admin/users/${new mongoose.Types.ObjectId()}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(404);
  });

  it("should return 400 for invalid ID", async () => {
    const res = await request(app)
      .delete("/api/admin/users/invalidid")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(400);
  });
});
