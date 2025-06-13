import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { env } from "../../../../common/config/env.js";
import Relationship from "../../../../common/models/Relationship.js";
import { Readable } from "stream";

const messages = {
  success: {
    getSingleFormsUploadedByClient:
      "Successfully retrieved the form uploaded by your client.",
  },
  error: {
    relationshipNotFound:
      "We couldn't find your relationship. Please check your login and try again.",
    formNotFound:
      "We couldn't find the form you're looking for. Please check the form ID and try again.",
    failedToFindForm:
      "We're having trouble finding your form. Please try again in a moment.",
    failedToRetrieveFileFromS3:
      "We're having trouble retrieving your form. Please try again in a moment.",
    streamError:
      "We're having trouble sending your form. Please try again in a moment.",
    invalidParams: "Invalid parameters provided",
    unauthorized: "You don't have permission to access this form.",
  },
};

const s3Client = new S3Client({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});

const getSingleFormsUploadedByClientService = async (
  relationshipId,
  userId,
  formId,
  formUploadedByClientId
) => {
  if (!relationshipId || !userId || !formId || !formUploadedByClientId) {
    throw {
      code: 400,
      message: messages.error.invalidParams,
    };
  }

  try {
    const relationship = await Relationship.findOne({
      _id: relationshipId.toString(),
      user: userId.toString(),
    });

    if (!relationship) {
      throw {
        code: 404,
        message: messages.error.relationshipNotFound,
      };
    }

    const uploadedForm = relationship.intakeForms
      .find((form) => form._id.toString() === formId.toString())
      ?.formsUploadedByClient.find(
        (form) => form._id.toString() === formUploadedByClientId.toString()
      );

    if (!uploadedForm) {
      throw {
        code: 404,
        message: messages.error.formNotFound,
      };
    }

    const s3Params = {
      Bucket: env.AWS_S3_BUCKET_NAME,
      Key: uploadedForm._id.toString(),
    };

    const s3Object = await s3Client.send(new GetObjectCommand(s3Params));
    if (!s3Object.Body) {
      throw {
        code: 500,
        message: messages.error.failedToRetrieveFileFromS3,
      };
    }

    const fileStream = Readable.from(s3Object.Body);
    return { fileStream, uploadedForm };
  } catch (error) {
    throw {
      code: error.code || 500,
      message: error.message || messages.error.failedToRetrieveFileFromS3,
    };
  }
};

const getSingleFormsUploadedByClientHandler = async (req, res, next) => {
  const { relationshipId, formId, formUploadedByClientId } = req.params;
  const userId = req.id;

  try {
    const { fileStream, uploadedForm } =
      await getSingleFormsUploadedByClientService(
        relationshipId,
        userId,
        formId,
        formUploadedByClientId
      );

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${uploadedForm.name || "form"}.pdf"`
    );

    fileStream.pipe(res);

    fileStream.on("error", (err) => {
      res.status(500).json({
        code: 500,
        message: messages.error.streamError,
      });
    });
  } catch (err) {
    next(err);
  }
};

export default getSingleFormsUploadedByClientHandler;