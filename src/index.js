import express from "express";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import swaggerJsDoc from "swagger-jsdoc";
import authRoutes from "./routes/authRoutes.js";
import onboardingRoutes from "./routes/onboardingRoutes.js";
import cors from "cors";
import intakeFormsRoutes from "./routes/intakeFormsRoutes.js";

dotenv.config();
import "./db.js";

const port = process.env.PORT;
const app = express();

// CORS middleware should be set up early
app.use(cors({
  origin: ["http://localhost:5173", "https://app.practicare.co"], // Allow only these origins
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true, // Allow cookies and auth headers if needed
  preflightContinue: false,
  optionsSuccessStatus: 200, // 200 instead of 204 for better compatibility
}));
 
// Explicitly handle OPTIONS requests
app.options("*", cors());

// Middleware for parsing JSON and form data
app.use(express.json()); // This should come first
app.use(express.urlencoded({ extended: true }));

// Swagger setup
// Configure the app to use Swagger
const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "My Express.js API",
      version: "1.0.0",
      description: "A sample Express.js API built with JavaScript and Swagger",
    },
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        BearerAuth: [],
      },
    ],
  },
  apis: ["./dist/routes/*.js"],
};
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Use the auth routes for authentication-related paths
app.use("/auth", authRoutes);
app.use("/onboarding", onboardingRoutes);
app.use("/intake-forms", intakeFormsRoutes);

// Root route
app.get("/", (req, res) => {
  const currentTime = new Date().toISOString();
  res.send({ message: "OK", time: currentTime });
});

// Error handler middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(500)
    .send({ message: "Something went wrong!", error: err.message });
});

// Start server
app.listen(3000, "0.0.0.0", () => {
  console.log("Server is running on http://0.0.0.0:3000");
});
