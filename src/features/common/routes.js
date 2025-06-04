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
      let userEntity = null;
      let clientEntity = null;

      try {
        userEntity = await User.findById(id);
      } catch (userError) {
        console.error('Error finding user:', userError);
      }

      try {
        clientEntity = await Client.findById(id);
      } catch (clientError) {
        console.error('Error finding client:', clientError);
      }

      const entity = userEntity || clientEntity;

      if (entity) {
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
      }
      return next({
        status: 404,
        message: responseMessages.error.notFound,
      });
    } catch (error) {
      console.error('Error in verify-token route:', error);
      return next({
        status: 500,
        message: responseMessages.error.serverError,
      });
    }
  }
);

export { router as commonRouter };
