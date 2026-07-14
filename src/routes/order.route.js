import express from "express";
import * as controller from "../controllers/order.controller.js";
import verifyToken from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", verifyToken, controller.getAllOrders);
router.get("/:orderId", verifyToken, controller.getOrderDetails);

export default router;
