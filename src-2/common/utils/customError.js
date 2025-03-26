// src/utils/customError.js
class CustomError extends Error {
  constructor(status, message, context = {}) {
    super(message);
    this.status = status;
    this.message = message;
    this.context = context;
  }
}

//this is used by the controllers to throw an error
export const throwError = (status, message, context = {}) => {
  throw new CustomError(status, message, context);
};

//this is used by the service layer to return error response
export const handleError = (error) => {
  if (error instanceof CustomError) {
    return res.status(error.status).json({
      message: error.message,
      context: error.context || {},
    });
  }
  console.error(error);
  return res.status(500).json({
    message: messages.error.serverError,
  });
};
