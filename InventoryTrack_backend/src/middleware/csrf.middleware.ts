import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

const csrfTokens = new Map<string, { token: string; expires: number }>();

export function generateCsrfToken(req: Request, res: Response) {
    const token = crypto.randomBytes(32).toString('hex');
    const userId = (req as any).user?._id?.toString() || req.ip;
    csrfTokens.set(userId, { token, expires: Date.now() + 3600000 }); // 1 hour
    return res.status(200).json({ success: true, csrfToken: token });
}

export function verifyCsrfToken(req: Request, res: Response, next: NextFunction) {
    // Skip for GET, HEAD, OPTIONS
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();

    const token = req.headers['x-csrf-token'] as string || req.body?._csrf;
    const userId = (req as any).user?._id?.toString() || req.ip;
    const stored = csrfTokens.get(userId);

    if (!stored || stored.token !== token || stored.expires < Date.now()) {
        return res.status(403).json({ success: false, message: 'Invalid or expired CSRF token' });
    }

    next();
}
