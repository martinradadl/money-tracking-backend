import { Request, Response } from "express";
import * as userModel from "../models/user";
import * as transactionModel from "../models/transaction";
import * as debtModel from "../models/debt";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { currencies } from "../data";

const jwtSecret = "s5r2hb46d62dhe828393jdsy3";
export const maxAge = 3 * 60 * 60; // 3hrs in sec

export const register = async (req: Request, res: Response) => {
  const { name, email, password, currency } = req.body;
  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must have more than 6 characters" });
  }
  try {
    const hash = await bcrypt.hash(password, 10);
    const user = await userModel.User.create({
      name,
      email,
      password: hash,
      currency,
    });
    const token = jwt.sign({ id: user._id, email }, jwtSecret, {
      expiresIn: maxAge,
    });

    return res.status(200).json({
      message: "User successfully created",
      user,
      token,
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      return res.status(500).json({ message: err.message });
    }
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Email or Password not present",
    });
  }
  try {
    const user = await userModel.User.findOne({ email });
    if (!user) {
      res.status(401).json({
        message: "Login not successful",
        error: "User not found",
      });
    } else {
      if (user.password && (await bcrypt.compare(password, user.password))) {
        const token = jwt.sign({ id: user._id, email }, jwtSecret, {
          expiresIn: maxAge, // 3hrs in sec
        });
        res.status(200).json({
          message: "Login successful",
          user,
          token,
        });
      } else {
        res.status(400).json({ message: "Login not successful" });
      }
    }
  } catch (err: unknown) {
    if (err instanceof Error) {
      return res.status(500).json({ message: err.message });
    }
  }
};

export const edit = async (req: Request, res: Response) => {
  try {
    const user = await userModel.User.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!user) {
      return res.status(401).json({
        message: "Edit not successful",
        error: "User not found",
      });
    }
    return res.status(200).json(user);
  } catch (err: unknown) {
    if (err instanceof Error) {
      return res.status(500).json({ message: err.message });
    }
  }
};

export const changePassword = async (req: Request, res: Response) => {
  const newPassword = req.headers.newpassword?.toString();
  if (newPassword && newPassword.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must have more than 6 characters" });
  }
  try {
    if (newPassword) {
      const hash = await bcrypt.hash(newPassword, 10);
      const user = await userModel.User.findByIdAndUpdate(
        req.params.id,
        { $set: { password: hash } },
        { new: true }
      );
      if (!user) {
        return res.status(401).json({
          message: "Edit not successful",
          error: "User not found",
        });
      }
      return res.status(200).json(user);
    }
  } catch (err: unknown) {
    if (err instanceof Error) {
      return res.status(500).json({ message: err.message });
    }
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const deletedUser = await userModel.User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(401).json({
        message: "Delete not successful",
        error: "User not found",
      });
    }
    await transactionModel.Transaction.deleteMany({ userId: req.params.id });
    await debtModel.Debt.deleteMany({ userId: req.params.id });
    return res.status(200).json(deletedUser);
  } catch (err: unknown) {
    if (err instanceof Error) {
      return res.status(500).json({ message: err.message });
    }
  }
};

export const checkPassword = async (req: Request, res: Response) => {
  const password = req.headers.password?.toString();
  try {
    const user = await userModel.User.findById(req.params.id);
    if (!user) {
      res.status(401).json({
        message: "Could not check password",
        error: "User not found",
      });
    } else {
      const isCorrectPassword =
        user.password &&
        password &&
        (await bcrypt.compare(password, user.password));
      return res.status(200).json(isCorrectPassword);
    }
  } catch (err: unknown) {
    if (err instanceof Error) {
      return res.status(500).json({ message: err.message });
    }
  }
};

export const getCurrencies = (_: Request, res: Response) => {
  return res.json(currencies);
};
