import User from "../../../../common/models/User.js";

const messages = {
  getAllIntakeFormsError: "Unable to fetch intake forms at this time",
  getAllIntakeFormsSuccess: "Successfully retrieved intake forms",
  userNotFound: "Unable to find user account",
};

const getAllIntakeFormsService = async (id) => {
  try {
    const user = await User.findById(id).select("forms").lean();
    
    if (!user) {
      throw {
        code: 404,
        message: messages.userNotFound
      };
    }

    return user.forms || [];
  } catch (err) {
    if (err.code) {
      throw err;
    }

    console.error("Error in getAllIntakeFormsService:", err);
    throw {
      code: 500,
      message: messages.getAllIntakeFormsError
    };
  }
};

export const getAllIntakeFormsHandler = async (req, res, next) => {
  try {
    const forms = await getAllIntakeFormsService(req.id);
    
    return res.status(200).json({
      message: messages.getAllIntakeFormsSuccess,
      forms,
      total: forms.length
    });
  } catch (err) {
    next(err);
  }
};