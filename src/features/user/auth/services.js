import {
  hashPassword,
  generateOtp,
  isPasswordCorrect,
  generateToken,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  comparePassword,
  sendRegistrationEmail
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
import CustomError from "../../../common/utils/customError.js";
import Practice from "../../../common/models/practice.js";
import jwt from "jsonwebtoken";
import { env } from "../../../common/config/env.js";


const requestResetPasswordService = async (email) => {
  const user = await findUserByEmailDbOp(email);
  if (!user) {
    throw new CustomError(404, messages.error.userNotFound);
  }
  const token = generateToken({ _id: user._id.toString() }, "1h");
  const frontendUrl =
    env.NODE_ENV === "production"
      ? env.FRONTEND_URL_PRODUCTION
      : env.FRONTEND_URL_LOCAL;
  const resetLink = `${frontendUrl}/reset-password?token=${token}`;
  await sendPasswordResetEmail(email, resetLink);
  return;
};

const resetPasswordService = async (token, password) => {
  const decodedToken = jwt.verify(token, env.JWT_SECRET);
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
  requestResetPasswordService,
  resetPasswordService,
  changePasswordService,
};
