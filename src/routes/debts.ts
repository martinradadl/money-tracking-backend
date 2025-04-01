import express from "express";
import * as debtsController from "../controllers/debts";
import { tokenVerification } from "../middleware/authentication";

const router = express.Router();

router.get(
  "/:userId/balance/loans",
  tokenVerification,
  debtsController.getTotalLoans
);
router.get(
  "/:userId/balance/debts",
  tokenVerification,
  debtsController.getTotalDebts
);
router.get("/:userId", tokenVerification, debtsController.getAll);
router.post("/", tokenVerification, debtsController.create);
router.put("/:id", tokenVerification, debtsController.edit);
router.delete("/:id", tokenVerification, debtsController.deleteOne);
router.get(
  "/:userId/filter/day",
  tokenVerification,
  debtsController.filterByDay
);
router.get(
  "/:userId/filter/month",
  tokenVerification,
  debtsController.filterByMonth
);
router.get(
  "/:userId/filter/year",
  tokenVerification,
  debtsController.filterByYear
);
router.get(
  "/:userId/filter/custom-days",
  tokenVerification,
  debtsController.filterByCustomDays
);
router.get(
  "/:userId/filter/custom-months",
  tokenVerification,
  debtsController.filterByCustomMonths
);
router.get(
  "/:userId/filter/custom-years",
  tokenVerification,
  debtsController.filterByCustomYears
);

export default router;
