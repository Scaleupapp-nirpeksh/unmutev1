// server/src/controllers/buddyController.ts   – top‑K similar users
import { Request, Response } from "express";
import pinecone from "../services/pineconeService";

export async function buddySuggestions(req: Request, res: Response) {
  const { uid } = req.user as any;
  const vector = await pinecone.fetchUserVector(uid);
  const sims = await pinecone.querySimilar(vector, 20);
  res.json(sims); // [{uid, score}]
}
