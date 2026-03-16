import express from "express";
import {
  createOrder,
  getMyOrders,
  getOrders,
  updateOrderStatus,
  cancelOrder,
  returnOrder,
  refundOrder,
} from "../controllers/orderController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").post(protect, createOrder).get(protect, admin, getOrders);
router.route("/myorders").get(protect, getMyOrders);
router.route("/:id/status").put(protect, admin, updateOrderStatus);
router.route("/:id/cancel").put(protect, cancelOrder);
router.route("/:id/return").put(protect, returnOrder);
router.route("/:id/refund").post(protect, admin, refundOrder);

export default router;
