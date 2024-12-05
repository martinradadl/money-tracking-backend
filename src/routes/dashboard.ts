import express from "express";
import * as dashboardController from "../controllers/dashboard";
import { tokenVerification } from "../middleware/authentication";

const router = express.Router();

router.get(
  "/balance/:userId",
  tokenVerification,
  dashboardController.getTotalBalance
);

export default router;
