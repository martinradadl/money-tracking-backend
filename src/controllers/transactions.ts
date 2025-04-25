import { Request, Response } from "express";
import * as transactionModel from "../models/transaction";
import { getSumByFilter } from "../helpers/transactions";
import { getStartAndEndDates } from "../helpers/movements";

export const getAll = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query?.page as string) || 1;
    const limit = parseInt(req.query?.limit as string) || 0;
    const timePeriod = req.query?.timePeriod as string;
    const selectedStartDate = req.query?.startDate as string;
    const selectedEndDate = req.query?.endDate as string;
    const selectedDate = req.query?.selectedDate as string;
    const selectedCategoryId = req.query?.category as string;

    const findQuery: { [key: string]: object | string } = {
      userId: req.params.userId,
    };

    if (selectedEndDate || selectedStartDate || selectedDate) {
      const { data, error } = getStartAndEndDates({
        timePeriod,
        selectedEndDate,
        selectedStartDate,
        selectedDate,
      });
      if (error) return res.status(400).json({ error: error.message });
      if (data !== null) {
        const { startDate, endDate } = data;
        findQuery.date = { $gte: startDate, $lt: endDate };
      }
    }
    if (selectedCategoryId) {
      findQuery.category = selectedCategoryId;
    }

    const transactions = await transactionModel.Transaction.find(findQuery)
      .limit(limit)
      .skip((page - 1) * limit)
      .populate("category");

    return res.status(200).json(transactions);
  } catch (err: unknown) {
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
      date: req.body.date,
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
    if (!transaction) {
      return res.status(404).json({
        message: "Edit not successful",
        error: "Transaction not found",
      });
    }
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
    if (!deletedTransaction) {
      return res.status(404).json({
        message: "Delete not successful",
        error: "Transaction not found",
      });
    }
    return res.status(200).json(deletedTransaction);
  } catch (err: unknown) {
    if (err instanceof Error) {
      return res.status(500).json({ message: err.message });
    }
  }
};

export const getTotalIncome = async (req: Request, res: Response) => {
  try {
    const totalIncome = await getSumByFilter({
      userId: req.params.userId,
      isTotalIncome: true,
      timePeriod: req.query.timePeriod as string,
      selectedDate: req.query.date as string,
      selectedStartDate: req.query.startDate as string,
      selectedEndDate: req.query.endDate as string,
      selectedCategory: req.query.category as string,
    });
    return res.status(200).json(totalIncome.sum);
  } catch (err: unknown) {
    if (err instanceof Error) {
      return res.status(500).json({ message: err.message });
    }
  }
};

export const getTotalExpenses = async (req: Request, res: Response) => {
  try {
    const totalExpenses = await getSumByFilter({
      userId: req.params.userId,
      timePeriod: req.query.timePeriod as string,
      isTotalIncome: false,
      selectedDate: req.query.date as string,
      selectedStartDate: req.query.startDate as string,
      selectedEndDate: req.query.endDate as string,
      selectedCategory: req.query.category as string,
    });
    return res.status(200).json(totalExpenses.sum);
  } catch (err: unknown) {
    if (err instanceof Error) {
      return res.status(500).json({ message: err.message });
    }
  }
};
