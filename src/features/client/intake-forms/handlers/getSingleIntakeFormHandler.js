import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { env } from "../../../../common/config/env.js";
import Relationship from "../../../../common/models/Relationship.js";
import { Readable } from "stream";

const messages = {
  relationshipNotFound: "We couldn't find your relationship. Please check your login and try again.",
  formNotFound: "We couldn't find the form you're looking for. Please check the form ID and try again.",
  failedToFindForm: "We're having trouble finding your form. Please try again in a moment.",
  failedToRetrieveFileFromS3: "We're having trouble retrieving your form. Please try again in a moment.",
  streamError: "We're having trouble sending your form. Please try again in a moment.",
  invalidParams: "Invalid parameters provided"
};

const s3Client = new S3Client({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});

const getSingleIntakeFormService = async (formId, clientId) => {
  if (!formId || !clientId) {
    throw {
      code: 400,
      message: messages.invalidParams
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
        code: 404,
        message: messages.relationshipNotFound
      };
    }

    const form = relationship.user.forms.find((form) => form._id.toString() === formId);
    if (!form) {
      throw {
        code: 404,
        message: messages.formNotFound
      };
    }

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
    throw {
      code: error.code || 500,
      message: error.message || messages.failedToRetrieveFileFromS3
    };
  }
};

export const getSingleIntakeFormHandler = async (req, res, next) => {
  const { formId } = req.params;
  const clientId = req.id;
  try {
    const { fileStream, form } = await getSingleIntakeFormService(
      formId,
      clientId
    );

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${form.name || "form"}.pdf"`
    );

    fileStream.pipe(res);

    fileStream.on("error", (err) => {
      res.status(500).json({
        code: 500,
        message: messages.streamError
      });
    });

    fileStream.on("end", () => {});
  } catch (err) {
    next(err);
  }
};
