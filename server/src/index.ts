/**
 * File: server/src/index.ts
 * Entry point: wire up express, Mongo, socket.io and all routers
 */

import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import http from "http";
import mongoose from "mongoose";
import { Server as SocketServer } from "socket.io";

// ESM default‐exports for each router:
import authRoutes from "./routes/auth";
import ventRoutes from "./routes/vent";
import circleRoutes from "./routes/circle";
import buddyRoutes from "./routes/buddy";
import userRoutes from "./routes/user";
import journalRoutes from "./routes/journal"; // NEW
import matchRoutes from "./routes/match";     // NEW

// Auth middleware
import { authRequired } from "./middlewares/authMiddleware";

const app = express();
const server = http.createServer(app);
export const io = new SocketServer(server, { cors: { origin: "*" } });

// Global middleware
app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (_req, res) => res.json({ status: "ok" }));

// Public routes
app.use("/auth", authRoutes);

// Protected resources
app.use("/vent", authRequired, ventRoutes);
app.use("/circle", authRequired, circleRoutes);
app.use("/buddy", authRequired, buddyRoutes);
app.use("/user", authRequired, userRoutes);
app.use("/journal", authRequired, journalRoutes); // NEW
app.use("/match", authRequired, matchRoutes);     // NEW

// Example "who am I" endpoint
app.get("/me", authRequired, (req, res) => {
  res.json({ userId: (req.user as any).userId });
});

// Connect to MongoDB & start HTTP+Socket.IO server
const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
  console.error("❌  MONGO_URI missing");
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
    console.error("❌  Mongo connection error:", err);
    process.exit(1);
  });