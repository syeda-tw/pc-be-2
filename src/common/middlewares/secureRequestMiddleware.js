import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

const messages = {
  error: {
    invalidToken: "Invalid token",
    invalidTokenFormat: "Invalid token format",
    jwtSecretMissing: "JWT_SECRET is not defined",
  },
};

//this middleware is used to secure the request and check if the token is valid
const secureRequestMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const secret = env.JWT_SECRET;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: messages.error.invalidTokenFormat });
  }

  if (!secret) {
    console.error("JWT_SECRET is missing");
    return res.status(500).json({ message: messages.error.jwtSecretMissing });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, secret);

    if (!decoded?._id) {
      return res.status(401).json({ message: messages.error.invalidToken });
    }

    req.id = decoded._id;
    next();
  } catch (err) {
    console.error("Token verification failed:", err);
    return res.status(401).json({ message: messages.error.invalidToken });
  }
};

export { secureRequestMiddleware };
