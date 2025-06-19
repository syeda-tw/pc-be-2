import { getSingleFormUploadedByClientService } from "../service.js";
import messages from "../messages.js";

const handlerMessages = {
  streamError: "We're having trouble sending your form. Please try again in a moment.",
};

export const getSingleFormUploadedByClientHandler = async (req, res, next) => {
  const { userIntakeFormId, relationshipId, formUploadedByClientId } = req.params;
  const clientId = req.id;

  try {
    const { fileStream, uploadedForm } = await getSingleFormUploadedByClientService(
      userIntakeFormId,
      clientId,
      relationshipId,
      formUploadedByClientId
    );

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${uploadedForm.reponseFormName || "form"}.pdf"`
    );

    fileStream.pipe(res);

    fileStream.on("error", (err) => {
      res.status(500).json({
        status: 500,
        message: handlerMessages.streamError
      });
    });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};
