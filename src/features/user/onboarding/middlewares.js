import Joi from "joi";

export const validateOnboardingStep1Middleware = (req, res, next) => {
  const schema = Joi.object({
    title: Joi.string().required().max(100),
    pronouns: Joi.string().required().max(100),
    gender: Joi.string().required().max(100),
    dateOfBirth: Joi.date().required().max(new Date(new Date().setFullYear(new Date().getFullYear() - 18))).iso().messages({
      'date.max': 'User must be at least 18 years old'
    }),
    firstName: Joi.string().required().max(100),
    lastName: Joi.string().required().max(100),
    middleName: Joi.string().allow("").max(100),
    username: Joi.string().required().max(100).alphanum(),
  });
  const { error } = schema.validate(req.body.data);
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
  const { error } = schema.validate(req.body.data);
  if (error) {
    return res.status(400).json({
      message: "Validation error",
      errors: error.details.map((detail) => detail.message),
    });
  }
  next();
};

export const validateUsernameMiddleware = (req, res, next) => {
  const schema = Joi.object({
    username: Joi.string().required().min(3).max(30).alphanum(),
  });
  const { error } = schema.validate(req.body.data);
  if (error) {
    return res.status(400).json({
      message: "Validation error",
      errors: error.details.map((detail) => detail.message),
    });
  }
  next();
};

export const validateOnboardingIndividualStep2Middleware = (req, res, next) => {
  const schema = Joi.object({
    businessName: Joi.string().required().max(100),
    website: Joi.string().allow("").max(255),
    address: Joi.string().required().max(255),
  });
  const { error } = schema.validate(req.body.data);
  if (error) {
    return res.status(400).json({
      message: "Validation error",
      errors: error.details.map((detail) => detail.message),
    });
  }
  next();
};

export const validateOnboardingCompanyStep2Middleware = (req, res, next) => {
  const schema = Joi.object({
    businessName: Joi.string().required().max(100),
    website: Joi.string().allow("").max(255),
    address: Joi.string().required().max(255),
    members: Joi.array().items(Joi.string().email()).required(),
  });
  const { error } = schema.validate(req.body.data);
  if (error) {
    return res.status(400).json({
      message: "Validation error",
      errors: error.details.map((detail) => detail.message),
    }); 
  }
  next();
};

