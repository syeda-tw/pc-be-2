import Joi from 'joi';

export const onboardingStep1Middleware = (req, res, next) => {
    const onboardingStep1Schema = Joi.object({
        firstName: Joi.string().required().messages({
            'any.required': 'Please share your first name',
            'string.empty': 'Please share your first name'
        }),
        lastName: Joi.string().required().messages({
            'any.required': 'Please share your last name',
            'string.empty': 'Please share your last name'
        }),
        middleName: Joi.string().allow('').optional(),
        gender: Joi.string().valid("Male", "Female", "Non-Binary", "Prefer not to say").required().messages({
            'any.required': 'Please select your gender',
            'any.only': 'Please select a valid gender option'
        }),
        pronouns: Joi.string().allow('').required().valid("He/Him", "She/Her", "They/Them", "Prefer not to say").messages({
            'any.required': 'Please select your pronouns',
            'any.only': 'Please select a valid pronouns option'
        }),
        email: Joi.string().email().required().messages({
            'string.email': 'Please enter a valid email address',
            'any.required': 'Please share your email address'
        }),
        dateOfBirth: Joi.date().less('now').greater('1-1-1900').required().custom((value, helpers) => {
            const age = new Date().getFullYear() - new Date(value).getFullYear();
            if (age < 18) {
                return helpers.message('We require clients to be at least 18 years old');
            }
            return value;
        }).messages({
            'date.base': 'Please enter a valid date of birth',
            'date.less': 'Please enter a valid date of birth',
            'date.greater': 'Please enter a valid date of birth',
            'any.required': 'Please share your date of birth'
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
        setupIntentId: Joi.string().required().messages({
            'any.required': 'Please complete the payment setup',
            'string.empty': 'Please complete the payment setup'
        })
    });
    const { error } = onboardingStep2Schema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    next();
};

export const bookFirstSessionMiddleware = (req, res, next) => {
  const bookFirstSessionSchema = Joi.object({
    relationshipId: Joi.string()
      .required()
      .messages({
        'string.base': 'We encountered an issue. Please try again.',
        'string.empty': 'Please select a practitioner to book with.',
        'any.required': 'Please select a practitioner to book with.',
      }),

    date: Joi.date()
      .required()
      .min('now')
      .messages({
        'date.base': 'Please select a valid date.',
        'date.min': 'Please select a date today or in the future.',
        'any.required': 'Please select a date for your session.',
      }),

    startTime: Joi.date()
      .required()
      .min(new Date())
      .messages({
        'date.base': 'Please select a valid start time.',
        'date.min': 'Please select a time in the future.',
        'any.required': 'Please select a start time for your session.',
      }),

    endTime: Joi.date()
      .required()
      .min(Joi.ref('startTime'))
      .messages({
        'date.base': 'Please select a valid end time.',
        'date.min': 'Please select an end time after the start time.',
        'any.required': 'Please select an end time for your session.',
      }),

    cost: Joi.number()
      .required()
      .messages({
        'number.base': 'Please enter a valid cost amount.',
        'any.required': 'Please enter the cost for your session.',
      }),
  });

  const { error } = bookFirstSessionSchema.validate(req.body);

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  next();
};