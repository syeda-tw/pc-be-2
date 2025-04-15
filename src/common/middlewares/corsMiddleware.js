export const corsMiddleware = (req, res, next) => {
    const allowedOrigin = process.env.NODE_ENV === 'production' 
        ? process.env.FRONTEND_URL_PRODUCTION 
        : process.env.FRONTEND_URL_LOCAL;

    const origin = req.headers.origin;

    if (origin === allowedOrigin) {
        res.header("Access-Control-Allow-Origin", origin);
    } else {
        console.log(`Origin mismatch: ${origin} vs ${allowedOrigin}`);
    }

    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    next();
};
