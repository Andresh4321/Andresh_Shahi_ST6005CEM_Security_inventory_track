
import BillRepository from "../../routes/repositories/BillofMaterials/bill.repositories";
import billOfMaterialsModel from "../../models/BillofMaterials/bill.model";
import StockModel from "../../models/stock/stock.models";
import { MaterialModel } from "../../models/material/material.models";
import { HttpError } from "../../errors/http_error";

let billRepository = new BillRepository();

export class BillService{
    async getAllBillItems(userId: string){
        // Fetch all materials for the user
        const materials = await MaterialModel.find({ user: userId });
        
        // Fetch stock quantities for the user
        const stocks = await StockModel.find({ user: userId });
        
        // Create a stock map for quick lookup
        const stockMap = new Map();
        stocks.forEach(stock => {
            stockMap.set(stock.material.toString(), stock.quantity);
        });
        
        // Build bill of materials with quantities and prices
        const billItems = materials.map((material: any) => {
            const quantity = stockMap.get(material._id.toString()) || 0;
            const totalWorth = quantity * material.unit_price;
            
            return {
                _id: material._id,
                material: {
                    _id: material._id,
                    name: material.name,
                    unit: material.unit,
                    unit_price: material.unit_price,
                    description: material.description
                },
                quantity,
                price: material.unit_price,
                totalWorth,
                user: userId
            };
        });
        
        // Calculate total inventory value
        const totalInventoryValue = billItems.reduce((sum: number, item: any) => sum + item.totalWorth, 0);
        
        return {
            items: billItems,
            totalInventoryValue,
            itemCount: billItems.length
        };
    }
    
    async createBillItem(data: any){
        const bill = await billOfMaterialsModel.create(data);
        return await bill.populate('material');
    }
    
    async changePrice(id: string, userId: string, price: number){
        const bill = await billOfMaterialsModel.findOne({ _id: id, user: userId });
        if (!bill) {
            throw new HttpError(404, 'Bill of Materials not found');
        }
        bill.price = price;
        await bill.save();
    }
    
    async deleteBillItem(id: string, userId: string){
        const result = await billOfMaterialsModel.findOneAndDelete({ _id: id, user: userId });
        if (!result) {
            throw new HttpError(404, 'Bill of Materials not found');
        }
    }
}
export default BillService;

