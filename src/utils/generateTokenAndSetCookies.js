import jwt from "jsonwebtoken";
import ENV from "./env.js";

const generateTokenAndSetCookies = (userId, res) => {
  const token = jwt.sign({ userId }, ENV.jwt.secret, { expiresIn: "7d" });

  const isProduction = ENV.server.node_env === "production";

  res.cookie("token", token, {
    httpOnly: true,
    secure: isProduction, // Must be true if sameSite is 'none'
    sameSite: isProduction ? "none" : "lax", // 'none' allows cross-domain cookies on Vercel
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return token;
};

export default generateTokenAndSetCookies;