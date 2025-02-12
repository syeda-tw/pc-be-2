import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
const swaggerUi = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");
import authRoutes from "./routes/authRoutes";
import onboardingRoutes from "./routes/onboardingRoutes";

import cors from "cors";

dotenv.config();
require("./db");
const port = process.env.PORT;
const app = express();

// Middleware to parse JSON and URL-encoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const corsOptions = {
  origin: process.env.FRONTEND_URL, // Allow requests from your frontend URL
  credentials: true, // Allow sending cookies and authentication headers
};

app.use(cors(corsOptions));

// Swagger setup
// Configure the app to use Swagger
const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "My Express.js API",
      version: "1.0.0",
      description: "A sample Express.js API built with TypeScript and Swagger",
    },
  },
  apis: ["./src/routes/*.ts"],
};
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Use the auth routes for authentication-related paths
app.use("/auth", authRoutes);
app.use("/onboarding", onboardingRoutes);

// Root route
app.get("/", (req: Request, res: Response) => {
  const currentTime = new Date().toISOString();
  res.send({ message: "OK", time: currentTime });
});

// Error handler middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res
    .status(500)
    .send({ message: "Something went wrong!", error: err.message });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
