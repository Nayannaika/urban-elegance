import { Request, Response } from "express";
import { Review } from "../models/Review.js";
import asyncHandler from "express-async-handler";

// @desc    Create new review
// @route   POST /api/reviews
// @access  Private
export const createReview = asyncHandler(
  async (req: Request, res: Response) => {
    const { rating, comment, product } = req.body;

    const review = new Review({
      user: (req as any).user._id,
      product,
      rating,
      comment,
    });

    const createdReview = await review.save();
    res.status(201).json(createdReview);
  },
);

// @desc    Get logged in user reviews
// @route   GET /api/reviews/myreviews
// @access  Private
export const getMyReviews = asyncHandler(
  async (req: Request, res: Response) => {
    const reviews = await Review.find({ user: (req as any).user._id })
      .populate("product", "name images")
      .sort({ createdAt: -1 });

    res.json(reviews);
  },
);
