import { addDays, addMonths, addYears } from "date-fns";

export const getStartAndEndDates = (
  timePeriod: string,
  selectedDate?: string,
  selectedStartDate?: string,
  selectedEndDate?: string
) => {
  const dayStartDate = new Date(`${selectedDate}T00:00:00.000+00:00`);
  const monthStartDate = new Date(`${selectedDate}-01T00:00:00.000+00:00`);
  const yearStartDate = new Date(`${selectedDate}-01-01T00:00:00.000+00:00`);

  type TimePeriods = { [key: string]: { startDate: Date; endDate: Date } };
  let timePeriods: TimePeriods = {};
  if (selectedDate) {
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
        startDate: new Date(`${selectedStartDate}T00:00:00.000+00:00`),
        endDate: addDays(new Date(`${selectedEndDate}T00:00:00.000+00:00`), 1),
      },
      month: {
        startDate: new Date(`${selectedStartDate}-01T00:00:00.000+00:00`),
        endDate: addMonths(
          new Date(`${selectedEndDate}-01T00:00:00.000+00:00`),
          1
        ),
      },
      year: {
        startDate: new Date(`${selectedStartDate}-01-01T00:00:00.000+00:00`),
        endDate: addYears(
          new Date(`${selectedEndDate}-01-01T00:00:00.000+00:00`),
          1
        ),
      },
    };
  }
  return timePeriods[timePeriod];
};
