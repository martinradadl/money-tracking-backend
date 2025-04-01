import { Request, Response } from "express";
import * as debtModel from "../models/debt";
import { addDays, addMonths, addYears } from "date-fns";
import { getSumByDate } from "../helpers/debts";

export const getAll = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query?.page as string) || 1;
    const limit = parseInt(req.query?.limit as string) || 0;

    const debts = await debtModel.Debt.find({
      userId: req.params.userId,
    })
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

// TODO Refactor in next update

export const filterByDate = async (startDate: Date, endDate: Date) => {
  try {
    const filteredDebts = await debtModel.Debt.find({
      date: { $gte: startDate, $lt: endDate },
    });
    return filteredDebts;
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

    const filteredDebts = filterByDate(startDate, endDate);
    return res.status(200).json(filteredDebts);
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

    const filteredDebts = filterByDate(startDate, endDate);
    return res.status(200).json(filteredDebts);
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

    const filteredDebts = filterByDate(startDate, endDate);
    return res.status(200).json(filteredDebts);
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
    const filteredDebts = filterByDate(startDate, endDate);
    return res.status(200).json(filteredDebts);
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
    const filteredDebts = filterByDate(startDate, endDate);
    return res.status(200).json(filteredDebts);
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

    const filteredDebts = filterByDate(startDate, endDate);
    return res.status(200).json(filteredDebts);
  } catch (err: unknown) {
    if (err instanceof Error) {
      return res.status(500).json({ message: err.message });
    }
  }
};
