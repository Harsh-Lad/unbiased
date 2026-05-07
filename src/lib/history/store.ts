import { Redis } from "@upstash/redis";

export type HistoryKind = "youtube" | "pdf" | "image" | "text";

export interface HistoryEntry {
  id: string;
  kind: HistoryKind;
  input: string;
  videoId?: string;
  success: boolean;
  errorCode?: string;
  ts: number;
  ip?: string;
  userAgent?: string;
}

const KEY = "history:entries";
const MAX_ENTRIES = 1000;

let _redis: Redis | null = null;
function getRedis(): Redis | null {
  if (_redis) return _redis;
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  _redis = new Redis({ url, token });
  return _redis;
}

export async function logAnalysis(entry: Omit<HistoryEntry, "id" | "ts">): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  try {
    const full: HistoryEntry = {
      ...entry,
      id: crypto.randomUUID(),
      ts: Date.now(),
      input: entry.input.slice(0, 500),
    };
    await redis.lpush(KEY, JSON.stringify(full));
    await redis.ltrim(KEY, 0, MAX_ENTRIES - 1);
  } catch (e) {
    console.warn("[history] log failed:", e);
  }
}

export async function listHistory(limit = 200): Promise<HistoryEntry[]> {
  const redis = getRedis();
  if (!redis) return [];
  try {
    const raw = await redis.lrange(KEY, 0, limit - 1);
    return raw
      .map((r) => {
        try { return typeof r === "string" ? JSON.parse(r) as HistoryEntry : r as HistoryEntry; }
        catch { return null; }
      })
      .filter((x): x is HistoryEntry => !!x);
  } catch (e) {
    console.warn("[history] list failed:", e);
    return [];
  }
}

export async function clearHistory(): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  await redis.del(KEY);
}
