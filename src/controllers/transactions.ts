import { RequestHandler } from "express";

const transactionModel = require("../models/transaction");
// import transactionModel from "../models/transaction";

export const getAll: RequestHandler<{}> = async (req, res) => {
  try {
    const transactions = await transactionModel.Transaction.find({
      userId: req.body.userId,
    });
    return res.json(transactions);
  } catch (err: any) {
    console.log(err);
    res.status(500).send(err.message);
  }
};

export const create: RequestHandler<{}> = async (req, res) => {
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
  } catch (err: any) {
    console.log(err.message);
    return res.send("Transaction not created");
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
  } catch (err: any) {
    res.status(500).send(err.message);
  }
};

export const deleteMany: RequestHandler<{}> = async (req, res) => {
  try {
    let deletedTransaction = null;
    for (const id of req.body.ids) {
      deletedTransaction = await transactionModel.Transaction.findByIdAndDelete(
        id
      );
    }
    return res.json(deletedTransaction);
  } catch (err: any) {
    res.status(500).send(err.message);
  }
};
