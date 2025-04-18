// server/src/models/Circle.ts   – topic-based support groups
import mongoose, { Schema, Document } from "mongoose";

export interface ICircle extends Document {
  slug: string;         // "breakups", "burnout"…
  title: string;        // human‑readable
  desc: string;
}

const circleSchema = new Schema<ICircle>({
  slug: { type: String, unique: true },
  title: String,
  desc: String,
});

export default mongoose.model<ICircle>("Circle", circleSchema);
