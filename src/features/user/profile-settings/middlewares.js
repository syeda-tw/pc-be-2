import Joi from 'joi';
import { TIMEZONES } from '../../common/constants.js';

const validateUpdatePersonalInformationMiddleware = (req, res, next) => {
  const schema = Joi.object({
    firstName: Joi.string().trim().max(50).required().messages({
      'string.empty': 'First name is required',
      'string.max': 'First name cannot exceed 50 characters'
    }),
    lastName: Joi.string().trim().max(50).required().messages({
      'string.empty': 'Last name is required',
      'string.max': 'Last name cannot exceed 50 characters'
    }),
    middleName: Joi.string().trim().max(50).optional().messages({
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
    throw {
      code: 400,
      message: error.details[0].message
    };
  }
  next();
};

const validateUpdateTimezoneMiddleware = (req, res, next) => {
  const schema = Joi.object({
    timezone: Joi.string().trim().valid(...TIMEZONES.map(tz => tz.value)).required().messages({
      'string.empty': 'Timezone is required',
      'any.only': 'Invalid timezone'
    })
  });

  const { error } = schema.validate(req.body);
  if (error) {
    throw {
      code: 400,
      message: error.details[0].message
    };
  }
  next();
};

const validateAddRecurringHolidayMiddleware = (req, res, next) => {
  const schema = Joi.object({
    holiday: Joi.object({
      name: Joi.string().trim().max(50).required().messages({
        'string.empty': 'Holiday name is required',
        'string.max': 'Holiday name cannot exceed 50 characters'
      }),
      startMonth: Joi.number().min(1).max(12).required().messages({
        'number.base': 'Start month must be a number',
        'number.min': 'Start month must be between 1 and 12',
        'number.max': 'Start month must be between 1 and 12'
      }),
      startDay: Joi.number().min(1).max(31).required().messages({
        'number.base': 'Start day must be a number',
        'number.min': 'Start day must be between 1 and 31',
        'number.max': 'Start day must be between 1 and 31'
      }),
      endMonth: Joi.number().min(1).max(12).required().messages({
        'number.base': 'End month must be a number',
        'number.min': 'End month must be between 1 and 12',
        'number.max': 'End month must be between 1 and 12'
      }),
      endDay: Joi.number().min(1).max(31).required().messages({
        'number.base': 'End day must be a number',
        'number.min': 'End day must be between 1 and 31',
        'number.max': 'End day must be between 1 and 31'
      })
    }).required().messages({
      'object.base': 'Holiday is required',
      'object.empty': 'Holiday data is required'
    })
  });

  const { error } = schema.validate(req.body);
  if (error) {
    throw {
      code: 400,
      message: error.details[0].message
    };
  }
  next();
};

const validateAddSingleHolidayMiddleware = (req, res, next) => {
  const schema = Joi.object({
    holiday: Joi.object({
      name: Joi.string().trim().max(50).required().messages({
        'string.empty': 'Holiday name is required',
        'string.max': 'Holiday name cannot exceed 50 characters'
      }),
      startDate: Joi.date().required().messages({
        'date.base': 'Start date must be a valid date',
        'date.empty': 'Start date is required'
      }),
      endDate: Joi.date().required().messages({
        'date.base': 'End date must be a valid date',
        'date.empty': 'End date is required'
      })
    }).custom((value, helpers) => {
      const { startDate, endDate } = value;
      if (new Date(startDate) > new Date(endDate)) {
        return helpers.message('Start date must be before or equal to end date');
      }
      return value;
    }).required().messages({
      'object.base': 'Holiday is required',
      'object.empty': 'Holiday data is required'
    })
  });

  const { error } = schema.validate(req.body);
  if (error) {
    throw {
      code: 400,
      message: error.details[0].message
    };
  }
  next();
};

const validateDeleteHolidayMiddleware = (req, res, next) => {
  const schema = Joi.object({
    holidayId: Joi.string().length(24).hex().required().messages({
      'string.empty': 'Holiday ID is required',
      'string.length': 'Holiday ID must be a valid MongoDB ObjectId',
      'string.hex': 'Holiday ID must be a valid MongoDB ObjectId'
    })
  });

  const { error } = schema.validate(req.params);
  if (error) {
    throw {
      code: 400,
      message: error.details[0].message
    };
  }
  next();
};

const validateUpdateDailyLunchMiddleware = (req, res, next) => {
  const schema = Joi.object({
    startTime: Joi.string().trim().required(),
    endTime: Joi.string().trim().required()
  }).custom((value, helpers) => {
    const { startTime, endTime } = value;
    const startTimeDate = new Date(`1970-01-01T${startTime}`);
    const endTimeDate = new Date(`1970-01-01T${endTime}`);
    if (startTimeDate >= endTimeDate) {
      return helpers.message('Start time must be less than end time');
    }
    return value;
  }).required().messages({
    'object.empty': 'Daily lunch times are required'
  });

  const { error } = schema.validate(req.body);
  if (error) {
    throw {
      code: 400,
      message: error.details[0].message
    };
  }
  next();
};

const validateWeeklyScheduleMiddleware = (req, res, next) => {
  const schema = Joi.object({
    data: Joi.array().items(
      Joi.object({
        day: Joi.string().valid(
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday"
        ).required(),
        startTime: Joi.string().pattern(/^([01]\d|2[0-3]):[0-5]\d$/).required(),
        endTime: Joi.string().pattern(/^([01]\d|2[0-3]):[0-5]\d$/).required(),
        isOpen: Joi.boolean().required()
      })
    ).required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    throw {
      code: 400,
      message: error.details[0].message
    };
  }
  next();
};

export { 
  validateUpdatePersonalInformationMiddleware, 
  validateUpdateTimezoneMiddleware, 
  validateAddRecurringHolidayMiddleware,
  validateAddSingleHolidayMiddleware,
  validateDeleteHolidayMiddleware,
  validateUpdateDailyLunchMiddleware, 
  validateWeeklyScheduleMiddleware 
};