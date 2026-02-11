import { Redis } from "@upstash/redis";
import type { AnalysisResults } from "./analysis-types";

export interface AnalysisEntry {
  id: string;
  status: "processing" | "completed" | "failed";
  fileName: string;
  fileSize: number;
  market: string;
  documentType: string;
  results: AnalysisResults | null;
  error: string | null;
  createdAt: number;
  totalPages?: number;
  totalChunks?: number;
  completedChunks?: number;
  currentStep?: string;
}

const KEY_PREFIX = "analysis:";
const TTL_SECONDS = 3600; // 1 hour

// In-memory fallback for local dev (no Redis)
const globalStore = globalThis as unknown as { __analysisStore?: Map<string, AnalysisEntry> };
if (!globalStore.__analysisStore) {
  globalStore.__analysisStore = new Map<string, AnalysisEntry>();
}
const memoryStore = globalStore.__analysisStore;

function getRedis(): Redis | null {
  // Support both Upstash direct (UPSTASH_*) and Vercel KV (KV_REST_API_*)
  const url =
    process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

export async function getAnalysis(id: string): Promise<AnalysisEntry | undefined> {
  const redis = getRedis();
  if (redis) {
    try {
      const key = `${KEY_PREFIX}${id}`;
      const raw = await redis.get<string>(key);
      if (typeof raw === "string") {
        return JSON.parse(raw) as AnalysisEntry;
      }
      return undefined;
    } catch (e) {
      console.error("[analysis-store] Redis get failed:", e);
      // Do NOT fall back to memory — other instances have empty memory. 404 is correct.
      return undefined;
    }
  }
  return memoryStore.get(id);
}

export async function setAnalysis(id: string, entry: AnalysisEntry): Promise<void> {
  memoryStore.set(id, entry);
  const redis = getRedis();
  if (redis) {
    try {
      const key = `${KEY_PREFIX}${id}`;
      await redis.set(key, JSON.stringify(entry), { ex: TTL_SECONDS });
    } catch (e) {
      console.error("[analysis-store] Redis set failed:", e);
    }
  }
}

export async function updateAnalysis(id: string, update: Partial<AnalysisEntry>): Promise<void> {
  let existing = memoryStore.get(id);
  const redis = getRedis();

  // If not in memory, try Redis (e.g. processing may run on a different instance)
  if (!existing && redis) {
    try {
      const key = `${KEY_PREFIX}${id}`;
      const raw = await redis.get<string>(key);
      if (typeof raw === "string") {
        existing = JSON.parse(raw) as AnalysisEntry;
        memoryStore.set(id, existing);
      }
    } catch (e) {
      console.error("[analysis-store] Redis get for update failed:", e);
    }
  }

  if (existing) {
    const merged = { ...existing, ...update };
    memoryStore.set(id, merged);
    if (redis) {
      try {
        const key = `${KEY_PREFIX}${id}`;
        await redis.set(key, JSON.stringify(merged), { ex: TTL_SECONDS });
      } catch (e) {
        console.error("[analysis-store] Redis update failed:", e);
      }
    }
  }
}
