import { afterEach, describe, expect, it, vi } from "vitest";
import { Transaction } from "../../models/transaction";
import { fakeObjectId, mockedCatchError } from "../utils";
import {
  fakeAggregates,
  fakeAggregates2,
  fakeTransaction,
  fakeTransaction2,
} from "../fake-data/transactions";
import { calculateSumByTpe } from "../../helpers/transactions";

vi.mock("../../models/transaction.ts");

describe("Transactions Helpers", () => {
  describe("Calculate Sum By Type Controller", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("should return error", async () => {
      vi.mocked(Transaction.aggregate, true).mockImplementation(() => {
        throw mockedCatchError;
      });
      const result = await calculateSumByTpe(fakeObjectId.toString(), true);
      expect(result).toEqual(mockedCatchError);
    });

    it("Should calculate sum of incomes or expenses", async () => {
      vi.mocked(Transaction.aggregate, true).mockResolvedValue(fakeAggregates);
      const result = await calculateSumByTpe(fakeObjectId.toString(), true);
      expect(result).toEqual(fakeTransaction.amount);
    });

    it("Should calculate sum of incomes or expenses when given an start and end date", async () => {
      vi.mocked(Transaction.aggregate, true).mockResolvedValue(fakeAggregates2);
      const result = await calculateSumByTpe(
        fakeObjectId.toString(),
        true,
        new Date(),
        new Date()
      );

      expect(result).toEqual(fakeTransaction2.amount);
    });
  });
});
