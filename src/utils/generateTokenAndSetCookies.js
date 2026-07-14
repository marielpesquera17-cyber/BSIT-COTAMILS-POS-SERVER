import jwt from "jsonwebtoken";
import ENV from "./env.js";

const generateTokenAndSetCookies = (userId, res) => {
  const token = jwt.sign({ userId }, ENV.jwt.secret, { expiresIn: "7d" });

  res.cookie("token", token, {
    httpOnly: true,
    secure: ENV.server.node_env === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return token;
};

export default generateTokenAndSetCookies;
