import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { connectDB } from "./src/database/db";
import usrermodel from "./models/user.models";

const users = [
  {
    name: "Kiran Rana",
    email: "kiranrana@softwarica.edu.np",
    password: "password123",
    phoneNumber: "+977-9801234500",
  },
];

const seed = async () => {
  try {
    await connectDB();
    await User.deleteMany();
    await User.insertMany(users);

    console.log("Data seeded successfully");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seed();
