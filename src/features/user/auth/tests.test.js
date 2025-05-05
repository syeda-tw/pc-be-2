import request from "supertest";
import app from "../../../common/config/server.js";
import User from "../../../common/models/User.js"; // Your Mongoose User model
import OtpVerification from "../../../common/models/OtpVerification.js";
import { comparePassword, generateToken, hashPassword } from "./utils.js";

//TESTING REGISTER CALL


//TESTING VERIFY REGISTRATION OTP CALL
describe.skip("Verify Registration OTP - Testing Request Validity", () => {
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

describe.skip("Verify Registration OTP - Testing Endpoint Functionality", () => {
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

describe.skip("Verify User Token - Testing Endpoint Functionality", () => {
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

describe.skip("Login - Testing Request Validity", () => {
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

describe.skip("Login - Testing Endpoint Functionality", () => {
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

describe.skip("Request Reset Password - Testing Request Validity", () => {
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

describe.skip("Request Reset Password - Testing Endpoint Functionality", () => {
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

describe.skip("Reset Password - Testing Request Validity", () => {
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

describe.skip("Reset Password - Testing Endpoint Functionality", () => {
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

describe.skip("Testing Change Password - Testing Request Validity", () => {
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
  it("should return 400 if oldPassword is missing", async () => {
    const user = await User.findOne({ email: "test@example.com" });
    const token = generateToken({ _id: user._id.toString() }, "1h");
    const res = await request(app)
      .post("/auth/change-password")
      .set("Authorization", `Bearer ${token}`)
      .send({
        oldPassword: "",
        newPassword: "Test1234!",
      });
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  it("should return 400 if newPassword is missing", async () => {
    const user = await User.findOne({ email: "test@example.com" });
    const token = generateToken({ _id: user._id.toString() }, "1h");
    const res = await request(app)
      .post("/auth/change-password")
      .set("Authorization", `Bearer ${token}`)
      .send({
        oldPassword: "Test1234!",
        newPassword: "",
      });
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });
  it("should return 400 if both oldPassword and newPassword are missing", async () => {
    const user = await User.findOne({ email: "test@example.com" });
    const token = generateToken({ _id: user._id.toString() }, "1h");
    const res = await request(app)
      .post("/auth/change-password")
      .set("Authorization", `Bearer ${token}`)
      .send({
        oldPassword: "",
        newPassword: "",
      });
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });
});

describe.skip("Testing Change Password - Testing Endpoint Functionality", () => {
  beforeEach(async () => {
    const oldPassword = "Test1234!";
    const hashedPassword = await hashPassword(oldPassword);
    await User.create({
      email: "test@example.com",
      password: hashedPassword,
      status: "onboarding-step-1",
      first_name: "John",
      last_name: "Doe",
      is_admin: true,
    });
  });

  it("should return 200 if oldPassword and newPassword are valid", async () => {
    const user = await User.findOne({ email: "test@example.com" });
    const token = generateToken({ _id: user._id.toString() }, "1h");
    const res = await request(app)
      .post("/auth/change-password")
      .set("Authorization", `Bearer ${token}`)
      .send({
        oldPassword: "Test1234!",
        newPassword: "TestNew1234!",
      });
    expect(res.statusCode).toBe(200);
  }, 30000);

  it("should return 400 if oldPassword and newPassword are valid but authorization is wrong", async () => {
    const user = await User.findOne({ email: "test@example.com" });
    const token = "invalid_token_that_will_fail_verification";
    const res = await request(app)
      .post("/auth/change-password")
      .set("Authorization", `Bearer ${token}`)
      .send({
        oldPassword: "Test1234!",
        newPassword: "TestNew1234!",
      });
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  }, 30000);

  it("should return 400 if oldPassword is incorrect", async () => {
    const user = await User.findOne({ email: "test@example.com" });
    const token = generateToken({ _id: user._id.toString() }, "1h");
    const res = await request(app)
      .post("/auth/change-password")
      .set("Authorization", `Bearer ${token}`)
      .send({
        oldPassword: "WrongPassword123!",
        newPassword: "TestNew1234!",
      });
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  }, 30000);

  it("should return 400 if newPassword is the same as the oldPassword", async () => {
    const user = await User.findOne({ email: "test@example.com" });
    const token = generateToken({ _id: user._id.toString() }, "1h");
    const res = await request(app)
      .post("/auth/change-password")
      .set("Authorization", `Bearer ${token}`)
      .send({
        oldPassword: "Test1234!",
        newPassword: "Test1234!",
      });
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  }, 30000);
});
