import { Request, Response } from "express";
import * as debtModel from "../models/debt";

export const getAll = async (req: Request, res: Response) => {
  try {
    const debts = await debtModel.Debt.find({
      userId: req.params.userId,
    }).populate("category");
    return res.status(200).json(debts);
  } catch (err: unknown) {
    console.log(err);
    if (err instanceof Error) {
      return res.status(500).json({ message: err.message });
    }
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const newDebt = await debtModel.Debt.create({
      type: req.body.type,
      beneficiary: req.body.beneficiary,
      concept: req.body.concept,
      amount: req.body.amount,
      category: req.body.category,
      userId: req.body.userId,
    });
    const populatedDebt = await newDebt.populate("category");
    return res.status(200).json(populatedDebt);
  } catch (err: unknown) {
    if (err instanceof Error) {
      return res.status(500).json({ message: err.message });
    }
  }
};

export const edit = async (req: Request, res: Response) => {
  try {
    const debt = await debtModel.Debt.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    const populatedDebt = await debt?.populate("category");
    return res.status(200).json(populatedDebt);
  } catch (err: unknown) {
    if (err instanceof Error) {
      return res.status(500).json({ message: err.message });
    }
  }
};

export const deleteOne = async (req: Request, res: Response) => {
  try {
    const deletedDebt = await debtModel.Debt.findByIdAndDelete(req.params.id);
    return res.status(200).json(deletedDebt);
  } catch (err: unknown) {
    if (err instanceof Error) {
      return res.status(500).json({ message: err.message });
    }
  }
};
