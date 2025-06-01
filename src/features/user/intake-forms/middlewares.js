import Joi from "joi";

const messages = {
  invalidFormIdFormat: "Please provide a valid form ID to continue.",
  invalidFormFormat: "Please provide a valid form name to continue.",
};

const getSingleIntakeFormSchema = Joi.object({
  id: Joi.string().required().messages({
    "string.required": messages.invalidFormIdFormat,
  }),
});

const validateGetSingleIntakeFormMiddleware = (req, res, next) => {
  const { error } = getSingleIntakeFormSchema.validate(req.params);
  if (error) {
    throw {
      code: 400,
      message: error.details[0].message,
    };
  }
  return next();
};

const createIntakeFormSchema = Joi.object({
  formName: Joi.string().required().messages({
    "any.required": messages.invalidFormFormat,
    "string.base": messages.invalidFormFormat,
  }),
});

const validateCreateIntakeFormMiddleware = (req, res, next) => {
  const { error } = createIntakeFormSchema.validate(req.body);
  if (error) {
    throw {
      code: 400,
      message: error.details[0].message,
    };
  }
  return next();
};

const deleteIntakeFormSchema = Joi.object({
  id: Joi.string().required().messages({
    "any.required": messages.invalidFormIdFormat,
  }),
});

const validateDeleteIntakeFormMiddleware = (req, res, next) => {
  const { error } = deleteIntakeFormSchema.validate(req.params);
  if (error) {
    throw {
      code: 400,
      message: error.details[0].message,
    };
  }
  return next();
};

export {
  validateGetSingleIntakeFormMiddleware,
  validateCreateIntakeFormMiddleware,
  validateDeleteIntakeFormMiddleware,
};
