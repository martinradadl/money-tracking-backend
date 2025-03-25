import { ObjectId } from "../mongo-setup";
import { getStartAndEndDates } from "./movements";
import * as debtModel from "../models/debt";

export const calculateSumByTpe = async (
  userId: string,
  isLoans: boolean,
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
    const debtsAgg = await debtModel.Debt.aggregate([
      {
        $match: matchQuery,
      },
      {
        $group: {
          _id: null,
          sum: {
            $sum: {
              $cond: [
                { $eq: ["$type", isLoans ? "loan" : "debt"] },
                "$amount",
                0,
              ],
            },
          },
        },
      },
    ]);
    const sum = debtsAgg[0]?.sum || 0;
    return sum;
  } catch (err: unknown) {
    if (err instanceof Error) {
      return err;
    }
  }
};

type getSumByDateParams = {
  userId: string;
  isTotalLoans: boolean;
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
    console.log("before sum");
    const sum = await calculateSumByTpe(
      params.userId,
      params.isTotalLoans,
      startDate,
      endDate
    );
    console.log("sum: ", sum);
    if (sum instanceof Error) {
      console.log("on error");
      throw sum;
    }
    return sum;
  } catch (err: unknown) {
    if (err instanceof Error) {
      return err;
    }
  }
};
