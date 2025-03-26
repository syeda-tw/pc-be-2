// Import models
import User from "../models/user.js";
import OtpVerification from "../models/otpVerification.js";
import practice from "../models/practice.js";

// Import helpers
import {
  generateOtp,
  generateToken,
  hashPassword,
  isPasswordCorrect,
  sanitizeUser,
  validateEmail,
  validatePassword,
  verifyToken,
} from "../helpers/auth.js";
import {
  generateEmailHtml,
  sendEmail,
  sendErrorResponse,
} from "../helpers/common.js";

// Queries
const findUserByEmail = (email) => User.findOne({ email });
const findOtpVerificationByEmail = (email) =>
  OtpVerification.findOne({ email });
const createOtpVerification = (email, hashedPassword, otp) => {
  const newOtpVerification = new OtpVerification({
    email,
    password: hashedPassword,
    otp,
  });
  return newOtpVerification.save();
};

// API Response Messages
const messages = {
  success: {
    userRegistered: "User successfully registered and verification email sent",
    userLoggedIn: "User successfully logged in",
    dataFetched: "Data fetched successfully",
  },
  error: {
    userAlreadyExists: "User already exists. Please sign in instead",
    invalidEmailFormat: "Invalid email format",
    invalidPasswordFormat: "Password must be at least 8 characters long",
    serverError: "Internal server error",
  },
  validation: {
    missingEmailPassword: "Email and password are required",
    invalidCredentials: "Invalid email or password",
    missingRequiredFields: "Please fill all required fields",
  },
  notFound: {
    resource: "Resource not found",
    endpoint: "Endpoint not found",
  },
  unauthorized: {
    access: "Unauthorized access",
  },
  misc: {
    otpSent: "OTP sent to the email address",
    otpInvalid: "Invalid OTP",
  },
};

// Register function
export const register = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validate email and password
    if (!validateEmail(email)) {
      return res
        .status(400)
        .json({ message: messages.error.invalidEmailFormat });
    }
    if (!validatePassword(password)) {
      return res
        .status(400)
        .json({ message: messages.error.invalidPasswordFormat });
    }

    // Check if the user already exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res
        .status(400)
        .json({ message: messages.error.userAlreadyExists });
    }

    // Handle OTP verification
    const otp = generateOtp();
    const otpVerification = await findOtpVerificationByEmail(email);
    const hashedPassword = await hashPassword(password);

    if (otpVerification) {
      Object.assign(otpVerification, { email, password: hashedPassword, otp });
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

        Your OTP Code: 
        <h1 style="font-size: 24px; font-weight: bold; color: #000;">${otp}</h1>
        This code is valid for the next 10 minutes. If you did not request this verification, please ignore this email.

        If you need further assistance, feel free to contact our support team.

        Thank you for choosing Practicare!

        Best regards,
        The Practicare Team
        www.practicare.co`
      )
    );

    return res.status(200).json({
      user: { email },
      message: messages.misc.otpSent,
    });
  } catch (err) {
    console.error(err);
    return sendErrorResponse({
      status: 500,
      message: messages.error.serverError,
      res: err,
    });
  }
};



// Verify user token
export const verifyUserToken = async (req, res, next) => {
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

    let decoded;

    try {
      // Type the decoded token
      decoded = verifyToken(token);

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
    const user = await User.findById(decoded._id);

    if (!user) {
      return res.status(404).json({
        message: "Email does not exist",
        user: null,
      });
    }

    return res.status(200).json({
      message: "Token is valid",
      user: sanitizeUser(user),
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

// Login function
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validate email and password presence
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: messages.validation.missingEmailPassword });
    }

    // Validate email format
    if (!validateEmail(email)) {
      return res
        .status(400)
        .json({ message: messages.error.invalidEmailFormat });
    }

    // Find user by email
    const user = await findUserByEmail(email);
    if (!user) {
      return res
        .status(401)
        .json({ message: messages.validation.invalidCredentials });
    }

    // Validate password
    const isPasswordValid = await isPasswordCorrect(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ message: messages.validation.invalidCredentials });
    }

    // Generate JWT token
    const _id = user._id.toString();
    const token = generateToken({ _id });

    return res.status(200).json({
      message: messages.success.userLoggedIn,
      user: sanitizeUser(user),
      token,
    });
  } catch (err) {
    console.error(err);
    return sendErrorResponse({
      status: 500,
      message: messages.error.serverError,
      res: err,
    });
  }
};

// Request password reset
export const requestResetPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const token = generateToken({ _id: user._id.toString() }, "1h"); // Token valid for 1 hour

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    await sendEmail(
      email,
      "Password Reset Request",
      generateEmailHtml(
        "Password Reset Request",
        `Hello,

        We received a request to reset your password. Please use the following link to reset your password:

        <a href="${resetLink}">Reset Password</a>

        This link is valid for the next 1 hour. If you did not request this, please ignore this email.

        Best regards,
        The Practicare Team`
      )
    );

    return res
      .status(200)
      .json({ message: "Password reset link sent to your email" });
  } catch (err) {
    console.error("Error requesting password reset:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Reset password
export const resetPassword = async (req, res) => {
  const { token, password } = req.body;

  try {
    const decoded = verifyToken(token);

    if (!decoded?._id) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({ message: "Invalid password format" });
    }

    const hashedPassword = await hashPassword(password);

    const user = await User.findByIdAndUpdate(
      decoded._id,
      { password: hashedPassword },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        message:
          "The email that you are trying to reset the password for does not exist",
      });
    }

    // Generate JWT token
    const loginToken = generateToken({ _id: user._id.toString() });

    return res.status(200).json({
      user: sanitizeUser(user),
      message: "Password reset successfully",
      token: loginToken,
    });
  } catch (err) {
    console.error("Error resetting password:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Change password
export const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user._id;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return sendErrorResponse({
        status: 404,
        message:
          "The user that you are trying to change the password for does not exist",
        res,
      });
    }

    const isOldPasswordValid = await isPasswordCorrect(
      oldPassword,
      user.password
    );

    if (!isOldPasswordValid) {
      return sendErrorResponse({
        status: 400,
        message: "Old password is incorrect",
        res,
      });
    }

    if (!validatePassword(newPassword)) {
      return sendErrorResponse({
        status: 400,
        message: "Invalid password format",
        res,
      });
    }

    const hashedPassword = await hashPassword(newPassword);

    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("Error changing password:", err);
    return sendErrorResponse({
      status: 500,
      message: messages.error.serverError,
      res: err,
    });
  }
};
