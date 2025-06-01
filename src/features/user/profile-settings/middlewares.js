import Joi from 'joi';
import { timezones } from './constants.js';

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
    timezone: Joi.string().trim().valid(...timezones).required().messages({
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

const validateAddHolidayMiddleware = (req, res, next) => {
  const schema = Joi.object({
    holiday: Joi.array().items(Joi.object({
      name: Joi.string().trim().max(50).required(),
      startDate: Joi.date().required(),
      endDate: Joi.date().required()
    })).required().messages({
      'array.empty': 'Holiday is required',
      'array.includes': 'Invalid data'
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
  validateAddHolidayMiddleware, 
  validateUpdateDailyLunchMiddleware, 
  validateWeeklyScheduleMiddleware 
};