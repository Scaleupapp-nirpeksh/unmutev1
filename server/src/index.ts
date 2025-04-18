
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import http from "http";
import mongoose from "mongoose";
import { Server as SocketServer } from "socket.io";

// Require all route modules (grab the default export)
const authRoutes   = require("./routes/auth").default;
const ventRoutes   = require("./routes/vent").default;
const circleRoutes = require("./routes/circle").default;
const buddyRoutes  = require("./routes/buddy").default;

// Require auth middleware
const { authRequired } = require("./middlewares/authMiddleware");

const app    = express();
const server = http.createServer(app);
export const io = new SocketServer(server, { cors: { origin: "*" } });

// Global middleware
app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (_req, res) => res.json({ status: "ok" }));

// Mount routers
app.use("/auth", authRoutes);
app.use("/vent", ventRoutes);
app.use("/circle", circleRoutes);
app.use("/buddy", buddyRoutes);

// Protected sample endpoint
app.get("/me", authRequired, (req, res) => {
  res.json({ uid: (req.user as any).uid });
});

// Connect to MongoDB & start server
const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
  console.error("❌  MONGO_URI missing in .env");
  process.exit(1);
}

mongoose
  .connect(mongoUri)
  .then(() => {
    console.log("✅  MongoDB connected");
    const port = process.env.PORT || 4000;
    server.listen(port, () => console.log(`🚀  Listening on http://localhost:${port}`));
  })
  .catch((err) => {
    console.error("❌  MongoDB connection error:", err);
    process.exit(1);
  });