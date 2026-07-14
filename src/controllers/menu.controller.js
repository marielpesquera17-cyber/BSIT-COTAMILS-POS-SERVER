import asyncHandler from "../utils/asyncHandler.js";
import * as service from "../services/menu.service.js";

export const getAllMenuCategories = asyncHandler(async (req, res) => {
  const categories = await service.getAllMenuCategories();
  res.status(200).json({ success: true, data: categories });
});

export const getAllMenus = asyncHandler(async (req, res) => {
  const menuItems = await service.getAllMenus(req.query);
  res.status(200).json({ success: true, data: menuItems });
});

export const getMenuDetailes = asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  const menuItem = await service.getMenuDetailes(itemId);
  res.status(200).json({ success: true, data: menuItem });
});

export const createMenu = asyncHandler(async (req, res) => {
  const newMenuItem = await service.createMenu(req.body);
  res
    .status(200)
    .json({ success: true, message: "Menu item created", data: newMenuItem });
});

export const updatedMenuItem = asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  const updatedMenuItem = await service.updatedMenuItem(itemId, req.body);
  res.status(200).json({
    success: true,
    message: "Menu item updated",
    data: updatedMenuItem,
  });
});

export const deleteItem = asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  await service.deleteItem(itemId);
  res.status(200).json({
    success: true,
    message: "Menu item deleted",
  });
});

export const updateVariantAvailability = asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  const updatedMenuItem = await service.updateVariantAvailability(
    itemId,
    req.body,
  );
  res.status(200).json({
    success: true,
    message: "Variant availability updated",
    data: updatedMenuItem,
  });
});
