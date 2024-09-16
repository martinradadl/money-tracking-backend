import express from "express";
import * as authController from "../controllers/authentication";
import { tokenVerification } from "../middleware/authentication";

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.register);
router.put("/:id", tokenVerification ,authController.edit)

export default router;
