import express from "express";
import User from "../../common/models/User.js";
import Client from "../../common/models/Client.js";
import { secureRequestMiddleware } from "../../common/middlewares/secureRequestMiddleware.js";
import { sanitizeUserAndAppendType } from "./utils.js";

const router = express.Router();

// Messages for responses
const responseMessages = {
  error: {
    tokenNotFound: "Authorization token not found",
    invalidToken: "Invalid token",
    jwtSecretMissing: "JWT_SECRET is not defined",
    notFound: "No user or client found for this token",
    serverError: "Internal server error",
  },
  success: {
    userVerified: "User successfully verified",
    clientVerified: "Client successfully verified",
  },
};

// Route to verify token
router.post(
  "/verify-token",
  secureRequestMiddleware,
  async (req, res, next) => {
    const id = req.id;

    try {
      // Use Promise.all to handle both queries concurrently
      const [userEntity, clientEntity] = await Promise.all([
        User.findById(id),
        Client.findById(id)
      ]);

      const entity = userEntity || clientEntity;

      if (!entity) {
        return res.status(404).json({
          message: responseMessages.error.notFound
        });
      }

      const isUser = entity instanceof User;
      return res.status(200).json({
        data: sanitizeUserAndAppendType(
          entity.toObject(),
          isUser ? "user" : "client"
        ),
        message: isUser
          ? responseMessages.success.userVerified
          : responseMessages.success.clientVerified,
      });

    } catch (error) {
      console.error('Error in verify-token route:', error);
      return res.status(500).json({
        message: responseMessages.error.serverError
      });
    }
  }
);

export { router as commonRouter };
