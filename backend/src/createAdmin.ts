import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "./models/User.js";
import bcrypt from "bcryptjs";

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/urban-elegance",
    );
    console.log("MongoDB Connected...");

    const email = "admin@urbanelegance.com";
    const password = process.env.ADMIN_PASSWORD || "adminpassword123!";

    const userExists = await User.findOne({ email });
    if (userExists) {
      console.log("Admin already exists!");
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    await User.create({
      name: "Super Admin",
      email,
      passwordHash,
      role: "admin",
      status: "active",
      isTwoFactorEnabled: false,
    });

    console.log("Admin user created successfully!");
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);

    process.exit();
  } catch (error) {
    console.error(`Error: ${error}`);
    process.exit(1);
  }
};

createAdmin();
