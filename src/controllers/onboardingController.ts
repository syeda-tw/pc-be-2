import { Request, Response, NextFunction } from "express";
import User, { IUser } from "../models/user"; // User model and IUser interface
import { verifyToken } from "../helpers/auth";
import { geoapifyValidateAddress } from "../helpers/address-validation";

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
    const {
      title,
      pronouns,
      gender,
      dateOfBirth,
      firstName,
      lastName,
      middleName,
    } = req.body;

    // Validation checks
    const errors: string[] = [];

    if (!firstName) {
      errors.push("First name is required");
    }
    if (!lastName) {
      errors.push("Last name is required");
    }
    if (dateOfBirth) {
      const dob = new Date(dateOfBirth);
      const age = new Date().getFullYear() - dob.getFullYear();
      if (age < 18) {
        errors.push("User must be at least 18 years old");
      }
    } else {
      errors.push("Date of birth is required");
    }

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    user.title = title;
    user.pronouns = pronouns;
    user.gender = gender;
    user.date_of_birth = dateOfBirth;
    user.first_name = firstName;
    user.last_name = lastName;
    user.middle_name = middleName;
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

export const validateAddress = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { address } = req.body;

    const data = await geoapifyValidateAddress(address);

    return res.status(200).json(data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const validateUsername = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username } = req.body;

    const user = await User.findOne({ username });

    if (user) {
      return res.status(400).json({
        isValid: false,
        message: "Username already exists",
      });
    }

    return res.status(200).json({
      isValid: true,
      message: "Username is available",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      isValid: false,
      message: "Internal server error",
    });
  }
};
