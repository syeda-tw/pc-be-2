import { hashPassword, isPasswordCorrect } from "../../../common/utils.js";
import User from "../../../../common/models/User.js";
import jwt from "jsonwebtoken";
const messages = {
  invalidPasswordChangeUrl: "Invalid password change URL",
  userNotFound: "User not found",
  cannotUseSamePassword: "Cannot use same password",
  passwordResetSuccess: "Password reset successfully",
};

const verifyJWTToken = (token) => {
  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    return decodedToken;
  } catch (err) {
    return null;
  }
};
const resetPasswordService = async (token, password) => {
  const decodedToken = verifyJWTToken(token);
  if (!decodedToken) {
    throw {
      status: 401,
      message: messages.invalidPasswordChangeUrl,
    };
  }
  const userInitial = await User.findById(decodedToken._id);
  if (!userInitial) {
    throw {
      status: 404,
      message: messages.userNotFound,
    };
  }
  const isPasswordSameAsOld = await isPasswordCorrect(
    password,
    userInitial.password
  );
  if (isPasswordSameAsOld) {
    throw {
      status: 400,
      message: messages.cannotUseSamePassword,
    };
  }

  const hashedPassword = await hashPassword(password);
  const user = await User.findByIdAndUpdate(
    decodedToken._id,
    { password: hashedPassword },
    { new: true }
  );
  return;
};

export const resetPasswordHandler = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    await resetPasswordService(token, password);
    return res.status(200).json({
      message: messages.passwordResetSuccess,
    });
  } catch (err) {
    return next(err);
  }
};
