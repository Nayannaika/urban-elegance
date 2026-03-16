import express from "express";
import {
  authUser,
  registerUser,
  refreshAuth,
  logoutUser,
  getUsers,
  blockUser,
  deleteUser,
  getUserProfile,
  updateUserProfile,
  forgotPassword,
  resetPassword,
} from "../controllers/userController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/login", authUser);
router.post("/register", registerUser);
router.post("/refresh", refreshAuth);
router.post("/logout", logoutUser);
router.post("/forgotpassword", forgotPassword);
router.put("/resetpassword/:resettoken", resetPassword);

// Profile routes
router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// Admin Routes
router.route("/").get(protect, admin, getUsers);
router.route("/:id/block").put(protect, admin, blockUser);
router.route("/:id").delete(protect, admin, deleteUser);

export default router;
