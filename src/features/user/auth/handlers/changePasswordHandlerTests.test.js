import request from "supertest";
import app from "../../../../common/config/server.js";
import User from "../../../../common/models/User.js";
import {
  generateToken,
  hashPassword,
  isPasswordCorrect,
} from "../../../common/utils.js";

describe("POST /change-password", () => {
  let token;
  let user;

  beforeAll(async () => {});

  afterAll(async () => {
    await User.deleteMany({});
  });

  beforeEach(async () => {
    // Create test user and token
    const password = "OldPassword123!";
    user = await User.create({
      email: "test@example.com",
      password: await hashPassword(password),
    });
    token = generateToken({ _id: user._id.toString() }, "1h");
  });

  it("should not accept empty body", async () => {
    const res = await request(app)
      .post("/user/auth/change-password")
      .set("Authorization", `Bearer ${token}`)
      .send({});
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  it("should require oldPassword", async () => {
    const res = await request(app)
      .post("/user/auth/change-password")
      .set("Authorization", `Bearer ${token}`)
      .send({ data: { newPassword: "NewPassword123!" } });
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  it("should require newPassword", async () => {
    const res = await request(app)
      .post("/user/auth/change-password")
      .set("Authorization", `Bearer ${token}`)
      .send({ data: { oldPassword: "OldPassword123!" } });
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  it("should validate newPassword format", async () => {
    const res = await request(app)
      .post("/user/auth/change-password")
      .set("Authorization", `Bearer ${token}`)
      .send({ data: { oldPassword: "OldPassword123!", newPassword: "short" } });
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  it("should return error if oldPassword is incorrect", async () => {
    const res = await request(app)
      .post("/user/auth/change-password")
      .set("Authorization", `Bearer ${token}`)
      .send({
        data: { oldPassword: "WrongPass123!", newPassword: "NewPassword123!" },
      });
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  it("should return error if newPassword is same as oldPassword", async () => {
    const res = await request(app)
      .post("/user/auth/change-password")
      .set("Authorization", `Bearer ${token}`)
      .send({
        data: {
          oldPassword: "OldPassword123!",
          newPassword: "OldPassword123!",
        },
      });
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  it("should change password successfully", async () => {
    const res = await request(app)
      .post("/user/auth/change-password")
      .set("Authorization", `Bearer ${token}`)
      .send({
        data: {
          oldPassword: "OldPassword123!",
          newPassword: "NewPassword123!",
        },
      });
    expect(res.statusCode).toBeGreaterThanOrEqual(200);
    expect(res.statusCode).toBeLessThan(300);

    const updatedUser = await User.findById(user._id);
    const match = await isPasswordCorrect(
      "NewPassword123!",
      updatedUser.password
    );
    expect(match).toBe(true);
  });
});
