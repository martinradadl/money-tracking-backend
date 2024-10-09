import express from "express";
import * as authController from "../controllers/authentication";
import { tokenVerification } from "../middleware/authentication";

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.put(
  "/:id/change-password",
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

export default router;
