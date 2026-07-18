import { Router, Request, Response } from "express";
import { authorizedMiddelWare, adminMiddelware } from "../../middleware/authorized.middleware";
import { SecurityMonitoringService } from "../../services/security/monitoring.service";
import { BlockedIP } from "../../middleware/ipBlock.middleware";

const router: Router = Router();

// All security monitoring routes require admin access
router.use(authorizedMiddelWare);
router.use(adminMiddelware);

// GET /api/admin/security/alerts - List security alerts
router.get('/alerts', async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;

        const result = await SecurityMonitoringService.getActiveAlerts(page, limit);

        return res.status(200).json({
            success: true,
            data: result.alerts,
            unacknowledged: result.unacknowledged,
            pagination: {
                page,
                limit,
                total: result.total,
                totalPages: Math.ceil(result.total / limit)
            }
        });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/admin/security/dashboard - Security dashboard statistics
router.get('/dashboard', async (req: Request, res: Response) => {
    try {
        const stats = await SecurityMonitoringService.getDashboardStats();
        return res.status(200).json({ success: true, data: stats });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

// PUT /api/admin/security/alerts/:id/acknowledge - Acknowledge an alert
router.put('/alerts/:id/acknowledge', async (req: Request, res: Response) => {
    try {
        const alertId = req.params.id;
        const adminId = (req as any).user._id.toString();
        await SecurityMonitoringService.acknowledgeAlert(alertId, adminId);
        return res.status(200).json({ success: true, message: 'Alert acknowledged' });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

// PUT /api/admin/security/alerts/acknowledge-all - Acknowledge all alerts
router.put('/alerts/acknowledge-all', async (req: Request, res: Response) => {
    try {
        const adminId = (req as any).user._id.toString();
        const count = await SecurityMonitoringService.acknowledgeAll(adminId);
        return res.status(200).json({ success: true, message: `${count} alerts acknowledged` });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/admin/security/blocked-ips - List currently blocked IPs
router.get('/blocked-ips', async (req: Request, res: Response) => {
    try {
        const blockedIPs = await BlockedIP.find({ blockedUntil: { $gt: new Date() } })
            .sort({ blockedUntil: -1 })
            .lean();

        return res.status(200).json({ success: true, data: blockedIPs });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE /api/admin/security/blocked-ips/:ip - Unblock a specific IP
router.delete('/blocked-ips/:ip', async (req: Request, res: Response) => {
    try {
        const ip = decodeURIComponent(req.params.ip);
        await BlockedIP.deleteOne({ ip });
        return res.status(200).json({ success: true, message: `IP ${ip} unblocked` });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
