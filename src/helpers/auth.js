import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const validateEmail = (email) => {
  const regex = /^[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  return regex.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 8;
};

export const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

export const generateOtp = () => {
  return Math.floor(10000 + Math.random() * 90000).toString();
};

export const generateToken = (payload) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined");
  }
  return jwt.sign(payload, secret, { expiresIn: "200h" });
};

export const verifyToken = (token) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined");
  }
  try {
    return jwt.verify(token, secret);
  } catch (err) {
    console.error("Invalid token:", err.message);
    return null;
  }
};

export const isPasswordCorrect = async (password, userPassword) => {
  return await bcrypt.compare(password, userPassword);
};

//this function is used to remove the password from the user object
export const sanitizeUser = (user) => {
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};
