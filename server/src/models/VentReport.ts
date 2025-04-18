// File: server/src/models/VentReport.ts
import { Schema, model, Document, Types } from 'mongoose';

export interface IVentReport extends Document {
  ventId: Types.ObjectId;
  userId: Types.ObjectId;
  reason: string;
  status: 'pending' | 'reviewed' | 'dismissed';
  createdAt: Date;
  reviewedAt?: Date;
}

const VentReportSchema = new Schema<IVentReport>(
  {
    ventId:     { type: Schema.Types.ObjectId, ref: 'Vent', required: true },
    userId:     { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reason:     { type: String, required: true },
    status:     { type: String, enum: ['pending','reviewed','dismissed'], default: 'pending' },
    createdAt:  { type: Date, default: Date.now },
    reviewedAt: { type: Date }
  },
  { timestamps: false }
);

export const VentReport = model<IVentReport>('VentReport', VentReportSchema);
