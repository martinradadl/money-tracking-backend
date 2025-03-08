import { afterEach, describe, expect, it, vi } from "vitest";
import {
  create,
  deleteOne,
  edit,
  getAll,
  getBalance,
  calculateBalance,
  getTotalIncome,
  getTotalExpenses,
  filterByDay,
  filterByMonth,
  filterByYear,
  filterByCustomDays,
  filterByCustomMonths,
  filterByCustomYears,
} from "../controllers/transactions";
import { Transaction } from "../models/transaction";
import {
  defaultGetAllQueryObject,
  initializeReqResMocks,
  mockedCatchError,
  fakeObjectId,
} from "./utils";
import {
  fakeAggregates,
  fakeTransaction,
  fakeTransactionsList,
  getTransactionsPage,
} from "./fake-data/transactions";

vi.mock("../models/transaction.ts");
vi.mock("../models/category.ts");

describe("Transactions Controller", () => {
  describe("Create Transaction Controller", async () => {
    afterEach(() => {
      vi.resetAllMocks();
    });

    it("should return 500 when and error is throwed", async () => {
      const { req, res } = initializeReqResMocks();
      vi.mocked(Transaction.create, true).mockImplementation(() => {
        throw mockedCatchError;
      });
      await create(req, res);
      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ message: mockedCatchError.message });
    });

    it("should return created transaction and statusCode 200", async () => {
      const { req, res } = initializeReqResMocks();
      req.body = fakeTransaction;
      vi.mocked(Transaction.create, true).mockResolvedValue({
        //@ts-expect-error Unsolved error with populate
        populate: () => {
          return fakeTransaction;
        },
      });
      await create(req, res);
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(fakeTransaction);
    });
  });

  describe("Get Transactions Controller", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("should return 500 when error is throwed", async () => {
      vi.mocked(Transaction.find, true).mockImplementation(() => {
        throw mockedCatchError;
      });
      const { req, res } = initializeReqResMocks();
      await getAll(req, res);
      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ message: mockedCatchError.message });
    });

    it("Should return 200 and get Transactions", async () => {
      const result = getTransactionsPage();
      //@ts-expect-error Unsolved error with mockImplementation function
      vi.mocked(Transaction.find, true).mockImplementation(() => {
        return defaultGetAllQueryObject(result);
      });
      const { req, res } = initializeReqResMocks();
      await getAll(req, res);
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(fakeTransactionsList);
    });

    it("Should return 200 and get Transactions in a given page and limit", async () => {
      const result = getTransactionsPage(2, 1);
      //@ts-expect-error Unsolved error with mockImplementation function
      vi.mocked(Transaction.find, true).mockImplementation(() => {
        return defaultGetAllQueryObject(result);
      });
      const { req, res } = initializeReqResMocks();
      await getAll(req, res);
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(result);
    });
  });

  describe("Edit Transaction Controller", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("should return 500 when error is throwed", async () => {
      vi.mocked(Transaction.findByIdAndUpdate, true).mockImplementation(() => {
        throw mockedCatchError;
      });
      const { req, res } = initializeReqResMocks();
      await edit(req, res);
      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ message: mockedCatchError.message });
    });

    it("Should update Transaction", async () => {
      vi.mocked(Transaction.findByIdAndUpdate, true).mockResolvedValue({
        populate: () => {
          return fakeTransaction;
        },
      });
      const { req, res } = initializeReqResMocks();
      await edit(req, res);
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(fakeTransaction);
    });
  });

  describe("Delete Transaction Controller", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("should return 500 when error is throwed", async () => {
      vi.mocked(Transaction.findByIdAndDelete, true).mockImplementation(() => {
        throw mockedCatchError;
      });
      const { req, res } = initializeReqResMocks();
      await deleteOne(req, res);
      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ message: mockedCatchError.message });
    });

    it("Should delete Transaction", async () => {
      vi.mocked(Transaction.findByIdAndDelete, true).mockResolvedValue(
        fakeTransaction
      );
      const { req, res } = initializeReqResMocks();
      await deleteOne(req, res);
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(fakeTransaction);
    });
  });

  describe("Calculate Balance Controller", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("should error been throwed", async () => {
      vi.mocked(Transaction.aggregate, true).mockImplementation(() => {
        throw mockedCatchError;
      });
      //@ts-expect-error Unsolved error with ObjectId
      const result = await calculateBalance(fakeObjectId);
      expect(result).toEqual(mockedCatchError);
    });

    it("Should calculate Balance", async () => {
      vi.mocked(Transaction.aggregate, true).mockResolvedValue(fakeAggregates);
      //@ts-expect-error Unsolved error with ObjectId
      const result = await calculateBalance(fakeObjectId);
      expect(result).toEqual(fakeTransaction.amount);
    });
  });

  describe("Get Balance Controller", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("should return 500 when error is throwed", async () => {
      vi.mocked(Transaction.aggregate, true).mockImplementation(() => {
        throw mockedCatchError;
      });
      const { req, res } = initializeReqResMocks();
      await getBalance(req, res);
      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ message: mockedCatchError.message });
    });

    it("Should Get Balance", async () => {
      vi.mocked(Transaction.aggregate, true).mockResolvedValue(fakeAggregates);
      const { req, res } = initializeReqResMocks();
      await getBalance(req, res);
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(fakeTransaction.amount);
    });
  });

  describe("Get Total Income Controller", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("should return 500 when error is throwed", async () => {
      vi.mocked(Transaction.aggregate, true).mockImplementation(() => {
        throw mockedCatchError;
      });
      const { req, res } = initializeReqResMocks();
      await getTotalIncome(req, res);
      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ message: mockedCatchError.message });
    });

    it("Should Get Balance", async () => {
      vi.mocked(Transaction.aggregate, true).mockResolvedValue(fakeAggregates);
      const { req, res } = initializeReqResMocks();
      await getTotalIncome(req, res);
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(fakeTransaction.amount);
    });
  });

  describe("Get Total Expenses Controller", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("should return 500 when error is throwed", async () => {
      vi.mocked(Transaction.aggregate, true).mockImplementation(() => {
        throw mockedCatchError;
      });
      const { req, res } = initializeReqResMocks();
      await getTotalExpenses(req, res);
      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ message: mockedCatchError.message });
    });

    it("Should Get Total Expenses", async () => {
      vi.mocked(Transaction.aggregate, true).mockResolvedValue(fakeAggregates);
      const { req, res } = initializeReqResMocks();
      await getTotalIncome(req, res);
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(fakeTransaction.amount);
    });
  });

  describe("Filter By Day Controller", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("Should return 500 when error is throwed", async () => {
      vi.mocked(Transaction.find, true).mockImplementation(() => {
        throw mockedCatchError;
      });
      const { req, res } = initializeReqResMocks();
      await filterByDay(req, res);
      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ message: mockedCatchError.message });
    });

    it("Should filter by day", async () => {
      vi.mocked(Transaction.find, true).mockResolvedValue([fakeTransaction]);
      const { req, res } = initializeReqResMocks();
      await filterByDay(req, res);
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual([fakeTransaction]);
    });
  });

  describe("Filter By Month Controller", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("Should return 500 when error is throwed", async () => {
      vi.mocked(Transaction.find, true).mockImplementation(() => {
        throw mockedCatchError;
      });
      const { req, res } = initializeReqResMocks();
      await filterByMonth(req, res);
      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ message: mockedCatchError.message });
    });

    it("Should filter by month", async () => {
      vi.mocked(Transaction.find, true).mockResolvedValue([fakeTransaction]);
      const { req, res } = initializeReqResMocks();
      await filterByMonth(req, res);
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual([fakeTransaction]);
    });
  });

  describe("Filter By Year Controller", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("Should return 500 when error is throwed", async () => {
      vi.mocked(Transaction.find, true).mockImplementation(() => {
        throw mockedCatchError;
      });
      const { req, res } = initializeReqResMocks();
      await filterByYear(req, res);
      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ message: mockedCatchError.message });
    });

    it("Should filter by year", async () => {
      vi.mocked(Transaction.find, true).mockResolvedValue([fakeTransaction]);
      const { req, res } = initializeReqResMocks();
      await filterByYear(req, res);
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual([fakeTransaction]);
    });
  });

  describe("Filter By Custom Days Controller", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("Should return 500 when error is throwed", async () => {
      vi.mocked(Transaction.find, true).mockImplementation(() => {
        throw mockedCatchError;
      });
      const { req, res } = initializeReqResMocks();
      await filterByCustomDays(req, res);
      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ message: mockedCatchError.message });
    });

    it("Should filter by custom days", async () => {
      vi.mocked(Transaction.find, true).mockResolvedValue([fakeTransaction]);
      const { req, res } = initializeReqResMocks();
      await filterByCustomDays(req, res);
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual([fakeTransaction]);
    });
  });

  describe("Filter By Custom Months Controller", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("Should return 500 when error is throwed", async () => {
      vi.mocked(Transaction.find, true).mockImplementation(() => {
        throw mockedCatchError;
      });
      const { req, res } = initializeReqResMocks();
      await filterByCustomMonths(req, res);
      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ message: mockedCatchError.message });
    });

    it("Should filter by custom months", async () => {
      vi.mocked(Transaction.find, true).mockResolvedValue([fakeTransaction]);
      const { req, res } = initializeReqResMocks();
      await filterByCustomMonths(req, res);
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual([fakeTransaction]);
    });
  });

  describe("Filter By Custom Years Controller", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("Should return 500 when error is throwed", async () => {
      vi.mocked(Transaction.find, true).mockImplementation(() => {
        throw mockedCatchError;
      });
      const { req, res } = initializeReqResMocks();
      await filterByCustomYears(req, res);
      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ message: mockedCatchError.message });
    });

    it("Should filter by custom years", async () => {
      vi.mocked(Transaction.find, true).mockResolvedValue([fakeTransaction]);
      const { req, res } = initializeReqResMocks();
      await filterByCustomYears(req, res);
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual([fakeTransaction]);
    });
  });
});
