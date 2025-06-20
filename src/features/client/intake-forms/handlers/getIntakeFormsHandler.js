import Relationship from '../../../../common/models/Relationship.js';

const messages = {
  intakeFormsNotFound: "Intake forms not found",
  forbidden: "You are not authorized to access this resource",
};

const getIntakeFormsService = async (relationshipId, userId) => {
  const relationship = await Relationship.findById(relationshipId);
  if (!relationship) {
    throw { status: 404, message: messages.intakeFormsNotFound };
  }
  if (relationship.client.toString() !== userId) {
    throw { status: 403, message: messages.forbidden };
  }
  return {
    areIntakeFormsComplete: relationship.areIntakeFormsComplete,
    relationshipIntakeForms: relationship.relationshipIntakeForms,
  };
};

const getIntakeFormsHandler = async (req, res, next) => {
  const { relationshipId } = req.params;
  const userId = req.id;
  try {
    const intakeForms = await getIntakeFormsService(relationshipId, userId);
    console.log("🔍 Intake forms:", intakeForms);
    res.status(200).json(intakeForms);
  } catch (error) {
    next(error);
  }
};

export default getIntakeFormsHandler;