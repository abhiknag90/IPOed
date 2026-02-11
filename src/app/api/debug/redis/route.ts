import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Debug endpoint to verify Redis/KV is working. Visit /api/debug/redis on your deployment. */
export async function GET() {
  const url =
    process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

  const status = {
    configured: !!(url && token),
    urlPresent: !!url,
    tokenPresent: !!token,
    envVarsChecked: [
      "UPSTASH_REDIS_REST_URL",
      "KV_REST_API_URL",
      "UPSTASH_REDIS_REST_TOKEN",
      "KV_REST_API_TOKEN",
    ],
    testOk: false as boolean,
    error: null as string | null,
  };

  if (!url || !token) {
    return NextResponse.json({
      ...status,
      message:
        "Redis not configured. Add KV_REST_API_URL + KV_REST_API_TOKEN (read-write, NOT read-only) or UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN to fix 404 during analysis.",
    });
  }

  try {
    const redis = new Redis({ url, token });
    const testKey = "analysis:debug-ping";
    await redis.set(testKey, "ok", { ex: 10 });
    const val = await redis.get(testKey);
    status.testOk = val === "ok";
    await redis.del(testKey);
  } catch (e) {
    status.error = e instanceof Error ? e.message : String(e);
  }

  return NextResponse.json({
    ...status,
    message: status.testOk
      ? "Redis is working. Analysis polling should succeed."
      : status.error
      ? `Redis connection failed: ${status.error}`
      : "Redis test failed.",
  });
}
