import express from "express";
import {
  getActiveBanners,
  getAllBanners,
  createBanner,
  updateBanner,
  deleteBanner,
} from "../controllers/bannerController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public route for home screen
router.route("/").get(getActiveBanners);

// Admin routes
router.route("/all").get(protect, admin, getAllBanners);
router.route("/").post(protect, admin, createBanner);
router
  .route("/:id")
  .put(protect, admin, updateBanner)
  .delete(protect, admin, deleteBanner);

export default router;
