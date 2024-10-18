import express from "express";
import * as authController from "../controllers/authentication";
import { tokenVerification } from "../middleware/authentication";

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.put(
  "/change-password/:id",
  tokenVerification,
  authController.changePassword
);
router.put("/:id", tokenVerification, authController.edit);
router.delete("/:id", tokenVerification, authController.deleteUser);
router.get("/currencies", authController.getCurrencies);
router.get(
  "/:id/check-password",
  tokenVerification,
  authController.checkPassword
);
router.patch("/forgot-password/:email", authController.forgotPassword);
router.put(
  "/reset-password/:id",
  tokenVerification,
  authController.resetPassword
);

export default router;
