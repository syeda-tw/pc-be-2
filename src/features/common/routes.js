import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../../common/models/user.js';
import Client from '../../common/models/client.js';

const router = express.Router();

// Define all messages locally
const messages = {
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

// Define validation schema locally
const verifyValidTokenSchema = {
  validate: ({ token }) => {
    if (!token || typeof token !== "string" || token.length < 10) {
      return { error: { details: [{ message: "Invalid token format" }] } };
    }
    return { error: null };
  },
};

const validateVerifyUserTokenMiddleware = (req, res, next) => {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
    return res.status(400).json({ message: messages.error.tokenNotFound });
  }
  const token = authorizationHeader.slice(7);

  const { error } = verifyValidTokenSchema.validate({ token });
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

// Add/define a sanitizeUser function if not already imported
const sanitizeUser = (user) => {
  // Return only safe fields; adjust as needed
  const { _id, email, status, first_name, middle_name, last_name, date_of_birth } = user;
  return { _id, email, status, first_name, middle_name, last_name, date_of_birth, type: "user" };
};

// Add sanitizeClient function alongside sanitizeUser
const sanitizeClient = (client) => {
  // Return only safe fields; adjust as needed
  const { _id, email, status, first_name, middle_name, last_name, date_of_birth } = client;
  return { _id, email, status, first_name, middle_name, last_name, date_of_birth, type: "client" };
};

router.post('/verify-token', validateVerifyUserTokenMiddleware, async (req, res) => {
    const authorizationHeader = req.headers.authorization;
    const token = authorizationHeader.slice(7);
    const secret = process.env.JWT_SECRET;

    if (!secret) {
        return res.status(500).json({ error: 'JWT_SECRET is not defined' });
    }

    jwt.verify(token, secret, async (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        try {
            // Attempt to find the user or client by ID
            const entity = await User.findById(decoded._id) || await Client.findById(decoded._id);
            if (entity) {
                const isUser = entity instanceof User;
                return res.status(200).json({
                    data: isUser ? sanitizeUser(entity) : sanitizeClient(entity),
                    message: isUser ? messages.success.userVerified : messages.success.clientVerified
                });
            }

            // If neither user nor client is found
            return res.status(404).json({ error: 'No user or client found for this token' });
        } catch (error) {
            return res.status(500).json({ error: 'Internal server error' });
        }
    });
});

export {router as commonRouter};
