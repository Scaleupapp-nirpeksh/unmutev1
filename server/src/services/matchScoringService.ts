// File: server/src/services/matchScoringService.ts
import { Types } from "mongoose";
import { JournalEntry, IJournalEntry } from "../models/Journal";
import UserModel from "../models/User";
import { Match } from "../models/Match";
import pineconeService from "./pineconeService";

// This interface extends IJournalEntry with the analysis property
interface IJournalEntryWithAnalysis extends IJournalEntry {
  analysis?: {
    sentiment: "Positive" | "Neutral" | "Negative";
    emotions: string[];
    keyTopics: string[];
  };
}

/**
 * Update match scores for a user based on their journal entries.
 * Compares keyTopics and tags with other users to find best matches.
 * Uses a combination of content similarity and vector similarity from Pinecone.
 */
export async function updateMatchesForUser(userId: Types.ObjectId): Promise<void> {
  try {
    // Fetch recent analyzed entries
    const entries = await JournalEntry.find({ 
      userId, 
      "analysis.keyTopics": { $exists: true },
      useForMatching: true // Only use entries marked for matching
    }).lean();
    
    if (entries.length === 0) {
      console.log(`No matching entries found for user ${userId}`);
      return;
    }

    const userTopics = new Set<string>();
    
    // Extract all topics from the user's entries
    entries.forEach(e => {
      const entryWithAnalysis = e as unknown as IJournalEntryWithAnalysis;
      entryWithAnalysis.analysis?.keyTopics.forEach((t: string) => userTopics.add(t));
    });

    // Fetch all other users
    const otherUsers = await UserModel.find({ _id: { $ne: userId } }).lean();

    if (otherUsers.length === 0) {
      console.log("No other users found for matching");
      return;
    }

    // Compute content similarity scores
    const contentScores: Map<string, number> = new Map();
    
    for (const other of otherUsers) {
      const otherEntries = await JournalEntry.find({ 
        userId: other._id, 
        "analysis.keyTopics": { $exists: true },
        useForMatching: true
      }).lean();
      
      if (otherEntries.length === 0) continue;
      
      const otherTopics = new Set<string>();
      
      otherEntries.forEach(e => {
        const entryWithAnalysis = e as unknown as IJournalEntryWithAnalysis;
        entryWithAnalysis.analysis?.keyTopics.forEach((t: string) => otherTopics.add(t));
      });

      // Calculate Jaccard similarity (intersection over union)
      const intersection = [...userTopics].filter(t => otherTopics.has(t)).length;
      const union = new Set([...userTopics, ...otherTopics]).size;
      const similarity = union > 0 ? intersection / union : 0;

      contentScores.set(other._id.toString(), similarity);
    }

    // Try to get vector similarity from Pinecone if available
    let vectorScores: Map<string, number> = new Map();
    try {
      const userVector = await pineconeService.fetchUserVector(userId.toString());
      
      if (userVector.length > 0) {
        const similarUsers = await pineconeService.querySimilar(userVector, 20);
        
        similarUsers.forEach(match => {
          vectorScores.set(match.uid, match.score);
        });
      }
    } catch (error) {
      console.error("Error fetching vector similarity:", error);
      // Continue with just content similarity if vector similarity fails
    }

    // Combine scores: 70% content similarity, 30% vector similarity (if available)
    const combinedScores: { otherId: string; score: number; objectId: Types.ObjectId }[] = [];
    
    for (const other of otherUsers) {
      const otherId = other._id.toString();
      const contentScore = contentScores.get(otherId) || 0;
      const vectorScore = vectorScores.get(otherId) || 0;
      
      // Weight: 70% content, 30% vector (if vector data exists)
      const hasVectorData = vectorScores.size > 0;
      const finalScore = hasVectorData
        ? (contentScore * 0.7) + (vectorScore * 0.3)
        : contentScore;
        
      combinedScores.push({ 
        otherId, 
        score: finalScore,
        objectId: new Types.ObjectId(otherId)
      });
    }

    // Sort and keep top 10
    combinedScores.sort((a, b) => b.score - a.score);
    const top = combinedScores.slice(0, 10);

    // Only keep matches with some similarity
    const meaningfulMatches = top.filter(match => match.score > 0.1);

    // Upsert matches
    await Match.deleteMany({ userId });
    
    if (meaningfulMatches.length) {
      const docs = meaningfulMatches.map(({ objectId, score }) => ({ 
        userId, 
        matchId: objectId, // Using the proper ObjectId here
        score,
        lastUpdated: new Date()
      }));
      
      await Match.insertMany(docs);
      console.log(`Created ${docs.length} matches for user ${userId}`);
    } else {
      console.log(`No meaningful matches found for user ${userId}`);
    }
  } catch (error) {
    console.error(`Error updating matches for user ${userId}:`, error);
    throw error;
  }
}