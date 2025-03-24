// src/utils/customError.js
class CustomError extends Error {
  constructor(status, message, context = {}) {
    super(message);
    this.status = status;
    this.message = message;
    this.context = context;
  }
}

export const throwError = (status, message, context = {}) => {
  throw new CustomError(status, message, context);
};
