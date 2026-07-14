import { Router } from "express";
import {
  authorizedMiddelWare,
  adminMiddelware
} from "../../middleware/authorized.middleware";
import { AdminUserController } from "../../controllers/admin/user.controller";
import { uploads } from "../../middleware/upload.middleware";

const router = Router();
let adminUserController = new AdminUserController();

router.use(authorizedMiddelWare);
router.use(adminMiddelware);

//
// ✅ CREATE (image allowed)
//
router.post("/", uploads.single("image"), adminUserController.createUser);

//
// ✅ READ
//
router.get("/", adminUserController.getAllUsers);
router.get("/:id", adminUserController.getUserById);

//
// ✅ UPDATE TEXT ONLY (JSON)
//
router.put("/:id", adminUserController.updateUser);

//
// ✅ UPDATE IMAGE ONLY (file)
//
router.put("/:id/image", uploads.single("image"), adminUserController.updateUserImage);

//
// ✅ DELETE
//
router.delete("/:id", adminUserController.deleteUser);

export default router;
