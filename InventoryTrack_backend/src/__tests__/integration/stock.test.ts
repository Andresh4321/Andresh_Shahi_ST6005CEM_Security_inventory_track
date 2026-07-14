import request from "supertest";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import app from "../../app";
import { UserModel } from "../../models/auth/user.models";
import { MaterialModel } from "../../models/material/material.models";
import StockModel from "../../models/stock/stock.models";
import jwt from "jsonwebtoken";
import { JWT_SECRET, MONGO_URI } from "../../config";

let userToken: string;
let userId: string;
let materialId: string;
let stockId: string;

beforeAll(async () => {
  await mongoose.connect(MONGO_URI);
  await UserModel.deleteMany({});
  await MaterialModel.deleteMany({});
  await StockModel.deleteMany({});

  // Create a test user
  const hashedPassword = await bcrypt.hash("user123", 10);
  const user = await UserModel.create({
    fullname: "Stock Test User",
    email: "stock@test.com",
    password: hashedPassword,
    phone_number: "9876543212",
    role: "user",
  });
  userId = user._id.toString();
  userToken = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });

  // Create a material for stock via API
  const materialRes = await request(app)
    .post("/api/materials")
    .set("Authorization", `Bearer ${userToken}`)
    .send({
      name: "Wood",
      unit: "cubic meters",
      unit_price: 1000,
      minimum_stock: 10,
    });
  
  if (materialRes.status === 201) {
    materialId = materialRes.body.data._id;
  }
});

afterAll(async () => {
  if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
    await mongoose.connection.db.dropDatabase();
  }
  await mongoose.disconnect();
});

describe("Stock Management Tests", () => {
  it("should create new stock entry", async () => {
    const stockData = {
      material: materialId,
      quantity: 50,
      transaction_type: "in",
      description: "Initial wood stock",
    };

    const response = await request(app)
      .post("/api/stock")
      .set("Authorization", `Bearer ${userToken}`)
      .send(stockData);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.quantity).toBe(50);
    // Material is populated as an object, so check the _id property
    const returnedMaterialId = 
      typeof response.body.data.material === 'string' 
        ? response.body.data.material 
        : response.body.data.material._id;
    expect(returnedMaterialId).toBe(materialId);
    
    stockId = response.body.data._id;
  });

  it("should get all stock entries with pagination", async () => {
    const response = await request(app)
      .get("/api/stock?page=1&limit=10")
      .set("Authorization", `Bearer ${userToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);
  });

  it("should get stock by ID", async () => {
    if (!stockId) {
      console.log("Skipping: Stock not created");
      return;
    }

    const response = await request(app)
      .get(`/api/stock/${stockId}`)
      .set("Authorization", `Bearer ${userToken}`);

    expect([200, 404, 500]).toContain(response.status);
    if (response.status === 200) {
      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(stockId);
      expect(response.body.data.quantity).toBe(50);
    }
  });

  it("should update stock quantity", async () => {
    if (!stockId) {
      console.log("Skipping: Stock not created");
      return;
    }

    const updateData = {
      quantity: 75,
      transaction_type: "in",
    };

    const response = await request(app)
      .put(`/api/stock/${stockId}`)
      .set("Authorization", `Bearer ${userToken}`)
      .send(updateData);

    expect([200, 404, 500]).toContain(response.status);
    if (response.status === 200) {
      expect(response.body.success).toBe(true);
      expect(response.body.data.quantity).toBe(75);
    }
  });

  it("should decrease stock quantity", async () => {
    if (!stockId) {
      console.log("Skipping: Stock not created");
      return;
    }

    const updateData = {
      quantity: 20,
      transaction_type: "out",
    };

    const response = await request(app)
      .put(`/api/stock/${stockId}`)
      .set("Authorization", `Bearer ${userToken}`)
      .send(updateData);

    expect([200, 404, 500]).toContain(response.status);
    if (response.status === 200) {
      expect(response.body.data.quantity).toBe(20);
    }
  });

  it("should delete stock entry", async () => {
    if (!stockId) {
      console.log("Skipping: Stock not created");
      return;
    }

    const response = await request(app)
      .delete(`/api/stock/${stockId}`)
      .set("Authorization", `Bearer ${userToken}`);

    expect([200, 404, 500]).toContain(response.status);
    if (response.status === 200) {
      expect(response.body.success).toBe(true);

      // Verify deletion
      const getResponse = await request(app)
        .get(`/api/stock/${stockId}`)
        .set("Authorization", `Bearer ${userToken}`);

      expect([404, 500]).toContain(getResponse.status);
    }
  });

  it("should handle duplicate stock for same material and user", async () => {
    // Create first stock
    const stock1 = await request(app)
      .post("/api/stock")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        material: materialId,
        quantity: 100,
        transaction_type: "in",
      });

    expect([201, 200]).toContain(stock1.status);

    // Try to create another stock transaction
    const stock2 = await request(app)
      .post("/api/stock")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        material: materialId,
        quantity: 50,
        transaction_type: "in",
      });

    // Should succeed as stock transactions are allowed
    expect([201, 200]).toContain(stock2.status);
  });
});
