import { Request, Response } from "express";

import BillService from "../../services/billofmaterials/bill.service";

let billService = new BillService();

export class BillController{
    async getAllBillItems(req: Request, res: Response){
        try{
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const bills = await billService.getAllBillItems(userId);
            return res.status(200).json(
                { success: true, data: bills }
            )
        }
        catch(error: Error | any){
            return res.status(error.statusCode || 500).json(
                { success: false, message: error.message || "Internal Server Error" }
            )
        }
    }
    
    async createBillItem(req: Request, res: Response){
        try{
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const bill = await billService.createBillItem({...req.body, user: userId});
            return res.status(201).json(
                { success: true, data: bill, message: "Bill item created successfully" }
            )
        }
        catch(error: Error | any){
            return res.status(error.statusCode || 500).json(
                { success: false, message: error.message || "Internal Server Error" }
            )
        }
    }
    
    async changePrice(req: Request, res: Response){
        try{
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const { id } = req.params;
            const { price } = req.body;
            await billService.changePrice(id, userId, price);
            return res.status(200).json(
                { success: true, message: "Price updated successfully" }
            )
        }
        catch(error: Error | any){
            return res.status(error.statusCode || 500).json(
                { success: false, message: error.message || "Internal Server Error" }
            )
        }
    }
    
    async deleteBillItem(req: Request, res: Response){
        try{
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const { id } = req.params;
            await billService.deleteBillItem(id, userId);
            return res.status(200).json(
                { success: true, message: "Bill item deleted successfully" }
            )
        }
        catch(error: Error | any){
            return res.status(error.statusCode || 500).json(
                { success: false, message: error.message || "Internal Server Error" }
            )
        }
    }
}
export default BillController;

