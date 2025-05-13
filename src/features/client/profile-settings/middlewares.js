import Joi from 'joi';

export const validateUpdatePersonalInformationMiddleware = (req, res, next) => {
  const schema = Joi.object({
    firstName: Joi.string().trim().max(50).required().messages({
      'string.empty': 'First name is required',
      'string.max': 'First name cannot exceed 50 characters'
    }),
    lastName: Joi.string().trim().max(50).required().messages({
      'string.empty': 'Last name is required',
      'string.max': 'Last name cannot exceed 50 characters'
    }),
    middleName: Joi.string().trim().max(50).optional().allow('', null).messages({
      'string.max': 'Middle name cannot exceed 50 characters'
    }),
    pronouns: Joi.string().trim().max(20).optional().messages({
      'string.max': 'Pronouns cannot exceed 20 characters'
    }),
    gender: Joi.string().trim().max(20).optional().messages({
      'string.max': 'Gender cannot exceed 20 characters'
    }),
    dateOfBirth: Joi.date().required().messages({
      'date.empty': 'Date of birth is required'
    }),
  });


  const { error } = schema.validate(req.body);

  if (error) {
    const errorMessage = error.details.map(detail => detail.message).join(', ');
    throw {
      message: errorMessage,
      status: 400,
    };
  }
  next();
};