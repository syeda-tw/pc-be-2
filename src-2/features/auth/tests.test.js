import request from "supertest";
import app from "../../common/config/server.js";
import User from "../../common/models/user"; // Your Mongoose User model
import OtpVerification from "../../common/models/otpVerification.js";
import { comparePassword, generateToken, hashPassword } from "./utils.js";
import bcrypt from "bcrypt";

//TESTING REGISTER CALL
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
  practice: "603d9f3d8d4e4f2f74c2c5f9",
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

//TESTING VERIFY REGISTRATION OTP CALL
describe("Verify Registration OTP - Testing Request Validity", () => {
  beforeEach(async () => {
    await OtpVerification.create({
      email: "test@example.com",
      otp: "12345",
      password: "$2b$10$Kqf7X1gABBllZEPxo.R5oO47gayfX8Mw6lxMgHHb6tHskEroDu1/W",
    });
  });

  it("should return 400 if OTP is missing", async () => {
    const res = await request(app).post("/auth/verify-registration-otp").send({
      email: "test@example.com",
      otp: "",
    });
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  it("should return 400 if email is missing", async () => {
    const res = await request(app).post("/auth/verify-registration-otp").send({
      otp: "12345",
    });
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  it("should return 400 if email is invalid", async () => {
    const res = await request(app).post("/auth/verify-registration-otp").send({
      email: "invalid-email",
      otp: "12345",
    });
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });
});

describe("Verify Registration OTP - Testing Endpoint Functionality", () => {
  beforeEach(async () => {
    await OtpVerification.create({
      email: "test@example.com",
      otp: "12345",
      password: "$2b$10$Kqf7X1gABBllZEPxo.R5oO47gayfX8Mw6lxMgHHb6tHskEroDu1/W",
    });
  });
  it("should return 200 if email and OTP are valid", async () => {
    const res = await request(app).post("/auth/verify-registration-otp").send({
      email: "test@example.com",
      otp: "12345",
    });
    expect(res.statusCode).toBe(200);
  }, 30000); // 30 second timeout

  it("should create a user in the database when valid otp is provided", async () => {
    await request(app).post("/auth/verify-registration-otp").send({
      email: "test@example.com",
      otp: "12345",
    });
    const user = await User.findOne({ email: "test@example.com" });
    expect(user.email).toBe("test@example.com");
    expect(user.status).toBe("onboarding-step-1");
  }, 30000); // 30 second timeout

  it("should return 400 if OTP is invalid", async () => {
    const res = await request(app).post("/auth/verify-registration-otp").send({
      email: "test@example.com",
      otp: "12245",
    });
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  }, 30000); // 30 second timeout

  it("should return 400 if email is not found in the database", async () => {
    const res = await request(app).post("/auth/verify-registration-otp").send({
      email: "testincorrect@example.com",
      otp: "12345",
    });
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  }, 30000); // 30 second timeout

  it("should return a token in the response when valid OTP is provided", async () => {
    const res = await request(app).post("/auth/verify-registration-otp").send({
      email: "test@example.com",
      otp: "12345",
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.token).toBeDefined();
    expect(typeof res.body.data.token).toBe("string");
  }, 30000); // 30 second timeout
});

describe("Verify User Token - Testing Endpoint Functionality", () => {
  it("should return code greater than 400 if empty authorization", async () => {
    const res = await request(app)
      .post("/auth/verify-user-token")
      .set("Authorization", "") // Empty authorization header
      .send();

    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  it("should return code greater than 400 if invalid authorization", async () => {
    const res = await request(app)
      .post("/auth/verify-user-token")
      .set("Authorization", "invalid-token")
      .send();

    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  it("should return 200 if user token is valid", async () => {
    // Step 1: Create a valid user (you can skip this if the user already exists in your test DB)
    const user = await User.create({
      email: "test@example.com",
      password: "Test1234!",
      // Include other necessary fields for the user model
    });
    // Step 2: Generate a token for the user
    const token = generateToken({ _id: user._id });

    // Step 3: Test the endpoint with the generated token
    const res = await request(app)
      .post("/auth/verify-user-token")
      .set("Authorization", `Bearer ${token}`) // Set the Authorization header with the generated token
      .send();

    // Step 4: Expect a successful response
    expect(res.statusCode).toBe(200);
  });
});

describe.only("Login - Testing Request Validity", () => {
  it("should return 400 if email is missing", async () => {
    const res = await request(app).post("/auth/login").send({
      email: "",
      password: "Test1234!",
    });
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  it("should return 400 if password is missing", async () => {
    const res = await request(app).post("/auth/login").send({
      email: "test@example.com",
      password: "",
    });
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });
});

describe("Login - Testing Endpoint Functionality", () => {
  beforeEach(async () => {
    const hashedPassword = await hashPassword("Test1234!");
    await User.create({
      email: "test@example.com",
      password: hashedPassword,
      status: "onboarding-step-1",
      first_name: "John",
      last_name: "Doe",
      is_admin: true,
    });
  });

  it("should return 200 if email and password are valid", async () => {
    const res = await request(app).post("/auth/login").send({
      email: "test@example.com",
      password: "Test1234!",
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.token).toBeDefined();
    expect(typeof res.body.data.token).toBe("string");
    expect(res.body.data.user).toBeDefined();
    expect(res.body.data.user.email).toBe("test@example.com");
  }, 30000); // 30 second timeout

  it("should return status above 400 if email not found", async () => {
    const res = await request(app).post("/auth/login").send({
      email: "nonexistent@example.com",
      password: "Test1234!",
    });
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  }, 30000); // 30 second timeout

  it("should return status greater than 400 if email correct but wrong password", async () => {
    const res = await request(app).post("/auth/login").send({
      email: "test@example.com",
      password: "WrongPassword123!",
    });
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  }, 30000); // 30 second timeout

  it("should return 400 if email is invalid", async () => {
    const res = await request(app).post("/auth/login").send({
      email: "invalid-email",
      password: "Test1234!",
    });
  }, 30000);
});

describe("Request Reset Password - Testing Request Validity", () => {
  it("should return 400 if email is missing", async () => {
    const res = await request(app).post("/auth/request-reset-password").send({
      email: "",
    });
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  it("should return 400 if email is invalid", async () => {
    const res = await request(app).post("/auth/request-reset-password").send({
      email: "invalid-email",
    });
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });
});

describe("Request Reset Password - Testing Endpoint Functionality", () => {
  beforeEach(async () => {
    const hashedPassword = await hashPassword("Test1234!");
    await User.create({
      email: "test@example.com",
      password: hashedPassword,
      status: "onboarding-step-1",
      first_name: "John",
      last_name: "Doe",
      is_admin: true,
    });
  });

  it("should return 200 if email is valid", async () => {
    const res = await request(app).post("/auth/request-reset-password").send({
      email: "test@example.com",
    });
    expect(res.statusCode).toBe(200);
  }, 30000); // 30 second timeout

  it("should return greater than or equal to 400 if email not found", async () => {
    const res = await request(app).post("/auth/request-reset-password").send({
      email: "nonexistent@example.com",
    });
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  }, 30000); // 30 second timeout
});

describe("Reset Password - Testing Request Validity", () => {
  it("should return 400 if token is missing", async () => {
    const res = await request(app).post("/auth/reset-password").send({
      token: "",
    });
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  it("should return 400 if token is invalid", async () => {
    const res = await request(app).post("/auth/reset-password").send({
      token: "invalid-token",
    });
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  it("should return 400 if password is missing", async () => {
    const res = await request(app).post("/auth/reset-password").send({
      token: "valid-token",
      password: "",
    });
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });
});

describe.only("Reset Password - Testing Endpoint Functionality", () => {
  beforeEach(async () => {
    const hashedPassword = await hashPassword("Test1234!");
    await User.create({
      email: "test@example.com",
      password: hashedPassword,
      status: "onboarding-step-1",
      first_name: "John",
      last_name: "Doe",
      is_admin: true,
    });
  });

  it("should return 200 if token is valid", async () => {
    const user = await User.findOne({ email: "test@example.com" });
    const token = generateToken({ _id: user._id.toString() }, "1h");
    const res = await request(app).post("/auth/reset-password").send({
      token: token,
      password: "NewPassword123!",
    });
    expect(res.statusCode).toBe(200);
  }, 30000);

  it("user password should be updated", async () => {
    const userInitial = await User.findOne({ email: "test@example.com" });
    const token = generateToken({ _id: userInitial._id.toString() }, "1h");
    await request(app).post("/auth/reset-password").send({
      token: token,
      password: "TestNew1234!",
    });
    const user = await User.findOne({ email: "test@example.com" });
    const isPasswordCorrect = await comparePassword(
      "TestNew1234!",
      user.password
    );
    expect(isPasswordCorrect).toBe(true);
  }, 30000);

  it("should return 400 if password is the same as the previous password", async () => {
    const userInitial = await User.findOne({ email: "test@example.com" });
    const token = generateToken({ _id: userInitial._id.toString() }, "1h");
    const res = await request(app).post("/auth/reset-password").send({
      token: token,
      password: "Test1234!",
    });
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  }, 30000);
});
