//models/Journal.ts

import { Schema, model, Document, Types } from 'mongoose';

// 1) Journal Entry
export interface IJournalEntry extends Document {
    userId: Types.ObjectId;
    title: string;
    content: string;
    promptId?: Types.ObjectId;
    emotions: string[];
    tags: string[];
    isPrivate: boolean;
    useForMatching: boolean;
    visibility: 'private' | 'public' | 'friends';
    analysis?: {
      sentiment: 'Positive' | 'Neutral' | 'Negative';
      emotions: string[];
      keyTopics: string[];
    };
    createdAt: Date;
    updatedAt: Date;
  }
  
  // Then update your JournalEntrySchema to include the analysis field:
  
  const JournalEntrySchema = new Schema<IJournalEntry>(
    {
      userId:        { type: Schema.Types.ObjectId, ref: 'User', required: true },
      title:         { type: String, required: true },
      content:       { type: String, required: true },
      promptId:      { type: Schema.Types.ObjectId, ref: 'JournalPrompt', default: null },
      emotions:      { type: [String], default: [] },
      tags:          { type: [String], default: [] },
      isPrivate:     { type: Boolean, default: true },
      useForMatching:{ type: Boolean, default: false },
      visibility:    { type: String, enum: ['private','public','friends'], default: 'private' },
      analysis:      { 
        type: {
          sentiment: { type: String, enum: ['Positive', 'Neutral', 'Negative'] },
          emotions: [String],
          keyTopics: [String]
        },
        default: null
      }
    },
    { timestamps: true }
  );

export const JournalEntry = model<IJournalEntry>('JournalEntry', JournalEntrySchema);

// 2) Journal Prompt
export interface IJournalPrompt extends Document {
  title: string;
  text: string;
  category: string;
  tags: string[];
  difficultyLevel: number;
  targetEmotions: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const JournalPromptSchema = new Schema<IJournalPrompt>(
  {
    title:           { type: String, required: true },
    text:            { type: String, required: true },
    category:        { type: String, required: true },
    tags:            { type: [String], default: [] },
    difficultyLevel: { type: Number, default: 1 },
    targetEmotions:  { type: [String], default: [] },
    isActive:        { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const JournalPrompt = model<IJournalPrompt>('JournalPrompt', JournalPromptSchema);

// 3) Journal Streak
export interface IStreakRecord {
  date: Date;
  entriesCount: number;
}

export interface IAchievement {
  type: string;
  earnedAt: Date;
  seen: boolean;
}

export interface IJournalStreak extends Document {
  userId: Types.ObjectId;
  currentStreak: number;
  longestStreak: number;
  lastEntryDate?: Date;
  streakHistory: IStreakRecord[];
  achievements: IAchievement[];
}

const StreakRecordSchema = new Schema<IStreakRecord>(
  {
    date:         { type: Date, required: true },
    entriesCount: { type: Number, required: true }
  },
  { _id: false }
);

const AchievementSchema = new Schema<IAchievement>(
  {
    type:     { type: String, required: true },
    earnedAt: { type: Date, default: Date.now },
    seen:     { type: Boolean, default: false }
  },
  { _id: false }
);

const JournalStreakSchema = new Schema<IJournalStreak>(
  {
    userId:        { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastEntryDate: { type: Date },
    streakHistory: { type: [StreakRecordSchema], default: [] },
    achievements:  { type: [AchievementSchema], default: [] }
  },
  { timestamps: true }
);

export const JournalStreak = model<IJournalStreak>('JournalStreak', JournalStreakSchema);
