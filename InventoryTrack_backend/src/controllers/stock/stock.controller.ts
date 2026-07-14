import { Request, Response } from "express";
import { StockService } from "../../services/stock/stock.service";


let stockService = new StockService();
export class StockController{
    async createStockTransaction(req: Request, res: Response){
        try{
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const newStockTransaction = await stockService.createStockTransaction({...req.body, user: userId});
            return res.status(201).json(
                { success: true, data: newStockTransaction, message: "Stock transaction created successfully" }
            )
        }catch(error: Error | any){
            return res.status(error.statusCode || 500).json(
                { success: false, message: error.message || "Internal Server Error" }
            )
        }
    }
    async getStockTransactionById(req: Request, res: Response){
        try{
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const stockTransaction = await stockService.getStockTransactionById(req.params.id, userId);

            return res.status(200).json(
                { success: true, data: stockTransaction, message: "Stock transaction retrieved successfully" }
            )

        }
        catch(error: Error | any){
            return res.status(error.statusCode || 500).json(
                { success: false, message: error.message || "Internal Server Error" }
            )
        }
    }
    async getAllStockTransactions(req: Request, res: Response){
        try{
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const { stockTransactions, total } = await stockService.getAllStockTransactions(userId, page, limit);
            return res.status(200).json(
                { success: true, data: stockTransactions, total, page, totalPages: Math.ceil(total / limit), message: "Stock transactions retrieved successfully" }
            )
        
        }
        catch(error: Error | any){
            return res.status(error.statusCode || 500).json(
                { success: false, message: error.message || "Internal Server Error" }
            )
        }
    }
    async getCurrentStock(req: Request, res: Response){
        try{
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const currentStock = await stockService.getCurrentStock(userId);
            return res.status(200).json(
                { success: true, data: currentStock, message: "Current stock retrieved successfully" }
            )
        }
        catch(error: Error | any){
            return res.status(error.statusCode || 500).json(
                { success: false, message: error.message || "Internal Server Error" }
            )
        }
    }
    async updateStockTransactionById(req: Request, res: Response){
        try{
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const updatedStockTransaction = await stockService.updateStockTransactionById(req.params.id, userId, req.body);
            return res.status(200).json(
                { success: true, data: updatedStockTransaction, message: "Stock transaction updated successfully" }
            )
        }
        catch(error: Error | any){
            return res.status(error.statusCode || 500).json(
                { success: false, message: error.message || "Internal Server Error" }
            )
        }
    }
    async deleteStockTransactionById(req: Request, res: Response){
        try{
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            await stockService.deleteStockTransactionById(req.params.id, userId);
            return res.status(200).json(
                { success: true, message: "Stock transaction deleted successfully" }
            )
        }
        catch(error: Error | any){
            return res.status(error.statusCode || 500).json(
                { success: false, message: error.message || "Internal Server Error" }
            )
        }
    }
}

export default StockController;

