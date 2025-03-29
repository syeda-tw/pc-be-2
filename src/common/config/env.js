import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Export environment variables
export const env = {
  PORT: process.env.PORT,
  NODE_ENV: process.env.NODE_ENV,
  MONGO_URI_PRODUCTION: process.env.MONGO_URI_PRODUCTION,
  MONGO_URI_LOCAL: process.env.MONGO_URI_LOCAL,
  FRONTEND_URL_PRODUCTION: process.env.FRONTEND_URL_PRODUCTION,
  FRONTEND_URL_LOCAL: process.env.FRONTEND_URL_LOCAL,
  NODEMAILER_EMAIL: process.env.NODEMAILER_EMAIL,
  NODEMAILER_PASSWORD: process.env.NODEMAILER_PASSWORD,
};
