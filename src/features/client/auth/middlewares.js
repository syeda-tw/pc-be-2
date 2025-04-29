import Joi from 'joi';

const validateRegisterMiddleware = (req, res, next) => {
    const schema = Joi.object({
        password: Joi.string()
            .min(8)
            .regex(/[a-z]/, 'lowercase letter')
            .regex(/[A-Z]/, 'uppercase letter')
            .regex(/[0-9]/, 'number')
            .regex(/[@$!%*?&#]/, 'special character')
            .required()
            .messages({
                'string.min': 'Password must be at least 8 characters long',
                'string.pattern.name': 'Password must contain at least one {#name}',
                'any.required': 'Password is required'
            }),
        confirmPassword: Joi.string()
            .valid(Joi.ref('password'))
            .required()
            .messages({
                'any.only': 'Confirm password must match password',
                'any.required': 'Confirm password is required'
            }),
        phone: Joi.string()
            .pattern(/^\+?[0-9]+$/, 'numbers')
            .required()
            .messages({
                'string.pattern.name': 'Phone must contain only {#name}',
                'any.required': 'Phone is required'
            }),
        code: Joi.string()
            .min(5)
            .max(10)
            .required()
            .messages({
                'string.min': 'Code must be at least 5 characters long',
                'string.max': 'Code must be at most 10 characters long',
                'string.pattern.name': 'Code must contain only {#name}',
                'any.required': 'Code is required'
            })
    });

    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    next();
}

const validateLoginMiddleware = (req, res, next) => {
    const schema = Joi.object({
        phone: Joi.string()
            .pattern(/^\+?[0-9]+$/, 'numbers')
            .required()
            .messages({
                'string.pattern.name': 'Phone must contain only {#name}',
                'any.required': 'Phone is required'
            }),
        password: Joi.string()
            .required()
            .messages({
                'any.required': 'Password is required'
            })
    });

    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    next();
}

export { validateRegisterMiddleware, validateLoginMiddleware };