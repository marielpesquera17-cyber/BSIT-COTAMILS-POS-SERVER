import bcrypt from "bcryptjs";
import UserModel from "../models/user.model.js";
import AppError from "../utils/AppError.js";

export const login = async (email, password) => {
  const staff = await UserModel.findByEmail(email);
  if (!staff) throw new AppError("Invalid email or password", 401);

  // const isMatch = password === staff.password;
  const isMatch = await bcrypt.compare(password, staff.password);
  if (!isMatch) throw new AppError("Invalid email or password", 401);

  delete staff.password;
  return staff;
};
