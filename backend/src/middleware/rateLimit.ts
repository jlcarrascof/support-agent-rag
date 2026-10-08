import type { Request, Response, NextFunction } from "express";
import { redis } from "../services/redisClient.js";

const WINDOW_SECONDS = 60;
const MAX_REQUESTS_PER_WINDOW = 10;

export async function rateLimit(req: Request, res: Response, next: NextFunction): Promise<void> {
  const key = `ratelimit:${req.ip}`;

  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, WINDOW_SECONDS);
  }

  if (count > MAX_REQUESTS_PER_WINDOW) {
    const ttl = await redis.ttl(key);
    res.set("Retry-After", String(ttl > 0 ? ttl : WINDOW_SECONDS));
    res.status(429).json({
      error: `Too many requests. Limit is ${MAX_REQUESTS_PER_WINDOW} messages per minute.`,
    });
    return;
  }

  next();
}
