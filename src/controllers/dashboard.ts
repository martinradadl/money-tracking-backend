import { calculateBalance } from "./transactions";
import { calculateBalance as calculateDebtsBalance } from "./debts";
import { Request, Response } from "express";
import { ObjectId } from "../mongo-setup";

export const getTotalBalance = async (req: Request, res: Response) => {
  try {
    const transactionsBalance = await calculateBalance(
      new ObjectId(req.params.userId)
    );
    if (transactionsBalance instanceof Error) {
      throw transactionsBalance;
    }

    const debtsBalance = await calculateDebtsBalance(
      new ObjectId(req.params.userId)
    );
    if (debtsBalance instanceof Error) {
      throw debtsBalance;
    }

    return res.status(200).json(transactionsBalance + debtsBalance);
  } catch (err: unknown) {
    if (err instanceof Error) {
      return res.status(500).json({ message: err.message });
    }
  }
};
