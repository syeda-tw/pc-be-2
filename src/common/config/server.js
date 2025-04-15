import express from "express";
import helmet from "helmet";
import { configureSwagger } from "./swagger.js";
import { corsMiddleware } from "../middlewares/corsMiddleware.js";
import { errorHandler } from "../middlewares/errorHandlingMiddleware.js";
import { env } from "./env.js";
import authRoutes from "../../features/auth/routes.js";
import onboardingRoutes from "../../features/onboarding/routes.js";
import intakeFormsRoutes from "../../features/intake-forms/routes.js";
import profileSettingsRoutes from "../../features/profile-settings/routes.js";
const app = express();


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
app.use("/onboarding", onboardingRoutes);
app.use("/intake-forms", intakeFormsRoutes);
app.use("/profile-settings", profileSettingsRoutes);
app.use(errorHandler);


// Root route
app.get("/", (req, res) => {
  const currentTime = new Date().toISOString();
  res.send({ message: "OK", time: currentTime });
});

// Error handler middleware
app.use(errorHandler);

export default app;