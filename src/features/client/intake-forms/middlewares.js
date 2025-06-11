import Joi from 'joi';

const messages = {
  relationshipIdRequired: 'We need the relationship ID to find your forms. Please make sure it\'s included in your request.',
  formIdRequired: 'We need the intake form ID to retrieve the specific form. Please make sure it\'s included in your request.',
  invalidFormFormat: 'Please provide a clear and descriptive name for your form. This helps us organize your documents better.',
  invalidParams: 'Some required information is missing from your request. Please check that all necessary parameters are included.',
  missingFormDetails: 'We need all the form details to process your request. Please make sure to include the relationship ID, form ID, and form name.'
};

export const getIntakeFormsMiddleware = async (req, res, next) => {
  const { relationshipId } = req.params;

  if (!relationshipId) {
    throw { status: 400, message: messages.relationshipIdRequired };
  }

  return next();
};

export const getSingleIntakeFormMiddleware = async (req, res, next) => {
  const { formId } = req.params;

  if (!formId) {
    throw { status: 400, message: messages.formIdRequired };
  }

  return next();
};

const createIntakeFormSchema = Joi.object({
  relationshipId: Joi.string().required().messages({
    "any.required": messages.relationshipIdRequired,
    "string.base": messages.relationshipIdRequired,
  }),
  formId: Joi.string().required().messages({
    "any.required": messages.formIdRequired,
    "string.base": messages.formIdRequired,
  }),
  formName: Joi.string().required().messages({
    "any.required": messages.invalidFormFormat,
    "string.base": messages.invalidFormFormat,
  }),
});

export const validateCreateIntakeFormMiddleware = (req, res, next) => {
  const { error } = createIntakeFormSchema.validate(req.body);
  if (error) {
    throw {
      code: 400,
      message: error.details[0].message,
    };
  }
  return next();
};

export const getSingleFormUploadedByClientMiddleware = async (req, res, next) => {
  const { formId, relationshipId, formUploadedByClientId } = req.params;

  if (!formId || !relationshipId || !formUploadedByClientId) {
    throw { status: 400, message: messages.missingFormDetails };
  }

  return next();
};