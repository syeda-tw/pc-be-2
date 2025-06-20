import { env } from "../../../../common/config/env.js";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import User from "../../../../common/models/User.js";
import Relationship, { relationshipTimelineEntries } from "../../../../common/models/Relationship.js";
import messages from "../messages.js";

const s3Client = new S3Client({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});

export const deleteIntakeFormService = async (formId, userId) => {
  try {
    // Find the form
    const user = await User.findById(userId).select("forms");
    if (!user || !user.forms.some((form) => form._id.toString() === formId)) {
      throw {
        status: 404,
        message: messages.formNotFound,
      };
    }

    const form = user.forms.find((form) => form._id.toString() === formId);

    // Delete from S3
    const deleteParams = {
      Bucket: env.AWS_S3_BUCKET_NAME,
      Key: form._id.toString(),
    };

    try {
      await s3Client.send(new DeleteObjectCommand(deleteParams));
    } catch (error) {
      console.error("Error deleting file from S3:", error);
      throw {
        status: 500,
        message: messages.failedToDeleteFileFromS3,
      };
    }

    // Update user document
    try {
      await User.findByIdAndUpdate(userId, {
        $pull: { forms: { _id: formId } },
      });

      // Find and update all relationships for this user
      const relationships = await Relationship.find({ user: userId });

      for (const relationship of relationships) {
        // Remove the form from relationshipIntakeForms array
        relationship.relationshipIntakeForms =
          relationship.relationshipIntakeForms.filter(
            (intakeForm) =>
              intakeForm.userIntakeFormId &&
              intakeForm.userIntakeFormId.toString() !== formId
          );
        relationship.timeline.push({
          event: relationshipTimelineEntries.userRemovedIntakeForm(form.name),
        });

        // Update areIntakeFormsComplete
        relationship.areIntakeFormsComplete =
          relationship.relationshipIntakeForms.length === 0;
        if (relationship.areIntakeFormsComplete) {
          relationship.timeline.push({
            event: relationshipTimelineEntries.intakeFormsMarkedAsComplete(),
          });
        }
        await relationship.save();
      }
    } catch (error) {
      console.error("Error removing form from user document:", error);
      throw {
        status: 500,
        message: messages.failedToRemoveFormFromUserDocument,
      };
    }
  } catch (error) {
    console.error("Error in deleteIntakeFormService:", error);
    throw {
      status: error.status || 500,
      message: error.message || messages.failedToRemoveFormFromUserDocument,
    };
  }
};

export const deleteIntakeFormHandler = async (req, res, next) => {
  try {
    await deleteIntakeFormService(req.params.id, req.id);
    return res.status(200).json({
      message: messages.deleteIntakeFormSuccess,
    });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};
