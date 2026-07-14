import asyncHandler from "../utils/asyncHandler.js";
import * as service from "../services/auth.service.js";
import generateTokenAndSetCookies from "../utils/generateTokenAndSetCookies.js";
import ENV from "../utils/env.js";

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const staff = await service.login(email, password);

  const token = generateTokenAndSetCookies(staff.staffId, res);

  res.status(200).json({
    success: true,
    message: "Login successfully",
    data: {
      token,
      staff,
    },
  });
});

export const logout = asyncHandler(async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: ENV.server.node_env === "production",
    sameSite: "strict",
  });

  res.status(200).json({ success: true, message: "Logged out successfully" });
});

export const me = asyncHandler(async (req, res) => {
  const staff = req.staff;
  res.status(200).json({ success: true, data: staff });
});
