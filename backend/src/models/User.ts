import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: "user" | "admin";
  deviceIp?: string;
  status: "active" | "blocked";
  refreshToken?: string;
  isTwoFactorEnabled: boolean;
  twoFactorSecret?: string;
  phone?: string;
  addresses: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    isDefault: boolean;
  }[];
  savedCards: {
    cardHolder: string;
    last4: string;
    expiry: string;
    brand: string;
    isDefault: boolean;
  }[];
  giftCardBalance: number;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    deviceIp: { type: String },
    status: { type: String, enum: ["active", "blocked"], default: "active" },
    refreshToken: { type: String },
    isTwoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String },
    phone: { type: String },
    addresses: [
      {
        street: { type: String },
        city: { type: String },
        state: { type: String },
        zip: { type: String },
        country: { type: String },
        isDefault: { type: Boolean, default: false },
      },
    ],
    savedCards: [
      {
        cardHolder: { type: String },
        last4: { type: String },
        expiry: { type: String },
        brand: { type: String },
        isDefault: { type: Boolean, default: false },
      },
    ],
    giftCardBalance: { type: Number, default: 0 },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
  },
  { timestamps: true },
);

export const User = mongoose.model<IUser>("User", UserSchema);
