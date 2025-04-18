// server/src/routes/vent.ts
import { Router } from "express";
import { authRequired } from "../middlewares/authMiddleware";
import { createVent, listVents } from "../controllers/ventController";

const router = Router();


router.get("/", authRequired, listVents);
router.post("/", authRequired, createVent);
export default router;
