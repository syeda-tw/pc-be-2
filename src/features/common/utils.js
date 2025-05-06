import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "../../common/config/env.js";

export const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

export const generateToken = (payload, expiresIn = "200h") => {
  const secret = env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined");
  }
  return jwt.sign(payload, secret, { expiresIn });
};

export const sanitizeUserAndAppendType = (user, type) => {
  const { password, ...userWithoutPassword } = user;
  return { ...userWithoutPassword, type: type || "user" };
};

export const isPasswordCorrect = async (password, correctPassword) => {
  return await bcrypt.compare(password, correctPassword);
};

export const verifyJWTToken = (token) => {
  const secret = env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined");
  }
  return jwt.verify(token, secret);
};