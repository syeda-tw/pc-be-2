// src/utils/messages.js
export const messages = {
  register: {
    otpSent: "OTP has been sent to your email address.",
  },
  login: {
    loginSuccessful: "You have successfully logged in.",
  },
  password: {
    passwordResetLinkSent:
      "A password reset link has been sent to your email address.",
    passwordResetSuccessful: "Your password has been reset successfully.",
    passwordChanged: "Your password has been changed successfully.",
  },
  user: {
    userVerified: "User verified successfully",
  },
  error: {
    userAlreadyExists: "A user with this email already exists.",
    serverError: "An unexpected error occurred. Please try again later.",
    userDoesNotExist: "User does not exist. Please register first.",
    invalidEmailFormat: "Please provide a valid email address.",
    invalidCredentials: "The password that you entered is incorrect",
    invalidOldPassword: "The old password that you entered is incorrect",
    invalidPasswordFormat:
      "Password must be between 8 and 20 characters and contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
    invalidOtpFormat: "Please provide a valid OTP.",
    invalidOtp: "The OTP that you entered is incorrect",
    tokenNotFound: "Session expired. Please login again",
    invalidTokenFormat: "Session expired. Please login again",
    invalidToken: "Session expired. Please login again",
    invalidPasswordChangeUrl: "Invalid password change URL. Please try again.",
    cannotUseSamePassword: "You cannot use the same password as your previous password.",
  },
  notFound: {
    resource: "Resource not found",
  },
};
