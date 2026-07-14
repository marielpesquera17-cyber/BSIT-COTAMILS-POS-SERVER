import express from "express";
import verifyToken from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  addStaffValidation,
  updateStaffStatusValidation,
  updateStaffValidation,
} from "../validations/staff.validation.js";
import * as controller from "../controllers/staff.controller.js";

const router = express.Router();

router.get("/", verifyToken, controller.getAllStaff);
router.get("/:staffId", verifyToken, controller.getStaffDetails);
router.post(
  "/",
  verifyToken,
  validate(addStaffValidation),
  controller.addStaff,
);
router.put(
  "/:staffId",
  verifyToken,
  validate(updateStaffValidation),
  controller.updateStaff,
);
router.delete("/:staffId", verifyToken, controller.deleteStaff);
router.patch(
  "/:staffId",
  verifyToken,
  validate(updateStaffStatusValidation),
  controller.updateStaffStatus,
);

export default router;
