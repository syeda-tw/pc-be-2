export const corsMiddleware = (req, res, next) => {
    // Determine the environment and set the Access-Control-Allow-Origin header
    const allowedOrigin = process.env.NODE_ENV === 'production' 
        ? process.env.FRONTEND_URL_PRODUCTION 
        : process.env.FRONTEND_URL_LOCAL;
    res.header("Access-Control-Allow-Origin", allowedOrigin);
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
  };
  