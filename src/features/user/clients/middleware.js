
import Joi from 'joi';

export const createClientValidation = (req, res, next) => {

    const createClientSchema = Joi.object({
        firstName: Joi.string().required().messages({
            'any.required': 'First name is required',
            'string.empty': 'First name is required'
        }),
        lastName: Joi.string().required().messages({
            'any.required': 'Last name is required',
            'string.empty': 'Last name is required'
        }),
        phone: Joi.string().pattern(/^\+1\d{10}$/).required().messages({
            'any.required': 'Phone is required',
            'string.empty': 'Phone is required',
            'string.pattern.base': 'Phone number must be a valid US number'
        }),
        email: Joi.string().email().allow(null, '').optional().messages({
            'string.email': 'Invalid email format'
        })
    });

    const { error } = createClientSchema.validate(req.body.data);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    next();
};
