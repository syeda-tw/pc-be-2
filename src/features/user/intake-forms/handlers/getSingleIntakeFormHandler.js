import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { env } from "../../../../common/config/env.js";
import User from "../../../../common/models/User.js";
import { Readable } from "stream";

const messages = {
  userNotFound: "User not found",
  formNotFound: "Form not found",
  failedToFindUserOrForm: "Failed to find user or form",
  failedToRetrieveFileFromS3: "Failed to retrieve file from S3",
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
    // Try to find the user and form
    let user;
    let form;
    try {
      user = await User.findById(userId).select("forms");
      if (!user) {
        throw {
          status: 404,
          message: messages.userNotFound,
        };
      }

      form = user.forms.find((form) => form._id === formId);
      if (!form) {
        throw {
          status: 404,
          message: messages.formNotFound,
        };
      }
    } catch (error) {
      console.error("Error finding user or form:", error);
      throw {
        status: 500,
        message: messages.failedToFindUserOrForm,
      };
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
        throw {
          status: 500,
          message: messages.failedToRetrieveFileFromS3,
        };
      }
    } catch (error) {
      console.error("Error retrieving file from S3:", error);
      throw {
        status: 500,
        message: messages.failedToRetrieveFileFromS3,
      };
    }

    const fileStream = Readable.from(s3Object.Body);
    return { fileStream, form };
  } catch (error) {
    console.error("Error in getSingleIntakeFormService:", error);
    throw {
      status: 500,
      message: messages.failedToRetrieveFileFromS3,
    };
  }
};

export const getSingleIntakeFormHandler = async (req, res, next) => {
  try {
    const { fileStream, form } = await getSingleIntakeFormService(
      req.params.id,
      req.id
    );
    // Set headers for the PDF file
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${form.name || "file"}"`
    );

    // Pipe the Readable stream to the response
    fileStream.pipe(res);

    // Handle any errors from the stream
    fileStream.on("error", (err) => {
      console.error("Stream error:", err);
      res
        .status(500)
        .json({ error: "Failed to stream PDF", details: err.message });
    });
  } catch (err) {
    next(err);
  }
};
