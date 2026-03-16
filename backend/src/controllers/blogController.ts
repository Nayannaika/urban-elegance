import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { Blog } from "../models/Blog.js";
import { sendResponse } from "../utils/apiResponse.js";

// @desc    Get all blogs (with pagination, sorting, field limiting)
// @route   GET /api/blogs
// @access  Public
export const getBlogs = asyncHandler(async (req: Request, res: Response) => {
  const { sort, fields, page, limit, isPublished } = req.query;

  const filter: any = {};
  // By default, public should only see published unless otherwise specified (and checked by auth, ideally)
  if (isPublished !== undefined) {
    filter.isPublished = isPublished === "true";
  } else {
    filter.isPublished = true;
  }

  let query = Blog.find(filter).populate("author", "name email");

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

  const blogs = await query;
  const total = await Blog.countDocuments(filter);
  const pages = Math.ceil(total / limitNum);

  sendResponse(res, 200, blogs, "Blogs retrieved successfully", {
    page: pageNum,
    limit: limitNum,
    total,
    pages,
  });
});

// @desc    Get single blog by slug or ID
// @route   GET /api/blogs/:id
// @access  Public
export const getBlogById = asyncHandler(async (req: Request, res: Response) => {
  const blog = await Blog.findById(req.params.id).populate(
    "author",
    "name email",
  );

  if (blog) {
    sendResponse(res, 200, blog, "Blog retrieved successfully");
  } else {
    res.status(404);
    throw new Error("Blog not found");
  }
});

// @desc    Create a blog
// @route   POST /api/blogs
// @access  Private/Admin
export const createBlog = asyncHandler(async (req: Request, res: Response) => {
  const { title, slug, content, tags, coverImage, isPublished } = req.body;

  const blog = new Blog({
    title,
    slug,
    content,
    tags,
    coverImage,
    isPublished,
    author: (req as any).user._id,
  });

  const createdBlog = await blog.save();
  sendResponse(res, 201, createdBlog, "Blog created successfully");
});

// @desc    Update a blog
// @route   PUT /api/blogs/:id
// @access  Private/Admin
export const updateBlog = asyncHandler(async (req: Request, res: Response) => {
  const blog = await Blog.findById(req.params.id);

  if (blog) {
    Object.assign(blog, req.body);
    const updatedBlog = await blog.save();
    sendResponse(res, 200, updatedBlog, "Blog updated successfully");
  } else {
    res.status(404);
    throw new Error("Blog not found");
  }
});

// @desc    Delete a blog
// @route   DELETE /api/blogs/:id
// @access  Private/Admin
export const deleteBlog = asyncHandler(async (req: Request, res: Response) => {
  const blog = await Blog.findById(req.params.id);

  if (blog) {
    await blog.deleteOne();
    sendResponse(res, 200, null, "Blog removed successfully");
  } else {
    res.status(404);
    throw new Error("Blog not found");
  }
});
