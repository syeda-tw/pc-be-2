import { sendEmail } from "../../common/utils/emailService.js";
import bcrypt from "bcrypt";
import { messages } from "./messages.js";

// Send OTP Registration Email
const sendRegistrationEmail = async (email, otp) => {
  const subject = "Your OTP Code for Secure Verification on Practicare";
  const htmlContent = `
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif; background-color: #f4f4f4; border-radius: 8px;">
      <h2 style="text-align: center; color: #333;">Secure OTP Code for Practicare</h2>
      <p style="color: #333;">Hello, we received a request to verify your email address with Practicare. Please use the following OTP code:</p>
      <div style="text-align: center;">
        <h1 style="font-size: 24px; font-weight: bold; color: #000;">${otp}</h1>
      </div>
      <p style="color: #333;">This code is valid for the next 10 minutes. If you did not request this verification, please ignore this email.</p>
      <p style="color: #333;">If you need further assistance, feel free to contact our support team.</p>
      <p style="color: #333;">Thank you for choosing Practicare!</p>
      <p style="color: #333;">Best regards,<br/>The Practicare Team</p>
    </div>
  `;

  try {
    await sendEmail(email, subject, htmlContent);
  } catch (err) {
    console.error("Error sending registration email:", err);
    throw new Error("Error sending OTP email.");
  }
};

const generateOtp = () => {
  return Math.floor(10000 + Math.random() * 90000).toString();
};

const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

const sendWelcomeEmail = async (email) => {
  await sendEmail(
    email,
    "Welcome to Practicare!",
    generateEmailHtml(
      "Welcome to Practicare!",
      `Hello ${user.first_name} ${user.last_name},  
  
      We're excited to welcome you to **Practicare**! Our platform is designed to help you manage your mental health practice efficiently—whether it's scheduling appointments, organizing client records, or streamlining daily tasks.  
  
      With Practicare, you can focus more on your clients while we handle the rest.  
  
      **Get started today:**  
      - [Log in to your account](https://www.practicare.co)  
      - Explore the features built for you  
      - Reach out to our support team if you need any help  
  
      We're here to support you on this journey. Welcome aboard!  
  
      **Best regards,**  
      The Practicare Team  
      [www.practicare.co](https://www.practicare.co)`
    )
  );
};

const isPasswordCorrect = async (password, userPassword) => {
  return await bcrypt.compare(password, userPassword);
};

const sendPasswordResetEmail = async (email, resetLink) => {  
  await sendEmail(
    email,
    "Password Reset Request",
    generateEmailHtml(
      "Password Reset Request",
      `Hello,

      We received a request to reset your password. Please use the following link to reset your password:

      <a href="${resetLink}">Reset Password</a>

      This link is valid for the next 1 hour. If you did not request this, please ignore this email.

      Best regards,
      The Practicare Team`
    )
  );
};  

export {
  sendRegistrationEmail,
  generateOtp,
  hashPassword,
  sendWelcomeEmail,
  isPasswordCorrect,
};
