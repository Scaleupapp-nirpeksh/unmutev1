import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  phone: string;
  createdAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    phone: { type: String, unique: true, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", userSchema);