import Joi from "joi";
import { messages } from "./messages.js";

const getSingleIntakeFormSchema = Joi.object({
  id: Joi.string().required().messages({
    "any.required": messages.error.invalidFormIdFormat,
  }),
});

const validateGetSingleIntakeFormMiddleware = (req, res, next) => {
  const { error } = getSingleIntakeFormSchema.validate(req.headers);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

const createIntakeFormSchema = Joi.object({
  form: Joi.object().required().messages({
    "any.required": messages.error.invalidFormFormat,
  }),
});

const validateCreateIntakeFormMiddleware = (req, res, next) => {
  const { error } = createIntakeFormSchema.validate(req.body.data);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

const deleteIntakeFormSchema = Joi.object({
  id: Joi.string().required().messages({
    "any.required": messages.error.invalidFormIdFormat,
  }),
});

const validateDeleteIntakeFormMiddleware = (req, res, next) => {
  const { error } = deleteIntakeFormSchema.validate(req.headers);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

export {
  validateGetSingleIntakeFormMiddleware,
  validateCreateIntakeFormMiddleware,
  validateDeleteIntakeFormMiddleware,
};
