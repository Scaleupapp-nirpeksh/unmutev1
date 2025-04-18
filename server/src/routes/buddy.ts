// server/src/routes/buddy.ts
import { Router } from "express";
import { authRequired } from "../middlewares/authMiddleware";
import { buddySuggestions } from "../controllers/buddyController";

const r = Router();
r.get("/suggestions", authRequired, buddySuggestions);
export default r;
