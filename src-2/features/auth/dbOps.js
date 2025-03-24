import User from "../../common/models/user.js";
import OTPVerification from "../../common/models/otpVerification.js";

const findUserByEmail = async (email) => {
  return User.findOne({ email });
};

const findOtpVerificationByEmail = async (email) => {
  return OTPVerification.findOne({ email });
};

const createOtpVerification = async (email, hashedPassword, otp) => {
  const otpVerification = new OTPVerification({
    email,
    password: hashedPassword,
    otp,
    expiration: Date.now() + 600000,
  });
  return otpVerification.save();
};

export { findUserByEmail, findOtpVerificationByEmail, createOtpVerification };
