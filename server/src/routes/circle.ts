// server/src/routes/circle.ts
import { Router } from "express";
import { authRequired } from "../middlewares/authMiddleware";
import { joinCircle, circleFeed } from "../controllers/circleController";

const r = Router();
r.get("/:slug/join", authRequired, joinCircle);
r.get("/:slug/feed", authRequired, circleFeed);
export default r;
