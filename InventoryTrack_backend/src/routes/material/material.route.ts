import { Router } from "express";
import MaterialController from "../../controllers/material/material.controller";
import { authorizedMiddelWare } from "../../middleware/authorized.middleware";

const router = Router();
const materialController = new MaterialController();

router.use(authorizedMiddelWare);

router.post('/', materialController.createMaterial);
router.get('/', materialController.getAllMaterials);
router.get('/:id', materialController.getMaterialById);
router.put('/:id', materialController.updateMaterialById);
router.delete('/:id', materialController.deleteMaterialById);
export default router;