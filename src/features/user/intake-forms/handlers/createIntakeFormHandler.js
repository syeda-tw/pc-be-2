import { env } from '../../../../common/config/env.js';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import User from '../../../../common/models/User.js';
import Relationship from '../../../../common/models/Relationship.js';
import mongoose from 'mongoose';

const messages = {
  invalidFileContent: "We couldn't process your file. Please make sure it's not empty and try again.",
  failedToUploadFileToS3: "We're having trouble saving your file. Please try again in a moment.",
  failedToUpdateUserWithFormDetails: "We couldn't save your form details. Please try again.",
  userNotFound: "We couldn't find your account. Please check your login and try again.",
  formUploadSuccess: "Your form has been successfully uploaded and saved.",
  maxFormsReached: "You've reached the maximum limit of 10 intake forms. Please delete an existing form before creating a new one.",
};

const s3Client = new S3Client({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});

const createIntakeFormService = async (id, file, formName) => {
  try {
    const userId = id;
    const { buffer, mimetype } = file;

    if (!buffer || buffer.length === 0) {
      throw {
        code: 400,
        message: messages.invalidFileContent,
      };
    }

    const formDetails = {
      name: formName,
    };

    const user = await User.findById(userId);
    if (!user) {
      throw {
        code: 404,
        message: messages.userNotFound,
      };
    }

    // Check if user already has 10 forms (maximum limit)
    if (user.forms && user.forms.length >= 10) {
      throw {
        code: 400,
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

    // Find all relationships for this user and update their intakeForms
    const relationships = await Relationship.find({ user: userId });
    for (const relationship of relationships) {
      relationship.intakeForms.push({
        formId: newForm._id,
        uploadedFiles: [],
        isMarkedComplete: false,
        formName: formName,
      });
      relationship.areIntakeFormsFilled = false;
      await relationship.save();
    }

    const fileUrl = `https://${env.AWS_S3_BUCKET_NAME}.s3.amazonaws.com/${newForm._id}`;

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
        code: 500,
        message: messages.failedToUploadFileToS3,
      };
    }

    return newForm;
  } catch (error) {
    console.error("Error in createIntakeFormService:", error);
    throw {
      code: error.code || 500,
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
  } catch (err) {
    res.status(err.code || 500).json({ message: err.message });
  }
};
