import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { env } from "../../../../common/config/env.js";
import User from "../../../../common/models/User.js";
import { Readable } from "stream";

const messages = {
  userNotFound: "We couldn't find your account. Please check your login and try again.",
  formNotFound: "We couldn't find the form you're looking for. Please check the form ID and try again.",
  failedToFindUserOrForm: "We're having trouble finding your form. Please try again in a moment.",
  failedToRetrieveFileFromS3: "We're having trouble retrieving your form. Please try again in a moment.",
  streamError: "We're having trouble sending your form. Please try again in a moment."
};

const s3Client = new S3Client({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});

const getSingleIntakeFormService = async (formId, userId) => {
  console.log('Starting getSingleIntakeFormService with formId:', formId, 'userId:', userId);
  try {
    // Find user and form
    console.log('Attempting to find user with ID:', userId);
    const user = await User.findById(userId).select("forms");
    if (!user) {
      console.log('User not found for ID:', userId);
      throw {
        code: 404,
        message: messages.userNotFound
      };
    }
    console.log('User found successfully');

    console.log('Searching for form with ID:', formId);
    const form = user.forms.find((form) => form._id.toString() === formId);
    if (!form) {
      console.log('Form not found with ID:', formId);
      throw {
        code: 404,
        message: messages.formNotFound
      };
    }
    console.log('Form found successfully:', form);

    // Get file from S3
    const s3Params = {
      Bucket: env.AWS_S3_BUCKET_NAME,
      Key: formId,
    };
    console.log('Attempting to retrieve file from S3 with params:', s3Params);

    const s3Object = await s3Client.send(new GetObjectCommand(s3Params));
    if (!s3Object.Body) {
      console.log('S3 object body is empty');
      throw {
        code: 500,
        message: messages.failedToRetrieveFileFromS3
      };
    }
    console.log('Successfully retrieved file from S3');

    const fileStream = Readable.from(s3Object.Body);
    console.log('Created file stream successfully');
    return { fileStream, form };
  } catch (error) {
    console.error("Error in getSingleIntakeFormService:", error);
    throw {
      code: error.code || 500,
      message: error.message || messages.failedToRetrieveFileFromS3
    };
  }
};

export const getSingleIntakeFormHandler = async (req, res, next) => {
  console.log('Starting getSingleIntakeFormHandler');
  try {
    console.log('Request params:', req.params);
    console.log('Request ID:', req.id);
    
    const { fileStream, form } = await getSingleIntakeFormService(
      req.params.id,
      req.id
    );
    console.log('Successfully retrieved form and file stream');

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${form.name || "form"}.pdf"`
    );
    console.log('Set response headers successfully');

    fileStream.pipe(res);
    console.log('Started piping file stream to response');

    fileStream.on("error", (err) => {
      console.error("Stream error:", err);
      res.status(500).json({
        code: 500,
        message: messages.streamError
      });
    });
  } catch (err) {
    console.error('Error in getSingleIntakeFormHandler:', err);
    next(err);
  }
};
