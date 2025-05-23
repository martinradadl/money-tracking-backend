import jwt from "jsonwebtoken";
import * as nodemailer from "nodemailer";
import bcrypt from "bcryptjs";
import { afterEach, describe, expect, it, vi } from "vitest";
import { tokenVerification } from "../middleware/authentication";
import {
  changePassword,
  checkPassword,
  deleteUser,
  edit,
  forgotPassword,
  getCurrencies,
  getTimeZones,
  login,
  register,
  resetPassword,
} from "../controllers/authentication";
import { User } from "../models/user";
import {
  fakeFile,
  fakePassword,
  fakeToken,
  fakeUser,
  newFakePassword,
} from "./fake-data/authentication";
import { initializeReqResMocks, mockedCatchError } from "./utils";
import { Transaction } from "../models/transaction";
import { Debt } from "../models/debt";
import { currencies } from "../data/currencies";
import { timezones } from "../data/timezones";
import fs from "fs";

vi.mock("../models/user");
vi.mock("../models/transaction");
vi.mock("../models/debt");
vi.mock("bcryptjs");
vi.mock("jsonwebtoken");
vi.mock("nodemailer");
vi.mock("fs");

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
    vi.mocked(jwt, true).verify.mockImplementation(() => mockedNext());
    req.headers.authorization = `Bearer ${fakeToken}`;
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
      //@ts-expect-error fake token value passed
      vi.mocked(jwt, true).sign.mockReturnValue(fakeToken);
      await register(req, res);
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual({
        message: "User successfully created",
        user: fakeUser,
        token: fakeToken,
        expiration: expect.any(Number),
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
      //@ts-expect-error fake token value passed
      vi.mocked(jwt, true).sign.mockReturnValue(fakeToken);
      const { req, res } = initializeReqResMocks();
      req.body = { email: fakeUser.email, password: fakePassword };
      await login(req, res);
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual({
        message: "Login successful",
        user: fakeUser,
        token: fakeToken,
        expiration: expect.any(Number),
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

    it("Should update User by adding a profile pic", async () => {
      const updatedUser = { ...fakeUser, profilePic: "newProfilePic" };
      vi.mocked(User.findByIdAndUpdate, true).mockResolvedValue(updatedUser);
      const { req, res } = initializeReqResMocks();
      req.file = fakeFile;
      await edit(req, res);
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(updatedUser);
    });

    it("Should update User by removing the profile pic", async () => {
      const updatedUser = { ...fakeUser, profilePic: undefined };
      vi.mocked(User.findByIdAndUpdate, true).mockResolvedValue(updatedUser);
      vi.mocked(fs, true).unlink.mockImplementation((_, cb) => cb(null));
      const { req, res } = initializeReqResMocks();
      req.body = { profilePic: "" };
      await edit(req, res);
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(updatedUser);
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
      vi.mocked(Transaction.deleteMany, true).mockImplementation(() =>
        //@ts-expect-error mocking delete transactions from deleted user
        Promise.resolve()
      );
      vi.mocked(Debt.deleteMany, true).mockImplementation(() =>
        //@ts-expect-error mocking delete transactions from deleted user
        Promise.resolve()
      );
      const { req, res } = initializeReqResMocks();
      await deleteUser(req, res);
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(fakeUser);
    });
  });

  describe("Change Password Controller", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("should return 500 when error is throwed", async () => {
      vi.mocked(User.findByIdAndUpdate, true).mockImplementation(() => {
        throw mockedCatchError;
      });
      const { req, res } = initializeReqResMocks();
      req.headers.newpassword = newFakePassword;
      await changePassword(req, res);
      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ message: mockedCatchError.message });
    });

    it("should not find userId", async () => {
      vi.mocked(User.findByIdAndUpdate, true).mockResolvedValue(null);
      const { req, res } = initializeReqResMocks();
      req.headers.newpassword = newFakePassword;
      await changePassword(req, res);
      expect(res.statusCode).toBe(401);
      expect(res._getJSONData()).toEqual({
        message: "Edit not successful",
        error: "User not found",
      });
    });
    it("Should update password", async () => {
      vi.mocked(User.findByIdAndUpdate, true).mockResolvedValue(fakeUser);
      const { req, res } = initializeReqResMocks();
      req.headers.newpassword = newFakePassword;
      await changePassword(req, res);
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(fakeUser);
    });
  });

  describe("Check Password Controller", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("should return 500 when error is throwed", async () => {
      vi.mocked(User.findById, true).mockImplementation(() => {
        throw mockedCatchError;
      });
      const { req, res } = initializeReqResMocks();
      req.params.id = fakeUser._id;
      await checkPassword(req, res);
      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ message: mockedCatchError.message });
    });

    it("should not find user", async () => {
      vi.mocked(User.findById, true).mockResolvedValue(null);
      const { req, res } = initializeReqResMocks();
      req.params.id = fakeUser._id;
      await checkPassword(req, res);
      expect(res.statusCode).toBe(401);
      expect(res._getJSONData()).toEqual({
        message: "Could not check password",
        error: "User not found",
      });
    });
    it("Should return true", async () => {
      vi.mocked(User.findById, true).mockResolvedValue(fakeUser);
      vi.mocked(bcrypt, true).compare.mockImplementation(() =>
        Promise.resolve(true)
      );
      const { req, res } = initializeReqResMocks();
      req.params.id = fakeUser._id;
      req.headers.password = fakePassword;
      await checkPassword(req, res);
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toBeTruthy();
    });
  });

  describe("Forgot Password Controller", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    const mockedSendEmail = vi.fn();

    it("should return 500 when error is throwed", async () => {
      vi.mocked(User.findOne, true).mockImplementation(() => {
        throw mockedCatchError;
      });
      const { req, res } = initializeReqResMocks();
      await forgotPassword(req, res);
      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ message: mockedCatchError.message });
    });

    it("should not find user", async () => {
      vi.mocked(User.findOne, true).mockResolvedValue(null);
      const { req, res } = initializeReqResMocks();
      req.params.email = fakeUser.email;
      await forgotPassword(req, res);
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual({
        message: `Email has been sent to ${fakeUser.email}`,
      });
    });

    it("Should send email to user with reset password link", async () => {
      vi.mocked(User.findOne, true).mockResolvedValue(fakeUser);
      const { req, res } = initializeReqResMocks();
      req.params.email = fakeUser.email;
      //@ts-expect-error types of mock doesn't match with real function
      vi.mocked(jwt, true).sign.mockReturnValue(fakeToken);
      //@ts-expect-error types of mock doesn't match with real function
      vi.mocked(nodemailer, true).createTransport.mockImplementationOnce(() => {
        return { sendMail: mockedSendEmail };
      });
      await forgotPassword(req, res);
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual({
        message: `Email has been sent to ${fakeUser.email}`,
      });
    });
  });

  describe("Reset Password Controller", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("should return 500 when error is throwed", async () => {
      vi.mocked(User.findByIdAndUpdate, true).mockImplementation(() => {
        throw mockedCatchError;
      });
      const { req, res } = initializeReqResMocks();
      req.headers.newpassword = newFakePassword;
      await resetPassword(req, res);
      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ message: mockedCatchError.message });
    });

    it("should not find user", async () => {
      vi.mocked(User.findByIdAndUpdate, true).mockResolvedValue(null);
      const { req, res } = initializeReqResMocks();
      req.headers.newpassword = newFakePassword;
      await resetPassword(req, res);
      expect(res.statusCode).toBe(401);
      expect(res._getJSONData()).toEqual({
        message: "Password change not successful",
        error: "User not found",
      });
    });

    it("Should reset password", async () => {
      vi.mocked(User.findByIdAndUpdate, true).mockResolvedValue(fakeUser);
      const { req, res } = initializeReqResMocks();
      req.headers.newpassword = newFakePassword;
      await resetPassword(req, res);
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(fakeUser);
    });
  });

  describe("Get Currencies Controller", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("Should Get Currencies", async () => {
      const { req, res } = initializeReqResMocks();
      getCurrencies(req, res);
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(currencies);
    });
  });

  describe("Get Time Zones Controller", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("Should Get Time Zones", async () => {
      const { req, res } = initializeReqResMocks();
      getTimeZones(req, res);
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toStrictEqual(timezones);
    });
  });
});
