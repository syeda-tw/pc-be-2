import { sendEmail } from "../../common/utils.js";

// Send OTP Registration Email
export const sendRegistrationEmail = async (email, otp) => {
  const subject = "Your OTP Code for Secure Verification on Practicare";
  const heading = "Verify Your Email Address";
  const content = `
      <p style="color: #333;">Hi there! To complete your email verification, please enter this code:</p>
      <div style="text-align: center; margin: 20px 0;">
        <h1 style="font-size: 32px; font-weight: bold; color: #000; letter-spacing: 4px;">${otp}</h1>
      </div>
      <p style="color: #333;">This code will expire in 10 minutes for your security.</p>
      <p style="color: #333;">If you didn't request this verification, you can safely ignore this email.</p>
  `;

  try {
    await sendEmail(email, subject, heading, content);
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
  const heading = `Hello Practitioner, Welcome to Practicare!`;
  const content = `
    <p style="color: #333;">We're thrilled to have you join our community of mental health professionals.</p>
    <p style="color: #333;">Here's what you can do with Practicare:</p>
    <ul style="color: #333; list-style-type: none; padding-left: 0;">
      <li style="margin-bottom: 10px;">📅 Manage your availability and calendar</li>
      <li style="margin-bottom: 10px;">📝 Create and customize intake forms</li>
      <li style="margin-bottom: 10px;">👥 Organize your client information</li>
      <li style="margin-bottom: 10px;">💼 Streamline your practice management</li>
    </ul>
    <p style="color: #333;">We're here to help you focus on what matters most - your clients. If you need any assistance getting started, our support team is just a message away.</p>
    <p style="color: #333;">Best wishes,<br/>The Practicare Team</p>
  `;
  try {
    await sendEmail(user.email, subject, heading, content);
  } catch (err) {
    throw {
      code: 400,
      message: "We couldn't send your welcome email. Please try again later.",
    };
  }
};

export const sendPasswordResetEmail = async (email, resetLink) => {
  const subject = "Reset Your Practicare Password";
  const heading = "Let's Get You Back In";
  const content = `
    <p style="color: #333;">Hi there,</p>
    <p style="color: #333;">We noticed you requested to reset your password. No worries - we're here to help you get back into your account!</p>
    <p style="color: #333;">Click the button below to create a new password:</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetLink}" style="background-color: #0f9790; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">Reset My Password</a>
    </div>
    <p style="color: #333;">For your security, this link will expire in 1 hour. If you didn't request this password reset, you can safely ignore this email - your account is still secure.</p>
    <p style="color: #333;">Need help? Our support team is always here for you.</p>
    <p style="color: #333;">Best regards,<br/>The Practicare Team</p>
  `;

  try {
    await sendEmail(email, subject, heading, content);
  } catch (err) {
    throw {
      code: 400,
      message:
        "We couldn't send your password reset email. Please try again in a few minutes.",
    };
  }
};