import {
  generateToken,
  hashPassword,
  isPasswordCorrect,
  sanitizeUserAndAppendType,
  verifyJWTToken,
} from "../../../common/utils.js";
import User from "../../../../common/models/User.js";

const messages = {
  invalidPasswordChangeUrl: "Invalid password change URL",
  userNotFound: "User not found",
  cannotUseSamePassword: "Cannot use same password",
};

const resetPasswordService = async (token, password, next) => {
  const decodedToken = verifyJWTToken(token);
  if (!decodedToken) {
    next({
      status: 401,
      message: messages.invalidPasswordChangeUrl,
    });
  }
  const userInitial = await User.findById(decodedToken._id);
  if (!userInitial) {
    next({
      status: 404,
      message: messages.userNotFound,
    });
  }
  const isPasswordSameAsOld = await isPasswordCorrect(
    password,
    userInitial.password
  );
  if (isPasswordSameAsOld) {
    next({
      status: 400,
      message: messages.cannotUseSamePassword,
    });
  }

  const hashedPassword = await hashPassword(password);
  const user = await User.findByIdAndUpdate(
    decodedToken._id,
    { password: hashedPassword },
    { new: true }
  );

  // Generate JWT token
  const loginToken = generateToken({ _id: user._id.toString() });

  return {
    user: user.toObject(),
    token: loginToken,
  };
};

export const resetPasswordHandler = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    const { user, token: loginToken } = await resetPasswordService(
      token,
      password,
      next
    );
    return res.status(200).json({
      user: sanitizeUserAndAppendType(user),
      token: loginToken,
    });
  } catch (err) {
    return next(err);
  }
};
