// server/src/services/aiService.ts   – sentiment & moderation stubs
export async function moderateText(text: string) {
    /* call OpenAI moderation – return false if disallowed */
    return true;
  }
  
  export async function detectEmotion(text: string) {
    /* simple placeholder */
    return { emo: "sad", score: -0.4 };
  }
  