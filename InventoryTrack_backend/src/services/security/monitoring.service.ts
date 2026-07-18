import { SecurityAlert, ISecurityAlert } from '../../models/security/securityAlert.model';
import { AuditLog } from '../../middleware/auditLogger.middleware';

/**
 * Security Monitoring Service
 * Provides real-time security monitoring by analyzing patterns in audit logs
 * and generating alerts when suspicious activity thresholds are exceeded.
 *
 * Thresholds:
 * - 5+ failed logins from same IP in 5 minutes → brute_force alert
 * - Account lockout triggered → account_locked alert
 * - IP blocked → ip_blocked alert
 * - 50+ requests from same IP in 1 minute → rate_limit_exceeded alert
 */

export class SecurityMonitoringService {

    /**
     * Generate a brute-force alert when multiple failed login attempts are detected
     */
    static async alertBruteForce(ip: string, attemptCount: number, targetEmail?: string): Promise<void> {
        const severity = attemptCount >= 15 ? 'critical' : attemptCount >= 10 ? 'high' : 'medium';

        await SecurityAlert.create({
            type: 'brute_force',
            severity,
            message: `Brute-force attack detected: ${attemptCount} failed login attempts from IP ${ip}${targetEmail ? ` targeting ${targetEmail}` : ''}`,
            details: {
                ip,
                userEmail: targetEmail,
                endpoint: '/api/auth/login',
                attemptCount
            }
        });
    }

    /**
     * Generate an alert when an account gets locked
     */
    static async alertAccountLocked(userId: string, email: string, ip: string): Promise<void> {
        await SecurityAlert.create({
            type: 'account_locked',
            severity: 'high',
            message: `Account locked: ${email} after maximum failed login attempts from IP ${ip}`,
            details: {
                userId,
                userEmail: email,
                ip,
                endpoint: '/api/auth/login'
            }
        });
    }

    /**
     * Generate an alert when an IP is blocked
     */
    static async alertIPBlocked(ip: string, attemptCount: number): Promise<void> {
        await SecurityAlert.create({
            type: 'ip_blocked',
            severity: 'critical',
            message: `IP address blocked: ${ip} after ${attemptCount} failed attempts across multiple accounts`,
            details: {
                ip,
                attemptCount
            }
        });
    }

    /**
     * Generate alert for suspicious activity patterns
     */
    static async alertSuspiciousActivity(message: string, details: any): Promise<void> {
        await SecurityAlert.create({
            type: 'suspicious_activity',
            severity: 'medium',
            message,
            details
        });
    }

    /**
     * Get recent unacknowledged alerts for the admin dashboard
     */
    static async getActiveAlerts(page: number = 1, limit: number = 20): Promise<{
        alerts: ISecurityAlert[];
        total: number;
        unacknowledged: number;
    }> {
        const skip = (page - 1) * limit;

        const [alerts, total, unacknowledged] = await Promise.all([
            SecurityAlert.find()
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            SecurityAlert.countDocuments(),
            SecurityAlert.countDocuments({ acknowledged: false })
        ]);

        return { alerts: alerts as ISecurityAlert[], total, unacknowledged };
    }

    /**
     * Acknowledge an alert (mark as reviewed by admin)
     */
    static async acknowledgeAlert(alertId: string, adminId: string): Promise<void> {
        await SecurityAlert.findByIdAndUpdate(alertId, {
            acknowledged: true,
            acknowledgedBy: adminId,
            acknowledgedAt: new Date()
        });
    }

    /**
     * Acknowledge all alerts
     */
    static async acknowledgeAll(adminId: string): Promise<number> {
        const result = await SecurityAlert.updateMany(
            { acknowledged: false },
            {
                acknowledged: true,
                acknowledgedBy: adminId,
                acknowledgedAt: new Date()
            }
        );
        return result.modifiedCount;
    }

    /**
     * Get security dashboard statistics
     */
    static async getDashboardStats(): Promise<any> {
        const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const last7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        const [
            alertsLast24h,
            criticalAlerts,
            failedLoginsLast24h,
            blockedIPs,
            alertsByType
        ] = await Promise.all([
            SecurityAlert.countDocuments({ createdAt: { $gte: last24h } }),
            SecurityAlert.countDocuments({ severity: 'critical', acknowledged: false }),
            AuditLog.countDocuments({
                path: { $regex: '/api/auth/login' },
                statusCode: { $in: [401, 423] },
                timestamp: { $gte: last24h }
            }),
            SecurityAlert.countDocuments({ type: 'ip_blocked', createdAt: { $gte: last7d } }),
            SecurityAlert.aggregate([
                { $match: { createdAt: { $gte: last7d } } },
                { $group: { _id: '$type', count: { $sum: 1 } } }
            ])
        ]);

        return {
            alertsLast24h,
            criticalAlerts,
            failedLoginsLast24h,
            blockedIPsLast7d: blockedIPs,
            alertsByType: alertsByType.reduce((acc: any, item: any) => {
                acc[item._id] = item.count;
                return acc;
            }, {})
        };
    }
}
