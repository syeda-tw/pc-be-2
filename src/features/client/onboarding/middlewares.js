import Joi from 'joi';

export const onboardingStep1Middleware = (req, res, next) => {
    const onboardingStep1Schema = Joi.object({
        first_name: Joi.string().required(),
        last_name: Joi.string().required(),
        middle_name: Joi.string().allow('').optional(),
        gender: Joi.string().valid("Male", "Female", "Non-Binary", "Prefer not to say").required(),
        pronouns: Joi.string().allow('').required().valid("He/Him", "She/Her", "They/Them", "Prefer not to say"),
        email: Joi.string().email().required(),
        date_of_birth: Joi.date().less('now').greater('1-1-1900').required().custom((value, helpers) => {
            const age = new Date().getFullYear() - new Date(value).getFullYear();
            if (age < 18) {
                return helpers.message('Date of birth must indicate age above 18');
            }
            return value;
        })
    });
    const { error } = onboardingStep1Schema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    next();
};

export const onboardingStep2Middleware = (req, res, next) => {
    const onboardingStep2Schema = Joi.object({
        paymentMethod: Joi.string().required()
    });
    const { error } = onboardingStep2Schema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    next();
};

export const onboardingStep3Middleware = (req, res, next) => {
    // Logic for onboarding step 3
    console.log("Onboarding Step 3");
    next();
};
