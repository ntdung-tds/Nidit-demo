import type { RequestHandler } from "express";
import { HttpError } from "./http";

/** Giới hạn số lần gọi theo địa chỉ IP trong một cửa sổ thời gian (bộ nhớ trong) */
export function rateLimit(options: { windowMs: number; max: number; message: string }): RequestHandler {
  const hits = new Map<string, number[]>();
  return (req, _res, next) => {
    const key = req.ip ?? "unknown";
    const now = Date.now();
    const recent = (hits.get(key) ?? []).filter((t) => now - t < options.windowMs);
    if (recent.length >= options.max) throw new HttpError(429, options.message);
    recent.push(now);
    hits.set(key, recent);
    if (hits.size > 5000) {
      for (const [k, times] of hits) if (!times.some((t) => now - t < options.windowMs)) hits.delete(k);
    }
    next();
  };
}
