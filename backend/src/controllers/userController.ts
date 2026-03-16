import { Request, Response } from "express";
import { User } from "../models/User.js";
import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import speakeasy from "speakeasy";
import qrcode from "qrcode";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";

const generateAccessToken = (id: string, role: string) => {
  if (!process.env.JWT_SECRET) {
    console.warn("JWT_SECRET is not defined! Using default secret.");
  }
  return jwt.sign({ id, role }, process.env.JWT_SECRET || "secret", {
    expiresIn: "15m",
  });
};

const generateRefreshToken = (id: string) => {
  if (!process.env.JWT_REFRESH_SECRET) {
    console.warn("JWT_REFRESH_SECRET is not defined! Using default refresh secret.");
  }
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET || "refresh_secret", {
    expiresIn: "7d",
  });
};

const setRefreshTokenCookie = (res: Response, token: string) => {
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // true in prod
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

export const registerUser = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, email, password, role, phone } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error("User already exists");
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      passwordHash,
      role: role || "user",
      status: "active",
      phone,
    });
    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      });
    } else {
      res.status(400);
      throw new Error("Invalid user data");
    }
  },
);

export const authUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, twoFactorToken } = req.body;
  const user = await User.findOne({ email });

  if (user && (await bcrypt.compare(password, user.passwordHash))) {
    if (user.status === "blocked") {
      res.status(403);
      throw new Error("User is blocked");
    }

    if (user.role === "admin") {
      // IP Whitelisting
      const whitelist = process.env.ADMIN_IPS
        ? process.env.ADMIN_IPS.split(",")
        : ["::1", "127.0.0.1"];
      const incomingIp = req.ip || req.connection.remoteAddress || "";
      // Weak check for local dev, in production use strict CIDR or exact matching
      if (!whitelist.some((ip) => incomingIp.includes(ip) || ip === "*")) {
        res.status(403);
        throw new Error("Admin login not allowed from this IP");
      }

      // 2FA Flow
      if (twoFactorToken) {
        const verified = speakeasy.totp.verify({
          secret: user.twoFactorSecret || "",
          encoding: "base32",
          token: twoFactorToken,
        });

        if (!verified) {
          res.status(401);
          throw new Error("Invalid 2FA token");
        }

        if (!user.isTwoFactorEnabled) {
          user.isTwoFactorEnabled = true;
          await user.save();
        }
      } else {
        if (user.isTwoFactorEnabled) {
          res.json({
            requires2FA: true,
            message: "Please provide your 2FA token",
          });
          return;
        } else {
          // Setup 2FA for the first time
          const secret = speakeasy.generateSecret();
          user.twoFactorSecret = secret.base32;
          await user.save();

          // Generate QR code
          const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url || "");
          res.json({
            setup2FA: true,
            qrCodeUrl,
            message: "Please set up 2FA using this QR code",
          });
          return;
        }
      }
    }

    const accessToken = generateAccessToken(user._id.toString(), user.role);
    const refreshToken = generateRefreshToken(user._id.toString());

    user.refreshToken = refreshToken;
    await user.save();

    setRefreshTokenCookie(res, refreshToken);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: accessToken,
    });
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
});

export const refreshAuth = asyncHandler(async (req: Request, res: Response) => {
  const cookies = req.cookies;
  if (!cookies?.refreshToken) {
    res.status(401);
    throw new Error("Refresh token not found");
  }
  const refreshToken = cookies.refreshToken;

  // Verify token
  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || "refresh_secret",
    ) as { id: string };
    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== refreshToken) {
      res.status(403);
      throw new Error("Invalid refresh token target");
    }

    // Generate new tokens
    const accessToken = generateAccessToken(user._id.toString(), user.role);
    const newRefreshToken = generateRefreshToken(user._id.toString());

    user.refreshToken = newRefreshToken;
    await user.save();

    setRefreshTokenCookie(res, newRefreshToken);

    res.json({ token: accessToken });
  } catch (error) {
    res.status(403);
    throw new Error("Refresh token expired or invalid");
  }
});

export const logoutUser = asyncHandler(async (req: Request, res: Response) => {
  const cookies = req.cookies;
  if (!cookies?.refreshToken) {
    res.status(204).json({ message: "No content" });
    return;
  }
  const refreshToken = cookies.refreshToken;
  const user = await User.findOne({ refreshToken });

  if (user) {
    user.refreshToken = "";
    await user.save();
  }

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  res.status(200).json({ message: "Logged out successfully" });
});

export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const users = await User.find({}).select("-passwordHash -twoFactorSecret");
  res.json(users);
});

export const blockUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id);

  if (user) {
    if (user.role === "admin") {
      res.status(400);
      throw new Error("Cannot block other admins");
    }

    user.status = user.status === "active" ? "blocked" : "active";
    await user.save();
    res.json({
      message: `User ${user.status === "active" ? "unblocked" : "blocked"} successfully`,
      user,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id);

  if (user) {
    if (user.role === "admin") {
      res.status(400);
      throw new Error("Cannot delete other admins");
    }

    await user.deleteOne();
    res.json({ message: "User removed successfully" });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = asyncHandler(
  async (req: Request, res: Response) => {
    // The 'protect' middleware attaches req.user
    const user = await User.findById((req as any).user._id).select(
      "-passwordHash -twoFactorSecret",
    );

    if (user) {
      res.json(user);
    } else {
      res.status(404);
      throw new Error("User not found");
    }
  },
);

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const user = await User.findById((req as any).user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      if (req.body.password) {
        const salt = await bcrypt.genSalt(10);
        user.passwordHash = await bcrypt.hash(req.body.password, salt);
      }

      // Update phone
      if (req.body.phone !== undefined) {
        user.phone = req.body.phone;
      }

      // Update addresses
      if (req.body.addresses) {
        user.addresses = req.body.addresses;
      }

      // Update saved cards
      if (req.body.savedCards) {
        user.savedCards = req.body.savedCards;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        addresses: updatedUser.addresses,
        savedCards: updatedUser.savedCards,
        giftCardBalance: updatedUser.giftCardBalance,
      });
    } else {
      res.status(404);
      throw new Error("User not found");
    }
  },
);

// @desc    Forgot Password
// @route   POST /api/users/forgotpassword
// @access  Public
export const forgotPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      res.status(404);
      throw new Error("There is no user with that email address.");
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString("hex");

    // Hash token and set to resetPasswordToken field
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Set expire to 1 hour
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);

    await user.save();

    // Create reset url
    const resetUrl = `http://localhost:4200/reset-password/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) have requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

    try {
      await sendEmail({
        email: user.email,
        subject: "Password Reset Token",
        message,
      });

      res.status(200).json({ success: true, data: "Email sent", resetUrl });
    } catch (err) {
      // In local dev without an SMTP server, the email might "fail" to send.
      // But we still want to return the resetUrl for testing purposes.
      res.status(200).json({
        success: true,
        data: "Email simulated (SMTP failed/missing)",
        resetUrl,
      });
    }
  },
);

// @desc    Reset Password
// @route   PUT /api/users/resetpassword/:resettoken
// @access  Public
export const resetPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const token = req.params.resettoken as string;

    // Get hashed token
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      res.status(400);
      throw new Error("Invalid or expired token");
    }

    // Set new password
    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(req.body.password, salt);

    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    // Generate new tokens so they are logged in automatically
    const accessToken = generateAccessToken(user._id.toString(), user.role);
    const refreshToken = generateRefreshToken(user._id.toString());

    user.refreshToken = refreshToken;
    await user.save();

    setRefreshTokenCookie(res, refreshToken);

    res.status(200).json({
      success: true,
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: accessToken,
    });
  },
);
