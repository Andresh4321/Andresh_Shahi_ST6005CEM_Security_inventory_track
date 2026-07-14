export { IStock } from "../../../models/stock/stock.models";
import stockTransactionModel from "../../../models/stock/stockTransaction.model";
import { IStockTransaction } from "../../../models/stock/stockTransaction.model";

export interface IStockRepository {
    createStockTransaction(data: Partial<IStockTransaction>): Promise<IStockTransaction>;
    getStockTransactionById(id: string): Promise<IStockTransaction | null>;
    getStockTransactionByIdAndUser(id: string, userId: string): Promise<IStockTransaction | null>;
    getAllStockTransactions(page: number, limit: number): Promise<{ stockTransactions: IStockTransaction[]; total: number }>;
    getAllStockTransactionsByUser(userId: string, page: number, limit: number): Promise<{ stockTransactions: IStockTransaction[]; total: number }>;
    updateStockTransactionById(id: string, data: Partial<IStockTransaction>): Promise<IStockTransaction | null>;
    updateStockTransactionByIdAndUser(id: string, userId: string, data: Partial<IStockTransaction>): Promise<IStockTransaction | null>;
    deleteStockTransactionById(id: string): Promise<boolean>;
    deleteStockTransactionByIdAndUser(id: string, userId: string): Promise<boolean>;
}

export class StockRepository implements IStockRepository {
    async createStockTransaction(data: Partial<IStockTransaction>) {
        const newStockTransaction = new stockTransactionModel(data);
        await newStockTransaction.save();
        return await newStockTransaction.populate('material');
    }
    
    async getStockTransactionById(id: string) {
        const stockTransaction = await stockTransactionModel.findById(id).populate('material');
        return stockTransaction;
    }
    
    async getStockTransactionByIdAndUser(id: string, userId: string) {
        const stockTransaction = await stockTransactionModel.findOne({ _id: id, user: userId }).populate('material');
        return stockTransaction;
    }
    
    async getAllStockTransactions(page: number, limit: number) {
        const skip = (page - 1) * limit;
        const stockTransactions = await stockTransactionModel.find()
            .populate('material')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });
        const total = await stockTransactionModel.countDocuments();
        return { stockTransactions, total };
    }
    
    async getAllStockTransactionsByUser(userId: string, page: number, limit: number) {
        const skip = (page - 1) * limit;
        const stockTransactions = await stockTransactionModel.find({ user: userId })
            .populate('material')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });
        const total = await stockTransactionModel.countDocuments({ user: userId });
        return { stockTransactions, total };
    }
    
    async updateStockTransactionById(id: string, data: Partial<IStockTransaction>) {
        const updatedStockTransaction = await stockTransactionModel.findByIdAndUpdate(
            id, data, { new: true }
        ).populate('material');
        return updatedStockTransaction;
    }
    
    async updateStockTransactionByIdAndUser(id: string, userId: string, data: Partial<IStockTransaction>) {
        const updatedStockTransaction = await stockTransactionModel.findOneAndUpdate(
            { _id: id, user: userId },
            data,
            { new: true }
        ).populate('material');
        return updatedStockTransaction;
    }
    
    async deleteStockTransactionById(id: string) {
        const result = await stockTransactionModel.findByIdAndDelete(id);
        return result ? true : false;
    }
    
    async deleteStockTransactionByIdAndUser(id: string, userId: string) {
        const result = await stockTransactionModel.findOneAndDelete({ _id: id, user: userId });
        return result ? true : false;
    }
}
export default StockRepository;

