import * as categoryModel from "../models/category";
import { Request, Response } from "express";

export const getCategories = async (_: Request, res: Response) => {
  try {
    const categories = await categoryModel.Category.find({});
    return res.status(200).json(categories);
  } catch (err: unknown) {
    if (err instanceof Error) {
      return res.status(500).json({ message: err.message });
    }
  }
};
