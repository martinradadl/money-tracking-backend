import { addDays, addMonths, addYears } from "date-fns";

export const movementsErrors = {
  noDates: new Error(
    "This method requires at least a selectedDate or a selectedStartDate and selectedEndDate"
  ),
  incompleteDateRange: new Error(
    "This method requires both a selectedStartDate and selectedEndDate"
  ),
  swappedDateRange: new Error(
    "selectedStartDate must be earlier than selectedEndDate"
  ),
};

type getStartAndEndDatesParams = {
  timePeriod: string;
  selectedDate?: string;
  selectedStartDate?: string;
  selectedEndDate?: string;
};

export const getStartAndEndDates = (params: getStartAndEndDatesParams) => {
  type TimePeriods = { [key: string]: { startDate: Date; endDate: Date } };
  let timePeriods: TimePeriods = {};
  let error = null;

  if (
    !params.selectedDate &&
    !params.selectedStartDate &&
    !params.selectedEndDate
  ) {
    error = movementsErrors.noDates;
  } else if (
    !params.selectedDate &&
    !(params.selectedStartDate && params.selectedEndDate)
  ) {
    error = movementsErrors.incompleteDateRange;
  } else if (
    params.selectedStartDate &&
    params.selectedEndDate &&
    new Date(params.selectedEndDate) < new Date(params.selectedStartDate)
  ) {
    error = movementsErrors.swappedDateRange;
  } else if (params.selectedDate) {
    const dayStartDate = new Date(`${params.selectedDate}T00:00:00.000+00:00`);
    const monthStartDate = new Date(
      `${params.selectedDate}-01T00:00:00.000+00:00`
    );
    const yearStartDate = new Date(
      `${params.selectedDate}-01-01T00:00:00.000+00:00`
    );
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
        startDate: new Date(`${params.selectedStartDate}T00:00:00.000+00:00`),
        endDate: addDays(
          new Date(`${params.selectedEndDate}T00:00:00.000+00:00`),
          1
        ),
      },
      month: {
        startDate: new Date(
          `${params.selectedStartDate}-01T00:00:00.000+00:00`
        ),
        endDate: addMonths(
          new Date(`${params.selectedEndDate}-01T00:00:00.000+00:00`),
          1
        ),
      },
      year: {
        startDate: new Date(
          `${params.selectedStartDate}-01-01T00:00:00.000+00:00`
        ),
        endDate: addYears(
          new Date(`${params.selectedEndDate}-01-01T00:00:00.000+00:00`),
          1
        ),
      },
    };
  }
  return { error, data: timePeriods[params.timePeriod] };
};
