import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { sendOTP, checkOTP } from "../services/twilioService";

export async function requestOTP(req: Request, res: Response) {
  const { phone } = req.body as { phone?: string };
  console.log("REQUEST OTP =>", phone);
  if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
    return res.status(400).json({ error: "invalid phone" });
  }

  try {
    await sendOTP(phone);
    return res.json({ sent: true });
  } catch (e) {
    console.error("Twilio sendOTP error", e);
    return res.status(502).json({ error: "otp_send_failed" });
  }
}

export async function verifyOTP(req: Request, res: Response) {
  const { phone, code } = req.body as { phone?: string; code?: string };

  if (!phone || !code) {
    return res.status(400).json({ error: "phone_and_code_required" });
  }

  try {
    const ok = await checkOTP(phone, code);
    if (!ok) return res.status(401).json({ error: "invalid_code" });

    // find‑or‑create user
    let user = await User.findOne({ phone });
    if (!user) user = await User.create({ phone });

    const token = jwt.sign({ uid: user._id }, process.env.JWT_SECRET!, {
      expiresIn: "30d"
    });

    return res.json({ token });
  } catch (e) {
    console.error("Twilio verify error", e);
    return res.status(502).json({ error: "otp_verify_failed" });
  }
}
