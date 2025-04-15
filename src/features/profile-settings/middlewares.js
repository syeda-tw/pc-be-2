import Joi from 'joi';
import { timezones } from './constants.js';

const validateUpdatePersonalInformationMiddleware = (req, res, next) => {
  console.log(req.body);

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

const validateUpdateAvailabilityMiddleware = (req, res, next) => {
  const schema = Joi.object({
    availability: Joi.object({
      fixedLunch: Joi.boolean().default(false),
      fixedLunchStarttime: Joi.string().allow(''),
      fixedLunchEndtime: Joi.string().allow(''),
      week: Joi.array().items(
        Joi.object({
          day: Joi.string().required(),
          starttime: Joi.string().allow(''),
          endtime: Joi.string().allow(''),
          lunchstarttime: Joi.string().allow(''),
          lunchendtime: Joi.string().allow(''),
          isOpen: Joi.boolean().default(false)
        }).custom((value, helpers) => {
          if (!value.isOpen && (value.starttime || value.endtime)) {
            return helpers.message('Start and end times must be empty if the day is not open');
          }
          if (value.starttime && value.endtime && value.starttime >= value.endtime) {
            return helpers.message('Start time cannot be greater than or equal to end time');
          }
          return value;
        })
      ).required()
    }).required()
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

const validateUpdateHolidayMiddleware = (req, res, next) => {
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

export { validateUpdatePersonalInformationMiddleware, validateUpdateTimezoneMiddleware, validateUpdateAvailabilityMiddleware, validateUpdateHolidayMiddleware };