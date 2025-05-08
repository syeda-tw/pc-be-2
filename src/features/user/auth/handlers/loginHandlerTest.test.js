import request from "supertest";
import app from "../../../../common/config/server.js";
import User from "../../../../common/models/User.js";
import { hashPassword } from '../../../common/utils.js';

describe("POST /login", () => {
  beforeAll(async () => {
    // Optionally, connect to test DB
  });

  afterAll(async () => {
    // Optionally, disconnect from test DB
  });

  beforeEach(async () => {
    // Clean up users before each test
    await User.deleteMany({});
  });

  it("should not accept empty body", async () => {
    const res = await request(app).post("/user/auth/login").send({});
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  it("should require email and password", async () => {
    const res = await request(app)
      .post("/user/auth/login")
      .send({ email: "test@example.com"  });
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  it("should validate email format", async () => {
    const res = await request(app)
      .post("/user/auth/login")
      .send({ email: "invalid", password: "password123"  });
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  it("should validate password presence", async () => {
    const res = await request(app)
      .post("/user/auth/login")
      .send({ email: "test@example.com"  });
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  it("should return error if user does not exist", async () => {
    const res = await request(app)
      .post("/user/auth/login")
      .send({ email: "nouser@example.com", password: "password123"  });
    expect(res.statusCode).toBeGreaterThanOrEqual(401);
  });

  it("should return error if password is invalid", async () => {
    // Create user
    await User.create({ email: "test@example.com", password: "Password123!" });
    const res = await request(app)
      .post("/user/auth/login")
      .send({
        email: "test@example.com", password: "Password123!!!" },
      });
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  it("should return token and user (without password) on success", async () => {
    // Create user with known password
    const password = "Password123!";
    await User.create({
      email: "test@example.com",
      password: await hashPassword(password),
    }); // Assume pre-save hook hashes password
    const res = await request(app)
      .post("/user/auth/login")
      .send({ email: "test@example.com", password  });
    expect(res.statusCode).toBeGreaterThanOrEqual(200);
    expect(res.statusCode).toBeLessThan(300);
    expect(res.body).toHaveProperty("token");
    expect(res.body).toHaveProperty("user");
    expect(res.body.user).toHaveProperty("email", "test@example.com");
    expect(res.body.user).not.toHaveProperty("password");
  });
});
