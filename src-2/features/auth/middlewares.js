import Joi from 'joi';
import { messages } from './messages.js';

const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': messages.error.invalidEmailFormat,
    'any.required': messages.error.invalidEmailFormat,
  }),
  password: Joi.string().min(8).max(20).required().messages({
    'string.min': messages.error.invalidPasswordFormat,
    'string.max': messages.error.invalidPasswordFormat,
    'any.required': messages.error.invalidPasswordFormat,
  }),
});

const validateRegister = (req, res, next) => {
  const { error } = registerSchema.validate(req.body);

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  next(); // Validation passed, proceed to next middleware or controller
};

export default validateRegister;
