module.exports = {
  openapi: "3.0.0",
  info: {
    title: "Client Auth API",
    version: "1.0.0",
    description: "API documentation for client authentication endpoints"
  },
  paths: {
    "/client/auth/register": {
      post: {
        summary: "Register a new client",
        tags: ["Auth"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  email: { type: "string", format: "email" },
                  password: { type: "string", minLength: 6 }
                },
                required: ["email", "password"]
              }
            }
          }
        },
        responses: {
          "201": {
            description: "Client registered successfully"
          },
          "400": {
            description: "Invalid input"
          }
        }
      }
    }
    // Add more endpoints here as needed
  }
};
