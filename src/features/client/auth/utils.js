import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const hashPassword = async (password) => {
    return await bcrypt.hash(password, 10);
};

export const comparePassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
};

export const isPasswordCorrect = async (password, userPassword) => {
    return await bcrypt.compare(password, userPassword);
};

export const generateToken = (payload) => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET is not defined");
    }
    return jwt.sign(payload, secret, { expiresIn: "200h" });
  };
  