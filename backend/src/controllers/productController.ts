import { Request, Response } from "express";
import { Product } from "../models/Product.js";
import { Review } from "../models/Review.js";
import "../models/Category.js"; // side-effect import to register schema
import asyncHandler from "express-async-handler";
import { sendResponse } from "../utils/apiResponse.js";

export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  const {
    category,
    brand,
    isFeatured,
    isNewArrival,
    sort,
    fields,
    page,
    limit,
  } = req.query;
  const filter: any = {};
  if (category) filter.category = category;
  if (brand) filter.brand = brand;
  if (isFeatured) filter.isFeatured = isFeatured === "true";
  if (isNewArrival) filter.isNewArrival = isNewArrival === "true";

  let query = Product.find(filter).populate("category", "name");

  // Sorting
  if (sort) {
    const sortBy = (sort as string).split(",").join(" ");
    query = query.sort(sortBy);
  } else {
    query = query.sort("-createdAt");
  }

  // Field Limiting
  if (fields) {
    const fieldsToSelect = (fields as string).split(",").join(" ");
    query = query.select(fieldsToSelect);
  } else {
    query = query.select("-__v");
  }

  // Pagination
  const pageNum = parseInt(page as string, 10) || 1;
  const limitNum = parseInt(limit as string, 10) || 10;
  const skip = (pageNum - 1) * limitNum;

  query = query.skip(skip).limit(limitNum);

  const products = await query;
  const total = await Product.countDocuments(filter);
  const pages = Math.ceil(total / limitNum);

  sendResponse(res, 200, products, "Products retrieved successfully", {
    page: pageNum,
    limit: limitNum,
    total,
    pages,
  });
});

export const getProductById = asyncHandler(
  async (req: Request, res: Response) => {
    const product = await Product.findById(req.params.id).populate(
      "category",
      "name",
    );
    if (product) {
      res.json(product);
    } else {
      res.status(404);
      throw new Error("Product not found");
    }
  },
);

export const createProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      name,
      description,
      price,
      category,
      images,
      stock,
      sizes,
      colors,
      brand,
      isFeatured,
      isNewArrival,
    } = req.body;
    const product = await Product.create({
      name,
      description,
      price,
      category,
      images,
      stock,
      sizes,
      colors,
      brand,
      isFeatured,
      isNewArrival,
    });
    if (product) {
      res.status(201).json(product);
    } else {
      res.status(400);
      throw new Error("Invalid product data");
    }
  },
);

export const updateProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const product = await Product.findById(req.params.id);
    if (product) {
      Object.assign(product, req.body);
      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404);
      throw new Error("Product not found");
    }
  },
);

export const deleteProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const product = await Product.findById(req.params.id);
    if (product) {
      await product.deleteOne();
      res.json({ message: "Product removed" });
    } else {
      res.status(404);
      throw new Error("Product not found");
    }
  },
);

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
export const createProductReview = asyncHandler(
  async (req: Request, res: Response) => {
    const { rating, comment } = req.body;
    const userId = (req as any).user._id;
    const userName = (req as any).user.name;

    const product = await Product.findById(req.params.id);

    if (product) {
      const alreadyReviewed = product.reviews.find(
        (r) => r.user.toString() === userId.toString(),
      );

      if (alreadyReviewed) {
        res.status(400);
        throw new Error("Product already reviewed");
      }

      const review = {
        name: userName,
        rating: Number(rating),
        comment,
        user: userId,
      } as any; // Cast as any to satisfy type temporarily, or rely on mongoose

      product.reviews.push(review);
      product.numReviews = product.reviews.length;
      product.rating =
        product.reviews.reduce((acc, item) => item.rating + acc, 0) /
        product.reviews.length;

      await product.save();

      // Also create a separate Review document for tracking in "My Reviews"
      await Review.create({
        user: userId,
        product: product._id,
        rating: Number(rating),
        comment,
      });

      res.status(201).json({ message: "Review added" });
    } else {
      res.status(404);
      throw new Error("Product not found");
    }
  },
);
