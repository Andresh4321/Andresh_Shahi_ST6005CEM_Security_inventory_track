import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';

/**
 * IP-Based Blocking Middleware
 * Tracks failed authentication attempts per IP address and temporarily blocks
 * IPs that exceed the configured threshold. This provides network-level
 * brute-force protection independent of account-level lockout.
 */

// Schema for tracking blocked IPs
const BlockedIPSchema = new mongoose.Schema({
    ip: { type: String, required: true, index: true },
    failedAttempts: { type: Number, default: 0 },
    blockedUntil: { type: Date },
    lastAttempt: { type: Date, default: Date.now },
    // Track which endpoints were targeted
    targetedEndpoints: [{
        path: String,
        timestamp: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

// TTL index: auto-delete records 24 hours after last update
BlockedIPSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 86400 });

export const BlockedIP = mongoose.model('BlockedIP', BlockedIPSchema);

const IP_BLOCK_THRESHOLD = parseInt(process.env.IP_BLOCK_THRESHOLD || '20');
const IP_BLOCK_DURATION_MINUTES = parseInt(process.env.IP_BLOCK_DURATION_MINUTES || '60');

/**
 * Check if an IP is currently blocked before processing the request
 */
export async function ipBlockCheck(req: Request, res: Response, next: NextFunction) {
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';

    try {
        const record = await BlockedIP.findOne({ ip: clientIp });

        if (record && record.blockedUntil && record.blockedUntil > new Date()) {
            const remainingMinutes = Math.ceil((record.blockedUntil.getTime() - Date.now()) / 60000);
            return res.status(403).json({
                success: false,
                message: `Your IP address has been temporarily blocked due to excessive failed attempts. Try again in ${remainingMinutes} minutes.`,
                blockedUntil: record.blockedUntil
            });
        }

        next();
    } catch (error) {
        // On DB error, allow the request (fail-open for availability)
        console.error('IP block check error:', error);
        next();
    }
}

/**
 * Record a failed authentication attempt from an IP.
 * Call this from auth controllers when login/registration fails.
 */
export async function recordFailedAttempt(ip: string, endpoint: string): Promise<void> {
    try {
        const record = await BlockedIP.findOne({ ip });

        if (record) {
            // If previously blocked but block has expired, reset counter
            if (record.blockedUntil && record.blockedUntil < new Date()) {
                record.failedAttempts = 1;
                record.blockedUntil = undefined;
            } else {
                record.failedAttempts += 1;
            }

            record.lastAttempt = new Date();
            record.targetedEndpoints.push({ path: endpoint, timestamp: new Date() });

            // Block IP if threshold exceeded
            if (record.failedAttempts >= IP_BLOCK_THRESHOLD) {
                record.blockedUntil = new Date(Date.now() + IP_BLOCK_DURATION_MINUTES * 60 * 1000);
                console.warn(`[SECURITY] IP ${ip} blocked after ${record.failedAttempts} failed attempts on ${endpoint}`);
            }

            await record.save();
        } else {
            // Create new record
            await BlockedIP.create({
                ip,
                failedAttempts: 1,
                lastAttempt: new Date(),
                targetedEndpoints: [{ path: endpoint, timestamp: new Date() }]
            });
        }
    } catch (error) {
        console.error('Error recording failed attempt:', error);
    }
}

/**
 * Clear failed attempts for an IP after successful authentication
 */
export async function clearFailedAttempts(ip: string): Promise<void> {
    try {
        await BlockedIP.deleteOne({ ip });
    } catch (error) {
        console.error('Error clearing failed attempts:', error);
    }
}
