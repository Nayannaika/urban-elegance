import { Request, Response } from "express";
import { User } from "../models/User.js";
import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import asyncHandler from "express-async-handler";

export const getDashboardOverview = asyncHandler(
  async (req: Request, res: Response) => {
    const totalUsers = await User.countDocuments({});
    const activeUsers = await User.countDocuments({ status: "active" });
    const totalProducts = await Product.countDocuments({});
    const totalOrders = await Order.countDocuments({});

    const orders = await Order.find({ paymentStatus: "completed" });
    const revenue = orders.reduce((acc, order) => acc + order.totalPrice, 0);

    res.json({
      totalUsers,
      activeUsers,
      totalProducts,
      totalOrders,
      revenue,
    });
  },
);

export const getSalesChartData = asyncHandler(
  async (req: Request, res: Response) => {
    // Aggregate revenue by day (naive approach for small datasets)
    const salesData = await Order.aggregate([
      { $match: { paymentStatus: "completed" } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          totalSales: { $sum: "$totalPrice" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json(salesData);
  },
);

export const getTopProducts = asyncHandler(
  async (req: Request, res: Response) => {
    // For now we get generic products since Mongoose order structure requires
    // deep population of order items to figure exact counts natively via aggregate.
    // We will just fetch `isFeatured` products or random items as Top Products temporarily unless specific schema tracking is available.
    const topProducts = await Product.find({}).limit(5);
    res.json(topProducts);
  },
);
