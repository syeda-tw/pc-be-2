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
  try {
    // Find user and form
    const user = await User.findById(userId).select("forms");
    if (!user) {
      throw {
        code: 404,
        message: messages.userNotFound
      };
    }

    const form = user.forms.find((form) => form._id === formId);
    if (!form) {
      throw {
        code: 404,
        message: messages.formNotFound
      };
    }

    // Get file from S3
    const s3Params = {
      Bucket: env.AWS_S3_BUCKET_NAME,
      Key: formId,
    };

    const s3Object = await s3Client.send(new GetObjectCommand(s3Params));
    if (!s3Object.Body) {
      throw {
        code: 500,
        message: messages.failedToRetrieveFileFromS3
      };
    }

    const fileStream = Readable.from(s3Object.Body);
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
  try {
    const { fileStream, form } = await getSingleIntakeFormService(
      req.params.id,
      req.id
    );

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${form.name || "form"}.pdf"`
    );

    fileStream.pipe(res);

    fileStream.on("error", (err) => {
      console.error("Stream error:", err);
      res.status(500).json({
        code: 500,
        message: messages.streamError
      });
    });
  } catch (err) {
    next(err);
  }
};
