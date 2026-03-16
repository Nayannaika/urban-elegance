import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { User } from "./models/User.js";

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/urban-elegance",
    );
    console.log("MongoDB Connected. Checking for Admin user...");

    // Check if admin already exists
    const adminExists = await User.findOne({
      email: "admin@urbanelegance.com",
    });

    if (!adminExists) {
      const adminPassword = await bcrypt.hash("admin123", 10);
      await User.create({
        name: "Admin",
        email: "admin@urbanelegance.com",
        passwordHash: adminPassword,
        role: "admin",
        status: "active",
      });
      console.log("Admin user seeded successfully!");
    } else {
      console.log("Admin user already exists. Skipping seed.");
    }

    process.exit();
  } catch (error) {
    console.error(`Error: ${error}`);
    process.exit(1);
  }
};

seedAdmin();
