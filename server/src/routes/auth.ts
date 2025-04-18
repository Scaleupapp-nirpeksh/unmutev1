/**
 * File: server/src/routes/auth.ts
 * Authentication endpoints: request‑otp & verify‑otp.
 */

import { Router } from "express";
import { requestOTP, verifyOTP } from "../controllers/authController";

const router = Router();

// Send OTP to phone
router.post("/request-otp", requestOTP);

// Verify code, issue JWT, return user + isNewUser flag
router.post("/verify-otp", verifyOTP);

export default router;
