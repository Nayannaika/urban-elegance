import { Request, Response } from "express";
import Banner from "../models/Banner.js";

// @desc    Get active banners for home screen
// @route   GET /api/banners
// @access  Public
export const getActiveBanners = async (req: Request, res: Response) => {
  try {
    const banners = await Banner.find({ isActive: true }).sort({ order: 1 });
    res.json(banners);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// @desc    Get all banners
// @route   GET /api/banners/all
// @access  Private/Admin
export const getAllBanners = async (req: Request, res: Response) => {
  try {
    const banners = await Banner.find({}).sort({ order: 1 });
    res.json(banners);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// @desc    Create a banner
// @route   POST /api/banners
// @access  Private/Admin
export const createBanner = async (req: Request, res: Response) => {
  try {
    const { imageUrl, link, isActive, order } = req.body;
    const banner = new Banner({
      imageUrl,
      link,
      isActive,
      order,
    });
    const createdBanner = await banner.save();
    res.status(201).json(createdBanner);
  } catch (error) {
    res.status(500).json({ message: "Server Error on creating banner", error });
  }
};

// @desc    Update a banner
// @route   PUT /api/banners/:id
// @access  Private/Admin
export const updateBanner = async (req: Request, res: Response) => {
  try {
    const { imageUrl, link, isActive, order } = req.body;
    const banner = await Banner.findById(req.params.id);

    if (banner) {
      banner.imageUrl = imageUrl || banner.imageUrl;
      banner.link = link || banner.link;
      if (isActive !== undefined) banner.isActive = isActive;
      if (order !== undefined) banner.order = order;

      const updatedBanner = await banner.save();
      res.json(updatedBanner);
    } else {
      res.status(404).json({ message: "Banner not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error on updating banner", error });
  }
};

// @desc    Delete a banner
// @route   DELETE /api/banners/:id
// @access  Private/Admin
export const deleteBanner = async (req: Request, res: Response) => {
  try {
    const banner = await Banner.findById(req.params.id);

    if (banner) {
      await banner.deleteOne();
      res.json({ message: "Banner removed" });
    } else {
      res.status(404).json({ message: "Banner not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error on deleting banner", error });
  }
};
