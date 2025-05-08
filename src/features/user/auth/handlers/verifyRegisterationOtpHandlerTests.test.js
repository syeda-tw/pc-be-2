import request from "supertest";
import app from "../../../../common/config/server.js";
import User from "../../../../common/models/User.js";
import OtpVerification from "../../../../common/models/OtpVerification.js";
import { faker } from '@faker-js/faker';

// Helper to create an OTP entry
const createOtp = async ({ email, otp = "12345", expiresAt } = {}) =>
    OtpVerification.create({
        email,
        otp,
        password: "Test1234!",
        expiresAt: expiresAt || new Date(Date.now() + 10 * 60 * 1000),
    });

const clearDb = async () => {
    await User.deleteMany();
    await OtpVerification.deleteMany();
};

describe("Verify Registration OTP", () => {

    beforeEach(clearDb);

    it("verifies OTP and creates user", async () => {
        const email = faker.internet.email();
        const otp = "65432";
        await createOtp({ email, otp, expiresAt: new Date(Date.now() + 10 * 60 * 1000) });

        const res = await request(app)
            .post("/user/auth/verify-registration-otp")
            .send({email, otp  });

        expect(res.statusCode).toBe(200);
        expect(await User.findOne({ email })).not.toBeNull();
    }, 10000);

    it("rejects invalid OTP", async () => {
        const email = faker.internet.email();
        await createOtp({ email, otp: "11111" });

        const res = await request(app)
            .post("/user/auth/verify-registration-otp")
            .send({email, otp: "99999"  });

        expect(res.statusCode).toBeGreaterThanOrEqual(400);
    }, 10000);

    it("rejects expired OTP", async () => {
        const email = faker.internet.email();
        await createOtp({ email, otp: "22222", expiresAt: new Date(Date.now()) });
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for 30 seconds
        const res = await request(app)
            .post("/user/auth/verify-registration-otp")
            .send({email, otp: "22222"  });

        expect(res.statusCode).toBeGreaterThanOrEqual(400);
    }, 100000);

    it("rejects missing fields", async () => {
        const res = await request(app)
            .post("/user/auth/verify-registration-otp")
            .send({ data: { });

        expect(res.statusCode).toBeGreaterThanOrEqual(400);
    }, 10000);
});
