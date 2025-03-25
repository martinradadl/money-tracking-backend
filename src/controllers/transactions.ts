import { Request, Response } from "express";
import * as transactionModel from "../models/transaction";
import { addDays, addMonths, addYears } from "date-fns";
import { getSumByDate } from "../helpers/transactions";

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

export const getTotalIncome = async (req: Request, res: Response) => {
  try {
    const totalIncome = await getSumByDate({
      userId: req.params.userId,
      isTotalIncome: true,
      timePeriod: req.query.timePeriod as string,
      selectedDate: req.query.selectedDate as string,
      selectedStartDate: req.query.selectedStartDate as string,
      selectedEndDate: req.query.selectedEndDate as string,
    });
    return res.status(200).json(totalIncome);
  } catch (err: unknown) {
    if (err instanceof Error) {
      return res.status(500).json({ message: err.message });
    }
  }
};

export const getTotalExpenses = async (req: Request, res: Response) => {
  try {
    const totalExpenses = await getSumByDate({
      userId: req.params.userId,
      timePeriod: req.query.timePeriod as string,
      isTotalIncome: false,
      selectedDate: req.query.selectedDate as string,
      selectedStartDate: req.query.selectedStartDate as string,
      selectedEndDate: req.query.selectedEndDate as string,
    });
    return res.status(200).json(totalExpenses);
  } catch (err: unknown) {
    if (err instanceof Error) {
      return res.status(500).json({ message: err.message });
    }
  }
};

// TODO Refactor in next update

export const filterByDate = async (startDate: Date, endDate: Date) => {
  try {
    const filteredTransactions = await transactionModel.Transaction.find({
      date: { $gte: startDate, $lt: endDate },
    });
    return filteredTransactions;
  } catch (err: unknown) {
    if (err instanceof Error) {
      return err;
    }
  }
};

export const filterByDay = async (req: Request, res: Response) => {
  try {
    const selectedDate = req.query?.date as string;
    const startDate = new Date(`${selectedDate}T00:00:00.000+00:00`);
    const endDate = addDays(startDate, 1);

    const filteredTransactions = filterByDate(startDate, endDate);
    return res.status(200).json(filteredTransactions);
  } catch (err: unknown) {
    if (err instanceof Error) {
      return res.status(500).json({ message: err.message });
    }
  }
};

export const filterByMonth = async (req: Request, res: Response) => {
  try {
    const selectedDate = req.query?.date as string;
    const startDate = new Date(`${selectedDate}-01T00:00:00.000+00:00`);
    const endDate = addDays(addMonths(startDate, 1), 1);

    const filteredTransactions = filterByDate(startDate, endDate);
    return res.status(200).json(filteredTransactions);
  } catch (err: unknown) {
    if (err instanceof Error) {
      return res.status(500).json({ message: err.message });
    }
  }
};

export const filterByYear = async (req: Request, res: Response) => {
  try {
    const selectedDate = req.query?.date as string;
    const startDate = new Date(`${selectedDate}-01-01T00:00:00.000+00:00`);
    const endDate = addYears(startDate, 1);

    const filteredTransactions = filterByDate(startDate, endDate);
    return res.status(200).json(filteredTransactions);
  } catch (err: unknown) {
    if (err instanceof Error) {
      return res.status(500).json({ message: err.message });
    }
  }
};

export const filterByCustomDays = async (req: Request, res: Response) => {
  try {
    const startDate = new Date(`${req.query?.start}T00:00:00.000+00:00`);
    const endDate = addDays(
      new Date(`${req.query?.end}T00:00:00.000+00:00`),
      1
    );
    const filteredTransactions = filterByDate(startDate, endDate);
    return res.status(200).json(filteredTransactions);
  } catch (err: unknown) {
    if (err instanceof Error) {
      return res.status(500).json({ message: err.message });
    }
  }
};

export const filterByCustomMonths = async (req: Request, res: Response) => {
  try {
    const startDate = new Date(`${req.query?.start}-01T00:00:00.000+00:00`);
    const endDate = addMonths(
      new Date(`${req.query?.end}-01T00:00:00.000+00:00`),
      1
    );
    const filteredTransactions = filterByDate(startDate, endDate);
    return res.status(200).json(filteredTransactions);
  } catch (err: unknown) {
    if (err instanceof Error) {
      return res.status(500).json({ message: err.message });
    }
  }
};

export const filterByCustomYears = async (req: Request, res: Response) => {
  try {
    const startDate = new Date(`${req.query?.start}-01-01T00:00:00.000+00:00`);
    const endDate = addYears(
      new Date(`${req.query?.end}-01-01T00:00:00.000+00:00`),
      1
    );

    const filteredTransactions = filterByDate(startDate, endDate);
    return res.status(200).json(filteredTransactions);
  } catch (err: unknown) {
    if (err instanceof Error) {
      return res.status(500).json({ message: err.message });
    }
  }
};
