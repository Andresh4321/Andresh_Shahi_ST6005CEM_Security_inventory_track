import { Router } from "express";
import SupplierController from "../../controllers/supplier/supplier.controller";
import { authorizedMiddelWare } from "../../middleware/authorized.middleware";

const router = Router();
const supplierController = new SupplierController();

router.use(authorizedMiddelWare);

// Create supplier
router.post('/', supplierController.createSupplier);

// Get all suppliers with pagination
router.get('/', supplierController.getAllSuppliers);

// Get suppliers by product (must be before /:id to avoid matching)
router.get('/by-product/search', supplierController.getSuppliersByProduct);

// Get supplier by ID
router.get('/:id', supplierController.getSupplierById);

// Update supplier
router.put('/:id', supplierController.updateSupplierById);

// Delete supplier
router.delete('/:id', supplierController.deleteSupplierById);

export default router;