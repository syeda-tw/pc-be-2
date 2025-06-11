import { env } from "../../../../common/config/env.js";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import User from "../../../../common/models/User.js";
import Relationship from "../../../../common/models/Relationship.js";
import mongoose from "mongoose";
import Client from "../../../../common/models/Client.js";

const messages = {
  invalidFileContent:
    "We couldn't process your file. Please make sure it's not empty and try again.",
  failedToUploadFileToS3:
    "We're having trouble saving your file. Please try again in a moment.",
  failedToUpdateUserWithFormDetails:
    "We couldn't save your form details. Please try again.",
  userNotFound:
    "We couldn't find your account. Please check your login and try again.",
  formUploadSuccess: "Your form has been successfully uploaded and saved.",
};

const s3Client = new S3Client({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});

const createIntakeFormService = async (
  clientId,
  relationshipId,
  formId,
  file,
  formName
) => {
  try {
    const client = await Client.findById(clientId);
    if (!client) {
      throw {
        code: 404,
        message: messages.userNotFound,
      };
    }

    const relationship = await Relationship.findOne({
      _id: relationshipId,
      client: clientId,
    });

    if (!relationship) {
      throw {
        code: 404,
        message: "Relationship not found for this client",
      };
    }

    const existingForm = relationship.intakeForms.find(
      (form) => form.formId.toString() === formId.toString()
    );

    if (!existingForm) {
      throw {
        code: 404,
        message: "This form type has not been added to the relationship yet",
      };
    }

    if (existingForm.isMarkedComplete) {
      throw {
        code: 400,
        message: "This form has already been marked as complete",
      };
    }

    const { buffer, mimetype } = file;

    if (!buffer || buffer.length === 0) {
      throw {
        code: 400,
        message: messages.invalidFileContent,
      };
    }

    const formDetails = {
      _id: new mongoose.Types.ObjectId(),
      name: formName,
      createdAt: new Date(),
    };

    existingForm.formsUploadedByClient.push({
      _id: formDetails._id,
      name: formName,
      createdAt: new Date(),
    });
    
    await relationship.save();

    const fileUrl = `https://${env.AWS_S3_BUCKET_NAME}.s3.amazonaws.com/${formDetails._id}`;

    const params = {
      Bucket: env.AWS_S3_BUCKET_NAME,
      Key: formDetails._id.toString(),
      Body: buffer,
      ContentType: mimetype || "application/pdf",
    };

    try {
      await s3Client.send(new PutObjectCommand(params));
    } catch (error) {
      throw {
        code: 500,
        message: messages.failedToUploadFileToS3,
      };
    }

    return formDetails;
  } catch (error) {
    throw {
      code: error.code || 500,
      message: error.message || messages.failedToUpdateUserWithFormDetails,
    };
  }
};

export const createIntakeFormHandler = async (req, res, next) => {
  try {
    const clientId = req.id;
    const relationshipId = req.body.relationshipId;
    const formId = req.body.formId;
    const formName = req.body.formName;
    const file = req.file;

    const form = await createIntakeFormService(
      clientId,
      relationshipId,
      formId,
      file,
      formName
    );

    return res.status(200).json({
      message: messages.formUploadSuccess,
      form,
    });
  } catch (err) {
    next(err);
  }
};