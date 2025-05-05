// errorHandler.js
const errorHandlingMiddleware = (err, req, res, next) => {
  // Log the error stack trace if not in production
  if (process.env.NODE_ENV !== 'production') {
    console.error('Error Stack:', err?.stack);
  }

  // If the error has a custom status, message, and context (CustomError instance)
  if (err.status && err.message) {
    return res.status(err.status).json({
      status: 'error',
      message: err.message, // The error message to be displayed to the user
      context: err.context || {}, // Additional context (optional)
    });
  }

  // For unexpected errors
  console.error('Unexpected Error:', err);

  return res.status(500).json({
    status: 'error',
    message: 'An unexpected error occurred. Please try again later.',
  });
};

export { errorHandlingMiddleware };
