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
  const {
    _id,
    firstName,
    lastName,
    middleName,
    phone,
    email,
    dateOfBirth,
    gender,
    pronouns,
    title,
    status,
    relationships,
    defaultRelationship,
    // Destructure other fields that might exist but we don't want to include,
    // especially sensitive ones like password.
    // eslint-disable-next-line no-unused-vars
    password,
    // eslint-disable-next-line no-unused-vars
    ...rest 
  } = user;

  return {
    _id,
    firstName,
    lastName,
    middleName,
    phone,
    email,
    dateOfBirth,
    gender,
    pronouns,
    title,
    status,
    relationships,
    defaultRelationship,
    type: type || "user",
  };
};

export const isPasswordCorrect = async (password, correctPassword) => {
  return await bcrypt.compare(password, correctPassword);
};


export const sendEmail = async (to, subject, htmlContent) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail", // Example; use your actual SMTP configuration here
      auth: {
        user: env.NODEMAILER_EMAIL,
        pass: env.NODEMAILER_PASSWORD,
      },
    });

    const mailOptions = {
      from: env.NODEMAILER_EMAIL,
      to,
      subject,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error("Error sending email:", err);
    throw {
      code: 400,
      message: 'Email sending failed',
    };
  }
};
