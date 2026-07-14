import asyncHandler from "../utils/asyncHandler.js";
import * as service from "../services/inventory.service.js";

export const getAllInventorys = asyncHandler(async (req, res) => {
  const { search, category } = req.query;

  const inventories = await service.getAllInventorys();
  res.status(200).json({ success: true, data: inventories });
});

export const getAllAlerts = asyncHandler(async (req, res) => {
  const inventoryAlerts = await service.getAllAlerts();
  res.status(200).json({ success: true, data: inventoryAlerts });
});

export const getInventoryDetails = asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  const inventoryItem = await service.getInventoryDetails(itemId);
  res.status(200).json({ success: true, data: inventoryItem });
});

export const createInventoryItem = asyncHandler(async (req, res) => {
  const newItem = await service.createInventoryItem(req.body);
  res.status(200).json({ success: true, data: newItem });
});

export const updateInventoryItem = asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  const updatedInventoryItem = await service.updateInventoryItem(
    itemId,
    req.body,
  );
  res.status(200).json({
    success: true,
    message: "Inventory item updated",
    data: updatedInventoryItem,
  });
});

export const deleteInventoryItem = asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  await service.deleteInventoryItem(itemId);
  res.status(200).json({
    success: true,
    message: "Inventory item deleted",
  });
});

export const restockInventory = asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  const { staffId } = req.staff;
  const updatedInventoryItem = await service.restockInventory(
    itemId,
    staffId,
    req.body,
  );
  res.status(200).json({
    success: true,
    message: "Inventory item updated",
    data: updatedInventoryItem,
  });
});
