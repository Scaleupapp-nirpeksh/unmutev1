/**
 * File: server/src/models/User.ts
 * Defines the User schema and TypeScript interface.
 * Fields:
 *  - phone: unique phone number (string)
 *  - username: unique readable handle
 *  - bio, interests, likes, dislikes: optional profile fields
 *  - preferences: free‑form object for future use
 *  - allowComments: whether others can comment on this user’s vents
 *  - timestamps: createdAt, updatedAt
 */

import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  phone: string;
  username: string;
  bio?: string;
  interests?: string[];
  likes?: string[];
  dislikes?: string[];
  preferences?: Record<string, any>;
  allowComments: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    phone: { type: String, unique: true, required: true },
    username: { type: String, unique: true, required: true },
    bio: { type: String, default: "" },
    interests: { type: [String], default: [] },
    likes: { type: [String], default: [] },
    dislikes: { type: [String], default: [] },
    preferences: { type: Schema.Types.Mixed, default: {} },
    allowComments: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", userSchema);
