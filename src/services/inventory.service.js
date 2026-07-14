import db from "../config/db.js";
import InventoryModel from "../models/inventory.model.js";
import AppError from "../utils/AppError.js";

export const getAllInventorys = async (search, category) => {
  return await InventoryModel.findAll(search, category);
};

export const getAllAlerts = async () => {
  return await InventoryModel.findAllAlerts();
};

export const getInventoryDetails = async (itemId) => {
  return await InventoryModel.findById(undefined, itemId);
};

export const createInventoryItem = async (inventoryData) => {
  const { name, categoryId, currentStock, unit, reorderLevel } = inventoryData;

  const categories = await InventoryModel.inventoryCategories();

  const existingCategory = categories.find((c) => c.categoryId === categoryId);
  if (!existingCategory) throw new AppError("Category not found", 404);

  if (currentStock < reorderLevel) {
    throw new AppError("Please check your current stock", 404);
  }

  const newItem = await InventoryModel.createInventoryItem(
    name,
    categoryId,
    currentStock,
    unit,
    reorderLevel,
  );

  return await InventoryModel.findById(undefined, newItem.itemId);
};

export const updateInventoryItem = async (itemId, inventoryData) => {
  const { name, categoryId, currentStock, unit, reorderLevel } = inventoryData;

  const inventoryItem = await InventoryModel.findById(undefined, itemId);
  if (!inventoryItem) throw new AppError("Inventory item not found", 404);

  const categories = await InventoryModel.inventoryCategories();

  const existingCategory = categories.find((c) => c.categoryId === categoryId);
  if (!existingCategory) throw new AppError("Category not found", 404);

  if (currentStock < reorderLevel) {
    throw new AppError("Please checck your current stock", 404);
  }

  const updatedItem = await InventoryModel.findByIdAndUpdate(
    undefined,
    name,
    categoryId,
    currentStock,
    unit,
    reorderLevel,
  );

  return await InventoryModel.findById(undefined, updatedItem.itemId);
};

export const deleteInventoryItem = async (itemId) => {
  const inventoryItem = await InventoryModel.findById(itemId);
  if (!inventoryItem) throw new AppError("Inventory item not found", 404);

  await InventoryModel.findByIdAndDelete(inventoryItem.itemId);
};

export const restockInventory = async (itemId, staffId, inventoryData) => {
  const client = await db.connect();
  try {
    await client.query("BEGIN");

    const { quantity, note } = inventoryData;

    const inventoryItem = await InventoryModel.findById(client, itemId);
    if (!inventoryItem) throw new AppError("Inventory item not found", 404);

    const { name, category, unit, reorderLevel } = inventoryItem;

    if (quantity <= reorderLevel) {
      throw new AppError("Please check your current stock", 404);
    }

    await InventoryModel.findByIdAndUpdate(
      client,
      name,
      category.categoryId,
      quantity,
      unit,
      reorderLevel,
    );

    await InventoryModel.createTransactionInventory(
      client,
      itemId,
      staffId,
      "stock_in",
      quantity,
      note,
    );

    const updatedItem = await InventoryModel.findById(
      client,
      inventoryItem.itemId,
    );

    await client.query("COMMIT");
    return updatedItem;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
