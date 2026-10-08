import { redis } from "./redisClient.js";
import type { ChatMessage } from "../agent/openrouter.js";

const TTL_SECONDS = 3600;
const MAX_CACHED_MESSAGES = 10;

function cacheKey(caseId: string): string {
  return `case:${caseId}:history`;
}

export async function getCachedHistory(caseId: string): Promise<ChatMessage[] | null> {
  const raw = await redis.get(cacheKey(caseId));
  if (!raw) return null;
  return JSON.parse(raw) as ChatMessage[];
}

export async function setCachedHistory(caseId: string, messages: ChatMessage[]): Promise<void> {
  const trimmed = messages.slice(-MAX_CACHED_MESSAGES);
  await redis.set(cacheKey(caseId), JSON.stringify(trimmed), "EX", TTL_SECONDS);
}
