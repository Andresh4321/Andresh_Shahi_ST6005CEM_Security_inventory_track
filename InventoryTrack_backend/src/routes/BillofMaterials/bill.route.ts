import { Router } from "express";
import BillController from "../../controllers/BillofMaterials/Bill.controller";
import { authorizedMiddelWare } from "../../middleware/authorized.middleware";

const router = Router();
const billController = new BillController();

router.use(authorizedMiddelWare);

router.get("/", billController.getAllBillItems);
router.post("/", billController.createBillItem);
router.put("/:id/price", billController.changePrice);
router.delete("/:id", billController.deleteBillItem);

export default router;
