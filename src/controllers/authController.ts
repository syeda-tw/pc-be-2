import { Request, Response, NextFunction } from "express";
import User, { IUser } from "../models/user"; // User model and IUser interface
import OtpVerification from "../models/otpVerification"; // OtpVerifications model
import {
  generateOtp,
  generateToken,
  hashPassword,
  isPasswordCorrect,
  validateEmail,
  validatePassword,
  verifyToken,
} from "../helpers/auth";
import {
  generateEmailHtml,
  sendEmail,
  sendErrorResponse,
} from "../helpers/common";
import practice from "../models/practice";

// Queries
const findUserByEmail = (email: string) => User.findOne({ email });
const findOtpVerificationByEmail = (email: string) =>
  OtpVerification.findOne({ email });
const createOtpVerification = (
  email: string,
  hashedPassword: string,
  otp: string
) => {
  const newOtpVerification = new OtpVerification({
    email,
    password: hashedPassword,
    otp,
  });
  return newOtpVerification.save();
};

// API RESPONSES

// Success Messages
export const userRegisteredSuccess =
  "User successfully registered and verification email sent";
export const userLoggedInSuccess = "User successfully logged in";
export const dataFetchedSuccess = "Data fetched successfully";

// Error Messages
export const userAlreadyExists = "User already exists. Please sign in instead";
export const invalidEmailFormat = "Invalid email format";
export const invalidPasswordFormat =
  "Password must be at least 8 characters long";
export const serverError = "Internal server error";

// Validation Messages
export const missingEmailPassword = "Email and password are required";
export const invalidCredentials = "Invalid email or password";
export const missingRequiredFields = "Please fill all required fields";

// Not Found Messages
export const resourceNotFound = "Resource not found";
export const endpointNotFound = "Endpoint not found";

// Unauthorized Messages
export const unauthorizedAccess = "Unauthorized access";

// Miscellaneous Messages
export const otpSent = "OTP sent to the email address";
export const otpInvalid = "Invalid OTP";

// Define an interface for the decoded token
interface DecodedToken {
  _id: string;
}

// Register function
export const register = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    // Step 1: Validate email and password
    if (!validateEmail(email)) {
      return res.status(400).json({ message: invalidEmailFormat });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({ message: invalidPasswordFormat });
    }

    // Step 2: Check if the user already exists in the User collection
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: userAlreadyExists });
    }

    // Step 3: Check if email exists in OtpVerifications
    const otp = generateOtp();
    const otpVerification = await findOtpVerificationByEmail(email);
    const hashedPassword = await hashPassword(password);

    if (otpVerification) {
      // If email exists in OtpVerifications, update it
      otpVerification.email = email;
      otpVerification.password = hashedPassword;
      otpVerification.otp = otp;
      await otpVerification.save();
    } else {
      await createOtpVerification(email, hashedPassword, otp);
    }

    console.log(`OTP for ${email}: ${otp}`);
    await sendEmail(
      email,
      "Your OTP Code for Secure Verification on Practicare",
      generateEmailHtml(
        "Secure OTP Code for Practicare",
        `Hello,

          We received a request to verify your email address with Practicare. Please use the following One-Time Password (OTP) to complete the verification process:

          Your OTP Code: ${otp}

          This code is valid for the next 10 minutes. If you did not request this verification, please ignore this email.

          If you need further assistance, feel free to contact our support team.

          Thank you for choosing Practicare!

          Best regards,
          The Practicare Team
          www.practicare.co`
      )
    );

    return res.status(200).json({
      user: {
        email: email,
      },
      message: otpSent,
    });
  } catch (err) {
    console.error(err);
    return sendErrorResponse({
      status: 500,
      message: serverError,
      res: err,
    });
  }
};

// Verify OTP and complete registration
export const verifyRegistrationOtp = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    // Find OTP verification record
    const otpVerification = await OtpVerification.findOne({ email });

    if (!otpVerification) {
      return sendErrorResponse({
        status: 404,
        message: "Email not found. Please register first.",
        res,
      });
    }

    // Check if OTP matches
    if (otpVerification.otp !== otp) {
      return sendErrorResponse({
        status: 400,
        message: "Invalid OTP code. Please try again.",
        res,
      });
    }

    // Create new practice with default values
    const newPractice = await practice.create({});

    // Add practice ID to user data before creation
    Object.assign(otpVerification, { practice: newPractice._id });

    // Create new user
    const user = (await User.create({
      email: otpVerification.email,
      password: otpVerification.password,
      status: "onboarding-step-1",
      is_admin: true,
      practice: newPractice._id,
    })) as { _id: string }; // Type assertion here

    // Delete OTP verification record
    await OtpVerification.deleteOne({ email });
    // Generate JWT token
    const _id = user._id.toString();
    const token: string = generateToken({ _id });

    return res.status(201).json({
      message: "Registration successful",
      user: user,
      token,
    });
  } catch (err) {
    console.error(err);
    return sendErrorResponse({
      status: 500,
      message: serverError,
      res: err,
    });
  }
};

export const verifyUserToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Check if authorization header is present
    if (!req.headers.authorization) {
      return res.status(401).json({
        message: "No token provided",
        user: null,
      });
    }

    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        message: "No token provided",
        user: null,
      });
    }

    let decoded: DecodedToken;

    try {
      // Type the decoded token
      decoded = verifyToken(token) as DecodedToken;

      if (!decoded?._id) {
        return res.status(401).json({
          message: "Invalid token",
          user: null,
        });
      }
    } catch (error) {
      console.error("Token verification error:", error);
      return res.status(401).json({
        message: "Invalid token",
        user: null,
      });
    }

    // Fetch the user using the ID from the decoded token
    const user = (await User.findById(decoded._id)) as IUser;

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        user: null,
      });
    }

    return res.status(200).json({
      message: "Token is valid",
      user,
      token,
    });
  } catch (err) {
    console.error(err);
    return res.status(401).json({
      message: "Invalid token",
      user: null,
    });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    // Validate email and password presence
    if (!email || !password) {
      return res.status(400).json({ message: missingEmailPassword });
    }

    // Validate email format
    if (!validateEmail(email)) {
      return res.status(400).json({ message: invalidEmailFormat });
    }

    // Find user by email
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: invalidCredentials });
    }

    // Validate password
    const isPasswordValid = await isPasswordCorrect(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: invalidCredentials });
    }

    // Generate JWT token
    const _id = user._id.toString();
    const token: string = generateToken({ _id });

    return res.status(200).json({
      message: userLoggedInSuccess,
      user,
      token,
    });
  } catch (err) {
    console.error(err);
    return sendErrorResponse({
      status: 500,
      message: serverError,
      res: err,
    });
  }
};
