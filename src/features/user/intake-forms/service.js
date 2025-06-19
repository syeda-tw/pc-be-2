import { env } from "../../../common/config/env.js";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import User from "../../../common/models/User.js";
import Relationship from "../../../common/models/Relationship.js";
import messages from "./messages.js";

const s3Client = new S3Client({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});

export const createIntakeFormService = async (id, file, formName) => {
  try {
    const userId = id;
    const { buffer, mimetype } = file;

    if (!buffer || buffer.length === 0) {
      throw {
        status: 400,
        message: messages.invalidFileContent,
      };
    }

    const formDetails = {
      name: formName,
    };

    const user = await User.findById(userId);
    if (!user) {
      throw {
        status: 404,
        message: messages.userNotFound,
      };
    }

    // Check if user already has 10 forms (maximum limit)
    if (user.forms && user.forms.length >= 10) {
      throw {
        status: 400,
        message: messages.maxFormsReached,
      };
    }

    // Update user with new form (ID will be auto-generated)
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $push: { forms: formDetails } },
      { new: true }
    );

    // Get the newly created form with auto-generated ID
    const newForm = updatedUser.forms[updatedUser.forms.length - 1];

    // Find all relationships for this user and update their relationshipIntakeForms
    const relationships = await Relationship.find({ user: userId });
    for (const relationship of relationships) {
      relationship.relationshipIntakeForms.push({
        userIntakeFormId: newForm._id,
        userIntakeFormName: formName,
        intakeFormResponsesUploadedByClient: [],
        status: "user_added",
      });
      relationship.areAllIntakeFormsFilled = false;
      await relationship.save();
    }

    const params = {
      Bucket: env.AWS_S3_BUCKET_NAME,
      Key: newForm._id.toString(),
      Body: buffer,
      ContentType: mimetype || "application/pdf",
    };

    try {
      await s3Client.send(new PutObjectCommand(params));
    } catch (error) {
      console.error("Error uploading file to S3:", error);
      throw {
        status: 500,
        message: messages.failedToUploadFileToS3,
      };
    }

    return newForm;
  } catch (error) {
    console.error("Error in createIntakeFormService:", error);
    throw {
      status: error.status || 500,
      message: error.message || messages.failedToUpdateUserWithFormDetails,
    };
  }
};

export const deleteIntakeFormService = async (formId, userId) => {
  try {
    // Find the form
    const user = await User.findById(userId).select('forms');
    if (!user || !user.forms.some(form => form._id.toString() === formId)) {
      throw {
        status: 404,
        message: messages.formNotFound,
      };
    }

    const form = user.forms.find(form => form._id.toString() === formId);

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
        relationship.relationshipIntakeForms = relationship.relationshipIntakeForms.filter(
          intakeForm => intakeForm.userIntakeFormId && intakeForm.userIntakeFormId.toString() !== formId
        );
        
        // Check if all remaining forms are marked as complete (client_submitted or userAccepted)
        const allFormsComplete = relationship.relationshipIntakeForms.every(
          form => form.status === "client_submitted" || form.status === "userAccepted"
        );
        
        // Update areAllIntakeFormsFilled based on remaining forms' completion status
        // If there are no forms left, set to true
        relationship.areAllIntakeFormsFilled = relationship.relationshipIntakeForms.length === 0 || 
          (relationship.relationshipIntakeForms.length > 0 && allFormsComplete);
        
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