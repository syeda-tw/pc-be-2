import User from "../../../../common/models/User.js";

const messages = {
  getAllIntakeFormsError: "Error fetching intake forms",
  getAllIntakeFormsSuccess: "Intake forms fetched successfully",
};

const getAllIntakeFormsService = async (id) => {
  try {
    const forms = await User.findById(id).select("forms");
    return forms;
  } catch (err) {
    throw({
      status: 400,
      message: messages.getAllIntakeFormsError,
    });
  }
};

//return object is data: {email} and message: "OTP sent to the email address"
export const getAllIntakeFormsHandler = async (req, res, next) => {
  try {
    const forms = await getAllIntakeFormsService(req.body.decodedToken._id);
    return res.status(200).json({
      message: messages.getAllIntakeFormsSuccess,
      forms,
    });
  } catch (err) {
    next(err);
  }
};