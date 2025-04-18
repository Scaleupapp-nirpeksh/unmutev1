// File: server/src/services/pineconeService.ts
// Purpose: Singleton wrapper around PineconeClient — fetch user vector & query similar users.
// Note: Casting query requests to `any` to satisfy TypeScript.

import { PineconeClient, ScoredVector } from "@pinecone-database/pinecone";

const client = new PineconeClient();
let ready = false;

async function ensureInit() {
  if (ready) return;
  await client.init({
    apiKey: process.env.PINECONE_API_KEY!,
    environment: process.env.PINECONE_ENV!,
  });
  ready = true;
}

const indexName = "unmute-users";

export default {
  /** Return the stored embedding vector for a given user id */
  async fetchUserVector(uid: string): Promise<number[]> {
    await ensureInit();
    const res: any = await client
      .Index(indexName)
      .fetch({ ids: [uid], namespace: "users" });
    return res.vectors?.[uid]?.values ?? [];
  },

  /** Return top‑K similar user ids with similarity scores */
  async querySimilar(vector: number[], topK: number) {
    await ensureInit();

    // Build the request as `any` so TS won’t complain about unknown properties
    const req: any = {
      vector,
      topK,
      namespace: "users",
      includeValues: false,
    };

    const res: any = await client
      .Index(indexName)
      .query(req);

    return (res.matches as ScoredVector[]).map((m: any) => ({
      uid: m.id,
      score: m.score,
    }));
  },
};
