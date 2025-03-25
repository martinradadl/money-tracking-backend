import { afterEach, describe, expect, it, vi } from "vitest";
import {
  create,
  deleteOne,
  edit,
  getAll,
  getTotalIncome,
  getTotalExpenses,
} from "../controllers/transactions";
import { Transaction } from "../models/transaction";
import {
  defaultGetAllQueryObject,
  initializeReqResMocks,
  mockedCatchError,
} from "./utils";
import {
  fakeTransaction,
  fakeTransactionsList,
  getTransactionsPage,
} from "./fake-data/transactions";
import { getSumByDate } from "../helpers/transactions";

vi.mock("../models/transaction.ts");
vi.mock("../helpers/transactions.ts");

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

  describe("Get Total Income Controller", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("should return 500 when error is throwed", async () => {
      vi.mocked(getSumByDate, true).mockImplementation(() => {
        throw mockedCatchError;
      });
      const { req, res } = initializeReqResMocks();
      await getTotalIncome(req, res);
      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ message: mockedCatchError.message });
    });

    it("Should Get Total Income", async () => {
      vi.mocked(getSumByDate, true).mockResolvedValue(fakeTransaction.amount);
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
      vi.mocked(getSumByDate, true).mockImplementation(() => {
        throw mockedCatchError;
      });
      const { req, res } = initializeReqResMocks();
      await getTotalExpenses(req, res);
      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ message: mockedCatchError.message });
    });

    it("Should Get Total Expenses", async () => {
      vi.mocked(getSumByDate, true).mockResolvedValue(fakeTransaction.amount);
      const { req, res } = initializeReqResMocks();
      await getTotalExpenses(req, res);
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(fakeTransaction.amount);
    });
  });
});
