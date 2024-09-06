import { RequestHandler } from "express";

import * as transactionModel from "../models/transaction";
import * as categoryModel from "../models/category";

export const getAll: RequestHandler = async (_, res) => {
  try {
    const transactions = await transactionModel.Transaction.find({
      // userId: req.params.userId,
    }).populate("category");
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
    createdTransaction.populate("category");
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
    ).populate("category");
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

export const getCategories: RequestHandler = async (_, res) => {
  try {
    const categories = await categoryModel.Category.find({});
    return res.json(categories);
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(err.message);
    }
  }
};
