import express from "express";
import * as authController from "../controllers/authentication";
import { tokenVerification } from "../middleware/authentication";

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.put("/:id", tokenVerification, authController.edit);
router.delete("/:id", tokenVerification, authController.deleteUser);

export default router;
