import request from "supertest";
import app from "../../../../common/config/server.js";
import User from "../../../../common/models/User.js";
import { hashPassword } from "../../../common/utils.js";

describe("POST /request-reset-password", () => {
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
    const res = await request(app).post("/user/auth/request-reset-password").send({});
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  it("should require a valid email", async () => {
    const res = await request(app)
      .post("/user/auth/request-reset-password")
      .send({ data: { email: "xyz" } });
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });


  it("should return error if user does not exist", async () => {
    const res = await request(app)
      .post("/user/auth/request-reset-password")
      .send({ data: { email: "nouser@example.com" } });
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  it("should return nothing, only 200 on success", async () => {
    await User.create({
      email: "test@example.com",
      password: await hashPassword("Password123!"),
    }); // Assume pre-save hook hashes password
    const res = await request(app)
      .post("/user/auth/request-reset-password")
      .send({ data: { email: "test@example.com" } });
    expect(res.statusCode).toBeGreaterThanOrEqual(200);
    expect(res.statusCode).toBeLessThan(300);
  }, 50000);
});
