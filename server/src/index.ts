import express from "express";
import cors from "cors";
import http from "http";
import { Server as SocketServer } from "socket.io";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";

dotenv.config();

const app = express();
const server = http.createServer(app);
export const io = new SocketServer(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());

app.get("/health", (_, res) => res.json({ status: "ok" }));
app.use("/auth", authRoutes);

mongoose.connect(process.env.MONGO_URI!).then(() => {
  console.log("MongoDB connected");
  const port = process.env.PORT || 4000;
  server.listen(port, () => console.log(`API listening on ${port}`));
});