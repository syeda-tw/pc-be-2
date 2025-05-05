import Joi from 'joi';
import { timezones } from './constants.js';

const validateUpdatePersonalInformationMiddleware = (req, res, next) => {
  const schema = Joi.object({
    first_name: Joi.string().trim().max(50).required().messages({
      'string.empty': 'First name is required',
      'string.max': 'First name cannot exceed 50 characters'
    }),
    last_name: Joi.string().trim().max(50).required().messages({
      'string.empty': 'Last name is required',
      'string.max': 'Last name cannot exceed 50 characters'
    }),
    middle_name: Joi.string().trim().max(50).optional().messages({
      'string.max': 'Middle name cannot exceed 50 characters'
    }),
    pronouns: Joi.string().trim().max(20).optional().messages({
      'string.max': 'Pronouns cannot exceed 20 characters'
    }),
    gender: Joi.string().trim().max(20).optional().messages({
      'string.max': 'Gender cannot exceed 20 characters'
    }),
    date_of_birth: Joi.date().required().messages({
      'date.empty': 'Date of birth is required'
    }),
    phone: Joi.string().trim().max(20).allow('').optional().messages({
      'string.max': 'Phone number cannot exceed 20 characters'
    })
  });


  const { error } = schema.validate(req.body.data);

  if (error) {
    return res.status(400).json({
      errors: error.details.map(detail => ({
        message: detail.message,
        path: detail.path
      }))
    });
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

  const { error } = schema.validate(req.body.data);

  if (error) {
    console.log(error);
    return res.status(400).json({
      errors: error.details.map(detail => ({
        message: detail.message,
        path: detail.path
      }))
    });
  }

  next();
};


const validateAddHolidayMiddleware = (req, res, next) => {
  const schema = Joi.object({
    holiday: Joi.array().items(Joi.object({
      name: Joi.string().trim().max(50).required(),
      start_date: Joi.date().required(),
      end_date: Joi.date().required()
    })).required().messages({
      'array.empty': 'Holiday is required',
      'array.includes': 'Invalid data'
    })
  });

  const { error } = schema.validate(req.body.data);

  if (error) {
    return res.status(400).json({
      errors: error.details.map(detail => ({
        message: detail.message,
        path: detail.path
      }))
    });
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

  const { error } = schema.validate(req.body.data);

  if (error) {
    return res.status(400).json({
      errors: error.details.map(detail => ({
        message: detail.message,
        path: detail.path
      }))
    });
  }

  next();
}

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
        start_time: Joi.string().pattern(/^([01]\d|2[0-3]):[0-5]\d$/).required(),
        end_time: Joi.string().pattern(/^([01]\d|2[0-3]):[0-5]\d$/).required(),
        is_open: Joi.boolean().required()
      })
    ).required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: "error",
      message: error.details[0].message
    });
  }
  next();
};

export { validateUpdatePersonalInformationMiddleware, validateUpdateTimezoneMiddleware, validateAddHolidayMiddleware, validateUpdateDailyLunchMiddleware, validateWeeklyScheduleMiddleware };   