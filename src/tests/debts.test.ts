import { afterEach, describe, expect, it, vi } from "vitest";
import {
  create,
  deleteOne,
  edit,
  getAll,
  getBalance,
} from "../controllers/debts";
import { Debt } from "../models/debt";
import {
  defaultGetAllQueryObject,
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
