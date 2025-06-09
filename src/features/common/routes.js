import express from "express";
import User from "../../common/models/User.js";
import Client from "../../common/models/Client.js";
import { secureRequestMiddleware } from "../../common/middlewares/secureRequestMiddleware.js";
import { sanitizeUserAndAppendType } from "./utils.js";

const router = express.Router();

// Messages for responses
const messages = {
  error: {
    tokenNotFound: "Authorization token not found",
    invalidToken: "Invalid token",
    jwtSecretMissing: "JWT_SECRET is not defined",
    notFound: "No user or client found for this token",
    serverError: "Internal server error",
    sanitizationError: "Error processing user data",
  },
  success: {
    userVerified: "User successfully verified",
    clientVerified: "Client successfully verified",
  },
};

// Route to verify token
router.post("/verify-token", secureRequestMiddleware, async (req, res) => {
  const id = req.id;

  try {
    const [userEntity, clientEntity] = await Promise.all([
      User.findById(id),
      Client.findById(id)
    ]);

    const entity = userEntity || clientEntity;

    if (!entity) {
      return res.status(404).json({ message: messages.error.notFound });
    }

    const isUser = !!userEntity;
    let safeData;

    try {
      safeData = sanitizeUserAndAppendType(entity.toObject(), isUser ? "user" : "client");
    } catch (err) {
      console.error("Error sanitizing user data:", err);
      return res.status(500).json({ message: messages.error.sanitizationError });
    }

    return res.status(200).json({
      data: safeData,
      message: isUser ? messages.success.userVerified : messages.success.clientVerified,
    });
  } catch (error) {
    console.error("Error in verify-token route:", error);
    return res.status(500).json({ message: messages.error.serverError });
  }
});

export { router as commonRouter };
