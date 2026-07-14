import express from "express";
import verifyToken from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  addCartItemValidation,
  checkoutCartValidation,
  updateCartItemValidation,
} from "../validations/pos.validation.js";
import * as controller from "../controllers/pos.controller.js";

const router = express.Router();

router.get("/cart", verifyToken, controller.getAllCarts);
router.post(
  "/cart/items",
  verifyToken,
  validate(addCartItemValidation),
  controller.addCartItem,
);
router.put(
  "/cart/items/:cartItemId",
  verifyToken,
  validate(updateCartItemValidation),
  controller.updateCartItem,
);
router.delete(
  "/cart/items/:cartItemId",
  verifyToken,
  controller.deleteCartItem,
);
router.delete("/cart", verifyToken, controller.deleteAllCartItem);
router.patch(
  "/cart/order-type",
  verifyToken,
  validate(updateCartItemValidation),
  controller.updateCartOrderType,
);
router.post(
  "/checkout",
  verifyToken,
  validate(checkoutCartValidation),
  controller.checkoutCart,
);

export default router;
