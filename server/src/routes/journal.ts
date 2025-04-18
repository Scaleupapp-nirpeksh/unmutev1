// File: server/src/routes/journal.ts
import { Router } from 'express';
import {
  createJournalEntry,
  getJournalEntries,
  getJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
  getJournalPrompts,
  getJournalStreak,
  markAchievementsSeen
} from '../controllers/journalController';
import { authRequired } from '../middlewares/authMiddleware';

const router = Router();

// All routes require authentication
router.use(authRequired);

// Journal entries
router.post('/', createJournalEntry);
router.get('/', getJournalEntries);
router.get('/:entryId', getJournalEntry);
router.put('/:entryId', updateJournalEntry);
router.delete('/:entryId', deleteJournalEntry);

// Journal prompts
router.get('/prompts/random', getJournalPrompts);

// Streaks and achievements
router.get('/streak/stats', getJournalStreak);
router.post('/streak/achievements/seen', markAchievementsSeen);

export default router;