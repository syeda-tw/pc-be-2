import User from "../../../../common/models/User.js";
import {
  isPasswordCorrect,
  generateToken,
  sanitizeUserAndAppendType,
} from "../../../common/utils.js";

const messages = {
  invalidEmailOrPassword: "Invalid email or password",
  loginSuccessful: "Login successful",
};

const loginOperation = async (email, password, next) => {
  const user = await User.findOne({ email });
  if (!user) {
    return next({ status: 401, message: messages.invalidEmailOrPassword });
  }

  // Validate password
  const isPasswordValid = await isPasswordCorrect(password, user.password);
  if (!isPasswordValid) {
    return next({ status: 401, message: messages.invalidEmailOrPassword });
  }

  // Generate JWT token
  const _id = user._id.toString();
  const token = generateToken({ _id });

  return {
    user: user.toObject(),
    token,
  };
};

export const loginHandler = async (req, res, next) => {
  const { email, password } = req?.body?.data;
  try {
    const { user, token } = await loginOperation(email, password, next);
    return res.status(200).json({
      user: sanitizeUserAndAppendType(user, "user"),
      token,
      message: messages.loginSuccessful,
    });
  } catch (err) {
    next(err);
  }
};
