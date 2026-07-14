import express from "express";
import verifyToken from "../middlewares/auth.middleware.js";
import * as controller from "../controllers/inventory.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createInventoryItemValidator,
  restockInventoryValidation,
  updateInventoryItemValidator,
} from "../validations/inventory.validator.js";

const router = express.Router();

router.get("/", verifyToken, controller.getAllInventorys);
router.get("/alerts", verifyToken, controller.getAllAlerts);
router.get("/:itemId", verifyToken, controller.getInventoryDetails);
router.post(
  "/",
  verifyToken,
  validate(createInventoryItemValidator),
  controller.createInventoryItem,
);
router.put(
  "/:itemId",
  verifyToken,
  validate(updateInventoryItemValidator),
  controller.updateInventoryItem,
);
router.delete("/:itemId", verifyToken, controller.deleteInventoryItem);
router.post(
  "/:itemId/restock",
  verifyToken,
  validate(restockInventoryValidation),
  controller.restockInventory,
);

export default router;
