import Client from "../../../../common/models/Client.js";

const messages = {
  CLIENT_NOT_FOUND: "We couldn't find a client with that information.",
  OTP_SENT: "We've sent a login code to your phone.",
};

const generateOtp = () => {
  return "12345";
    //return Math.floor(100000 + Math.random() * 900000).toString();
};

const requestLoginOtpService = async (phone) => {
  try {
    const client = await Client.findOne({ phone });
    if (!client) {
      throw new Error(messages.CLIENT_NOT_FOUND);
    }
    const otp = generateOtp();
    client.loginOtp = otp;
    client.loginOtpExpiresAt = new Date(Date.now() + 1000 * 60 * 5);
    await client.save();
  } catch (error) {
    throw error;
  }
};

const requestLoginOtpHandler = async (req, res) => {
  const { phone } = req.body;
  try {
    await requestLoginOtpService(phone);
    res.status(200).json({ message: messages.OTP_SENT });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export default requestLoginOtpHandler;