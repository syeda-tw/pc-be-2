import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

export const configureSwagger = (app) => {
  const swaggerOptions = {
    withCredentials: false, // Prevents Swagger UI from sending cookies

    swaggerDefinition: {
      openapi: "3.0.0",
      info: {
        title: "Practicare API",
        version: "1.0.0",
        description: "API for Practicare",
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
    apis: ["./src-2/features/**/swagger.js"],
  };

  const swaggerDocs = swaggerJsDoc(swaggerOptions);
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
};
