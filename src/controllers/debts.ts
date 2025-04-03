import { Request, Response } from "express";
import * as debtModel from "../models/debt";
import { getSumByDate } from "../helpers/debts";
import { getStartAndEndDates } from "../helpers/movements";

export const getAll = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query?.page as string) || 1;
    const limit = parseInt(req.query?.limit as string) || 0;
    const timePeriod = req.query?.timePeriod as string;
    const selectedStartDate = req.query?.startDate as string;
    const selectedEndDate = req.query?.endDate as string;
    const selectedDate = req.query?.selectedDate as string;
    const findQuery: { [key: string]: object | string } = {
      userId: req.params.userId,
    };

    if (timePeriod) {
      const { data, error } = getStartAndEndDates({
        timePeriod,
        selectedEndDate,
        selectedStartDate,
        selectedDate,
      });
      if (error) return res.status(400).json({ error: error.message });
      if (data != null) {
        const { startDate, endDate } = data;
        findQuery.date = { $gte: startDate, $lt: endDate };
      }
    }

    const debts = await debtModel.Debt.find(findQuery)
      .limit(limit)
      .skip((page - 1) * limit)
      .populate("category");
    return res.status(200).json(debts);
  } catch (err: unknown) {
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
      date: req.body.date,
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

export const getTotalLoans = async (req: Request, res: Response) => {
  try {
    const totalLoans = await getSumByDate({
      userId: req.params.userId,
      isTotalLoans: true,
      timePeriod: req.query.timePeriod as string,
      selectedDate: req.query.selectedDate as string,
      selectedStartDate: req.query.selectedStartDate as string,
      selectedEndDate: req.query.selectedEndDate as string,
    });
    return res.status(200).json(totalLoans);
  } catch (err: unknown) {
    if (err instanceof Error) {
      return res.status(500).json({ message: err.message });
    }
  }
};

export const getTotalDebts = async (req: Request, res: Response) => {
  try {
    const totalDebts = await getSumByDate({
      userId: req.params.userId,
      timePeriod: req.query.timePeriod as string,
      isTotalLoans: false,
      selectedDate: req.query.selectedDate as string,
      selectedStartDate: req.query.selectedStartDate as string,
      selectedEndDate: req.query.selectedEndDate as string,
    });
    return res.status(200).json(totalDebts);
  } catch (err: unknown) {
    if (err instanceof Error) {
      return res.status(500).json({ message: err.message });
    }
  }
};
