// server/src/models/Vent.ts   — patch fixes ObjectId typing
import mongoose, { Schema, Document, Types } from "mongoose";

export interface IVent extends Document {
  uid: Types.ObjectId;   // <- use ObjectId, not string
  text: string;
  emo: string;
  score: number;
  createdAt: Date;
}

const ventSchema = new Schema<IVent>(
  {
    uid: { type: Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true, maxlength: 500 },
    emo: { type: String, required: true },
    score: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IVent>("Vent", ventSchema);
