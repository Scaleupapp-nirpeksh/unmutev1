// server/src/controllers/circleController.ts   – join + feed
import Circle from "../models/Circle";
import Vent from "../models/Vent";
import { Request, Response } from "express";

export async function joinCircle(req: Request, res: Response) {
  // in v1 we store nothing – joining just returns circle meta
  const { slug } = req.params;
  const circle = await Circle.findOne({ slug });
  if (!circle) return res.status(404).json({ error: "not_found" });
  res.json(circle);
}

export async function circleFeed(req: Request, res: Response) {
  const { slug } = req.params;
  const vents = await Vent.find({ emo: slug }).sort({ createdAt: -1 }).limit(50).lean();
  res.json(vents);
}
