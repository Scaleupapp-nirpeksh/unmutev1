// server/src/routes/vent.ts
import { Router } from "express";
import {
  createVent,
  getVents,
  getVentById,
  reactToVent,
  commentOnVent,
  deleteVent,
  reportVent
} from "../controllers/ventController";
import { authRequired } from "../middlewares/authMiddleware";

const router = Router();

// public: create a vent
router.post("/", authRequired, createVent);

// list & filtering
router.get("/", authRequired, getVents);

// single vent detail
router.get("/:ventId", authRequired, getVentById);

// reactions
router.post("/:ventId/react",    authRequired, reactToVent);

// comments
router.post("/:ventId/comment",  authRequired, commentOnVent);

// delete (soft)
router.delete("/:ventId",        authRequired, deleteVent);

// report
router.post("/:ventId/report",   authRequired, reportVent);

// **This line makes it a module that can be `import default`ed**
export default router;
