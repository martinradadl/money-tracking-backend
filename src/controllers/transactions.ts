import { RequestHandler } from "express";

import * as transactionModel from "../models/transaction";

export const getAll: RequestHandler = async (req, res) => {
  try {
    const transactions = await transactionModel.Transaction.find({
      userId: req.body.userId,
    });
    return res.json(transactions);
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(err.message);
    }
  }
};

export const create: RequestHandler = async (req, res) => {
  const newTransaction = new transactionModel.Transaction({
    type: req.body.type,
    concept: req.body.concept,
    amount: req.body.amount,
    category: req.body.category,
    userId: req.body.userId,
  });
  try {
    const createdTransaction = await newTransaction.save();
    return res.json(createdTransaction);
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(err.message);
    }
  }
};

export const edit: RequestHandler<{ id: string }> = async (req, res) => {
  try {
    const transaction = await transactionModel.Transaction.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    return res.json(transaction);
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(err.message);
    }
  }
};

export const deleteMany: RequestHandler = async (req, res) => {
  try {
    let deletedTransaction = null;
    for (const id of req.body.ids) {
      deletedTransaction = await transactionModel.Transaction.findByIdAndDelete(
        id
      );
    }
    return res.json(deletedTransaction);
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(err.message);
    }
  }
};
