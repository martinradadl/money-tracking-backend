import express from "express";
import * as transactionsController from "../controllers/transactions";

const router = express.Router();

router.get("/", transactionsController.getAll);
router.post("/", transactionsController.create);
router.put("/:id", transactionsController.edit);
router.delete("/:id", transactionsController.deleteMany);

export default router;
