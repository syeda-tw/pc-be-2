import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Export environment variables
export const env = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGO_URI_PRODUCTION: process.env.MONGO_URI_PRODUCTION || '',
  MONGO_URI_LOCAL: process.env.MONGO_URI_LOCAL || '',
  FRONTEND_URL_PRODUCTION: process.env.FRONTEND_URL_PRODUCTION || '',
  FRONTEND_URL_LOCAL: process.env.FRONTEND_URL_LOCAL || '',
  JWT_SECRET: process.env.JWT_SECRET || '',
  NODEMAILER_EMAIL: process.env.NODEMAILER_EMAIL || '',
  NODEMAILER_PASSWORD: process.env.NODEMAILER_PASSWORD || '',
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
  GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY || '',
};
