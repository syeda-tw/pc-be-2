import Joi from 'joi';

export const onboardingStep1Middleware = (req, res, next) => {
    const onboardingStep1Schema = Joi.object({
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        middleName: Joi.string().allow('').optional(),
        gender: Joi.string().valid("Male", "Female", "Non-Binary", "Prefer not to say").required(),
        pronouns: Joi.string().allow('').required().valid("He/Him", "She/Her", "They/Them", "Prefer not to say"),
        email: Joi.string().email().required(),
        dateOfBirth: Joi.date().less('now').greater('1-1-1900').required().custom((value, helpers) => {
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
        setupIntentId: Joi.string().required(),
    });
    const { error } = onboardingStep2Schema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    next();
};

export const onboardingStep3Middleware = (req, res, next) => {
    // Logic for onboarding step 3
    if (!Array.isArray(req.body.userIds) || !req.body.userIds.every(item => typeof item === 'string')) {
        return res.status(400).json({ message: 'You must select at least one therapist' });
    }
    next();
};


export const bookFirstAppointmentMiddleware = (req, res, next) => {
  const bookFirstAppointmentSchema = Joi.object({
    relationshipId: Joi.string()
      .required()
      .messages({
        'string.base': 'Something went wrong. Please try again.',
        'string.empty': 'Please provide a valid relationship.',
        'any.required': 'A relationship is required to book your appointment.',
      }),

    startTime: Joi.date()
      .required()
      .min(new Date())
      .messages({
        'date.base': 'Please enter a valid start time.',
        'date.min': 'Start time must be in the future.',
        'any.required': 'Start time is required to schedule your appointment.',
      }),

    endTime: Joi.date()
      .required()
      .min(Joi.ref('startTime'))
      .messages({
        'date.base': 'Please enter a valid end time.',
        'date.min': 'End time must be after the start time.',
        'any.required': 'End time is required to schedule your appointment.',
      }),

    cost: Joi.number()
      .required()
      .messages({
        'number.base': 'Please provide a valid cost amount.',
        'any.required': 'Cost is required to proceed with payment.',
      }),
  });

  const { error } = bookFirstAppointmentSchema.validate(req.body);

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  next();
};