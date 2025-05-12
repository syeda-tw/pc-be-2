import User from "../../../../common/models/User.js";

const messages = {
  getAllIntakeFormsError: "Error fetching intake forms",
  getAllIntakeFormsSuccess: "Intake forms fetched successfully",
  userNotFound: "User not found",
};

const getAllIntakeFormsService = async (id) => {
  try {
    const user = await User.findById(id).select("forms").lean();
    if (!user) {
      throw({
        status: 404,
        message: messages.userNotFound,
      });
    }
    return user.forms || []; // Ensure forms is an array, even if undefined
  } catch (err) {
    if (err.status) { // Re-throw custom errors
      throw err;
    }
    // Handle other potential errors (e.g., database connection issues)
    console.error("Error in getAllIntakeFormsService:", err);
    throw({
      status: 500, // Internal server error for unexpected issues
      message: messages.getAllIntakeFormsError,
    });
  }
};

//return object is data: {forms, total} and message: "Intake forms fetched successfully"
export const getAllIntakeFormsHandler = async (req, res, next) => {
  try {
    const forms = await getAllIntakeFormsService(req.id);
    return res.status(200).json({
      message: messages.getAllIntakeFormsSuccess,
      forms,
      total: forms.length,
    });
  } catch (err) {
    next(err);
  }
};