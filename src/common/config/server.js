import express from "express";
import helmet from "helmet";
import { configureSwagger } from "./swagger.js";
import { corsMiddleware } from "../middlewares/corsMiddleware.js";
import { errorHandler } from "../middlewares/errorHandlingMiddleware.js";
import { userRouter } from "../../features/user/routes.js";
import { clientRouter } from "../../features/client/routes.js";
import { commonRouter } from "../../features/common/routes.js";

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
app.use('/common', commonRouter);
app.use('/user', userRouter);
app.use('/client', clientRouter);
app.use(errorHandler);


// Root route
app.get("/", (req, res) => {
  const currentTime = new Date().toISOString();
  res.send({ message: "OK", time: currentTime });
});

// Error handler middleware
app.use(errorHandler);

export default app;