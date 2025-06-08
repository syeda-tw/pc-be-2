import { sendEmail } from "../../common/utils.js";

// Send OTP Registration Email
export const sendRegistrationEmail = async (email, otp) => {
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
    throw {
      code: 400,
      message: "Error sending OTP email.",
    };
  }
};

export const generateOtp = () => {
  // return Math.floor(10000 + Math.random() * 90000).toString();
  return "12345";
};

export const sendWelcomeEmail = async (user) => {
  const subject = "Welcome to Practicare!";
  const htmlContent = `
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif; background-color: #f4f4f4; border-radius: 8px;">
      <h2 style="text-align: center; color: #333;">Welcome to Practicare!</h2>
      <p style="color: #333;">Hello ${user.firstName} ${user.lastName},</p>
      <p style="color: #333;">We're excited to welcome you to Practicare! Our platform is designed to help you manage your mental health practice efficiently—whether it's scheduling sessions, organizing client records, or streamlining daily tasks.</p>
      <p style="color: #333;">With Practicare, you can focus more on your clients while we handle the rest.</p>
      <p style="color: #333;"><strong>Get started today:</strong></p>
      <ul style="color: #333;">
        <li><a href="https://www.practicare.co" style="color: #007bff;">Log in to your account</a></li>
        <li>Explore the features built for you</li>
        <li>Reach out to our support team if you need any help</li>
      </ul>
      <p style="color: #333;">We're here to support you on this journey. Welcome aboard!</p>
      <p style="color: #333;">Best regards,<br/>The Practicare Team</p>
      <p style="color: #333;"><a href="https://www.practicare.co" style="color: #007bff;">www.practicare.co</a></p>
    </div>
  `;

  try {
    await sendEmail(user.email, subject, htmlContent);
  } catch (err) {
    throw {
      code: 400,
      message: "Error sending welcome email.",
    };
  }
};

export const sendPasswordResetEmail = async (email, resetLink) => {
  const subject = "Password Reset Request";
  const htmlContent = `
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif; background-color: #f4f4f4; border-radius: 8px;">
      <h2 style="text-align: center; color: #333;">Password Reset Request</h2>
      <p style="color: #333;">Hello,</p>
      <p style="color: #333;">We received a request to reset your password. Please use the following link to reset your password:</p>
      <div style="text-align: center;">
        <a href="${resetLink}" style="color: #007bff; font-size: 18px;">Reset Password</a>
      </div>
      <p style="color: #333;">This link is valid for the next 1 hour. If you did not request this, please ignore this email.</p>
      <p style="color: #333;">Best regards,<br/>The Practicare Team</p>
    </div>
  `;

  try {
    await sendEmail(email, subject, htmlContent);
  } catch (err) {
    throw {
      code: 400,
      message: "Error sending password reset email.",
    };
  }
};

export const generateOtpExpiration = () => {
  return new Date(Date.now() + 10 * 60 * 1000);
};
