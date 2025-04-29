import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../../common/models/user.js';
import Client from '../../common/models/client.js';

const router = express.Router();

// Messages for responses
const responseMessages = {
  error: {
    tokenNotFound: "Authorization token not found",
    invalidToken: "Invalid token",
    jwtSecretMissing: "JWT_SECRET is not defined",
    notFound: "No user or client found for this token",
    serverError: "Internal server error"
  },
  success: {
    userVerified: "User successfully verified",
    clientVerified: "Client successfully verified"
  }
};

// Token validation schema
const tokenValidationSchema = {
  validate: ({ token }) => {
    if (!token || typeof token !== "string" || token.length < 10) {
      return { error: { details: [{ message: "Invalid token format" }] } };
    }
    return { error: null };
  },
};

// Middleware to validate token format
const validateTokenFormat = (req, res, next) => {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
    return res.status(400).json({ message: responseMessages.error.tokenNotFound });
  }
  const token = authorizationHeader.slice(7);

  const { error } = tokenValidationSchema.validate({ token });
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

// Function to sanitize user data
const sanitizeUserData = (user) => {
  const { _id, email, status, first_name, middle_name, last_name, date_of_birth } = user;
  return { _id, email, status, first_name, middle_name, last_name, date_of_birth, type: "user" };
};

// Function to sanitize client data
const sanitizeClientData = (client) => {
  const { _id, email, status, first_name, middle_name, last_name, date_of_birth } = client;
  return { _id, email, status, first_name, middle_name, last_name, date_of_birth, type: "client" };
};

// Route to verify token
router.post('/verify-token', validateTokenFormat, async (req, res) => {
  const authorizationHeader = req.headers.authorization;
  const token = authorizationHeader.slice(7);
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    return res.status(500).json({ error: responseMessages.error.jwtSecretMissing });
  }
  console.log("token", token);

  jwt.verify(token, secret, async (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: responseMessages.error.invalidToken });
    }

    try {
      const entity = await User.findById(decoded._id) || await Client.findById(decoded._id);
      if (entity) {
        const isUser = entity instanceof User;
        return res.status(200).json({
          data: isUser ? sanitizeUserData(entity) : sanitizeClientData(entity),
          message: isUser ? responseMessages.success.userVerified : responseMessages.success.clientVerified
        });
      }

      return res.status(404).json({ error: responseMessages.error.notFound });
    } catch (error) {
      return res.status(500).json({ error: responseMessages.error.serverError });
    }
  });
});

export { router as commonRouter };
