import { createIntakeFormService } from "../service.js";
import messages from "../messages.js";

export const createIntakeFormHandler = async (req, res, next) => {
  try {
    const clientId = req.id;
    const { relationshipId, userIntakeFormId, formName } = req.body;
    const file = req.file;

    const form = await createIntakeFormService(
      clientId,
      relationshipId,
      userIntakeFormId,
      file,
      formName
    );

    return res.status(200).json({
      message: messages.formUploadSuccess,
      form,
    });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};