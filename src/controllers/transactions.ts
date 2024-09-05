import { RequestHandler } from "express";

import * as transactionModel from "../models/transaction";

export const getAll: RequestHandler = async (_, res) => {
  try {
    const transactions = await transactionModel.Transaction.find({
      // userId: req.params.userId,
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
    // userId: req.body.userId,
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

export const deleteOne: RequestHandler = async (req, res) => {
  try {
    const deletedTransaction =
      await transactionModel.Transaction.findByIdAndDelete(req.params.id);
    return res.json(deletedTransaction);
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(err.message);
    }
  }
};
