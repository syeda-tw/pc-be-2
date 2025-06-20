import { env } from "../../../common/config/env.js";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import Relationship, { relationshipTimelineEntries } from "../../../common/models/Relationship.js";
import mongoose from "mongoose";
import Client from "../../../common/models/Client.js";
import messages from "./messages.js";
import { Readable } from "stream";

const s3Client = new S3Client({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});

export const createIntakeFormService = async (
  clientId,
  relationshipId,
  userIntakeFormId,
  file,
  formName
) => {
  try {
    const client = await Client.findById(clientId);
    if (!client) {
      throw {
        status: 404,
        message: messages.userNotFound,
      };
    }

    const relationship = await Relationship.findOne({
      _id: relationshipId,
      client: clientId,
    });

    if (!relationship) {
      throw {
        status: 404,
        message: messages.relationshipNotFound,
      };
    }

    // Find the existing intake form in relationshipIntakeForms
    const existingForm = relationship.relationshipIntakeForms.find(
      (form) => form.userIntakeFormId && form.userIntakeFormId.toString() === userIntakeFormId.toString()
    );

    if (!existingForm) {
      throw {
        status: 404,
        message: messages.intakeFormNotFound,
      };
    }

    // Check if form has already been submitted by client
    if (existingForm.status === "clientSubmitted") {
      throw {
        status: 400,
        message: messages.formAlreadySubmitted,
      };
    }

    // Validate file structure and content
    if (!file) {
      throw {
        status: 400,
        message: messages.invalidFileContent,
      };
    }

    const { buffer, mimetype } = file;

    if (!buffer || buffer.length === 0) {
      throw {
        status: 400,
        message: messages.invalidFileContent,
      };
    }

    const responseId = new mongoose.Types.ObjectId();
    
    // Create the response object to be added to intakeFormResponsesUploadedByClient
    const responseForm = {
      _id: responseId,
      reponseFormName: formName, // Note: keeping the typo from schema for consistency
      reponseFormUploadedAt: new Date(),
    };

    // Add the response to the existing intake form
    existingForm.intakeFormResponsesUploadedByClient.push(responseForm);
    
    // Update the status to clientSubmitted
    existingForm.status = "clientSubmitted";
    relationship.timeline.push({ event: relationshipTimelineEntries.clientSubmittedIntakeForm(formName, existingForm.userIntakeFormName) });


    // Save the relationship
    await relationship.save();

    // Upload file to S3
    const params = {
      Bucket: env.AWS_S3_BUCKET_NAME,
      Key: responseId.toString(),
      Body: buffer,
      ContentType: mimetype || "application/pdf",
    };

    try {
      await s3Client.send(new PutObjectCommand(params));
    } catch (error) {
      throw {
        status: 500,
        message: messages.failedToUploadFileToS3,
      };
    }

    const fileUrl = `https://${env.AWS_S3_BUCKET_NAME}.s3.amazonaws.com/${responseId}`;

    return {
      _id: responseId,
      name: formName,
      createdAt: new Date(),
      fileUrl,
    };
  } catch (error) {
    throw {
      status: error.status || 500,
      message: error.message || messages.failedToUpdateUserWithFormDetails,
    };
  }
};

export const getSingleFormUploadedByClientService = async (userIntakeFormId, clientId, relationshipId, formUploadedByClientId) => {
  if (!userIntakeFormId || !clientId || !relationshipId || !formUploadedByClientId) {
    throw {
      status: 400,
      message: "Invalid parameters provided"
    };
  }

  try {
    const relationship = await Relationship.findOne({
      _id: relationshipId.toString(),
      client: clientId
    });

    if (!relationship) {
      throw {
        status: 404,
        message: messages.relationshipNotFound
      };
    }

    // Find the intake form in relationshipIntakeForms
    const intakeForm = relationship.relationshipIntakeForms.find(
      form => form.userIntakeFormId && form.userIntakeFormId.toString() === userIntakeFormId.toString()
    );

    if (!intakeForm) {
      throw {
        status: 404,
        message: messages.intakeFormNotFound
      };
    }

    // Find the uploaded form response
    const uploadedForm = intakeForm.intakeFormResponsesUploadedByClient.find(
      response => response._id.toString() === formUploadedByClientId.toString()
    );

    if (!uploadedForm) {
      throw {
        status: 404,
        message: messages.formResponseNotFound
      };
    }

    const s3Params = {
      Bucket: env.AWS_S3_BUCKET_NAME,
      Key: uploadedForm._id.toString()
    };

    const s3Object = await s3Client.send(new GetObjectCommand(s3Params));
    if (!s3Object.Body) {
      throw {
        status: 500,
        message: messages.failedToRetrieveFileFromS3
      };
    }

    const fileStream = Readable.from(s3Object.Body);
    return { fileStream, uploadedForm };
  } catch (error) {
    throw {
      status: error.status || 500,
      message: error.message || messages.failedToRetrieveFileFromS3
    };
  }
};

export const getSingleIntakeFormService = async (userIntakeFormId, clientId) => {
  if (!userIntakeFormId || !clientId) {
    throw {
      status: 400,
      message: "Invalid parameters provided"
    };
  }

  try {
    const relationship = await Relationship.findOne({ client: clientId })
      .populate({
        path: 'user',
        select: 'forms'
      });

    if (!relationship) {
      throw {
        status: 404,
        message: messages.relationshipNotFound
      };
    }

    const form = relationship.user.forms.find((form) => form._id.toString() === userIntakeFormId);
    if (!form) {
      throw {
        status: 404,
        message: messages.intakeFormNotFound
      };
    }

    const s3Params = {
      Bucket: env.AWS_S3_BUCKET_NAME,
      Key: userIntakeFormId,
    };

    const s3Object = await s3Client.send(new GetObjectCommand(s3Params));
    if (!s3Object.Body) {
      throw {
        status: 500,
        message: messages.failedToRetrieveFileFromS3
      };
    }

    const fileStream = Readable.from(s3Object.Body);
    return { fileStream, form };
  } catch (error) {
    throw {
      status: error.status || 500,
      message: error.message || messages.failedToRetrieveFileFromS3
    };
  }
}; 