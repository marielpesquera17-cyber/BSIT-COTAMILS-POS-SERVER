import express from "express";
import * as controller from "../controllers/dashboard.controller.js";
import verifyToken from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/kpis", verifyToken, controller.getKPIS);
router.get("/revenue/daily", verifyToken, controller.getDailyRevenue);
router.get("/peak-hours", verifyToken, controller.getPeakHours);
router.get("/category-revenue", verifyToken, controller.getCategoryRevenue);
router.get("/best-seller", verifyToken, controller.getBestSeller);

export default router;
