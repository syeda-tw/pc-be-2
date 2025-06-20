import Joi from "joi";

export const validateGetRelationshipSessions = (req, res, next) => {
  const schema = Joi.object({
    relationshipId: Joi.string().trim().required().messages({
      "any.required": "Relationship id is required.",
      "string.empty": "Relationship id is required.",
    }),
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
    return res.status(400).json({ message: error.details[0].message });
  }

  req.query = value; // validated and defaulted query
  next();
};

const messages = {
  relationshipIdRequired: "Relationship ID is required.",
  formIdRequired: "Form ID is required.",
  formUploadedByClientIdRequired: "Form uploaded by client ID is required.",
  invalidParams: "Invalid parameters provided.",
  noteIdRequired: "Note ID is required.",
  noteContentRequired: "Note content is required.",
  invalidPagination: "Invalid pagination parameters.",
};

const getSingleFormUploadedByClientSchema = Joi.object({
  relationshipId: Joi.string().required().messages({
    "any.required": messages.relationshipIdRequired,
    "string.base": messages.relationshipIdRequired,
  }),
  userIntakeFormId: Joi.string().required().messages({
    "any.required": messages.formIdRequired,
    "string.base": messages.formIdRequired,
  }),
  formUploadedByClientId: Joi.string().required().messages({
    "any.required": messages.formUploadedByClientIdRequired,
    "string.base": messages.formUploadedByClientIdRequired,
  }),
});

export const validateGetSingleFormUploadedByClient = (req, res, next) => {
  const { error, value } = getSingleFormUploadedByClientSchema.validate(
    req.params,
    { abortEarly: false }
  );

  if (error) {
    throw {
      status: 400,
      message: error.details[0].message,
    };
  }

  req.params = value; // validated and defaulted params
  next();
};

const approveClientUploadedFormSchema = Joi.object({
  relationshipId: Joi.string().required().messages({
    "any.required": messages.relationshipIdRequired,
    "string.base": messages.relationshipIdRequired,
  }),
  formId: Joi.string().required().messages({
    "any.required": messages.formIdRequired,
    "string.base": messages.formIdRequired,
  }),
});

export const validateApproveClientUploadedForm = (req, res, next) => {
  const { error, value } = approveClientUploadedFormSchema.validate(
    req.params,
    { abortEarly: false }
  );

  if (error) {
    throw {
      status: 400,
      message: error.details[0].message,
    };
  }

  req.params = value; // validated and defaulted params
  next();
};

// Notes validation schemas
const getNotesSchema = Joi.object({
  relationshipId: Joi.string().required().messages({
    "any.required": messages.relationshipIdRequired,
    "string.base": messages.relationshipIdRequired,
  }),
  page: Joi.number().integer().min(1).default(1).messages({
    "number.base": "Page must be a positive integer.",
    "number.integer": "Page must be a positive integer.",
    "number.min": "Page must be a positive integer.",
  }),
  pageSize: Joi.number().integer().min(1).max(50).default(10).messages({
    "number.base": "Page size must be a positive integer.",
    "number.integer": "Page size must be a positive integer.",
    "number.min": "Page size must be at least 1.",
    "number.max": "Page size cannot exceed 50.",
  }),
});

const createNoteSchema = Joi.object({
  relationshipId: Joi.string().required().messages({
    "any.required": messages.relationshipIdRequired,
    "string.base": messages.relationshipIdRequired,
  }),
  content: Joi.string().required().trim().min(1).messages({
    "any.required": messages.noteContentRequired,
    "string.empty": messages.noteContentRequired,
    "string.base": messages.noteContentRequired,
  }),
});

const updateNoteSchema = Joi.object({
  relationshipId: Joi.string().required().messages({
    "any.required": messages.relationshipIdRequired,
    "string.base": messages.relationshipIdRequired,
  }),
  noteId: Joi.string().required().messages({
    "any.required": messages.noteIdRequired,
    "string.base": messages.noteIdRequired,
  }),
  content: Joi.string().required().trim().min(1).messages({
    "any.required": messages.noteContentRequired,
    "string.empty": messages.noteContentRequired,
    "string.base": messages.noteContentRequired,
  }),
});

const deleteNoteSchema = Joi.object({
  relationshipId: Joi.string().required().messages({
    "any.required": messages.relationshipIdRequired,
    "string.base": messages.relationshipIdRequired,
  }),
  noteId: Joi.string().required().messages({
    "any.required": messages.noteIdRequired,
    "string.base": messages.noteIdRequired,
  }),
});

// Notes validation middleware
export const validateGetNotes = (req, res, next) => {
  const { error, value } = getNotesSchema.validate(
    { ...req.params, ...req.query },
    { abortEarly: false }
  );

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  req.params = value;
  req.query = value;
  next();
};

export const validateCreateNote = (req, res, next) => {
  const { error, value } = createNoteSchema.validate(
    { ...req.params, ...req.body },
    { abortEarly: false }
  );

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  req.params = value;
  req.body = value;
  next();
};

export const validateUpdateNote = (req, res, next) => {
  const { error, value } = updateNoteSchema.validate(
    { ...req.params, ...req.body },
    { abortEarly: false }
  );

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  req.params = value;
  req.body = value;
  next();
};

export const validateDeleteNote = (req, res, next) => {
  const { error, value } = deleteNoteSchema.validate(
    req.params,
    { abortEarly: false }
  );

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  req.params = value;
  next();
};
