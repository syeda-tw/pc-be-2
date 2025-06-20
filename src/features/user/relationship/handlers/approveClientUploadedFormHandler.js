import Relationship, { relationshipTimelineEntries } from "../../../../common/models/Relationship.js";

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
  userIntakeFormId,
) => {
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

  const form = relationship.relationshipIntakeForms.find(
    (form) => form.userIntakeFormId.toString() === userIntakeFormId.toString()
  );

  if (!form) {
    throw {
      code: 404,
      message: messages.error.formNotFound,
    };
  }

  form.status = "userAccepted";

  // Add timeline entry for form acceptance
  const timelineEntry = relationshipTimelineEntries.intakeFormResponseAccepted(
    form.intakeFormResponsesUploadedByClient[0]?.reponseFormName || "form response",
    form.userIntakeFormName
  );
  
  relationship.timeline.push({
    event: timelineEntry
  });

  const hasPendingForms = relationship.relationshipIntakeForms.some(
    (form) => form.status !== "userAccepted"
  );

  if (!hasPendingForms) {
    relationship.areIntakeFormsComplete = true;
    // Add timeline entry for all forms being complete
    const completeTimelineEntry = relationshipTimelineEntries.intakeFormsMarkedAsComplete();
    relationship.timeline.push({
      event: completeTimelineEntry
    });
  }

  await relationship.save();
  
  const result = {
    areIntakeFormsComplete: relationship.areIntakeFormsComplete,
  };
  return result;
};

const approveClientUploadedFormHandler = async (req, res, next) => {
  const { relationshipId, userIntakeFormId } = req.params;
  const userId = req.id;

  try {
    const { areIntakeFormsComplete } = await approveClientUploadedFormService(
      relationshipId,
      userId,
      userIntakeFormId,
    );
    res.status(200).json({
      message: messages.success.approveClientUploadedForm,
      areIntakeFormsComplete,
    });
  } catch (err) {
    next(err);
  }
};

export default approveClientUploadedFormHandler;