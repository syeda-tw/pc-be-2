import { env } from '../../../../common/config/env.js';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import User from '../../../../common/models/User.js';

const messages = {
  invalidFileContent: "We couldn't process your file. Please make sure it's not empty and try again.",
  failedToUploadFileToS3: "We're having trouble saving your file. Please try again in a moment.",
  failedToUpdateUserWithFormDetails: "We couldn't save your form details. Please try again.",
  userNotFound: "We couldn't find your account. Please check your login and try again.",
  formUploadSuccess: "Your form has been successfully uploaded and saved.",
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
      _id: uuidv4(),
      name: formName,
      created_at: new Date(),
    };

    const user = await User.findById(userId);
    if (!user) {
      throw {
        code: 404,
        message: messages.userNotFound,
      };
    }

    // Check if the form ID already exists in user's forms
    const formId = formDetails._id;
    const formExists = user.forms.some((form) => form._id === formId);

    if (formExists) {
      formDetails._id = uuidv4();
    }

    await User.findByIdAndUpdate(userId, {
      forms: [...user.forms, formDetails],
    });

    const fileUrl = `https://${env.AWS_S3_BUCKET_NAME}.s3.amazonaws.com/${formDetails._id}`;

    const params = {
      Bucket: env.AWS_S3_BUCKET_NAME,
      Key: formDetails._id,
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

    return formDetails;
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
    next(err);
  }
};
