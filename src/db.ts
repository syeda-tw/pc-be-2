import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI_LOCAL;

if (!MONGO_URI) {
  throw new Error("MONGO_URI_LOCAL is not defined in environment variables");
}

mongoose
  .connect(MONGO_URI, {
  } as mongoose.ConnectOptions)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1); // Exit process on failure
  });
