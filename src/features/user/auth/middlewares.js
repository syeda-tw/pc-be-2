import Joi from "joi";
import { PASSWORD_REGEX } from "../../common/constants.js";
const messages = {
  error: {
    invalidEmailFormat: "Oops! The email format seems incorrect. Please check and try again.",
    invalidPasswordFormat: "Oops! The password format seems incorrect. Please check and try again.",
    emailTooLong: "Email is too long. Please use a shorter email address.",
    passwordTooLong: "Password is too long. Please use a shorter password.",
    passwordTooShort: "Password is too short. Please use a longer password.",
    invalidOtpFormat: "The OTP should be exactly 5 characters. Please double-check it.",
    tokenNotFound: "We couldn't find the authorization token. Please ensure you're logged in.",
  },
};

const registerSchema = Joi.object({
  email: Joi.string()
    .email()
    .max(254)
    .required()
    .messages({
      "string.email": messages.error.invalidEmailFormat,
      "string.empty": messages.error.invalidEmailFormat,
      "string.max": messages.error.emailTooLong,
      "any.required": messages.error.invalidEmailFormat,
    }),
  password: Joi.string()
    .min(8)
    .max(20)
    .pattern(PASSWORD_REGEX)
    .required()
    .messages({
      "string.min": messages.error.passwordTooShort,
      "string.max": messages.error.passwordTooLong,
      "string.pattern.base": messages.error.invalidPasswordFormat,
      "string.empty": messages.error.invalidPasswordFormat,
      "any.required": messages.error.invalidPasswordFormat,
    }),
});


const validateRegisterMiddleware = (req, res, next) => {
  console.log(req.body.data);
  const { error } = registerSchema.validate(req.body.data);
  console.log(error+ ".............");
  if (error) {
   return next({
      status: 400,
      message: error.details[0].message,
    });
    }
  next();
};

const verifyRegistrationOtpSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": messages.error.invalidEmailFormat,
    "any.required": messages.error.invalidEmailFormat,
  }),
  otp: Joi.string().length(5).required().messages({
    "string.length": messages.error.invalidOtpFormat,
    "any.required": messages.error.invalidOtpFormat,
  }),
});

const validateVerifyRegistrationOtpMiddleware = (req, res, next) => {
  const { error } = verifyRegistrationOtpSchema.validate(req.body.data);

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  next();
};

const verifyValidTokenSchema = Joi.object({
  token: Joi.string().required().messages({
    "any.required": messages.error.tokenNotFound,
  }),
});


const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": messages.error.invalidEmailFormat,
    "any.required": messages.error.invalidEmailFormat,
  }),
  password: Joi.string().required().messages({
    "any.required": messages.error.invalidPasswordFormat,
  }),
});

const validateLoginMiddleware = (req, res, next) => {
  const { error } = loginSchema.validate(req.body.data);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

const requestResetPasswordSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": messages.error.invalidEmailFormat,
    "any.required": messages.error.invalidEmailFormat,
  }),
});

const validateRequestResetPasswordMiddleware = (req, res, next) => {
  const { error } = requestResetPasswordSchema.validate(req.body.data);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

const resetPasswordSchema = Joi.object({
  token: Joi.string().required().messages({
    "any.required": messages.error.tokenNotFound,
  }),
  password: Joi.string()
    .min(8)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required()
    .messages({
      "string.min": messages.error.invalidPasswordFormat,
      "string.pattern.base": messages.error.invalidPasswordFormat,
      "any.required": messages.error.invalidPasswordFormat,
    }),
});

const validateResetPasswordMiddleware = (req, res, next) => {
  const { error } = resetPasswordSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

const validateChangePasswordSchema = Joi.object({
  oldPassword: Joi.string().required().messages({
    "any.required": messages.error.invalidPasswordFormat,
  }),
  newPassword: Joi.string().required().messages({
    "any.required": messages.error.invalidPasswordFormat,
  }),
});

const validateChangePasswordMiddleware = (req, res, next) => {
  const { error } = validateChangePasswordSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

export {
  validateRegisterMiddleware,
  validateVerifyRegistrationOtpMiddleware,
  validateLoginMiddleware,
  validateRequestResetPasswordMiddleware,
  validateResetPasswordMiddleware,
  validateChangePasswordMiddleware,
};
