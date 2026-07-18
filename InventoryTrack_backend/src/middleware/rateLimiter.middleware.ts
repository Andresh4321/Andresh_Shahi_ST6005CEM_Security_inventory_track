import rateLimit from 'express-rate-limit';
import { RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX_REQUESTS } from '../config';

// General API rate limiter - 500 requests per 15 min window (allows normal app usage)
export const apiLimiter = rateLimit({
    windowMs: RATE_LIMIT_WINDOW_MS,
    max: 10000,
    message: { success: false, message: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Strict limiter for auth endpoints
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 attempts per 15 min
    message: { success: false, message: 'Too many authentication attempts, please try again after 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Stricter limiter for password reset
export const passwordResetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3,
    message: { success: false, message: 'Too many password reset attempts. Try again in 1 hour.' },
    standardHeaders: true,
    legacyHeaders: false,
});
