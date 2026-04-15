// rateLimit/checkAndConsumeTokens.js
import redis from "../../src/utils/redisclient.js";

const MAX_TOKENS_PER_HOUR = 100000;
const WINDOW_SECONDS = 60 * 60;

export async function checkAndConsumeTokens(userId, tokensToConsume) {
  const key = `gemini_tokens:${userId}`;

  const pipeline = redis.multi();
  pipeline.incrby(key, tokensToConsume);
  pipeline.ttl(key);

  const [[, newTotal], [, ttl]] = await pipeline.exec();

  if (ttl === -1) {
    await redis.expire(key, WINDOW_SECONDS);
  }

  if (newTotal > MAX_TOKENS_PER_HOUR) {
    throw Object.assign(
      new Error("Hourly Gemini token limit exceeded"),
      {
        code: "GEMINI_RATE_LIMIT",
        meta: {
        reason:"Hourly Token Limit Exceeded",
          usedTokens: newTotal,
          limit: MAX_TOKENS_PER_HOUR,
          retryAfterSeconds: ttl > 0 ? ttl : WINDOW_SECONDS
        }
      }
    );
  }
}
