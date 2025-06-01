import Joi from "joi";

export const validateGetSessions = (req, res, next) => {
  const schema = Joi.object({
    startDate: Joi.date().iso().required().messages({
      "any.required": "Start date is required.",
      "date.format": "Invalid date format for startDate.",
      "date.base": "Invalid date format for startDate.",
    }),
    endDate: Joi.date().iso().required().messages({
      "any.required": "End date is required.",
      "date.format": "Invalid date format for endDate.",
      "date.base": "Invalid date format for endDate.",
    }),
    page: Joi.number().integer().min(1).default(1).messages({
      "number.base": "Page must be a positive integer.",
      "number.integer": "Page must be a positive integer.",
      "number.min": "Page must be a positive integer.",
    }),
  });

  const { error, value } = schema.validate(req.query, { abortEarly: false });

  if (error) {
    throw {
      status: 400,
      message: error.details[0].message,
    };
  }

  req.query = value; // validated and defaulted query
  next();
};

export const validateGetUserAvailabilityAndSessionDuration = (req, res, next) => {
  const schema = Joi.object({
    relationshipId: Joi.string().required().messages({
      "any.required": "Relationship ID is required.",
      "string.base": "Relationship ID must be a string.",
    }),
  });

  const { error, value } = schema.validate(req.params, { abortEarly: false });

  if (error) {
    throw {
      status: 400,
      message: error.details[0].message,
    };
  }

  req.params = value; // validated and defaulted query
  next();
};

export const validateGetUserFutureSessions = (req, res, next) => {
  const schema = Joi.object({
    relationshipId: Joi.string().required().messages({
      "any.required": "Relationship ID is required.",
      "string.base": "Relationship ID must be a string.",
    }),
  });

  const { error, value } = schema.validate(req.params, { abortEarly: false });

  if (error) {
    throw {
      status: 400,
      message: error.details[0].message,
    };
  }

  req.params = value; // validated and defaulted query
  next();
};
