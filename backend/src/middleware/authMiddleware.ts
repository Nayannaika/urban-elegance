import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import { Request, Response, NextFunction } from "express";
import { User, IUser } from "../models/User.js";

export interface AuthRequest extends Request {
  user?: IUser;
}

export const protect = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      try {
        token = req.headers.authorization.split(" ")[1];
        if (!process.env.JWT_SECRET) {
          console.warn("JWT_SECRET is not defined! Using default secret.");
        }
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET || "secret",
        ) as { id: string };

        req.user = (await User.findById(decoded.id).select(
          "-passwordHash",
        )) as IUser;
        next();
      } catch (error) {
        res.status(401);
        throw new Error("Not authorized, token failed");
      }
    }

    if (!token) {
      res.status(401);
      throw new Error("Not authorized, no token");
    }
  },
);

export const admin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403);
    throw new Error("Not authorized as an admin");
  }
};
