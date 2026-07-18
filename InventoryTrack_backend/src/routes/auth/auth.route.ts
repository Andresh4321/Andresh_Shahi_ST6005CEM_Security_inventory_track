import { Router } from "express";
import { AuthController } from "../../controllers/user/auth.controller";
import { authorizedMiddelWare } from "../../middleware/authorized.middleware";
import { uploads } from "../../middleware/upload.middleware";
import { authLimiter, passwordResetLimiter } from "../../middleware/rateLimiter.middleware";
import { generateCsrfToken } from "../../middleware/csrf.middleware";
import { verifyCaptcha } from "../../middleware/captcha.middleware";

const router: Router = Router();
const authController = new AuthController();

// Public auth endpoints with rate limiting
// CAPTCHA on register only — login intentionally left without CAPTCHA
router.post('/register', authLimiter, verifyCaptcha, authController.registerUser);
router.post('/login', authLimiter, authController.loginUser);

// Admin login endpoint (requires email, password, role: 'admin')
router.post('/admin/login', authLimiter, authController.loginAdmin);

// MFA verification for login (rate limited)
router.post('/mfa/verify-login', authLimiter, authController.verifyMfaLogin);

// Google OAuth login (rate limited to prevent abuse)
router.post('/google', authLimiter, authController.googleLogin);

// Password reset with strict rate limiting
router.post("/forgot-password", passwordResetLimiter, authController.forgotPassword.bind(authController));
router.post("/reset-password/:token", passwordResetLimiter, authController.resetPassword.bind(authController));

// Protected endpoints (require auth)
router.get('/whoami', authorizedMiddelWare, authController.whoAmI);

// CSRF token endpoint
router.get('/csrf-token', authorizedMiddelWare, generateCsrfToken);

// Password change (with history check)
router.post('/change-password', authorizedMiddelWare, authController.changePassword);

// MFA Setup endpoints (protected)
router.post('/mfa/setup', authorizedMiddelWare, authController.setupMfa);
router.post('/mfa/verify-setup', authorizedMiddelWare, authController.verifyMfaSetup);
router.post('/mfa/disable', authorizedMiddelWare, authController.disableMfa);

// Email verification endpoints
router.post('/email/send-otp', authorizedMiddelWare, authController.sendEmailOTP);
router.post('/email/verify-otp', authorizedMiddelWare, authController.verifyEmailOTP);

// Profile update (supports both JSON and multipart/form-data with optional image)
router.put('/:id', authorizedMiddelWare, (req, res, next) => {
    // Only use multer if Content-Type is multipart/form-data
    const contentType = req.headers['content-type'] || '';
    if (contentType.includes('multipart/form-data')) {
        return uploads.single('userImage')(req, res, next);
    }
    next();
}, authController.updateProfile);

router.post(
    '/upload-photo',
    authorizedMiddelWare,
    uploads.single('userImage'),
    authController.uploadProfilePhoto
);

export default router;
