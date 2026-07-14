import cloudinary from "../config/cloudinary.js";
import db from "../config/db.js";
import MenuModel from "../models/menu.model.js";
import AppError from "../utils/AppError.js";
import extractCloudinaryPublicId from "../utils/extractCloudinaryPublicId.js";

export const getAllMenuCategories = async () => {
  return await MenuModel.menuCategories();
};

export const getAllMenus = async (filter) => {
  const { category, search } = filter;
  return await MenuModel.findAll(category, search);
};

export const getMenuDetailes = async (itemId) => {
  return await MenuModel.findById(undefined, itemId);
};

export const createMenu = async (menuData) => {
  const client = await db.connect();
  try {
    const { name, categoryId, description, variants } = menuData;
    let { imageUrl } = menuData;
    await client.query("BEGIN");

    const uploaded = await cloudinary.uploader.upload(imageUrl, {
      folder: "cotamila_menus",
    });
    imageUrl = uploaded.secure_url;

    const newMenu = await MenuModel.createMenu(
      client,
      name,
      categoryId,
      description,
      imageUrl,
    );

    for (const variant of variants) {
      const { label, price } = variant;
      await MenuModel.createMenuVariant(client, newMenu.itemId, label, price);
    }

    const menuItem = await MenuModel.findById(client, newMenu.itemId);

    await client.query("COMMIT");
    return menuItem;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const updatedMenuItem = async (itemId, payload) => {
  const client = await db.connect();
  try {
    const { name, categoryId, description, isActive, variants } = payload;
    let { imageUrl } = payload;

    await client.query("BEGIN");

    const existingItem = await MenuModel.findById(client, itemId);
    if (!existingItem) throw new AppError("Menu item not found", 404);

    const uploaded = await cloudinary.uploader.upload(imageUrl, {
      folder: "cotamila_menus",
    });
    imageUrl = uploaded.secure_url;

    const oldPublicId = extractCloudinaryPublicId(existingItem.imageUrl);
    await cloudinary.uploader.destroy(oldPublicId, { invalidate: true });

    await MenuModel.findByIdAndUpdate(
      client,
      itemId,
      name,
      categoryId,
      description,
      imageUrl,
      isActive,
    );

    await MenuModel.deleteVariant(client, itemId);

    for (const variant of variants) {
      const { label, price } = variant;
      await MenuModel.createMenuVariant(client, itemId, label, price);
    }

    const updatedMenu = await MenuModel.findById(client, itemId);

    await client.query("COMMIT");
    return updatedMenu;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const deleteItem = async (itemId) => {
  const menuItem = await MenuModel.findById(undefined, itemId);
  if (!menuItem) throw new AppError("Menu item not found", 404);

  const oldPublicId = extractCloudinaryPublicId(menuItem.imageUrl);
  await cloudinary.uploader.destroy(oldPublicId, { invalidate: true });

  await MenuModel.findByIdAndDelete(itemId);
};

export const updateVariantAvailability = async (itemId, payload) => {
  const { variantId, isAvailable } = payload;
  const menuItem = await MenuModel.findById(undefined, itemId);
  if (!menuItem) throw new AppError("Menu item not found", 404);

  await MenuModel.updateVariantAvailability(itemId, variantId, isAvailable);

  return await MenuModel.findById(undefined, itemId);
};
