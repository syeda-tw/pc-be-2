import express from "express";
import helmet from "helmet";
import { configureSwagger } from "./swagger.js";
import { corsMiddleware } from "../middlewares/corsMiddleware.js";
import { errorHandlingMiddleware } from "../middlewares/errorHandlingMiddleware.js";
import { userRouter } from "../../features/user/routes.js";
import { clientRouter } from "../../features/client/routes.js";
import { commonRouter } from "../../features/common/routes.js";
import morgan from 'morgan';
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

// Morgan is a middleware that logs the HTTP requests and responses
app.use(morgan('dev'));  // 'dev' format logs concise output useful for development


// Routes
app.use('/common', commonRouter);
app.use('/user', userRouter);
app.use('/client', clientRouter);

// Error handling middleware -- this will be the last middleware in the chain and will catch all errors and send a response to the client in a structured format
app.use(errorHandlingMiddleware);


// Root route
app.get("/", (req, res) => {
  const currentTime = new Date().toISOString();
  res.send({ message: "OK", time: currentTime });
});

export default app;