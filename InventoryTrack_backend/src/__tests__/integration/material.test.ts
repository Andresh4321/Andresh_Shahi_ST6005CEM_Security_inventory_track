import request from "supertest";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import app from "../../app";
import { UserModel } from "../../models/auth/user.models";
import { MaterialModel } from "../../models/material/material.models";
import jwt from "jsonwebtoken";
import { JWT_SECRET, MONGO_URI } from "../../config";

let userToken: string;
let userId: string;
let materialId: string;

beforeAll(async () => {
  await mongoose.connect(MONGO_URI);
  await UserModel.deleteMany({});
  await MaterialModel.deleteMany({});

  // Create a test user
  const hashedPassword = await bcrypt.hash("user123", 10);
  const user = await UserModel.create({
    fullname: "Material Test User",
    email: "material@test.com",
    password: hashedPassword,
    phone_number: "9876543210",
    role: "user",
  });
  userId = user._id.toString();
  userToken = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });
});

afterAll(async () => {
  if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
    await mongoose.connection.db.dropDatabase();
  }
  await mongoose.disconnect();
});

describe("Material Management Tests", () => {
  it("should create a new material", async () => {
    const materialData = {
      name: "Steel Plate",
      unit: "kg",
      unit_price: 500,
      minimum_stock: 10,
      description: "High-quality steel plate",
    };

    const response = await request(app)
      .post("/api/materials")
      .set("Authorization", `Bearer ${userToken}`)
      .send(materialData);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.name).toBe("Steel Plate");
    expect(response.body.data.unit_price).toBe(500);
    
    materialId = response.body.data._id;
  });

  it("should get all materials with pagination", async () => {
    // Create another material first
    await request(app)
      .post("/api/materials")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        name: "Aluminum Sheet",
        unit: "m²",
        unit_price: 300,
        minimum_stock: 5,
        description: "Aluminum sheet for manufacturing",
      });

    const response = await request(app)
      .get("/api/materials?page=1&limit=10")
      .set("Authorization", `Bearer ${userToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);
  });

  it("should get material by ID", async () => {
    const response = await request(app)
      .get(`/api/materials/${materialId}`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data._id).toBe(materialId);
    expect(response.body.data.name).toBe("Steel Plate");
  });

  it("should update material by ID", async () => {
    const updateData = {
      unit_price: 600,
      minimum_stock: 15,
    };

    const response = await request(app)
      .put(`/api/materials/${materialId}`)
      .set("Authorization", `Bearer ${userToken}`)
      .send(updateData);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.unit_price).toBe(600);
    expect(response.body.data.minimum_stock).toBe(15);
  });

  it("should delete material by ID", async () => {
    const response = await request(app)
      .delete(`/api/materials/${materialId}`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    // Verify deletion
    const getResponse = await request(app)
      .get(`/api/materials/${materialId}`)
      .set("Authorization", `Bearer ${userToken}`);

    expect([404, 500]).toContain(getResponse.status);
  });

  it("should fail without authorization token", async () => {
    const response = await request(app)
      .get("/api/materials");

    expect([401, 500]).toContain(response.status);
  });
});
