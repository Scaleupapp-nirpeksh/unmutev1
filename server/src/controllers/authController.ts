/**
 * File: server/src/controllers/authController.ts
 * Handles OTP sending, verification, user creation, and JWT issuance.
 */

import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User, { IUser } from "../models/User";
import { sendOTP, checkOTP } from "../services/twilioService";

// Utility: generate a friendly, readable default username
const adjectives = [
  'Peaceful','Hopeful','Serene','Cheerful','Bright','Gentle','Joyful','Calm','Radiant','Lively',
  'Tranquil','Mellow','Blissful','Uplifting','Harmonious','Zen','Balanced','Soothing','Rejuvenated','Ethereal'
];
const nouns = [
  'Sunrise','Butterfly','Rainbow','Breeze','Meadow','Blossom','Oasis','Harmony','Star','Wave',
  'Garden','Spirit','Journey','Solace','Haven','Paradise','Aura','Cloud','Dawn','Serenity'
];
function generateReadableUsername(): string {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num  = Math.floor(Math.random() * 100);
  return `${adj}${noun}${num}`;
}

// POST /auth/request-otp
export async function requestOTP(req: Request, res: Response) {
  const { phone } = req.body as { phone?: string };
  if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
    return res.status(400).json({ success: false, message: "Invalid phone number" });
  }

  try {
    // TODO: Enforce per‑phone rate limiting here
    await sendOTP(phone);
    return res.status(200).json({ success: true, message: "OTP sent" });
  } catch (error) {
    console.error("Twilio sendOTP error:", error);
    return res.status(502).json({ success: false, message: "otp_send_failed" });
  }
}

// POST /auth/verify-otp
export async function verifyOTP(req: Request, res: Response) {
  const { phone, code } = req.body as { phone?: string; code?: string };
  if (!phone || !code) {
    return res.status(400).json({ success: false, message: "phone & code required" });
  }

  try {
    const ok = await checkOTP(phone, code);
    if (!ok) {
      return res.status(401).json({ success: false, message: "Invalid code" });
    }

    // find‑or‑create
    let user = await User.findOne({ phone });
    let isNewUser = false;
    if (!user) {
      isNewUser = true;
      const username = generateReadableUsername();
      user = await User.create({ phone, username });
    }

    const token = jwt.sign(
      { userId: user._id, phone: user.phone },
      process.env.JWT_SECRET!,
      { expiresIn: "30d" }
    );

    return res.status(200).json({
      success: true,
      message: "OTP verified",
      token,
      user,
      isNewUser
    });
  } catch (error) {
    console.error("Twilio verifyOTP error:", error);
    return res.status(502).json({ success: false, message: "otp_verify_failed" });
  }
}
