import {
  resetPasswordService,
  changePasswordService,
} from "./services.js";
import { messages } from "./messages.js";
import { sanitizeUser } from "./utils.js";


const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    const { user, token: loginToken } = await resetPasswordService(
      token,
      password
    );
    return res.status(200).json({
      user: sanitizeUser(user),
      token: loginToken,
    });
  } catch (err) {
    return next(err);
  }
};

const changePassword = async (req, res, next) => {
  try {
    await changePasswordService(
      req.body.decodedToken._id,
      req.body.oldPassword,
      req.body.newPassword
    );
    return res.status(200).json({
      message: messages.password.passwordChanged,
    });
  } catch (err) {
    next(err);
  }
};

export {
  resetPassword,
  changePassword,
};
