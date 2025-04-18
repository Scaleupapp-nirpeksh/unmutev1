/**
 * File: server/src/controllers/userController.ts
 * Handlers for changing username, updating profile, and fetching user info.
 */

import type { Request, Response } from "express";
import User from "../models/User";

// POST /user/change-username
export async function changeUsername(req: Request, res: Response) {
  const userId = (req as any).user.userId;
  const { newUsername } = req.body as { newUsername?: string };
  if (!newUsername) {
    return res.status(400).json({ success: false, message: "New username is required" });
  }

  // check availability
  const exists = await User.findOne({ username: newUsername });
  if (exists) {
    return res.status(400).json({ success: false, message: "Username already taken" });
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { username: newUsername },
    { new: true }
  );
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  return res.json({ success: true, message: "Username updated", user });
}

// PUT /user/update-details
export async function updateUserDetails(req: Request, res: Response) {
  const userId = (req as any).user.userId;
  const {
    bio,
    interests,
    likes,
    dislikes,
    preferences,
    allowComments
  } = req.body;

  try {
    const updateFields: any = { bio, interests, likes, dislikes, preferences };
    if (allowComments !== undefined) {
      updateFields.allowComments = allowComments;
    }

    const user = await User.findByIdAndUpdate(userId, updateFields, { new: true });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    return res.json({ success: true, message: "Profile updated", user });
  } catch (error) {
    console.error("Error updating user details:", error);
    return res.status(500).json({ success: false, message: "update_failed" });
  }
}

// GET /user/:userId
export async function getUserDetails(req: Request, res: Response) {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId).select(
      "-phone -preferences" // hide sensitive / internal fields
    );
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    return res.json({ success: true, user });
  } catch (error) {
    console.error("Error fetching user details:", error);
    return res.status(500).json({ success: false, message: "fetch_failed" });
  }
}
