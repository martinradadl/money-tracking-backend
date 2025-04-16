import { afterEach, describe, expect, it, vi } from "vitest";
import {
  create,
  deleteOne,
  edit,
  getAll,
  getTotalLoans,
  getTotalDebts,
} from "../controllers/debts";
import { Debt } from "../models/debt";
import {
  defaultGetAllQueryObject,
  initializeReqResMocks,
  mockedCatchError,
} from "./utils";
import {
  fakeDebt,
  fakeDebt2,
  fakeDebtsList,
  getDebtsPage,
} from "./fake-data/debts";
import { getSumByFilter } from "../helpers/debts";
import { movementsErrors } from "../helpers/movements";
vi.mock("../models/debt.ts");
vi.mock("../helpers/debts.ts");

describe("Debts Controller", () => {
  describe("Create Debt Controller", async () => {
    afterEach(() => {
      vi.resetAllMocks();
    });

    it("should return 500 when and error is throwed", async () => {
      const { req, res } = initializeReqResMocks();
      vi.mocked(Debt.create, true).mockImplementation(() => {
        throw mockedCatchError;
      });
      await create(req, res);
      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ message: mockedCatchError.message });
    });

    it("should return created debt and statusCode 200", async () => {
      const { req, res } = initializeReqResMocks();
      req.body = fakeDebt;
      vi.mocked(Debt.create, true).mockResolvedValue({
        //@ts-expect-error Unsolved error with populate
        populate: () => {
          return fakeDebt;
        },
      });
      await create(req, res);
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(fakeDebt);
    });
  });

  describe("Get Debts Controller", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("should return 500 when error is throwed", async () => {
      vi.mocked(Debt.find, true).mockImplementation(() => {
        throw mockedCatchError;
      });
      const { req, res } = initializeReqResMocks();
      await getAll(req, res);
      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ message: mockedCatchError.message });
    });

    it("Should return 200 and get Debts", async () => {
      const result = getDebtsPage();
      //@ts-expect-error Unsolved error with mockImplementation function
      vi.mocked(Debt.find, true).mockImplementation(() => {
        return defaultGetAllQueryObject(result);
      });
      const { req, res } = initializeReqResMocks();
      await getAll(req, res);
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(fakeDebtsList);
    });

    it("Should return 200 and get Debts in a given page and limit", async () => {
      const result = getDebtsPage(2, 1);
      //@ts-expect-error Unsolved error with mockImplementation function
      vi.mocked(Debt.find, true).mockImplementation(() => {
        return defaultGetAllQueryObject(result);
      });
      const { req, res } = initializeReqResMocks();
      await getAll(req, res);
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(result);
    });

    it("Should return 200 and get Debts in a selected date", async () => {
      //@ts-expect-error Unsolved error with mockImplementation function
      vi.mocked(Debt.find, true).mockImplementation(() => {
        return defaultGetAllQueryObject([fakeDebt, fakeDebt2]);
      });
      const { req, res } = initializeReqResMocks();
      req.query = { timePeriod: "month", selectedDate: "2022-04" };
      await getAll(req, res);
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual([fakeDebt, fakeDebt2]);
    });

    it("Should return 200 and get Debts in a selected category", async () => {
      //@ts-expect-error Unsolved error with mockImplementation function
      vi.mocked(Debt.find, true).mockImplementation(() => {
        return defaultGetAllQueryObject([fakeDebt, fakeDebt2]);
      });
      const { req, res } = initializeReqResMocks();
      req.query = { category: "fakeCategoryId" };
      await getAll(req, res);
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual([fakeDebt, fakeDebt2]);
    });

    it("Should return 400 when error in getStartAndEndDates is returned", async () => {
      const { req, res } = initializeReqResMocks();
      req.query = { timePeriod: "month" };
      await getAll(req, res);
      expect(res.statusCode).toBe(400);
      const error = movementsErrors.noDates;
      console.log("res._getJSONData(): ", res._getJSONData());
      expect(res._getJSONData()).toEqual({ error: error.message });
    });
  });

  describe("Edit Debt Controller", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("should return 500 when error is throwed", async () => {
      vi.mocked(Debt.findByIdAndUpdate, true).mockImplementation(() => {
        throw mockedCatchError;
      });
      const { req, res } = initializeReqResMocks();
      await edit(req, res);
      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ message: mockedCatchError.message });
    });

    it("should return 404 when Debt is not found", async () => {
      vi.mocked(Debt.findByIdAndUpdate, true).mockResolvedValue(null);
      const { req, res } = initializeReqResMocks();
      await edit(req, res);
      expect(res.statusCode).toBe(404);
      expect(res._getJSONData()).toEqual({
        message: "Edit not successful",
        error: "Debt not found",
      });
    });

    it("Should update Debt", async () => {
      vi.mocked(Debt.findByIdAndUpdate, true).mockResolvedValue({
        populate: () => {
          return fakeDebt;
        },
      });
      const { req, res } = initializeReqResMocks();
      await edit(req, res);
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(fakeDebt);
    });
  });

  describe("Delete Debt Controller", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("should return 500 when error is throwed", async () => {
      vi.mocked(Debt.findByIdAndDelete, true).mockImplementation(() => {
        throw mockedCatchError;
      });
      const { req, res } = initializeReqResMocks();
      await deleteOne(req, res);
      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ message: mockedCatchError.message });
    });

    it("should return 404 when Debt is not found", async () => {
      vi.mocked(Debt.findByIdAndUpdate, true).mockResolvedValue(null);
      const { req, res } = initializeReqResMocks();
      await deleteOne(req, res);
      expect(res.statusCode).toBe(404);
      expect(res._getJSONData()).toEqual({
        message: "Delete not successful",
        error: "Debt not found",
      });
    });

    it("Should delete Debt", async () => {
      vi.mocked(Debt.findByIdAndDelete, true).mockResolvedValue(fakeDebt);
      const { req, res } = initializeReqResMocks();
      await deleteOne(req, res);
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(fakeDebt);
    });
  });

  describe("Get Total Debts Controller", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("should return 500 when error is throwed", async () => {
      vi.mocked(getSumByFilter, true).mockImplementation(() => {
        throw mockedCatchError;
      });
      const { req, res } = initializeReqResMocks();
      await getTotalDebts(req, res);
      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ message: mockedCatchError.message });
    });

    it("Should Get Total Debts", async () => {
      vi.mocked(getSumByFilter, true).mockResolvedValue({
        error: null,
        sum: fakeDebt.amount,
      });
      const { req, res } = initializeReqResMocks();
      await getTotalDebts(req, res);
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(fakeDebt.amount);
    });

    it("Should Get Total Debts in a selected category", async () => {
      vi.mocked(getSumByFilter, true).mockResolvedValue({
        error: null,
        sum: fakeDebt.amount,
      });
      const { req, res } = initializeReqResMocks();
      req.query = { category: "fakeCategoryId" };
      await getTotalDebts(req, res);
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(fakeDebt.amount);
    });

    it("Should Get Total Debts in a selected date", async () => {
      vi.mocked(getSumByFilter, true).mockResolvedValue({
        error: null,
        sum: fakeDebt.amount,
      });
      const { req, res } = initializeReqResMocks();
      req.query = { timePeriod: "month", selectedDate: "2022-04" };
      await getTotalDebts(req, res);
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(fakeDebt.amount);
    });
  });

  describe("Get Total Loans Controller", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("should return 500 when error is throwed", async () => {
      vi.mocked(getSumByFilter, true).mockImplementation(() => {
        throw mockedCatchError;
      });
      const { req, res } = initializeReqResMocks();
      await getTotalLoans(req, res);
      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ message: mockedCatchError.message });
    });

    it("Should Get Total Loans", async () => {
      vi.mocked(getSumByFilter, true).mockResolvedValue({
        error: null,
        sum: fakeDebt.amount,
      });
      const { req, res } = initializeReqResMocks();
      await getTotalLoans(req, res);
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(fakeDebt.amount);
    });

    it("Should Get Total Loans in a selected category", async () => {
      vi.mocked(getSumByFilter, true).mockResolvedValue({
        error: null,
        sum: fakeDebt.amount,
      });
      const { req, res } = initializeReqResMocks();
      req.query = { category: "fakeCategoryId" };
      await getTotalLoans(req, res);
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(fakeDebt.amount);
    });

    it("Should Get Total Loans in a selected date", async () => {
      vi.mocked(getSumByFilter, true).mockResolvedValue({
        error: null,
        sum: fakeDebt.amount,
      });
      const { req, res } = initializeReqResMocks();
      req.query = { timePeriod: "month", selectedDate: "2022-04" };
      await getTotalLoans(req, res);
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(fakeDebt.amount);
    });
  });
});
