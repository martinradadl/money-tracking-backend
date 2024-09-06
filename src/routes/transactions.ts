import express from "express";
import * as transactionsController from "../controllers/transactions";

const router = express.Router();

router.get("/:userId", transactionsController.getAll);
router.post("/", transactionsController.create);
router.put("/:id", transactionsController.edit);
router.delete("/:id", transactionsController.deleteOne);
router.get("/categories", transactionsController.getCategories);

export default router;
