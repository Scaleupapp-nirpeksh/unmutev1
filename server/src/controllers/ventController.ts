// server/src/controllers/ventController.ts   – create + list vents
import Vent from "../models/Vent";
import { Request, Response } from "express";
import { moderateText, detectEmotion } from "../services/aiService";

export async function createVent(req: Request, res: Response) {
  const { text } = req.body as { text?: string };
  if (!text) return res.status(400).json({ error: "text_required" });

  // basic moderation
  if (!(await moderateText(text))) return res.status(400).json({ error: "rejected" });

  const { emo, score } = await detectEmotion(text);

  const vent = await Vent.create({ uid: (req.user as any).uid, text, emo, score });
  res.json({ id: vent._id, emo, score });
}

export async function listVents(req: Request, res: Response) {
  const vents = await Vent.find().sort({ createdAt: -1 }).limit(50).lean();
  res.json(vents.map(v => ({ id: v._id, text: v.text, emo: v.emo, createdAt: v.createdAt })));
}
