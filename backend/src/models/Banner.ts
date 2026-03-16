import mongoose, { Document, Schema } from "mongoose";

export interface IBanner extends Document {
  imageUrl: string;
  link?: string;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const bannerSchema = new Schema<IBanner>(
  {
    imageUrl: { type: String, required: true },
    link: { type: String, required: false },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

const Banner = mongoose.model<IBanner>("Banner", bannerSchema);

export default Banner;
