import {
  hashPassword,
  generateOtp,
  isPasswordCorrect,
  generateToken,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  comparePassword,
} from "./utils.js";
import {
  createOtpVerificationDbOp,
  findOtpVerificationByEmailDbOp,
  findUserByEmailDbOp,
  createUserDbOp,
  deleteOtpVerificationDbOp,
  updateUserPasswordDbOp,
  findUserByIdDbOp,
} from "./dbOps.js";
import { messages } from "./messages.js";
import CustomError from "../../common/utils/customError.js";
import Practice from "../../common/models/practice.js";
import jwt from "jsonwebtoken";

const registerUserService = async (email, password) => {
  // Check if the user already exists
  const existingUser = await findUserByEmailDbOp(email);
  if (existingUser) {
    throw new CustomError(400, messages.error.userAlreadyExists);
  }

  const otpVerification = await findOtpVerificationByEmailDbOp(email);
  const otp = generateOtp();
  const hashedPassword = await hashPassword(password);
  console.log("otp", otp);

  if (otpVerification) {
    //If OTP verification already exists, update the password and otp
    Object.assign(otpVerification, { email, password: hashedPassword, otp });
    await otpVerification.save();
  } else {
    //If OTP verification does not exist, create a new one
    await createOtpVerificationDbOp(email, hashedPassword, otp);
  }
  return;
};

const verifyRegistrationOtpService = async (email, otp) => {
  // Find OTP verification record

  const otpVerification = await findOtpVerificationByEmailDbOp(email);

  if (!otpVerification) {
    throw new CustomError(404, messages.notFound.resource);
  }

  // Check if OTP matches
  if (otpVerification.otp !== otp) {
    throw new CustomError(400, messages.error.invalidOtp);
  }

  //ALL IS OK
  // Create new practice with default values
  const newPractice = await Practice.create({});

  // Create new user
  const user = await createUserDbOp({
    email: otpVerification.email,
    password: otpVerification.password,
    status: "onboarding-step-1",
    is_admin: true,
    practice: newPractice._id,
  });

  // Delete OTP verification record
  await deleteOtpVerificationDbOp(email);

  // Generate JWT token
  const _id = user._id.toString();
  const token = generateToken({ _id });

  // Send welcome email
  await sendWelcomeEmail(user);

  return {
    user,
    token,
  };
};

const loginService = async (email, password) => {
  const user = await findUserByEmailDbOp(email);
  if (!user) throw new CustomError(401, messages.error.invalidEmailFormat);

  // Validate password
  const isPasswordValid = await isPasswordCorrect(password, user.password);
  if (!isPasswordValid)
    throw new CustomError(401, messages.error.invalidCredentials);

  // Generate JWT token
  const _id = user._id.toString();
  const token = generateToken({ _id });

  return {
    user,
    token,
  };
};

const requestResetPasswordService = async (email) => {
  const user = await findUserByEmailDbOp(email);
  if (!user) {
    throw new CustomError(404, messages.error.userNotFound);
  }
  const token = generateToken({ _id: user._id.toString() }, "1h");
  const frontendUrl =
    process.env.NODE_ENV === "production"
      ? process.env.FRONTEND_URL_PRODUCTION
      : process.env.FRONTEND_URL_LOCAL;
  const resetLink = `${frontendUrl}/reset-password?token=${token}`;
  await sendPasswordResetEmail(email, resetLink);
  return;
};

const resetPasswordService = async (token, password) => {
  const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  if (!decodedToken) {
    throw new CustomError(401, messages.error.invalidPasswordChangeUrl);
  }
  const userInitial = await findUserByIdDbOp(decodedToken._id);
  if (!userInitial) {
    throw new CustomError(404, messages.error.userNotFound);
  }
  const isPasswordCorrect = await comparePassword(
    password,
    userInitial.password
  );
  if (isPasswordCorrect) {
    throw new CustomError(400, messages.error.cannotUseSamePassword);
  }

  const hashedPassword = await hashPassword(password);
  const user = await updateUserPasswordDbOp(decodedToken._id, hashedPassword);
  if (!user) {
    throw new CustomError(404, messages.error.userNotFound);
  }
  // Generate JWT token
  const loginToken = generateToken({ _id: user._id.toString() });

  return {
    user,
    token: loginToken,
  };
};

const changePasswordService = async (id, oldPassword, newPassword) => {
  const user = await findUserByIdDbOp(id);
  if (!user) {
    throw new CustomError(404, messages.error.userNotFound);
  }
  const isPasswordCorrect = await comparePassword(
    oldPassword,
    user.password
  );
  if (!isPasswordCorrect) {
    throw new CustomError(400, messages.error.invalidOldPassword);
  }
  const arePasswordsSame = oldPassword == newPassword
  if(arePasswordsSame) throw new CustomError(400, messages.error.cannotUseSamePassword)

  const hashedNewPassword = await hashPassword(newPassword);
  const userUpdated = await updateUserPasswordDbOp(id, hashedNewPassword);
  if (!userUpdated) {
    throw new CustomError(404, messages.error.userNotFound);
  }
  return;
};

export {
  registerUserService,
  verifyRegistrationOtpService,
  loginService,
  requestResetPasswordService,
  resetPasswordService,
  changePasswordService,
};
