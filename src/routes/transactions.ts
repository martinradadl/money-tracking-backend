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
router.get(
  "/:userId/filter/day",
  tokenVerification,
  transactionsController.filterByDay
);
router.get(
  "/:userId/filter/month",
  tokenVerification,
  transactionsController.filterByMonth
);
router.get(
  "/:userId/filter/year",
  tokenVerification,
  transactionsController.filterByYear
);
router.get(
  "/:userId/filter/custom-days",
  tokenVerification,
  transactionsController.filterByCustomDays
);
router.get(
  "/:userId/filter/custom-months",
  tokenVerification,
  transactionsController.filterByCustomMonths
);
router.get(
  "/:userId/filter/custom-years",
  tokenVerification,
  transactionsController.filterByCustomYears
);

export default router;
