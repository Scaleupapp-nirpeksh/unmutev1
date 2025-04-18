// File: server/src/models/Vent.ts
import { Schema, model, Document, Types } from 'mongoose';

export interface IVent extends Document {
  userId: Types.ObjectId;
  title: string;
  content: string;
  tags: string[];
  allowComments: boolean;
  isDeleted: boolean;
  reactions: { userId: Types.ObjectId; reactionType: string; reactedAt: Date }[];
  comments: { userId: Types.ObjectId; content: string; createdAt: Date }[];
  createdAt: Date;
}

const VentSchema = new Schema<IVent>(
  {
    userId:     { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title:      { type: String, required: true },
    content:    { type: String, required: true },
    tags:       { type: [String], default: [] },
    allowComments: { type: Boolean, default: true },
    isDeleted:  { type: Boolean, default: false },
    reactions:  [
      {
        userId:       { type: Schema.Types.ObjectId, ref: 'User', required: true },
        reactionType: { type: String, required: true, enum: ['supportive','same','hugs','heart','notAlone'] },
        reactedAt:    { type: Date, default: Date.now }
      }
    ],
    comments:   [
      {
        userId:    { type: Schema.Types.ObjectId, ref: 'User', required: true },
        content:   { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Vent = model<IVent>('Vent', VentSchema);
