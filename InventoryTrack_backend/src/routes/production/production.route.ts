import { Router } from "express";
import productionController from "../../controllers/production/production.controller";
import { authorizedMiddelWare } from "../../middleware/authorized.middleware";

const router = Router();

router.use(authorizedMiddelWare);

router.post("/", productionController.create);
router.get("/", productionController.getAll);
router.get("/:id", productionController.getById);
router.put("/:id/complete", productionController.complete);
router.delete("/:id", productionController.delete);
export default router;