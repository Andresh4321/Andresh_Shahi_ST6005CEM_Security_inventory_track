import { Router } from "express";
import { AuthController } from "../../controllers/user/auth.controller";
import { authorizedMiddelWare } from "../../middleware/authorized.middleware";
import {uploads} from "../../middleware/upload.middleware";

const router: Router = Router();
const authController = new AuthController();

router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);

// new admin login endpoint (requires email, password, role: 'admin')
router.post('/admin/login', authController.loginAdmin);

// fixed: return whoAmI
router.get('/whoami', authorizedMiddelWare, authController.whoAmI);

// Update own profile (only the logged in user can update their own profile)
router.put('/:id', authorizedMiddelWare, uploads.single('userImage'), authController.updateProfile);

router.post(
  '/upload-photo',
  authorizedMiddelWare,
  uploads.single('userImage'),
  authController.uploadProfilePhoto
);

router.post("/forgot-password", authController.forgotPassword.bind(authController));
router.post("/reset-password/:token", authController.resetPassword.bind(authController));

export default router;
