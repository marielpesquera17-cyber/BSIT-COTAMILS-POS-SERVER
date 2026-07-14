import asyncHandler from "../utils/asyncHandler.js";
import * as service from "../services/pos.service.js";

export const getAllCarts = asyncHandler(async (req, res) => {
  const staffId = req.staff.staffId;
  const carts = await service.getAllCarts(staffId);
  res.status(200).json({ success: true, data: carts });
});

export const addCartItem = asyncHandler(async (req, res) => {
  const staffId = req.staff.staffId;
  const newAddCart = await service.addCartItem(req.body, staffId);
  res
    .status(200)
    .json({ success: true, message: "Item added to cart", data: newAddCart });
});

export const updateCartItem = asyncHandler(async (req, res) => {
  const { cartItemId } = req.params;
  const { quantity } = req.body;
  const staffId = req.staff.staffId;

  const updatedCartItem = await service.updateCartItem(
    quantity,
    cartItemId,
    staffId,
  );

  res.status(200).json({
    success: true,
    message: "Cart item updated",
    data: updatedCartItem,
  });
});

export const deleteCartItem = asyncHandler(async (req, res) => {
  const { cartItemId } = req.params;
  const { staffId } = req.staff;

  await service.deleteCartItem(cartItemId, staffId);

  res.status(200).json({
    success: true,
    message: "Item removed from cart",
  });
});

export const deleteAllCartItem = asyncHandler(async (req, res) => {
  const { staffId } = req.staff;

  await service.deleteAllCartItem(staffId);

  res.status(200).json({
    success: true,
    message: "Cart cleared",
  });
});

export const updateCartOrderType = asyncHandler(async (req, res) => {
  const { orderType } = req.body;
  const { staffId } = req.staff;

  await service.updateCartOrderType(staffId, orderType);

  res.status(200).json({
    success: true,
    orderType,
  });
});

export const checkoutCart = asyncHandler(async (req, res) => {
  const { staffId } = req.staff;
  const newOrder = await service.checkoutCart(staffId, req.body);

  res.status(200).json({
    success: true,
    message: "Order completed",
    data: newOrder,
  });
});
