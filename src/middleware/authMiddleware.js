import { verifyToken } from "../helpers/auth.js"; // Your token verification logic

export default function checkValidToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
    req.user = decoded; // Attach user to request
    next(); // Proceed to next middleware/route handler
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
}
