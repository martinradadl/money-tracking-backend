import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { afterEach, describe, expect, it, vi } from "vitest";
import { jwtSecret, tokenVerification } from "../middleware/authentication";
import {
  deleteUser,
  edit,
  login,
  maxAge,
  register,
} from "../controllers/authentication";
import { User } from "../models/user";
import { initializeReqResMocks, mockedCatchError } from "./utils";

vi.mock("../models/user");
vi.mock("bcryptjs");

const fakePassword = "fakePassword";
const fakeUser = {
  _id: "fakeId",
  name: "fakeName",
  email: "fakeEmail",
  password: fakePassword,
};
const fakeToken = jwt.sign(
  { id: fakeUser._id, email: fakeUser.email },
  jwtSecret,
  {
    expiresIn: maxAge,
  }
);

describe("Authentication Middleware", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const mockedNext = vi.fn().mockImplementation(() => {});

  it("should tokenVerification return 401 if token nullish", async () => {
    const { req, res } = initializeReqResMocks();
    tokenVerification(req, res, mockedNext);
    expect(res.statusCode).toBe(401);
  });

  it("should tokenVerification return 401 if token not nullish", async () => {
    const { req, res } = initializeReqResMocks();
    req.cookies.jwt = "otherToken";
    tokenVerification(req, res, mockedNext);
    expect(res.statusCode).toBe(401);
    expect(mockedNext).not.toHaveBeenCalled();
  });

  it("should tokenVerification invoke next if token is verified", () => {
    const { req, res } = initializeReqResMocks();
    req.cookies.jwt = fakeToken;
    tokenVerification(req, res, mockedNext);
    expect(mockedNext).toHaveBeenCalled();
  });
});

describe("Authentication and User Controllers", () => {
  describe("Create User Controller", async () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("should return 500 when and error is throwed", async () => {
      const { req, res } = initializeReqResMocks();
      req.body = { ...fakeUser };
      vi.mocked(User.create, true).mockImplementation(() => {
        throw mockedCatchError;
      });
      await register(req, res);
      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ message: mockedCatchError.message });
    });

    it("should return 400 when password is less than 6 characters ", async () => {
      const { req, res } = initializeReqResMocks();
      req.body = { ...fakeUser, password: "12345" };
      await register(req, res);
      expect(res.statusCode).toBe(400);
      expect(res._getJSONData()).toEqual({
        message: "Password must have more than 6 characters",
      });
    });

    it("should return created user and statusCode 200", async () => {
      const { req, res } = initializeReqResMocks();
      req.body = fakeUser;
      //@ts-expect-error mocking User.create has an issue with returning types for now we need to leave it as is
      vi.mocked(User.create, true).mockResolvedValue(fakeUser);
      await register(req, res);
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual({
        message: "User successfully created",
        user: fakeUser,
      });
    });
  });

  describe("Login User Controller", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("should return 500 when and error is throwed", async () => {
      vi.mocked(User.findOne, true).mockImplementation(() => {
        throw mockedCatchError;
      });
      const { req, res } = initializeReqResMocks();
      req.body = { ...fakeUser };
      await login(req, res);
      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ message: mockedCatchError.message });
    });

    it("should return 400 when email or password is not present", async () => {
      const { req, res } = initializeReqResMocks();
      req.body = {};
      await login(req, res);
      expect(res.statusCode).toBe(400);
      expect(res._getJSONData()).toEqual({
        message: "Email or Password not present",
      });
    });

    it("should return 401 when user is not found", async () => {
      const { req, res } = initializeReqResMocks();
      req.body = { email: "noEmail", password: "noPassword" };
      vi.mocked(User.findOne, true).mockResolvedValue(null);
      await login(req, res);
      expect(res.statusCode).toBe(401);
      expect(res._getJSONData()).toEqual({
        message: "Login not successful",
        error: "User not found",
      });
    });

    it("should return 400 when login is unsuccessful", async () => {
      vi.mocked(bcrypt, true).compare.mockImplementation(() =>
        Promise.resolve(false)
      );
      vi.mocked(User.findOne, true).mockResolvedValue(fakeUser);
      const { req, res } = initializeReqResMocks();
      req.body = { email: fakeUser.email, password: fakePassword };
      await login(req, res);
      expect(res.statusCode).toBe(400);
      expect(res._getJSONData()).toEqual({ message: "Login not successful" });
    });

    it("should return 200 when login is successful", async () => {
      vi.mocked(bcrypt, true).compare.mockImplementation(() =>
        Promise.resolve(true)
      );
      vi.mocked(User.findOne, true).mockResolvedValue(fakeUser);
      const { req, res } = initializeReqResMocks();
      req.body = { email: fakeUser.email, password: fakePassword };
      await login(req, res);
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual({
        message: "Login successful",
        user: fakeUser,
      });
    });
  });

  describe("Edit User Controller", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("should return 500 when error is throwed", async () => {
      vi.mocked(User.findByIdAndUpdate, true).mockImplementation(() => {
        throw mockedCatchError;
      });
      const { req, res } = initializeReqResMocks();
      req.body = { email: fakeUser.email, password: fakePassword };
      await edit(req, res);
      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ message: mockedCatchError.message });
    });

    it("should not find userId", async () => {
      const { req, res } = initializeReqResMocks();
      req.body = { email: fakeUser.email, password: fakePassword };
      vi.mocked(User.findByIdAndUpdate, true).mockResolvedValue(null);
      await edit(req, res);
      expect(res.statusCode).toBe(401);
      expect(res._getJSONData()).toEqual({
        message: "Edit not successful",
        error: "User not found",
      });
    });
    it("Should update User", async () => {
      vi.mocked(User.findByIdAndUpdate, true).mockResolvedValue(fakeUser);
      const { req, res } = initializeReqResMocks();
      req.body = { email: fakeUser.email, password: fakePassword };
      await edit(req, res);
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(fakeUser);
    });
  });

  describe("Delete User Controller", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("should return 500 when error is throwed", async () => {
      vi.mocked(User.findByIdAndDelete, true).mockImplementation(() => {
        throw mockedCatchError;
      });
      const { req, res } = initializeReqResMocks();
      await deleteUser(req, res);
      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ message: mockedCatchError.message });
    });

    it("should not find userId", async () => {
      const { req, res } = initializeReqResMocks();
      await deleteUser(req, res);
      vi.mocked(User.findByIdAndDelete, true).mockResolvedValue(null);
      expect(res.statusCode).toBe(401);
      expect(res._getJSONData()).toEqual({
        message: "Delete not successful",
        error: "User not found",
      });
    });
    it("Should delete User", async () => {
      vi.mocked(User.findByIdAndDelete, true).mockResolvedValue(fakeUser);
      const { req, res } = initializeReqResMocks();
      await deleteUser(req, res);
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(fakeUser);
    });
  });
});