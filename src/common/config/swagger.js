import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const createSwaggerSpec = (folder, title) => ({
  definition: {
    openapi: "3.0.0",
    info: {
      title: `Practicare API - ${title}`,
      version: "1.0.0",
      description: `API documentation for ${title.toLowerCase()} routes.`,
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
    security: [{ BearerAuth: [] }],
  },
  apis: [`./src/features/${folder}/**/*.js`],
});

export const configureSwagger = (app) => {
  const userDocs = swaggerJsDoc(createSwaggerSpec("user", "User"));
  const clientDocs = swaggerJsDoc(createSwaggerSpec("client", "Client"));
  const commonDocs = swaggerJsDoc(createSwaggerSpec("common", "Common"));

  app.use("/api-docs/user", swaggerUi.serveFiles(userDocs), swaggerUi.setup(userDocs));
  app.use("/api-docs/client", swaggerUi.serveFiles(clientDocs), swaggerUi.setup(clientDocs));
  app.use("/api-docs/common", swaggerUi.serveFiles(commonDocs), swaggerUi.setup(commonDocs));
};

