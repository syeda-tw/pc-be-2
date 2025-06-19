import { deleteIntakeFormService } from "../service.js";
import messages from "../messages.js";

export const deleteIntakeFormHandler = async (req, res, next) => {
  try {
    await deleteIntakeFormService(req.params.id, req.id);
    return res.status(200).json({
      message: messages.deleteIntakeFormSuccess,
    });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};