import mongoose, { Schema, Document } from "mongoose";

export interface ICategory extends Document {
  name: string;
  description: string;
  image: string;
}

const CategorySchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
    image: { type: String, default: "" },
  },
  { timestamps: true },
);

export const Category = mongoose.model<ICategory>("Category", CategorySchema);
