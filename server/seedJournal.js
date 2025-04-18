// Place this file in server/seedJournal.js (the root of your server directory)

require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Log available model files to help troubleshoot
const modelsDir = path.join(__dirname, 'src/models');
console.log('Checking models directory:', modelsDir);
try {
  const files = fs.readdirSync(modelsDir);
  console.log('Available model files:', files);
} catch (err) {
  console.error('Error reading models directory:', err);
}

// Try to import the Journal model with different extensions
let JournalPrompt;
try {
  // First try .js extension
  const Journal = require('./src/models/Journal.js');
  JournalPrompt = Journal.JournalPrompt;
  console.log('Successfully imported Journal model from .js file');
} catch (err1) {
  try {
    // Then try .ts extension
    const Journal = require('./src/models/Journal.ts');
    JournalPrompt = Journal.JournalPrompt;
    console.log('Successfully imported Journal model from .ts file');
  } catch (err2) {
    try {
      // Try direct import without extension (Node.js will resolve)
      const Journal = require('./src/models/Journal.ts');
      JournalPrompt = Journal.JournalPrompt;
      console.log('Successfully imported Journal model (no extension)');
    } catch (err3) {
      console.error('Failed to import Journal model with any extension');
      console.error('Error details:', err3);
      process.exit(1);
    }
  }
}

// Initial set of journal prompts organized by category
const journalPrompts = [
  // Self-Reflection Prompts (Beginner Level)
  {
    title: "Current Emotions Check-In",
    text: "How are you feeling right now? Describe your emotions in detail and try to identify what might be causing them.",
    category: "Self-Reflection",
    tags: ["emotions", "awareness", "check-in"],
    difficultyLevel: 1,
    targetEmotions: ["Neutral", "Happy", "Sad", "Angry", "Anxious"]
  },
  {
    title: "Gratitude Reflection",
    text: "List three things you're grateful for today and explain why they matter to you.",
    category: "Self-Reflection",
    tags: ["gratitude", "positivity", "awareness"],
    difficultyLevel: 1,
    targetEmotions: ["Grateful", "Happy", "Peaceful"]
  },
  {
    title: "Today's Highlights",
    text: "What was the best part of your day? What made it special?",
    category: "Self-Reflection",
    tags: ["daily", "positive", "reflection"],
    difficultyLevel: 1,
    targetEmotions: ["Happy", "Grateful", "Peaceful"]
  },
  
  // Stress & Anxiety Prompts
  {
    title: "Worry Examination",
    text: "What's one thing you're worried about? How likely is it to happen, and what could you do if it did?",
    category: "Stress & Anxiety",
    tags: ["worry", "planning", "perspective"],
    difficultyLevel: 2,
    targetEmotions: ["Anxious", "Overwhelmed", "Neutral"]
  },
  {
    title: "Physical Stress Signals",
    text: "How does your body feel right now? Identify where you might be holding tension and describe those sensations.",
    category: "Stress & Anxiety",
    tags: ["body", "awareness", "tension"],
    difficultyLevel: 2,
    targetEmotions: ["Anxious", "Overwhelmed", "Burnout"]
  },
  {
    title: "Calming Visualization",
    text: "Describe your ideal peaceful place in detail. What do you see, hear, smell, and feel there?",
    category: "Stress & Anxiety",
    tags: ["relaxation", "visualization", "peace"],
    difficultyLevel: 1,
    targetEmotions: ["Anxious", "Overwhelmed", "Peaceful"]
  },
  
  // Work & Productivity Prompts
  {
    title: "Workplace Boundaries",
    text: "What boundaries could you set at work to protect your wellbeing? What makes these difficult to establish?",
    category: "Work & Productivity",
    tags: ["boundaries", "work-life", "self-care"],
    difficultyLevel: 3,
    targetEmotions: ["Burnout", "Overwhelmed", "Anxious"]
  },
  {
    title: "Career Reflection",
    text: "What aspects of your work bring you the most satisfaction? Which parts drain your energy?",
    category: "Work & Productivity",
    tags: ["career", "satisfaction", "energy"],
    difficultyLevel: 2,
    targetEmotions: ["Neutral", "Burnout", "Excited"]
  },
  {
    title: "Achievement Recognition",
    text: "What's something you accomplished recently that you're proud of? How did you make it happen?",
    category: "Work & Productivity",
    tags: ["achievement", "pride", "reflection"],
    difficultyLevel: 1,
    targetEmotions: ["Happy", "Excited", "Hopeful"]
  },
  
  // Relationships Prompts
  {
    title: "Connection Inventory",
    text: "Which relationship in your life currently brings you the most support? What makes it valuable?",
    category: "Relationships",
    tags: ["connection", "support", "gratitude"],
    difficultyLevel: 2,
    targetEmotions: ["Grateful", "Peaceful", "Happy"]
  },
  {
    title: "Conflict Exploration",
    text: "Describe a recent disagreement you had. What might the situation have looked like from the other person's perspective?",
    category: "Relationships",
    tags: ["conflict", "perspective", "empathy"],
    difficultyLevel: 3,
    targetEmotions: ["Angry", "Sad", "Neutral"]
  },
  {
    title: "Communication Patterns",
    text: "When you're upset, how do you typically communicate? How would you like to respond instead?",
    category: "Relationships",
    tags: ["communication", "patterns", "improvement"],
    difficultyLevel: 3,
    targetEmotions: ["Angry", "Anxious", "Sad"]
  },
  
  // Growth & Resilience Prompts
  {
    title: "Lessons from Challenges",
    text: "What's a difficult situation you've faced recently? What did you learn from it?",
    category: "Growth & Resilience",
    tags: ["challenges", "learning", "resilience"],
    difficultyLevel: 2,
    targetEmotions: ["Hopeful", "Neutral", "Disappointed"]
  },
  {
    title: "Future Self Letter",
    text: "Write a letter to your future self one year from now. What do you hope to have accomplished or changed?",
    category: "Growth & Resilience",
    tags: ["future", "goals", "aspiration"],
    difficultyLevel: 2,
    targetEmotions: ["Hopeful", "Excited", "Anxious"]
  },
  {
    title: "Values Reflection",
    text: "What three values are most important to you right now? How are these showing up in your daily choices?",
    category: "Growth & Resilience",
    tags: ["values", "alignment", "choices"],
    difficultyLevel: 3,
    targetEmotions: ["Neutral", "Peaceful", "Hopeful"]
  },
  
  // Advanced Prompts
  {
    title: "Emotional Patterns",
    text: "Reflect on a recurring emotion in your life. When did you first start experiencing it? What triggers it? How has your relationship with this emotion evolved?",
    category: "Advanced Reflection",
    tags: ["patterns", "history", "awareness"],
    difficultyLevel: 4,
    targetEmotions: ["Neutral", "Sad", "Anxious", "Angry"]
  },
  {
    title: "Inner Critic Dialogue",
    text: "Write a conversation between yourself and your inner critic. What does your critic say? How can you respond with self-compassion?",
    category: "Advanced Reflection",
    tags: ["inner-critic", "self-compassion", "dialogue"],
    difficultyLevel: 4,
    targetEmotions: ["Anxious", "Sad", "Overwhelmed"]
  },
  {
    title: "Life Chapter Analysis",
    text: "If your life were a book, what would you title the current chapter? What themes are developing, and what might the next chapter hold?",
    category: "Advanced Reflection",
    tags: ["life-story", "narrative", "transition"],
    difficultyLevel: 4,
    targetEmotions: ["Neutral", "Hopeful", "Peaceful"]
  },
  {
    title: "Shadow Work Exploration",
    text: "What's a part of yourself that you tend to hide or deny? How might accepting this aspect change your relationship with yourself?",
    category: "Advanced Reflection",
    tags: ["shadow-work", "acceptance", "integration"],
    difficultyLevel: 5,
    targetEmotions: ["Neutral", "Anxious", "Peaceful"]
  },

  // Additional Prompts
  // Healing & Recovery
  {
    title: "Self-Compassion Practice",
    text: "How would you comfort a friend going through what you're experiencing? Can you offer the same kindness to yourself?",
    category: "Healing & Recovery",
    tags: ["self-compassion", "kindness", "healing"],
    difficultyLevel: 2,
    targetEmotions: ["Sad", "Disappointed", "Hopeful"]
  },
  {
    title: "Grief Reflection",
    text: "What or who are you grieving right now? How is this loss affecting different areas of your life?",
    category: "Healing & Recovery",
    tags: ["grief", "loss", "processing"],
    difficultyLevel: 4,
    targetEmotions: ["Sad", "Angry", "Lonely"]
  },
  {
    title: "Progress Appreciation",
    text: "What's something you can do now that you couldn't do before? How does this growth make you feel?",
    category: "Healing & Recovery",
    tags: ["progress", "growth", "appreciation"],
    difficultyLevel: 2,
    targetEmotions: ["Hopeful", "Proud", "Grateful"]
  },

  // Identity & Purpose
  {
    title: "Core Identity",
    text: "Beyond your roles and responsibilities, who are you? What aspects of your identity feel most authentic?",
    category: "Identity & Purpose",
    tags: ["identity", "authenticity", "self-discovery"],
    difficultyLevel: 4,
    targetEmotions: ["Neutral", "Curious", "Peaceful"]
  },
  {
    title: "Meaningful Contribution",
    text: "What's one way you'd like to make a difference in the world? What steps could you take toward this?",
    category: "Identity & Purpose",
    tags: ["purpose", "meaning", "contribution"],
    difficultyLevel: 3,
    targetEmotions: ["Hopeful", "Inspired", "Determined"]
  },
  {
    title: "Values in Action",
    text: "Reflect on a time when you stood up for something you believe in. How did it feel to align your actions with your values?",
    category: "Identity & Purpose",
    tags: ["values", "courage", "alignment"],
    difficultyLevel: 3,
    targetEmotions: ["Proud", "Determined", "Empowered"]
  }
];

// Connect to database and seed prompts
async function seedJournalPrompts() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    console.log('MongoDB URI:', process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('🌐 Connected to MongoDB');
    
    // Confirm we have the JournalPrompt model
    if (!JournalPrompt) {
      console.error('JournalPrompt model not found');
      process.exit(1);
    }
    
    // Clear existing prompts
    await JournalPrompt.deleteMany({});
    console.log('🧹 Cleared existing journal prompts');
    
    // Insert new prompts
    await JournalPrompt.insertMany(journalPrompts);
    console.log(`✅ Successfully seeded ${journalPrompts.length} journal prompts`);
    
    // Disconnect and exit
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding journal prompts:', error);
    console.error('Error details:', error.stack);
    process.exit(1);
  }
}

// Run the seeding function
seedJournalPrompts();