import { Request, Response, NextFunction } from 'express';

/**
 * CAPTCHA Verification Middleware
 * Validates Google reCAPTCHA v2 tokens on registration and login.
 * This prevents automated brute-force attacks and bot registrations.
 */
export async function verifyCaptcha(req: Request, res: Response, next: NextFunction) {
    const captchaToken = req.body.captchaToken;

    // If CAPTCHA is not configured (no secret key), skip verification
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    if (!secretKey) {
        return next();
    }

    if (!captchaToken) {
        return res.status(400).json({
            success: false,
            message: 'CAPTCHA verification required. Please complete the CAPTCHA challenge.'
        });
    }

    try {
        // Verify token with Google reCAPTCHA API
        const verifyUrl = `https://www.google.com/recaptcha/api/siteverify`;
        const response = await fetch(verifyUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `secret=${encodeURIComponent(secretKey)}&response=${encodeURIComponent(captchaToken)}&remoteip=${encodeURIComponent(req.ip || '')}`
        });

        const data = await response.json();

        if (!data.success) {
            return res.status(403).json({
                success: false,
                message: 'CAPTCHA verification failed. Please try again.',
                errors: data['error-codes'] || []
            });
        }

        // CAPTCHA verified successfully
        next();
    } catch (error) {
        console.error('CAPTCHA verification error:', error);
        // On network error, allow the request (fail-open for availability)
        // In production, you may want to fail-closed instead
        next();
    }
}
