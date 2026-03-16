import express from "express";
import {
  getDashboardOverview,
  getSalesChartData,
  getTopProducts,
} from "../controllers/analyticsController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/overview").get(protect, admin, getDashboardOverview);
router.route("/sales-chart").get(protect, admin, getSalesChartData);
router.route("/top-products").get(protect, admin, getTopProducts);

export default router;
