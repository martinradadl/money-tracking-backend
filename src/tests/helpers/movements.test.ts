import { afterEach, describe, expect, it, vi } from "vitest";
import { getRoundedDateRange, movementsErrors } from "../../helpers/movements";
import { addDays } from "date-fns";
import { fakeEndDate, fakeStartDate } from "../fake-data/movements";

vi.mock("date-fns");

describe("Movements Helpers", () => {
  describe("get Start And End Dates Controller", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });
    it("should return error when no dates are given", async () => {
      const result = getRoundedDateRange({
        timePeriod: "day",
      });
      expect(result.error).toEqual(movementsErrors.noDates);
    });
    it("should return error when both start and end dates are not given", async () => {
      const result = getRoundedDateRange({
        timePeriod: "day",
        endDate: fakeEndDate,
      });
      expect(result.error).toEqual(movementsErrors.incompleteDateRange);
    });
    it("should return error when given start date is later than end date", async () => {
      const result = getRoundedDateRange({
        timePeriod: "day",
        startDate: fakeEndDate,
        endDate: fakeStartDate,
      });
      expect(result.error).toEqual(movementsErrors.swappedDateRange);
    });
    it("should return object with start and end date", async () => {
      vi.mocked(addDays, true).mockReturnValue(new Date(fakeEndDate));
      const result = getRoundedDateRange({
        timePeriod: "day",
        date: fakeStartDate,
      });
      expect(result.data).toEqual({
        startDate: new Date(fakeStartDate),
        endDate: new Date(fakeEndDate),
      });
    });
  });
});
