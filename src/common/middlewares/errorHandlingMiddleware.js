// errorHandler.js
import CustomError from '../utils/customError.js';

const errorHandler = (err, req, res, next) => {
  if (err instanceof CustomError) {
    return res.status(err.status || 500).json({
      message: err.message || 'Unknown error',
      context: err.context || {},
    });
  }
  console.error('Stack trace:', err?.stack);
  
  // Provide a user-friendly response
  const isDevelopment = process.env.NODE_ENV !== 'production';
  
  return res.status(500).json({
    message: 'An unexpected error occurred. Please try again later.',
    ...(isDevelopment && { error: err.message, stack: err.stack })
  });
};

export { errorHandler };
