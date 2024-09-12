import { RequestHandler } from "express";
import * as userModel from "../models/user";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const jwtSecret = "s5r2hb46d62dhe828393jdsy3";

export const register: RequestHandler = async (req, res) => {
  const { name, email, password } = req.body;
  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must have more than 6 characters" });
  }
  try {
    bcrypt.hash(password, 10).then(async (hash: string) => {
      await userModel.User.create({
        name,
        email,
        password: hash,
      }).then((user) => {
        const maxAge = 3 * 60 * 60;
        const token = jwt.sign({ id: user._id, email }, jwtSecret, {
          expiresIn: maxAge, // 3hrs in sec
        });
        res.cookie("jwt", token, {
          httpOnly: true,
          maxAge: maxAge * 1000, // 3hrs in ms
        });

        res.status(200).json({
          message: "User successfully created",
          user,
        });
      });
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(err.message);
    }
  }
};

export const login: RequestHandler = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Email or Password not present",
    });
  }
  try {
    const user = await userModel.User.findOne({ email, password });
    if (!user) {
      res.status(401).json({
        message: "Login not successful",
        error: "User not found",
      });
    } else {
      if (user.password && (await bcrypt.compare(password, user.password))) {
        const maxAge = 3 * 60 * 60;
        const token = jwt.sign({ id: user._id, email }, jwtSecret, {
          expiresIn: maxAge, // 3hrs in sec
        });
        res.cookie("jwt", token, {
          httpOnly: true,
          maxAge: maxAge * 1000, // 3hrs in ms
        });
        res.status(200).json({
          message: "Login successful",
          user,
        });
      } else {
        res.status(400).json({ message: "Login not succesful" });
      }
    }
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(err.message);
    }
  }
};

export const edit: RequestHandler = async (req, res) => {
  try {
    const user = await userModel.User.findByIdAndUpdate(
      req.params.id,
      { $set: { password: req.body } },
      { new: true }
    );
    return res.json(user);
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(err.message);
    }
  }
};

export const deleteUser: RequestHandler = async (req, res) => {
  try {
    const deletedUser = await userModel.User.findByIdAndDelete(req.params.id);
    return res.json(deletedUser);
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(err.message);
    }
  }
};
