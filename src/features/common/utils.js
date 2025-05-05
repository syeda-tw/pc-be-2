import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "../../common/config/env.js";

export const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

export const generateToken = (payload) => {
  const secret = env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined");
  }
  return jwt.sign(payload, secret, { expiresIn: "200h" });
};

export const sanitizeUserAndAppendType = (user, type) => {
  const { password, ...userWithoutPassword } = user;
  return { ...userWithoutPassword, type: type || "user" };
};
