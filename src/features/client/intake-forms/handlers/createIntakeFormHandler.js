import { createIntakeFormService } from "../service.js";
import messages from "../messages.js";

export const createIntakeFormHandler = async (req, res, next) => {
  try {
    const clientId = req.id;
    const { relationshipId, userIntakeFormId, formName } = req.body;
    const file = req.file;

    // Validate required parameters
    if (!clientId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (!relationshipId || !userIntakeFormId || !formName || !file) {
      return res.status(400).json({ 
        message: "Missing required fields: relationshipId, userIntakeFormId, formName, and file are required" 
      });
    }

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