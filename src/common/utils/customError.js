// customError.
//TODO: to be deleted as made this directly in the errorHandlingMiddleware.js file
class CustomError extends Error {
  constructor(status, message, context = {}) {
    super(message);
    this.status = status; // HTTP Status Code
    this.message = message; // Error Message
    this.context = context; // Additional data/context about the error
  }
}

export default CustomError;
