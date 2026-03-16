import mongoose, { Schema, Document } from "mongoose";

export interface IReview extends Document {
  user: mongoose.Types.ObjectId;
  name: string;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  category: mongoose.Types.ObjectId;
  images: string[];
  stock: number;
  sizes: string[];
  colors: string[];
  brand: string;
  isFeatured: boolean;
  isNewArrival: boolean;
  reviews: IReview[];
  rating: number;
  numReviews: number;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
  },
  { timestamps: true },
);

const ProductSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, default: 0 },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    images: [{ type: String }],
    stock: { type: Number, required: true, default: 0 },
    sizes: [{ type: String }],
    colors: [{ type: String }],
    brand: { type: String },
    isFeatured: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    reviews: [ReviewSchema],
    rating: { type: Number, required: true, default: 0 },
    numReviews: { type: Number, required: true, default: 0 },
  },
  { timestamps: true },
);

export const Product = mongoose.model<IProduct>("Product", ProductSchema);
