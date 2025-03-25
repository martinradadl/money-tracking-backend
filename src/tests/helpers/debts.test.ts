import { afterEach, describe, expect, it, vi } from "vitest";
import { Debt } from "../../models/debt";
import { fakeObjectId, mockedCatchError } from "../utils";
import { fakeAggregates, fakeDebt } from "../fake-data/debts";
// import { calculateSumByTpe, getSumByDate } from "../../helpers/debts";
import * as debtsHelpers from "../../helpers/debts";

vi.mock("../../models/debt.ts");
vi.mock("../../helpers/movements.ts");

describe("Debts Helpers", () => {
  describe("Calculate Sum By Type Controller", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("should return error", async () => {
      vi.mocked(Debt.aggregate, true).mockImplementation(() => {
        throw mockedCatchError;
      });
      const result = await debtsHelpers.calculateSumByTpe(
        fakeObjectId.toString(),
        true
      );
      expect(result).toEqual(mockedCatchError);
    });

    it("Should calculate sum of incomes or expenses", async () => {
      vi.mocked(Debt.aggregate, true).mockResolvedValue(fakeAggregates);
      const result = await debtsHelpers.calculateSumByTpe(
        fakeObjectId.toString(),
        true
      );
      expect(result).toEqual(fakeDebt.amount);
    });
  });

  // describe("Get Sum By Date Controller", () => {
  //   afterEach(() => {
  //     vi.restoreAllMocks();
  //   });

  //   vi.mock("../../helpers/debts", async (importOriginal) => {
  //     return {
  //       ...(await importOriginal<typeof import("../../helpers/debts")>()),
  //       calculateSumByTpe: () => "mocked",
  //     };
  //   });

  //   it("should return error", async () => {
  //     const result = await debtsHelpers.getSumByDate({
  //       userId: fakeObjectId.toString(),
  //       isTotalLoans: true,
  //     });
  //     expect(result).toEqual(mockedCatchError);
  //   });
  // });
});
