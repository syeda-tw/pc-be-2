import Joi from "joi";
import { messages } from "./messages.js";

const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": messages.error.invalidEmailFormat,
    "any.required": messages.error.invalidEmailFormat,
  }),
  password: Joi.string().min(8).max(20).required().messages({
    "string.min": messages.error.invalidPasswordFormat,
    "string.max": messages.error.invalidPasswordFormat,
    "any.required": messages.error.invalidPasswordFormat,
  }),
});

const validateRegisterMiddleware = (req, res, next) => {
  const { error } = registerSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
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
  const { error } = verifyRegistrationOtpSchema.validate(req.body);

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  next();
};

const verifyValidTokenSchema = Joi.object({
  authorization: Joi.string().required().messages({
    "any.required": messages.error.tokenNotFound,
  }),
});

const validateVerifyUserTokenMiddleware = (req, res, next) => {
  const { error } = verifyValidTokenSchema.validate(req.headers.authorization);

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  next();
};

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
  const { error } = loginSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
};

const requestResetPasswordSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": messages.error.invalidEmailFormat,
    "any.required": messages.error.invalidEmailFormat,
  }),
});

const validateRequestResetPasswordMiddleware = (req, res, next) => {
  const { error } = requestResetPasswordSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

const resetPasswordSchema = Joi.object({
  token: Joi.string().required().messages({
    "any.required": messages.error.tokenNotFound,
  }),
  password: Joi.string().required().messages({
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
  validateVerifyUserTokenMiddleware,
  validateLoginMiddleware,
  validateRequestResetPasswordMiddleware,
  validateResetPasswordMiddleware,
  validateChangePasswordMiddleware,
};
