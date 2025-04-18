// File: server/src/routes/match.ts
import { Router } from 'express';
import { authRequired } from '../middlewares/authMiddleware';
import { Types } from 'mongoose';
import { Match } from '../models/Match';
import { updateMatchesForUser } from '../services/matchScoringService';

const router = Router();

// All routes require authentication
router.use(authRequired);

// Get user's matches
router.get('/', async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Find all matches for the user
    const matches = await Match.find({ userId })
      .sort({ score: -1 })
      .populate('matchId', 'username bio interests') // Populate basic user info
      .lean();
    
    return res.json({ success: true, matches });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(err);
    return res.status(500).json({ success: false, message: 'Error fetching matches', error: message });
  }
});

// Manually trigger match recalculation
router.post('/recalculate', async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Start match calculation in background
    updateMatchesForUser(userId)
      .then(() => console.log(`Matches recalculated for user ${userId}`))
      .catch(err => console.error(`Match recalculation error for user ${userId}:`, err));
    
    return res.json({ success: true, message: 'Match recalculation started' });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(err);
    return res.status(500).json({ success: false, message: 'Error starting match recalculation', error: message });
  }
});

// Get details about a specific match
router.get('/:matchId', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { matchId } = req.params;
    
    // Find the match
    const match = await Match.findOne({ 
      userId, 
      matchId: new Types.ObjectId(matchId) 
    }).populate('matchId', 'username bio interests').lean();
    
    if (!match) {
      return res.status(404).json({ success: false, message: 'Match not found' });
    }
    
    return res.json({ success: true, match });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(err);
    return res.status(500).json({ success: false, message: 'Error fetching match details', error: message });
  }
});

export default router;