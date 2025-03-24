import { sendEmail } from "../../common/utils/emailService.js";

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


export { sendRegistrationEmail, generateOtp, hashPassword };
