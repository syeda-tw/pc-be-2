import nodemailer from "nodemailer";
import { env } from "../../common/config/env.js";
import CustomError from "./customError.js";

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
      from: process.env.NODEMAILER_EMAIL,
      to,
      subject,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error("Error sending email:", err);
    throw new CustomError(400, 'Email sending failed');
  }
};
