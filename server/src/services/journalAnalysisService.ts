// File: server/src/services/journalAnalysisService.ts

import { Types } from "mongoose";
import { JournalEntry, IJournalEntry } from "../models/Journal";
import OpenAI from "openai";

// Create a single OpenAI client instance
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Analyze a journal entry for sentiment, tone, keywords, and topics.
 * Stores the analysis results back into the JournalEntry document.
 */
export async function analyzeJournalEntry(entryId: Types.ObjectId): Promise<void> {
  // Fetch the entry
  const entry = await JournalEntry.findById(entryId);
  if (!entry) throw new Error(`Journal entry ${entryId} not found`);

  // Prepare prompt
  const prompt = `Analyze the following journal entry. \
Return a JSON object with keys: sentiment (Positive/Neutral/Negative), emotions (array of emotions), keyTopics (array of topics).

Entry:
${entry.content}`;

  // Call OpenAI with updated API
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "system", content: prompt }],
    temperature: 0,
  });

  const raw = response.choices[0].message?.content || "";
  let analysis: { sentiment: string; emotions: string[]; keyTopics: string[] };

  try {
    analysis = JSON.parse(raw);
  } catch (e) {
    console.warn("⚠️ Failed to parse AI analysis response:", raw);
    return;
  }

  // Save analysis back on the entry
  // Check if 'analysis' exists on the entry type first
  interface JournalEntryWithAnalysis extends IJournalEntry {
    analysis?: {
      sentiment: "Positive" | "Neutral" | "Negative";
      emotions: string[];
      keyTopics: string[];
    };
  }

  // Use type assertion to enable setting the analysis property
  (entry as unknown as JournalEntryWithAnalysis).analysis = {
    sentiment: analysis.sentiment as "Positive" | "Neutral" | "Negative",
    emotions: analysis.emotions,
    keyTopics: analysis.keyTopics,
  };
  
  await entry.save();
}