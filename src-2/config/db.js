import mongoose from "mongoose";
import { env } from "./env.js";
const connectDB = async () => {

  try {
    const mongoURI = env.NODE_ENV === 'production' ? env.MONGO_URI_PRODUCTION : env.MONGO_URI_LOCAL;
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Error connecting to the database", error);
    process.exit(1); // Exit the process if DB connection fails
  }
};

connectDB();
