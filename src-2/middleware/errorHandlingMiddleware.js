class AppError extends Error {
    constructor(message, statusCode) {
      super(message);
      this.statusCode = statusCode || 500;
      this.isOperational = true; // Mark as an operational error
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  const errorHandler = (err, req, res, next) => {
    console.error(err.stack);  // Log the error stack for debugging
  
    const statusCode = err.statusCode || 500;  // Default to 500 if no status is set
    const message = err.message || "Internal Server Error";  // Default error message
  
    // Send a consistent error response
    res.status(statusCode).json({
      status: "error",
      message,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,  // Only show stack trace in dev mode
    });
  };
  
  export { AppError, errorHandler };
  