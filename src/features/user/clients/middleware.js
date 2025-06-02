import Joi from "joi";

export const createClientValidation = (req, res, next) => {
  const createClientSchema = Joi.object({
    firstName: Joi.string().required().messages({
      "any.required": "Please provide a first name",
      "string.empty": "Please provide a first name",
    }),
    lastName: Joi.string().required().messages({
      "any.required": "Please provide a last name",
      "string.empty": "Please provide a last name",
    }),
    phone: Joi.string()
      .pattern(/^\+1\d{10}$/)
      .required()
      .messages({
        "any.required": "Please provide a phone number",
        "string.empty": "Please provide a phone number",
        "string.pattern.base":
          "Please provide a valid US phone number (e.g. +12345678901)",
      }),
    email: Joi.string().email().allow(null, "").optional().messages({
      "string.email": "Please provide a valid email address",
    }),
  });

  const { error } = createClientSchema.validate(req.body.data);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });
  }
  next();
};
