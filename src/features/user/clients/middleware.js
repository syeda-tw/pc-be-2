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

export const createBulkClientsValidation = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "Please upload a CSV file",
    });
  }

  // Check if file is CSV
  const allowedMimeTypes = ['text/csv', 'application/csv', 'text/plain'];
  const fileExtension = req.file.originalname.toLowerCase().split('.').pop();
  
  if (!allowedMimeTypes.includes(req.file.mimetype) && fileExtension !== 'csv') {
    return res.status(400).json({
      success: false,
      message: "Please upload a valid CSV file",
    });
  }

  // Check file size (limit to 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (req.file.size > maxSize) {
    return res.status(400).json({
      success: false,
      message: "File size too large. Please upload a file smaller than 5MB",
    });
  }

  next();
};
