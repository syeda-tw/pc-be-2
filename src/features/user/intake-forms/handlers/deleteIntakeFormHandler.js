import { env } from '../../../../common/config/env.js';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import User from '../../../../common/models/User.js';
import Relationship from '../../../../common/models/Relationship.js';

const messages = {
  formNotFound: "We couldn't find the form you're looking for. Please check the form ID and try again.",
  failedToFindForm: "We're having trouble finding your form. Please try again in a moment.",
  failedToDeleteFileFromS3: "We're having trouble removing your form file. Please try again in a moment.",
  failedToRemoveFormFromUserDocument: "We're having trouble updating your form list. Please try again in a moment.",
  deleteIntakeFormSuccess: "Your form has been successfully deleted.",
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
    // Find the form
    const user = await User.findById(userId).select('forms');
    if (!user || !user.forms.some(form => form._id.toString() === formId)) {
      throw {
        code: 404,
        message: messages.formNotFound,
      };
    }

    const form = user.forms.find(form => form._id.toString() === formId);

    // Delete from S3
    const deleteParams = {
      Bucket: env.AWS_S3_BUCKET_NAME,
      Key: form._id,
    };

    try {
      await s3Client.send(new DeleteObjectCommand(deleteParams));
    } catch (error) {
      console.error("Error deleting file from S3:", error);
      throw {
        code: 500,
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
        // Remove the form from intakeForms array
        relationship.intakeForms = relationship.intakeForms.filter(
          intakeForm => intakeForm.formId.toString() !== formId
        );
        
        // Check if all remaining forms are marked as complete
        const allFormsComplete = relationship.intakeForms.every(
          form => form.isMarkedComplete
        );
        
        // Update areIntakeFormsFilled based on remaining forms' completion status
        // If there are no forms left, set to true
        relationship.areIntakeFormsFilled = relationship.intakeForms.length === 0 || 
          (relationship.intakeForms.length > 0 && allFormsComplete);
        
        await relationship.save();
      }
    } catch (error) {
      console.error("Error removing form from user document:", error);
      throw {
        code: 500,
        message: messages.failedToRemoveFormFromUserDocument,
      };
    }
  } catch (error) {
    console.error("Error in deleteIntakeFormService:", error);
    throw {
      code: error.code || 500,
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
  } catch (err) {
    next(err);
  }
};