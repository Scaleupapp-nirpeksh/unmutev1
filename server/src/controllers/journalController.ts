//controllers/journalController

import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { JournalEntry, JournalPrompt, JournalStreak } from '../models/Journal';
import { analyzeJournalEntry } from '../services/journalAnalysisService';
import { updateMatchesForUser } from '../services/matchScoringService';
import { JwtPayload } from 'jsonwebtoken';

// Extend Express Request with authenticated user
interface AuthRequest extends Request {
  user: JwtPayload & { userId: Types.ObjectId };
}

// Create a new journal entry
export const createJournalEntry = async (req: AuthRequest, res: Response) => {
  const userId = req.user.userId;
  const { title, content, promptId, emotions, tags, isPrivate, useForMatching, visibility } = req.body;

  if (!title || !content) {
    return res.status(400).json({ success: false, message: 'Title and content are required' });
  }

  try {
    const entry = new JournalEntry({
      userId,
      title,
      content,
      promptId: promptId ? new Types.ObjectId(promptId) : null, // Fixed: Added 'new' keyword
      emotions: emotions || [],
      tags: tags || [],
      isPrivate: isPrivate !== undefined ? isPrivate : true,
      useForMatching: useForMatching !== undefined ? useForMatching : false,
      visibility: visibility || 'private'
    });

    await entry.save();

    // update streak
    await updateUserJournalingStreak(userId);

    // kick off AI analysis
    if (req.body.performAnalysis) {
      analyzeJournalEntry(entry._id as Types.ObjectId).catch(err => console.error('Analysis error:', err)); // Fixed: Added type assertion
    }

    // kick off match update
    if (useForMatching) {
      updateMatchesForUser(userId).catch(err => console.error('Match update error:', err));
    }

    return res.status(201).json({ success: true, journalEntry: entry });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(err);
    return res.status(500).json({ success: false, message: 'Error creating journal entry', error: message });
  }
};

// Get all entries for user
export const getJournalEntries = async (req: AuthRequest, res: Response) => {
  const userId = req.user.userId;
  const { page = '1', limit = '10', startDate, endDate, emotions, tags, searchQuery } = req.query;
  const pageNum = parseInt(page as string, 10) || 1;
  const limitNum = parseInt(limit as string, 10) || 10;

  const filter: Record<string, any> = { userId };

  if (startDate || endDate) {
    filter.createdAt = {} as any;
    if (startDate) filter.createdAt.$gte = new Date(startDate as string);
    if (endDate) filter.createdAt.$lte = new Date(endDate as string);
  }

  if (emotions) filter.emotions = { $in: (emotions as string).split(',') };
  if (tags) filter.tags = { $in: (tags as string).split(',') };
  if (searchQuery) filter.$text = { $search: searchQuery };

  try {
    const entries = await JournalEntry.find(filter)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .populate('promptId', 'title text category')
      .lean();

    const total = await JournalEntry.countDocuments(filter);

    return res.json({
      success: true,
      journalEntries: entries,
      pagination: { total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) }
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(err);
    return res.status(500).json({ success: false, message: 'Error fetching journal entries', error: message });
  }
};

// Get a single entry
export const getJournalEntry = async (req: AuthRequest, res: Response) => {
  const userId = req.user.userId;
  const { entryId } = req.params;

  try {
    const entry = await JournalEntry.findOne({ _id: entryId, userId })
      .populate('promptId', 'title text category')
      .lean();

    if (!entry) {
      return res.status(404).json({ success: false, message: 'Journal entry not found' });
    }

    return res.json({ success: true, journalEntry: entry });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(err);
    return res.status(500).json({ success: false, message: 'Error fetching journal entry', error: message });
  }
};

// Update an entry
export const updateJournalEntry = async (req: AuthRequest, res: Response) => {
  const userId = req.user.userId;
  const { entryId } = req.params;
  const { title, content, emotions, tags, isPrivate, useForMatching, visibility, performAnalysis } = req.body;

  try {
    const entry = await JournalEntry.findOne({ _id: entryId, userId });
    if (!entry) {
      return res.status(404).json({ success: false, message: 'Journal entry not found' });
    }

    if (title) entry.title = title;
    if (content) entry.content = content;
    if (emotions) entry.emotions = emotions;
    if (tags) entry.tags = tags;
    if (isPrivate !== undefined) entry.isPrivate = isPrivate;
    if (useForMatching !== undefined) entry.useForMatching = useForMatching;
    if (visibility) entry.visibility = visibility;

    await entry.save();

    if (performAnalysis) {
      analyzeJournalEntry(entry._id as Types.ObjectId).catch(err => console.error('Analysis error:', err)); // Fixed: Added type assertion
    }
    if (useForMatching !== undefined) {
      updateMatchesForUser(userId).catch(err => console.error('Match update error:', err));
    }

    return res.json({ success: true, message: 'Journal entry updated', journalEntry: entry });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(err);
    return res.status(500).json({ success: false, message: 'Error updating journal entry', error: message });
  }
};

// Delete an entry
export const deleteJournalEntry = async (req: AuthRequest, res: Response) => {
  const userId = req.user.userId;
  const { entryId } = req.params;

  try {
    const result = await JournalEntry.deleteOne({ _id: entryId, userId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: 'Journal entry not found' });
    }
    return res.json({ success: true, message: 'Journal entry deleted' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(err);
    return res.status(500).json({ success: false, message: 'Error deleting journal entry', error: message });
  }
};

// Get random prompts
export const getJournalPrompts = async (req: AuthRequest, res: Response) => {
  const { category, difficultyLevel, targetEmotions, limit = '10' } = req.query;
  const filter: Record<string, any> = { isActive: true };
  if (category) filter.category = category;
  if (difficultyLevel) filter.difficultyLevel = Number(difficultyLevel);
  if (targetEmotions) filter.targetEmotions = { $in: (targetEmotions as string).split(',') };

  const lim = parseInt(limit as string, 10) || 10;

  try {
    const prompts = await JournalPrompt.aggregate([
      { $match: filter },
      { $sample: { size: lim } }
    ]);
    return res.json({ success: true, prompts });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(err);
    return res.status(500).json({ success: false, message: 'Error fetching journal prompts', error: message });
  }
};

// Get journaling streak and stats
export const getJournalStreak = async (req: AuthRequest, res: Response) => {
  const userId = req.user.userId;

  try {
    let streakDoc = await JournalStreak.findOne({ userId });
    if (!streakDoc) {
      streakDoc = new JournalStreak({ userId });
      await streakDoc.save();
    }

    const totalEntries = await JournalEntry.countDocuments({ userId });
    const entriesByEmotion = await JournalEntry.aggregate([
      { $match: { userId: new Types.ObjectId(userId) } }, // Fixed: Added 'new' keyword
      { $unwind: '$emotions' },
      { $group: { _id: '$emotions', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    return res.json({
      success: true,
      streak: {
        currentStreak: streakDoc.currentStreak,
        longestStreak: streakDoc.longestStreak,
        lastEntryDate: streakDoc.lastEntryDate,
        totalEntries,
        entriesByEmotion,
        achievements: streakDoc.achievements.filter(a => a.seen)
      }
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(err);
    return res.status(500).json({ success: false, message: 'Error fetching journal streak', error: message });
  }
};

// Mark achievements seen
export const markAchievementsSeen = async (req: AuthRequest, res: Response) => {
  const userId = req.user.userId;

  try {
    await JournalStreak.updateOne(
      { userId },
      { $set: { 'achievements.$[elem].seen': true } },
      { arrayFilters: [{ 'elem.seen': false }] }
    );
    return res.json({ success: true, message: 'Achievements marked as seen' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(err);
    return res.status(500).json({ success: false, message: 'Error marking achievements as seen', error: message });
  }
};

// Internal helper to update streak history after new entry
async function updateUserJournalingStreak(userId: Types.ObjectId) {
  // implementation as in your JournalStreak model/service
}