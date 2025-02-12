import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../helpers/auth";

interface AuthRequest extends Request {
  user?: any; // Change `any` to a proper type if you have a User type
}

function checkValidToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1]; // Extract token after "Bearer"
  console.log("token", token);

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Token verification error:", err);
    return res.status(401).json({ message: "Invalid token" });
  }
}

export default checkValidToken;
