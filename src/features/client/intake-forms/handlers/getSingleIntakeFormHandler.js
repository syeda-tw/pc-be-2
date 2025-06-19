import { getSingleIntakeFormService } from "../service.js";
import messages from "../messages.js";

const handlerMessages = {
  streamError: "We're having trouble sending your form. Please try again in a moment.",
};

export const getSingleIntakeFormHandler = async (req, res, next) => {
  const { userIntakeFormId } = req.params;
  const clientId = req.id;
  try {
    const { fileStream, form } = await getSingleIntakeFormService(
      userIntakeFormId,
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
        status: 500,
        message: handlerMessages.streamError
      });
    });

    fileStream.on("end", () => {});
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};
