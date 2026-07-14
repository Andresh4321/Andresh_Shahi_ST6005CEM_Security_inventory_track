

import { ISupplierRepository } from "../../routes/repositories/supplier/supplier.respository";
import { ISupplier } from "../../models/supplier/supplier.models";
import SupplierRepository from "../../routes/repositories/supplier/supplier.respository";

let supplierRepository = new SupplierRepository();
export class SupplierService{
    async createSupplier(data: Partial<ISupplier> & { user: any }){
        // Check if email exists for this user
        const emailExists = await supplierRepository.getSupplierByEmailAndUser(data.email!, data.user);
        if(emailExists){
            throw new Error("Email already exists for your account");
        }
        const newSupplier = await supplierRepository.createSupplier(data);
        return newSupplier;
    }
    async getSupplierById(id: string, userId: string){
        const supplier = await supplierRepository.getSupplierByIdAndUser(id, userId);
        if(!supplier){
            throw new Error("Supplier not found");
        }
        return supplier;
    }
    async updateSupplierById(id: string, userId: string, data: Partial<ISupplier>){
        const supplier = await supplierRepository.getSupplierByIdAndUser(id, userId);
        if(!supplier){
            throw new Error("Supplier not found");
        }
        if(data.email && supplier.email !== data.email){
            const emailExists = await supplierRepository.getSupplierByEmailAndUser(data.email, userId);
            if(emailExists){
                throw new Error("Email already exists for your account");
            }
        }
        const updatedSupplier = await supplierRepository.updateSupplierByIdAndUser(id, userId, data);
        return updatedSupplier;
    }
    async deleteSupplierById(id: string, userId: string){
        const deleted = await supplierRepository.deleteSupplierbyIdAndUser(id, userId);
        if(!deleted){
            throw new Error("Supplier not found");
        }
        return true;
    }
    async getAllSuppliers(userId: string, page: number, limit: number){
        const { suppliers, total } = await supplierRepository.getAllSuppliersByUser(userId, page, limit);
        return { suppliers, total };
    }
    async getSuppliersByProduct(product: string, userId: string){
        const suppliers = await supplierRepository.getSupplierByProductAndUser(product, userId);
        return suppliers || [];
    }
}

