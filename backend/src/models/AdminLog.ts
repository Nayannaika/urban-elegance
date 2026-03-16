import mongoose, { Schema, Document } from "mongoose";

export interface IAdminLog extends Document {
  adminId: mongoose.Types.ObjectId;
  action: string;
  endpoint: string;
  ipAddress?: string;
  details?: string;
  createdAt: Date;
}

const AdminLogSchema = new Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    action: {
      type: String,
      required: true,
    },
    endpoint: {
      type: String,
      required: true,
    },
    ipAddress: {
      type: String,
    },
    details: {
      type: String,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const AdminLog = mongoose.model<IAdminLog>("AdminLog", AdminLogSchema);
