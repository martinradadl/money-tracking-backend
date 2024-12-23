import express from "express";
import * as transactionsController from "../controllers/transactions";
import { tokenVerification } from "../middleware/authentication";

const router = express.Router();

router.get(
  "/balance/:userId",
  tokenVerification,
  transactionsController.getBalance
);
router.get(
  "/balance/income/:userId",
  tokenVerification,
  transactionsController.getTotalIncome
);
router.get(
  "/balance/expenses/:userId",
  tokenVerification,
  transactionsController.getTotalExpenses
);
router.get("/:userId", tokenVerification, transactionsController.getAll);
router.post("/", tokenVerification, transactionsController.create);
router.put("/:id", tokenVerification, transactionsController.edit);
router.delete("/:id", tokenVerification, transactionsController.deleteOne);

export default router;
