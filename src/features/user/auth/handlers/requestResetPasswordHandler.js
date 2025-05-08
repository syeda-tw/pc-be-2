import User from "../../../../common/models/User.js";
import { generateToken } from '../../../common/utils.js';
import { env } from "../../../../common/config/env.js";
import { sendPasswordResetEmail } from '../utils.js';
const messages = {
  passwordResetLinkSent: "Password reset link sent",
  userNotFound: "User not found",
};

const requestResetPasswordService = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw { status: 404, message: messages.userNotFound };
  }
  const token = generateToken({ _id: user._id.toString(), expiresIn: '1h' });
  const frontendUrl =
    env.NODE_ENV === "production"
      ? env.FRONTEND_URL_PRODUCTION
      : env.FRONTEND_URL_LOCAL;
  const resetLink = `${frontendUrl}/reset-password?token=${token}`;
  await sendPasswordResetEmail(email, resetLink);
  return;
};

export const requestResetPasswordHandler = async (req, res, next) => {
  const { email } = req.body;
  try {
    await requestResetPasswordService(email);
    return res.status(200).json({
      message: messages.passwordResetLinkSent,
    });
  } catch (err) {
    next(err);
  }
};