import User from "../../../../common/models/User.js";
import { generateOtp, sendRegistrationEmail } from "../utils.js";
import { hashPassword } from "../../../common/utils.js";
import OtpVerification from "../../../../common/models/OtpVerification.js";

const messages = {
    error: {
        userAlreadyExists: "User already exists"
    }
}

const registerOperation = async (email, password) => {
        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            next(messages.error.userAlreadyExists)
        }
        const otpVerification = await OtpVerification.findOne({ email });
        const otp = generateOtp();
        const hashedPassword = await hashPassword(password);
        console.log("otp", otp);
    
        if (otpVerification) {
            //If OTP verification already exists, update the password and otp
            Object.assign(otpVerification, { email, password: hashedPassword, otp });
            await otpVerification.save();
            await sendRegistrationEmail(email, otp)
        } else {
                //If OTP verification does not exist, create a new one
            await OtpVerification.create({ email, password: hashedPassword, otp });
        }
        return;
    };


export const registerHandler = async (req, res) => {
    const { email, password } = req.body.data;
    try {
        await registerOperation(email, password);
        return res.status(200).json({
            data: { email },
            message: messages.register.otpSent,
        });
    } catch (err) {
        next(err);
    }
};
