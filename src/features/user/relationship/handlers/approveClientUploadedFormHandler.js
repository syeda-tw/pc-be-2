import Relationship from "../../../../common/models/Relationship.js";

const messages = {
  success: {
    approveClientUploadedForm: "Client uploaded form approved successfully.",
  },
  error: {
    formNotFound: "Form not found.",
  },
};

const approveClientUploadedFormService = async (
  relationshipId,
  userId,
  formId,
  formUploadedByClientId
) => {
  console.log(
    "approveClientUploadedFormService",
    relationshipId,
    userId,
    formId
  );
  const relationship = await Relationship.findOne({
    _id: relationshipId,
    user: userId,
  });

  if (!relationship) {
    throw {
      code: 404,
      message: messages.error.formNotFound,
    };
  }

  const form = relationship.intakeForms.find(
    (form) => form._id.toString() === formId.toString()
  );

  if (!form) {
    throw {
      code: 404,
      message: messages.error.formNotFound,
    };
  }

  form.isMarkedComplete = true;

  // Check if all forms are approved
  const hasPendingForms = relationship.intakeForms.some(
    (form) => !form.isMarkedComplete
  );

  // If no pending forms, mark relationship as having all intake forms filled
  if (!hasPendingForms) {
    relationship.areIntakeFormsFilled = true;
  }

  await relationship.save();
  return {
    areIntakeFormsFilled: relationship.areIntakeFormsFilled,
  };
};

export const approveClientUploadedFormHandler = async (req, res, next) => {
  const { relationshipId, formId } = req.params;
  const userId = req.id;

  try {
    const { areIntakeFormsFilled } = await approveClientUploadedFormService(
      relationshipId,
      userId,
      formId,
    );
    res.status(200).json({
      message: messages.success.approveClientUploadedForm,
      areIntakeFormsFilled,
    });
  } catch (err) {
    next(err);
  }
};
