import User from "../../../common/models/user.js";
import {
  findByIdAndReturnDeletedForm,
  findByIdAndUpdate,
  findUserFormsById,
} from "./dbOps.js";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import { Readable } from "stream";
import { env } from "../../../common/config/env.js";

const s3Client = new S3Client({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});

const getAllIntakeFormsService = async (id) => {
  const user = await findUserFormsById(id);
  return user.forms;
};

const createIntakeFormService = async (id, file, formName) => {
  try {
    const userId = id;
    const { buffer, mimetype } = file;

    if (!buffer || buffer.length === 0) {
      throw new Error("Invalid file content");
    }

    // Construct file URL
    const fileUrl = `https://${env.AWS_S3_BUCKET_NAME}.s3.amazonaws.com/${formName}`;

    const params = {
      Bucket: env.AWS_S3_BUCKET_NAME,
      Key: formName,
      Body: buffer,
      ContentType: mimetype || "application/pdf",
    };

    try {
      await s3Client.send(new PutObjectCommand(params));
    } catch (error) {
      console.error("Error uploading file to S3:", error);
      throw new Error("Failed to upload file to S3");
    }

    // Update user with new form details
    const formDetails = {
      _id: uuidv4(),
      name: formName,
      created_at: new Date(),
      s3_url: fileUrl,
    };

    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      // Check if the form ID already exists in user's forms
      const formId = formDetails._id;
      const formExists = user.forms.some((form) => form._id === formId);

      if (formExists) {
        // Generate a new ID if there's a collision
        formDetails._id = uuidv4();
      }

      await findByIdAndUpdate(userId, {
        forms: [...user.forms, formDetails],
      });

      return formDetails;
    } catch (error) {
      console.error("Error updating user with form details:", error);
      throw new Error("Failed to update user with form details");
    }
  } catch (error) {
    console.error("Error in createIntakeFormService:", error);
    throw error;
  }
};

const getSingleIntakeFormService = async (formId, userId) => {
  try {
    // Try to find the user and form
    let user;
    let form;
    try {
      user = await findUserFormsById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      form = user.forms.find((form) => form._id === formId);
      if (!form) {
        throw new Error("Form not found");
      }
    } catch (error) {
      console.error("Error finding user or form:", error);
      throw new Error("Failed to find user or form");
    }

    // Try to get file from S3
    let s3Object;
    try {
      const s3Params = {
        Bucket: env.AWS_S3_BUCKET_NAME || "default-bucket-name",
        Key: formId,
      };

      s3Object = await s3Client.send(new GetObjectCommand(s3Params));

      if (!s3Object.Body) {
        throw new Error("Failed to retrieve file from S3");
      }
    } catch (error) {
      console.error("Error retrieving file from S3:", error);
      throw new Error("Failed to retrieve file from S3");
    }

    const fileStream = Readable.from(s3Object.Body);
    return { fileStream, form };
  } catch (error) {
    console.error("Error in getSingleIntakeFormService:", error);
    throw error;
  }
};

const deleteIntakeFormService = async (formId, userId) => {
  try {
    // Try to find the form
    let form;
    try {
      form = await findByIdAndReturnDeletedForm(userId, formId);
      if (!form) {
        throw new Error("Form not found");
      }
    } catch (error) {
      console.error("Error finding form to delete:", error);
      throw new Error("Failed to find form for deletion");
    }

    // Try to delete from S3
    try {
      const deleteParams = {
        Bucket: env.AWS_S3_BUCKET_NAME || "default-bucket-name",
        Key: form.s3_url.split("/").pop(),
      };

      const deleteCommand = new DeleteObjectCommand(deleteParams);
      await s3Client.send(deleteCommand);
    } catch (error) {
      console.error("Error deleting file from S3:", error);
      throw new Error("Failed to delete file from S3");
    }

    // Try to update user document
    try {
      await findByIdAndUpdate(userId, {
        $pull: { forms: { _id: formId } },
      });
    } catch (error) {
      console.error("Error removing form from user document:", error);
      throw new Error("Failed to remove form from user document");
    }

    return;
  } catch (error) {
    console.error("Error in deleteIntakeFormService:", error);
    throw error;
  }
};

export {
  getAllIntakeFormsService,
  getSingleIntakeFormService,
  createIntakeFormService,
  deleteIntakeFormService,
};
