import express from "express";
import * as authController from "../controllers/authentication";

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.register);
router.put("/:id", authController.edit)

export default router;
