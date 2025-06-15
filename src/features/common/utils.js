import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "../../common/config/env.js";
import nodemailer from "nodemailer";

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
    username,
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
    username,
    type: type || "user",
  };
};

export const isPasswordCorrect = async (password, correctPassword) => {
  return await bcrypt.compare(password, correctPassword);
};

const generateEmailTemplate = ({ heading, content }) => {
  return `
    <div style="background-color: rgb(249, 252, 255); padding: 40px 0; font-family: Arial, sans-serif;">
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.04);">
        <tr>
          <td style="padding: 40px; color: #333; text-align: center;">
            <img src="cid:practicare-logo" alt="Practicare Logo" style="max-width: 140px; margin-bottom: 24px;" />
            <h1 style="margin: 0 0 24px; font-size: 20px; color: hsl(208, 68%, 39%);">
              ${heading}
            </h1>
            <div style="font-size: 15px; line-height: 1.6; text-align: left; color: #444;">
              ${content}
            </div>
            <div style="margin-top: 40px; font-size: 14px; color: #555; text-align: left;">
              <p style="margin-bottom: 4px;">Sincerely,</p>
              <p style="margin: 0; font-weight: 500; color: #0f9790;">The Practicare Team</p>
              <p style="margin: 4px 0 0;">
                <a href="https://www.practicare.com" style="color: hsl(208, 68%, 39%); text-decoration: none;">www.practicare.co</a>
              </p>
            </div>
          </td>
        </tr>
      </table>
    </div>
  `;
};

export const sendEmail = async (to, subject, heading, content) => {
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
      html: generateEmailTemplate({ heading, content }),
      attachments: [
        {
          filename: 'practicare-logo.png',
          path: 'practicare-logo.png',
          cid: 'practicare-logo',
        },
      ],
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
