import rateLimit from 'express-rate-limit';
import { RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX_REQUESTS } from '../config';

// General API rate limiter - 100 requests per 15 min window per IP
// SECURITY FIX: Reduced from 10000 (effectively unlimited) to 100 to prevent API abuse
export const apiLimiter = rateLimit({
    windowMs: RATE_LIMIT_WINDOW_MS,
    max: RATE_LIMIT_MAX_REQUESTS, // 100 per 15 min from .env
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

// SECURITY FIX: MFA verification rate limiter — prevents brute-force of 6-digit TOTP codes
// Without this, an attacker with a valid tempToken could try all 1,000,000 combinations
export const mfaLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes (matches tempToken lifetime)
    max: 5, // Only 5 attempts allowed per 5-min window
    message: { success: false, message: 'Too many MFA verification attempts. Please log in again.' },
    standardHeaders: true,
    legacyHeaders: false,
});
