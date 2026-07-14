import { Request, Response } from "express";
import { SupplierService } from "../../services/supplier/supplier.service";

let supplierService = new SupplierService();

export class SupplierController{
    async createSupplier(req: Request, res: Response){
        try{
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const newSupplier = await supplierService.createSupplier({...req.body, user: userId});
            return res.status(201).json(
                { success: true, data: newSupplier, message: "Supplier created successfully" }
            )
        }catch(error: Error | any){
            return res.status(error.statusCode || 500).json(
                { success: false, message: error.message || "Internal Server Error" }
            )
        }
    }
    async getSupplierById(req: Request, res: Response){
        try{
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const supplier = await supplierService.getSupplierById(req.params.id, userId);
            return res.status(200).json(
                { success: true, data: supplier, message: "Supplier retrieved successfully" }
            )
        }
        catch(error: Error | any){
            return res.status(error.statusCode || 500).json(
                { success: false, message: error.message || "Internal Server Error" }
            )
        }
    }
    async getAllSuppliers(req: Request, res: Response){
        try{
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const { suppliers, total } = await supplierService.getAllSuppliers(userId, page, limit);
            return res.status(200).json(
                { success: true, data: suppliers, total, page, totalPages: Math.ceil(total / limit), message: "Suppliers retrieved successfully" }
            )
        }       
        catch(error: Error | any){
            return res.status(error.statusCode || 500).json(
                { success: false, message: error.message || "Internal Server Error" }
            )
        }
    }
    async updateSupplierById(req: Request, res: Response){
        try{
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const updatedSupplier = await supplierService.updateSupplierById(req.params.id, userId, req.body);
            return res.status(200).json(
                { success: true, data: updatedSupplier, message: "Supplier updated successfully" }
            )
        }
        catch(error: Error | any){
            return res.status(error.statusCode || 500).json(
                { success: false, message: error.message || "Internal Server Error" }
            )
        }
    }
    async deleteSupplierById(req: Request, res: Response){
        try{
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            await supplierService.deleteSupplierById(req.params.id, userId);
            return res.status(200).json(
                { success: true, message: "Supplier deleted successfully" }
            )
        }
        catch(error: Error | any){
            return res.status(error.statusCode || 500).json(
                { success: false, message: error.message || "Internal Server Error" }
            )
        }
    }
    async getSuppliersByProduct(req: Request, res: Response){
        try{
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const product = req.query.product as string;
            if (!product) {
                return res.status(400).json({ success: false, message: "Product parameter is required" });
            }
            const suppliers = await supplierService.getSuppliersByProduct(product, userId);
            return res.status(200).json(
                { success: true, data: suppliers, message: "Suppliers retrieved successfully" }
            )
        }
        catch(error: Error | any){
            return res.status(error.statusCode || 500).json(
                { success: false, message: error.message || "Internal Server Error" }
            )
        }
    }
}
export default SupplierController;



