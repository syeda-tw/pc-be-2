import { Request, Response, NextFunction } from "express";
import User from "../models/user";

// Update user availability
export const updateAvailability = async (
  req: Request & { user: { _id: string } },
  res: Response,
  next: NextFunction
): Promise<void> => {
  const userId = req.user._id;
  const { availability } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { availability },
      { new: true }
    );

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({
      message: "Availability updated successfully",
      availability: user.availability,
    });
  } catch (err) {
    console.error("Error updating availability:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get user availability
export const getAvailability = async (
  req: Request & { user: { _id: string } },
  res: Response,
  next: NextFunction
): Promise<void> => {
  const userId = req.user._id;

  try {
    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({
      message: "Availability retrieved successfully",
      availability: user.availability,
    });
  } catch (err) {
    console.error("Error retrieving availability:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}; 