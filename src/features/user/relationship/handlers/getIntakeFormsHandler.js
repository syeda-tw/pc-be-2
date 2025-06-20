import Relationship from '../../../../common/models/Relationship.js';

const messages = {
  success: {
    getIntakeForms: "We've successfully retrieved your intake forms!",
  },
  error: {
    relationshipNotFound: "We couldn't find the relationship you're looking for. Please check the details and try again.",
    unauthorized: "We're unable to show you these intake forms. Please make sure you have the right permissions.",
  },
};

const getIntakeFormsService = async (relationshipId, id) => {
  const relationship = await Relationship.findById(relationshipId);
  if (!relationship) {
    throw { status: 404, message: messages.error.relationshipNotFound };
  }
  if (relationship.user.toString() !== id.toString()) {
    throw { status: 403, message: messages.error.unauthorized };
  }
  return {
    areIntakeFormsComplete: relationship.areIntakeFormsComplete,
    relationshipIntakeForms: relationship.relationshipIntakeForms,
  };
};

const getIntakeFormsHandler = async (req, res, next) => {
  const { relationshipId } = req.query;
  const id = req.id;
 
  try {
    const data = await getIntakeFormsService(relationshipId, id);

    res.status(200).json({
      data,
      message: messages.success.getIntakeForms,
    });
  } catch (error) {
    next(error);
  }
};

export default getIntakeFormsHandler;