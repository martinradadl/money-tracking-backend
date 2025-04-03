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

export default router;
