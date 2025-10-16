import rateLimit from "express-rate-limit";

// General rate limiter for less sensitive routes
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                 // Limit each IP to 100 requests per window (15 minutes)
  message: "Too many requests, please try again later.",
  standardHeaders: "draft-8", // Send rate limit info in RateLimit-* headers
  legacyHeaders: false,       // Disable X-RateLimit-* headers
});

// Strict rate limiter for sensitive routes like booking cancellation or payments
export const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,                  // Limit each IP to 10 requests per window
  message: "Too many requests, please slow down.",
  standardHeaders: "draft-8",
  legacyHeaders: false,
});
