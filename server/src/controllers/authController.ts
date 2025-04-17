import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { sendOTP, checkOTP } from "../services/twilioService";

export async function requestOTP(req: Request, res: Response) {
  try {
    const { phone } = req.body as { phone: string };
    if (!phone) return res.status(400).json({ error: "phone required" });
    await sendOTP(phone);
    return res.json({ sent: true });
  } catch (e) {
    return res.status(500).json({ error: "OTP send failed" });
  }
}

export async function verifyOTP(req: Request, res: Response) {
  try {
    const { phone, code } = req.body as { phone: string; code: string };
    const verified = await checkOTP(phone, code);
    if (!verified) return res.status(401).json({ error: "Invalid code" });

    let user = await User.findOne({ phone });
    if (!user) user = await User.create({ phone });

    const token = jwt.sign({ uid: user._id }, process.env.JWT_SECRET!, { expiresIn: "30d" });
    return res.json({ token });
  } catch (e) {
    return res.status(500).json({ error: "Verification failed" });
  }
}