
import User from "../../../../common/models/User.js";
import OtpVerification from "../../../../common/models/OtpVerification.js";
import Practice from "../../../../common/models/practice.js";
import { sendWelcomeEmail } from "../utils.js";
import { generateToken, sanitizeUserAndAppendType } from "../../../common/utils.js";

const messages = {
    notFound: {
        resource: "Resource not found",
    },
    error: {
        invalidOtp: "Invalid OTP",
        expiredOtp: "OTP expired",
        missingFields: "Missing required fields",
        otpAlreadyUsed: "OTP already used",
    },
    register: {
        otpVerified: "OTP verified successfully",
    },
};

const verifyRegistrationOtpOperation = async (email, otp, next) => {
    const otpVerification = await OtpVerification.findOne({ email });

    if (!otpVerification) {
        return next({ status: 404, message: messages.notFound.resource });
    }

    if (otpVerification.expiresAt < new Date()) {
        return next({ status: 400, message: messages.error.expiredOtp });
    }

    if (otpVerification.otp !== otp) {
        return next({ status: 400, message: messages.error.invalidOtp });
    }

    const newPractice = await Practice.create({});

    const user = await User.create({
        email: otpVerification.email,
        password: otpVerification.password,
        status: "onboarding-step-1",
        isAdmin: true,
        practice: newPractice._id,
    });

    await OtpVerification.deleteOne({ email });

    const _id = user._id.toString();
    const token = generateToken({ _id });

    await sendWelcomeEmail(user);

    return {
        user: user.toObject(),
        token,
    };
};

export const verifyRegistrationOtpHandler = async (req, res, next) => {
    try {
        const { email, otp } = req.body.data;
        const { user, token } = await verifyRegistrationOtpOperation(email, otp, next);
        return res.status(200).json({
            user: sanitizeUserAndAppendType(user, "user"),
            token,
            message: messages.register.otpVerified,
        });
    } catch (err) {
        next(err);
    }
};
