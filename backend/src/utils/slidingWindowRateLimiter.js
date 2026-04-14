export class SlidingWindowRateLimiter {
  constructor({ maxRequests, windowMs }) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.store = new Map();
  }

  consume(key) {
    const now = Date.now();
    const timestamps = this.store.get(key) || [];

    const freshTimestamps = timestamps.filter(
      (timestamp) => now - timestamp < this.windowMs
    );

    if (freshTimestamps.length >= this.maxRequests) {
      throw new Error("Email limit reached. Try again later.");
    }

    freshTimestamps.push(now);
    this.store.set(key, freshTimestamps);
  }
}
