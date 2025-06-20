import { env } from "../../../../common/config/env.js";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
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
        status: "userAdded",
      });
      relationship.timeline.push(
        { event: relationshipTimelineEntries.userAddedIntakeForm(formName) },
        { event: relationshipTimelineEntries.intakeFormsMarkedAsIncomplete() }
      );
      relationship.areIntakeFormsComplete = false;
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

export const createIntakeFormHandler = async (req, res, next) => {
  try {
    const form = await createIntakeFormService(
      req.id,
      req.file,
      req.body.formName
    );
    return res.status(200).json({
      message: messages.formUploadSuccess,
      form,
    });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};
