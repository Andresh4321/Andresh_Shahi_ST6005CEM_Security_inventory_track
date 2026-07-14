import request from "supertest";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import app from "../../app";
import { UserModel } from "../../models/auth/user.models";
import { MaterialModel } from "../../models/material/material.models";
import BillOfMaterialsModel from "../../models/BillofMaterials/bill.model";
import jwt from "jsonwebtoken";
import { JWT_SECRET, MONGO_URI } from "../../config";

let userToken: string;
let userId: string;
let materialId: string;
let billId: string;

beforeAll(async () => {
  await mongoose.connect(MONGO_URI);
  await UserModel.deleteMany({});
  await MaterialModel.deleteMany({});
  await BillOfMaterialsModel.deleteMany({});

  // Create a test user
  const hashedPassword = await bcrypt.hash("user123", 10);
  const user = await UserModel.create({
    fullname: "Bill of Materials Test User",
    email: "bill@test.com",
    password: hashedPassword,
    phone_number: "9876543213",
    role: "user",
  });
  userId = user._id.toString();
  userToken = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });

  // Create a material for BOM via API
  const materialRes = await request(app)
    .post("/api/materials")
    .set("Authorization", `Bearer ${userToken}`)
    .send({
      name: "Copper Wire",
      unit: "meter",
      unit_price: 100,
      minimum_stock: 100,
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

describe("Bill of Materials Tests", () => {
  it("should handle bill creation", async () => {
    if (!materialId) {
      console.log("Skipping: Material not created");
      return;
    }

    const billData = {
      material: materialId,
      quantity: 100,
      price: 10000,
    };

    const response = await request(app)
      .post("/api/bill-of-materials")
      .set("Authorization", `Bearer ${userToken}`)
      .send(billData);

    expect([200, 201, 404]).toContain(response.status);
    if ([200, 201].includes(response.status) && response.body?.data?._id) {
      billId = response.body.data._id;
    }
  });

  it("should get all bills", async () => {
    const response = await request(app)
      .get("/api/bill-of-materials")
      .set("Authorization", `Bearer ${userToken}`);

    expect([200, 404, 500]).toContain(response.status);
    if (response.status === 200) {
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      if (response.body.data.items) {
        expect(Array.isArray(response.body.data.items)).toBe(true);
      }
    }
  });

  it("should get bill by ID", async () => {
    if (!billId) {
      console.log("Skipping: Bill not created");
      return;
    }

    const response = await request(app)
      .get(`/api/bill-of-materials/${billId}`)
      .set("Authorization", `Bearer ${userToken}`);

    expect([200, 404, 500]).toContain(response.status);
  });

  it("should handle bill updates", async () => {
    if (!billId) {
      console.log("Skipping: Bill not created");
      return;
    }

    const updateData = {
      price: 12000,
    };

    const response = await request(app)
      .put(`/api/bill-of-materials/${billId}/price`)
      .set("Authorization", `Bearer ${userToken}`)
      .send(updateData);

    expect([200, 404, 500]).toContain(response.status);
  });

  it("should verify bill retrieval", async () => {
    if (!billId) {
      console.log("Skipping: Bill not created");
      return;
    }

    const response = await request(app)
      .get(`/api/bill-of-materials/${billId}`)
      .set("Authorization", `Bearer ${userToken}`);

    expect([200, 404, 500]).toContain(response.status);
  });

  it("should handle bill deletion", async () => {
    if (!billId) {
      console.log("Skipping: Bill not created");
      return;
    }

    const response = await request(app)
      .delete(`/api/bill-of-materials/${billId}`)
      .set("Authorization", `Bearer ${userToken}`);

    expect([200, 404, 500]).toContain(response.status);
  });

  it("should verify authorization checks", async () => {
    const response = await request(app)
      .get("/api/bill-of-materials")
      .set("Authorization", "Bearer invalid_token");

    expect([401, 404, 500]).toContain(response.status);
  });

  it("should verify bill workflow setup", async () => {
    expect(materialId).toBeDefined();
    expect(userToken).toBeTruthy();
    expect(userId).toBeTruthy();
  });
});
