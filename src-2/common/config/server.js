import express from "express";
import helmet from "helmet";
import { configureSwagger } from "../../common/config/swagger.js";
import { corsMiddleware } from "../../common/middlewares/corsMiddleware.js";
import { errorHandler } from "../../common/middlewares/errorHandlingMiddleware.js";
import { env } from "./env.js";
import authRoutes from "../../features/auth/routes.js";

// import onboardingRoutes from "../routes/onboardingRoutes.js";
// import intakeFormsRoutes from "../routes/intakeFormsRoutes.js";

import "./db.js";

const app = express();
const port = env.PORT || 3000;

// CORS middleware
app.use(corsMiddleware);

// Use Helmet for enhanced security
app.use(helmet());

// Middleware for parsing JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger setup (moved to a separate file)
configureSwagger(app);

// Routes
app.use("/auth", authRoutes);
// app.use("/onboarding", onboardingRoutes);
// app.use("/intake-forms", intakeFormsRoutes);

// Root route
app.get("/", (req, res) => {
  const currentTime = new Date().toISOString();
  res.send({ message: "OK", time: currentTime });
});

// Error handler middleware
app.use(errorHandler);

export default app;