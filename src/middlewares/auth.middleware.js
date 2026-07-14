import jwt from "jsonwebtoken";
import ENV from "../utils/env.js";
import AppError from "../utils/AppError.js";
import UserModel from "../models/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";

const verifyToken = asyncHandler(async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) throw new AppError("Unauthorized - No token provided", 401);

  const decoded = jwt.verify(token, ENV.jwt.secret);

  const staff = await UserModel.findById(decoded.userId);
  if (!staff) throw new AppError("Staff not found", 404);

  req.staff = staff;
  next();
});

export default verifyToken;
