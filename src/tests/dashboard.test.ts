import { afterEach, describe, expect, it, vi } from "vitest";
import { initializeReqResMocks, mockedCatchError } from "./utils";
import { getTotalBalance } from "../controllers/dashboard";
import { Debt } from "../models/debt";
import { Transaction } from "../models/transaction";
import {
  fakeDebt,
  fakeAggregates as fakeDebtsAggregates,
} from "./fake-data/debts";
import { fakeAggregates, fakeTransaction } from "./fake-data/transactions";

vi.mock("../models/transaction.ts");
vi.mock("../models/debt.ts");

describe("Dashboard Controller", () => {
  describe("Get Total Balance Controller", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("should return 500 when error is throwed", async () => {
      vi.mocked(Debt.aggregate, true).mockImplementation(() => {
        throw mockedCatchError;
      });
      vi.mocked(Transaction.aggregate, true).mockImplementation(() => {
        throw mockedCatchError;
      });
      const { req, res } = initializeReqResMocks();
      await getTotalBalance(req, res);
      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ message: mockedCatchError.message });
    });

    it("Should Get Total Balance", async () => {
      vi.mocked(Debt.aggregate, true).mockResolvedValue(fakeDebtsAggregates);
      vi.mocked(Transaction.aggregate, true).mockResolvedValue(fakeAggregates);
      const { req, res } = initializeReqResMocks();
      await getTotalBalance(req, res);
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(
        fakeDebt.amount + fakeTransaction.amount
      );
    });
  });
});
