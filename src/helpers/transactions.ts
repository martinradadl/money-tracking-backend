import { ObjectId } from "../mongo-setup";
import { getRoundedDateRange } from "./movements";
import * as transactionModel from "../models/transaction";

export const transactionsHelpersErrors = {
  incompleteDateRange: new Error(
    "This method requires both a startDate and endDate"
  ),
  swappedDateRange: new Error("startDate must be earlier than endDate"),
};

type calculateSumByTypeParams = {
  userId: string;
  isIncome: boolean;
  startDate?: Date;
  endDate?: Date;
  category?: string;
};

export const calculateSumByType = async (params: calculateSumByTypeParams) => {
  try {
    let error = null;
    let sum = 0;
    const matchQuery: { [key: string]: object } = {
      userId: new ObjectId(params.userId),
    };

    if (params.category) {
      matchQuery.category = new ObjectId(params.category);
    }

    if (
      (!params.startDate && params.endDate) ||
      (params.startDate && !params.endDate)
    ) {
      error = transactionsHelpersErrors.incompleteDateRange;
    } else if (params.startDate && params.endDate) {
      if (params.startDate > params.endDate) {
        error = transactionsHelpersErrors.swappedDateRange;
      } else {
        matchQuery.date = { $gte: params.startDate, $lt: params.endDate };
      }
    }
    if (!error) {
      const transactionsAgg = await transactionModel.Transaction.aggregate([
        {
          $match: matchQuery,
        },
        {
          $group: {
            _id: null,
            sum: {
              $sum: {
                $cond: [
                  { $eq: ["$type", params.isIncome ? "income" : "expenses"] },
                  "$amount",
                  0,
                ],
              },
            },
          },
        },
      ]);
      sum = transactionsAgg[0]?.sum || 0;
    }
    return { error, sum };
  } catch (error) {
    return { error, sum: null };
  }
};

type getSumByFilterParams = {
  userId: string;
  isTotalIncome: boolean;
  timePeriod?: string;
  date?: string;
  startDate?: string;
  endDate?: string;
  category?: string;
};

export const getSumByFilter = async (params: getSumByFilterParams) => {
  try {
    let startDate = undefined;
    let endDate = undefined;

    if (
      params.timePeriod &&
      (params.date || params.startDate || params.endDate)
    ) {
      const { data, error: getStartAndEndDateError } = getRoundedDateRange({
        timePeriod: params.timePeriod,
        date: params.date,
        startDate: params.startDate,
        endDate: params.endDate,
      });
      if (getStartAndEndDateError) {
        throw getStartAndEndDateError;
      }
      if (data !== null) {
        startDate = data.startDate;
        endDate = data.endDate;
      }
    }
    const { error, sum } = await calculateSumByType({
      userId: params.userId,
      isIncome: params.isTotalIncome,
      startDate,
      endDate,
      category: params.category,
    });
    if (error instanceof Error) {
      throw error;
    }
    return { error, sum };
  } catch (error) {
    return { error, sum: null };
  }
};
