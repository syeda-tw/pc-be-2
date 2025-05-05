import request from "supertest";
import app from "../../../../common/config/server.js";
import User from "../../../../common/models/User.js";
import OtpVerification from "../../../../common/models/OtpVerification.js";
import { faker } from '@faker-js/faker';

// Helper functions
const createUserPayload = (overrides = {}) => ({
  email: faker.internet.email(),
  password: "Test1234!",
  ...overrides,
});

const clearDb = async () => {
  await User.deleteMany();
  await OtpVerification.deleteMany();
};

describe("User Registration", () => {
  beforeEach(async () => {
    await clearDb();
  });

  describe("Validation", () => {
    it.skip.each([
      [{ email: "", password: "Test1234!" }, "missing email"],
      [{ email: "test@example.com", password: "" }, "missing password"],
      [{ email: "invalid", password: "Test1234!" }, "invalid email"],
      [{ email: "test@example.com", password: "123" }, "invalid password"],
    ])("should not register user with %s", async (data, desc) => {
      const res = await request(app).post("/user/auth/register").send({ data });
      expect(res.statusCode).toBeGreaterThanOrEqual(400);
      // Optionally: expect(res.body.message).toMatch(/error/i);
    });
  });

  describe("Functionality", () => {
    it.skip("should send OTP to new user", async () => {
      const data = createUserPayload();
      const res = await request(app).post("/user/auth/register").send({ data });
      const otpUser = await OtpVerification.findOne({ email: data.email });
      expect(otpUser).not.toBeNull();
      expect(res.statusCode).toBe(200);
    }, 10000); // Adding a longer timeout of 10 seconds

    it("should update OTP for existing OTP user", async () => {
      const data = createUserPayload();
      await OtpVerification.create({ email: data.email, otp: "123456", password: data.password });
      const res = await request(app).post("/user/auth/register").send({ data });
      const otpUser = await OtpVerification.findOne({ email: data.email });
      expect(otpUser.otp).not.toBe("123456");
      expect(res.statusCode).toBe(200);
    });

    it("should not register if user already exists", async () => {
      const data = createUserPayload();
      await User.create({ ...data }); // ← flattening data
      const res = await request(app).post("/user/auth/register").send({ data });
      expect(res.statusCode).toBeGreaterThanOrEqual(400);
    });
  });
});
