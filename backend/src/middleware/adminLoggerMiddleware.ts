import asyncHandler from "express-async-handler";
import { Response, NextFunction } from "express";
import { AuthRequest } from "./authMiddleware.js";
import { AdminLog } from "../models/AdminLog.js";

export const adminLogger = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    // Only log if the user is an admin
    if (req.user && req.user.role === "admin") {
      const action = req.method;
      const endpoint = req.originalUrl;
      const ipAddress = req.ip || req.connection.remoteAddress || "";

      // We log the data asynchronously so it doesn't block the request response cycle
      AdminLog.create({
        adminId: req.user._id,
        action,
        endpoint,
        ipAddress,
        details: JSON.stringify(req.body), // Beware of logging sensitive data in prod!
      }).catch((err) => {
        console.error("Failed to log admin action:", err);
      });
    }

    next();
  },
);
