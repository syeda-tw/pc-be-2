import { createIntakeFormService } from "../service.js";
import messages from "../messages.js";

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
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};
