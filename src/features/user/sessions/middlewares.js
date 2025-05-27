import Joi from "joi";

const messages = {
  startDate: {
    invalid: "Please provide a valid start date",
    required: "Please select a start date to view your sessions"
  },
  endDate: {
    invalid: "Please provide a valid end date",
    afterStart: "The end date must be after the start date",
    required: "Please select an end date to view your sessions"
  }
};

export const getUserSessionsMiddleware = async (req, res, next) => {
  const schema = Joi.object({
    startDate: Joi.date().required().messages({
      "date.base": messages.startDate.invalid,
      "any.required": messages.startDate.required,
    }),
    endDate: Joi.date().required().min(Joi.ref("startDate")).messages({
      "date.base": messages.endDate.invalid,
      "date.min": messages.endDate.afterStart,
      "any.required": messages.endDate.required,
    }),
  });

  const { error } = schema.validate(req.params);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};
