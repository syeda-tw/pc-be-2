import Joi from "joi";

export const validateOnboardingStep1Middleware = (req, res, next) => {
  const schema = Joi.object({
    title: Joi.string().required().max(10),
    pronouns: Joi.string().required().max(20),
    gender: Joi.string().required().max(20),
    dateOfBirth: Joi.date().required().max(new Date(new Date().setFullYear(new Date().getFullYear() - 18))).iso().messages({
      'date.max': 'User must be at least 18 years old'
    }),
    firstName: Joi.string().required().min(1).max(50),
    lastName: Joi.string().required().min(1).max(50),
    middleName: Joi.string().allow("").max(50),
    username: Joi.string().required().min(3).max(30).alphanum(),
  });

  const { error } = schema.validate(req.body.user);

  if (error) {
    return res.status(400).json({
      message: "Validation error",
      errors: error.details.map((detail) => detail.message),
    });
  }

  next();
};


export const validateAddressMiddleware = (req, res, next) => {
  const schema = Joi.object({
    address: Joi.string().required().min(1).max(255),
  });

  const { error } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({
      message: "Validation error",
      errors: error.details.map((detail) => detail.message),
    });
  }

  next();
};


