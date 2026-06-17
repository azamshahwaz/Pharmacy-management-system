import rateLimit, { ipKeyGenerator } from "express-rate-limit";

// ⛔ Login rate limiter
export const loginLimiter = rateLimit({
  windowMs: 2 * 60 * 1000, // 2 minutes
  max: 10, // max 10 attempts

 keyGenerator: (req) => {
  const identifier = req.body.email || req.body.phone;
  return identifier ? `user-${identifier}` : ipKeyGenerator(req);
},

  message: {
    success: false,
    message: "Too many login attempts. Try again after some time."
  },

  standardHeaders: true,
  legacyHeaders: false,
});