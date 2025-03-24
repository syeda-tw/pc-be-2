import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

export const configureSwagger = (app) => {
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
    apis: ["./src-2/features/auth/swagger.js"],
  };

  const swaggerDocs = swaggerJsDoc(swaggerOptions);
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
};
