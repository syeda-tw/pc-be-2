import Joi from 'joi';

export const validateRegisterStep1Middleware = (req, res, next) => {
    const schema = Joi.object({
        phone: Joi.string()
            .pattern(/^\+?1?[2-9]\d{9}$/, 'US phone number')
            .required()
            .messages({
                'string.pattern.name': 'Please enter a valid US phone number',
                'any.required': 'Phone number is required'
            })
    });

    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    next();
};

export const validateOtpVerificationMiddleware = (req, res, next) => {
    const schema = Joi.object({
        phone: Joi.string()
            .pattern(/^\+?1?[2-9]\d{9}$/, 'US phone number')
            .required()
            .messages({
                'string.pattern.name': 'Please enter a valid US phone number',
                'any.required': 'Phone number is required'
            }),
        otp: Joi.string()
            .length(5)
            .pattern(/^[0-9]+$/, 'numbers')
            .required()
            .messages({
                'string.length': 'OTP must be exactly 5 characters long',
                'string.pattern.name': 'OTP must contain only {#name}',
                'any.required': 'OTP is required'
            })
    });

    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    next();
};