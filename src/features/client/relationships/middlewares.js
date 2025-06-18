import Joi from "joi";

const messages = {
  relationshipIdRequired: "Relationship ID is required",
  emptyBody: "Request body cannot be empty",
};

const switchDefaultRelationshipSchema = Joi.object({
  relationshipId: Joi.string().required().messages({
    "any.required": messages.relationshipIdRequired,
    "string.base": messages.relationshipIdRequired,
    "string.empty": messages.relationshipIdRequired,
  }),
});

export const validateSwitchDefaultRelationshipMiddleware = (req, res, next) => {
  try {
    const data = req.body;
    if (!data || Object.keys(data).length === 0) {
      throw {
        status: 400,
        message: messages.emptyBody,
      };
    }
    
    const { error } = switchDefaultRelationshipSchema.validate(data);
    if (error) {
      throw {
        status: 400,
        message: error.details[0].message,
      };
    }
    next();
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
}; 