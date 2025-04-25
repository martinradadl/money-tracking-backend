import { afterEach, describe, expect, it, vi } from "vitest";
import { Debt } from "../../models/debt";
import { fakeObjectId, mockedCatchError } from "../utils";
import { fakeDebtsList } from "../fake-data/debts";
import {
  calculateSumByType,
  getSumByFilter,
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

    it("Should calculate sum of loans or debts", async () => {
      const sum = fakeDebtsList.reduce((total, elem) => total + elem.amount, 0);
      const fakeAggregates = [
        {
          _id: null,
          balance: sum,
          sum,
        },
      ];
      vi.mocked(Debt.aggregate, true).mockResolvedValue(fakeAggregates);
      const result = await calculateSumByType({
        userId: fakeObjectId.toString(),
        isLoans: true,
      });
      expect(result?.sum).toEqual(sum);
    });

    it("Should calculate sum of loans or debts when given an start and end date", async () => {
      const filteredList = fakeDebtsList.filter((elem) =>
        elem.date.includes("2024-02-04")
      );
      const sum = filteredList.reduce((total, elem) => total + elem.amount, 0);
      const fakeAggregates = [
        {
          _id: null,
          balance: sum,
          sum,
        },
      ];
      vi.mocked(Debt.aggregate, true).mockResolvedValue(fakeAggregates);
      const result = await calculateSumByType({
        userId: fakeObjectId.toString(),
        isLoans: true,
        startDate: new Date(),
        endDate: new Date(),
      });
      expect(result?.sum).toEqual(sum);
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

      const result = await getSumByFilter({
        userId: fakeObjectId.toString(),
        isTotalLoans: true,
      });
      expect(result.error).toEqual(mockedCatchError);
    });

    it("Should get sum without filtering by date", async () => {
      const sum = fakeDebtsList.reduce((total, elem) => total + elem.amount, 0);
      const fakeAggregates = [
        {
          _id: null,
          balance: sum,
          sum,
        },
      ];
      vi.mocked(Debt.aggregate, true).mockResolvedValue(fakeAggregates);
      const result = await getSumByFilter({
        userId: fakeObjectId.toString(),
        isTotalLoans: true,
      });
      expect(result.sum).toEqual(sum);
    });

    it("Should get sum by date given a date", async () => {
      const filteredList = fakeDebtsList.filter((elem) =>
        elem.date.includes("2024-02-04")
      );
      const sum = filteredList.reduce((total, elem) => total + elem.amount, 0);
      const fakeAggregates = [
        {
          _id: null,
          balance: sum,
          sum,
        },
      ];
      vi.mocked(Debt.aggregate, true).mockResolvedValue(fakeAggregates);
      const result = await getSumByFilter({
        userId: fakeObjectId.toString(),
        isTotalLoans: true,
        timePeriod: "month",
        date: "2000-02",
      });
      expect(result.sum).toEqual(sum);
    });

    it("Should get sum by date given a date range", async () => {
      const filteredList = fakeDebtsList.filter((elem) =>
        elem.date.includes("2024-02-04")
      );
      const sum = filteredList.reduce((total, elem) => total + elem.amount, 0);
      const fakeAggregates = [
        {
          _id: null,
          balance: sum,
          sum,
        },
      ];
      vi.mocked(Debt.aggregate, true).mockResolvedValue(fakeAggregates);
      const result = await getSumByFilter({
        userId: fakeObjectId.toString(),
        isTotalLoans: true,
        timePeriod: "day",
        startDate: "2000-02-02",
        endDate: "2000-02-03",
      });
      expect(result.sum).toEqual(sum);
    });
  });
});
