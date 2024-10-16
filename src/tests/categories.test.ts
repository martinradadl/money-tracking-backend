import { afterEach, describe, expect, it, vi } from "vitest";
import { getCategories } from "../controllers/categories";
import { Category } from "../models/category";
import { initializeReqResMocks, mockedCatchError } from "./utils";

vi.mock("../models/category.ts");

const fakeCategories = [{ _id: "fakeId", label: "fakeLabel" }];

describe("Get Categories Controller", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should return 500 when error is throwed", async () => {
    vi.mocked(Category.find, true).mockImplementation(() => {
      throw mockedCatchError;
    });
    const { req, res } = initializeReqResMocks();
    await getCategories(req, res);
    expect(res.statusCode).toBe(500);
    expect(res._getJSONData()).toEqual({ message: mockedCatchError.message });
  });

  it("Should Get Categories", async () => {
    vi.mocked(Category.find, true).mockResolvedValue(fakeCategories);
    const { req, res } = initializeReqResMocks();
    await getCategories(req, res);
    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toEqual(fakeCategories);
  });
});
