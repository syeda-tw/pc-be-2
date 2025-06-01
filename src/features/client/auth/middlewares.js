import Joi from "joi";

export const validateRegisterStep1Middleware = (req, res, next) => {
  const schema = Joi.object({
    phone: Joi.string()
      .pattern(/^\+?1?[2-9]\d{9}$/, "US phone number")
      .required()
      .messages({
        "string.pattern.name": "We need a valid US phone number to get started",
        "any.required": "Your phone number helps us keep your account secure",
      }),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    throw {
      status: 400,
      message: error.details[0].message,
    };
  }
  next();
};

export const validateUserOtpVerificationMiddleware = (req, res, next) => {
  const schema = Joi.object({
    phone: Joi.string()
      .pattern(/^\+?1?[2-9]\d{9}$/, "US phone number")
      .required()
      .messages({
        "string.pattern.name": "We need a valid US phone number to verify your account",
        "any.required": "Your phone number helps us keep your account secure",
      }),
    otp: Joi.string()
      .length(5)
      .pattern(/^[0-9]+$/, "numbers")
      .required()
      .messages({
        "string.length": "Your verification code should be 5 digits",
        "string.pattern.name": "Your verification code should only contain {#name}",
        "any.required": "We need your verification code to continue",
      }),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

export const validateRequestLoginOtpMiddleware = (req, res, next) => {
  const schema = Joi.object({
    phone: Joi.string()
      .pattern(/^\+?1?[2-9]\d{9}$/, "US phone number")
      .required()
      .messages({
        "string.pattern.name": "We need a valid US phone number to help you log in",
        "any.required": "Your phone number helps us keep your account secure",
      }),
  });
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

export const validateLoginUserOtpVerificationMiddleware = (req, res, next) => {
  const schema = Joi.object({
    phone: Joi.string()
      .pattern(/^\+?1?[2-9]\d{9}$/, "US phone number")
      .required()
      .messages({
        "string.pattern.name": "We need a valid US phone number to verify your login",
        "any.required": "Your phone number helps us keep your account secure",
      }),
    otp: Joi.string()
      .length(5)
      .pattern(/^[0-9]+$/, "numbers")
      .required()
      .messages({
        "string.length": "Your verification code should be 5 digits",
        "string.pattern.name": "Your verification code should only contain {#name}",
        "any.required": "We need your verification code to continue",
      }),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      message: "Let's try that again",
      details: error.details[0].message 
    });
  }
  next();
};
