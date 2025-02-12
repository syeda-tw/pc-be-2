import { Request, Response, NextFunction } from "express";
import User, { IUser } from "../models/user"; // User model and IUser interface
import { verifyToken } from "../helpers/auth";

export const onboardingStep1 = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Check if authorization header is present
    if (!req.headers.authorization) {
      return res.status(401).json({
        message: "No token provided",
      });
    }

    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        message: "No token provided",
      });
    }

    let decoded: { userId: string };

    try {
      // Type the decoded token
      decoded = verifyToken(token) as { userId: string };

      if (!decoded?.userId) {
        return res.status(401).json({
          message: "Invalid token",
        });
      }
    } catch (error) {
      console.error("Token verification error:", error);
      return res.status(401).json({
        message: "Invalid token",
      });
    }

    // Fetch the user using the ID from the decoded token
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Update user with the provided data
    const { title, pronouns, hourlyRate, gender } = req.body;
    user.title = title;
    user.pronouns = pronouns;
    user.hourly_rate = hourlyRate;
    user.gender = gender;
    user.status = "onboarding-step-2";

    await user.save();

    return res.status(200).json({
      message: "User updated successfully",
      user,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
