// errorHandler.js
import CustomError from '../utils/customError.js';

const errorHandler = (err, req, res, next) => {
  if (err instanceof CustomError) {
    return res.status(err.status).json({
      message: err.message,
      context: err.context || {},
    });
  }

  // Default 500 error response for other errors
  console.error(err); // Log unexpected errors
  return res.status(500).json({
    message: 'Internal Server Error',
  });
};

export { errorHandler };
