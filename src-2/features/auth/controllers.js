import {
  registerUserService,
  verifyRegistrationOtpService,
  loginService,
  requestResetPasswordService,
  resetPasswordService,
  changePasswordService,
} from "./services.js";
import { messages } from "./messages.js";
import { handleError } from "../../common/utils/customError.js";
import { sanitizeUser } from "../../../src/helpers/auth.js";

//return object is data: {email} and message: "OTP sent to the email address"
const register = async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await registerUserService(email, password);
    console.log("result", result);
    return res.status(200).json({
      data: {
        email,
      },
      message: messages.register.otpSent,
    });
  } catch (err) {
    return handleError(err);
  }
};

// return object is data: {email} and message: "OTP verified"
const verifyRegistrationOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const { user, token } = await verifyRegistrationOtpService(email, otp);
    return res.status(200).json({
      data: {
        user: sanitizeUser(user),
        token,
      },
      message: messages.register.otpVerified,
    });
  } catch (err) {
    return handleError(err);
  }
};

const login = async (req, res) => {
  try {
    const { user, token } = await loginService();
    return res.status(200).json({
      data: {
        user: sanitizeUser(user),
        token,
      },
      message: messages.login.loginSuccessful,
    });
  } catch (err) {
    return handleError(err);
  }
};

const requestResetPassword = async (req, res) => {
  const { email } = req.body;
  try {
    await requestResetPasswordService(email);
    return res.status(200).json({
      message: messages.password.passwordResetLinkSent,
    });
  } catch (err) {
    return handleError(err);
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
      data: {
        user: sanitizeUser(user),
        token: loginToken,
      },
    });
  } catch (err) {
    return handleError(err);
  }
};

const changePassword = async (req, res, next) => {
  try {
    await changePasswordService(req.body);
    return res.status(200).json({
      message: messages.password.passwordChanged,
    });
  } catch (err) {
    return handleError(err);
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
