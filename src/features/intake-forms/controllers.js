import {
  getAllIntakeFormsService,
  getSingleIntakeFormService,
  createIntakeFormService,
  deleteIntakeFormService,
} from "./services.js";
import { messages } from "./messages.js";

//return object is data: {email} and message: "OTP sent to the email address"
const getAllIntakeForms = async (req, res, next) => {
  try {
    const forms = await getAllIntakeFormsService(req.body.decodedToken._id);
    return res.status(200).json({
      message: messages.intakeForms.getAllIntakeForms,
      forms,
    });
  } catch (err) {
    next(err);
  }
};

const getSingleIntakeForm = async (req, res, next) => {
  try {
    const {fileStream, form} = await getSingleIntakeFormService(
      req.params.id,
      req.body.decodedToken._id
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

const createIntakeForm = async (req, res, next) => {
  try {
    const form = await createIntakeFormService(
      req.body.decodedToken._id,
      req.file,
      req.body.formName
    );
    return res.status(200).json({
      message: messages.intakeForms.createIntakeForm,
      form,
    });
  } catch (err) {
    next(err);
  }
};

const deleteIntakeForm = async (req, res, next) => {
  try {
    await deleteIntakeFormService(req.params.id, req.body.decodedToken._id);
    return res.status(200).json({
      message: messages.intakeForms.deleteIntakeForm,
    });
  } catch (err) {
    next(err);
  }
};

export {
  getAllIntakeForms,
  getSingleIntakeForm,
  createIntakeForm,
  deleteIntakeForm,
};
