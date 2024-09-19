import express from "express";
import * as transactionsController from "../controllers/transactions";

const router = express.Router();

router.get("/categories", transactionsController.getCategories);
router.get("/balance/:userId", transactionsController.getBalance);
router.get("/:userId", transactionsController.getAll);
router.post("/", transactionsController.create);
router.put("/:id", transactionsController.edit);
router.delete("/:id", transactionsController.deleteOne);

export default router;
