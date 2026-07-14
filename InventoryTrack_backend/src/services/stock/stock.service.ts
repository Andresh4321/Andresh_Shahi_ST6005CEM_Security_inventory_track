import StockModel from "../../models/stock/stock.models";
import { StockRepository } from "../../routes/repositories/stock/stock.repository";
import { IStockTransaction } from "../../models/stock/stockTransaction.model";
import { HttpError } from "../../errors/http_error";

let stockRepository = new StockRepository();

export class StockService{
    async createStockTransaction(data: Partial<IStockTransaction>){
        try {
            // Create transaction
            const newStockTransaction = await stockRepository.createStockTransaction(data);
            
            // Update or create stock record
            const existingStock = await StockModel.findOne({ 
                material: data.material, 
                user: data.user 
            });
            
            if (existingStock) {
                if (data.transaction_type === 'in') {
                    existingStock.quantity += data.quantity || 0;
                } else if (data.transaction_type === 'out') {
                    existingStock.quantity -= data.quantity || 0;
                }
                await existingStock.save();
            } else {
                await StockModel.create({
                    material: data.material,
                    quantity: data.transaction_type === 'in' ? data.quantity : -(data.quantity || 0),
                    user: data.user,
                    description: data.description
                });
            }
            
            return newStockTransaction;
        } catch (error: any) {
            throw new HttpError(400, error.message || "Failed to create stock transaction");
        }
    }
    
    async getStockTransactionById(id: string, userId: string){
        const stockTransaction = await stockRepository.getStockTransactionByIdAndUser(id, userId);
        if(!stockTransaction){
            throw new Error("Stock transaction not found");
        }
        return stockTransaction;
    }
    
    async getAllStockTransactions(userId: string, page: number, limit: number){
        const { stockTransactions, total } = await stockRepository.getAllStockTransactionsByUser(userId, page, limit);
        return { stockTransactions, total };
    }
    
    async getCurrentStock(userId: string) {
        const currentStock = await StockModel.find({ user: userId })
            .populate('material')
            .sort({ created_at: -1 });
        return currentStock;
    }
    
    async updateStockTransactionById(id: string, userId: string, data: Partial<IStockTransaction>){
        const stockTransaction = await stockRepository.getStockTransactionByIdAndUser(id, userId);
        if(!stockTransaction){
            throw new Error("Stock transaction not found");
        }
        const updatedStockTransaction = await stockRepository.updateStockTransactionByIdAndUser(id, userId, data);
        return updatedStockTransaction;
    }
    
    async deleteStockTransactionById(id: string, userId: string){
        const deleted = await stockRepository.deleteStockTransactionByIdAndUser(id, userId);
        if(!deleted){
            throw new Error("Stock transaction not found");
        }
        return true;
    }
}
export default StockService;


