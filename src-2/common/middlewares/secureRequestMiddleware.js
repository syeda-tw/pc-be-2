import jwt from "jsonwebtoken";
import { messages } from "../../features/auth/messages";

const secureRequestMiddleware = (req, res, next) => {
  const token = req.headers.authorization;
  
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.status(500).json({ message: messages.error.serverError });
  }
  try {
    const decoded = jwt.verify(token.split(" ")[1], secret);
    if (!decoded?._id) {
      return res.status(401).json({ message: messages.error.invalidToken });
    }
    req.body.decodedToken = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: messages.error.invalidTokenFormat });
  }
};

export { secureRequestMiddleware };
