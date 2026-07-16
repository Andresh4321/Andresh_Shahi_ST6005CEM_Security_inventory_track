import { Request, Response, NextFunction } from 'express';

// Simple NoSQL injection sanitizer - returns a new clean object
function sanitizeObject(obj: any): any {
    if (typeof obj !== 'object' || obj === null) return obj;
    const sanitized: any = Array.isArray(obj) ? [] : {};
    for (const key of Object.keys(obj)) {
        if (key.startsWith('$')) continue; // Remove MongoDB operators
        const value = obj[key];
        if (typeof value === 'string') {
            // Remove potential XSS
            sanitized[key] = value
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/javascript:/gi, '')
                .replace(/on\w+=/gi, '');
        } else if (typeof value === 'object') {
            sanitized[key] = sanitizeObject(value);
        } else {
            sanitized[key] = value;
        }
    }
    return sanitized;
}

export function inputSanitizer(req: Request, res: Response, next: NextFunction) {
    // In Express 5, req.query and req.params are READ-ONLY getters.
    // Only sanitize req.body which is writable (set by body-parser).
    if (req.body && typeof req.body === 'object') {
        req.body = sanitizeObject(req.body);
    }
    next();
}
