import { afterEach, describe, expect, it, vi } from "vitest";
import { Debt } from "../../models/debt";
import { fakeObjectId, mockedCatchError } from "../utils";
import {
  fakeAggregates,
  fakeAggregates2,
  fakeDebt,
  fakeDebt2,
} from "../fake-data/debts";
import {
  calculateSumByType,
  getSumByDate,
  debtsHelpersErrors,
} from "../../helpers/debts";
import { fakeEndDate, fakeStartDate } from "../fake-data/movements";

vi.mock("../../models/debt.ts");

describe("Debts Helpers", () => {
  describe("Calculate Sum By Type Controller", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("should return error", async () => {
      vi.mocked(Debt.aggregate, true).mockImplementation(() => {
        throw mockedCatchError;
      });
      const result = await calculateSumByType({
        userId: fakeObjectId.toString(),
        isLoans: true,
      });
      expect(result.error).toEqual(mockedCatchError);
    });

    it("should return error when both start and end dates are not given", async () => {
      const result = await calculateSumByType({
        userId: fakeObjectId.toString(),
        isLoans: true,
        startDate: new Date(fakeStartDate),
      });
      expect(result?.error).toEqual(debtsHelpersErrors.incompleteDateRange);
    });

    it("should return error when given start date is later than end date", async () => {
      const result = await calculateSumByType({
        userId: fakeObjectId.toString(),
        isLoans: true,
        startDate: new Date(fakeEndDate),
        endDate: new Date(fakeStartDate),
      });
      expect(result?.error).toEqual(debtsHelpersErrors.swappedDateRange);
    });

    it("Should calculate sum of incomes or expenses", async () => {
      vi.mocked(Debt.aggregate, true).mockResolvedValue(fakeAggregates);
      const result = await calculateSumByType({
        userId: fakeObjectId.toString(),
        isLoans: true,
      });
      expect(result?.sum).toEqual(fakeDebt.amount);
    });

    it("Should calculate sum of incomes or expenses when given an start and end date", async () => {
      vi.mocked(Debt.aggregate, true).mockResolvedValue(fakeAggregates2);
      const result = await calculateSumByType({
        userId: fakeObjectId.toString(),
        isLoans: true,
        startDate: new Date(),
        endDate: new Date(),
      });
      expect(result?.sum).toEqual(fakeDebt2.amount);
    });
  });

  describe("Get Sum By Date Controller", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("should return error", async () => {
      vi.mocked(Debt.aggregate, true).mockImplementation(() => {
        throw mockedCatchError;
      });

      const result = await getSumByDate({
        userId: fakeObjectId.toString(),
        isTotalLoans: true,
      });
      expect(result.error).toEqual(mockedCatchError);
    });

    it("Should get sum without filtering by date", async () => {
      vi.mocked(Debt.aggregate, true).mockResolvedValue(fakeAggregates);
      const result = await getSumByDate({
        userId: fakeObjectId.toString(),
        isTotalLoans: true,
      });
      expect(result.sum).toEqual(fakeDebt.amount);
    });

    it("Should get sum by date given a selected date", async () => {
      vi.mocked(Debt.aggregate, true).mockResolvedValue(fakeAggregates);
      const result = await getSumByDate({
        userId: fakeObjectId.toString(),
        isTotalLoans: true,
        timePeriod: "month",
        selectedDate: "2000-02",
      });
      expect(result.sum).toEqual(fakeDebt.amount);
    });

    it("Should get sum by date given a date range", async () => {
      vi.mocked(Debt.aggregate, true).mockResolvedValue(fakeAggregates);
      const result = await getSumByDate({
        userId: fakeObjectId.toString(),
        isTotalLoans: true,
        timePeriod: "day",
        selectedStartDate: "2000-02-02",
        selectedEndDate: "2000-02-03",
      });
      expect(result.sum).toEqual(fakeDebt.amount);
    });
  });
});
