import {
  registerUserService,
  verifyRegistrationOtpService,
  loginService,
  requestResetPasswordService,
  resetPasswordService,
  changePasswordService,
} from "./services.js";
import { messages } from "./messages.js";
import { sanitizeUser } from "./utils.js";

//return object is data: {email} and message: "OTP sent to the email address"
const register = async (req, res, next) => {
  const { email, password } = req.body.data;
  try {
    await registerUserService(email, password);
    return res.status(200).json({
      email,
      message: messages.register.otpSent,
    });
  } catch (err) {
    next(err);
  }
};

// return object is data: {email} and message: "OTP verified"
const verifyRegistrationOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body.data;
    const { user, token } = await verifyRegistrationOtpService(email, otp);
    return res.status(200).json({
      user: sanitizeUser(user),
      token,
      message: messages.register.otpVerified,
    });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req?.body?.data;
    const { user, token } = await loginService(email, password);
    return res.status(200).json({
      user: sanitizeUser(user),
      token,
      message: messages.login.loginSuccessful,
    });
  } catch (err) {
    next(err);
  }
};

const requestResetPassword = async (req, res, next) => {
  const { email } = req.body.data;
  try {
    await requestResetPasswordService(email);
    return res.status(200).json({
      message: messages.password.passwordResetLinkSent,
    });
  } catch (err) {
    next(err);
  }
};

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
  register,
  verifyRegistrationOtp,
  login,
  requestResetPassword,
  resetPassword,
  changePassword,
};
