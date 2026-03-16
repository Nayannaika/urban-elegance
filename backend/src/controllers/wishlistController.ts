import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { Wishlist } from "../models/Wishlist.js";
import { Product } from "../models/Product.js";

// @desc    Get user wishlist
// @route   GET /api/wishlist
// @access  Private
export const getWishlist = asyncHandler(async (req: Request, res: Response) => {
  const wishlist = await Wishlist.findOne({
    user: (req as any).user._id,
  }).populate("products", "name price images slug basePrice");
  if (!wishlist) {
    res.json({ products: [] });
  } else {
    res.json(wishlist);
  }
});

// @desc    Add product to wishlist
// @route   POST /api/wishlist
// @access  Private
export const addToWishlist = asyncHandler(
  async (req: Request, res: Response) => {
    const { productId } = req.body;
    const product = await Product.findById(productId);

    if (!product) {
      res.status(404);
      throw new Error("Product not found");
    }

    let wishlist = await Wishlist.findOne({ user: (req as any).user._id });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: (req as any).user._id,
        products: [productId],
      });
    } else {
      if (!wishlist.products.includes(productId)) {
        wishlist.products.push(productId);
        await wishlist.save();
      }
    }

    const updatedWishlist = await Wishlist.findById(wishlist._id).populate(
      "products",
      "name price images slug basePrice",
    );
    res.status(201).json(updatedWishlist);
  },
);

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
export const removeFromWishlist = asyncHandler(
  async (req: Request, res: Response) => {
    const wishlist = await Wishlist.findOne({ user: (req as any).user._id });

    if (!wishlist) {
      res.status(404);
      throw new Error("Wishlist not found");
    }

    wishlist.products = wishlist.products.filter(
      (id) => id.toString() !== req.params.productId,
    );

    await wishlist.save();

    const updatedWishlist = await Wishlist.findById(wishlist._id).populate(
      "products",
      "name price images slug basePrice",
    );
    res.json(updatedWishlist);
  },
);
