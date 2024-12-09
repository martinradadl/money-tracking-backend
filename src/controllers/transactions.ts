import { Request, Response } from "express";
import * as transactionModel from "../models/transaction";
import { ObjectId } from "../mongo-setup";

export const getAll = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query?.page as string) || 1;
    const limit = parseInt(req.query?.limit as string) || 0;
    const transactions = await transactionModel.Transaction.find({
      userId: req.params.userId,
    })
      .limit(limit)
      .skip((page - 1) * limit)
      .populate("category");

    return res.status(200).json(transactions);
  } catch (err: unknown) {
    console.log(err);
    if (err instanceof Error) {
      return res.status(500).json({ message: err.message });
    }
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const newTransaction = await transactionModel.Transaction.create({
      type: req.body.type,
      concept: req.body.concept,
      amount: req.body.amount,
      category: req.body.category,
      userId: req.body.userId,
    });
    const populatedTransaction = await newTransaction.populate("category");
    return res.status(200).json(populatedTransaction);
  } catch (err: unknown) {
    if (err instanceof Error) {
      return res.status(500).json({ message: err.message });
    }
  }
};

export const edit = async (req: Request, res: Response) => {
  try {
    const transaction = await transactionModel.Transaction.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    const populatedTransaction = await transaction?.populate("category");
    return res.status(200).json(populatedTransaction);
  } catch (err: unknown) {
    if (err instanceof Error) {
      return res.status(500).json({ message: err.message });
    }
  }
};

export const deleteOne = async (req: Request, res: Response) => {
  try {
    const deletedTransaction =
      await transactionModel.Transaction.findByIdAndDelete(req.params.id);
    return res.status(200).json(deletedTransaction);
  } catch (err: unknown) {
    if (err instanceof Error) {
      return res.status(500).json({ message: err.message });
    }
  }
};

const calculateSumByTpe = async (userId: string, isIncome: boolean) => {
  try {
    const transactionsAgg = await transactionModel.Transaction.aggregate([
      {
        $match: {
          userId: new ObjectId(userId),
        },
      },
      {
        $group: {
          _id: null,
          sum: {
            $sum: {
              $cond: [
                { $eq: ["$type", isIncome ? "income" : "expenses"] },
                "$amount",
                0,
              ],
            },
          },
        },
      },
    ]);
    const sum = transactionsAgg[0]?.sum || 0;
    return sum;
  } catch (err: unknown) {
    if (err instanceof Error) {
      return err;
    }
  }
};

export const getTotalIncome = async (req: Request, res: Response) => {
  try {
    const balance = await calculateSumByTpe(req.params.userId, true);
    if (balance instanceof Error) {
      throw balance;
    }
    return res.status(200).json(balance);
  } catch (err: unknown) {
    if (err instanceof Error) {
      return res.status(500).json({ message: err.message });
    }
  }
};

export const getTotalExpenses = async (req: Request, res: Response) => {
  try {
    const balance = await calculateSumByTpe(req.params.userId, false);
    if (balance instanceof Error) {
      throw balance;
    }
    return res.status(200).json(balance);
  } catch (err: unknown) {
    if (err instanceof Error) {
      return res.status(500).json({ message: err.message });
    }
  }
};

export const calculateBalance = async (userId: string) => {
  try {
    const transactionsAgg = await transactionModel.Transaction.aggregate([
      {
        $match: {
          userId: new ObjectId(userId),
        },
      },
      {
        $group: {
          _id: null,
          balance: {
            $sum: {
              $cond: [
                { $eq: ["$type", "income"] },
                "$amount",
                { $multiply: ["$amount", -1] },
              ],
            },
          },
        },
      },
    ]);
    const balance = transactionsAgg[0]?.balance || 0;
    return balance;
  } catch (err: unknown) {
    if (err instanceof Error) {
      return err;
    }
  }
};

export const getBalance = async (req: Request, res: Response) => {
  try {
    const balance = await calculateBalance(req.params.userId);
    if (balance instanceof Error) {
      throw balance;
    }
    return res.status(200).json(balance);
  } catch (err: unknown) {
    if (err instanceof Error) {
      return res.status(500).json({ message: err.message });
    }
  }
};
