import { Router, Request, Response } from "express";
import { authorizedMiddelWare } from "../../middleware/authorized.middleware";
import { UserModel } from "../../models/auth/user.models";
import { decryptData } from "../../utils/encryption";
import mongoose from "mongoose";

const router: Router = Router();

// All data export/import routes require authentication
router.use(authorizedMiddelWare);

/**
 * GET /api/user/data/export
 * GDPR-aligned data export: allows user to download all their personal data.
 * Returns a JSON file containing user profile, activity logs, and related data.
 * This satisfies the "data portability" principle of privacy regulations.
 */
router.get('/export', async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;

        // Fetch user profile (exclude sensitive internal fields)
        const user = await UserModel.findById(userId)
            .select('-password -previousPasswords -mfaSecret -emailOTP -emailOTPExpire -resetPasswordToken -resetPasswordExpire -loginAttempts -lockUntil -failedLoginAttempts -__v')
            .lean();

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Decrypt phone number for export
        if (user.phone_number) {
            try {
                user.phone_number = decryptData(user.phone_number);
            } catch (e) {
                // If decryption fails, keep encrypted value
            }
        }

        // Fetch user's materials
        const Material = mongoose.model('Material');
        const materials = await Material.find({ userId }).select('-__v').lean().catch(() => []);

        // Fetch user's stock transactions
        let stockTransactions: any[] = [];
        try {
            const Stock = mongoose.model('Stock');
            stockTransactions = await Stock.find({ userId }).select('-__v').lean();
        } catch (e) { /* Model may not exist */ }

        // Fetch user's production records
        let productions: any[] = [];
        try {
            const Production = mongoose.model('Production');
            productions = await Production.find({ userId }).select('-__v').lean();
        } catch (e) { /* Model may not exist */ }

        // Fetch user's messages
        let messages: any[] = [];
        try {
            const Message = mongoose.model('Message');
            messages = await Message.find({
                $or: [{ sender: userId }, { recipient: userId }]
            }).select('-__v').lean();
        } catch (e) { /* Model may not exist */ }

        // Fetch audit logs for this user (last 90 days)
        const AuditLog = mongoose.model('AuditLog');
        const auditCutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        const auditLogs = await AuditLog.find({
            userId,
            timestamp: { $gte: auditCutoff }
        }).select('-__v').sort({ timestamp: -1 }).limit(500).lean().catch(() => []);

        const exportData = {
            exportMetadata: {
                exportDate: new Date().toISOString(),
                userId: userId.toString(),
                format: 'JSON',
                version: '1.0',
                description: 'Complete personal data export from InventoryTrack'
            },
            profile: user,
            inventory: {
                materials,
                stockTransactions
            },
            production: productions,
            messages,
            activityLog: auditLogs
        };

        // Set headers for file download
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="inventorytrack_data_export_${new Date().toISOString().split('T')[0]}.json"`);

        return res.status(200).json(exportData);
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message || 'Failed to export data' });
    }
});

/**
 * POST /api/user/data/import
 * Import previously exported data back into the user's account.
 * Validates format and merges materials that don't already exist.
 * Protects against injection by validating all imported fields.
 */
router.post('/import', async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const importData = req.body;

        if (!importData || !importData.exportMetadata) {
            return res.status(400).json({
                success: false,
                message: 'Invalid import format. Please upload a valid InventoryTrack export file.'
            });
        }

        // Validate the export format
        if (importData.exportMetadata.format !== 'JSON' || !importData.exportMetadata.version) {
            return res.status(400).json({
                success: false,
                message: 'Unsupported export format or version.'
            });
        }

        let importedCount = { materials: 0, skipped: 0 };

        // Import materials (skip duplicates based on name)
        if (importData.inventory?.materials && Array.isArray(importData.inventory.materials)) {
            const Material = mongoose.model('Material');
            const existingMaterials = await Material.find({ userId }).select('name').lean();
            const existingNames = new Set(existingMaterials.map((m: any) => m.name?.toLowerCase()));

            for (const material of importData.inventory.materials) {
                // Only import if material name doesn't exist
                if (material.name && !existingNames.has(material.name.toLowerCase())) {
                    // Sanitize: only allow safe fields, attach current userId
                    const safeMaterial = {
                        name: String(material.name).substring(0, 200),
                        quantity: Math.max(0, Number(material.quantity) || 0),
                        unit: String(material.unit || 'pcs').substring(0, 50),
                        costPerUnit: Math.max(0, Number(material.costPerUnit) || 0),
                        minimumStock: Math.max(0, Number(material.minimumStock) || 0),
                        category: String(material.category || 'General').substring(0, 100),
                        userId
                    };

                    await Material.create(safeMaterial);
                    importedCount.materials++;
                } else {
                    importedCount.skipped++;
                }
            }
        }

        return res.status(200).json({
            success: true,
            message: `Import complete. ${importedCount.materials} materials imported, ${importedCount.skipped} skipped (already exist).`,
            imported: importedCount
        });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message || 'Failed to import data' });
    }
});

/**
 * DELETE /api/user/data/delete-account
 * Right to erasure: permanently delete user account and all associated data.
 * Requires password confirmation for local accounts.
 */
router.delete('/delete-account', async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const { confirmPassword } = req.body;
        const user = await UserModel.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // For local accounts, verify password
        if (user.authProvider === 'local' && user.password) {
            if (!confirmPassword) {
                return res.status(400).json({ success: false, message: 'Password confirmation required' });
            }
            const bcrypt = require('bcryptjs');
            const valid = await bcrypt.compare(confirmPassword, user.password);
            if (!valid) {
                return res.status(401).json({ success: false, message: 'Incorrect password' });
            }
        }

        // Delete all user data from related collections
        const collections = ['Material', 'Stock', 'Production', 'Message'];
        for (const collName of collections) {
            try {
                const Model = mongoose.model(collName);
                await Model.deleteMany({ userId });
            } catch (e) { /* Model may not exist */ }
        }

        // Delete user
        await UserModel.findByIdAndDelete(userId);

        return res.status(200).json({
            success: true,
            message: 'Account and all associated data permanently deleted.'
        });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message || 'Failed to delete account' });
    }
});

export default router;
