import Joi from "joi";

const messages = {
  // Personal Information
  title: {
    required: "Please select a title",
    max: "Title should not exceed 100 characters"
  },
  pronouns: {
    required: "Please select your pronouns",
    max: "Pronouns should not exceed 100 characters"
  },
  gender: {
    required: "Please select your gender",
    max: "Gender should not exceed 100 characters"
  },
  dateOfBirth: {
    required: "Please provide your date of birth",
    max: "You must be at least 18 years old"
  },
  firstName: {
    required: "Please provide your first name",
    max: "First name should not exceed 100 characters"
  },
  lastName: {
    required: "Please provide your last name",
    max: "Last name should not exceed 100 characters"
  },
  middleName: {
    max: "Middle name should not exceed 100 characters"
  },
  username: {
    required: "Please choose a username",
    max: "Username should not exceed 100 characters",
    alphanum: "Username should only contain letters and numbers"
  },
  // Address
  address: {
    required: "Please provide your address",
    max: "Address should not exceed 255 characters",
    min: "Please provide a valid address"
  },
  // Company
  name: {
    required: "Please provide the company name",
    max: "Company name should not exceed 100 characters"
  },
  website: {
    max: "Website URL should not exceed 255 characters"
  },
  members: {
    min: "Please add at least one team member",
    email: "Please provide valid email addresses for team members"
  }
};

// Helper function to handle errors consistently
const handleValidationError = (error, next) => {
  return next({
    code: 400,
    message: error.details.map((detail) => detail.message)
  });
};

export const validateOnboardingStep1Middleware = (req, res, next) => {
  const schema = Joi.object({
    title: Joi.string().required().max(100).messages({
      "string.required": messages.title.required,
      "string.max": messages.title.max,
    }),
    pronouns: Joi.string().required().max(100).messages({
      "string.required": messages.pronouns.required,
      "string.max": messages.pronouns.max,
    }),
    gender: Joi.string().required().max(100).messages({
      "string.required": messages.gender.required,
      "string.max": messages.gender.max,
    }),
    dateOfBirth: Joi.date().required().max(new Date(new Date().setFullYear(new Date().getFullYear() - 18))).iso().messages({
      "date.max": messages.dateOfBirth.max,
      "string.required": messages.dateOfBirth.required,
    }),
    firstName: Joi.string().required().max(100).messages({
      "string.required": messages.firstName.required,
      "string.max": messages.firstName.max,
    }),
    lastName: Joi.string().required().max(100).messages({
      "string.required": messages.lastName.required,
      "string.max": messages.lastName.max,
    }),
    middleName: Joi.string().allow("").max(100).messages({
      "string.max": messages.middleName.max,
    }),
    username: Joi.string().required().max(100).alphanum().messages({
      "string.required": messages.username.required,
      "string.max": messages.username.max,
      "string.alphanum": messages.username.alphanum,
    }),
  });
  const { error } = schema.validate(req.body);
  if (error) {
    return handleValidationError(error, next);
  }
  next();
};

export const validateAddressMiddleware = (req, res, next) => {
  const schema = Joi.object({
    address: Joi.string().required().min(1).max(255).messages({
      "string.required": messages.address.required,
      "string.max": messages.address.max,
      "string.min": messages.address.min,
    }),
  });
  const { error } = schema.validate(req.body);
  if (error) {
    return handleValidationError(error, next);
  }
  next();
};

export const validateUsernameMiddleware = (req, res, next) => {
  const schema = Joi.object({
    username: Joi.string().required().min(3).max(30).alphanum().messages({
      "string.required": messages.username.required,
      "string.max": messages.username.max,
      "string.alphanum": messages.username.alphanum,
      "string.min": messages.username.min,
    }),
  });
  const { error } = schema.validate(req.body);
  if (error) {
    return handleValidationError(error, next);
  }
  next();
};

export const validateOnboardingIndividualStep2Middleware = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().required().max(100).messages({
      "string.required": messages.name.required,
      "string.max": messages.name.max,
    }),
    website: Joi.string().allow("").max(255).messages({
      "string.max": messages.website.max,
    }),
    address: Joi.string().required().max(255).messages({
      "string.required": messages.address.required,
      "string.max": messages.address.max,
    }),
  });
  const { error } = schema.validate(req.body);
  if (error) {
    return handleValidationError(error, next);
  }
  next();
};

export const validateOnboardingCompanyStep2Middleware = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().required().max(100).messages({
      "string.required": messages.name.required,
      "string.max": messages.name.max,
    }),
    website: Joi.string().allow("").max(255).messages({
      "string.max": messages.website.max,
    }),
    address: Joi.string().required().max(255).messages({
      "string.required": messages.address.required,
      "string.max": messages.address.max,
    }),
    members: Joi.array().items(Joi.string().email().messages({
      "string.email": messages.members.email,
    })).required().min(0).messages({
      "array.min": messages.members.min,
    }),
  });
  const { error } = schema.validate(req.body);
  if (error) {
    return handleValidationError(error, next);
  }
  next();
};
