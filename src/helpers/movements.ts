import { addDays, addMonths, addYears } from "date-fns";

export const movementsErrors = {
  noDates: new Error(
    "This method requires at least a date or a startDate and endDate"
  ),
  incompleteDateRange: new Error(
    "This method requires both a startDate and endDate"
  ),
  swappedDateRange: new Error("startDate must be earlier than endDate"),
};

type getRoundedDateRangeParams = {
  timePeriod: string;
  date?: string;
  startDate?: string;
  endDate?: string;
};

export const getRoundedDateRange = (params: getRoundedDateRangeParams) => {
  type TimePeriods = {
    [key: string]: { startDate: Date; endDate: Date };
  };
  let timePeriods: TimePeriods = {};
  let error = null;

  if (!params.date && !params.startDate && !params.endDate) {
    error = movementsErrors.noDates;
  } else if (!params.date && !(params.startDate && params.endDate)) {
    error = movementsErrors.incompleteDateRange;
  } else if (
    params.startDate &&
    params.endDate &&
    new Date(params.endDate) < new Date(params.startDate)
  ) {
    error = movementsErrors.swappedDateRange;
  } else if (params.date) {
    const dayStartDate = new Date(`${params.date}T00:00:00.000+00:00`);
    const monthStartDate = new Date(`${params.date}-01T00:00:00.000+00:00`);
    const yearStartDate = new Date(`${params.date}-01-01T00:00:00.000+00:00`);
    timePeriods = {
      day: {
        startDate: dayStartDate,
        endDate: addDays(dayStartDate, 1),
      },
      month: {
        startDate: monthStartDate,
        endDate: addDays(addMonths(monthStartDate, 1), 1),
      },
      year: {
        startDate: yearStartDate,
        endDate: addYears(yearStartDate, 1),
      },
    };
  } else {
    timePeriods = {
      day: {
        startDate: new Date(`${params.startDate}T00:00:00.000+00:00`),
        endDate: addDays(new Date(`${params.endDate}T00:00:00.000+00:00`), 1),
      },
      month: {
        startDate: new Date(`${params.startDate}-01T00:00:00.000+00:00`),
        endDate: addMonths(
          new Date(`${params.endDate}-01T00:00:00.000+00:00`),
          1
        ),
      },
      year: {
        startDate: new Date(`${params.startDate}-01-01T00:00:00.000+00:00`),
        endDate: addYears(
          new Date(`${params.endDate}-01-01T00:00:00.000+00:00`),
          1
        ),
      },
    };
  }
  return { error, data: !error ? timePeriods[params.timePeriod] : null };
};
