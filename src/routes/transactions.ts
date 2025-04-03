import express from "express";
import * as transactionsController from "../controllers/transactions";
import { tokenVerification } from "../middleware/authentication";

const router = express.Router();

router.get(
  "/:userId/balance/income",
  tokenVerification,
  transactionsController.getTotalIncome
);
router.get(
  "/:userId/balance/expenses",
  tokenVerification,
  transactionsController.getTotalExpenses
);
router.get("/:userId", tokenVerification, transactionsController.getAll);
router.post("/", tokenVerification, transactionsController.create);
router.put("/:id", tokenVerification, transactionsController.edit);
router.delete("/:id", tokenVerification, transactionsController.deleteOne);

export default router;
