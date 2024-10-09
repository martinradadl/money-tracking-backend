import { afterEach, describe, expect, it, vi } from "vitest";
import {
  create,
  deleteOne,
  edit,
  getAll,
  getBalance,
} from "../controllers/transactions";
import { Transaction } from "../models/transaction";
import { initializeReqResMocks, mockedCatchError } from "./utils";

vi.mock("../models/transaction.ts");
vi.mock("../models/category.ts");

const fakeTransaction = {
  _id: "fakeId",
  type: "income",
  concept: "fakeConcept",
  amount: 100,
  category: "fakeCategory",
  userId: "fakeUserId",
};

const fakeAggregates = [{ _id: null, balance: fakeTransaction.amount }];

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
      //@ts-expect-error Unsolved error with mockImplementation function
      vi.mocked(Transaction.find, true).mockImplementation(() => {
        return { populate: () => [fakeTransaction] };
      });
      const { req, res } = initializeReqResMocks();
      await getAll(req, res);
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual([fakeTransaction]);
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
});
