import { env } from '../../../../common/config/env.js';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import User from '../../../../common/models/User.js';

const messages = {
  invalidFileContent: "Invalid file content",
  failedToUploadFileToS3: "Failed to upload file to S3",
  failedToUpdateUserWithFormDetails: "Failed to update user with form details",
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
      throw({
        status: 400,
        message: messages.invalidFileContent,
      });
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
      throw({
        status: 500,
        message: messages.failedToUploadFileToS3,
      });
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
        throw({
          status: 404,
          message: messages.userNotFound,
        });
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
      throw({
        status: 500,
        message: messages.failedToUpdateUserWithFormDetails,
      });
    }
  } catch (error) {
    console.error("Error in createIntakeFormService:", error);
    throw({
      status: 500,
      message: messages.failedToUpdateUserWithFormDetails,
    });
  }
};

export const createIntakeFormHandler = async (req, res, next) => {
  return res.status(200).json({
    message: "success",
  });
  try {
    const form = await createIntakeFormService(
      req.id,
      req.file,
      req.body.data.formName
    );
    return res.status(200).json({
      message: messages.intakeForms.createIntakeForm,
      form,
    });
  } catch (err) {
    next(err);
  }
};
