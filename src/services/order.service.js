import OrderModel from "../models/order.model.js";

export const getAllOrders = async (queries) => {
  const { search, status, page = 1 } = queries;
  const limit = page * 10;
  return await OrderModel.findAll(search, status, limit);
};

export const getOrderDetails = async (orderId) => {
  return await OrderModel.findById(orderId);
};
