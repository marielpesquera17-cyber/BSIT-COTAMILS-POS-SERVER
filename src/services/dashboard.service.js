import OrderModel from "../models/order.model.js";

export const getKPIS = async () => {
  return await OrderModel.kpis();
};

export const getDailyRevenue = async () => {
  return await OrderModel.dailyRevenue();
};

export const getPeakHours = async () => {
  return await OrderModel.peakHours();
};

export const getCategoryRevenue = async () => {
  return await OrderModel.categoryRevenue();
};

export const getBestSeller = async () => {
  return await OrderModel.bestSeller();
};
