import request from "supertest";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import app from "../../app";
import { UserModel } from "../../models/auth/user.models";
import { MaterialModel } from "../../models/material/material.models";
import { RecipeModel } from "../../models/ingredients/ingredients.models";
import jwt from "jsonwebtoken";
import { JWT_SECRET, MONGO_URI } from "../../config";

let userToken: string;
let userId: string;
let materialId: string;
let recipeId: string;

beforeAll(async () => {
  await mongoose.connect(MONGO_URI);
  await UserModel.deleteMany({});
  await MaterialModel.deleteMany({});
  await RecipeModel.deleteMany({});

  // Create a test user
  const hashedPassword = await bcrypt.hash("user123", 10);
  const user = await UserModel.create({
    fullname: "Ingredients Test User",
    email: "ingredients@test.com",
    password: hashedPassword,
    phone_number: "9876543211",
    role: "user",
  });
  userId = user._id.toString();
  userToken = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });

  // Create a material for recipe via API
  const materialRes = await request(app)
    .post("/api/materials")
    .set("Authorization", `Bearer ${userToken}`)
    .send({
      name: "Flour",
      unit: "kg",
      unit_price: 50,
      minimum_stock: 5,
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

describe("Ingredients/Recipe Management Tests", () => {
  it("should create a new recipe with ingredients", async () => {
    const recipeData = {
      name: "Chocolate Cake",
      description: "Delicious chocolate cake with rich flavor",
      selling_price: 500,
      ingredients: [
        {
          name: "Flour",
          material: materialId,
          quantity: 2,
        },
      ],
    };

    const response = await request(app)
      .post("/api/recipes")
      .set("Authorization", `Bearer ${userToken}`)
      .send(recipeData);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.name).toBe("Chocolate Cake");
    expect(response.body.data.selling_price).toBe(500);
    expect(response.body.data.ingredients.length).toBe(1);
    
    recipeId = response.body.data._id;
  });

  it("should get all recipes with pagination", async () => {
    // Create another recipe
    await request(app)
      .post("/api/recipes")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        name: "Vanilla Cake",
        description: "Simple vanilla cake",
        selling_price: 400,
        ingredients: [
          {
            name: "Flour",
            material: materialId,
            quantity: 1.5,
          },
        ],
      });

    const response = await request(app)
      .get("/api/recipes?page=1&limit=10")
      .set("Authorization", `Bearer ${userToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);
  });

  it("should get recipe by ID", async () => {
    const response = await request(app)
      .get(`/api/recipes/${recipeId}`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data._id).toBe(recipeId);
    expect(response.body.data.name).toBe("Chocolate Cake");
  });

  it("should update recipe by ID", async () => {
    const updateData = {
      selling_price: 600,
      description: "Updated chocolate cake recipe",
    };

    const response = await request(app)
      .put(`/api/recipes/${recipeId}`)
      .set("Authorization", `Bearer ${userToken}`)
      .send(updateData);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.selling_price).toBe(600);
    expect(response.body.data.description).toBe("Updated chocolate cake recipe");
  });

  it("should delete recipe by ID", async () => {
    const response = await request(app)
      .delete(`/api/recipes/${recipeId}`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    // Verify deletion
    const getResponse = await request(app)
      .get(`/api/recipes/${recipeId}`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(getResponse.status).toBe(404);
  });

  it("should fail to create recipe without required fields", async () => {
    const invalidData = {
      name: "Incomplete Recipe",
      // missing selling_price
    };

    const response = await request(app)
      .post("/api/recipes")
      .set("Authorization", `Bearer ${userToken}`)
      .send(invalidData);

    expect(response.status).toBe(400);
  });
});
