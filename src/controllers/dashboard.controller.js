import asyncHandler from "../utils/asyncHandler.js";
import * as service from "../services/dashboard.service.js";

export const getKPIS = asyncHandler(async (req, res) => {
  const kpis = await service.getKPIS();
  res.status(200).json({ success: true, data: kpis });
});

export const getDailyRevenue = asyncHandler(async (req, res) => {
  const dailyRevenue = await service.getDailyRevenue();
  res.status(200).json({ success: true, data: dailyRevenue });
});

export const getPeakHours = asyncHandler(async (req, res) => {
  const peakHours = await service.getPeakHours();
  res.status(200).json({ success: true, data: peakHours });
});

export const getCategoryRevenue = asyncHandler(async (req, res) => {
  const categoryRevenue = await service.getCategoryRevenue();
  res.status(200).json({ success: true, data: categoryRevenue });
});

export const getBestSeller = asyncHandler(async (req, res) => {
  const bestSeller = await service.getBestSeller();
  res.status(200).json({ success: true, data: bestSeller });
});
