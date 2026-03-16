import express from "express";
import { createReview, getMyReviews } from "../controllers/reviewController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").post(protect, createReview);
router.route("/myreviews").get(protect, getMyReviews);

export default router;
