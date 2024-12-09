import express from "express";
import * as debtsController from "../controllers/debts";
import { tokenVerification } from "../middleware/authentication";

const router = express.Router();

router.get("/balance/:userId", tokenVerification, debtsController.getBalance);
router.get(
    "/balance/loans/:userId",
    tokenVerification,
    debtsController.getTotalLoans
  );
  router.get(
    "/balance/debts/:userId",
    tokenVerification,
    debtsController.getTotalDebts
  );
router.get("/:userId", tokenVerification, debtsController.getAll);
router.post("/", tokenVerification, debtsController.create);
router.put("/:id", tokenVerification, debtsController.edit);
router.delete("/:id", tokenVerification, debtsController.deleteOne);

export default router;
