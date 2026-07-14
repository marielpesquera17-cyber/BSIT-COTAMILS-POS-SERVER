import express from "express";
import verifyToken from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createMenuValidation,
  updateVariantAvailability,
  updateMenuValidation,
} from "../validations/menu.validation.js";
import * as controller from "../controllers/menu.controller.js";

const router = express.Router();

router.get("/categories", verifyToken, controller.getAllMenuCategories);
router.get("/items", verifyToken, controller.getAllMenus);
router.get("/items/:itemId", verifyToken, controller.getMenuDetailes);
router.post(
  "/items",
  verifyToken,
  validate(createMenuValidation),
  controller.createMenu,
);
router.put(
  "/items/:itemId",
  verifyToken,
  validate(updateMenuValidation),
  controller.updatedMenuItem,
);
router.delete("/items/:itemId", verifyToken, controller.deleteItem);
router.patch(
  "/items/:itemId/availability",
  verifyToken,
  validate(updateVariantAvailability),
  controller.updateVariantAvailability,
);

export default router;
