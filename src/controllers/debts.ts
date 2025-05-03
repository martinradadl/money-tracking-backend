import { Request, Response } from "express";
import * as debtModel from "../models/debt";
import { getSumByFilter } from "../helpers/debts";
import { getRoundedDateRange } from "../helpers/movements";
import { ObjectId } from "../mongo-setup";

export const getAll = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query?.page as string) || 1;
    const limit = parseInt(req.query?.limit as string) || 0;
    const timePeriod = req.query?.timePeriod as string;
    const startDate = req.query?.startDate as string;
    const endDate = req.query?.endDate as string;
    const date = req.query?.date as string;
    const categoryId = req.query?.category as string;

    const findQuery: { [key: string]: object | string } = {
      userId: req.params.userId,
    };

    if (timePeriod) {
      const { data, error } = getRoundedDateRange({
        timePeriod,
        endDate,
        startDate,
        date,
      });
      if (error) return res.status(400).json({ error: error.message });
      if (data !== null) {
        const { startDate, endDate } = data;
        findQuery.date = { $gte: startDate, $lt: endDate };
      }
    }
    if (categoryId) {
      findQuery.category = categoryId;
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

export const getChartData = async (req: Request, res: Response) => {
  try {
    const timePeriod = req.query?.timePeriod as string;
    const startDate = req.query?.startDate as string;
    const endDate = req.query?.endDate as string;
    const date = req.query?.date as string;
    const categoryId = req.query?.category as string;
    const isTotalBalance = req.query?.isTotalBalance;

    const matchQuery: { [key: string]: object | string } = {
      userId: new ObjectId(req.params.userId),
    };

    if (timePeriod) {
      const { data, error } = getRoundedDateRange({
        timePeriod,
        endDate,
        startDate,
        date,
      });
      if (error) return res.status(400).json({ error: error.message });
      if (data !== null) {
        const { startDate, endDate } = data;
        matchQuery.date = { $gte: startDate, $lt: endDate };
      }
    }
    if (categoryId) {
      matchQuery.category = new ObjectId(categoryId);
    }

    const groupById = {
      type: isTotalBalance ? undefined : "$type",
      date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
    };

    const debtsAgg = await debtModel.Debt.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: groupById,
          totalAmount: {
            $sum: {
              $cond: {
                if: { $eq: ["$type", "loan"] },
                then: "$amount",
                else: { $multiply: ["$amount", -1] },
              },
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          group: isTotalBalance
            ? "Debt"
            : {
                $concat: [
                  { $toUpper: { $substrCP: ["$_id.type", 0, 1] } },
                  { $substrCP: ["$_id.type", 1, { $strLenCP: "$_id.type" }] },
                ],
              },
          date: "$_id.date",
          amount: "$totalAmount",
        },
      },
    ]);

    return res.status(200).json(debtsAgg);
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
    const totalLoans = await getSumByFilter({
      userId: req.params.userId,
      isTotalLoans: true,
      timePeriod: req.query.timePeriod as string,
      date: req.query.date as string,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      category: req.query.category as string,
    });
    return res.status(200).json(totalLoans.sum);
  } catch (err: unknown) {
    if (err instanceof Error) {
      return res.status(500).json({ message: err.message });
    }
  }
};

export const getTotalDebts = async (req: Request, res: Response) => {
  try {
    const totalDebts = await getSumByFilter({
      userId: req.params.userId,
      timePeriod: req.query.timePeriod as string,
      isTotalLoans: false,
      date: req.query.date as string,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      category: req.query.category as string,
    });
    return res.status(200).json(totalDebts.sum);
  } catch (err: unknown) {
    if (err instanceof Error) {
      return res.status(500).json({ message: err.message });
    }
  }
};
