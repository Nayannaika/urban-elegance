import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { Cart } from "../models/Cart.js";
import { User } from "../models/User.js";
import { sendResponse } from "../utils/apiResponse.js";

// @desc    Create new order directly from user's Cart
// @route   POST /api/orders
// @access  Private
export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user._id;
  const { paymentMethod, shippingAddressIndex } = req.body;

  // 1. Get User's Cart
  const cart = await Cart.findOne({ user: userId }).populate(
    "items.product",
    "name price stock images size",
  );

  if (!cart || cart.items.length === 0) {
    res.status(400);
    throw new Error("No order items in cart");
  }

  // 2. Get User's Shipping Address based on index or default
  const user = await User.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Use provided index or default to the first address, or fallback to dummy
  const address =
    user.addresses && user.addresses.length > 0
      ? shippingAddressIndex !== undefined
        ? user.addresses[shippingAddressIndex]
        : user.addresses.find((a) => a.isDefault) || user.addresses[0]
      : {
          street: "N/A",
          city: "N/A",
          state: "N/A",
          zip: "N/A",
          country: "N/A",
        };

  // 3. Map Cart Items to Order Items & Calculate Totals
  const orderItems = [];
  let itemsPrice = 0;
  const outOfStockItems: string[] = [];

  for (const item of cart.items) {
    const productRecord = item.product as any;

    if (!productRecord) continue;

    // Check if enough stock exists
    if (productRecord.stock < item.quantity) {
      outOfStockItems.push(productRecord.name);
      continue;
    }

    const itemTotal = productRecord.price * item.quantity;
    itemsPrice += itemTotal;

    orderItems.push({
      product: productRecord._id,
      name: productRecord.name,
      image:
        productRecord.images && productRecord.images.length > 0
          ? productRecord.images[0]
          : "",
      price: productRecord.price,
      quantity: item.quantity,
      size: item.size,
    });
  }

  if (outOfStockItems.length > 0) {
    res.status(400);
    throw new Error(
      `Not enough stock for the following items: ${outOfStockItems.join(", ")}. Please adjust quantities or remove items.`,
    );
  }

  if (orderItems.length === 0) {
    res.status(400);
    throw new Error("Invalid items in cart");
  }

  // Calculate prices
  const taxPrice = Number((0.15 * itemsPrice).toFixed(2)); // Assuming 15% tax
  const shippingPrice = itemsPrice > 500 ? 0 : 50; // Free shipping over 500
  const totalPrice = itemsPrice + taxPrice + shippingPrice;

  // 4. Create the Order
  const order = new Order({
    user: userId,
    orderItems,
    shippingAddress: {
      street: address.street,
      city: address.city,
      state: address.state,
      zip: address.zip,
      country: address.country,
    },
    paymentMethod: paymentMethod || "Cash on Delivery",
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  });

  const createdOrder = await order.save();

  // 5. Deduct Stock from Products
  for (const item of orderItems) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: -item.quantity },
    });
  }

  // 6. Clear User's Cart
  cart.items = [];
  // Need to bypass Typescript mismatch if necessary, or just save
  await cart.save();

  res.status(201).json(createdOrder);
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user._id;

  const page = parseInt(req.query.page as string, 10) || 1;
  const limit = parseInt(req.query.limit as string, 10) || 10;
  const skip = (page - 1) * limit;

  const orders = await Order.find({ user: userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Order.countDocuments({ user: userId });
  const pages = Math.ceil(total / limit);

  sendResponse(res, 200, orders, "User orders retrieved", {
    page,
    limit,
    total,
    pages,
  });
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
export const getOrders = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string, 10) || 1;
  const limit = parseInt(req.query.limit as string, 10) || 10;
  const skip = (page - 1) * limit;

  const orders = await Order.find({})
    .populate("user", "name email")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Order.countDocuments({});
  const pages = Math.ceil(total / limit);

  sendResponse(res, 200, orders, "All orders retrieved", {
    page,
    limit,
    total,
    pages,
  });
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const { orderStatus } = req.body;

    // Validate order status against Schema enum
    const validStatuses = [
      "Processing",
      "Shipped",
      "Delivered",
      "Cancelled",
      "Return Request",
      "Returned",
    ];
    if (!validStatuses.includes(orderStatus)) {
      res.status(400);
      throw new Error("Invalid order status");
    }

    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email",
    );

    if (order) {
      const previousStatus = order.status;
      order.status = orderStatus;

      if (orderStatus === "Delivered") {
        order.isDelivered = true;
        order.deliveredAt = new Date();
        order.isPaid = true; // Assuming COD, it gets paid on delivery
        order.paidAt = new Date();
      }

      // If admin changed it to Returned (and it wasn't already), restore stock
      if (orderStatus === "Returned" && previousStatus !== "Returned") {
        for (const item of order.orderItems) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { stock: item.quantity },
          });
        }
      }

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404);
      throw new Error("Order not found");
    }
  },
);

// @desc    Refund an order
// @route   POST /api/orders/:id/refund
// @access  Private/Admin
export const refundOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    if (order.status !== "Returned" && order.status !== "Cancelled") {
      res.status(400);
      throw new Error("Only returned or cancelled orders can be refunded");
    }

    // In a real app, you'd call a payment gateway here.
    // For this app, we'll just return success.

    res.json({ message: "Refund processed successfully", order });
  } else {
    res.status(404);
    throw new Error("Order not found");
  }
});

// @desc    Cancel an order
// @route   PUT /api/orders/:id/cancel
// @access  Private
export const cancelOrder = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user._id;
  const order = await Order.findById(req.params.id);

  if (order) {
    if (order.user.toString() !== userId.toString()) {
      res.status(403);
      throw new Error("Not authorized to cancel this order");
    }

    if (order.status !== "Processing") {
      res.status(400);
      throw new Error("Only orders in 'Processing' status can be cancelled");
    }

    order.status = "Cancelled";
    const updatedOrder = await order.save();

    // Restore stock
    for (const item of order.orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity },
      });
    }

    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error("Order not found");
  }
});

// @desc    Return an order
// @route   PUT /api/orders/:id/return
// @access  Private
export const returnOrder = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user._id;
  const order = await Order.findById(req.params.id);

  if (order) {
    if (order.user.toString() !== userId.toString()) {
      res.status(403);
      throw new Error("Not authorized to return this order");
    }

    if (order.status !== "Delivered") {
      res.status(400);
      throw new Error("Only delivered orders can be returned");
    }

    order.status = "Return Request";
    const updatedOrder = await order.save();

    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error("Order not found");
  }
});
