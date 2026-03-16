import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { Cart } from "../models/Cart.js";
import { Product } from "../models/Product.js";

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
export const getCart = asyncHandler(async (req: Request, res: Response) => {
  const cart = await Cart.findOne({ user: (req as any).user._id }).populate(
    "items.product",
    "name price images slug",
  );
  if (!cart) {
    res.json({ items: [] });
  } else {
    res.json(cart);
  }
});

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
export const addToCart = asyncHandler(async (req: Request, res: Response) => {
  const { productId, quantity, size } = req.body;
  const product = await Product.findById(productId);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  let cart = await Cart.findOne({ user: (req as any).user._id });

  if (!cart) {
    cart = await Cart.create({
      user: (req as any).user._id,
      items: [{ product: productId, quantity: quantity || 1, size }],
    });
  } else {
    // Check if product with same size already in cart
    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId && item.size === size,
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity || 1;
    } else {
      cart.items.push({
        product: productId,
        quantity: quantity || 1,
        size,
      } as any);
    }
    await cart.save();
  }

  const updatedCart = await Cart.findById(cart._id).populate(
    "items.product",
    "name price images slug",
  );
  res.status(201).json(updatedCart);
});

// @desc    Update cart item quantity
// @route   PUT /api/cart/:itemId
// @access  Private
export const updateCartItem = asyncHandler(
  async (req: Request, res: Response) => {
    const { quantity } = req.body;
    const cart = await Cart.findOne({ user: (req as any).user._id });

    if (!cart) {
      res.status(404);
      throw new Error("Cart not found");
    }

    const itemIndex = cart.items.findIndex(
      (item) => (item as any)._id.toString() === req.params.itemId,
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity = quantity;
      if (cart.items[itemIndex].quantity <= 0) {
        cart.items.splice(itemIndex, 1);
      }
      await cart.save();

      const updatedCart = await Cart.findById(cart._id).populate(
        "items.product",
        "name price images slug",
      );
      res.json(updatedCart);
    } else {
      res.status(404);
      throw new Error("Item not found in cart");
    }
  },
);

// @desc    Remove item from cart
// @route   DELETE /api/cart/:itemId
// @access  Private
export const removeFromCart = asyncHandler(
  async (req: Request, res: Response) => {
    const cart = await Cart.findOne({ user: (req as any).user._id });

    if (!cart) {
      res.status(404);
      throw new Error("Cart not found");
    }

    cart.items = cart.items.filter(
      (item) => (item as any)._id.toString() !== req.params.itemId,
    );

    await cart.save();

    const updatedCart = await Cart.findById(cart._id).populate(
      "items.product",
      "name price images slug",
    );
    res.json(updatedCart);
  },
);
