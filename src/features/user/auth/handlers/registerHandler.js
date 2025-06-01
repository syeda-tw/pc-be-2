import User from "../../../../common/models/User.js";
import {
  generateOtp,
  sendRegistrationEmail,
  generateOtpExpiration,
} from "../utils.js";
import { hashPassword } from "../../../common/utils.js";
import UserOtpVerification from "../../../../common/models/UserOtpVerification.js";

const messages = {
  error: {
    practitionerExists:
      "We already have an account with this email. Would you like to try logging in instead?",
    internalError:
      "Something went wrong while creating your account. Please try again.",
  },
  success: {
    otpSent:
      "We've sent a verification code to your email. Please check your inbox to continue setting up your account.",
  },
};

const registerService = async (email, password) => {
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw {
        code: 400,
        message: messages.error.practitionerExists,
      };
    }

    const otpVerification = await UserOtpVerification.findOne({ email });
    const otp = generateOtp();
    const hashedPassword = await hashPassword(password);

    if (otpVerification) {
      Object.assign(otpVerification, {
        email,
        password: hashedPassword,
        otp,
        expiresAt: generateOtpExpiration(),
      });
      await otpVerification.save();
    } else {
      await UserOtpVerification.create({
        email,
        password: hashedPassword,
        otp,
        expiresAt: generateOtpExpiration(),
      });
    }

    await sendRegistrationEmail(email, otp);
  } catch (error) {
    throw {
      code: error.code || 500,
      message: error.message || messages.error.internalError,
    };
  }
};

export const registerHandler = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    await registerService(email, password);
    return res.status(200).json({
      message: messages.success.otpSent,
    });
  } catch (error) {
    next(error);
  }
};
