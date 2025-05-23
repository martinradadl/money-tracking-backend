import express from "express";
import * as authController from "../controllers/authentication";
import { tokenVerification } from "../middleware/authentication";
import { upload } from "../middleware/file-upload";

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.put(
  "/change-password/:id",
  tokenVerification,
  authController.changePassword
);
router.put(
  "/:id",
  tokenVerification,
  upload.single("avatar"),
  authController.edit
);
router.delete("/:id", tokenVerification, authController.deleteUser);
router.get("/currencies", authController.getCurrencies);
router.get("/timezones", authController.getTimeZones);
router.get(
  "/:id/check-password",
  tokenVerification,
  authController.checkPassword
);
router.get("/forgot-password/:email", authController.forgotPassword);
router.put(
  "/reset-password/:id",
  tokenVerification,
  authController.resetPassword
);

export default router;
