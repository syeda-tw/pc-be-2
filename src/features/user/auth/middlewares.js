import Joi from "joi";
import { PASSWORD_REGEX } from "../../common/constants.js";

// Error messages
const errorMessages = {
  emptyBody: "We need some information to help you. Please provide the required details.",
  invalidEmailFormat: "We couldn't recognize that email address. Could you please check and try again?",
  invalidPasswordFormat: "Your password needs to be stronger. Please include uppercase, lowercase, numbers, and special characters.",
  emailTooLong: "That email address is a bit too long. Could you use a shorter one?",
  passwordTooLong: "That password is a bit too long. Could you use a shorter one?",
  passwordTooShort: "For your security, please use a password that's at least 8 characters long.",
  invalidOtpFormat: "The verification code should be exactly 5 digits. Please check and try again.",
  tokenNotFound: "We couldn't find your session. Please try logging in again.",
  invalidOldPassword: "Please provide your current password.",
  invalidNewPassword: "Please provide a new password that meets our security requirements.",
};

// Validation schemas
const registerSchema = Joi.object({
  email: Joi.string()
    .email()
    .max(254)
    .required()
    .messages({
      "string.email": errorMessages.invalidEmailFormat,
      "string.empty": errorMessages.invalidEmailFormat,
      "string.max": errorMessages.emailTooLong,
      "any.required": errorMessages.invalidEmailFormat,
    }),
  password: Joi.string()
    .min(8)
    .max(20)
    .pattern(PASSWORD_REGEX)
    .required()
    .messages({
      "string.min": errorMessages.passwordTooShort,
      "string.max": errorMessages.passwordTooLong,
      "string.pattern.base": errorMessages.invalidPasswordFormat,
      "string.empty": errorMessages.invalidPasswordFormat,
      "any.required": errorMessages.invalidPasswordFormat,
    }),
});

const verifyRegistrationOtpSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      "string.email": errorMessages.invalidEmailFormat,
      "string.empty": errorMessages.invalidEmailFormat,
      "any.required": errorMessages.invalidEmailFormat,
    }),
  otp: Joi.string()
    .length(5)
    .required()
    .messages({
      "string.length": errorMessages.invalidOtpFormat,
      "string.empty": errorMessages.invalidOtpFormat,
      "any.required": errorMessages.invalidOtpFormat,
    }),
});

const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      "string.email": errorMessages.invalidEmailFormat,
      "string.empty": errorMessages.invalidEmailFormat,
      "any.required": errorMessages.invalidEmailFormat,
    }),
  password: Joi.string()
    .required()
    .messages({
      "string.empty": errorMessages.invalidPasswordFormat,
      "any.required": errorMessages.invalidPasswordFormat,
    }),
});

const requestResetPasswordSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      "string.email": errorMessages.invalidEmailFormat,
      "string.empty": errorMessages.invalidEmailFormat,
      "any.required": errorMessages.invalidEmailFormat,
    }),
});

const resetPasswordSchema = Joi.object({
  token: Joi.string()
    .required()
    .messages({
      "string.empty": errorMessages.tokenNotFound,
      "any.required": errorMessages.tokenNotFound,
    }),
  password: Joi.string()
    .min(8)
    .pattern(PASSWORD_REGEX)
    .required()
    .messages({
      "string.min": errorMessages.passwordTooShort,
      "string.pattern.base": errorMessages.invalidPasswordFormat,
      "string.empty": errorMessages.invalidPasswordFormat,
      "any.required": errorMessages.invalidPasswordFormat,
    }),
});

const validateChangePasswordSchema = Joi.object({
  oldPassword: Joi.string()
    .required()
    .messages({
      "string.empty": errorMessages.invalidOldPassword,
      "any.required": errorMessages.invalidOldPassword,
    }),
  newPassword: Joi.string()
    .min(8)
    .pattern(PASSWORD_REGEX)
    .required()
    .messages({
      "string.min": errorMessages.passwordTooShort,
      "string.pattern.base": errorMessages.invalidPasswordFormat,
      "string.empty": errorMessages.invalidNewPassword,
      "any.required": errorMessages.invalidNewPassword,
    }),
});

// Validation middleware functions
const validateRegisterMiddleware = (req, res, next) => {
  try {
    const data = req.body;
    if (!data || Object.keys(data).length === 0) {
      throw {
        status: 400,
        message: errorMessages.emptyBody,
      };
    }
    const { error } = registerSchema.validate(data);
    if (error) {
      throw {
        status: 400,
        message: error.details[0].message,
      };
    }
    next();
  } catch (err) {
    next(err);
  }
};

const validateVerifyRegistrationOtpMiddleware = (req, res, next) => {
  try {
    const data = req.body;
    if (!data || Object.keys(data).length === 0) {
      throw {
        status: 400,
        message: errorMessages.emptyBody,
      };
    }
    const { error } = verifyRegistrationOtpSchema.validate(data);
    if (error) {
      throw {
        status: 400,
        message: error.details[0].message,
      };
    }
    next();
  } catch (err) {
    next(err);
  }
};

const validateLoginMiddleware = (req, res, next) => {
  try {
    const data = req.body;
    if (!data || Object.keys(data).length === 0) {
      throw {
        status: 400,
        message: errorMessages.emptyBody,
      };
    }
    const { error } = loginSchema.validate(data);
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      throw {
        status: 400,
        message: errorMessage,
      };
    }
    next();
  } catch (err) {
    next(err);
  }
};

const validateRequestResetPasswordMiddleware = (req, res, next) => {
  try {
    const data = req.body;
    if (!data || Object.keys(data).length === 0) {
      throw {
        status: 400,
        message: errorMessages.emptyBody,
      };
    }
    const { error } = requestResetPasswordSchema.validate(data);
    if (error) {
      throw {
        status: 400,
        message: error.details[0].message,
      };
    }
    next();
  } catch (err) {
    next(err);
  }
};

const validateResetPasswordMiddleware = (req, res, next) => {
  try {
    const data = req.body;
    if (!data || Object.keys(data).length === 0) {
      throw {
        status: 400,
        message: errorMessages.emptyBody,
      };
    }
    const { error } = resetPasswordSchema.validate(data);
    if (error) {
      throw {
        status: 400,
        message: error.details[0].message,
      };
    }
    next();
  } catch (err) {
    next(err);
  }
};

const validateChangePasswordMiddleware = (req, res, next) => {
  try {
    const data = req.body;
    if (!data || Object.keys(data).length === 0) {
      throw {
        status: 400,
        message: errorMessages.emptyBody,
      };
    }
    const { error } = validateChangePasswordSchema.validate(data);
    if (error) {
      throw {
        status: 400,
        message: error.details[0].message,
      };
    }
    next();
  } catch (err) {
    next(err);
  }
};

export {
  validateRegisterMiddleware,
  validateVerifyRegistrationOtpMiddleware,
  validateLoginMiddleware,
  validateRequestResetPasswordMiddleware,
  validateResetPasswordMiddleware,
  validateChangePasswordMiddleware,
};
