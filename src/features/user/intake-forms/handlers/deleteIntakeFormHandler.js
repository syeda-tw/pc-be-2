import { env } from '../../../../common/config/env.js';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import User from '../../../../common/models/User.js'; // Import User model

const messages = {
  formNotFound: "Form not found",
  failedToFindForm: "Failed to find form",
  failedToDeleteFileFromS3: "Failed to delete file from S3",
  failedToRemoveFormFromUserDocument: "Failed to remove form from user document",
  deleteIntakeFormSuccess: "Intake form successfully deleted", // Added missing message
};

const s3Client = new S3Client({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});

const deleteIntakeFormService = async (formId, userId) => {
  try {
    // Try to find the form
    let user;
    try {
      user = await User.findById(userId).select('forms');
      if (!user || !user.forms.some(form => form._id.toString() === formId)) {
        throw({
          status: 404,
          message: messages.formNotFound,
        });
      }
    } catch (error) {
      console.error("Error finding form to delete:", error);
      throw({
        status: 500,
        message: messages.failedToFindForm,
      });
    }

    const form = user.forms.find(form => form._id.toString() === formId);

    // Try to delete from S3
    try {
      const deleteParams = {
        Bucket: env.AWS_S3_BUCKET_NAME || "default-bucket-name",
        Key: form._id,
      };

      const deleteCommand = new DeleteObjectCommand(deleteParams);
      await s3Client.send(deleteCommand);
    } catch (error) {
      console.error("Error deleting file from S3:", error);
      throw({
        status: 500,
        message: messages.failedToDeleteFileFromS3,
      });
    }

    // Try to update user document
    try {
      await User.findByIdAndUpdate(userId, {
        $pull: { forms: { _id: formId } },
      });
    } catch (error) {
      console.error("Error removing form from user document:", error);
      throw({
        status: 500,
        message: messages.failedToRemoveFormFromUserDocument,
      });
    }

    return;
  } catch (error) {
    console.error("Error in deleteIntakeFormService:", error);
    throw({
      status: 500,
      message: messages.failedToRemoveFormFromUserDocument,
    });
  }
};

export const deleteIntakeFormHandler = async (req, res, next) => {
  try {
    await deleteIntakeFormService(req.params.id, req.id);
    return res.status(200).json({
      message: messages.deleteIntakeFormSuccess,
    });
  } catch (err) {
    next(err);
  }
};