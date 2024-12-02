import { Request, Response } from "express";
import * as debtModel from "../models/debt";
import { ObjectId } from "../mongo-setup";

export const getAll = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query?.page as string) || 1;
    const limit = parseInt(req.query?.limit as string) || 0;

    const debts = await debtModel.Debt.find({
      userId: req.params.userId,
    })
      .limit(limit).skip((page - 1) * limit)
      .populate("category");
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
      entity: req.body.entity,
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
    if (!debt) {
      return res.status(404).json({
        message: "Edit not successful",
        error: "Debt not found",
      });
    }
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
    if (!deletedDebt) {
      return res.status(404).json({
        message: "Delete not successful",
        error: "Debt not found",
      });
    }
    return res.status(200).json(deletedDebt);
  } catch (err: unknown) {
    if (err instanceof Error) {
      return res.status(500).json({ message: err.message });
    }
  }
};

export const getBalance = async (req: Request, res: Response) => {
  try {
    const debtsAgg = await debtModel.Debt.aggregate([
      {
        $match: {
          userId: new ObjectId(req.params.userId),
        },
      },
      {
        $group: {
          _id: null,
          balance: {
            $sum: {
              $cond: [
                { $eq: ["$type", "loan"] },
                "$amount",
                { $multiply: ["$amount", -1] },
              ],
            },
          },
        },
      },
    ]);
    const balance = debtsAgg[0]?.balance || 0;
    return res.status(200).json(balance);
  } catch (err: unknown) {
    if (err instanceof Error) {
      return res.status(500).json({ message: err.message });
    }
  }
};
