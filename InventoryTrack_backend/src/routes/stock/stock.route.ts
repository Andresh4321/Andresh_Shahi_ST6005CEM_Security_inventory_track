import { Router } from "express";
import StockController from "../../controllers/stock/stock.controller";
import { authorizedMiddelWare } from "../../middleware/authorized.middleware";

const router = Router();
const stockController = new StockController();

router.use(authorizedMiddelWare);

router.post('/', stockController.createStockTransaction);
router.get('/current', stockController.getCurrentStock);
router.get('/', stockController.getAllStockTransactions);
router.get('/:id', stockController.getStockTransactionById);
router.put('/:id', stockController.updateStockTransactionById);
router.delete('/:id', stockController.deleteStockTransactionById);
export default router;
