import { calculateBalance } from "./transactions";
import { calculateBalance as calculateDebtsBalance } from "./debts";
import { Request, Response } from "express";

export const getTotalBalance = async (req: Request, res: Response) => {
  try {
    const transactionsBalance = await calculateBalance(req.params.userId);
    if (transactionsBalance instanceof Error) {
      throw transactionsBalance;
    }

    const debtsBalance = await calculateDebtsBalance(req.params.userId);
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
