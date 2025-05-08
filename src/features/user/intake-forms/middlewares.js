import Joi from "joi";

const messages = {
  invalidFormIdFormat: "Oops! The form ID doesn't seem right. Could you check it again?",
  invalidFormFormat: "Hmm, the form format looks off. Let's try fixing it!",
};

const getSingleIntakeFormSchema = Joi.object({
  id: Joi.string().required().messages({
    "string.required": messages.invalidFormIdFormat,
  }),
});

const validateGetSingleIntakeFormMiddleware = (req, res, next) => {
  const { error } = getSingleIntakeFormSchema.validate(req.params);
  if (error) {
    return next({
      status: 400,
      message: error.details[0].message,
    });
  }
  next();
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
    return next({
      status: 400,
      message: error.details[0].message,
    });
  }
  next();
};

const deleteIntakeFormSchema = Joi.object({
  id: Joi.string().required().messages({
    "any.required": messages.invalidFormIdFormat,
  }),
});

const validateDeleteIntakeFormMiddleware = (req, res, next) => {
  const { error } = deleteIntakeFormSchema.validate(req.params);
  if (error) {
    return next({
      status: 400,
      message: error.details[0].message,
    });
  }
  next();
};

export {
  validateGetSingleIntakeFormMiddleware,
  validateCreateIntakeFormMiddleware,
  validateDeleteIntakeFormMiddleware,
};
