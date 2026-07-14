import express from "express";
import { validate } from "../middlewares/validate.middleware.js";
import { loginValidation } from "../validations/auth.validation.js";
import * as controller from "../controllers/auth.controller.js";
import verifyToken from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/me", verifyToken, controller.me);
router.post("/login", validate(loginValidation), controller.login);
router.post("/logout", controller.logout);

export default router;
