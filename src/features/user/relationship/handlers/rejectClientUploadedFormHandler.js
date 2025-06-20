import Relationship, { relationshipTimelineEntries } from "../../../../common/models/Relationship.js";

const messages = {
  success: {
    rejectClientUploadedForm: "Client uploaded form rejected successfully.",
  },
  error: {
    formNotFound: "Form not found.",
  },
};

const rejectClientUploadedFormService = async (
  relationshipId,
  userId,
  userIntakeFormId,
) => {
  console.log("🔍 [Service] Starting rejectClientUploadedFormService");
  console.log("📝 [Service] Parameters:", { relationshipId, userId, userIntakeFormId });

  const relationship = await Relationship.findOne({
    _id: relationshipId,
    user: userId,
  });

  console.log("🔍 [Service] Relationship found:", !!relationship);

  if (!relationship) {
    console.log("❌ [Service] Relationship not found");
    throw {
      code: 404,
      message: messages.error.formNotFound,
    };
  }

  const form = relationship.relationshipIntakeForms.find(
    (form) => form.userIntakeFormId.toString() === userIntakeFormId.toString()
  );

  console.log("🔍 [Service] Form found:", !!form);
  console.log("📋 [Service] Available forms:", relationship.relationshipIntakeForms.map(f => ({ 
    userIntakeFormId: f.userIntakeFormId, 
    status: f.status 
  })));

  if (!form) {
    console.log("❌ [Service] Form not found in relationship");
    throw {
      code: 404,
      message: messages.error.formNotFound,
    };
  }

  console.log("✅ [Service] Form found, updating status to userRejected");
  form.status = "userRejected";

  // Add timeline entry for form rejection
  const timelineEntry = relationshipTimelineEntries.intakeFormResponseRejected(
    form.intakeFormResponsesUploadedByClient[0]?.reponseFormName || "form response",
    form.userIntakeFormName
  );
  console.log("📅 [Service] Adding timeline entry:", timelineEntry);
  
  relationship.timeline.push({
    event: timelineEntry
  });

  // Check if all forms are approved (status is userAccepted)
  const hasPendingForms = relationship.relationshipIntakeForms.some(
    (form) => form.status !== "userAccepted"
  );

  console.log("🔍 [Service] Has pending forms:", hasPendingForms);

  // If there are rejected forms, ensure areIntakeFormsComplete is false
  if (form.status === "userRejected") {
    console.log("❌ [Service] Form rejected, ensuring areIntakeFormsComplete is false");
    relationship.areIntakeFormsComplete = false;
  }

  console.log("💾 [Service] Saving relationship");
  await relationship.save();
  
  const result = {
    areIntakeFormsComplete: relationship.areIntakeFormsComplete,
  };
  console.log("✅ [Service] Service completed successfully:", result);
  return result;
};

const rejectClientUploadedFormHandler = async (req, res, next) => {
  console.log("🚀 [Handler] Starting rejectClientUploadedFormHandler");
  const { relationshipId, userIntakeFormId } = req.params;
  const userId = req.id;

  console.log("📝 [Handler] Request parameters:", { relationshipId, userIntakeFormId, userId });

  try {
    const { areIntakeFormsComplete } = await rejectClientUploadedFormService(
      relationshipId,
      userId,
      userIntakeFormId,
    );
    console.log("✅ [Handler] Service call successful, sending response");
    res.status(200).json({
      message: messages.success.rejectClientUploadedForm,
      areIntakeFormsComplete,
    });
  } catch (err) {
    console.log("❌ [Handler] Error occurred:", err);
    next(err);
  }
};

export default rejectClientUploadedFormHandler; 