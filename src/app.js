import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { createServer } from "http";
import { Server } from "socket.io";

import { errorHandler, notFound } from "./middlewares/error.middleware.js";

import socketHandler from "./utils/socketHandler.js";
import ENV from "./utils/env.js";

import authRoutes from "./routes/auth.route.js";
import dashboardRoutes from "./routes/dashboard.route.js";
import posRoutes from "./routes/pos.route.js";
import menuRoutes from "./routes/menu.route.js";
import inventoryRoutes from "./routes/inventory.route.js";
import staffRoutes from "./routes/staff.route.js";
import orderRoutes from "./routes/order.route.js";

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: ENV.url,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  },
});

app.use(cors({ origin: ENV.url, credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.set("io", io);

// HEALTH CHECK
app.get(`/`, (req, res) => res.send(`COTAMILA POS SERVER IS READY`));

// ROUTES
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/pos", posRoutes);
app.use("/api/v1/menu", menuRoutes);
app.use("/api/v1/inventory", inventoryRoutes);
app.use("/api/v1/staff", staffRoutes);
app.use("/api/v1/orders", orderRoutes);

socketHandler(io);

// ERROR MIDDLEWARES
app.use(notFound);
app.use(errorHandler);

export default httpServer;
