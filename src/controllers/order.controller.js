import asyncHandler from "../utils/asyncHandler.js";
import * as service from "../services/order.service.js";

export const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await service.getAllOrders(req.query);
  res.status(200).json({ success: true, data: orders });
});

export const getOrderDetails = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const order = await service.getOrderDetails(orderId);
  res.status(200).json({ success: true, data: order });
});
