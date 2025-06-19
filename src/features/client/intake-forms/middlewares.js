import Joi from 'joi';
import messages from './messages.js';

const middlewareMessages = {
  relationshipIdRequired: 'We need the relationship ID to find your forms. Please make sure it\'s included in your request.',
  formIdRequired: 'We need the intake form ID to retrieve the specific form. Please make sure it\'s included in your request.',
  userIntakeFormIdRequired: 'We need the user intake form ID to process your form submission. Please make sure it\'s included in your request.',
  invalidFormFormat: 'Please provide a clear and descriptive name for your form. This helps us organize your documents better.',
  invalidParams: 'Some required information is missing from your request. Please check that all necessary parameters are included.',
  missingFormDetails: 'We need all the form details to process your request. Please make sure to include the relationship ID, form ID, and form name.'
};

export const getIntakeFormsMiddleware = async (req, res, next) => {
  const { relationshipId } = req.params;

  if (!relationshipId) {
    throw { status: 400, message: middlewareMessages.relationshipIdRequired };
  }

  return next();
};

export const getSingleIntakeFormMiddleware = async (req, res, next) => {
  const { userIntakeFormId } = req.params;

  if (!userIntakeFormId) {
    throw { status: 400, message: middlewareMessages.userIntakeFormIdRequired };
  }

  return next();
};

const createIntakeFormSchema = Joi.object({
  relationshipId: Joi.string().required().messages({
    "any.required": middlewareMessages.relationshipIdRequired,
    "string.base": middlewareMessages.relationshipIdRequired,
  }),
  userIntakeFormId: Joi.string().required().messages({
    "any.required": middlewareMessages.userIntakeFormIdRequired,
    "string.base": middlewareMessages.userIntakeFormIdRequired,
  }),
  formName: Joi.string().required().messages({
    "any.required": middlewareMessages.invalidFormFormat,
    "string.base": middlewareMessages.invalidFormFormat,
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
  const { userIntakeFormId, relationshipId, formUploadedByClientId } = req.params;

  if (!userIntakeFormId || !relationshipId || !formUploadedByClientId) {
    throw { status: 400, message: middlewareMessages.missingFormDetails };
  }

  return next();
};