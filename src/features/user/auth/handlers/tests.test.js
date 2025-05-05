import request from "supertest";
import app from "../../../common/config/server.js";
import User from "../../../common/models/User.js";
import OtpVerification from "../../../common/models/OtpVerification.js";

describe("Testing register validity of request", () => {
    it("should not register a user with missing email", async () => {
      const res = await request(app).post("/auth/register").send({
        email: "",
        password: "Test1234!",
      });
      expect(res.statusCode).toBeGreaterThanOrEqual(400);
    });
  
    it("should not register a user with missing password", async () => {
      const res = await request(app).post("/auth/register").send({
        email: "test@example.com",
        password: "",
      });
      expect(res.statusCode).toBeGreaterThanOrEqual(400);
    });
  
    it("should not register a user with invalid email", async () => {
      const res = await request(app).post("/auth/register").send({
        email: "test",
        password: "Test1234!",
      });
      expect(res.statusCode).toBeGreaterThanOrEqual(400);
    });
  
    it("should not register a user with invalid password", async () => {
      const res = await request(app).post("/auth/register").send({
        email: "test@example.com",
        password: "1234567",
      });
      expect(res.statusCode).toBeGreaterThanOrEqual(400);
    });
  });
  
  describe("Testing register endpoint functionality", () => {
    it("should send otp to the user who is registering for the first time", async () => {
      await User.deleteMany();
      const res = await request(app).post("/auth/register").send({
        email: "test@example.com",
        password: "Test1234!",
      });
      const otpUser = await OtpVerification.findOne({
        email: "test@example.com",
      });
      expect(otpUser).not.toBeNull();
      expect(res.statusCode).toBe(200);
    });
  
    it("should send a new otp to the user who is registering for the second time", async () => {
      await User.deleteMany();
      await OtpVerification.deleteMany();
      // Ensure the user already exists in the OtpVerification table
      await OtpVerification.create({
        email: "test@example.com",
        otp: "123456",
        password: "Test1234!",
      });
  
      const res = await request(app).post("/auth/register").send({
        email: "test@example.com",
        password: "Test1234!",
      });
  
      const otpUser = await OtpVerification.findOne({
        email: "test@example.com",
      });
      expect(otpUser).not.toBeNull();
      expect(otpUser.otp).not.toBe("123456"); // Ensure the OTP has been updated
      expect(res.statusCode).toBe(200);
    });
  
    it("should return an error if the user already exists in the users table", async () => {
      await User.deleteMany();
      await OtpVerification.deleteMany();
      // Ensure the user already exists in the Users table
      const user = await User.create(mockUserComplete);
      const res = await request(app).post("/auth/register").send({
        email: "test@example.com",
        password: "Test1234!",
      });
  
      expect(res.statusCode).toBeGreaterThanOrEqual(400);
    });
  });
  
  export const mockUserComplete = {
    _id: "603d9f3d8d4e4f2f74c2c5f8",
    title: "Mr.",
    is_admin: false,
    pronouns: "he/him",
    hourly_rate: 50,
    gender: "Male",
    qualifications: [
      {
        degree: "BSc in Computer Science",
        university: "Example University",
        year: 2020,
      },
      {
        certification: "AWS Certified Developer",
        year: 2022,
      },
    ],
    practice_id: "603d9f3d8d4e4f2f74c2c5f9",
    password: "hashed_password_here",
    status: "onboarding-step-2",
    email: "test@example.com",
    first_name: "John",
    last_name: "Doe",
    middle_name: "Michael",
    date_of_birth: "1990-01-01T00:00:00Z",
    availability: [
      {
        Monday: ["9am-12pm", "2pm-5pm"],
        Tuesday: ["9am-12pm"],
        Wednesday: ["10am-1pm"],
        Thursday: ["2pm-5pm"],
        Friday: ["9am-12pm", "3pm-6pm"],
        Saturday: [],
        Sunday: [],
      },
    ],
    forms: [
      {
        _id: "form1",
        name: "Onboarding Form",
        created_at: "2022-01-01T00:00:00Z",
        s3_url: "https://s3.amazon.com/example-form1.pdf",
      },
      {
        _id: "form2",
        name: "Privacy Policy Agreement",
        created_at: "2022-02-01T00:00:00Z",
        s3_url: "https://s3.amazon.com/example-form2.pdf",
      },
    ],
  };