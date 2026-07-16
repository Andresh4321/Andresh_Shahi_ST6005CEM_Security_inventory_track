import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';

// Audit log schema
const AuditLogSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userEmail: { type: String },
    action: { type: String, required: true },
    method: { type: String, required: true },
    path: { type: String, required: true },
    ip: { type: String },
    userAgent: { type: String },
    statusCode: { type: Number },
    timestamp: { type: Date, default: Date.now },
    details: { type: mongoose.Schema.Types.Mixed }
});

export const AuditLog = mongoose.model('AuditLog', AuditLogSchema);

export function auditLogger(req: Request, res: Response, next: NextFunction) {
    const originalSend = res.send;

    res.send = function(body: any) {
        // Log after response is sent
        const logEntry = {
            userId: (req as any).user?._id,
            userEmail: (req as any).user?.email,
            action: `${req.method} ${req.path}`,
            method: req.method,
            path: req.originalUrl,
            ip: req.ip || req.socket.remoteAddress,
            userAgent: req.headers['user-agent'],
            statusCode: res.statusCode,
            timestamp: new Date(),
            details: {
                query: req.query,
                // Don't log sensitive data like passwords
                body: sanitizeLogBody(req.body)
            }
        };

        // Save async - don't block response
        AuditLog.create(logEntry).catch(err => console.error('Audit log error:', err));

        return originalSend.call(this, body);
    };

    next();
}

function sanitizeLogBody(body: any): any {
    if (!body) return {};
    const sanitized = { ...body };
    // Remove sensitive fields from logs
    const sensitiveFields = ['password', 'confirmPassword', 'currentPassword', 'newPassword', 'mfaSecret', 'otp'];
    sensitiveFields.forEach(field => {
        if (sanitized[field]) sanitized[field] = '[REDACTED]';
    });
    return sanitized;
}
