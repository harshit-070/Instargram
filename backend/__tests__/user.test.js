const app = require("../utils/createServer")();
const supertest = require("supertest");
const mocks = require("./Mock");
const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");
const { update } = require("../models/userModel");

describe("User", () => {
  beforeAll(async () => {
    const mongoServer = await MongoMemoryServer.create();

    await mongoose.connect(mongoServer.getUri());
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoose.connection.close();
  });

  describe("Creating User", () => {
    it("should create a user", async () => {
      const response = await supertest(app)
        .post("/api/v1/signup")
        .send(mocks.user);
      mocks.user.hashPassword = response.body.user.password;
      mocks.user._id = response.body.user._id;
      expect(response.body).toEqual({
        success: true,
        user: {
          name: mocks.user.name,
          email: mocks.user.email,
          username: mocks.user.username,
          password: expect.any(String),
          bio: "Hi👋 Welcome To My Profile",
          posts: [],
          saved: [],
          followers: [],
          following: [],
          _id: expect.any(String),
          __v: 0,
        },
      });

      // Creating a seocnd user
      const createUserResponse = await supertest(app)
        .post("/api/v1/signup")
        .send(mocks.secondUser);

      expect(createUserResponse.status).toBe(201);
    });

    it("should not create user as username is repeated", async () => {
      const response = await supertest(app)
        .post("/api/v1/signup")
        .send(mocks.user);
      expect(response.body).toEqual({
        success: false,
        message: "Username already exists",
      });
      expect(response.status).toBe(401);
    });

    it("should not create user as email is repeated", async () => {
      const response = await supertest(app)
        .post("/api/v1/signup")
        .send({ ...mocks.user, username: "different" });
      expect(response.body).toEqual({
        success: false,
        message: "Email already exists",
      });
      expect(response.status).toBe(401);
    });
  });

  describe("Login User", () => {
    it("should login user with email ", async () => {
      const response = await supertest(app)
        .post("/api/v1/login")
        .send({ userId: mocks.user.email, password: mocks.user.password });

      const token = response.header["set-cookie"][0]
        .split(";")[0]
        .split("=")[1];

      mocks.user.token = token;

      expect(response.body).toEqual({
        success: true,
        user: {
          name: mocks.user.name,
          email: mocks.user.email,
          username: mocks.user.username,
          password: mocks.user.hashPassword,
          bio: "Hi👋 Welcome To My Profile",
          posts: [],
          saved: [],
          followers: [],
          following: [],
          _id: expect.any(String),
          __v: 0,
        },
      });

      expect(response.status).toBe(201);
    });

    it("should login user with username ", async () => {
      const response = await supertest(app)
        .post("/api/v1/login")
        .send({ userId: mocks.user.username, password: mocks.user.password });
      expect(response.body).toEqual({
        success: true,
        user: {
          name: mocks.user.name,
          email: mocks.user.email,
          username: mocks.user.username,
          password: mocks.user.hashPassword,
          bio: "Hi👋 Welcome To My Profile",
          posts: [],
          saved: [],
          followers: [],
          following: [],
          _id: expect.any(String),
          __v: 0,
        },
      });

      expect(response.status).toBe(201);
    });

    it("should not login the user as email is incorrect", async () => {
      const response = await supertest(app)
        .post("/api/v1/login")
        .send({ userId: "wrong@email.com", password: mocks.user.password });
      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        success: false,
        message: "User doesn't exist",
      });
    });

    it("should not login the user as username is incorrect", async () => {
      const response = await supertest(app)
        .post("/api/v1/login")
        .send({ userId: "username123", password: mocks.user.password });
      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        success: false,
        message: "User doesn't exist",
      });
    });

    it("should not login the user as password is incorrect", async () => {
      const response = await supertest(app)
        .post("/api/v1/login")
        .send({ userId: mocks.user.email, password: "wrong password" });
      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        success: false,
        message: "Password doesn't match",
      });
    });
  });

  describe("Update user", () => {
    it("should update a user", async () => {
      const updateUser = {
        name: "Updated Name",
        username: "Updated Username",
        email: "Email@gmail.com",
      };

      const response = await supertest(app)
        .put("/api/v1/update/profile")
        .set("Cookie", [`token=${mocks.user.token}`])
        .send(updateUser);

      expect(response.body).toEqual({
        success: true,
      });
      expect(response.status).toBe(200);

      const ReUpdatedresponse = await supertest(app)
        .put("/api/v1/update/profile")
        .set("Cookie", [`token=${mocks.user.token}`])
        .send(mocks.user);
      expect(ReUpdatedresponse.body).toEqual({
        success: true,
      });
      expect(ReUpdatedresponse.status).toBe(200);
    });

    it("should not update a user as token is not send", async () => {
      const updateUser = {
        name: "Updated Name",
        username: "Updated Username",
        email: "Email@gmail.com",
      };

      const response = await supertest(app)
        .put("/api/v1/update/profile")
        .send(updateUser);
      expect(response.body).toEqual({
        success: false,
        message: "Please Login to Access",
      });
      expect(response.status).toBe(401);
    });

    it("should not update a user as other user already exist with username", async () => {
      const updateUserResponse = await supertest(app)
        .put("/api/v1/update/profile")
        .set("Cookie", [`token=${mocks.user.token}`])
        .send({ username: mocks.secondUser.username, name: "New Name" });

      expect(updateUserResponse.status).toBe(404);
      expect(updateUserResponse.body).toEqual({
        success: false,
        message: "User Already Exists",
      });
    });

    it("should not update a user as other user already exist with email", async () => {
      const updateUserResponse = await supertest(app)
        .put("/api/v1/update/profile")
        .set("Cookie", [`token=${mocks.user.token}`])
        .send({ email: mocks.secondUser.email, name: "New Name" });

      expect(updateUserResponse.status).toBe(404);
      expect(updateUserResponse.body).toEqual({
        success: false,
        message: "User Already Exists",
      });
    });
  });

  describe("Get account details", () => {
    it("should get the account detail", async () => {
      const response = await supertest(app)
        .get("/api/v1/me")
        .set("Cookie", [`token=${mocks.user.token}`]);
      expect(response.body).toEqual({
        success: true,
        user: {
          name: mocks.user.name,
          email: mocks.user.email,
          username: mocks.user.username,
          bio: "Hi👋 Welcome To My Profile",
          posts: [],
          saved: [],
          followers: [],
          following: [],
          _id: expect.any(String),
          __v: 0,
        },
      });
    });

    it("should get the 401 for not sending token ", async () => {
      const response = await supertest(app).get("/api/v1/me");
      expect(response.status).toBe(401);
    });

    it("should get the 500 for sending invalid jwt token ", async () => {
      const response = await supertest(app)
        .get("/api/v1/me")
        .set("Cookie", [`token={mocks.user.token}`]);

      expect(response.status).toBe(500);
    });
  });
});
