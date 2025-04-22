import { ObjectId } from "../mongo-setup";
import { getStartAndEndDates } from "./movements";
import * as debtModel from "../models/debt";

export const debtsHelpersErrors = {
  incompleteDateRange: new Error(
    "This method requires both a startDate and endDate"
  ),
  swappedDateRange: new Error("startDate must be earlier than endDate"),
};

type calculateSumByTypeParams = {
  userId: string;
  isLoans: boolean;
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
      error = debtsHelpersErrors.incompleteDateRange;
    } else if (params.startDate && params.endDate) {
      if (params.startDate > params.endDate) {
        error = debtsHelpersErrors.swappedDateRange;
      } else {
        matchQuery.date = { $gte: params.startDate, $lt: params.endDate };
      }
    }
    if (!error) {
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
                  { $eq: ["$type", params.isLoans ? "loan" : "debt"] },
                  "$amount",
                  0,
                ],
              },
            },
          },
        },
      ]);
      sum = debtsAgg[0]?.sum || 0;
    }
    return { error, sum };
  } catch (error) {
    return { error, sum: null };
  }
};

type getSumByFilterParams = {
  userId: string;
  isTotalLoans: boolean;
  timePeriod?: string;
  selectedDate?: string;
  selectedStartDate?: string;
  selectedEndDate?: string;
  selectedCategory?: string;
};

export const getSumByFilter = async (params: getSumByFilterParams) => {
  try {
    let startDate = undefined;
    let endDate = undefined;

    if (params.timePeriod) {
      const { data, error: getStartAndEndDateError } = getStartAndEndDates({
        timePeriod: params.timePeriod,
        selectedDate: params.selectedDate,
        selectedStartDate: params.selectedStartDate,
        selectedEndDate: params.selectedEndDate,
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
      isLoans: params.isTotalLoans,
      startDate,
      endDate,
      category: params.selectedCategory,
    });
    if (error instanceof Error) {
      throw error;
    }
    return { error, sum };
  } catch (error) {
    return { error, sum: null };
  }
};
