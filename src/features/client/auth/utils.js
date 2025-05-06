import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "../../../common/config/env.js";

// TODO: remove this function
export const hashPassword = async (password) => {
    return await bcrypt.hash(password, 10);
};

// TODO: remove this function
export const comparePassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
};

// TODO: remove this function
export const isPasswordCorrect = async (password, userPassword) => {
    return await bcrypt.compare(password, userPassword);
};

// TODO: remove this function
export const generateToken = (payload) => {
    const secret = env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET is not defined");
    }
    return jwt.sign(payload, secret, { expiresIn: "200h" });
  };
  