import Joi from "joi";

const messages = {
  "string.required": "Please provide this information.",
  "string.max": "Please keep this field under {{#limit}} characters.",
  "string.alphanum": "This field should only contain letters and numbers.",
  "date.max": "You need to be at least 18 years old.",
  "array.min": "Please include at least {{#limit}} items.",
  "array.includes": "This field should include {{#includes}}.",
  "string.min": "Please provide at least {{#limit}} characters.",
  "string.email": "Please provide a valid email address.",
};

export const validateOnboardingStep1Middleware = (req, res, next) => {
  const schema = Joi.object({
    title: Joi.string().required().max(100).messages({
      "string.required": messages["string.required"],
      "string.max": messages["string.max"],
    }),
    pronouns: Joi.string().required().max(100).messages({
      "string.required": messages["string.required"],
      "string.max": messages["string.max"],
    }),
    gender: Joi.string().required().max(100).messages({
      "string.required": messages["string.required"],
      "string.max": messages["string.max"],
    }),
    dateOfBirth: Joi.date().required().max(new Date(new Date().setFullYear(new Date().getFullYear() - 18))).iso().messages({
      "date.max": messages["date.max"],
      "string.required": messages["string.required"],
    }),
    firstName: Joi.string().required().max(100).messages({
      "string.required": messages["string.required"],
      "string.max": messages["string.max"],
    }),
    lastName: Joi.string().required().max(100).messages({
      "string.required": messages["string.required"],
      "string.max": messages["string.max"],
    }),
    middleName: Joi.string().allow("").max(100).messages({
      "string.max": messages["string.max"],
    }),
    username: Joi.string().required().max(100).alphanum().messages({
      "string.required": messages["string.required"],
      "string.max": messages["string.max"],
      "string.alphanum": messages["string.alphanum"],
    }),
  });
  const { error } = schema.validate(req.body);
  if (error) {
    return next({
      status: 400,
      message: error.details.map((detail) => detail.message),
    });
  }
  next();
};

export const validateAddressMiddleware = (req, res, next) => {
  const schema = Joi.object({
    address: Joi.string().required().min(1).max(255).messages({
      "string.required": messages["string.required"],
      "string.max": messages["string.max"],
      "string.min": messages["string.min"],
    }),
  });
  const { error } = schema.validate(req.body);
  if (error) {
    return next({
      status: 400,
      message: error.details.map((detail) => detail.message),
    });
  }
  next();
};

export const validateUsernameMiddleware = (req, res, next) => {
  const schema = Joi.object({
    username: Joi.string().required().min(3).max(30).alphanum().messages({
      "string.required": messages["string.required"],
      "string.max": messages["string.max"],
      "string.alphanum": messages["string.alphanum"],
      "string.min": messages["string.min"],
    }),
  });
  const { error } = schema.validate(req.body);
  if (error) {
    return next({
      status: 400,
      message: error.details.map((detail) => detail.message),
    });
  }
  next();
};

export const validateOnboardingIndividualStep2Middleware = (req, res, next) => {
  const schema = Joi.object({
    businessName: Joi.string().required().max(100).messages({
      "string.required": messages["string.required"],
      "string.max": messages["string.max"],
    }),
    website: Joi.string().allow("").max(255).messages({
      "string.max": messages["string.max"],
    }),
    address: Joi.string().required().max(255).messages({
      "string.required": messages["string.required"],
      "string.max": messages["string.max"],
    }),
  });
  const { error } = schema.validate(req.body);
  if (error) {
    return next({
      status: 400,
      message: error.details.map((detail) => detail.message),
    });
  }
  next();
};

export const validateOnboardingCompanyStep2Middleware = (req, res, next) => {
  const schema = Joi.object({
    businessName: Joi.string().required().max(100).messages({
      "string.required": messages["string.required"],
      "string.max": messages["string.max"],
    }),
    website: Joi.string().allow("").max(255).messages({
      "string.max": messages["string.max"],
    }),
    address: Joi.string().required().max(255).messages({
      "string.required": messages["string.required"],
      "string.max": messages["string.max"],
    }),
    members: Joi.array().items(Joi.string().email().messages({
      "string.email": messages["string.email"],
    })).required().min(0).messages({
      "array.min": messages["array.min"],
    }),
  });
  const { error } = schema.validate(req.body);
  if (error) {
    return next({
      status: 400,
      message: error.details.map((detail) => detail.message),
    });
  }
  next();
};
