import { hashPassword, generateOtp } from "./utils.js";
import {
  createOtpVerification,
  findOtpVerificationByEmail,
  findUserByEmail,
} from "./dbOps.js";
import { throwError } from "../../common/utils/customError.js";

export const registerUserService = async (email, password) => {
  // Check if the user already exists
  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    throwError(400, "User already exists", { email });
  }

  const otp = generateOtp();
  const otpVerification = await findOtpVerificationByEmail(email);
  const hashedPassword = await hashPassword(password);

  if (otpVerification) {
    Object.assign(otpVerification, { email, password: hashedPassword, otp });
    await otpVerification.save();
  } else {
    await createOtpVerification(email, hashedPassword, otp);
  }

  return { otp, email }; // return what you need from the service
};
