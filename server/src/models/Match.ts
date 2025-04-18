// File: server/src/models/Match.ts
import mongoose, { Schema, Document, Types } from "mongoose";

export interface IMatch extends Document {
  userId: Types.ObjectId;
  matchId: Types.ObjectId;
  score: number;
  lastUpdated: Date;
  // You could add more fields like:
  // - matchStatus: 'pending' | 'accepted' | 'rejected'
  // - commonTopics: string[]
  // - messageCount: number
}

const matchSchema = new Schema<IMatch>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    matchId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    score: { type: Number, required: true, min: 0, max: 1 },
    lastUpdated: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// Create a compound index to ensure each user-match pair is unique
matchSchema.index({ userId: 1, matchId: 1 }, { unique: true });

export const Match = mongoose.model<IMatch>("Match", matchSchema);
export default Match;