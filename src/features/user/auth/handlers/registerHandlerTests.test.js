import request from "supertest";
import { faker } from "@faker-js/faker";
import app from "../../../../common/config/server.js";
import User from "../../../../common/models/User.js";
import { hashPassword } from "../../../common/utils.js";

// Helpers
const createLoginPayload = (overrides = {}) => ({
  email: faker.internet.email(),
  password: "Test1234!",
  ...overrides,
});

const insertUser = async ({ email, password }) => {
  const hashed = await hashPassword(password);
  return User.create({ email, password: hashed });
};

const clearDb = () => User.deleteMany();

describe("User Login", () => {
  beforeEach(clearDb);

  describe("Validation", () => {
    it.each([
      [{}, "empty body"],
      [{ email: "", password: "Test1234!" }, "missing email"],
      [{ email: "test@example.com", password: "" }, "missing password"],
      [{ email: "bad-email", password: "Test1234!" }, "invalid email format"],
    ])("should reject login with %s", async (data, desc) => {
      const res = await request(app).post("/user/auth/login").send({ data });
      expect(res.statusCode).toBeGreaterThanOrEqual(400);
    });
  });

  describe("Authentication", () => {
    it("should fail for non-existent user", async () => {
      const data = createLoginPayload();
      const res = await request(app).post("/user/auth/login").send({ data });
      expect(res.statusCode).toBeGreaterThanOrEqual(401);
    });

    it("should fail for incorrect password", async () => {
      const data = createLoginPayload();
      await insertUser(data);
      const res = await request(app)
        .post("/user/auth/login")
        .send({ data: { email: data.email, password: "WrongPass1!" } });
      expect(res.statusCode).toBeGreaterThanOrEqual(400);
    });

    it("should succeed with valid credentials", async () => {
      const data = createLoginPayload();
      await insertUser(data);
      const res = await request(app).post("/user/auth/login").send({ data });
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("token");
      expect(res.body.user).toHaveProperty("email", data.email);
      expect(res.body.user).not.toHaveProperty("password");
    });
  });
});
