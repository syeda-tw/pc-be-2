import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const validateEmail = (email: string): boolean => {
  const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  return regex.test(email);
};

export const validatePassword = (password: string): boolean => {
  return password.length >= 8;
};

export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, 10);
};

export const generateOtp = (): string => {
  return Math.floor(10000 + Math.random() * 90000).toString();
};

export const generateToken = (payload: object): string => {
  const secret = process.env.JWT_SECRET as string;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined");
  }
  return jwt.sign(payload, secret, { expiresIn: "1h" });
};

export const verifyToken = (token: string): object | string | null => {
  const secret = process.env.JWT_SECRET as string;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined");
  }
  try {
    return jwt.verify(token, secret);
  } catch (err: any) {
    console.error("Invalid token:", err.message);
    return null;
  }
};

export const isPasswordCorrect = async (
  password: string,
  userPassword: string
): Promise<boolean> => {
  return await bcrypt.compare(password, userPassword);
};
