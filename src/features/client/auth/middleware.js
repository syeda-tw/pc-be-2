import Joi from 'joi';

const validateRegisterMiddleware = (req, res, next) => {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(8).regex(/[a-z]/).regex(/[A-Z]/).regex(/[0-9]/).regex(/[@$!%*?&#]/).required(),
        phone: Joi.string().pattern(/^[0-9]+$/).required(),
        code: Joi.string().length(5).pattern(/^[0-9]+$/).required()
    });

    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    next();
}

export { validateRegisterMiddleware };