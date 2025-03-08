import { afterEach, describe, expect, it, vi } from "vitest";
import {
  create,
  deleteOne,
  edit,
  getAll,
  getBalance,
  calculateBalance,
  getTotalLoans,
  getTotalDebts,
  filterByDay,
  filterByMonth,
  filterByYear,
  filterByCustomDays,
  filterByCustomMonths,
  filterByCustomYears,
} from "../controllers/debts";
import { Debt } from "../models/debt";
import {
  defaultGetAllQueryObject,
  fakeObjectId,
  initializeReqResMocks,
  mockedCatchError,
} from "./utils";
import {
  fakeAggregates,
  fakeDebt,
  fakeDebtsList,
  getDebtsPage,
} from "./fake-data/debts";

vi.mock("../models/debt.ts");

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

    it("Should delete Debt", async () => {
      vi.mocked(Debt.findByIdAndDelete, true).mockResolvedValue(fakeDebt);
      const { req, res } = initializeReqResMocks();
      await deleteOne(req, res);
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(fakeDebt);
    });
  });

  describe("Calculate Balance Controller", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("should error been throwed", async () => {
      vi.mocked(Debt.aggregate, true).mockImplementation(() => {
        throw mockedCatchError;
      });
      //@ts-expect-error Unsolved error with ObjectId
      const result = await calculateBalance(fakeObjectId);
      expect(result).toEqual(mockedCatchError);
    });

    it("Should calculate Balance", async () => {
      vi.mocked(Debt.aggregate, true).mockResolvedValue(fakeAggregates);
      //@ts-expect-error Unsolved error with ObjectId
      const result = await calculateBalance(fakeObjectId);
      expect(result).toEqual(fakeDebt.amount);
    });
  });

  describe("Get Balance Controller", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("should return 500 when error is throwed", async () => {
      vi.mocked(Debt.aggregate, true).mockImplementation(() => {
        throw mockedCatchError;
      });
      const { req, res } = initializeReqResMocks();
      await getBalance(req, res);
      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ message: mockedCatchError.message });
    });

    it("Should Get Balance", async () => {
      vi.mocked(Debt.aggregate, true).mockResolvedValue(fakeAggregates);
      const { req, res } = initializeReqResMocks();
      await getBalance(req, res);
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(fakeDebt.amount);
    });
  });

  describe("Get Total Debts Controller", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("should return 500 when error is throwed", async () => {
      vi.mocked(Debt.aggregate, true).mockImplementation(() => {
        throw mockedCatchError;
      });
      const { req, res } = initializeReqResMocks();
      await getTotalDebts(req, res);
      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ message: mockedCatchError.message });
    });

    it("Should Get Total Debts", async () => {
      vi.mocked(Debt.aggregate, true).mockResolvedValue(fakeAggregates);
      const { req, res } = initializeReqResMocks();
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
      vi.mocked(Debt.aggregate, true).mockImplementation(() => {
        throw mockedCatchError;
      });
      const { req, res } = initializeReqResMocks();
      await getTotalLoans(req, res);
      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ message: mockedCatchError.message });
    });

    it("Should Get Total Loans", async () => {
      vi.mocked(Debt.aggregate, true).mockResolvedValue(fakeAggregates);
      const { req, res } = initializeReqResMocks();
      await getTotalLoans(req, res);
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(fakeDebt.amount);
    });
  });

  describe("Filter By Day Controller", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("Should return 500 when error is throwed", async () => {
      vi.mocked(Debt.find, true).mockImplementation(() => {
        throw mockedCatchError;
      });
      const { req, res } = initializeReqResMocks();
      await filterByDay(req, res);
      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ message: mockedCatchError.message });
    });

    it("Should filter by day", async () => {
      vi.mocked(Debt.find, true).mockResolvedValue([fakeDebt]);
      const { req, res } = initializeReqResMocks();
      await filterByDay(req, res);
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual([fakeDebt]);
    });
  });

  describe("Filter By Month Controller", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("Should return 500 when error is throwed", async () => {
      vi.mocked(Debt.find, true).mockImplementation(() => {
        throw mockedCatchError;
      });
      const { req, res } = initializeReqResMocks();
      await filterByMonth(req, res);
      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ message: mockedCatchError.message });
    });

    it("Should filter by month", async () => {
      vi.mocked(Debt.find, true).mockResolvedValue([fakeDebt]);
      const { req, res } = initializeReqResMocks();
      await filterByMonth(req, res);
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual([fakeDebt]);
    });
  });

  describe("Filter By Year Controller", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("Should return 500 when error is throwed", async () => {
      vi.mocked(Debt.find, true).mockImplementation(() => {
        throw mockedCatchError;
      });
      const { req, res } = initializeReqResMocks();
      await filterByYear(req, res);
      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ message: mockedCatchError.message });
    });

    it("Should filter by year", async () => {
      vi.mocked(Debt.find, true).mockResolvedValue([fakeDebt]);
      const { req, res } = initializeReqResMocks();
      await filterByYear(req, res);
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual([fakeDebt]);
    });
  });

  describe("Filter By Custom Days Controller", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("Should return 500 when error is throwed", async () => {
      vi.mocked(Debt.find, true).mockImplementation(() => {
        throw mockedCatchError;
      });
      const { req, res } = initializeReqResMocks();
      await filterByCustomDays(req, res);
      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ message: mockedCatchError.message });
    });

    it("Should filter by custom days", async () => {
      vi.mocked(Debt.find, true).mockResolvedValue([fakeDebt]);
      const { req, res } = initializeReqResMocks();
      await filterByCustomDays(req, res);
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual([fakeDebt]);
    });
  });

  describe("Filter By Custom Months Controller", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("Should return 500 when error is throwed", async () => {
      vi.mocked(Debt.find, true).mockImplementation(() => {
        throw mockedCatchError;
      });
      const { req, res } = initializeReqResMocks();
      await filterByCustomMonths(req, res);
      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ message: mockedCatchError.message });
    });

    it("Should filter by custom months", async () => {
      vi.mocked(Debt.find, true).mockResolvedValue([fakeDebt]);
      const { req, res } = initializeReqResMocks();
      await filterByCustomMonths(req, res);
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual([fakeDebt]);
    });
  });

  describe("Filter By Custom Years Controller", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("Should return 500 when error is throwed", async () => {
      vi.mocked(Debt.find, true).mockImplementation(() => {
        throw mockedCatchError;
      });
      const { req, res } = initializeReqResMocks();
      await filterByCustomYears(req, res);
      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ message: mockedCatchError.message });
    });

    it("Should filter by custom years", async () => {
      vi.mocked(Debt.find, true).mockResolvedValue([fakeDebt]);
      const { req, res } = initializeReqResMocks();
      await filterByCustomYears(req, res);
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual([fakeDebt]);
    });
  });
});
