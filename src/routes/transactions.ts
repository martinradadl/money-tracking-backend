import express from "express";

const router = express.Router();


const transactionsController = require("../controllers/transactions");

// import * as transactionsController from "../controllers/transactions";





router.get("/transactions", transactionsController.getTransactions);

router.post("/transactions", transactionsController.postTransaction);

router.get("/transactions/:id", transactionsController.getTransaction);

router.put("/transactions/:id", transactionsController.updateTransaction);

router.delete("/transactions/:id", transactionsController.deleteTransaction);