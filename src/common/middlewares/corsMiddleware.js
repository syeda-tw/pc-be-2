import { env } from '../config/env.js';

export const corsMiddleware = (req, res, next) => {
    const origin = req.headers.origin || ''; // Fallback in case origin is undefined

    const allowedOrigin = env.NODE_ENV === 'production'
        ? env.FRONTEND_URL
        //when in development, we allow the local backend to be used for swagger and frontend to be used for the frontend
        : env.FRONTEND_URL || env.BACKEND_URL_LOCAL;

    if (origin && origin === allowedOrigin) {
        res.header("Access-Control-Allow-Origin", origin);
    } else if (origin) {
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
