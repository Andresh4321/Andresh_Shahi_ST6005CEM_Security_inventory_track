import express, { Application, Request, Response, NextFunction } from 'express';
import { SESSION_SECRET } from './config';
import authRoutes from "./routes/auth/auth.route";
import cors from 'cors';
import path from "path";
import helmet from 'helmet';
// Custom HPP (HTTP Parameter Pollution) protection - hpp package is incompatible with Express 5
import session from 'express-session';
import adminUserRoutes from './routes/admin/user.route';
import auditRoutes from './routes/admin/audit.route';
import supplierRoutes from './routes/supplier/supplier.route';
import materialRoutes from './routes/material/material.route';
import stockRoutes from './routes/stock/stock.route';
import billRoutes from './routes/BillofMaterials/bill.route';
import recipeRoutes from './routes/ingredients/ingredients.route';
import productionRoutes from './routes/production/production.route';
import messageRoutes from './routes/messaging/message.route';
import { apiLimiter } from './middleware/rateLimiter.middleware';
import { inputSanitizer } from './middleware/sanitize.middleware';
import { auditLogger } from './middleware/auditLogger.middleware';
import { ipBlockCheck } from './middleware/ipBlock.middleware';
import securityRoutes from './routes/admin/security.route';
import dataExportRoutes from './routes/user/dataExport.route';

const app: Application = express();

// ========== SECURITY HEADERS (Helmet) ==========
// Sets various HTTP headers for security (X-Content-Type-Options, X-Frame-Options, etc.)
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "https://accounts.google.com", "https://www.google.com", "https://www.gstatic.com"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://accounts.google.com"],
            imgSrc: ["'self'", "data:", "blob:", "http://localhost:3000", "http://localhost:5000", "https://*.googleusercontent.com"],
            connectSrc: ["'self'", "http://localhost:3000", "https://accounts.google.com", "https://oauth2.googleapis.com", "https://www.google.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["https://accounts.google.com", "https://www.google.com"]
        }
    },
    crossOriginEmbedderPolicy: false, // Allow serving uploaded images
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow cross-origin image loading
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true }
}));

// Disable X-Powered-By header to prevent technology fingerprinting
app.disable('x-powered-by');

// ========== CORS CONFIGURATION ==========
app.use(
    cors({
        origin: function (origin, callback) {
            // Allow requests with no origin (mobile apps, curl, etc.)
            if (!origin) return callback(null, true);
            // Allow any localhost or local network origin on port 3000
            const allowed = /^http:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+):3000$/.test(origin);
            if (allowed) {
                return callback(null, true);
            }
            callback(new Error('Not allowed by CORS'));
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token']
    })
);

// ========== SESSION MANAGEMENT ==========
// Note: express-session may not be fully compatible with Express 5.
// We use it for session cookie management; JWT remains the primary auth mechanism.
try {
    app.use(session({
        secret: SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
            sameSite: 'strict' as const
        },
        name: 'inventorytrack.sid'
    }));
} catch (e) {
    console.warn('express-session setup skipped (Express 5 compatibility):', (e as Error).message);
}

// ========== BODY PARSING ==========
app.use(express.json({ limit: '10kb' })); // Limit body size to prevent DoS
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ========== HTTP PARAMETER POLLUTION PROTECTION ==========
// Note: In Express 5, req.query is a read-only getter. HPP protection is handled
// by validating query params at the route level using Zod schemas.
// The hpp() package is NOT compatible with Express 5.

// ========== INPUT SANITIZATION (XSS + NoSQL Injection) ==========
app.use(inputSanitizer);

// ========== IP-BASED BLOCKING ==========
// Check if the requesting IP is blocked before processing auth requests
// Blocks IPs with excessive failed authentication attempts
app.use('/api/auth', ipBlockCheck);

// ========== GLOBAL RATE LIMITING ==========
// SECURITY FIX: Re-enabled global rate limiting to prevent API abuse and DoS.
// Auth endpoints have stricter per-route limits (authLimiter, mfaLimiter).
app.use('/api', apiLimiter);

// ========== AUDIT LOGGING ==========
app.use(auditLogger);

// ========== ROUTES ==========
// Mount auth routes
app.use('/api/auth', authRoutes);

// Mount admin user routes
app.use('/api/admin/users', adminUserRoutes);

// Mount admin audit routes
app.use('/api/admin/audit', auditRoutes);

// Mount admin security monitoring routes
app.use('/api/admin/security', securityRoutes);

// Mount user data export/import routes (GDPR data portability)
app.use('/api/user/data', dataExportRoutes);

// Mount material routes
app.use('/api/materials', materialRoutes);

// Mount stock routes
app.use('/api/stock', stockRoutes);

// Mount bill of materials routes
app.use('/api/bill-of-materials', billRoutes);

// Mount recipe/ingredients routes
app.use('/api/recipes', recipeRoutes);

// Mount production routes
app.use('/api/production', productionRoutes);

// Mount supplier routes
app.use('/api/suppliers', supplierRoutes);

// Mount messaging routes
app.use('/api/messages', messageRoutes);

// serve uploads and public item photos (with cross-origin headers for frontend)
app.use('/uploads', (req, res, next) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    const origin = req.headers.origin;
    if (origin) res.setHeader('Access-Control-Allow-Origin', origin);
    next();
}, express.static(path.join(__dirname, '../uploads')));
app.use('/items/photos', express.static(path.join(__dirname, '../public/item_photos')));
app.use('/public/items_photos',
    express.static(path.join(__dirname, '../public/item_photos'))
);

app.get('/', (req: Request, res: Response) => {
    return res.status(200).json({
        success: true,
        message: "Welcome to InventoryTrack API",
        version: "1.0.0",
        security: {
            helmet: "enabled",
            rateLimiting: "enabled",
            inputSanitization: "enabled",
            auditLogging: "enabled",
            csrf: "enabled",
            mfa: "available",
            passwordPolicy: "enforced",
            encryption: "AES-256"
        },
        endpoints: {
            auth: "/api/auth",
            materials: "/api/materials",
            stock: "/api/stock",
            billOfMaterials: "/api/bill-of-materials",
            recipes: "/api/recipes",
            production: "/api/production",
            suppliers: "/api/suppliers",
            messages: "/api/messages",
            admin: "/api/admin/users",
            audit: "/api/admin/audit"
        }
    });
});

// 404 handler
app.use((req: Request, res: Response) => {
    res.status(404).json({ success: false, message: 'Not Found' });
});

// Global error handler - does not leak stack traces in production
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err);
    const statusCode = err.status || err.statusCode || 500;
    const message = process.env.NODE_ENV === 'production'
        ? 'Internal Server Error'
        : err.message || 'Internal Server Error';
    res.status(statusCode).json({ success: false, message });
});

export default app;
