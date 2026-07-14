import { z } from "zod";

export const addCartItemValidation = z.object({
  itemId: z.number().int().positive(),
  variantId: z.number().int().positive(),
  quantity: z.number().int().positive().min(1),
});

export const updateCartItemValidation = z.object({
  quantity: z.number().int().min(1),
});

export const updateCartOrderTypeValidation = z.object({
  orderType: z.enum(["Dine In", "Take Out"]),
});

export const checkoutCartValidation = z.object({
  paymentMethod: z.enum(["Cash", "Card", "GCash"]),
  amountReceived: z.number().min(1),
});
