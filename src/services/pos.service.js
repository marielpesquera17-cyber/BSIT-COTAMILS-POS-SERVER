import db from "../config/db.js";
import CartModel from "../models/cart.model.js";
import MenuModel from "../models/menu.model.js";
import OrderModel from "../models/order.model.js";
import AppError from "../utils/AppError.js";
import generateOrderNumber from "../utils/generateOrderNumber.js";

export const getAllCarts = async (staffId) => {
  return await CartModel.findLatestCart(staffId);
};

export const addCartItem = async (cartData, staffId) => {
  const client = await db.connect();
  try {
    await client.query("BEGIN");

    const menuItem = await MenuModel.findById(client, cartData.itemId);
    const variant = menuItem.variants.find(
      (v) => v.variantId === cartData.variantId,
    );
    if (!variant) throw new AppError("Invalid variant", 404);

    let cart = await CartModel.findLatestCart(staffId);
    if (!cart) cart = await CartModel.createCart(client, staffId);

    const subtotal = variant.price * cartData.quantity;
    const { cartItemId } = await CartModel.createCartItem(
      client,
      cart.cartId,
      cartData.itemId,
      cartData.variantId,
      cartData.quantity,
      variant.price,
      subtotal,
    );

    const result = await CartModel.findItemById(client, cartItemId);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const updateCartItem = async (quantity, cartItemId, staffId) => {
  const client = await db.connect();
  try {
    await client.query("BEGIN");

    const cart = await CartModel.findLatestCart(staffId);
    if (!cart) throw new AppError("No active cart found", 404);

    const cartItem = cart.items.find(
      (c) => String(c.cartItemId) === String(cartItemId),
    );
    if (!cartItem) throw new AppError("Cart item not found", 404);

    await CartModel.updateCartItem(client, cartItemId, quantity);

    const updatedCartItem = await CartModel.findItemById(client, cartItemId);

    await client.query("COMMIT");

    return updatedCartItem;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const deleteCartItem = async (cartItemId, staffId) => {
  const cart = await CartModel.findLatestCart(staffId);
  if (!cart) throw new AppError("No active cart found", 404);

  const cartItem = cart.items.find(
    (c) => String(c.cartItemId) === String(cartItemId),
  );
  if (!cartItem) throw new AppError("Cart item not found", 404);

  await CartModel.deleteCartItem(cartItemId);
};

export const deleteAllCartItem = async (staffId) => {
  const cart = await CartModel.findLatestCart(staffId);
  if (!cart) throw new AppError("No active cart found", 404);

  await CartModel.deleteAllCartItems(cart.cartId);
};

export const updateCartOrderType = async (staffId, orderType) => {
  const cart = await CartModel.findLatestCart(staffId);
  if (!cart) throw new AppError("No active cart found", 404);

  await CartModel.updateCartOrderType(cart.cartId, orderType);
};

export const checkoutCart = async (staffId, payload) => {
  const { paymentMethod, amountReceived } = payload;
  const client = await db.connect();
  try {
    await client.query("BEGIN");

    const cart = await CartModel.findLatestCart(staffId);
    
    if (!cart) throw new AppError("No active cart found", 404);
    if (cart.items.length === 0) throw new AppError("Cart is empty", 400);

    const totalAmount = cart.items.reduce(
      (acc, item) => acc + item.subtotal,
      0,
    );

    if (amountReceived < totalAmount) {
      throw new AppError("Insufficient amount received", 402);
    }

    const newOrder = await OrderModel.createOrder(
      client,
      staffId,
      cart.orderType,
      totalAmount,
    );
    

    for (const item of cart.items) {
      const {
        itemId,
        variantId,
        name,
        variantLabel,
        unitPrice,
        quantity,
        subtotal,
      } = item;
      await OrderModel.createOrderItem(
        client,
        newOrder.orderId,
        itemId,
        variantId,
        name,
        variantLabel,
        unitPrice,
        quantity,
        subtotal,
      );
    }

    await OrderModel.createOrderLogs(
      client,
      newOrder.orderId,
      "Completed",
      staffId,
    );

    const changeAmount = amountReceived - totalAmount;
    await OrderModel.createOrderPayment(
      client,
      newOrder.orderId,
      paymentMethod,
      amountReceived,
      changeAmount,
    );

    await CartModel.deleteCart(client, cart.cartId);

    const order = await OrderModel.findOrderById(client, newOrder.orderId);

    await client.query("COMMIT");
    return order;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
