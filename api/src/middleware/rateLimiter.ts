import rateLimit from 'express-rate-limit'

export const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 AI requests per minute per IP
  message: { error: 'Too many AI requests. Please try again in a minute.' },
  standardHeaders: true,
  legacyHeaders: false,
})

export const generalRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
})
