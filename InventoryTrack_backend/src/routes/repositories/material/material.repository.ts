import { IMaterial } from "../../../models/material/material.models";
import { MaterialModel } from "../../../models/material/material.models";

export interface IMaterialRepository {
    createMaterial(data: Partial<IMaterial>): Promise<IMaterial>;
    getMaterialById(id: string): Promise<IMaterial | null>;
    getMaterialByIdAndUser(id: string, userId: string): Promise<IMaterial | null>;
    getAllMaterials(page: number, limit: number): Promise<{ materials: IMaterial[]; total: number }>;
    getAllMaterialsByUser(userId: string, page: number, limit: number): Promise<{ materials: IMaterial[]; total: number }>;
    updateMaterialById(id: string, data: Partial<IMaterial>): Promise<IMaterial | null>;
    updateMaterialByIdAndUser(id: string, userId: string, data: Partial<IMaterial>): Promise<IMaterial | null>;
    deleteMaterialById(id: string): Promise<boolean>;
    deleteMaterialByIdAndUser(id: string, userId: string): Promise<boolean>;
}

export class MaterialRepository implements IMaterialRepository {
    async createMaterial(data: Partial<IMaterial>) {
        const newMaterial = new MaterialModel(data);
        await newMaterial.save();
        return newMaterial;
    }
    
    async getMaterialById(id: string) {
        const material = await MaterialModel.findById(id);
        return material;
    }
    
    async getMaterialByIdAndUser(id: string, userId: string) {
        const material = await MaterialModel.findOne({ _id: id, user: userId });
        return material;
    }
    
    async getAllMaterials(page: number, limit: number) {
        const skip = (page - 1) * limit;
        const materials = await MaterialModel.find()
            .skip(skip)
            .limit(limit)
            .sort({ created_at: -1 });
        const total = await MaterialModel.countDocuments();
        return { materials, total };
    }
    
    async getAllMaterialsByUser(userId: string, page: number, limit: number) {
        const skip = (page - 1) * limit;
        const materials = await MaterialModel.find({ user: userId })
            .skip(skip)
            .limit(limit)
            .sort({ created_at: -1 });
        const total = await MaterialModel.countDocuments({ user: userId });
        return { materials, total };
    }
    
    async updateMaterialById(id: string, data: Partial<IMaterial>) {
        const updatedMaterial = await MaterialModel.findByIdAndUpdate(
            id, data, { new: true }
        );
        return updatedMaterial;
    }
    
    async updateMaterialByIdAndUser(id: string, userId: string, data: Partial<IMaterial>) {
        const updatedMaterial = await MaterialModel.findOneAndUpdate(
            { _id: id, user: userId },
            data,
            { new: true }
        );
        return updatedMaterial;
    }
    
    async deleteMaterialById(id: string) {
        const result = await MaterialModel.findByIdAndDelete(id);
        return result ? true : false;
    }
    
    async deleteMaterialByIdAndUser(id: string, userId: string) {
        const result = await MaterialModel.findOneAndDelete({ _id: id, user: userId });
        return result ? true : false;
    }
}

export default MaterialRepository;
