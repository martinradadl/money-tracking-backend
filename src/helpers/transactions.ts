import { ObjectId } from "../mongo-setup";
import { getStartAndEndDates } from "./movements";
import * as transactionModel from "../models/transaction";

export const calculateSumByTpe = async (
  userId: string,
  isIncome: boolean,
  startDate?: Date,
  endDate?: Date
) => {
  try {
    const matchQuery: { [key: string]: any } = {
      userId: new ObjectId(userId),
    };
    if (startDate && endDate) {
      matchQuery.date = { $gte: startDate, $lt: endDate };
    }
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
                { $eq: ["$type", isIncome ? "income" : "expenses"] },
                "$amount",
                0,
              ],
            },
          },
        },
      },
    ]);
    const sum = transactionsAgg[0]?.sum || 0;
    return sum;
  } catch (err: unknown) {
    if (err instanceof Error) {
      return err;
    }
  }
};

type getSumByDateParams = {
  userId: string;
  isTotalIncome: boolean;
  timePeriod?: string;
  selectedDate?: string;
  selectedStartDate?: string;
  selectedEndDate?: string;
};

export const getSumByDate = async (params: getSumByDateParams) => {
  try {
    let startDate = undefined;
    let endDate = undefined;
    if (params.timePeriod) {
      const startAndEndDates = getStartAndEndDates(
        params.timePeriod,
        params.selectedDate,
        params.selectedStartDate,
        params.selectedEndDate
      );
      startDate = startAndEndDates.startDate;
      endDate = startAndEndDates.endDate;
    }
    const sum = await calculateSumByTpe(
      params.userId,
      params.isTotalIncome,
      startDate,
      endDate
    );
    if (sum instanceof Error) {
      throw sum;
    }
    return sum;
  } catch (err: unknown) {
    if (err instanceof Error) {
      return err;
    }
  }
};
