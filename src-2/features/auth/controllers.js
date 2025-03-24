import { registerUserService } from "./services.js";
import { messages } from "./messages.js";
import { throwError } from "../../common/utils/customError.js";

const register = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await registerUserService(email, password);

    // Success response if no errors were thrown
    return res.status(200).json({
      user: { email },
      message: messages.register.otpSent,
    });
  } catch (err) {
    if (err instanceof CustomError) {
      // Handle custom errors (with status code, message, etc.)
      return res.status(err.status).json({
        message: err.message,
        context: err.context || {},
      });
    }
    
    // Handle unexpected errors
    console.error(err);
    return res.status(500).json({
      message: messages.error.serverError,
    });
  }
};

export { register };
