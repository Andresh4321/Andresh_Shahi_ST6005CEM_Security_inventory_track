import { Router, Request, Response } from "express";
import { authorizedMiddelWare, adminMiddelware } from "../../middleware/authorized.middleware";
import { AuditLog } from "../../middleware/auditLogger.middleware";

const router: Router = Router();

// All audit routes require admin access
router.use(authorizedMiddelWare);
router.use(adminMiddelware);

// GET /api/admin/audit - List all audit logs with pagination and filtering
router.get('/', async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 50;
        const skip = (page - 1) * limit;

        // Build filter
        const filter: any = {};

        if (req.query.userId) filter.userId = req.query.userId;
        if (req.query.method) filter.method = (req.query.method as string).toUpperCase();
        if (req.query.action) filter.action = { $regex: req.query.action, $options: 'i' };
        if (req.query.startDate && req.query.endDate) {
            filter.timestamp = {
                $gte: new Date(req.query.startDate as string),
                $lte: new Date(req.query.endDate as string)
            };
        }
        if (req.query.statusCode) filter.statusCode = parseInt(req.query.statusCode as string);
        if (req.query.ip) filter.ip = req.query.ip;

        const logs = await AuditLog.find(filter)
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await AuditLog.countDocuments(filter);

        return res.status(200).json({
            success: true,
            data: logs,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message || "Failed to fetch audit logs" });
    }
});

// GET /api/admin/audit/stats - Audit log statistics
router.get('/stats', async (req: Request, res: Response) => {
    try {
        const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const stats = await AuditLog.aggregate([
            { $match: { timestamp: { $gte: last24h } } },
            {
                $group: {
                    _id: '$method',
                    count: { $sum: 1 }
                }
            }
        ]);

        const failedLogins = await AuditLog.countDocuments({
            path: { $regex: '/api/auth/login' },
            statusCode: { $in: [401, 423] },
            timestamp: { $gte: last24h }
        });

        const totalRequests = await AuditLog.countDocuments({
            timestamp: { $gte: last24h }
        });

        return res.status(200).json({
            success: true,
            data: {
                last24Hours: {
                    totalRequests,
                    failedLogins,
                    byMethod: stats
                }
            }
        });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message || "Failed to fetch audit stats" });
    }
});

// GET /api/admin/audit/user/:userId - Get audit logs for a specific user
router.get('/user/:userId', async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 50;
        const skip = (page - 1) * limit;

        const logs = await AuditLog.find({ userId })
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await AuditLog.countDocuments({ userId });

        return res.status(200).json({
            success: true,
            data: logs,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
        });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message || "Failed to fetch user audit logs" });
    }
});

// DELETE /api/admin/audit/clear - Clear old audit logs (older than 90 days)
router.delete('/clear', async (req: Request, res: Response) => {
    try {
        const cutoffDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000); // 90 days ago
        const result = await AuditLog.deleteMany({ timestamp: { $lt: cutoffDate } });

        return res.status(200).json({
            success: true,
            message: `Cleared ${result.deletedCount} audit logs older than 90 days`
        });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message || "Failed to clear audit logs" });
    }
});

export default router;
