import { Request, Response } from "express";
import { MaterialService } from "../../services/material/material.service";

let materialService = new MaterialService();

export class materialController{
    async createMaterial(req: Request, res: Response){
        try{
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const newMaterial = await materialService.createMaterial({...req.body, user: userId});
            return res.status(201).json(
                { success: true, data: newMaterial, message: "Material created successfully" }
            )
        }catch(error: Error | any){
            return res.status(error.statusCode || 500).json(
                { success: false, message: error.message || "Internal Server Error" }
            )
        }
    }
    async getMaterialById(req: Request, res: Response){
        try{
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const material = await materialService.getMaterialById(req.params.id, userId);

            return res.status(200).json(
                { success: true, data: material, message: "Material retrieved successfully" }
            )
        }
        catch(error: Error | any){
            return res.status(error.statusCode || 500).json(
                { success: false, message: error.message || "Internal Server Error" }
            )
        }
    }
    async getAllMaterials(req: Request, res: Response){
        try{
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const { materials, total } = await materialService.getAllMaterials(userId, page, limit);
            return res.status(200).json(
                { success: true, data: materials, total, page, totalPages: Math.ceil(total / limit), message: "Materials retrieved successfully" }
            )
        }
        catch(error: Error | any){
            return res.status(error.statusCode || 500).json(
                { success: false, message: error.message || "Internal Server Error" }
            )
        }
    }
    async updateMaterialById(req: Request, res: Response){
        try{
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const updatedMaterial = await materialService.updateMaterialById(req.params.id, userId, req.body);
            return res.status(200).json(
                { success: true, data: updatedMaterial, message: "Material updated successfully" }
            )
        }
        catch(error: Error | any){
            return res.status(error.statusCode || 500).json(
                { success: false, message: error.message || "Internal Server Error" }
            )
        }
    }
    async deleteMaterialById(req: Request, res: Response){
        try{
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            await materialService.deleteMaterialById(req.params.id, userId);
            return res.status(200).json(
                { success: true, message: "Material deleted successfully" }
            )
        }
        catch(error: Error | any){
            return res.status(error.statusCode || 500).json(

                { success: false, message: error.message || "Internal Server Error" }
            )
        }
    }
}
export default materialController;


