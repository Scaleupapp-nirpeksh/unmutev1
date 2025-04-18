// File: server/src/controllers/ventController.ts

import { Request, Response } from "express";
import { Types } from "mongoose";
import { Vent, IVent } from "../models/Vent";
import { VentReport } from "../models/VentReport";
import { JwtPayload } from "jsonwebtoken";
import { ParsedQs } from "qs";

// 1) Augment Express's Request to carry our `userId`
interface AuthRequest extends Request {
  user: JwtPayload & { userId: Types.ObjectId };
}

// Helper function to safely extract string from Express query values
function getStringValue(value: any): string | undefined {
  if (typeof value === 'string') {
    return value;
  }
  if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'string') {
    return value[0];
  }
  return undefined;
}

// 2) Use AuthRequest everywhere so `req.user.userId` is always defined
export const createVent = async (req: AuthRequest, res: Response) => {
  const { title, content, tags = [], allowComments = true } = req.body;
  if (!title || !content) {
    return res
      .status(400)
      .json({ success: false, message: "Title and content are required" });
  }

  try {
    const vent = await Vent.create({
      userId: req.user.userId,
      title,
      content,
      tags,
      allowComments,
    });
    return res.status(201).json({ success: true, vent });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "Error creating vent", error: message });
  }
};

export const getVents = async (req: AuthRequest, res: Response) => {
  const { page: pageRaw, limit: limitRaw, tag: tagRaw, search: searchRaw } = req.query;

  // Extract safe string values using type assertions
  const pageStr = getStringValue(pageRaw) || "1";
  const limitStr = getStringValue(limitRaw) || "10";
  const tag = getStringValue(tagRaw);
  const search = getStringValue(searchRaw);

  // Parse integers with safe values
  const pageNum = parseInt(pageStr, 10);
  const limitNum = parseInt(limitStr, 10);

  const filter: Record<string, any> = { isDeleted: false };
  if (tag) filter.tags = tag;
  if (search) filter.$text = { $search: search };

  try {
    const vents = await Vent.find(filter)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean<IVent>();

    const total = await Vent.countDocuments(filter);

    return res.json({
      success: true,
      vents,
      pagination: { total, page: pageNum, limit: limitNum, pages: Math.ceil(total/limitNum) },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(err);
    return res.status(500).json({ success: false, message: "Error fetching vents", error: message });
  }
};

export const getVentById = async (req: AuthRequest, res: Response) => {
  const { ventId } = req.params;
  try {
    const vent = await Vent.findById(ventId)
      .populate("comments.userId", "username profilePic")
      .lean<IVent>();

    if (!vent || vent.isDeleted) {
      return res
        .status(404)
        .json({ success: false, message: "Vent not found" });
    }

    // 3) Properly type the reduce callback
    const reactionCounts = (vent.reactions || []).reduce<Record<string, number>>(
      (acc, { reactionType }: { reactionType: string }) => {
        acc[reactionType] = (acc[reactionType] || 0) + 1;
        return acc;
      },
      {}
    );

    return res.json({ success: true, vent, reactionCounts });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "Error fetching vent", error: message });
  }
};

export const reactToVent = async (req: AuthRequest, res: Response) => {
  const { ventId } = req.params;
  const { reactionType } = req.body as { reactionType: string };
  const validReactions = [
    "supportive",
    "same",
    "hugs",
    "heart",
    "notAlone",
  ];

  if (!validReactions.includes(reactionType)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid reaction type" });
  }

  try {
    const vent = await Vent.findById(ventId);
    if (!vent || vent.isDeleted) {
      return res
        .status(404)
        .json({ success: false, message: "Vent not found" });
    }

    // 4) Annotate the find/filter callbacks so TS knows `r`'s shape
    const existing = vent.reactions.find(
      (r: { userId: Types.ObjectId }) =>
        r.userId.equals(req.user.userId)
    );
    if (existing) {
      if (existing.reactionType === reactionType) {
        vent.reactions = vent.reactions.filter(
          (r: { userId: Types.ObjectId }) =>
            !r.userId.equals(req.user.userId)
        );
      } else {
        existing.reactionType = reactionType;
        existing.reactedAt = new Date();
      }
    } else {
      vent.reactions.push({
        userId: req.user.userId,
        reactionType,
        reactedAt: new Date(),
      });
    }

    await vent.save();
    return res.json({ success: true, message: "Reaction updated" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "Error reacting", error: message });
  }
};

export const commentOnVent = async (req: AuthRequest, res: Response) => {
  const { ventId } = req.params;
  const { content } = req.body as { content: string };

  if (!content) {
    return res
      .status(400)
      .json({ success: false, message: "Comment content required" });
  }

  try {
    const vent = await Vent.findById(ventId);
    if (!vent || vent.isDeleted) {
      return res
        .status(404)
        .json({ success: false, message: "Vent not found" });
    }
    if (!vent.allowComments) {
      return res
        .status(403)
        .json({ success: false, message: "Comments are turned off" });
    }

    vent.comments.push({
      userId: req.user.userId,
      content,
      createdAt: new Date(),
    });
    await vent.save();
    return res.status(201).json({ success: true, message: "Comment added" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "Error adding comment", error: message });
  }
};

export const deleteVent = async (req: AuthRequest, res: Response) => {
  const { ventId } = req.params;

  try {
    const vent = await Vent.findById(ventId);
    if (!vent || vent.isDeleted) {
      return res
        .status(404)
        .json({ success: false, message: "Vent not found" });
    }
    if (!vent.userId.equals(req.user.userId)) {
      return res
        .status(403)
        .json({ success: false, message: "Not your vent" });
    }

    vent.isDeleted = true;
    await vent.save();
    return res.json({ success: true, message: "Vent deleted" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "Error deleting vent", error: message });
  }
};

export const reportVent = async (req: AuthRequest, res: Response) => {
  const { ventId } = req.params;
  const { reason } = req.body as { reason: string };

  if (!reason) {
    return res
      .status(400)
      .json({ success: false, message: "Reason is required" });
  }

  try {
    const vent = await Vent.findById(ventId);
    if (!vent || vent.isDeleted) {
      return res
        .status(404)
        .json({ success: false, message: "Vent not found" });
    }

    await VentReport.create({
      ventId,
      userId: req.user.userId,
      reason,
    });
    return res.status(201).json({ success: true, message: "Vent reported" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "Error reporting", error: message });
  }
};