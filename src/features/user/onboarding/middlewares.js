import Joi from "joi";

const messages = {
  // Personal Information
  title: {
    required: "Please select a title",
    max: "Title should not exceed 100 characters",
  },
  pronouns: {
    required: "Please select your pronouns",
    max: "Pronouns should not exceed 100 characters",
  },
  gender: {
    required: "Please select your gender",
    max: "Gender should not exceed 100 characters",
  },
  dateOfBirth: {
    required: "Please provide your date of birth",
    max: "You must be at least 18 years old",
    base: "Please provide a valid date of birth",
  },
  firstName: {
    required: "Please provide your first name",
    max: "First name should not exceed 100 characters",
  },
  lastName: {
    required: "Please provide your last name",
    max: "Last name should not exceed 100 characters",
  },
  middleName: {
    max: "Middle name should not exceed 100 characters",
  },
  username: {
    required: "Please choose a username",
    min: "Username must be at least 4 characters long",
    max: "Username should be between 4 and 20 characters",
    alphanum: "Username should only contain letters and numbers",
    pattern: "Username can only contain letters, numbers, and underscores.",
  },
  // Address
  address: {
    required: "Please provide your address",
    max: "Address should not exceed 255 characters",
    min: "Please provide a valid address",
  },
  // Company
  name: {
    required: "Please provide the company name",
    max: "Company name should not exceed 100 characters",
  },
  website: {
    max: "Website URL should not exceed 255 characters",
    uri: "Please provide a valid website URL",
  },
  members: {
    min: "Please add at least one team member",
    email: "Please provide valid email addresses for team members",
    required: "Please provide team member information",
  },
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
    dateOfBirth: Joi.date()
      .required()
      .max(new Date(new Date().setFullYear(new Date().getFullYear() - 18)))
      .iso()
      .messages({
        "date.max": messages.dateOfBirth.max,
        "date.base": messages.dateOfBirth.base,
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
    username: Joi.string()
      .required()
      .min(4)
      .max(20)
      .pattern(/^[a-zA-Z0-9_]+$/)
      .messages({
        "string.required": messages.username.required,
        "string.min": messages.username.min,
        "string.max": messages.username.max,
        "string.pattern.base": messages.username.pattern,
      }),
  });
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });
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
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });
  }
  next();
};

export const validateUsernameMiddleware = (req, res, next) => {
  const schema = Joi.object({
    username: Joi.string()
      .required()
      .min(4)
      .max(20)
      .pattern(/^[a-zA-Z0-9_]+$/)
      .messages({
        "string.required": messages.username.required,
        "string.min": messages.username.min,
        "string.max": messages.username.max,
        "string.pattern.base": messages.username.pattern,
      }),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });
  }
  next();
};

export const validateOnboardingIndividualStep2Middleware = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().required().max(100).messages({
      "string.required": messages.name.required,
      "string.max": messages.name.max,
    }),
    website: Joi.string()
      .allow("")
      .max(255)
      .pattern(/^(https?:\/\/)?([\w.-]+\.[a-z]{2,})$/i)
      .messages({
        "string.max": messages.website.max,
        "string.pattern.base": "Please enter a valid website.",
      }),
    address: Joi.string().required().max(255).messages({
      "string.required": messages.address.required,
      "string.max": messages.address.max,
    }),
  });
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });
  }
  next();
};

export const validateOnboardingCompanyStep2Middleware = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().required().max(100).messages({
      "string.required": messages.name.required,
      "string.max": messages.name.max,
    }),
    website: Joi.string()
      .allow("")
      .max(255)
      .pattern(/^(https?:\/\/)?([\w.-]+\.[a-z]{2,})$/i)
      .messages({
        "string.max": messages.website.max,
        "string.pattern.base": "Please enter a valid website.",
      }),
    address: Joi.string().required().max(255).messages({
      "string.required": messages.address.required,
      "string.max": messages.address.max,
    }),
    members: Joi.array()
      .items(
        Joi.string().email().messages({
          "string.email": messages.members.email,
        })
      )
      .required()
      .min(1)
      .messages({
        "array.min": messages.members.min,
        "array.required": messages.members.required,
      }),
  });
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });
  }
  next();
};
